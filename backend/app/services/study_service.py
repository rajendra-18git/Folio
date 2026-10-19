import json
import re
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.models.db_models import Document, DocumentChunk, StudyGeneration
from app.services.vector_store import vector_store
from app.services.ai_provider import ai_provider
from app.schemas.api_schemas import (
    StudyContent, FlashcardItem, MCQItem, ExamAnswerItem,
    PracticeTestItem, Citation
)

class StudyService:
    @staticmethod
    def generate_study_material(
        db: Session,
        document_id: str,
        study_type: str,
        topic: Optional[str] = None
    ) -> StudyGeneration:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            raise ValueError("Document not found.")

        # Retrieve relevant passages for the document
        query = topic if topic and topic.strip() else "key concepts, definitions, principles, and important topics"
        retrieved_chunks = vector_store.search(query=query, document_ids=[document_id], top_k=7)

        # Fallback to database chunks if vector store has no match
        if not retrieved_chunks:
            db_chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).limit(5).all()
            retrieved_chunks = [
                {
                    "content": c.content,
                    "page_number": c.page_number,
                    "chunk_index": c.chunk_index,
                    "document_id": document_id,
                    "score": 0.8
                }
                for c in db_chunks
            ]

        citations = [
            Citation(
                document_id=document_id,
                document_name=doc.original_filename,
                page_number=c["page_number"],
                chunk_index=c.get("chunk_index"),
                excerpt=c["content"][:200].strip() + "...",
                score=c.get("score", 0.0)
            )
            for c in retrieved_chunks
        ]

        context_text = "\n\n".join([
            f"[Page {c['page_number']}]: {c['content']}"
            for c in retrieved_chunks
        ])

        # If Gemini is configured, generate structured JSON with Gemini
        is_configured = ai_provider.is_configured()
        study_data: StudyContent

        if is_configured:
            study_data = StudyService._generate_with_gemini(
                study_type=study_type,
                topic=topic,
                doc_name=doc.original_filename,
                context_text=context_text,
                citations=citations
            )
        else:
            # Deterministic, grounded local generation
            study_data = StudyService._generate_local_fallback(
                study_type=study_type,
                topic=topic,
                doc_name=doc.original_filename,
                chunks=retrieved_chunks,
                citations=citations
            )

        # Save to database
        generation = StudyGeneration(
            document_id=document_id,
            study_type=study_type,
            topic=topic or "General",
            generated_content=study_data.model_dump_json()
        )
        db.add(generation)
        db.commit()
        db.refresh(generation)
        return generation

    @staticmethod
    def _generate_with_gemini(
        study_type: str,
        topic: Optional[str],
        doc_name: str,
        context_text: str,
        citations: List[Citation]
    ) -> StudyContent:
        system_prompt = (
            "You are an expert educational curriculum and examination designer.\n"
            "Analyze the provided document context and generate strictly verified, grounded study material.\n"
            "CRITICAL FORMATTING INSTRUCTION:\n"
            "1. Bold all headings, section headers, and questions (e.g. ### **Section Title** or **Section:**).\n"
            "2. Bold all definitions, key terms, core principles, and concepts (e.g. **Definition:** ..., **Key Concept (Term):** ...).\n"
            "3. Ensure key terminology and defined terms stand out clearly in bold.\n"
            "Return valid JSON matching the requested schema. Do NOT include markdown code blocks ```json, output ONLY pure JSON."
        )

        user_prompt = f"""
DOCUMENT: {doc_name}
TOPIC: {topic or 'Comprehensive overview'}
CONTEXT:
{context_text}

STUDY TYPE REQUESTED: {study_type}

FORMATTING REQUIREMENT: Always bold headings (### **Heading**) and bold definitions / defined terms (**Definition:** ... or **Term:** ...) throughout the generated content.

Return JSON with format based on study type:
- If summary: {{"summary_markdown": "### **Executive Summary**\\n\\n**Core Overview:** ...\\n\\n**Key Definitions:** ...", "key_takeaways": ["**Point:** ...", "**Definition:** ..."]}}
- If two_mark: {{"exam_answers": [{{"question": "...", "marks": 2, "key_points": ["**Point 1**", "**Point 2**"], "detailed_answer": "**Definition:** ...", "page_references": [1]}}]}}
- If five_mark: {{"exam_answers": [{{"question": "...", "marks": 5, "key_points": ["**Point 1**", "**Point 2**"], "detailed_answer": "### **Overview**\\n\\n**Definition & Mechanics:** ...", "page_references": [1]}}]}}
- If ten_mark: {{"exam_answers": [{{"question": "...", "marks": 10, "key_points": ["**Point 1**", "**Point 2**"], "detailed_answer": "### **Introduction**\\n\\n**Core Definition:** ...\\n\\n### **Detailed Analysis**\\n\\n**Key Principles:** ...", "page_references": [1]}}]}}
- If flashcards: {{"flashcards": [{{"question": "...", "answer": "**Core Definition:** ...", "difficulty": "Medium", "page_number": 1}}]}}
- If mcqs: {{"mcqs": [{{"question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correct_option": "A", "explanation": "**Key Concept & Evidence:** ...", "page_number": 1}}]}}
- If practice_test: {{"practice_test": {{"title": "**Diagnostic Practice Test**", "duration_minutes": 45, "total_marks": 50, "sections": [{{"section_name": "**Part A: Fundamental Concepts**", "questions": ["..."]}}]}}}}
"""

        raw_text, metrics = ai_provider.generate_text(prompt=user_prompt, system_instruction=system_prompt)
        
        # Clean potential ```json wrapping
        clean_json = raw_text.strip()
        if clean_json.startswith("```"):
            clean_json = re.sub(r"^```(?:json)?\s*", "", clean_json)
            clean_json = re.sub(r"\s*```$", "", clean_json)

        try:
            parsed = json.loads(clean_json)
            return StudyContent(
                study_type=study_type,
                topic=topic,
                document_name=doc_name,
                summary_markdown=parsed.get("summary_markdown"),
                key_takeaways=parsed.get("key_takeaways"),
                exam_answers=[ExamAnswerItem(**item) for item in parsed.get("exam_answers", [])],
                flashcards=[FlashcardItem(**item) for item in parsed.get("flashcards", [])],
                mcqs=[MCQItem(**item) for item in parsed.get("mcqs", [])],
                practice_test=PracticeTestItem(**parsed["practice_test"]) if "practice_test" in parsed else None,
                citations=citations,
                is_demo_mode=False,
                tokens_used=metrics.get("tokens_used", 0),
                latency_ms=metrics.get("latency_ms", 0.0)
            )
        except Exception:
            # Fallback to local structured generator if parsing fails
            return StudyService._generate_local_fallback(study_type, topic, doc_name, [], citations)

    @staticmethod
    def _generate_local_fallback(
        study_type: str,
        topic: Optional[str],
        doc_name: str,
        chunks: List[Dict[str, Any]],
        citations: List[Citation]
    ) -> StudyContent:
        """Grounded extractive generation when Gemini is not configured."""
        first_chunk = chunks[0]["content"] if chunks else "No text extracted."
        first_page = chunks[0]["page_number"] if chunks else 1

        summary_md = (
            f"### **Executive Summary: {doc_name}**\n\n"
            f"*(Grounded in {len(chunks)} verified document excerpts)*\n\n"
            f"**Core Definition & Overview:**\n"
            f"{first_chunk[:400]}...\n\n"
            f"> 💡 *Tip: Connect an AI API key in Settings for multi-tier exam reasoning and expanded synthesis.*"
        )
        takeaways = [
            f"**Key Concept (Page {c.get('page_number', 1)}):** {c.get('content', '')[:120]}..."
            for c in chunks[:4]
        ] if chunks else ["**Review Needed:** Review the uploaded document content."]

        exam_answers = []
        if study_type in ["two_mark", "five_mark", "ten_mark"]:
            marks = 2 if study_type == "two_mark" else (5 if study_type == "five_mark" else 10)
            for i, c in enumerate(chunks[:3]):
                sample_p = c["content"][:200]
                exam_answers.append(ExamAnswerItem(
                    question=f"Explain key principle #{i+1} discussed regarding {topic or 'the document content'}?",
                    marks=marks,
                    key_points=[f"**Reference:** Page {c['page_number']}", "**Definition:** Core principle", "**Application:** Practical context"],
                    detailed_answer=f"**Definition & Evidence (Page {c['page_number']} of {doc_name}):**\n\n{c['content'][:500]}",
                    page_references=[c['page_number']]
                ))

        flashcards = [
            FlashcardItem(
                question=f"What is the key insight on page {c.get('page_number', 1)}?",
                answer=f"**Core Definition:** {c.get('content', '')[:180]}...",
                difficulty="Medium",
                page_number=c.get("page_number", 1)
            )
            for c in chunks[:5]
        ]

        mcqs = [
            MCQItem(
                question=f"According to {doc_name} (Page {c.get('page_number', 1)}), which of the following is emphasized?",
                options=[
                    f"A) {c.get('content', '')[:60]}",
                    "B) An alternative unrelated hypothesis",
                    "C) None of the mentioned factors",
                    "D) Preliminary unverified claims"
                ],
                correct_option="A",
                explanation=f"**Definition & Evidence (Page {c.get('page_number', 1)}):** '{c.get('content', '')[:120]}...'",
                page_number=c.get("page_number", 1)
            )
            for c in chunks[:3]
        ]

        practice_test = PracticeTestItem(
            title=f"**Diagnostic Practice Test: {doc_name}**",
            duration_minutes=30,
            total_marks=25,
            sections=[
                {"section_name": "**Part A: Objective Questions**", "questions": [m.question for m in mcqs]},
                {"section_name": "**Part B: Short Definition & Applied Questions**", "questions": [f"Define key principles from Page {c.get('page_number', 1)}" for c in chunks[:2]]}
            ]
        )

        return StudyContent(
            study_type=study_type,
            topic=topic,
            document_name=doc_name,
            summary_markdown=summary_md,
            key_takeaways=takeaways,
            exam_answers=exam_answers,
            flashcards=flashcards,
            mcqs=mcqs,
            practice_test=practice_test,
            citations=citations,
            is_demo_mode=True,
            tokens_used=max(1, int((len(first_chunk) + len(summary_md)) / 4)),
            latency_ms=15.0
        )

study_service = StudyService()

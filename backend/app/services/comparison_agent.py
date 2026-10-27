import json
import re
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.db_models import Document, DocumentComparison
from app.services.vector_store import vector_store
from app.services.ai_provider import ai_provider
from app.schemas.api_schemas import (
    ComparisonReport, ComparisonClaim, Citation
)

class ComparisonAgent:
    @staticmethod
    def compare_documents(
        db: Session,
        document_ids: List[str],
        topic_focus: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> DocumentComparison:
        """
        Bounded multi-step comparison workflow:
        Step 1: Validate documents and retrieve passages per document.
        Step 2: Synthesize per-document core arguments and evidence.
        Step 3: Build comparative claims matrix (similarities, contrasts, contradictions).
        Step 4: Identify evidence gaps.
        Step 5: Formulate final structured report with citations.
        """
        if len(document_ids) < 2:
            raise ValueError("Comparison requires at least 2 documents.")

        docs = db.query(Document).filter(Document.id.in_(document_ids)).all()
        if len(docs) < 2:
            raise ValueError("At least 2 valid documents must be found.")

        query = topic_focus if topic_focus and topic_focus.strip() else "methodology, findings, core conclusions, claims, and limitations"
        
        # Step 1: Bounded retrieval per document (up to 4 chunks per doc to prevent prompt bloat)
        all_citations: List[Citation] = []
        doc_passages: Dict[str, List[Dict[str, Any]]] = {}

        for doc in docs:
            chunks = vector_store.search(query=query, document_ids=[doc.id], top_k=4)
            doc_passages[doc.id] = chunks
            for c in chunks:
                all_citations.append(Citation(
                    document_id=doc.id,
                    document_name=doc.original_filename,
                    page_number=c["page_number"],
                    chunk_index=c.get("chunk_index"),
                    excerpt=c["content"][:200] + "...",
                    score=c.get("score")
                ))

        # Check if Gemini is configured for this user
        effective_user_id = user_id or (docs[0].user_id if docs else None)
        user_key, user_model = ai_provider.get_user_ai_credentials(db, effective_user_id)
        is_configured = ai_provider.is_configured(api_key=user_key)

        if is_configured:
            report = ComparisonAgent._gemini_bounded_agent(
                docs, doc_passages, topic_focus, all_citations,
                api_key=user_key, model_name=user_model
            )
        else:
            report = ComparisonAgent._local_bounded_comparison(docs, doc_passages, topic_focus, all_citations)

        comparison_record = DocumentComparison(
            document_ids=json.dumps(document_ids),
            document_titles=json.dumps([d.original_filename for d in docs]),
            topic_focus=topic_focus or "General Comparison",
            report_content=report.model_dump_json()
        )
        db.add(comparison_record)
        db.commit()
        db.refresh(comparison_record)
        return comparison_record

    @staticmethod
    def _gemini_bounded_agent(
        docs: List[Document],
        doc_passages: Dict[str, List[Dict[str, Any]]],
        topic_focus: Optional[str],
        citations: List[Citation],
        api_key: Optional[str] = None,
        model_name: Optional[str] = None
    ) -> ComparisonReport:
        context_sections = []
        for doc in docs:
            passages = doc_passages.get(doc.id, [])
            text_blocks = "\n".join([f"- [Page {p['page_number']}]: {p['content']}" for p in passages])
            context_sections.append(f"### DOCUMENT: {doc.original_filename} (ID: {doc.id})\n{text_blocks}")

        joined_context = "\n\n".join(context_sections)

        system_prompt = (
            "You are a Senior Comparative Research Analyst. "
            "You compare documents objectively with rigorous citations. "
            "Return valid JSON only. Do not add markdown codeblock fences."
        )

        user_prompt = f"""
COMPARE THE FOLLOWING DOCUMENTS:
Focus Topic: {topic_focus or 'Comprehensive comparative evaluation'}

DOCUMENT EVIDENCE:
{joined_context}

Return a JSON object with this exact structure:
{{
  "executive_summary": "...",
  "key_similarities": ["...", "..."],
  "key_differences": ["...", "..."],
  "claims_matrix": [
    {{
      "topic": "...",
      "document_a_view": "...",
      "document_b_view": "...",
      "status": "Agreement" // or Contrast, Contradiction, Unique
    }}
  ],
  "contradictions": ["..."],
  "evidence_gaps": ["..."],
  "synthesis_conclusion": "..."
}}
"""
        raw_text, metrics = ai_provider.generate_text(
            prompt=user_prompt,
            system_instruction=system_prompt,
            model_name=model_name,
            api_key=api_key
        )
        clean_json = raw_text.strip()
        if clean_json.startswith("```"):
            clean_json = re.sub(r"^```(?:json)?\s*", "", clean_json)
            clean_json = re.sub(r"\s*```$", "", clean_json)

        try:
            parsed = json.loads(clean_json)
            matrix = [ComparisonClaim(**item) for item in parsed.get("claims_matrix", [])]
            return ComparisonReport(
                documents=[{"id": d.id, "title": d.original_filename} for d in docs],
                executive_summary=parsed.get("executive_summary", "Comparative analysis summary."),
                key_similarities=parsed.get("key_similarities", []),
                key_differences=parsed.get("key_differences", []),
                claims_matrix=matrix,
                contradictions=parsed.get("contradictions", []),
                evidence_gaps=parsed.get("evidence_gaps", []),
                synthesis_conclusion=parsed.get("synthesis_conclusion", "Synthesis complete."),
                citations=citations,
                is_demo_mode=False,
                tokens_used=metrics.get("tokens_used", 0),
                latency_ms=metrics.get("latency_ms", 0.0)
            )
        except Exception:
            return ComparisonAgent._local_bounded_comparison(docs, doc_passages, topic_focus, citations)

    @staticmethod
    def _local_bounded_comparison(
        docs: List[Document],
        doc_passages: Dict[str, List[Dict[str, Any]]],
        topic_focus: Optional[str],
        citations: List[Citation]
    ) -> ComparisonReport:
        doc_a = docs[0]
        doc_b = docs[1]
        passages_a = doc_passages.get(doc_a.id, [])
        passages_b = doc_passages.get(doc_b.id, [])

        sample_a = passages_a[0]["content"][:200] if passages_a else "No text"
        sample_b = passages_b[0]["content"][:200] if passages_b else "No text"

        return ComparisonReport(
            documents=[{"id": d.id, "title": d.original_filename} for d in docs],
            executive_summary=(
                f"Comparative synthesis across '{doc_a.original_filename}' and '{doc_b.original_filename}'. "
                f"Both documents provide substantive discussion on {topic_focus or 'their respective domains'}. "
                "Retrieved passages reveal distinct methodological framing and scope."
            ),
            key_similarities=[
                f"Both reference key foundational principles in their opening pages.",
                f"Shared focus on empirical observations and structured conclusions.",
                f"Both maintain formal documentation conventions."
            ],
            key_differences=[
                f"'{doc_a.original_filename}' emphasizes: {sample_a[:100]}...",
                f"'{doc_b.original_filename}' emphasizes: {sample_b[:100]}...",
                f"Scope of application differs between {doc_a.original_filename} and {doc_b.original_filename}."
            ],
            claims_matrix=[
                ComparisonClaim(
                    topic="Primary Focus",
                    document_a_view=sample_a[:120] + "...",
                    document_b_view=sample_b[:120] + "...",
                    status="Contrast"
                ),
                ComparisonClaim(
                    topic="Key Findings",
                    document_a_view=f"Document A page {passages_a[0]['page_number'] if passages_a else 1} findings",
                    document_b_view=f"Document B page {passages_b[0]['page_number'] if passages_b else 1} findings",
                    status="Agreement"
                )
            ],
            contradictions=[
                f"Potential divergence in data interpretation between {doc_a.original_filename} and {doc_b.original_filename}."
            ],
            evidence_gaps=[
                f"Direct head-to-head empirical metrics between these two distinct sources are not provided."
            ],
            synthesis_conclusion=(
                f"Reviewing both {doc_a.original_filename} and {doc_b.original_filename} provides complementary perspectives. "
                "To generate deeper multi-point claim validation, configure the AI API key in Settings."
            ),
            citations=citations,
            is_demo_mode=True,
            tokens_used=max(1, int((len(sample_a) + len(sample_b)) / 4)),
            latency_ms=12.0
        )

comparison_agent = ComparisonAgent()

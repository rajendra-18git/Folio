from pathlib import Path
from typing import Optional
from sqlalchemy.orm import Session
from app.models.db_models import Document
from app.services.pdf_service import PDFService
from app.services.ai_provider import ai_provider
from app.schemas.api_schemas import MultimodalAnalysisResponse

class MultimodalService:
    @staticmethod
    def analyze_page(
        db: Session,
        document_id: str,
        page_number: int,
        analysis_type: str = "general",
        question: Optional[str] = None
    ) -> MultimodalAnalysisResponse:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            raise ValueError(f"Document {document_id} not found.")

        file_path = Path(doc.file_path)
        if not file_path.exists():
            raise FileNotFoundError("Underlying PDF file not found on disk.")

        if page_number < 1 or page_number > doc.page_count:
            raise ValueError(f"Page number {page_number} is out of bounds (1 to {doc.page_count}).")

        # Render page to PNG image
        image_bytes = PDFService.render_page_to_png(file_path=file_path, page_number=page_number, dpi=150)

        preview_url = f"/api/documents/{document_id}/pages/{page_number}/image"

        is_configured = ai_provider.is_configured()
        if not is_configured:
            # Clearly report that visual analysis is unavailable when Gemini is not configured.
            return MultimodalAnalysisResponse(
                document_id=document_id,
                page_number=page_number,
                analysis_type=analysis_type,
                extracted_insights=(
                    "⚠️ **Multimodal Visual Analysis is Unavailable**\n\n"
                    "Visual analysis of diagrams, tables, and charts requires a configured AI API Key.\n"
                    "Please configure your API key in the Settings tab or in your `.env` file.\n\n"
                    "The page image has been rendered and is available for visual inspection."
                ),
                diagram_description=None,
                table_data_markdown=None,
                chart_interpretation=None,
                answer=None,
                image_preview_url=preview_url,
                is_configured=False,
                is_demo_mode=True
            )

        # Formulate prompt based on requested analysis_type
        prompts = {
            "diagram": "Focus specifically on diagrams, system flowcharts, architecture schematics, or figures on this page. Describe all nodes, labels, dataflows, and relationships in detail.",
            "table": "Locate any tables on this page. Extract the tabular structure into clean GitHub-flavored Markdown table format and summarize the key data trends.",
            "chart": "Analyze any charts, plots, bar graphs, or line curves on this page. Detail the axes, legend, numerical trends, peaks, anomalies, and takeaway conclusions.",
            "visual_qa": f"Answer this visual question about this specific page image: {question or 'Explain the key visual elements.'}",
            "general": "Perform a comprehensive visual inspection of this document page. Identify and summarize all figures, diagrams, tables, charts, or visual callouts."
        }
        prompt_text = prompts.get(analysis_type, prompts["general"])

        text_output, metrics = ai_provider.generate_multimodal(
            image_bytes=image_bytes,
            prompt=prompt_text,
            mime_type="image/png"
        )

        return MultimodalAnalysisResponse(
            document_id=document_id,
            page_number=page_number,
            analysis_type=analysis_type,
            extracted_insights=text_output,
            diagram_description=text_output if analysis_type == "diagram" else None,
            table_data_markdown=text_output if analysis_type == "table" else None,
            chart_interpretation=text_output if analysis_type == "chart" else None,
            answer=text_output if analysis_type == "visual_qa" else None,
            image_preview_url=preview_url,
            is_configured=True,
            is_demo_mode=metrics.get("is_demo", False),
            tokens_used=metrics.get("tokens_used", 0),
            latency_ms=metrics.get("latency_ms", 0.0)
        )

multimodal_service = MultimodalService()

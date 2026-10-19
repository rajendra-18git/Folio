import io
from pathlib import Path
from typing import List, Dict, Any, Tuple
import fitz  # PyMuPDF
from PIL import Image

try:
    import pytesseract
    PYTESSERACT_AVAILABLE = True
except ImportError:
    PYTESSERACT_AVAILABLE = False

class PDFService:
    @staticmethod
    def extract_document_pages(file_path: Path) -> Tuple[List[Dict[str, Any]], bool]:
        """
        Extracts text from PDF page by page.
        Returns:
            pages: List of dicts with {"page_number": int, "text": str}
            is_scanned: bool indicating if document appears to be scanned
        """
        if not file_path.exists():
            raise FileNotFoundError(f"PDF file not found at: {file_path}")

        pages: List[Dict[str, Any]] = []
        doc = fitz.open(file_path)
        
        if doc.is_encrypted:
            try:
                # Try authenticating with empty password
                if not doc.authenticate(""):
                    raise ValueError("PDF is encrypted and requires a password.")
            except Exception:
                raise ValueError("PDF is encrypted and cannot be read.")

        total_text_length = 0
        total_pages = len(doc)
        
        for page_idx in range(total_pages):
            page = doc[page_idx]
            page_text = page.get_text("text").strip()
            total_text_length += len(page_text)
            pages.append({
                "page_number": page_idx + 1,
                "text": page_text
            })

        # Detect if document is scanned (average less than 40 characters per page)
        is_scanned = (total_pages > 0 and (total_text_length / total_pages) < 40)
        
        # If scanned and pytesseract is available, attempt OCR
        if is_scanned and PYTESSERACT_AVAILABLE:
            for page_dict in pages:
                if len(page_dict["text"]) < 30:
                    try:
                        page = doc[page_dict["page_number"] - 1]
                        pix = page.get_pixmap(dpi=150)
                        img = Image.open(io.BytesIO(pix.tobytes("png")))
                        ocr_text = pytesseract.image_to_string(img).strip()
                        if ocr_text:
                            page_dict["text"] = ocr_text
                    except Exception:
                        pass # Keep existing text if OCR fails
                        
        doc.close()
        return pages, is_scanned

    @staticmethod
    def chunk_pages(pages: List[Dict[str, Any]], chunk_size: int = 800, chunk_overlap: int = 150) -> List[Dict[str, Any]]:
        """
        Splits extracted pages into overlapping chunks, preserving page numbers.
        """
        chunks: List[Dict[str, Any]] = []
        global_chunk_idx = 0

        for page in pages:
            page_no = page["page_number"]
            text = page["text"]

            if not text:
                continue

            # If page text is within chunk size, keep as single chunk
            if len(text) <= chunk_size:
                chunks.append({
                    "chunk_index": global_chunk_idx,
                    "page_number": page_no,
                    "content": text,
                    "token_count": len(text.split())
                })
                global_chunk_idx += 1
                continue

            # Sliding window chunking
            start = 0
            while start < len(text):
                end = start + chunk_size
                chunk_text = text[start:end]
                
                # Try not to cut words in half if possible
                if end < len(text):
                    last_space = chunk_text.rfind(' ')
                    if last_space > chunk_size // 2:
                        chunk_text = chunk_text[:last_space]
                        end = start + last_space

                chunk_content = chunk_text.strip()
                if chunk_content:
                    chunks.append({
                        "chunk_index": global_chunk_idx,
                        "page_number": page_no,
                        "content": chunk_content,
                        "token_count": len(chunk_content.split())
                    })
                    global_chunk_idx += 1

                start += (chunk_size - chunk_overlap)

        return chunks

    @staticmethod
    def render_page_to_png(file_path: Path, page_number: int, dpi: int = 150) -> bytes:
        """
        Renders a specific PDF page to PNG image bytes for visual analysis and preview.
        """
        doc = fitz.open(file_path)
        if page_number < 1 or page_number > len(doc):
            doc.close()
            raise ValueError(f"Page number {page_number} is out of bounds (1 to {len(doc)}).")

        page = doc[page_number - 1]
        pix = page.get_pixmap(dpi=dpi)
        img_bytes = pix.tobytes("png")
        doc.close()
        return img_bytes

import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.db_models import Conversation, Message
from app.schemas.api_schemas import (
    ChatRequest, ChatResponse, ConversationResponse, MessageResponse, GenericMessageResponse
)
from app.services.rag_service import rag_service

router = APIRouter(prefix="/chat", tags=["Chat"])

def format_message(msg: Message) -> MessageResponse:
    citations_list = []
    if msg.citations:
        try:
            citations_list = json.loads(msg.citations)
        except Exception:
            citations_list = []
    return MessageResponse(
        id=msg.id,
        role=msg.role,
        content=msg.content,
        citations=citations_list,
        is_demo_mode=msg.is_demo_mode or False,
        latency_ms=msg.latency_ms or 0.0,
        tokens_used=getattr(msg, "tokens_used", 0) or 0,
        created_at=msg.created_at
    )

@router.post("", response_model=ChatResponse)
def send_chat_message(request: ChatRequest, db: Session = Depends(get_db)):
    msg, conv = rag_service.answer_query(
        db=db,
        question=request.question,
        document_ids=request.document_ids,
        conversation_id=request.conversation_id
    )
    return ChatResponse(
        conversation_id=conv.id,
        message=format_message(msg)
    )

@router.get("/conversations", response_model=List[ConversationResponse])
def list_conversations(db: Session = Depends(get_db)):
    convs = db.query(Conversation).order_by(Conversation.updated_at.desc()).all()
    result = []
    for c in convs:
        result.append(ConversationResponse(
            id=c.id,
            title=c.title,
            created_at=c.created_at,
            updated_at=c.updated_at,
            messages=[format_message(m) for m in c.messages]
        ))
    return result

@router.get("/{conversation_id}", response_model=ConversationResponse)
def get_conversation(conversation_id: str, db: Session = Depends(get_db)):
    c = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    return ConversationResponse(
        id=c.id,
        title=c.title,
        created_at=c.created_at,
        updated_at=c.updated_at,
        messages=[format_message(m) for m in c.messages]
    )

@router.delete("/{conversation_id}", response_model=GenericMessageResponse)
def delete_conversation(conversation_id: str, db: Session = Depends(get_db)):
    c = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    db.delete(c)
    db.commit()
    return GenericMessageResponse(message="Conversation deleted.")

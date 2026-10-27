import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_optional_current_user
from app.models.db_models import Conversation, Message, User, Document
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
def send_chat_message(
    request: ChatRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id if current_user else None

    # Validate that requested document_ids belong to the current user
    if current_user and request.document_ids:
        count = db.query(Document).filter(
            Document.id.in_(request.document_ids),
            (Document.user_id == current_user.id) | (Document.user_id.is_(None))
        ).count()
        if count != len(request.document_ids):
            raise HTTPException(status_code=404, detail="One or more documents not found or access denied.")

    # Validate that conversation belongs to current user if specified
    if current_user and request.conversation_id:
        conv = db.query(Conversation).filter(
            Conversation.id == request.conversation_id,
            (Conversation.user_id == current_user.id) | (Conversation.user_id.is_(None))
        ).first()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found or access denied.")

    msg, conv = rag_service.answer_query(
        db=db,
        question=request.question,
        document_ids=request.document_ids,
        conversation_id=request.conversation_id,
        user_id=user_id
    )
    return ChatResponse(
        conversation_id=conv.id,
        message=format_message(msg)
    )

@router.get("/conversations", response_model=List[ConversationResponse])
def list_conversations(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Conversation)
    if current_user:
        query = query.filter(Conversation.user_id == current_user.id)
    else:
        query = query.filter(Conversation.user_id.is_(None))
    convs = query.order_by(Conversation.updated_at.desc()).all()
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
def get_conversation(
    conversation_id: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Conversation).filter(Conversation.id == conversation_id)
    if current_user:
        query = query.filter((Conversation.user_id == current_user.id) | (Conversation.user_id.is_(None)))
    c = query.first()
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
def delete_conversation(
    conversation_id: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Conversation).filter(Conversation.id == conversation_id)
    if current_user:
        query = query.filter(Conversation.user_id == current_user.id)
    c = query.first()
    if not c:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    db.delete(c)
    db.commit()
    return GenericMessageResponse(message="Conversation deleted.")

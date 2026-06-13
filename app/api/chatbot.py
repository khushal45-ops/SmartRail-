from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chatbot_service import ChatbotService

router = APIRouter()


@router.post("", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
) -> ChatResponse:
    result = ChatbotService.process_message(db, payload.message)
    return ChatResponse(**result)

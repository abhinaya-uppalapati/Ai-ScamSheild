from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest, ChatResponse
from app.services.assistant_service import chat as run_chat

router = APIRouter(prefix="/assistant", tags=["assistant"])


@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(payload: ChatRequest):
    try:
        reply = run_chat(payload.message, payload.history or [])
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=503,
            detail=f"Assistant unavailable: {exc}",
        )
    return ChatResponse(reply=reply)

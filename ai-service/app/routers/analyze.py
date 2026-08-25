from fastapi import APIRouter
from app.models.schemas import (
    MessageRequest,
    UrlRequest,
    EmailRequest,
    ConversationRequest,
    AnalysisResponse,
)
from app.services import llm_detector

router = APIRouter(prefix="/analyze", tags=["analyze"])


@router.post("/message", response_model=AnalysisResponse)
def analyze_message(payload: MessageRequest):
    return llm_detector.analyze_text(payload.text)


@router.post("/url", response_model=AnalysisResponse)
def analyze_url_endpoint(payload: UrlRequest):
    return llm_detector.analyze_url(payload.url)


@router.post("/email", response_model=AnalysisResponse)
def analyze_email(payload: EmailRequest):
    return llm_detector.analyze_email(
        sender=payload.sender,
        subject=payload.subject,
        body=payload.body,
        links=payload.links or [],
    )


@router.post("/conversation", response_model=AnalysisResponse)
def analyze_conversation(payload: ConversationRequest):
    return llm_detector.analyze_conversation(payload.conversation)
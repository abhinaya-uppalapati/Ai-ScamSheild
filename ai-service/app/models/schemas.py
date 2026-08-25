from pydantic import BaseModel
from typing import List, Optional


class MessageRequest(BaseModel):
    text: str


class UrlRequest(BaseModel):
    url: str


class EmailRequest(BaseModel):
    sender: Optional[str] = None
    subject: Optional[str] = None
    body: str
    links: Optional[List[str]] = []


class AnalysisResponse(BaseModel):
    riskScore: int
    riskLevel: str  # SAFE | SUSPICIOUS | HIGH_RISK
    category: str
    reasons: List[str]
    tactics: Optional[List[str]] = []


class ConversationRequest(BaseModel):
    conversation: str  # multi-turn conversation, pasted as plain text


class InvestigateRequest(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None


class InvestigateResponse(BaseModel):
    messageRisk: Optional[int] = None
    urlRisk: Optional[int] = None
    finalRisk: int
    riskLevel: str
    category: str
    reasons: List[str]


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    reply: str
"""
AI Security Assistant (Milestone 12), powered by Google Gemini.
"""

from google.genai import types

from app.services.llm_detector import _get_client, MODEL_NAME
from app.models.schemas import ChatMessage

ASSISTANT_SYSTEM_PROMPT = """You are the AI Security Assistant inside AI ScamShield, a scam-detection \
product. You help users understand scams, phishing, and online fraud, and give them safe, practical \
next steps.

Scope: only answer questions about scams, phishing, fraud, online safety, account security, and how \
to interpret AI ScamShield's own scan results. If asked something unrelated, politely redirect the \
user back to security topics.

Style: concise, calm, and practical. Never ask the user to share sensitive information like \
passwords, OTPs, or card numbers."""


def chat(message: str, history: list[ChatMessage]) -> str:
    client = _get_client()

    gemini_history = [
        types.Content(
            role="model" if h.role == "assistant" else "user",
            parts=[types.Part(text=h.content)],
        )
        for h in history
    ]

    chat_session = client.chats.create(
        model=MODEL_NAME,
        history=gemini_history,
        config=types.GenerateContentConfig(
            system_instruction=ASSISTANT_SYSTEM_PROMPT,
            max_output_tokens=600,
        ),
    )

    response = chat_session.send_message(message)
    return response.text
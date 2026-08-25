import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from app.routers import analyze, investigate, assistant  # noqa: E402  (import after load_dotenv)

app = FastAPI(title="AI ScamShield - AI Service", version="1.0.0")

if not os.environ.get("GEMINI_API_KEY"):
    print(
        "[startup warning] GEMINI_API_KEY is not set — LLM detection will "
        "fail and every request will silently fall back to the rule-based "
        "detector. Set it in ai-service/.env (get a free key at "
        "https://aistudio.google.com/apikey)"
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"],  # backend URL
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router)
app.include_router(investigate.router)
app.include_router(assistant.router)


@app.get("/health")
def health():
    return {"status": "ok"}

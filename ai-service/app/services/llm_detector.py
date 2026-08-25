"""
LLM-based scam detector, powered by Google Gemini (free tier).
"""

import json
import os
import re

from google import genai
from google.genai import types

from app.models.schemas import AnalysisResponse
from app.services import detector as rule_based

MODEL_NAME = "gemini-2.5-flash"

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not set")
        _client = genai.Client(api_key=api_key)
    return _client


SYSTEM_PROMPT = """You are a scam-detection engine inside a security product called AI ScamShield. \
You are given a piece of text (a message, email, or URL a user received) and you must assess how \
likely it is to be a scam.

Respond with ONLY a single valid JSON object, no markdown fences, no preamble, no explanation \
outside the JSON. The JSON must have exactly this shape:

{
  "riskScore": <integer 0-100>,
  "riskLevel": "SAFE" | "SUSPICIOUS" | "HIGH_RISK",
  "category": <string, one of: "Phishing", "Banking Scam", "Job Scam", "Investment Scam", \
"Lottery Scam", "Delivery Scam", "Government Impersonation", "Account Takeover", "Payment Scam", \
"Social Engineering", "Unknown">,
  "reasons": [<string>, ...],
  "tactics": [<string, zero or more from: "Fear", "Urgency", "Impersonation", "Financial Pressure", \
"Credential Request", "Trust Building", "Authority", "Social Proof", "Scarcity">]
}

Scoring guide: 0-30 = SAFE, 31-60 = SUSPICIOUS, 61-100 = HIGH_RISK.

"reasons" must be a short list (2-6 items) of concrete, specific indicators you actually found in \
THIS text -- e.g. "Requests OTP code", "Impersonates a bank with urgent account-suspension threat", \
"Uses a shortened/suspicious URL". Do not include generic filler. If the text looks legitimate, \
say so plainly and give riskScore near 0 with an empty or near-empty reasons list.

"tactics" identifies the psychological/manipulation techniques being used, separately from the \
factual reasons above -- e.g. a message can have the reason "requests OTP" AND the tactic \
"Credential Request" (the ask) AND "Urgency" (the pressure used to get it). Leave "tactics" empty \
for legitimate text.

Be careful not to over-flag ordinary messages (casual conversation, real appointment reminders, \
normal business correspondence) as scams. Reserve HIGH_RISK for text with genuine, concrete scam \
indicators -- urgency + financial/credential requests + impersonation are the strongest signals."""

CONVERSATION_SYSTEM_PROMPT = """You are a scam-detection engine inside a security product called AI \
ScamShield, specialized in analyzing multi-turn CONVERSATIONS (not single messages) for social \
engineering and scam patterns. You are given a pasted conversation between a user and another party, \
usually formatted with speaker labels per line.

Respond with ONLY a single valid JSON object, no markdown fences, no preamble. Same shape as single-\
message analysis:

{
  "riskScore": <integer 0-100>,
  "riskLevel": "SAFE" | "SUSPICIOUS" | "HIGH_RISK",
  "category": <string, one of: "Phishing", "Banking Scam", "Job Scam", "Investment Scam", \
"Lottery Scam", "Delivery Scam", "Government Impersonation", "Account Takeover", "Payment Scam", \
"Social Engineering", "Unknown">,
  "reasons": [<string>, ...],
  "tactics": [<string, zero or more from: "Fear", "Urgency", "Impersonation", "Financial Pressure", \
"Credential Request", "Trust Building", "Authority", "Social Proof", "Scarcity">]
}

For conversations specifically, pay attention to PROGRESSION across turns, not just individual lines: \
does the other party build trust first, then escalate pressure, then request credentials or payment? \
That escalation pattern is itself a strong scam signal even if any single line looks mild. Reflect \
this in "reasons" -- e.g. "Escalates from casual contact to urgent OTP request within 3 turns" is a \
much stronger, more specific reason than restating one line in isolation.

Be careful not to over-flag ordinary back-and-forth conversation as scams."""


def _extract_json(raw: str) -> dict:
    """Best-effort extraction in case the model wraps JSON in fences anyway."""
    raw = raw.strip()
    if raw.startswith("```"):
        raw = re.sub(r"^```(json)?", "", raw).strip()
        raw = re.sub(r"```$", "", raw).strip()
    return json.loads(raw)


ALLOWED_TACTICS = {
    "Fear", "Urgency", "Impersonation", "Financial Pressure",
    "Credential Request", "Trust Building", "Authority", "Social Proof", "Scarcity",
}


def _validate(data: dict) -> AnalysisResponse:
    score = int(data["riskScore"])
    score = max(0, min(100, score))

    level = data.get("riskLevel", "").upper()
    if level not in ("SAFE", "SUSPICIOUS", "HIGH_RISK"):
        level = "SAFE" if score <= 30 else "SUSPICIOUS" if score <= 60 else "HIGH_RISK"

    category = data.get("category") or "Unknown"
    reasons = data.get("reasons") or []
    if not isinstance(reasons, list):
        reasons = [str(reasons)]
    if not reasons:
        reasons = ["No strong scam indicators detected"]

    tactics = data.get("tactics") or []
    if not isinstance(tactics, list):
        tactics = [str(tactics)]
    tactics = [str(t) for t in tactics if str(t) in ALLOWED_TACTICS]

    return AnalysisResponse(
        riskScore=score,
        riskLevel=level,
        category=str(category),
        reasons=[str(r) for r in reasons],
        tactics=tactics,
    )


def _call_llm(content: str, system_prompt: str = SYSTEM_PROMPT) -> AnalysisResponse:
    client = _get_client()

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=content,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            response_mime_type="application/json",
            max_output_tokens=600,
        ),
    )

    raw_text = response.text
    data = _extract_json(raw_text)
    return _validate(data)


def analyze_text(raw_text: str) -> AnalysisResponse:
    try:
        return _call_llm(f"Analyze this message for scam indicators:\n\n{raw_text}")
    except Exception as exc:
        print(f"[llm_detector] LLM call failed, falling back to rule-based: {exc}")
        return rule_based.analyze_text(raw_text)


def analyze_url(url: str) -> AnalysisResponse:
    try:
        return _call_llm(
            f"Analyze this URL for phishing/scam indicators. Consider domain structure, "
            f"suspicious subdomains, URL shorteners, and patterns mimicking login pages:\n\n{url}"
        )
    except Exception as exc:
        print(f"[llm_detector] LLM call failed, falling back to rule-based: {exc}")
        return rule_based.analyze_url(url)


def analyze_email(sender: str | None, subject: str | None, body: str, links: list[str]) -> AnalysisResponse:
    parts = []
    if sender:
        parts.append(f"From: {sender}")
    if subject:
        parts.append(f"Subject: {subject}")
    parts.append(f"Body:\n{body}")
    if links:
        parts.append("Links found in email:\n" + "\n".join(links))
    content = "\n\n".join(parts)

    try:
        return _call_llm(
            "Analyze this email for scam/phishing indicators, including sender impersonation:\n\n"
            + content
        )
    except Exception as exc:
        print(f"[llm_detector] LLM call failed, falling back to rule-based: {exc}")
        combined = " ".join(filter(None, [sender, subject, body, *links]))
        return rule_based.analyze_text(combined)


def analyze_conversation(conversation: str) -> AnalysisResponse:
    """Analyzes a full multi-turn conversation for escalation/manipulation
    patterns, not just single-line keyword matches."""
    try:
        return _call_llm(
            f"Analyze this conversation for scam/social-engineering patterns:\n\n{conversation}",
            system_prompt=CONVERSATION_SYSTEM_PROMPT,
        )
    except Exception as exc:
        print(f"[llm_detector] LLM call failed, falling back to rule-based: {exc}")
        return rule_based.analyze_text(conversation)
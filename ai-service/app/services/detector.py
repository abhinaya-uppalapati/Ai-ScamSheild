"""
Baseline rule-based scam detector.

This is a starting point so the full pipeline (frontend -> backend -> AI
service -> MongoDB) works end-to-end from day one. In Milestones 5-8 this
should be extended or replaced with a trained NLP/ML model and/or LLM-based
classification, plus real evaluation metrics (Milestone 17) rather than
hand-picked weights.
"""

import re
from app.models.schemas import AnalysisResponse

# --- Signal keyword banks -------------------------------------------------

URGENCY_WORDS = [
    "immediately", "urgent", "act now", "right away", "expire",
    "limited time", "last chance", "within 24 hours",
]

THREAT_WORDS = [
    "account will be blocked", "account suspended", "legal action",
    "will be closed", "penalty", "arrest",
]

FINANCIAL_WORDS = [
    "pay", "processing fee", "transfer", "claim your prize", "won",
    "lottery", "refund", "deposit", "bank details", "otp",
]

CREDENTIAL_WORDS = [
    "password", "otp", "pin", "cvv", "login details", "verify your account",
    "confirm your identity",
]

IMPERSONATION_WORDS = [
    "bank", "government", "irs", "income tax", "customs", "courier",
    "amazon", "paypal", "microsoft",
]

CATEGORY_RULES = [
    ("Lottery Scam", ["won", "prize", "lottery", "claim"]),
    ("Banking Scam", ["bank", "account blocked", "account suspended"]),
    ("Job Scam", ["job offer", "work from home", "hiring", "salary"]),
    ("Investment Scam", ["investment", "returns", "crypto", "trading"]),
    ("Delivery Scam", ["courier", "package", "delivery", "customs fee"]),
    ("Government Impersonation", ["income tax", "irs", "government", "customs"]),
    ("Phishing", ["verify your account", "login details", "confirm your identity"]),
]


def _contains_any(text: str, words: list[str]) -> bool:
    return any(w in text for w in words)


def _classify_category(text: str) -> str:
    for category, keywords in CATEGORY_RULES:
        if _contains_any(text, keywords):
            return category
    return "Unknown"


def analyze_text(raw_text: str) -> AnalysisResponse:
    text = raw_text.lower()

    reasons: list[str] = []
    tactics: list[str] = []
    score = 0

    if _contains_any(text, URGENCY_WORDS):
        score += 20
        reasons.append("Urgent language detected")
        tactics.append("Urgency")

    if _contains_any(text, FINANCIAL_WORDS):
        score += 25
        reasons.append("Requests financial payment or banking info")
        tactics.append("Financial Pressure")

    if re.search(r"https?://|www\.", text):
        score += 20
        reasons.append("Contains a URL")

    if _contains_any(text, CREDENTIAL_WORDS):
        score += 20
        reasons.append("Requests sensitive credentials (OTP/password/PIN)")
        tactics.append("Credential Request")

    if _contains_any(text, IMPERSONATION_WORDS):
        score += 15
        reasons.append("Possible impersonation of a known organization")
        tactics.append("Impersonation")

    if _contains_any(text, THREAT_WORDS):
        score += 15
        reasons.append("Threatening language detected")
        tactics.append("Fear")

    score = min(score, 100)

    if score <= 30:
        level = "SAFE"
    elif score <= 60:
        level = "SUSPICIOUS"
    else:
        level = "HIGH_RISK"

    category = _classify_category(text) if score > 30 else "Unknown"

    if not reasons:
        reasons.append("No strong scam indicators detected")

    return AnalysisResponse(
        riskScore=score,
        riskLevel=level,
        category=category,
        reasons=reasons,
        tactics=tactics if score > 30 else [],
    )


def analyze_url(url: str) -> AnalysisResponse:
    text = url.lower()
    reasons: list[str] = []
    score = 0

    if not text.startswith("https://"):
        score += 25
        reasons.append("Not using HTTPS")

    if re.search(r"bit\.ly|tinyurl|t\.co|goo\.gl", text):
        score += 25
        reasons.append("Shortened URL detected")

    if re.search(r"login|verify|secure|account", text):
        score += 25
        reasons.append("Login/verification page pattern detected")

    if re.search(r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", text):
        score += 25
        reasons.append("Raw IP address used instead of domain name")

    score = min(score, 100)

    if score <= 30:
        level = "SAFE"
    elif score <= 60:
        level = "SUSPICIOUS"
    else:
        level = "HIGH_RISK"

    category = "Phishing" if score > 30 else "Unknown"

    if not reasons:
        reasons.append("No strong risk indicators detected in URL structure")

    return AnalysisResponse(
        riskScore=score,
        riskLevel=level,
        category=category,
        reasons=reasons,
    )
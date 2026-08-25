"""
Scam Investigation Engine (Milestone 11).

Combines text analysis and URL analysis into a single fused risk
assessment. This is deliberately simple evidence fusion (weighted max/avg)
rather than a trained fusion model — good enough for a final-year project,
but call out clearly that the weights below are heuristic, not learned.
"""

from app.models.schemas import InvestigateResponse
from app.services import llm_detector


def investigate(text: str | None, url: str | None) -> InvestigateResponse:
    if not text and not url:
        raise ValueError("At least one of text or url must be provided")

    message_result = llm_detector.analyze_text(text) if text else None
    url_result = llm_detector.analyze_url(url) if url else None

    reasons: list[str] = []
    if message_result:
        reasons.extend(f"[Message] {r}" for r in message_result.reasons)
    if url_result:
        reasons.extend(f"[URL] {r}" for r in url_result.reasons)

    # Evidence fusion: if both signals present, weight them evenly but let
    # the higher-risk signal pull the final score up (scams are rarely
    # "average risk" — a single strong red flag should dominate).
    if message_result and url_result:
        final_risk = round(
            0.6 * max(message_result.riskScore, url_result.riskScore)
            + 0.4 * ((message_result.riskScore + url_result.riskScore) / 2)
        )
        category = (
            message_result.category
            if message_result.riskScore >= url_result.riskScore
            else url_result.category
        )
    elif message_result:
        final_risk = message_result.riskScore
        category = message_result.category
    else:
        final_risk = url_result.riskScore
        category = url_result.category

    final_risk = max(0, min(100, final_risk))

    if final_risk <= 30:
        level = "SAFE"
    elif final_risk <= 60:
        level = "SUSPICIOUS"
    else:
        level = "HIGH_RISK"

    return InvestigateResponse(
        messageRisk=message_result.riskScore if message_result else None,
        urlRisk=url_result.riskScore if url_result else None,
        finalRisk=final_risk,
        riskLevel=level,
        category=category,
        reasons=reasons or ["No strong scam indicators detected"],
    )

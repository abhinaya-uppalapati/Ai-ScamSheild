"""
Tests for the evidence fusion logic in investigation_service.py.

These mock out llm_detector so they don't require an API key or network
access — they test the fusion math only, not the LLM call itself.
"""

import sys
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.models.schemas import AnalysisResponse
from app.services import investigation_service


def _fake_result(score, level, category="Phishing", reasons=None):
    return AnalysisResponse(
        riskScore=score,
        riskLevel=level,
        category=category,
        reasons=reasons or ["reason"],
    )


def test_investigate_requires_at_least_one_input():
    try:
        investigation_service.investigate(None, None)
        assert False, "expected ValueError"
    except ValueError:
        pass


@patch("app.services.investigation_service.llm_detector")
def test_investigate_combines_text_and_url_favoring_higher_risk(mock_llm):
    mock_llm.analyze_text.return_value = _fake_result(40, "SUSPICIOUS")
    mock_llm.analyze_url.return_value = _fake_result(90, "HIGH_RISK")

    result = investigation_service.investigate("some text", "http://example.com")

    # final risk should be pulled toward the higher (90) signal, not a plain average
    assert result.finalRisk > 60
    assert result.riskLevel == "HIGH_RISK"
    assert result.messageRisk == 40
    assert result.urlRisk == 90


@patch("app.services.investigation_service.llm_detector")
def test_investigate_with_only_text(mock_llm):
    mock_llm.analyze_text.return_value = _fake_result(75, "HIGH_RISK")

    result = investigation_service.investigate("some scammy text", None)

    assert result.finalRisk == 75
    assert result.urlRisk is None

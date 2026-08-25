import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services import detector


def test_obvious_scam_message_scores_high():
    result = detector.analyze_text(
        "Congratulations! You won ₹50,000. Pay ₹999 immediately to claim "
        "your prize. Click http://bit.ly/claim now."
    )
    assert result.riskScore > 60
    assert result.riskLevel == "HIGH_RISK"


def test_benign_message_scores_low():
    result = detector.analyze_text("Hey, are we still on for lunch tomorrow at 1pm?")
    assert result.riskScore <= 30
    assert result.riskLevel == "SAFE"


def test_credential_request_flagged():
    result = detector.analyze_text(
        "Your account will be suspended. Please share your OTP to verify."
    )
    assert any("OTP" in r or "credential" in r.lower() for r in result.reasons)


def test_url_without_https_flagged():
    result = detector.analyze_url("http://example-login.com/verify-account")
    assert any("HTTPS" in r for r in result.reasons)


def test_shortened_url_flagged():
    result = detector.analyze_url("https://bit.ly/3xample")
    assert any("Shortened" in r for r in result.reasons)


def test_safe_https_url_scores_low():
    result = detector.analyze_url("https://www.wikipedia.org/wiki/Python")
    assert result.riskScore <= 30


def test_score_never_exceeds_100():
    result = detector.analyze_text(
        "URGENT immediately act now pay processing fee won lottery bank "
        "account suspended password otp pin verify your account "
        "https://scam.example.com legal action arrest"
    )
    assert 0 <= result.riskScore <= 100

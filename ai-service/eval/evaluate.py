"""
Milestone 17 — Model Evaluation.

Runs the detector against a labeled CSV dataset (columns: text,label where
label is "scam" or "legit") and reports accuracy, precision, recall, F1,
and a confusion matrix.

IMPORTANT: sample_labeled_dataset.csv has only 15 rows and is for wiring
verification only. For your actual project evaluation (and to report real
numbers in Milestone 17), replace it with a proper labeled dataset of at
least a few hundred examples, ideally from a public phishing/scam corpus
plus some of your own collected/synthetic examples, with a held-out test
split that the detector was never tuned against.

Usage:
    python eval/evaluate.py [path_to_csv] [--detector rule|llm]
"""

import argparse
import csv
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services import detector as rule_based  # noqa: E402
from app.services import llm_detector  # noqa: E402


def label_to_binary(label: str) -> bool:
    """True = scam, False = legit"""
    return label.strip().lower() == "scam"


def prediction_to_binary(risk_level: str) -> bool:
    """SUSPICIOUS and HIGH_RISK both count as a positive (scam) prediction."""
    return risk_level in ("SUSPICIOUS", "HIGH_RISK")


def evaluate(csv_path: str, use_llm: bool) -> None:
    rows = []
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    if not rows:
        print("No rows found in dataset.")
        return

    tp = fp = tn = fn = 0

    for row in rows:
        text = row["text"]
        actual = label_to_binary(row["label"])

        result = (
            llm_detector.analyze_text(text)
            if use_llm
            else rule_based.analyze_text(text)
        )
        predicted = prediction_to_binary(result.riskLevel)

        if predicted and actual:
            tp += 1
        elif predicted and not actual:
            fp += 1
        elif not predicted and not actual:
            tn += 1
        else:
            fn += 1

    total = tp + fp + tn + fn
    accuracy = (tp + tn) / total if total else 0
    precision = tp / (tp + fp) if (tp + fp) else 0
    recall = tp / (tp + fn) if (tp + fn) else 0
    f1 = (
        2 * precision * recall / (precision + recall)
        if (precision + recall)
        else 0
    )

    print(f"Detector: {'LLM-based' if use_llm else 'Rule-based'}")
    print(f"Dataset:  {csv_path} ({total} examples)")
    print()
    print(f"Accuracy:   {accuracy * 100:.1f}%")
    print(f"Precision:  {precision * 100:.1f}%")
    print(f"Recall:     {recall * 100:.1f}%")
    print(f"F1 Score:   {f1 * 100:.1f}%")
    print()
    print("Confusion matrix:")
    print(f"                 Predicted Scam   Predicted Legit")
    print(f"  Actual Scam    {tp:>14}   {fn:>15}")
    print(f"  Actual Legit   {fp:>14}   {tn:>15}")
    print()
    print(
        "NOTE: this dataset is tiny — treat these numbers as a sanity check "
        "that the pipeline works, not as reportable project metrics."
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "csv_path",
        nargs="?",
        default=str(Path(__file__).parent / "sample_labeled_dataset.csv"),
    )
    parser.add_argument(
        "--detector",
        choices=["rule", "llm"],
        default="rule",
        help="Which detector to evaluate (llm requires ANTHROPIC_API_KEY)",
    )
    args = parser.parse_args()

    evaluate(args.csv_path, use_llm=(args.detector == "llm"))

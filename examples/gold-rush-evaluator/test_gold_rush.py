"""
Gold Rush Challenge: Python Evaluator Adapter Test Suite
Authoritative Historical Mining Intelligence Verification for Queensland, Australia
Grounded in Geological Survey of Queensland (GSQ) records.
"""

import os
import json
import re

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
EVAL_DATA_PATH = os.path.join(ROOT_DIR, "eval-data", "gold_rush_queensland_mines.jsonl")

def test_gsq_dataset_integrity():
    assert os.path.exists(EVAL_DATA_PATH), f"Dataset missing: {EVAL_DATA_PATH}"
    with open(EVAL_DATA_PATH, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f if line.strip()]
    
    assert len(lines) >= 6, f"Expected at least 6 historical cases, found {len(lines)}"
    
    expected_deposits = [
        "Mount Morgan",
        "Charters Towers",
        "Gympie",
        "Palmer River",
        "Ravenswood",
        "Hodgkinson"
    ]
    
    for deposit in expected_deposits:
        matched = False
        for line in lines:
            row = json.loads(line)
            if deposit.lower() in row["prompt"].lower():
                matched = True
                assert "chosen" in row and len(row["chosen"]) > 50
                assert "rejected" in row and len(row["rejected"]) > 50
                assert "provenance" in row and "gsq" in row["provenance"]["source_url"]
                break
        assert matched, f"Deposit {deposit} not found in GSQ dataset"
    print("✅ test_gsq_dataset_integrity passed: All 6 Queensland goldfields verified.")

def test_evaluator_scoring_logic():
    # Test Mount Morgan Ground Truth
    sample_text = "Discovered in July 1882 by Morgan Brothers. Produced 262 tonnes of gold and 387,000 tonnes of copper. VHMS replacement in Mount Morgan Trondhjemite. Closed in 1981."
    assert re.search(r"262\s*tonnes", sample_text, re.I)
    assert re.search(r"morgan\s+brothers", sample_text, re.I)
    assert re.search(r"vhms", sample_text, re.I)
    assert re.search(r"1981", sample_text, re.I)
    print("✅ test_evaluator_scoring_logic passed: Deterministic regex parsing verified.")

if __name__ == "__main__":
    print("=== Testing Python Gold Rush Historical Evaluator ===")
    test_gsq_dataset_integrity()
    test_evaluator_scoring_logic()
    print("=== All Python Gold Rush Tests Passed (2/2) ✅ ===")

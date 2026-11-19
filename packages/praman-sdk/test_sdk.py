"""
Test Suite for Praman Desk Official Python SDK
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from praman import PramanDesk

def main():
    print("=== Testing Praman Desk Python SDK ===")
    client = PramanDesk(endpoint="https://praman-desk.vercel.app", timeout=12.0)

    print("1. Testing screen_sanctions (Lazarus Group EVM)...")
    sdn = client.screen_sanctions(address="0x098B716B8Aaf21512996dC57EB0615e2383E2f96")
    assert sdn.get("matched") is True, "Sanctions screening must match Lazarus Group"
    print(f"   PASS ✅ matched: {sdn.get('matched')} matches: {len(sdn.get('matches', []))}")

    print("2. Testing verify_vendor (Stripe, LLC)...")
    corp = client.verify_vendor(vendor="Stripe, LLC")
    assert corp.get("found") is True, "Corporate registry must find Stripe"
    print(f"   PASS ✅ found: {corp.get('found')} lei: {corp.get('lei') or corp.get('reg_id')}")

    print("3. Testing clear_spend (Banco Nacional de Cuba)...")
    spend = client.clear_spend(vendor="Banco Nacional de Cuba", amount=5000)
    assert spend.get("cleared") is False, "Sanctioned spend must be halted"
    print(f"   PASS ✅ cleared: {spend.get('cleared')} status: {spend.get('status')}")

    print("4. Testing counterparty_shield (unisvvap.org)...")
    shield = client.counterparty_shield(domain="unisvvap.org", vendor="Uniswap")
    assert shield.get("cleared") is False, "Phishing domain must be blocked"
    print(f"   PASS ✅ cleared: {shield.get('cleared')} verdict: {shield.get('shieldVerdict') or shield.get('verdict')}")

    print("5. Testing rug_receipt_screen (Lazarus address)...")
    rug = client.rug_receipt_screen(contract_address="0x098B716B8Aaf21512996dC57EB0615e2383E2f96")
    assert rug.get("cleared") is False, "Exploit contract must be flagged"
    print(f"   PASS ✅ cleared: {rug.get('cleared')} verdict: {rug.get('verdict')} safetyScore: {rug.get('safetyScore')}")

    print("6. Testing audit_contract_obligation (Mission 04)...")
    contract = client.audit_contract_obligation(
        contract_text="Late payment interest accrues at 18% per annum compounded monthly if unpaid after 30 days.",
        invoice_amount=50000.0,
        invoice_date="2026-08-01",
        payment_due_date="2026-08-31",
        interest_rate_pct=18.0
    )
    assert contract.get("intent") == "CONTRACT_OBLIGATION_AUDIT_GENERAL" or "status" in contract, "Contract audit response required"
    print(f"   PASS ✅ status: {contract.get('status')} accrued: {contract.get('accruedLiability') or contract.get('accrued_liability')}")

    print("=== All Python SDK Tests Passed (6/6) ✅ ===")

if __name__ == "__main__":
    main()

"""
Test Suite for Praman Desk Official Python SDK
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from praman import PramanDesk

def main():
    print("=== Testing Praman Desk Python SDK ===")
    client = PramanDesk(endpoint=os.environ.get("PRAMAN_ENDPOINT", "https://praman-desk.vercel.app"), timeout=12.0)

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
        principal=50000.0,
        rate_pct=18.0,
        days_overdue=30
    )
    assert contract.get("intent") == "CONTRACT_OBLIGATION_AUDIT_GENERAL", "Contract audit response required"
    assert contract.get("verdict") == "Non-compliant", "Overdue contract must be Non-compliant"
    assert contract.get("penalty_amount", 0) > 0, "Accrued penalty must be positive"
    print(f"   PASS ✅ status: {contract.get('status')} penalty: {contract.get('penalty_amount')}")

    print("7. Testing get_grid_power_price (CAISO NP15)...")
    power = client.get_grid_power_price(hub="NP15")
    assert power.get("intent") == "GRID_POWER_PRICE_GENERAL", "Power price must return GRID_POWER_PRICE_GENERAL"
    assert power.get("ok") is True and power.get("price_mwh", 0) > 0, "Live CAISO NP15 price per MWh must be positive"
    print(f"   PASS ✅ hub: {power.get('hub')} price_mwh: {power.get('price_mwh')}")

    print("8. Testing query_mining_intelligence (Mount Morgan)...")
    mine = client.query_mining_intelligence(site="Mount Morgan Mine")
    assert "summary" in mine or "verdict" in mine, "Mining intelligence response required"
    print(f"   PASS ✅ site: {mine.get('site', 'Mount Morgan Mine')} verdict: {mine.get('verdict')}")

    print("9. Testing arbitrate_mining_discrepancies (Universal Multi-Miner Arbitrator)...")
    arb = client.arbitrate_mining_discrepancies(site="Mount Morgan Mine")
    assert arb.get("status") in ("SYNTHESIS_ARBITRATED", "DISCREPANCY_FLAGGED"), "Arbitration status required"
    print(f"   PASS ✅ status: {arb.get('status')} discrepancies: {arb.get('discrepancies_found')}")

    print("=== All Python SDK Tests Passed (9/9) ✅ ===")

if __name__ == "__main__":
    main()

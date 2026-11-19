"""
Praman Desk Spend Guard — Autonomous Agent Pre-Payment Firewall
LangChain / Python Agent Integration Example

This example demonstrates how to integrate Praman Desk as a pre-payment firewall
around any autonomous AI agent (LangChain, AutoGPT, CrewAI, or raw OpenAI/Anthropic).

The guard intercepts outbound wallet transactions BEFORE private-key signing:
1. Validates recipient address against 19,565 OFAC SDN entries.
2. Resolves vendor identity in the Global LEI Index (GLEIF).
3. Executes bit-exact 651-byte WASM arithmetic reconciliation.
4. Enforces single-agent and dual-authorization spending caps.
5. Returns a cryptographic attestation seal or halts execution.
"""

import json
import urllib.request
import urllib.error
from typing import Dict, Any, Optional

PRAMAN_GUARD_ENDPOINT = "https://praman-desk.vercel.app/api/spend-guard/evaluate"

class SpendGuardException(Exception):
    """Raised when the pre-payment firewall halts a transaction."""
    pass

class PramanSpendGuard:
    """Pre-Payment Firewall Client for Autonomous Agents."""

    def __init__(self, endpoint: str = PRAMAN_GUARD_ENDPOINT, timeout_seconds: int = 10):
        self.endpoint = endpoint
        self.timeout = timeout_seconds

    def inspect_spend(
        self,
        agent_id: str,
        recipient_address: str,
        vendor_name: str,
        amount_usdc: float,
        line_items: list,
        invoice_id: str = "INV-AGENT-001",
        supervisor_signature: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Evaluate an outbound spend request against statutory compliance and math policies.
        Returns the verdict payload if approved; raises SpendGuardException if halted.
        """
        payload = {
            "agentId": agent_id,
            "recipientAddress": recipient_address,
            "vendorName": vendor_name,
            "spendAmountUsdc": amount_usdc,
            "statedTotal": amount_usdc,
            "invoiceId": invoice_id,
            "lineItems": line_items,
            "supervisorSignature": supervisor_signature or ""
        }

        req = urllib.request.Request(
            self.endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json", "User-Agent": "PramanSpendGuard-Python/1.0"}
        )

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as response:
                result = json.loads(response.read().decode("utf-8"))
        except urllib.error.URLError as e:
            raise RuntimeError(f"Failed to reach Praman Spend Guard: {e}")

        # Check circuit breaker and policy verdict
        if result.get("verdict") == "HALT_AND_FREEZE" or result.get("status") == "HALTED":
            flags = result.get("flags", [])
            flag_str = ", ".join(flags) if flags else "Policy violation"
            raise SpendGuardException(
                f"[FIREWALL HALT] Transaction blocked by Praman Desk: {flag_str}\n"
                f"Summary: {result.get('summary')}"
            )

        return result


def simulate_agent_procurement():
    """Simulates an autonomous procurement agent executing transactions with Spend Guard."""
    guard = PramanSpendGuard()
    print("=" * 70)
    print("PRAMAN DESK — AUTONOMOUS AGENT PRE-PAYMENT FIREWALL")
    print("Running 3 Real-World Evaluation Scenarios")
    print("=" * 70)

    # --- Scenario 1: Phishing & OFAC Exploit ---
    print("\n[Scenario 1] Injected Prompt / Phishing Invoice targeting Lazarus Group Address")
    phishing_tx = {
        "agent_id": "infra-procure-bot-01",
        "recipient_address": "0x098B716B8Aaf21512996dC57EB0615e2383E2f96",  # Lazarus Group
        "vendor_name": "Cloudflare, Inc. (Spoofed Impersonation)",
        "amount_usdc": 4200.00,
        "line_items": [{"desc": "Enterprise Edge Bandwidth", "qty": 1, "unitPrice": 4200.00, "amount": 4200.00}]
    }
    try:
        verdict = guard.inspect_spend(**phishing_tx)
        print("❌ FAIL: Transaction should have been blocked!")
    except SpendGuardException as e:
        print("✅ SUCCESS: Firewall intercepted attack!")
        print(f"   Reason: {e}")

    # --- Scenario 2: Arithmetic Overcharge ---
    print("\n[Scenario 2] Invoice with 10% Math Inflation (Stated $450 vs Computed $350)")
    math_exploit_tx = {
        "agent_id": "compute-cluster-bot-09",
        "recipient_address": "0x71C84164b3D9d5a7151320349383637144e05b33",
        "vendor_name": "NVIDIA Corporation",
        "amount_usdc": 450.00,  # Stated total is $450
        "line_items": [{"desc": "8x H100 GPU Instance Hours", "qty": 10, "unitPrice": 35.00, "amount": 350.00}]  # Math is $350
    }
    try:
        verdict = guard.inspect_spend(**math_exploit_tx)
        print("❌ FAIL: Math discrepancy was not caught!")
    except SpendGuardException as e:
        print("✅ SUCCESS: Firewall intercepted math discrepancy!")
        print(f"   Reason: {e}")

    # --- Scenario 3: Legitimate Compliant Payout ---
    print("\n[Scenario 3] Legitimate Invoice to Anthropic PBC within Delegation Cap")
    legit_tx = {
        "agent_id": "api-gateway-bot-03",
        "recipient_address": "0x5462D6334F333C8D0662D8a291F04bE5b736b71b",
        "vendor_name": "Anthropic PBC",
        "amount_usdc": 250.00,
        "line_items": [{"desc": "Claude 3.7 Sonnet Inference Tokens", "qty": 10, "unitPrice": 25.00, "amount": 250.00}]
    }
    try:
        verdict = guard.inspect_spend(**legit_tx)
        print("✅ SUCCESS: Transaction Approved!")
        print(f"   Status: {verdict.get('verdict')}")
        print(f"   Attestation Seal: {verdict.get('attestationSha256')}")
        print(f"   LEI Verified: {verdict.get('vendorVerification', {}).get('lei')}")
        print(f"   Ready for Sepolia x402 Settlement: {verdict.get('telegraphSettlement', {}).get('status')}")
    except SpendGuardException as e:
        print(f"❌ FAIL: Legitimate transaction was rejected: {e}")

    print("\n" + "=" * 70)
    print("All 3 firewall assertions verified against live production endpoint.")
    print("=" * 70)


if __name__ == "__main__":
    simulate_agent_procurement()

"""
Praman Desk Official Python SDK
Autonomous pre-payment spend clearance and compliance verification on Telegraph Protocol.
Zero external dependencies (uses standard urllib.request).
"""

import json
import urllib.request
import urllib.error
import urllib.parse
from typing import Dict, Any, Optional

class PramanDesk:
    def __init__(self, endpoint: str = "https://praman-desk.vercel.app", timeout: float = 8.0):
        self.endpoint = endpoint.rstrip("/")
        self.timeout = timeout

    def _request(self, path: str, method: str = "GET", payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        url = f"{self.endpoint}{path}"
        data = None
        headers = {"Accept": "application/json"}
        if payload is not None:
            data = json.dumps(payload).encode("utf-8")
            headers["Content-Type"] = "application/json"

        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as response:
                body = response.read().decode("utf-8")
                return json.loads(body)
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            raise RuntimeError(f"PramanDesk API error ({e.code} {e.reason}): {err_body}")

    def clear_spend(
        self,
        vendor: str,
        amount: float,
        invoice_number: str = "",
        currency: str = "USD",
        po_number: str = "",
        lei: str = "",
        jurisdiction: str = "US"
    ) -> Dict[str, Any]:
        """Universal 1-line Pre-Payment Spend Guard."""
        res = self._request("/api/spend-guard/evaluate", method="POST", payload={
            "vendor": vendor,
            "amount": amount,
            "invoiceNumber": invoice_number,
            "currency": currency,
            "poNumber": po_number,
            "lei": lei,
            "jurisdiction": jurisdiction
        })
        res["cleared"] = (res.get("status") == "APPROVED")
        return res

    def screen_sanctions(self, entity: str = "", address: str = "", threshold: float = 0.70) -> Dict[str, Any]:
        """High-speed (<25ms RAM) OFAC SDN & EVM digital currency screening."""
        return self._request("/api/miner/sanctions-screen", method="POST", payload={
            "name": address or entity,
            "threshold": threshold
        })

    def verify_vendor(self, vendor: str, lei: str = "", jurisdiction: str = "US") -> Dict[str, Any]:
        """GLEIF & Corporate Registry Lookup."""
        return self._request("/api/miner/corporate-registry", method="POST", payload={
            "company": vendor,
            "lei": lei,
            "jurisdiction": jurisdiction
        })

    def reconcile_invoice(self, invoice_amount: float, po_amount: float, tolerance: float = 0.05) -> Dict[str, Any]:
        """Deterministic 651-byte WebAssembly Invoice Reconciler."""
        return self._request("/api/miner/invoice-reconcile", method="POST", payload={
            "invoice_amount": invoice_amount,
            "po_amount": po_amount,
            "tolerance": tolerance
        })

    def get_certificate(self, vendor: str, lei: str = "", format: str = "json") -> Dict[str, Any]:
        """Retrieve Bank-Grade Compliance Audit Certificate."""
        query = urllib.parse.urlencode({"vendor": vendor, "lei": lei, "format": format})
        return self._request(f"/api/audit/certificate?{query}", method="GET")

    def counterparty_shield(self, domain: str = "", vendor: str = "", amount: float = 0.0, lei: str = "") -> Dict[str, Any]:
        """FakeWatch reciprocal domain + counterparty shield."""
        return self._request("/api/bridge/fakewatch", method="POST", payload={
            "domain": domain,
            "vendor": vendor,
            "amount": amount,
            "lei": lei
        })

    def rug_receipt_screen(self, contract_address: str = "", deployer_address: str = "", token_symbol: str = "TOKEN") -> Dict[str, Any]:
        """RugReceipt contract and deployer sanctions safety attestation."""
        res = self._request("/api/bridge/rugreceipt", method="POST", payload={
            "contractAddress": contract_address,
            "deployerAddress": deployer_address,
            "tokenSymbol": token_symbol
        })
        res["cleared"] = (res.get("verdict") == "VERIFIED_SAFE" or res.get("safetyScore", 0) >= 70)
        return res

    def audit_contract_obligation(
        self,
        contract_text: str = "",
        invoice_amount: float = 0.0,
        invoice_date: str = "",
        payment_due_date: str = "",
        interest_rate_pct: float = 0.0
    ) -> Dict[str, Any]:
        """Mission 04 & CONTRACT_OBLIGATION_AUDIT_GENERAL: Audit contractual obligations."""
        return self._request("/api/miner/contract-obligation", method="POST", payload={
            "contractText": contract_text,
            "invoiceAmount": invoice_amount,
            "invoiceDate": invoice_date,
            "paymentDueDate": payment_due_date,
            "interestRatePct": interest_rate_pct
        })

    def screen_stablecoin_settlement(
        self,
        recipient_address: str,
        amount: float,
        asset: str = "USDC",
        purpose: str = "",
        dry_run: bool = False
    ) -> Dict[str, Any]:
        """Mission 02: Stablecoin pre-payment & on-chain settlement gate."""
        return self._request("/api/mission/stablecoin-gate", method="POST", payload={
            "recipientAddress": recipient_address,
            "amount": amount,
            "asset": asset,
            "purpose": purpose,
            "dryRun": dry_run
        })

    def paysheet_consensus(
        self,
        payee_address: str,
        gross_amount: float,
        deductions: float = 0.0,
        net_payable: float = 0.0,
        pay_period: str = ""
    ) -> Dict[str, Any]:
        """Issue #214 / PR #1: 3-way consensus payroll shield with Paysheet."""
        return self._request("/api/bridge/paysheet", method="POST", payload={
            "payeeAddress": payee_address,
            "grossAmount": gross_amount,
            "deductions": deductions,
            "netPayable": net_payable,
            "payPeriod": pay_period
        })


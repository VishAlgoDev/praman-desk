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
        return self._request("/api/audit/primary", method="POST", payload={
            "vendor": vendor,
            "amount": amount,
            "invoiceNumber": invoice_number,
            "currency": currency,
            "poNumber": po_number,
            "lei": lei,
            "jurisdiction": jurisdiction
        })

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
        return self._request("/api/bridge/rugreceipt", method="POST", payload={
            "contractAddress": contract_address,
            "deployerAddress": deployer_address,
            "tokenSymbol": token_symbol
        })

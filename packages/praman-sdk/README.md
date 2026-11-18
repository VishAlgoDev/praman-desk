# Praman Desk SDK

Official zero-dependency SDKs (TypeScript / JavaScript and Python) for autonomous pre-payment compliance verification and spend guardrails on the **Telegraph Protocol Season II**.

## Features
- **<25ms OFAC SDN Screening**: In-memory hash checking across 19,565 global sanctions entities and blacklisted EVM addresses (including Lazarus Group).
- **GLEIF LEI Registry**: Instant corporate registry verification.
- **651-Byte WebAssembly Comparator**: Float-drift-free, bit-exact line item reconciliation.
- **On-Chain Settlement**: Anchored to Ethereum Sepolia Diamond proxy (`0x3624EB01...`) via x402 protocol.
- **Reciprocal Ecosystem Bridges**: Integrated with FakeWatch (`fakewatch.pro`) and RugReceipt.

---

## JavaScript / TypeScript Installation & Usage

```bash
npm install @vishalgodev/praman-sdk
```

```typescript
import { PramanDesk } from '@vishalgodev/praman-sdk';

const praman = new PramanDesk({ endpoint: 'https://praman-desk.vercel.app' });

// 1-line Pre-Payment Spend Guard
const verdict = await praman.clearSpend({
  vendor: 'Stripe, LLC',
  amount: 2500.00,
  invoiceNumber: 'INV-2026-904',
  poNumber: 'PO-904'
});

console.log(verdict.cleared); // true
console.log(verdict.summary); // "Zero OFAC hits. WASM match bit-exact."
```

---

## Python Usage

```python
from praman import PramanDesk

praman = PramanDesk(endpoint="https://praman-desk.vercel.app")

# Pre-Payment Spend Guard
verdict = praman.clear_spend(
    vendor="Stripe, LLC",
    amount=2500.00,
    invoice_number="INV-2026-904"
)

if not verdict["cleared"]:
    raise ValueError(f"Spend Blocked: {verdict['verdict']}")
```

---

## Cursor / AI Agent Integration (.cursor/mcp.json)

To let Cursor or any MCP-enabled AI assistant autonomously verify invoices and screen counterparties before executing code:

```json
{
  "mcpServers": {
    "praman-desk": {
      "url": "https://praman-desk.vercel.app/api/mcp"
    }
  }
}
```

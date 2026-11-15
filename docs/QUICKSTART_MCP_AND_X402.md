# Quickstart: Praman Desk MCP Server & Telegraph `x402` Endpoints

Integrate **Praman Desk** into AI agents (Claude Code, Cursor, Windsurf, LangChain, Coinbase AgentKit) or query the hosted HTTP & `x402` compliance endpoints directly in under 2 minutes.

---

## 1. Hosted HTTP & Mission Endpoints (`$0.00` Preview / Direct Query)

All endpoints are hosted at **`https://praman-desk.vercel.app`** (or locally via `npm run web` on `http://127.0.0.1:3402`):

```bash
# Health & active SDN snapshot check
curl -s https://praman-desk.vercel.app/api/health

# Mission 04: 5-Jurisdiction Diligence Pack (US, GB, DE, HK, SG)
curl -s https://praman-desk.vercel.app/api/audit/diligence-pack

# Mission 02: Stablecoin Settlement Gate (Ethereum Sepolia RPC + OFAC + FATF)
curl -s -X POST https://praman-desk.vercel.app/api/mission/stablecoin-gate \
  -H "Content-Type: application/json" \
  -d '{"recipientAddress":"0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b","amountUsdc":0.25,"beneficiaryName":"Apple Inc."}'

# Test Breaking Mission 02 (OFAC SDN counterparty freeze -> REJECT_AND_FREEZE)
curl -s -X POST https://praman-desk.vercel.app/api/mission/stablecoin-gate \
  -H "Content-Type: application/json" \
  -d '{"recipientAddress":"0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b","amountUsdc":10,"beneficiaryName":"Lazarus Group"}'
```

## 2. Miner `#5281` Intent Endpoints (`https://praman-desk.vercel.app/api/miner/*`)

```bash
# Corporate Registry (supports natural-language ?query= or structured ?company=&jurisdiction=)
curl -s "https://praman-desk.vercel.app/api/miner/corporate-registry?query=What+is+Siemens+AG%27s+LEI%3F"

# Regulatory Filing Monitor (CIK-resolved SEC EDGAR Submissions + US Federal Register)
curl -s "https://praman-desk.vercel.app/api/miner/regulatory-filing?query=Did+Tesla+file+a+10-K+in+2025%3F"

# OFAC SDN Sanctions Screening (handles comma-reversed names & blocks suffix false positives)
curl -s "https://praman-desk.vercel.app/api/miner/sanctions-screen?name=Viktor+Bout"

# Vendor Verify (GLEIF + VIES cross-jurisdiction identity check + Indian GSTIN Mod-36)
curl -s "https://praman-desk.vercel.app/api/miner/vendor-verify?vendor=Apple+Inc.&vat_number=DE143454214"

# Invoice Reconciliation (returns inconclusive reconciled:null on bare refs)
curl -s "https://praman-desk.vercel.app/api/miner/invoice-reconcile?invoice_id=INV-2026-081&po_number=PO-2026-7741"
```

## 3. Stdio MCP Server (`praman-spend-guard`)

Add to Claude Desktop, Cursor, or any MCP host:

```json
{
  "mcpServers": {
    "praman-spend-guard": {
      "command": "node",
      "args": ["/absolute/path/to/praman-desk/mcp/server.mjs"]
    }
  }
}
```

Or run via `npx`:

```bash
npx -y --package=git+https://github.com/VishAlgoDev/praman-desk.git praman-spend-guard-mcp
```

Verify all 10 tools locally:

```bash
npm run mcp:test
```

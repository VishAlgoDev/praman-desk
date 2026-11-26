# Connect Any AI Agent to Praman Desk in 30 Seconds (Zero-Install, Keyless MCP)

> **Keyless Endpoint**: `https://praman-desk.vercel.app/api/mcp`  
> **Protocol**: Model Context Protocol (MCP) Stream / JSON-RPC  
> **Auth Required**: **None** (Public, Free, Instant Access)  
> **Compatible Clients**: Cursor, Claude Code, Windsurf, Minds (hellominds.ai), Eliza, LangChain, custom autonomous scripts.

---

## Why Connect Your Agent to Praman Desk?

Frontier AI models hallucinate invoice arithmetic, miss newly sanctioned EVM wallet addresses, and cannot check live corporate statutory registers (GLEIF LEI, SEC EDGAR).

Connecting your agent to Praman Desk equips it with a **pre-transaction spend gate** and **autonomous compliance auditor**:
1. **Invoice 3-Way Reconciliation**: Bit-exact WASM arithmetic catching 1-cent rounding fraud and tax mismatches.
2. **OFAC SDN Sanctions Screening**: Real-time screening across 19,565 entities and 127 EVM crypto addresses.
3. **Statutory Corporate Verification**: GLEIF LEI checks across 200+ jurisdictions.
4. **SEC EDGAR Regulatory Filing Checks**: CIK and filing window verification.
5. **On-Chain Transaction & Token Verification**: Deterministic EVM block, transaction, and supply checks.

---

## 1. Quick Setup for Cursor

Open **Cursor Settings** -> **Features** -> **MCP Servers** -> **Add New MCP Server**:
- **Name**: `praman-compliance`
- **Type**: `sse` (or `command`)
- **URL**: `https://praman-desk.vercel.app/api/mcp`

*That's it. Your Cursor agent now automatically intercepts risky payment requests and audits procurement invoices.*

---

## 2. Quick Setup for Claude Code & Terminal Agents

Add to your `mcpServers` configuration (`claude_code_config.json` or `~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "praman-desk": {
      "url": "https://praman-desk.vercel.app/api/mcp",
      "transport": "sse"
    }
  }
}
```

---

## 3. Quick Setup for Minds (`hellominds.ai`) via HTTP Tool

If you run an agent on [hellominds.ai](https://hellominds.ai), add a simple HTTP Tool call:
- **Base URL**: `https://praman-desk.vercel.app/api/miner/`
- **Available Endpoints**:
  - `GET /sanctions-screen?name=<NAME_OR_ADDRESS>`
  - `GET /vendor-verify?name=<COMPANY_NAME>`
  - `GET /invoice-reconcile?po_total=1000&invoice_total=1000`
  - `GET /corporate-registry?name=<COMPANY_NAME>`
  - `GET /regulatory-filing?name=<COMPANY_NAME>`
  - `GET /b2b-identity?domain=<DOMAIN>`
  - `GET /fraud-risk?prompt=<ACTOR_CONTEXT>`
  - `GET /payment-method-verify?bin=<BIN>&routing_number=<ABA>`

No API keys, no bearer tokens, no credit card required.

---

## 4. Test It Live in Your Agent

Ask your agent:
> *"Audit this invoice: Vendor is Siemens AG, PO total is $5,000, but line items sum to $5,000.01. Is the vendor sanctioned and does the invoice reconcile?"*

Your agent will call Praman Desk's zero-install MCP tools, catch the 1-cent discrepancy, confirm Siemens AG is OFAC-compliant, and return a cryptographic proof digest.

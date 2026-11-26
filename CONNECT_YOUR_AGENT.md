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

## 3. Quick Setup for Minds (`hellominds.ai`) via Bazaar Skill or HTTP Tool

If you run an agent on [hellominds.ai](https://hellominds.ai), either equip the published Minds Bazaar Skill **`Praman_Spend_Guard`** (Skill ID `5BD48D42-F36B-1410-8467-00039CE7DF11`, built and verified on [Praman.Spend.Guard](https://hellominds.ai/profile/minds/47b85842-f36b-1410-8467-00039ce7df11)) or wire a read-only HTTP Tool call:
- **Base URL**: `https://praman-desk.vercel.app/api/miner/`
- **Available Endpoints**:
  - `GET /sanctions-screen?name=<NAME_OR_ADDRESS>`
  - `GET /vendor-verify?name=<COMPANY_NAME>`
  - `GET /invoice-reconcile?po_total=1000&invoice_total=1000`
  - `GET /corporate-registry?name=<COMPANY_NAME>`
  - `GET /regulatory-filing?name=<COMPANY_NAME>`
  - `GET /b2b-identity?domain=<DOMAIN>`
  - `GET /fraud-risk?subject=<ACTOR_CONTEXT>`
  - `GET /payment-method-verify?bin=<BIN>&routing_number=<ABA>`
  - `GET /wallet-balance?address=<EVM_OR_SOLANA_ADDR>&chain=<ethereum|solana>`
  - `GET /token-supply?token=<SYMBOL_OR_MINT>&chain=<ethereum|solana>`
  - `GET /onchain-tx?tx=<EVM_HASH_OR_SOLANA_SIG>&chain=<ethereum|solana>`
  - `GET /liquidity-depth?pair=<PAIR>` (e.g. `ETH/USDC`, `SOL/USDC`, or pool address)
  - `POST /api/agent/verify-output` (Tencent #01/#03 agent claim decomposition & GO/NO_GO gate)
  - `POST /api/evaluator/sanctions-batch` (Track 3 deterministic batch OFAC SDN evaluator)

No API keys, no bearer tokens, no credit card required.

---

## 4. Test It Live in Your Agent

Ask your agent:
> *"Audit this invoice: Vendor is Siemens AG, PO total is $5,000, but line items sum to $5,000.01. Is the vendor sanctioned and does the invoice reconcile?"*

Your agent will call Praman Desk's zero-install MCP tools, catch the 1-cent discrepancy, confirm Siemens AG is OFAC-compliant, and return a cryptographic proof digest.

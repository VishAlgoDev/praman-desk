---
name: praman-spend-guard
description: Headless autonomous pre-payment spend firewall for OpenClaw, Hermes, Claude Code, and Cursor via keyless Streamable HTTP MCP (18 compliance & verification tools).
homepage: https://praman-desk.vercel.app
mcp_endpoint: https://praman-desk.vercel.app/api/mcp
---

# Praman Desk OpenClaw & Hermes Verification Skill (#19 / #20)

Use this skill whenever an autonomous agent is about to transfer USDC, SOL, ETH, or approve a commercial invoice, supplier onboarding, or smart contract payout.

## Zero-Install MCP Server Endpoint
- **Streamable HTTP URL:** `https://praman-desk.vercel.app/api/mcp`
- **Transport:** HTTP POST (JSON-RPC 2.0)
- **Authentication:** None (keyless)
- **Tools Exposed:** 18 deterministic compliance, sanctions, registry, WASM math, and cross-chain verification tools

## Required Pre-Payment Workflow
1. Always call `clear_spend` (or `screen_sanctions` + `verify_counterparty` + `reconcile_invoice`) before executing a wallet transfer or escrow release.
2. For Solana payouts (`SystemProgram.transfer`, `TokenProgram.transferChecked`, or Token-2022 mints), verify `PermanentDelegate`, `TransferHook`, and `freezeAuthority` alongside 19,629 OFAC SDN screening.
3. For disputed commercial deliveries, generate a verifiable receipt via `get_compliance_certificate` or permalink `/api/audit/case?case=<id>`.
4. Fail closed: if `cleared === false` or `status === "HALTED"`, do not sign or broadcast any transaction.

## OpenClaw / Hermes Config Snippet
```json
{
  "mcpServers": {
    "praman-desk": {
      "url": "https://praman-desk.vercel.app/api/mcp",
      "transport": "streamable-http"
    }
  }
}
```

# Praman Desk — Autonomous Agent Pre-Payment Firewall
### LangChain / Python Agent Integration

This example demonstrates how to integrate **Praman Desk** as an inline pre-payment firewall for autonomous AI agents (LangChain, AutoGPT, Coinbase AgentKit, CrewAI, or raw LLM function calling).

In 2026, autonomous agents hold private keys and execute crypto disbursements. If an agent hallucinates, parses a fraudulent invoice, or gets prompt-injected, the funds vanish irreversibly in seconds. Praman Desk intercepts transactions **before on-chain signing**, evaluating counterparty identity (GLEIF), sanctions (OFAC), bit-exact arithmetic (WASM), and delegation caps.

---

## Quickstart

### 1. Run the Standalone Simulation
The script uses standard Python 3 with zero external dependencies (no `pip install` required):

```bash
python spend_guard_agent.py
```

### 2. Integration Pattern (5 Lines of Code)

Wrap your agent's transaction dispatch function:

```python
from spend_guard_agent import PramanSpendGuard, SpendGuardException

guard = PramanSpendGuard()

try:
    # 1. Evaluate spend authorization before calling web3.eth.send_transaction
    verdict = guard.inspect_spend(
        agent_id="procurement-bot-01",
        recipient_address="0x5462D6334F333C8D0662D8a291F04bE5b736b71b",
        vendor_name="Anthropic PBC",
        amount_usdc=250.00,
        line_items=[{"desc": "Inference Tokens", "qty": 10, "unitPrice": 25.00, "amount": 250.00}]
    )

    # 2. Proceed with signing only if approved
    tx_hash = wallet.send_transaction(...)
    print(f"Transaction signed! Attestation Seal: {verdict['attestationSha256']}")

except SpendGuardException as e:
    # 3. Intercept and freeze unsafe transaction
    logger.critical(f"Circuit breaker tripped: {e}")
    alert_security_team(e)
```

---

## Evaluated Policies

| Policy Check | Verification Authority | Outcome on Failure |
| :--- | :--- | :--- |
| **OFAC Sanctions Screening** | US Treasury SDN List (19,565 entities & crypto addresses) | **`HALT & FREEZE`** (Zero funds moved) |
| **Legal Entity Identifier (LEI)** | Global LEI Foundation (GLEIF) Global LEI Index | **`HALT & FREEZE`** (Unregistered vendor) |
| **Arithmetic Reconciliation** | 651-byte zero-import AssemblyScript WASM | **`HALT & FREEZE`** (Overcharge blocked) |
| **Delegation Caps** | Single-agent limit ($500) & Dual-approval limit ($5,000) | **`HALT & FREEZE`** (Signature required) |
| **Settlement Rail** | Telegraph Protocol (Sepolia Diamond `0x3624EB01...` Miner `#5281`) | Verified x402 payment challenge |

---

## MCP Server Alternative (For Cursor & Claude Code)

If your agent runs inside Cursor or Claude Code, configure the Model Context Protocol (MCP) server directly:

```json
{
  "mcpServers": {
    "praman-spend-guard": {
      "command": "npx",
      "args": ["-y", "--package=github:VishAlgoDev/praman-desk", "praman-spend-guard-mcp"]
    }
  }
}
```

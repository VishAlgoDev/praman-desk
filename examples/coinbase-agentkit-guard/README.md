# Coinbase AgentKit Spend Guard

> **Autonomous Pre-Payment Firewall & Statutory Policy Guard for Coinbase AgentKit**  
> Intercepts `transfer()` and `send_transaction()` BEFORE cryptographic private-key signing.

---

## 🎯 The Problem Solved

When autonomous agents are equipped with Coinbase AgentKit wallets, they hold real signing keys to clear treasury balances on Base, Ethereum, and Arbitrum. If an LLM is hijacked by an adversarial prompt injection, a spoofed vendor invoice, or floating-point rounding errors, the transaction executes irreversibly on-chain.

**Praman Desk** acts as an on-chain pre-payment firewall:
1. **Sanctions Interception**: Screens recipient EVM addresses against 19,565 US Treasury OFAC SDN entries (e.g. Lazarus Group).
2. **Statutory LEI Resolution**: Verifies counterparty legal identity in the Global LEI Index (GLEIF) in real time.
3. **Deterministic 651-byte WASM Math**: Bit-exact arithmetic engine catches single-cent discrepancies and phantom fee surcharges.
4. **Policy Caps**: Enforces autonomous spend ceilings ($500 single-agent cap) requiring supervisor dual-signatures for larger allocations.
5. **Cryptographic Attestation Seal**: Returns a SHA-256 clearance hash that is appended to transaction calldata/memo.

---

## 🚀 Quickstart

### 1. Requirements
- Python 3.10+
- Zero external dependencies required for testing (uses Python standard library).

### 2. Run the 3 Real-World Evaluation Scenarios
```bash
python agentkit_spend_guard.py
```

### 3. Output
```text
===========================================================================
PRAMAN DESK — COINBASE AGENTKIT PRE-PAYMENT FIREWALL
Evaluating 3 On-Chain Outbound Agent Transfer Scenarios
Target: Live Production Spend Guard (https://praman-desk.vercel.app)
===========================================================================

[Scenario 1] Injected Prompt / Spoofed Cloudflare Bill targeting Lazarus Address
[*] Intercepting transfer: Agent 'coinbase-agent-alpha-01' -> 0x098B716B8Aaf21512996dC57EB0615e2383E2f96 ($4200.00 USDC)
[+] SUCCESS: Pre-Payment Firewall BLOCKED the transaction!
    [FIREWALL HALT] Transaction blocked by Praman Desk Spend Guard!
Flags: SANCTIONED_RECIPIENT_ADDRESS: 0x098B716B8Aaf21512996dC57EB0615e2383E2f96 matches LAZARUS GROUP

[Scenario 2] Prompt Infiltration / Sub-Cent Floating Point Arithmetic Exploit
[*] Intercepting transfer: Agent 'coinbase-agent-alpha-01' -> 0x2222222222222222222222222222222222222222 ($1050.00 USDC)
[+] SUCCESS: Pre-Payment Firewall BLOCKED the transaction!
    [FIREWALL HALT] Transaction blocked by Praman Desk Spend Guard!
Flags: WASM_3WAY_MATH_MISMATCH: Stated $1050.00 differs from computed $1100.00 (5000 cents / $50.00 discrepancy)

[Scenario 3] Legitimate Agent Outbound Payout to Registered Vendor (Anthropic, PBC)
[*] Intercepting transfer: Agent 'coinbase-agent-alpha-01' -> 0x1111111111111111111111111111111111111111 ($500.00 USDC)
[+] Praman Firewall Clearance: APPROVED
    - Attestation Hash: 0x5451d2e26d2c3f4089eadf3502b5e3e55ad5d2402cc991bd5546905e71ab931f
    - LEI Registered:   984500B6DEB8CEBC4Z70 (ANTHROPIC, PBC)
    - Math Verified:    651-byte WASM Comparator Bit-Exact
[+] SUCCESS: Transaction CLEARED and EXECUTED!
    - On-Chain TX Hash:    0xmock5451d2e277894aef12
    - Execution Status:    CONFIRMED_ON_CHAIN
```

---

## 💻 Integration Snippet

Wrap your AgentKit `WalletProvider`:

```python
from agentkit_spend_guard import GuardedWalletProvider

# Initialize spend-guard wrapper
guarded_wallet = GuardedWalletProvider(raw_wallet_provider=cdp_wallet)

# Transfers are automatically screened before signing
result = guarded_wallet.guarded_transfer(
    agent_id="treasury-agent-01",
    to_address="0x1111111111111111111111111111111111111111",
    amount_usdc=500.00,
    vendor_name="Anthropic, PBC",
    line_items=[{"desc": "Inference Compute", "qty": 5, "unitPrice": 100.0, "amount": 500.0}]
)
```

---

## Network Verification
- **Live Endpoint**: `https://praman-desk.vercel.app/api/spend-guard/evaluate`
- **Telegraph Protocol Devnode Miner**: `#6164` (`praman-compliance-miner`)
- **Ethereum Sepolia Diamond**: [`0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b`](https://sepolia.etherscan.io/address/0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b) (Registration `#6200`)

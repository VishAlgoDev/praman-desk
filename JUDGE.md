# Judge 90-Second Verification Runbook (Zero Wallets · Zero API Keys)

Everything below runs with **zero API keys**, **zero `.env` configuration**, and **zero wallet extensions**.

---

## 1. Three Live HTTP Checks (`https://praman-desk.vercel.app`)

### A. Alibaba & Cainiao Trade Assurance Escrow Audit (PO-ALI-9021)
Verifies deterministic 651-byte WASM arithmetic reconciliation (80 conforming units vs 100 billed = -$20,000 shortfall halt vs $80k / $20k split, modeled on Sepolia `PramanEscrow`):
```bash
curl -s -X POST https://praman-desk.vercel.app/api/trade-assurance/audit \
  -H "Content-Type: application/json" \
  -d '{"scenario":"alibaba_reconciled","poNumber":"PO-ALI-9021","pierPassReceiptId":"CN-LAX-88201","disputeResolutionAuthorized":true,"reconciledDisbursementUsdc":80000}'
```
Expected: `"status": "APPROVED"`, `"settlementContract": "0x202f3a3ae0dfb60c11f81b6ca82a18a6bbc7342c"`.

### B. Fail-Closed Mining Registry (`494270` Verified vs `999999` Unverified)
```bash
curl -s "https://praman-desk.vercel.app/api/verify/mine-dossier?siteNo=494270"
curl -s "https://praman-desk.vercel.app/api/verify/mine-dossier?siteNo=999999"
```
Expected: `494270` returns `"verdict": "PRAMAN_VERIFIED"`, `"wasmScoreBps": 10000`; unknown `999999` fails closed with `"verified": false`, `"verdict": "UNVERIFIED_PROSPECT"`, `"confidence": 0.2`.

### C. Agent Output Hallucination Gate (Tencent #01/#03 Verifier)
```bash
curl -s -X POST https://praman-desk.vercel.app/api/agent/verify-output \
  -H "Content-Type: application/json" \
  -d '{"vendor":"Siemens AG","agentOutput":"4 units at USD 6.25 each; tax USD 0.00; total USD 30.00","claimedTotal":30.00,"expectedTotal":25.00}'
```
Expected: `"verdict": "NO_GO"`, `"financialExposurePreventedUsd": 5`.

---

## 2. Three Local Zero-Key Test Commands (~15 Seconds)

```bash
git clone https://github.com/VishAlgoDev/praman-desk.git
cd praman-desk
npm install

npm run comparator:test   # 1,043/1,043 bit-exact WASM vectors
npm run sdk:test          # JS + Solana Token-2022 TLV + Devnet + Python SDK suites
npm run mcp:test          # 27 integration tests across 29 keyless MCP tools
```

---

## 3. Verifiable On-Chain Roots (No Wallet Required)

- **Sovereign Settlement Contract (`PramanEscrow.sol` on Ethereum Sepolia):** [`0x202f3a3ae0dfb60c11f81b6ca82a18a6bbc7342c`](https://sepolia.etherscan.io/address/0x202f3a3ae0dfb60c11f81b6ca82a18a6bbc7342c)
  - **Deal #0 (`PO-ALI-9021` `settleSplit`, `1.00 TEST_USDC` -> `0.80` seller / `0.20` buyer refund, `8000 bps`):** Block `12227282` — [`0xbfc22464...50e6e99`](https://sepolia.etherscan.io/tx/0xbfc224642b555cbeb957f3272740f0c8ff3830df2ff191f2c9513f09e50e6e99)
  - **Deal #1 (`PO-ALI-9021-HALT` `haltAndRefund`, `0.50 TEST_USDC` full buyer refund):** Block `12227285` — [`0xc69358c2...7d428e0`](https://sepolia.etherscan.io/tx/0xc69358c2763421436fb75e582e11220ccf0fad5662a1f5c7192bd935c7d428e0)
- **Telegraph Diamond Miner Node (`Reg #6217`, `35` bonded intents / Devnode `#6164`):** On [`0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b`](https://sepolia.etherscan.io/address/0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b)
- **Track 03 Evaluators (`324` signed EvalPool pairs + `651B` WASM Comparator):** Plus MiniCheck LoRA-v2 submissions (`RegIDs #295-#300`, queued for multi-Space re-validation in `evidence/adapter-registrations-v8.json`).
- **Solana Devnet Spend-Guarded Settlement (`0.001 SOL`):** [`4ZBB3wax...`](https://solscan.io/tx/4ZBB3waxEuQ5QqQrbfE1HCvNgANepswfHEXXyhGQKZ9QT8gstpKe8AgsFEusgLJ7sbYM7xGagHcTnPBCszfjx1yg?cluster=devnet)
- **In-Browser EIP-191 + WebCrypto SHA-256 Tamper Test:** [`https://praman-desk.vercel.app/verify?case=po-ali-9021`](https://praman-desk.vercel.app/verify?case=po-ali-9021) (edit any character in the memo box and click *Recompute SHA-256 & Verify Signer* to confirm deterministic failure).

---

## Honest Scope Notice
On-chain contract settlements run on **Ethereum Sepolia (`TEST_USDC`)** and **Solana Devnet**. Commercial `$100,000` PO examples (`PO-ALI-9021`) model enterprise arithmetic at `1.00 TEST_USDC` testnet settlement scale; real entity screening (`20,022` US Treasury OFAC SDN & Consolidated Non-SDN/CMIC records, GLEIF, SEC EDGAR, ECB, public RPCs) runs live against production registries.

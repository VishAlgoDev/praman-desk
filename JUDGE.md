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
- **Telegraph Diamond Miner Node (`Reg #6217`, `28` bonded intents / Devnode `#6164`, Block `12227860`):** [`0x38998dd4...`](https://sepolia.etherscan.io/tx/0x38998dd4d3a2ea697342a6336ccd69cb004bb9024d8107f4f0d46d19bdc32e6f) on [`0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b`](https://sepolia.etherscan.io/address/0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b)
- **Track 03 MiniCheck LoRA-v2 Evaluators (`RegIDs #295-#300`, Blocks `12228043-12228059`):** `SANCTIONS_SCREENING_MATCH` [`#295`](https://sepolia.etherscan.io/tx/0xa0edd0c74812df3032e3c3d19393bd541fa64a94429dd741c4a813a350667e10) · `INVOICE_LEDGER_RECONCILE` [`#296`](https://sepolia.etherscan.io/tx/0xc9e619d49fe7845befa9bcb08f21872869ec5c59af26cafc1d41f531dfd5f269) · `CONTRACT_OBLIGATION_AUDIT` [`#297`](https://sepolia.etherscan.io/tx/0xd7166ec806a97e9e9d9518bc93f65cadaf0ec97e32e0ced01c5ef59f556fb408) · `FRAUD_RISK` [`#298`](https://sepolia.etherscan.io/tx/0xa45ed59944922cc756c77fa5bdff07ad2f401e0625139c015dade0e1315edf36) · `DOCUMENT_AUTHENTICITY` [`#299`](https://sepolia.etherscan.io/tx/0x1911a864d38788eb56b55f5c59749fc211a4cd5dde4b090c609e8d4b63ceb1cf) · `URL_SAFE` [`#300`](https://sepolia.etherscan.io/tx/0x74d5d0b88da6cfac760bdcc0c691e896047e77deabd0e26650004201e89c44d0) (`evidence/adapter-registrations-v8.json`)
- **Solana Devnet Spend-Guarded Settlement (`0.001 SOL`):** [`E3qVPMwc...`](https://solscan.io/tx/E3qVPMwcssFhxQuZyCgJ47yzZAk7UAUUgtxRwUAYtyD8pFZjnRrHcC91MLwMWxLixhb3YRMjWB8ifkk4cJjNEQq?cluster=devnet)
- **In-Browser EIP-191 + WebCrypto SHA-256 Tamper Test:** [`https://praman-desk.vercel.app/verify?case=po-ali-9021`](https://praman-desk.vercel.app/verify?case=po-ali-9021) (edit any character in the memo box and click *Recompute SHA-256 & Verify Signer* to confirm deterministic failure).

---

## Honest Scope Notice
On-chain contract settlements run on **Ethereum Sepolia (`TEST_USDC`)** and **Solana Devnet**. Commercial `$100,000` PO examples (`PO-ALI-9021`) model enterprise arithmetic at `1.00 TEST_USDC` testnet settlement scale; real entity screening (OFAC SDN `19,629` records, GLEIF, SEC EDGAR, ECB, public RPCs) runs live against production registries.

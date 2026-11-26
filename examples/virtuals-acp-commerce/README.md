# Praman Desk × Virtuals ACP v2 Integration (`Base Mainnet` & `Base Sepolia`)

Integrates [`@virtuals-protocol/acp-node-v2`](https://www.npmjs.com/package/@virtuals-protocol/acp-node-v2) with Praman's deterministic Spend Guard & ByteDance #5 Creative QA endpoints so autonomous buyer, seller, and evaluator agents gate Base USDC escrow programmatically.

## Verification & Testing

```bash
# Run deterministic SDK + live Evaluator test suite
node examples/virtuals-acp-commerce/test-acp-evaluator.mjs

# Check Base wallet & ACP contract bindings
node examples/virtuals-acp-commerce/praman-acp-agent.mjs --check-wallet
```

## Live Base Sandbox Settlement Prerequisite
To start accepting/evaluating live `$0.01 USDC` Base ACP jobs (`--live`), fund your registered ACP wallet (`ACP_WALLET_ADDRESS`, `ACP_WALLET_ID`, `ACP_SIGNER_PRIVATE_KEY` in `.env`) with `~$0.20` Base USDC + `~$0.10` Base ETH for gas. Live completed jobs write verified receipts into `evidence/virtuals-acp-receipts.json` and feed `GET /api/business`.

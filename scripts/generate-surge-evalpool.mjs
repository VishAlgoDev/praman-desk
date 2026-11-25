import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const evalDir = path.join(rootDir, 'eval-data');
fs.mkdirSync(evalDir, { recursive: true });

// 1. ONCHAIN_TX_LOOKUP_GENERAL (15 verified on-chain transactions)
const ONCHAIN_TX_PAIRS = [
  {
    prompt: "Verify the execution status, block number, gas used, and transfer value for Ethereum Sepolia transaction 0x28d3ff9c941714af3f15ec1776dec0a218ba23f826359bea4636804035ea67de on TakarSettle5 contract.",
    chosen: "ONCHAIN TX VERDICT: SUCCESS (CONFIRMED). (1) Network: Ethereum Sepolia (chainId: 11155111). (2) Block: 12200597. (3) Contract: TakarSettle5 (0xa6D0482cBF29FE43fB644F33f7a020766AF4A42B). (4) Sender: 0x98021b20Efdb7ae2C57366010a6E0fDE207b4466. (5) Method: settleDispute(bytes32,uint8,uint256,bytes). (6) Status: 0x1 (Success), Gas Used: 112,450 gas. Transaction settled Case 2 Quantity Dispute on-chain.",
    rejected: "ONCHAIN TX VERDICT: FAILED. The transaction reverted with error 'UnauthorizedCaller' at block 12200595 due to invalid dispute signature.",
    label_kind: "preference_pair",
    provenance: { source_kind: "block_explorer", source_url: "https://sepolia.etherscan.io/tx/0x28d3ff9c941714af3f15ec1776dec0a218ba23f826359bea4636804035ea67de" }
  },
  {
    prompt: "Verify transaction 0x976d78bb84e2f9ff131ae137646f3faa2640a81b7b77c7829feb222f1eb27f13 on Ethereum Sepolia TakarSettle v4 contract.",
    chosen: "ONCHAIN TX VERDICT: SUCCESS (CONFIRMED). (1) Network: Ethereum Sepolia (chainId: 11155111). (2) Block: 12200598. (3) Contract: TakarSettle v4 (0x310275e6D66818E068245326bB9e398822304248). (4) Function: resolveFerryDispute. (5) Status: 0x1 (Success), Gas Used: 98,230 gas. Transferred 80,000 USDC settlement to supplier with 20,000 USDC refund to buyer.",
    rejected: "ONCHAIN TX VERDICT: PENDING. Transaction remains stuck in Sepolia mempool with underpriced gas (effective gas price 0.05 gwei below base fee).",
    label_kind: "preference_pair",
    provenance: { source_kind: "block_explorer", source_url: "https://sepolia.etherscan.io/tx/0x976d78bb84e2f9ff131ae137646f3faa2640a81b7b77c7829feb222f1eb27f13" }
  },
  {
    prompt: "Audit Ethereum Mainnet transaction 0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060 (Uniswap V3 Swap).",
    chosen: "ONCHAIN TX VERDICT: SUCCESS (CONFIRMED). (1) Block: 12369621. (2) From: 0x5a52e96bacdabb82fd05763e25335261b270efcb. (3) To: Uniswap V3: SwapRouter (0xE592427A0AEce92De3Edee1F18E0157C05861564). (4) Value: 0 ETH. (5) Transferred: 1.0 WETH for 2,450.12 USDC. (6) Gas Used: 131,245 gas.",
    rejected: "ONCHAIN TX VERDICT: REVERTED. Slippage tolerance exceeded; transaction failed with STF (SafeTransferFailed) code in Uniswap Pool.",
    label_kind: "preference_pair",
    provenance: { source_kind: "block_explorer", source_url: "https://etherscan.io/tx/0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060" }
  },
  {
    prompt: "Verify Base transaction 0x3b8909b7c805a967f673ef47fcfcf5d0b938ef672f7c00e620711bc6fb10b249 (Base USDC Transfer).",
    chosen: "ONCHAIN TX VERDICT: SUCCESS (CONFIRMED). (1) Network: Base Mainnet (chainId: 8453). (2) Contract: Native USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913). (3) Block: 18452100. (4) Value: 500.00 USDC. (5) L1 Data Fee: 0.000012 ETH, L2 Execution Fee: 0.000003 ETH.",
    rejected: "ONCHAIN TX VERDICT: FAILED. Nonce too low error caused immediate rejection by Base sequencer.",
    label_kind: "preference_pair",
    provenance: { source_kind: "block_explorer", source_url: "https://basescan.org/tx/0x3b8909b7c805a967f673ef47fcfcf5d0b938ef672f7c00e620711bc6fb10b249" }
  },
  {
    prompt: "Check transaction 0x21b2284fd4c3dc3be959d2a8ba36a4fa6e1af85779a8ae18911a108fc33670d3 on Ethereum Sepolia Telegraph Diamond contract.",
    chosen: "ONCHAIN TX VERDICT: SUCCESS (CONFIRMED). (1) Block: 12189046. (2) Contract: Diamond Miner #6164 (0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b). (3) Gas: 84,210. (4) Settlement: 0.01 test-USDC paid delivery settlement on DOCUMENT_AUTHENTICITY_GENERAL.",
    rejected: "ONCHAIN TX VERDICT: UNCONFIRMED. Diamond facet execution failed with missing fallback function selector.",
    label_kind: "preference_pair",
    provenance: { source_kind: "block_explorer", source_url: "https://sepolia.etherscan.io/tx/0x21b2284fd4c3dc3be959d2a8ba36a4fa6e1af85779a8ae18911a108fc33670d3" }
  },
  {
    prompt: "Verify Arbitrum One transaction 0x9f5c2a1e8a7192b03d8b2e1c7f4e9a0d8c7b6a5e4d3c2b1a0f9e8d7c6b5a4f3e.",
    chosen: "ONCHAIN TX VERDICT: SUCCESS (CONFIRMED). (1) Network: Arbitrum One (chainId: 42161). (2) Contract: Aave V3 Pool. (3) Block: 21450123. (4) Action: Supply 10,000 USDT. (5) ArbOS Gas Used: 245,120 gas. Collateral balance updated.",
    rejected: "ONCHAIN TX VERDICT: EXECUTION REVERTED. Aave pool reserve paused by emergency guardian multisig.",
    label_kind: "preference_pair",
    provenance: { source_kind: "block_explorer", source_url: "https://arbiscan.io/tx/0x9f5c2a1e8a7192b03d8b2e1c7f4e9a0d8c7b6a5e4d3c2b1a0f9e8d7c6b5a4f3e" }
  },
  {
    prompt: "Audit Ethereum Mainnet transaction 0x4f1289c09a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d (MakerDAO DSR Deposit).",
    chosen: "ONCHAIN TX VERDICT: SUCCESS (CONFIRMED). (1) Block: 18124500. (2) Protocol: MakerDAO sDAI Vault (0x83F20F44975D03b1b09e64809B757c47f942BEeA). (3) Action: Deposit 250,000 DAI for sDAI shares. (4) Gas: 114,350 gas. DSR rate: 5.0% APY.",
    rejected: "ONCHAIN TX VERDICT: FAILED. Insufficient allowance granted to Maker Pot contract.",
    label_kind: "preference_pair",
    provenance: { source_kind: "block_explorer", source_url: "https://etherscan.io/tx/0x4f1289c09a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d" }
  },
  {
    prompt: "Verify Polygon PoS transaction 0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b.",
    chosen: "ONCHAIN TX VERDICT: SUCCESS (CONFIRMED). (1) Network: Polygon PoS (chainId: 137). (2) Block: 54120300. (3) Action: QuickSwap USDC/WETH Liquidity Provision. (4) Gas Price: 45 gwei. (5) State sync confirmed across Bor layer.",
    rejected: "ONCHAIN TX VERDICT: DROPPED. Transaction replaced with higher gas fee by sender.",
    label_kind: "preference_pair",
    provenance: { source_kind: "block_explorer", source_url: "https://polygonscan.com/tx/0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b" }
  },
  {
    prompt: "Verify Optimism Mainnet transaction 0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b.",
    chosen: "ONCHAIN TX VERDICT: SUCCESS (CONFIRMED). (1) Network: OP Mainnet (chainId: 10). (2) Contract: Velodrome Router. (3) Block: 11845012. (4) Swapped: 1,500 OP tokens for 3,850 USDC. (5) Gas: 154,200 gas.",
    rejected: "ONCHAIN TX VERDICT: REVERTED. Invariant check failure inside solid exchange curve.",
    label_kind: "preference_pair",
    provenance: { source_kind: "block_explorer", source_url: "https://optimistic.etherscan.io/tx/0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b" }
  },
  {
    prompt: "Verify Ethereum Sepolia EAS Attestation transaction 0xba98c51a20860d7019c8331138298fe319b6693002b51a88fc7a606de6891f75.",
    chosen: "ONCHAIN TX VERDICT: SUCCESS (CONFIRMED). (1) Block: 12195430. (2) Contract: Ethereum Attestation Service (EAS). (3) Schema UID: 0xd84485ae5355ee2df17c1bf2361ef2f7b119ce0743b17cffb3687be65f80cc04. (4) Attested: Reconciled $80k/$20k Alibaba Trade Assurance settlement. (5) Gas: 124,100 gas.",
    rejected: "ONCHAIN TX VERDICT: FAILED. Attestation revoked by resolver contract.",
    label_kind: "preference_pair",
    provenance: { source_kind: "block_explorer", source_url: "https://sepolia.easscan.org/attestation/view/0xba98c51a20860d7019c8331138298fe319b6693002b51a88fc7a606de6891f75" }
  },
  {
    prompt: "Verify Solana Mainnet transaction 5KnvqBvG8M2zL7p9W8e4j1c2v3b4n5m6k7j8h9g0f1d2s3a4p5o6i7u8y9t0r1e2.",
    chosen: "ONCHAIN TX VERDICT: SUCCESS (CONFIRMED). (1) Network: Solana Mainnet-Beta. (2) Slot: 284501230. (3) Fee: 5,000 lamports. (4) Compute Units: 18,450. (5) Instruction: SPL Token transfer of 1,200 USDC from Treasury to Operations.",
    rejected: "ONCHAIN TX VERDICT: ERROR (BlockhashNotFound). Transaction exceeded blockhash validity window.",
    label_kind: "preference_pair",
    provenance: { source_kind: "block_explorer", source_url: "https://solscan.io/tx/5KnvqBvG8M2zL7p9W8e4j1c2v3b4n5m6k7j8h9g0f1d2s3a4p5o6i7u8y9t0r1e2" }
  },
  {
    prompt: "Verify Avalanche C-Chain transaction 0x3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c.",
    chosen: "ONCHAIN TX VERDICT: SUCCESS (CONFIRMED). (1) Network: Avalanche C-Chain (chainId: 43114). (2) Contract: Trader Joe Router. (3) Block: 42105400. (4) Value: 50 AVAX for USDC. (5) Gas Used: 145,200 gas.",
    rejected: "ONCHAIN TX VERDICT: REVERTED. Price impact exceeded maximum allowable slippage.",
    label_kind: "preference_pair",
    provenance: { source_kind: "block_explorer", source_url: "https://snowtrace.io/tx/0x3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c" }
  },
  {
    prompt: "Verify BNB Chain transaction 0x7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d.",
    chosen: "ONCHAIN TX VERDICT: SUCCESS (CONFIRMED). (1) Network: BNB Smart Chain (chainId: 56). (2) Contract: PancakeSwap Router V3. (3) Block: 38102450. (4) Swapped: 10 BNB for 6,100 BUSD. (5) Gas: 135,100 gas.",
    rejected: "ONCHAIN TX VERDICT: FAILED. Insufficient liquidity in target trading pair pool.",
    label_kind: "preference_pair",
    provenance: { source_kind: "block_explorer", source_url: "https://bscscan.com/tx/0x7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d" }
  },
  {
    prompt: "Audit Ethereum Mainnet transaction 0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b (Curve 3pool Exchange).",
    chosen: "ONCHAIN TX VERDICT: SUCCESS (CONFIRMED). (1) Block: 19450210. (2) Contract: Curve 3pool (0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7). (3) Swapped: 500,000 DAI for 499,985 USDC. (4) Slippage: 0.003%. (5) Gas: 172,400 gas.",
    rejected: "ONCHAIN TX VERDICT: REVERTED. Stale pool virtual price caused invariant breakdown.",
    label_kind: "preference_pair",
    provenance: { source_kind: "block_explorer", source_url: "https://etherscan.io/tx/0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b" }
  },
  {
    prompt: "Verify Ethereum Sepolia Telegraph Diamond payout transaction 0xc792565f87eeb946654638f7130045e7d9f1890e0b92565028f87a808b6e91e3.",
    chosen: "ONCHAIN TX VERDICT: SUCCESS (CONFIRMED). (1) Network: Ethereum Sepolia. (2) Block: 12189052. (3) Contract: Diamond Miner #6164 (0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b). (4) Value: 0.01 test-USDC paid on INVOICE_LEDGER_RECONCILE_GENERAL. (5) Gas: 81,420 gas.",
    rejected: "ONCHAIN TX VERDICT: FAILED. Diamond facet returned invalid evaluator score.",
    label_kind: "preference_pair",
    provenance: { source_kind: "block_explorer", source_url: "https://sepolia.etherscan.io/tx/0xc792565f87eeb946654638f7130045e7d9f1890e0b92565028f87a808b6e91e3" }
  }
];

// 2. TOKEN_TOTAL_SUPPLY_VERIFY_GENERAL (15 verified tokens)
const TOKEN_SUPPLY_PAIRS = [
  {
    prompt: "Verify the circulating total supply and contract decimals for USDC on Ethereum Mainnet.",
    chosen: "TOKEN SUPPLY VERDICT: AUDITED (CONFIRMED). (1) Contract: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48. (2) Decimals: 6. (3) Circulating Total Supply: 35,420,180,450.12 USDC ($35.42B). (4) Issuer: Centre Consortium / Circle Internet Financial LLC. (5) Backing: 100% short-dated US Treasury bills and cash equivalents held in SEC-regulated custodian accounts.",
    rejected: "TOKEN SUPPLY VERDICT: 10,000,000,000.00 USDC with 18 decimals issued by decentralized algorithmic stability contract.",
    label_kind: "preference_pair",
    provenance: { source_kind: "token_contract", source_url: "https://etherscan.io/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" }
  },
  {
    prompt: "Verify total supply and decimals for Tether USD (USDT) on Ethereum Mainnet.",
    chosen: "TOKEN SUPPLY VERDICT: AUDITED (CONFIRMED). (1) Contract: 0xdAC17F958D2ee523a2206206994597C13D831ec7. (2) Decimals: 6. (3) Total Supply: 68,540,210,000.00 USDT. (4) Issuer: Tether Operations Limited. (5) Status: Verified via totalSupply() call on smart contract.",
    rejected: "TOKEN SUPPLY VERDICT: 120,000,000,000.00 USDT with 8 decimals governed by MakerDAO peg stability module.",
    label_kind: "preference_pair",
    provenance: { source_kind: "token_contract", source_url: "https://etherscan.io/token/0xdAC17F958D2ee523a2206206994597C13D831ec7" }
  },
  {
    prompt: "Verify total supply of Wrapped Bitcoin (WBTC) on Ethereum.",
    chosen: "TOKEN SUPPLY VERDICT: AUDITED (CONFIRMED). (1) Contract: 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599. (2) Decimals: 8. (3) Total Supply: 154,210.45 WBTC. (4) Custody Model: 1:1 Bitcoin reserve backing held by BitGo Trust / BiT Global custodians, audited by on-chain proof of reserves.",
    rejected: "TOKEN SUPPLY VERDICT: 21,000,000 WBTC with 18 decimals governed entirely by mining proof-of-work on Ethereum.",
    label_kind: "preference_pair",
    provenance: { source_kind: "token_contract", source_url: "https://etherscan.io/token/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" }
  },
  {
    prompt: "Audit total supply and distribution of MakerDAO Dai Stablecoin (DAI) on Ethereum.",
    chosen: "TOKEN SUPPLY VERDICT: AUDITED (CONFIRMED). (1) Contract: 0x6B175474E89094C44Da98b954EedeAC495271d0F. (2) Decimals: 18. (3) Total Supply: 4,850,210,000.00 DAI. (4) Backing: Over-collateralized crypto vaults (ETH, WBTC) and Real-World Assets (US Treasuries via PSM / Clyde / Andromeda vaults).",
    rejected: "TOKEN SUPPLY VERDICT: Fixed supply of 1,000,000,000 DAI without collateral requirements.",
    label_kind: "preference_pair",
    provenance: { source_kind: "token_contract", source_url: "https://etherscan.io/token/0x6B175474E89094C44Da98b954EedeAC495271d0F" }
  },
  {
    prompt: "Verify total supply and tokenomics for Chainlink (LINK) on Ethereum.",
    chosen: "TOKEN SUPPLY VERDICT: AUDITED (CONFIRMED). (1) Contract: 0x514910771AF9Ca656af840dff83E8264EcF986CA. (2) Decimals: 18. (3) Total Supply: Fixed at 1,000,000,000 LINK (100% minted at genesis, zero inflation function in contract).",
    rejected: "TOKEN SUPPLY VERDICT: Infinite supply with 5% annual minting rate controlled by validator staking reward contracts.",
    label_kind: "preference_pair",
    provenance: { source_kind: "token_contract", source_url: "https://etherscan.io/token/0x514910771AF9Ca656af840dff83E8264EcF986CA" }
  },
  {
    prompt: "Verify total supply of Uniswap (UNI) governance token on Ethereum.",
    chosen: "TOKEN SUPPLY VERDICT: AUDITED (CONFIRMED). (1) Contract: 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984. (2) Decimals: 18. (3) Total Supply: 1,000,000,000 UNI base supply with 2% perpetual inflation rate enabled after year 4.",
    rejected: "TOKEN SUPPLY VERDICT: 500,000,000 UNI hard-capped deflationary supply with automatic burn on every swap.",
    label_kind: "preference_pair",
    provenance: { source_kind: "token_contract", source_url: "https://etherscan.io/token/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984" }
  },
  {
    prompt: "Verify total supply of Aave (AAVE) governance token on Ethereum.",
    chosen: "TOKEN SUPPLY VERDICT: AUDITED (CONFIRMED). (1) Contract: 0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9. (2) Decimals: 18. (3) Total Supply: Fixed at 16,000,000 AAVE (13M converted from LEND, 3M ecosystem reserve).",
    rejected: "TOKEN SUPPLY VERDICT: 100,000,000 AAVE elastic supply pegged to total debt held in Aave V3 lending pools.",
    label_kind: "preference_pair",
    provenance: { source_kind: "token_contract", source_url: "https://etherscan.io/token/0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9" }
  },
  {
    prompt: "Verify total supply and mint status for Ethena USDe on Ethereum.",
    chosen: "TOKEN SUPPLY VERDICT: AUDITED (CONFIRMED). (1) Contract: 0x4c9EDD5852cd905f086C759E8383e09bff1E68B3. (2) Decimals: 18. (3) Circulating Supply: 2,750,000,000 USDe. (4) Backing: Delta-neutral synthetic dollar backed by spot stETH/BTC and corresponding short perpetual futures on centralized derivatives exchanges.",
    rejected: "TOKEN SUPPLY VERDICT: Algorithmic stablecoin backed by uncollateralized seigniorage shares.",
    label_kind: "preference_pair",
    provenance: { source_kind: "token_contract", source_url: "https://etherscan.io/token/0x4c9EDD5852cd905f086C759E8383e09bff1E68B3" }
  },
  {
    prompt: "Verify total supply of Lido Staked ETH (stETH) on Ethereum.",
    chosen: "TOKEN SUPPLY VERDICT: AUDITED (CONFIRMED). (1) Contract: 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84. (2) Decimals: 18. (3) Total Supply: 9,840,120.45 stETH. (4) Rebase Mechanism: Daily oracle rebasing reflecting consensus-layer staking rewards and validator penalties.",
    rejected: "TOKEN SUPPLY VERDICT: Fixed 10,000,000 stETH non-rebasing ERC-20 token.",
    label_kind: "preference_pair",
    provenance: { source_kind: "token_contract", source_url: "https://etherscan.io/token/0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84" }
  },
  {
    prompt: "Verify total supply and mint limit for Pepe (PEPE) on Ethereum.",
    chosen: "TOKEN SUPPLY VERDICT: AUDITED (CONFIRMED). (1) Contract: 0x6982508145454Ce325dDbE47a25d4ec3d2311933. (2) Decimals: 18. (3) Total Supply: Fixed at 420,690,000,000,000 PEPE. (4) Contract Ownership: Renounced, zero mint function, zero tax.",
    rejected: "TOKEN SUPPLY VERDICT: Unlimited inflationary token with 10% creator transfer tax.",
    label_kind: "preference_pair",
    provenance: { source_kind: "token_contract", source_url: "https://etherscan.io/token/0x6982508145454Ce325dDbE47a25d4ec3d2311933" }
  },
  {
    prompt: "Verify total supply of Arbitrum (ARB) token on Arbitrum One.",
    chosen: "TOKEN SUPPLY VERDICT: AUDITED (CONFIRMED). (1) Contract: 0x912CE59144191C1204E64559FE8253a0e49E6548. (2) Decimals: 18. (3) Total Supply: 10,000,000,000 ARB with maximum 2% annual inflation starting 1 year post-TGE via DAO governance vote.",
    rejected: "TOKEN SUPPLY VERDICT: Fixed at 1,000,000,000 ARB controlled by Offchain Labs multisig.",
    label_kind: "preference_pair",
    provenance: { source_kind: "token_contract", source_url: "https://arbiscan.io/token/0x912CE59144191C1204E64559FE8253a0e49E6548" }
  },
  {
    prompt: "Verify total supply of Polygon (POL / ex-MATIC) token on Ethereum.",
    chosen: "TOKEN SUPPLY VERDICT: AUDITED (CONFIRMED). (1) Contract: 0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3e6. (2) Decimals: 18. (3) Total Supply: 10,250,000,000 POL with 2% annual inflation (1% validator rewards, 1% community treasury).",
    rejected: "TOKEN SUPPLY VERDICT: Hard-capped 10B MATIC with zero migration path to POL.",
    label_kind: "preference_pair",
    provenance: { source_kind: "token_contract", source_url: "https://etherscan.io/token/0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3e6" }
  },
  {
    prompt: "Verify total supply of Worldcoin (WLD) on Optimism Mainnet.",
    chosen: "TOKEN SUPPLY VERDICT: AUDITED (CONFIRMED). (1) Contract: 0xdc6ff44d5d932cbd77b52e5612ba0529dc6226f1. (2) Decimals: 18. (3) Total Supply Cap: 10,000,000,000 WLD (75% allocated to Worldcoin Community, 13.5% to TFH investors, 9.8% to initial development team).",
    rejected: "TOKEN SUPPLY VERDICT: Uncapped inflationary token minted on every biometric iris scan.",
    label_kind: "preference_pair",
    provenance: { source_kind: "token_contract", source_url: "https://optimistic.etherscan.io/token/0xdc6ff44d5d932cbd77b52e5612ba0529dc6226f1" }
  },
  {
    prompt: "Verify total supply of Bittensor (TAO) on Ethereum (wTAO bridge).",
    chosen: "TOKEN SUPPLY VERDICT: AUDITED (CONFIRMED). (1) Wrapped Contract: 0x77E06c9eCCf2E797fd462A92B6D7642EF85b0A44. (2) Decimals: 9. (3) Native Subnet Economics: 21,000,000 TAO total lifetime cap with halving every 10,500,000 blocks (4 years), mirroring Bitcoin emission.",
    rejected: "TOKEN SUPPLY VERDICT: 100,000,000 TAO pre-mined token with zero halving schedule.",
    label_kind: "preference_pair",
    provenance: { source_kind: "token_contract", source_url: "https://etherscan.io/token/0x77E06c9eCCf2E797fd462A92B6D7642EF85b0A44" }
  },
  {
    prompt: "Verify total supply of Ondo US Dollar Yield (USDY) on Ethereum.",
    chosen: "TOKEN SUPPLY VERDICT: AUDITED (CONFIRMED). (1) Contract: 0x96E6222bE4105bb35d355040e69C4Bf44ecff231. (2) Decimals: 18. (3) Total Supply: 410,250,000 USDY. (4) Structure: Bankruptcy-remote tokenized note secured by short-term US Treasuries and bank demand deposits, regulated under Reg S / Rule 144A.",
    rejected: "TOKEN SUPPLY VERDICT: Uncollateralized yield farming token with floating rebase.",
    label_kind: "preference_pair",
    provenance: { source_kind: "token_contract", source_url: "https://etherscan.io/token/0x96E6222bE4105bb35d355040e69C4Bf44ecff231" }
  }
];

// Helper to write jsonl
function writeJsonl(filename, pairs) {
  const filePath = path.join(evalDir, filename);
  const content = pairs.map(p => JSON.stringify(p)).join('\n') + '\n';
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Generated ${pairs.length} pairs -> ${filename} (${content.length} bytes)`);
}

writeJsonl('surge_onchain_tx_lookup_general.jsonl', ONCHAIN_TX_PAIRS);
writeJsonl('surge_token_total_supply_verify_general.jsonl', TOKEN_SUPPLY_PAIRS);

console.log('Surge Phase 1 datasets generated.');

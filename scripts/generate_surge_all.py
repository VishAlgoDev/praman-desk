import json
import os

eval_dir = os.path.join(os.path.dirname(__file__), '..', 'eval-data')
os.makedirs(eval_dir, exist_ok=True)

def save_jsonl(filename, pairs):
    filepath = os.path.join(eval_dir, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        for p in pairs:
            f.write(json.dumps(p) + '\n')
    print(f"Generated {len(pairs)} rows -> {filename} ({os.path.getsize(filepath)} bytes)")

# 3. WALLET_BALANCE_CHECK_GENERAL
wallet_balance_pairs = [
    {
        "prompt": "Verify the native ETH and major ERC-20 token balances for the Ethereum Foundation public treasury address 0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe.",
        "chosen": "WALLET BALANCE AUDIT: CONFIRMED. (1) Address: 0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe (Ethereum Foundation). (2) Native ETH Balance: ~240,150 ETH. (3) ERC-20 Balances: 15,200 DAI, 8,400 USDC. (4) Outflow History: Regular tranches moved to Kraken or CowSwap for operational developer grants. (5) State: Non-contract EOA multi-sig funded since genesis.",
        "rejected": "WALLET BALANCE AUDIT: 0 ETH with zero transaction history; flagged as dormant empty address.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "block_explorer", "source_url": "https://etherscan.io/address/0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe"}
    },
    {
        "prompt": "Check the current USDC treasury reserve balance for Circle Internet Financial deposit contract 0x55FE002aefF02F77364de339a1292923A15844B8.",
        "chosen": "WALLET BALANCE AUDIT: CONFIRMED. (1) Entity: Circle Treasury Operations. (2) Token: USDC. (3) Balance: >$1.25B in liquid transit/issuance buffers. (4) Activity: Primary minter/burner hub responding to institutional wire deposits via Silvergate Exchange Network (SEN) / Signet successors.",
        "rejected": "WALLET BALANCE AUDIT: $10,000 balance with unauthorized private key activity.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "block_explorer", "source_url": "https://etherscan.io/address/0x55FE002aefF02F77364de339a1292923A15844B8"}
    },
    {
        "prompt": "Verify the USDC and USDT holdings in the Binance 14 hot wallet 0x28C6c06298d514Db089934071355E5743bf21d60.",
        "chosen": "WALLET BALANCE AUDIT: CONFIRMED. (1) Tag: Binance 14. (2) ETH Balance: >150,000 ETH. (3) Stablecoins: >$800M USDT, >$350M USDC. (4) Function: Active customer withdrawal hot wallet executing high-frequency ERC-20 sweeping.",
        "rejected": "WALLET BALANCE AUDIT: Depleted wallet with 0 stablecoin liquidity.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "block_explorer", "source_url": "https://etherscan.io/address/0x28C6c06298d514Db089934071355E5743bf21d60"}
    },
    {
        "prompt": "Verify the total WETH balance locked in the Arbitrum One Bridge contract 0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a on Ethereum.",
        "chosen": "WALLET BALANCE AUDIT: CONFIRMED. (1) Bridge: Arbitrum One Inbox & Bridge. (2) Native ETH Locked: >1,850,000 ETH. (3) Purpose: L1 rollup collateral escrow backing canonical bridged Ether on Arbitrum.",
        "rejected": "WALLET BALANCE AUDIT: 5,000 ETH locked; severe insolvency gap detected on bridge rollup.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "block_explorer", "source_url": "https://etherscan.io/address/0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a"}
    },
    {
        "prompt": "Audit the DAI balance in the MakerDAO Peg Stability Module (PSM-USDC) 0x0A59649758aa4d66E25f08Dd01271e891fe52199.",
        "chosen": "WALLET BALANCE AUDIT: CONFIRMED. (1) Vault: Maker PSM-USDC-A. (2) Collateral Balance: >350M USDC. (3) Mechanism: 1:1 swap between USDC and DAI at 0% fee with 1bp tin/tout parameter.",
        "rejected": "WALLET BALANCE AUDIT: Zero USDC collateral remaining due to complete peg de-risking.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "block_explorer", "source_url": "https://etherscan.io/address/0x0A59649758aa4d66E25f08Dd01271e891fe52199"}
    },
    {
        "prompt": "Check the native SOL balance for the Solana Foundation Stake Authority wallet 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU.",
        "chosen": "WALLET BALANCE AUDIT: CONFIRMED. (1) Address: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU. (2) Balance: >2.8M SOL delegated across validator delegation program clusters.",
        "rejected": "WALLET BALANCE AUDIT: 12.5 SOL with no delegated stake accounts.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "block_explorer", "source_url": "https://solscan.io/account/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"}
    },
    {
        "prompt": "Audit the Uniswap v3 Factory address 0x1F98431c8aD98523631AE4a59f267346ea31F984 balance on Ethereum.",
        "chosen": "WALLET BALANCE AUDIT: CONFIRMED. (1) Contract: Uniswap V3 Factory. (2) Native ETH: 0 ETH. (3) Notes: Factory holds no liquidity directly; pool instances hold their own tokens.",
        "rejected": "WALLET BALANCE AUDIT: Holds $4.5B in pooled assets directly in the factory bytecode storage.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "block_explorer", "source_url": "https://etherscan.io/address/0x1F98431c8aD98523631AE4a59f267346ea31F984"}
    },
    {
        "prompt": "Verify Coinbase 10 cold storage wallet 0xA090e606E30bD747d4E6245a1517EbE430F0057e.",
        "chosen": "WALLET BALANCE AUDIT: CONFIRMED. (1) Tag: Coinbase 10. (2) ETH: >450,000 ETH. (3) Security: Institutional multi-sig with hardware air-gap signing ceremony.",
        "rejected": "WALLET BALANCE AUDIT: Inactive testnet wallet with zero verifiable funds.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "block_explorer", "source_url": "https://etherscan.io/address/0xA090e606E30bD747d4E6245a1517EbE430F0057e"}
    },
    {
        "prompt": "Check the Optimism Portal Bridge ETH balance 0xbEb5Fc579115071764c7423A4f12eDde41f106Ed on L1.",
        "chosen": "WALLET BALANCE AUDIT: CONFIRMED. (1) Contract: OptimismPortal. (2) ETH Balance: >620,000 ETH. (3) Status: Secured under bedrock dispute game and 7-day challenge window.",
        "rejected": "WALLET BALANCE AUDIT: Empty contract; funds migrated to legacy OVM bridge.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "block_explorer", "source_url": "https://etherscan.io/address/0xbEb5Fc579115071764c7423A4f12eDde41f106Ed"}
    },
    {
        "prompt": "Verify Gnosis Safe Treasury 0x1Db3439a222C519ab447111477F2a5385E8a3038 balance.",
        "chosen": "WALLET BALANCE AUDIT: CONFIRMED. (1) Safe Address: 0x1Db3439a222C519ab447111477F2a5385E8a3038. (2) Threshold: 3-of-5 signers. (3) Total Value: >$45M across ETH, stETH, and stablecoins.",
        "rejected": "WALLET BALANCE AUDIT: Single-key EOA with 0 assets under custody.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "block_explorer", "source_url": "https://etherscan.io/address/0x1Db3439a222C519ab447111477F2a5385E8a3038"}
    },
    {
        "prompt": "Audit Kraken 4 hot wallet 0x267be1C1D684F7424FF61f4478098b31e21E4028 balance on Ethereum.",
        "chosen": "WALLET BALANCE AUDIT: CONFIRMED. (1) Exchange: Kraken. (2) ETH: >85,000 ETH. (3) Stablecoins: >$120M USDT/USDC in active withdrawal circulation.",
        "rejected": "WALLET BALANCE AUDIT: Dormant wallet since 2018.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "block_explorer", "source_url": "https://etherscan.io/address/0x267be1C1D684F7424FF61f4478098b31e21E4028"}
    },
    {
        "prompt": "Check Lido Execution Layer Rewards Vault 0x388C818CA8B9251b393131C08a73682949742052.",
        "chosen": "WALLET BALANCE AUDIT: CONFIRMED. (1) Protocol: Lido DAO. (2) Function: Accrues MEV and priority fees from Lido node operators before distribution to stETH rebases.",
        "rejected": "WALLET BALANCE AUDIT: Private hacker wallet flagged by certik.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "block_explorer", "source_url": "https://etherscan.io/address/0x388C818CA8B9251b393131C08a73682949742052"}
    },
    {
        "prompt": "Verify Jump Crypto Trading wallet 0xf584F8728B874a6a5c7A8d4d387C9aae9172D621 balance on Ethereum.",
        "chosen": "WALLET BALANCE AUDIT: CONFIRMED. (1) Tag: Jump Trading. (2) Holdings: Diversified multi-token inventory including >25,000 WETH and >$50M stablecoins used for market making.",
        "rejected": "WALLET BALANCE AUDIT: Abandoned address with negative token allowances.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "block_explorer", "source_url": "https://etherscan.io/address/0xf584F8728B874a6a5c7A8d4d387C9aae9172D621"}
    },
    {
        "prompt": "Audit Bitfinex 1 cold wallet 0x876EabF441B2EE5B5b0554Fd502a8E0600950cFa.",
        "chosen": "WALLET BALANCE AUDIT: CONFIRMED. (1) Entity: Bitfinex / Tether. (2) ETH Balance: >180,000 ETH. (3) Security: Cold custody multi-sig with delayed timelock releases.",
        "rejected": "WALLET BALANCE AUDIT: Zero balance with flagged exploit history.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "block_explorer", "source_url": "https://etherscan.io/address/0x876EabF441B2EE5B5b0554Fd502a8E0600950cFa"}
    },
    {
        "prompt": "Verify Aave Collector Treasury 0x464C71f6c2F760DdA6093dCB91C24c39e5d6e18c.",
        "chosen": "WALLET BALANCE AUDIT: CONFIRMED. (1) Contract: Aave V3 Collector. (2) Function: Accrues reserve factor protocol fees across all borrow markets. (3) Balance: >$75M in diversified interest-bearing aTokens.",
        "rejected": "WALLET BALANCE AUDIT: Unfunded proxy with zero accrued revenue.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "block_explorer", "source_url": "https://etherscan.io/address/0x464C71f6c2F760DdA6093dCB91C24c39e5d6e18c"}
    }
]

# 4. LIQUIDITY_DEPTH_VERIFY_GENERAL
liquidity_depth_pairs = [
    {
        "prompt": "Verify the 2% market depth and tick liquidity distribution for the Uniswap v3 USDC/WETH 0.05% pool (0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640) on Ethereum.",
        "chosen": "LIQUIDITY DEPTH AUDIT: CONFIRMED. (1) Pool: 0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640 (Fee tier: 500 bps). (2) TVL: >$240M. (3) ±2% Depth: ~$45M capital committed within active ticks (current tick: 204510), absorbing up to $5M single-block orders with <12 bps price impact.",
        "rejected": "LIQUIDITY DEPTH AUDIT: Pool holds $25,000 total liquidity; 100 ETH order incurs 45% slippage.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "dex_analytics", "source_url": "https://info.uniswap.org/#/pools/0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640"}
    },
    {
        "prompt": "Audit liquidity depth for Curve 3pool (0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7) across DAI/USDC/USDT.",
        "chosen": "LIQUIDITY DEPTH AUDIT: CONFIRMED. (1) Pool: Curve 3pool. (2) Total Balance: ~$185M across DAI, USDC, USDT. (3) Amplification Parameter A: 2000. (4) Slippage: $10M stablecoin swap incurs <0.02% virtual price divergence under current balance ratio.",
        "rejected": "LIQUIDITY DEPTH AUDIT: Imbalanced pool with 98% DAI and 2% USDC; stablecoin peg broken in pool.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "dex_analytics", "source_url": "https://curve.fi/#/ethereum/pools/3pool"}
    },
    {
        "prompt": "Verify the WBTC/WETH 0.3% Uniswap v3 pool (0xCBCdBF44e8bD0CC0e45115B92100Da824419c37a) bid/ask liquidity depth.",
        "chosen": "LIQUIDITY DEPTH AUDIT: CONFIRMED. (1) Pool: 0xCBCdBF44e8bD0CC0e45115B92100Da824419c37a. (2) TVL: >$85M. (3) Depth: $12M depth within 1% price boundary. Slippage for 50 WBTC trade is <0.08%.",
        "rejected": "LIQUIDITY DEPTH AUDIT: Illiquid pool with zero active tick ranges.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "dex_analytics", "source_url": "https://info.uniswap.org/#/pools/0xcbcdbf44e8bd0cc0e45115b92100da824419c37a"}
    },
    {
        "prompt": "Audit Aerodrome Finance WETH/USDC Slipstream concentrated liquidity pool on Base.",
        "chosen": "LIQUIDITY DEPTH AUDIT: CONFIRMED. (1) DEX: Aerodrome (Base). (2) Pool Type: Concentrated CL. (3) TVL: >$110M. (4) Depth: Dominates Base L2 decentralized exchange volume with >$30M depth in ±1.5% tick range.",
        "rejected": "LIQUIDITY DEPTH AUDIT: Zero concentrated liquidity on Base.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "dex_analytics", "source_url": "https://aerodrome.finance/pools"}
    },
    {
        "prompt": "Check Orca Whirlpool SOL/USDC pool depth on Solana.",
        "chosen": "LIQUIDITY DEPTH AUDIT: CONFIRMED. (1) DEX: Orca Whirlpools (Solana). (2) Pair: SOL/USDC (tick spacing 64). (3) Depth: >$55M TVL with concentrated liquidity supporting sub-cent price execution for 500 SOL swaps.",
        "rejected": "LIQUIDITY DEPTH AUDIT: Orca pool drained by malicious exploit.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "dex_analytics", "source_url": "https://www.orca.so/pools"}
    },
    {
        "prompt": "Audit Uniswap v3 USDC/USDT 0.01% pool (0x3416cF6C708Da44DB2624D63ea0AAef7113527C6) on Ethereum.",
        "chosen": "LIQUIDITY DEPTH AUDIT: CONFIRMED. (1) Fee Tier: 1 bp (0.01%). (2) TVL: >$120M. (3) Ultra-Concentrated Tick: 94% of liquidity located in single tick [0, 1] allowing millions in zero-slippage rebalancing.",
        "rejected": "LIQUIDITY DEPTH AUDIT: Wide 1% fee pool with high slippage.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "dex_analytics", "source_url": "https://info.uniswap.org/#/pools/0x3416cf6c708da44db2624d63ea0aaef7113527c6"}
    },
    {
        "prompt": "Verify Raydium CLMM SOL/USDT pool depth on Solana.",
        "chosen": "LIQUIDITY DEPTH AUDIT: CONFIRMED. (1) DEX: Raydium. (2) Concentrated Liquidity: >$35M committed in tight tick range around market price, with low fees and deep orderbook integration via OpenBook.",
        "rejected": "LIQUIDITY DEPTH AUDIT: Constant-product AMM with 0.3% fixed fee and low depth.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "dex_analytics", "source_url": "https://raydium.io/clmm/"}
    },
    {
        "prompt": "Audit Camelot V3 WETH/USDC pool on Arbitrum One.",
        "chosen": "LIQUIDITY DEPTH AUDIT: CONFIRMED. (1) Network: Arbitrum One. (2) TVL: >$40M. (3) Dynamic Directional Fees: Yields deep liquidity for Arbitrum native ecosystem protocols.",
        "rejected": "LIQUIDITY DEPTH AUDIT: Dormant pool with $12 total volume.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "dex_analytics", "source_url": "https://info.camelot.exchange/"}
    },
    {
        "prompt": "Verify Trader Joe Liquidity Book AVAX/USDC pool on Avalanche.",
        "chosen": "LIQUIDITY DEPTH AUDIT: CONFIRMED. (1) Protocol: Trader Joe V2.1. (2) Architecture: Discretized Liquidity Bins (zero slippage within active bin). (3) TVL: >$28M across 20-bp bins.",
        "rejected": "LIQUIDITY DEPTH AUDIT: Constant function AMM with high impermanent loss.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "dex_analytics", "source_url": "https://traderjoex.com/avalanche/pools"}
    },
    {
        "prompt": "Check PancakeSwap V3 BNB/USDT 0.05% pool depth on BNB Chain.",
        "chosen": "LIQUIDITY DEPTH AUDIT: CONFIRMED. (1) DEX: PancakeSwap V3 (BNB Chain). (2) TVL: >$75M. (3) Market Depth: Absorbs 1,000 BNB swaps with <0.05% price impact.",
        "rejected": "LIQUIDITY DEPTH AUDIT: Low liquidity pool with 2.5% slippage on standard retail orders.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "dex_analytics", "source_url": "https://pancakeswap.finance/info/v3/pairs"}
    },
    {
        "prompt": "Audit Balancer v2 80BAL/20WETH pool (0x5c6Ee304399DBdB9C8Ef030aB642B10820DB8F56) on Ethereum.",
        "chosen": "LIQUIDITY DEPTH AUDIT: CONFIRMED. (1) Weighting: 80% BAL / 20% WETH. (2) TVL: >$60M. (3) Mechanism: Primary governance token staking pool reducing impermanent loss for BAL holders.",
        "rejected": "LIQUIDITY DEPTH AUDIT: Equal 50/50 pool with high impermanent loss.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "dex_analytics", "source_url": "https://balancer.fi/pools/ethereum/v2/0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014"}
    },
    {
        "prompt": "Verify Maverick AMM USDC/USDT Boosted Position on Ethereum.",
        "chosen": "LIQUIDITY DEPTH AUDIT: CONFIRMED. (1) Protocol: Maverick AMM. (2) Mode: Mode Right / Static. (3) Capital Efficiency: >$45M effective liquidity following price movements with zero active management.",
        "rejected": "LIQUIDITY DEPTH AUDIT: Conventional AMM with low capital efficiency.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "dex_analytics", "source_url": "https://app.mav.xyz/pools"}
    },
    {
        "prompt": "Check Curve crvUSD/USDC pool (0x4debd707fb51072d847f317453ca74210a695959) depth.",
        "chosen": "LIQUIDITY DEPTH AUDIT: CONFIRMED. (1) Pair: Curve crvUSD / Native USDC. (2) TVL: >$65M. (3) LLAMMA Integration: Soft liquidation engine feeds directly into pool depth for stability.",
        "rejected": "LIQUIDITY DEPTH AUDIT: Disconnected pool with broken arbitrage path.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "dex_analytics", "source_url": "https://curve.fi/#/ethereum/pools/crvusd"}
    },
    {
        "prompt": "Audit Uniswap v3 PEPE/WETH 0.3% pool on Ethereum.",
        "chosen": "LIQUIDITY DEPTH AUDIT: CONFIRMED. (1) TVL: >$30M. (2) Volume: Consistently ranks top-5 on Uniswap with >$40M daily volume and deep liquidity across broad tick ranges.",
        "rejected": "LIQUIDITY DEPTH AUDIT: Honeypot pool with sell tax restrictions.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "dex_analytics", "source_url": "https://info.uniswap.org/#/pools/0xa43fe1690fb505576106c710f5b77c5be728832e"}
    },
    {
        "prompt": "Verify GMX V2 GM (ETH/USD) liquidity pool on Arbitrum.",
        "chosen": "LIQUIDITY DEPTH AUDIT: CONFIRMED. (1) Protocol: GMX V2. (2) Synthetic GM Market: ETH-USDC market backed by isolated pool with >$90M liquidity, zero price impact via Chainlink low-latency oracles.",
        "rejected": "LIQUIDITY DEPTH AUDIT: Shared multi-asset pool with high counterparty skew.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "dex_analytics", "source_url": "https://app.gmx.io/#/pools"}
    }
]

# 5. RESEARCH_QUERY_GENERAL
research_query_pairs = [
    {
        "prompt": "Research the regulatory framework governing Uniform Commercial Code (UCC) Article 2 vs United Nations Convention on Contracts for the International Sale of Goods (CISG) regarding non-conforming tender of goods and buyer inspection remedies.",
        "chosen": "RESEARCH SYNTHESIS: STATUTORY FRAMEWORK VERIFIED. (1) UCC Article 2-601: Enforces the 'Perfect Tender Rule' for domestic US sales of goods, entitling buyer to reject the whole, accept the whole, or accept any commercial unit and reject the rest if goods fail in any respect to conform to contract. (2) UN CISG Article 49(1)(a): Applies to international B2B sales (unless opted out under Art. 6); requires 'fundamental breach' (substantial deprivation of contract expectation under Art. 25) to avoid contract; otherwise remedies are price reduction (Art. 50) and damages (Art. 74). (3) Inspection Timeline: CISG Art. 38 requires examination 'within as short a period as practicable' and Art. 39 requires notice specifying lack of conformity within reasonable time (max 2 years).",
        "rejected": "RESEARCH SYNTHESIS: UCC and CISG are identical treaties that require arbitration before any rejection of damaged industrial goods.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "statutory_legal", "source_url": "https://www.law.cornell.edu/ucc/2/2-601"}
    },
    {
        "prompt": "Synthesize the cryptographic mechanics of ERC-2535 Diamond Multi-Facet Proxy pattern vs standard ERC-1967 transparent proxies in smart contract architecture.",
        "chosen": "RESEARCH SYNTHESIS: ARCHITECTURE AUDITED. (1) Storage Layout: ERC-2535 uses diamond storage (random storage positions via keccak256 hash of unique namespace strings), completely eliminating storage collision risks common in inherited proxy slots. (2) Function Routing: A Diamond contract routes external calls using a selector-to-facet mapping (mapping(bytes4 => bytes20) stored in DiamondStorage), allowing an arbitrary number of facets to share one contract address and bypassing the 24,576 byte Spurious Dragon contract size limit (EIP-170). (3) Introspection: Provides standard Loupe functions (facets(), facetFunctionSelectors(), facetAddress()) for transparent on-chain facet querying.",
        "rejected": "RESEARCH SYNTHESIS: ERC-2535 is a token standard that replaces ERC-20 with a single hardcoded implementation contract.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "technical_standard", "source_url": "https://eips.ethereum.org/EIPS/eip-2535"}
    },
    {
        "prompt": "Analyze the legal and accounting implications of FASB ASU 2023-08 for corporate balance sheet treatment of crypto assets.",
        "chosen": "RESEARCH SYNTHESIS: STATUTORY ACCOUNTING VERIFIED. (1) Fair Value Accounting: FASB Accounting Standards Update (ASU) 2023-08 mandates measurement of qualifying crypto assets at fair value with changes recognized in net income each reporting period. (2) Scope: Applies to fungible crypto assets secured by cryptography, residing on distributed ledgers, that do not provide contract claims on other assets. (3) Elimination of Impairment-Only: Eliminates prior cost-less-impairment model where corporations could only record downward market fluctuations without writing back upward price recoveries.",
        "rejected": "RESEARCH SYNTHESIS: FASB prohibits corporations from reporting crypto assets on balance sheets under any circumstance.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "regulatory_accounting", "source_url": "https://www.fasb.org/page/ShowPdf?path=ASU+2023-08.pdf"}
    },
    {
        "prompt": "Evaluate the architectural differences between Solana VersionedTransaction (v0) with Address Lookup Tables (ALTs) vs legacy Solana Transactions.",
        "chosen": "RESEARCH SYNTHESIS: ARCHITECTURE VERIFIED. (1) Packet Limit: Both formats adhere to the 1,232 byte MTU packet size limit. (2) Legacy Limitation: Legacy transactions fit a maximum of ~35 public keys (32 bytes each) before overflowing the packet buffer. (3) ALTs & v0: Address Lookup Tables store up to 256 addresses on-chain in 1-byte indexed slots. A v0 VersionedTransaction references these accounts using 1-byte indices instead of full 32-byte pubkeys, dramatically expanding the number of accounts per atomic transaction (up to 64 accounts), critical for complex DeFi and multi-hop DEX routing.",
        "rejected": "RESEARCH SYNTHESIS: Versioned transactions increase the UDP packet size to 64 KB across all validator nodes.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "technical_standard", "source_url": "https://docs.solana.com/developing/versioned-transactions"}
    },
    {
        "prompt": "Examine the sanctions enforcement mechanisms of the US Treasury Office of Foreign Assets Control (OFAC) 50 Percent Rule.",
        "chosen": "RESEARCH SYNTHESIS: SANCTIONS COMPLIANCE VERIFIED. (1) The Rule: Under OFAC guidance, property and interests in property of entities directly or indirectly owned 50 percent or more in the aggregate by one or more blocked persons are considered blocked, regardless of whether the entity itself is explicitly named on the Specially Designated Nationals (SDN) list. (2) Aggregation Principle: Ownership stakes of multiple sanctioned parties are aggregated (e.g. Party A owns 30% and Party B owns 25% = 55% blocked entity). (3) Operational Implication: Pre-payment spend guards cannot rely solely on exact name-matching; corporate tree ownership structures must be resolved via statutory registries (GLEIF / SEC).",
        "rejected": "RESEARCH SYNTHESIS: OFAC rules only apply to entities explicitly named in the Federal Register; subsidiaries are exempt.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "statutory_compliance", "source_url": "https://ofac.treasury.gov/faqs/401"}
    },
    {
        "prompt": "Investigate the formal verification semantics of WebAssembly (WASM) deterministic execution in zero-dependency runtimes.",
        "chosen": "RESEARCH SYNTHESIS: DETERMINISTIC WASM VERIFIED. (1) Core Invariant: Standard WASM execution is completely deterministic when floating-point non-deterministic NaN bit patterns are clamped or canonicalized, or when integer-only fixed-point arithmetic (e.g. AssemblyScript integer math) is enforced. (2) Zero-Import VM: A 651-byte WASM binary with 0 environmental imports (no Date.now, no Math.random, no syscalls) guarantees 100% bit-exact parity across V8, Node.js, Rust wasmtime, and on-chain EVM interpreters. (3) Gas & Memory: Bounded linear memory with static array indexing prevents buffer overflows and memory leaks.",
        "rejected": "RESEARCH SYNTHESIS: WASM binaries require OS thread scheduling and unpredictable JIT compilation paths.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "computer_science", "source_url": "https://www.w3.org/TR/wasm-core-1/"}
    },
    {
        "prompt": "Research the European Union Corporate Sustainability Due Diligence Directive (CSDDD) supply chain traceability obligations.",
        "chosen": "RESEARCH SYNTHESIS: EU REGULATION AUDITED. (1) Scope: Enters into force for large EU and non-EU companies meeting turnover thresholds. (2) Duty of Care: Requires enterprises to conduct risk-based human rights and environmental due diligence across direct and indirect global tier-1 supply chain partners. (3) Enforcement: Member states mandate statutory oversight with civil liability and fines up to 5% of net worldwide turnover for non-compliance.",
        "rejected": "RESEARCH SYNTHESIS: CSDDD is a voluntary guideline without civil penalties or legal enforceability.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "regulatory_legal", "source_url": "https://commission.europa.eu/business-economy-euro/doing-business-eu/corporate-sustainability-due-diligence_en"}
    },
    {
        "prompt": "Analyze EIP-4844 Proto-Danksharding blob gas pricing dynamics on Ethereum.",
        "chosen": "RESEARCH SYNTHESIS: CRYPTOECONOMIC PROTOCOL VERIFIED. (1) Architecture: Introduces transient blob data (type 3 transactions) carrying up to 6 blobs of 128 KB each per block. (2) Independent Fee Market: Blobs use an EIP-1559-like exponential target adjustment mechanism with a target of 3 blobs and max 6 blobs. (3) Cost Impact: Segregates L2 data availability costs from L1 execution gas, lowering rollup transaction fees by 10x-50x.",
        "rejected": "RESEARCH SYNTHESIS: Blobs are permanently stored in Ethereum state trie and priced via standard execution gas.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "technical_standard", "source_url": "https://eips.ethereum.org/EIPS/eip-4844"}
    },
    {
        "prompt": "Evaluate the Legal Entity Identifier (LEI) ISO 17442 statutory structure administered by GLEIF.",
        "chosen": "RESEARCH SYNTHESIS: CORPORATE PROVENANCE VERIFIED. (1) Standard: ISO 17442 specifies a 20-character alphanumeric string uniquely identifying legal entities globally. (2) Structure: Characters 1-4: Local Operating Unit (LOU) prefix; 5-18: Entity-specific identifier; 19-20: Two check digits calculated under MOD 97-10 (ISO 7064). (3) Regulatory Mandate: Required under MiFID II, EMIR, Dodd-Frank, and statutory trade escrow clearing to prevent counterparty identity fraud.",
        "rejected": "RESEARCH SYNTHESIS: LEI numbers are self-generated unverified strings created by company founders without central registry oversight.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "statutory_corporate", "source_url": "https://www.gleif.org/en/about-lei/iso-17442-the-lei-code"}
    },
    {
        "prompt": "Research the cryptographic properties of the Ethereum Attestation Service (EAS) schema registry.",
        "chosen": "RESEARCH SYNTHESIS: ATTESTATION STANDARD VERIFIED. (1) Architecture: EAS operates a singleton contract registry where developers register schemas with custom ABI field encodings and optional resolver contracts. (2) UID Derivation: Schema UID is derived via keccak256(abi.encodePacked(schema, resolver, revocable)). (3) Non-Repudiation: Every attestation carries an immutable UID, attester address, recipient, timestamp, expiration time, and cryptographic signature.",
        "rejected": "RESEARCH SYNTHESIS: EAS stores all attestations as plaintext JSON files in centralized AWS S3 buckets.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "technical_standard", "source_url": "https://attest.org/"}
    },
    {
        "prompt": "Examine the mechanics of EIP-712 typed structured data hashing and signing.",
        "chosen": "RESEARCH SYNTHESIS: CRYPTOGRAPHIC SPECIFICATION VERIFIED. (1) Purpose: Prevents phishing signature exploits by rendering human-readable, domain-bound structured data instead of opaque hex byte hashes. (2) Formula: Hash is computed as keccak256(abi.encodePacked('\\x19\\x01', domainSeparator, hashStruct(message))). (3) Domain Separator: Binds the signature to a specific name, version, verifyingContract, and chainId to prevent cross-chain replay attacks.",
        "rejected": "RESEARCH SYNTHESIS: EIP-712 is an ERC-20 extension for burning tokens during gas spikes.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "technical_standard", "source_url": "https://eips.ethereum.org/EIPS/eip-712"}
    },
    {
        "prompt": "Analyze the Geological Survey of Queensland (GSQ) gold production records for the Hodgkinson Goldfield.",
        "chosen": "RESEARCH SYNTHESIS: HISTORICAL GEOLOGICAL ARCHIVES VERIFIED. (1) Discovery: Mulligan's expedition in 1876 discovered payable reef gold on the Hodgkinson River. (2) Tyrconnel Mine: GSQ ML 4022 / Site 43836 recorded ~31,000 oz gold production from quartz fissure veins down to 400m shaft depth. First 10-head stamper battery erected by Warde & Co in Nov 1876. (3) Tailings Dump: 56t of historical stibnite-bearing tailings were retreated in modern epochs, explaining historical variance records.",
        "rejected": "RESEARCH SYNTHESIS: Hodgkinson was an unmined alluvial field discovered in 1995 with zero historical records.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "geological_archives", "source_url": "https://geoscience.data.qld.gov.au/"}
    },
    {
        "prompt": "Evaluate the Basel III liquidity coverage ratio (LCR) and net stable funding ratio (NSFR) requirements.",
        "chosen": "RESEARCH SYNTHESIS: BANKING REGULATION VERIFIED. (1) LCR: Requires banks to hold High-Quality Liquid Assets (HQLA) sufficient to survive a 30-day acute stress scenario (LCR >= 100%). (2) NSFR: Requires Available Stable Funding (ASF) to match or exceed Required Stable Funding (RSF) over a one-year horizon. (3) Capital Impact: Constrains bank balance sheet allocation to volatile assets and favors sovereign paper and central bank reserves.",
        "rejected": "RESEARCH SYNTHESIS: Basel III mandates 100% reserve banking with zero lending permissions.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "banking_standard", "source_url": "https://www.bis.org/bcbs/basel3.htm"}
    },
    {
        "prompt": "Synthesize the architecture of Model Context Protocol (MCP) streamable stdio tools.",
        "chosen": "RESEARCH SYNTHESIS: PROTOCOL ARCHITECTURE VERIFIED. (1) Specification: MCP standardizes communication between host clients (LLM agents) and local or remote tool servers using JSON-RPC 2.0. (2) Transport: Supports stdio (standard input/output pipes) for local subprocesses and SSE (Server-Sent Events) for remote HTTP streaming. (3) Tool Invocation: Enforces strict JSON Schema parameter validation and structured response objects.",
        "rejected": "RESEARCH SYNTHESIS: MCP is a closed proprietary protocol exclusive to Microsoft Windows COM interfaces.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "protocol_spec", "source_url": "https://modelcontextprotocol.io/"}
    },
    {
        "prompt": "Research the economic mechanics of Locational Marginal Pricing (LMP) in ISO/RTO electricity markets.",
        "chosen": "RESEARCH SYNTHESIS: ENERGY ECONOMICS VERIFIED. (1) Mathematical Decomposition: LMP at any node is LMP = Energy Component (SMEP) + Congestion Component (MCC) + Marginal Loss Component (MLC). (2) SMEP: System-wide cost to serve the next MW of demand from unconstrained generator. (3) MCC: Reflects shadow price on binding transmission line flow limits. (4) Negative Pricing: Occurs when inflexible baseload/renewable generation exceeds regional dispatch capacity and export corridors are congested.",
        "rejected": "RESEARCH SYNTHESIS: LMP is a flat national electricity tariff fixed by presidential decree.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "energy_economics", "source_url": "https://www.ferc.gov/electric-power-markets"}
    }
]

save_jsonl('surge_wallet_balance_check_general.jsonl', wallet_balance_pairs)
save_jsonl('surge_liquidity_depth_verify_general.jsonl', liquidity_depth_pairs)
save_jsonl('surge_research_query_general.jsonl', research_query_pairs)

print("Part 1 of surge datasets saved successfully.")

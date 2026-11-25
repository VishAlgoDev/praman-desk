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

# 8. WASH_TRADING_DETECTION_GENERAL
wash_trading_pairs = [
    {
        "prompt": "Audit on-chain trading behavior for NFT Collection 0x23581767a106ae21c074b2276D25e5C3e136a68b where wallet A sells token #4102 to wallet B, who immediately sells to wallet C, which transfers funds back to wallet A within 3 blocks.",
        "chosen": "WASH TRADING AUDIT: WASH TRADING CONFIRMED (CIRCULAR TRADING RING). (1) Pattern: Closed loop fund transfer cycle A -> B -> C -> A. (2) Net Economic Change: Zero net change in underlying beneficial ownership. (3) Volume Inflation: Created $45,000 in fake marketplace trading volume while incurring only gas costs. (4) Intent: Artificially pumping collection floor price and farming marketplace token reward incentives.",
        "rejected": "WASH TRADING AUDIT: ORGANIC LIQUIDITY. Valid decentralized commercial arms-length transactions.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "surveillance_analytics", "source_url": "https://dune.com/queries/nft-wash-trading"}
    },
    {
        "prompt": "Analyze a decentralized exchange liquidity pool for token XYZ where 92% of daily trading volume originates from two EOAs trading identical lot sizes back and forth at 0% net PnL.",
        "chosen": "WASH TRADING AUDIT: WASH TRADING DETECTED (SELF-CROSSING ORDERS). (1) Metric: 92% volume concentration across 2 linked addresses. (2) Order Matching: Simultaneous buy and sell limit orders matching each other. (3) Purpose: Faking liquidity metrics to pass CoinGecko / CoinMarketCap volume thresholds for exchange listing.",
        "rejected": "WASH TRADING AUDIT: ORGANIC HIGH-FREQUENCY TRADING. Represents normal competitive market maker arbitrage.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "surveillance_analytics", "source_url": "https://www.sec.gov/litigation/complaints/2023/comp-pr2023-102.pdf"}
    },
    {
        "prompt": "Audit wallet 0x71a... funding 10 fresh child wallets via Tornado Cash, each executing synchronized buy orders of micro-cap token GEM before a coordinated dump.",
        "chosen": "WASH TRADING AUDIT: MANIPULATIVE VOLUME SYBIL RING. (1) Funding Provenance: Common mixer origin funding 10 uncoordinated-appearing wallets. (2) Synchronized Execution: Simultaneous buy orders within single block creating artificial green candles. (3) Classification: Coordinated pump-and-dump market manipulation.",
        "rejected": "WASH TRADING AUDIT: INDEPENDENT RETAIL ACCUMULATION. Natural decentralized retail community momentum.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "surveillance_analytics", "source_url": "https://chainalysis.com/blog/crypto-market-manipulation-wash-trading/"}
    },
    {
        "prompt": "Audit an automated trading bot on perpetual DEX executing $500M daily notional trades with average position hold time of 0.8 seconds and zero net directional delta.",
        "chosen": "WASH TRADING AUDIT: WASH VOLUME FOR TRADING REWARDS. (1) Strategy: Wash trading to farm DEX governance token emission incentives. (2) Economic Reality: Protocol pays out more in liquidity mining rewards than the bot loses in taker fees.",
        "rejected": "WASH TRADING AUDIT: LEGITIMATE DELTA-NEUTRAL HEDGING. Institutional risk management strategy.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "surveillance_analytics", "source_url": "https://arxiv.org/abs/2108.10984"}
    },
    {
        "prompt": "Audit token ABC on decentralized AMM where contract deployer holds 99.8% of supply and executes round-trip swaps against themselves via router.",
        "chosen": "WASH TRADING AUDIT: FACTITIOUS VOLUME IN HONEYPOT. (1) Concentration: Deployer owns 99.8% of floating supply. (2) Self-Dealing: All pool swaps are funded from deployer wallet to manufacture fake chart trends.",
        "rejected": "WASH TRADING AUDIT: GENUINE PRICE DISCOVERY. Standard bootstrapping curve.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "surveillance_analytics", "source_url": "https://tokensniffer.com/"}
    },
    {
        "prompt": "Audit an NFT marketplace account claiming $25M in volume across 1,000 transactions on zero-royalty collections between 2 related addresses.",
        "chosen": "WASH TRADING AUDIT: ZERO-FEE WASH TRADING. (1) Flaw: 0% marketplace fee and 0% royalty allows infinite volume churning at zero cost except minimal L2 gas fees. (2) Classification: Wash volume to manipulate leaderboard stats.",
        "rejected": "WASH TRADING AUDIT: AUTHENTIC HIGH-VOLUME ART COLLECTOR.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "surveillance_analytics", "source_url": "https://dune.com/hildobby/NFT-Wash-Trading"}
    },
    {
        "prompt": "Analyze trading pair DEF/ETH where buy orders systematically cancel within 1 block whenever real taker orders approach the bid (spoofing / layering).",
        "chosen": "WASH TRADING AUDIT: ORDERBOOK SPOOFING & PHANTOM DEPTH. (1) Action: Placing large non-bona fide buy orders to create false impression of buy-side support, then canceling before execution. (2) Violation: Market manipulation under statutory commodities and exchange laws.",
        "rejected": "WASH TRADING AUDIT: STANDARD ASYMMETRIC MARKET MAKING.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "statutory_enforcement", "source_url": "https://www.cftc.gov/LearnAndProtect/EducationCenter/spoofing"}
    },
    {
        "prompt": "Audit cross-DEX arbitrage where two arbitrage bots repeatedly trade between Uniswap and Sushiswap without price divergence.",
        "chosen": "WASH TRADING AUDIT: CYCLICAL ARB CHURNING. (1) Analysis: Zero price discrepancy between pools; transactions incur net negative profit after gas fees. (2) Purpose: Faking exchange fee burn metrics.",
        "rejected": "WASH TRADING AUDIT: EFFICIENT MARKET EQUILIBRIUM ENFORCEMENT.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "surveillance_analytics", "source_url": "https://flashbots.net/"}
    },
    {
        "prompt": "Audit an ERC-20 token where 100% of buys are approved, but all external sells revert with TRANSFER_FAILED while creator wallet sells freely.",
        "chosen": "WASH TRADING AUDIT: HONEYPOT SCAM WITH WASH BUY PUMPING. (1) Defect: Malicious modifier blocks non-owner transfers. (2) Fake Buys: Creator conducts automated wash purchases to simulate retail buying interest.",
        "rejected": "WASH TRADING AUDIT: COMPLIANT SECURITY TOKEN WITH TRANSFER WHITELIST.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "security_audit", "source_url": "https://honeypot.is/"}
    },
    {
        "prompt": "Audit a token with $10M reported 24h volume on centralized exchange whose orderbook has $20 total bids within 5% of mid-price.",
        "chosen": "WASH TRADING AUDIT: INTERNAL CEX WASH TRADING ENGINE. (1) Discrepancy: $10M volume is statistically impossible with only $20 in resting orderbook depth. (2) Mechanism: Internal database wash trade matching by exchange operator.",
        "rejected": "WASH TRADING AUDIT: HIGH VELOCITY MARKET ORDER FLOW.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "surveillance_analytics", "source_url": "https://www.bitwiseinvestments.com/research/etf-filings"}
    },
    {
        "prompt": "Audit wash trading in algorithmic stablecoin stability pool where single entity conducts 90% of mint and redemption volume in single transactions.",
        "chosen": "WASH TRADING AUDIT: REHYPOTHECATION WASH LOOP. (1) Loop: Mint -> Deposit -> Borrow -> Mint. (2) Risk: Leveraged synthetic TVL inflation without genuine external liquidity.",
        "rejected": "WASH TRADING AUDIT: HEALTHY PROTOCOL UTILIZATION.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "surveillance_analytics", "source_url": "https://defillama.com/"}
    },
    {
        "prompt": "Audit NFT wash trading involving flash loans to finance $100M single-block purchase of an in-house NFT.",
        "chosen": "WASH TRADING AUDIT: FLASH-LOAN POWERED WASH VALUATION PUMP. (1) Mechanism: Borrower takes flash loan, buys own NFT at $100M, receives own funds back, repays flash loan in same block. (2) Motive: Establishing fake historical price record for collateralized loan scam.",
        "rejected": "WASH TRADING AUDIT: HISTORIC BLUE-CHIP NFT AUCTION RECORD.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "security_audit", "source_url": "https://rekt.news/"}
    },
    {
        "prompt": "Analyze trading volume on decentralized prediction market where identical shares are bought and sold simultaneously across 2 accounts at identical odds.",
        "chosen": "WASH TRADING AUDIT: PREDICTION MARKET VOLUME INFLATION. (1) Purpose: Faking open interest and trading volume to qualify for platform airdrops. (2) Net PnL: Zero.",
        "rejected": "WASH TRADING AUDIT: HEDGING ACROSS CONFLICTING OUTCOMES.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "surveillance_analytics", "source_url": "https://polymarket.com/"}
    },
    {
        "prompt": "Audit an OTC desk reporting $50M daily trading volume with zero on-chain settlement transactions or banking wire reconciliations.",
        "chosen": "WASH TRADING AUDIT: FICTITIOUS PAPER VOLUME. (1) Audit Finding: Complete absence of settlement custody proofs or bank inflows. (2) Classification: Fabricated volume report.",
        "rejected": "WASH TRADING AUDIT: BILATERAL NETTING OFF-CHAIN SETTLEMENT.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "statutory_compliance", "source_url": "https://www.finra.org/"}
    },
    {
        "prompt": "Audit wash sales on crypto yield aggregator executing 1,000 recursive deposit-withdraw cycles per hour to generate synthetic fee revenue.",
        "chosen": "WASH TRADING AUDIT: FEE WASH RECYCLING. (1) Flaw: Protocol revenue figures are artificially inflated by recycling own treasury capital through deposit fee contracts.",
        "rejected": "WASH TRADING AUDIT: REAL COMPOUNDING YIELD GENERATION.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "security_audit", "source_url": "https://tokenterminal.com/"}
    }
]

# 9. MACRO_ECONOMIC_INDICATOR_GENERAL
macro_pairs = [
    {
        "prompt": "Verify the official US Federal Funds Effective Rate (EFFR) and target range set by the Federal Open Market Committee (FOMC) as of November 2024.",
        "chosen": "MACRO INDICATOR AUDIT: CONFIRMED. (1) Target Range: 4.50% - 4.75% (lowered 25 bps at Nov 7, 2024 meeting). (2) EFFR Level: 4.58%. (3) Overnight Reverse Repo (ON RRP) Rate: 4.50%. (4) Interest on Reserve Balances (IORB): 4.65%.",
        "rejected": "MACRO INDICATOR AUDIT: EFFR target range is 0.00% - 0.25% under zero interest rate policy.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "central_bank", "source_url": "https://www.newyorkfed.org/markets/reference-rates/effr"}
    },
    {
        "prompt": "Verify the US Nonfarm Payrolls (NFP) employment print and official unemployment rate for October 2024.",
        "chosen": "MACRO INDICATOR AUDIT: CONFIRMED. (1) Nonfarm Payrolls: +12,000 jobs (impacted by Boeing strike and Hurricanes Helene/Milton). (2) Unemployment Rate: 4.1% (U-3 headline). (3) Source: US Bureau of Labor Statistics (BLS) Employment Situation Report.",
        "rejected": "MACRO INDICATOR AUDIT: +500,000 jobs added with 2.1% unemployment rate.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "government_statistics", "source_url": "https://www.bls.gov/news.release/empsit.nr0.htm"}
    },
    {
        "prompt": "Verify US Real Gross Domestic Product (GDP) annualized growth rate for Q3 2024 (Advance Estimate).",
        "chosen": "MACRO INDICATOR AUDIT: CONFIRMED. (1) Annualized Real GDP Growth: 2.8% in Q3 2024. (2) Primary Drivers: Strong consumer spending (PCE +3.7%), federal defense spending, and export growth. (3) Source: US Bureau of Economic Analysis (BEA).",
        "rejected": "MACRO INDICATOR AUDIT: Negative GDP growth of -1.5% entering statutory recession.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "government_statistics", "source_url": "https://www.bea.gov/data/gdp/gross-domestic-product"}
    },
    {
        "prompt": "Audit the 10-Year vs 2-Year US Treasury yield curve spread (T10Y2Y) inversion status in late 2024.",
        "chosen": "MACRO INDICATOR AUDIT: CONFIRMED. (1) Spread Status: Un-inverted into positive territory (+10 to +18 bps) after enduring the longest sustained inversion in US financial history (over 780 consecutive days from July 2022 to September 2024).",
        "rejected": "MACRO INDICATOR AUDIT: Deeply inverted at -150 bps.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "macro_data", "source_url": "https://fred.stlouisfed.org/series/T10Y2Y"}
    },
    {
        "prompt": "Verify Bank of Japan (BOJ) policy balance rate as of late 2024.",
        "chosen": "MACRO INDICATOR AUDIT: CONFIRMED. (1) Policy Rate: 0.25% (uncollateralized overnight call rate target). (2) Transition: Formally abandoned negative interest rate policy (NIRP) in March 2024 and raised to 0.25% in July 2024.",
        "rejected": "MACRO INDICATOR AUDIT: Negative rate at -0.50% with strict yield curve control (YCC) at 0.00%.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "central_bank", "source_url": "https://www.boj.or.jp/en/mopo/index.htm"}
    },
    {
        "prompt": "Verify Bank of England (BOE) official Bank Rate decision in November 2024.",
        "chosen": "MACRO INDICATOR AUDIT: CONFIRMED. (1) Bank Rate: 4.75% (cut 25 bps from 5.00% on November 7, 2024 by 8-1 vote of Monetary Policy Committee).",
        "rejected": "MACRO INDICATOR AUDIT: Bank Rate raised to 6.50% to defend sterling.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "central_bank", "source_url": "https://www.bankofengland.co.uk/monetary-policy/the-interest-rate-bank-rate"}
    },
    {
        "prompt": "Verify Eurozone Harmonised Index of Consumer Prices (HICP) annual inflation rate for September 2024.",
        "chosen": "MACRO INDICATOR AUDIT: CONFIRMED. (1) Headline HICP: 1.7% year-on-year (dropping below ECB 2% target for the first time in over 3 years). (2) Core HICP: 2.7%. (3) Source: Eurostat.",
        "rejected": "MACRO INDICATOR AUDIT: Eurozone inflation steady at 8.9%.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "government_statistics", "source_url": "https://ec.europa.eu/eurostat/web/products-euro-indicators"}
    },
    {
        "prompt": "Audit US Total Public Debt Outstanding as reported by the US Treasury Bureau of the Fiscal Service in Q4 2024.",
        "chosen": "MACRO INDICATOR AUDIT: CONFIRMED. (1) Public Debt Outstanding: Exceeds $35.8 Trillion ($35,800,000,000,000). (2) Debt Held by the Public: ~$28.2T. (3) Intragovernmental Holdings: ~$7.6T.",
        "rejected": "MACRO INDICATOR AUDIT: Total debt is $12 Trillion with a federal budget surplus.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "government_statistics", "source_url": "https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/"}
    },
    {
        "prompt": "Verify China Gross Domestic Product (GDP) year-on-year growth rate for Q3 2024.",
        "chosen": "MACRO INDICATOR AUDIT: CONFIRMED. (1) GDP Growth: 4.6% year-on-year in Q3 2024 (down from 4.7% in Q2). (2) Target: Around 5% full-year statutory target. (3) Source: National Bureau of Statistics (NBS) of China.",
        "rejected": "MACRO INDICATOR AUDIT: GDP grew at 14.5% year-on-year.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "government_statistics", "source_url": "http://www.stats.gov.cn/english/"}
    },
    {
        "prompt": "Verify the University of Michigan Index of Consumer Sentiment preliminary reading for October 2024.",
        "chosen": "MACRO INDICATOR AUDIT: CONFIRMED. (1) Index Level: 70.5. (2) Current Economic Conditions: 64.9. (3) Consumer Expectations: 74.1. (4) 1-Year Inflation Expectations: 2.7%.",
        "rejected": "MACRO INDICATOR AUDIT: Consumer Sentiment dropped to all-time low of 25.0.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "survey_data", "source_url": "http://www.sca.isr.umich.edu/"}
    },
    {
        "prompt": "Audit the Federal Reserve Balance Sheet (Total Assets Less Eliminations from Consolidation) in Q4 2024.",
        "chosen": "MACRO INDICATOR AUDIT: CONFIRMED. (1) Fed Total Assets: ~$7.0 Trillion (reduced from peak of ~$9.0T under Quantitative Tightening / QT). (2) Monthly Runoff Cap: Treasury securities capped at $25B/month (slowed from $60B), agency MBS capped at $35B/month.",
        "rejected": "MACRO INDICATOR AUDIT: Balance sheet expanded to $15 Trillion under emergency QE.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "central_bank", "source_url": "https://www.federalreserve.gov/releases/h41/"}
    },
    {
        "prompt": "Verify Germany Industrial Production month-on-month change for September 2024.",
        "chosen": "MACRO INDICATOR AUDIT: CONFIRMED. (1) Monthly Change: -2.5% m/m (seasonally and calendar adjusted). (2) Annual Change: -4.6% y/y. (3) Source: Destatis (Federal Statistical Office of Germany).",
        "rejected": "MACRO INDICATOR AUDIT: Industrial production surged +8.4% month-on-month.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "government_statistics", "source_url": "https://www.destatis.de/EN/Press/2024/11/PE24_426_421.html"}
    },
    {
        "prompt": "Verify OPEC+ crude oil voluntary production cuts agreement through end of 2024.",
        "chosen": "MACRO INDICATOR AUDIT: CONFIRMED. (1) Total Cuts: ~5.86 million barrels per day (mb/d) across 8 member states. (2) Decision: Agreed to delay planned unwinding of 2.2 mb/d voluntary cuts through December 2024 due to weak global demand.",
        "rejected": "MACRO INDICATOR AUDIT: OPEC+ abolished all quotas and flooded market with 10M bpd surplus.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "energy_intelligence", "source_url": "https://www.opec.org/opec_web/en/press_room/7377.htm"}
    },
    {
        "prompt": "Audit US Core Personal Consumption Expenditures (PCE) Price Index 12-month change for September 2024.",
        "chosen": "MACRO INDICATOR AUDIT: CONFIRMED. (1) Core PCE (Fed Preferred Inflation Measure): 2.7% year-on-year. (2) Headline PCE: 2.1% y/y (approaching the Fed's 2.0% objective). (3) Source: BEA.",
        "rejected": "MACRO INDICATOR AUDIT: Core PCE inflation rose to 6.2% y/y.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "government_statistics", "source_url": "https://www.bea.gov/data/personal-consumption-expenditures-price-index"}
    },
    {
        "prompt": "Verify the Baltic Dry Index (BDI) level in late 2024.",
        "chosen": "MACRO INDICATOR AUDIT: CONFIRMED. (1) Index Level: Fluctuating between 1,400 - 1,650 points. (2) Component Segments: Capesize, Panamax, and Supramax charter rates reflecting seasonal iron ore shipments from Brazil and Australia.",
        "rejected": "MACRO INDICATOR AUDIT: BDI crashed to historical zero due to canal blockages.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "commodities_index", "source_url": "https://www.balticexchange.com/"}
    }
]

# 10. GAS_PRICE_GENERAL
gas_price_pairs = [
    {
        "prompt": "Audit Ethereum Mainnet EIP-1559 base fee mechanics and priority fee calculation during block 19540000.",
        "chosen": "GAS PRICE AUDIT: CONFIRMED. (1) Base Fee: Calculated deterministically by protocol: newBaseFee = currentBaseFee * (1 + 0.125 * (gasUsed - targetGas) / targetGas). (2) Target Gas: 15,000,000 gas (50% of 30M limit). (3) Burn Mechanism: Base fee is 100% burned; tip/priority fee goes to validator.",
        "rejected": "GAS PRICE AUDIT: Base fee is set by miner auction bidding with zero burned ETH.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "protocol_spec", "source_url": "https://eips.ethereum.org/EIPS/eip-1559"}
    },
    {
        "prompt": "Verify Arbitrum One L1 data fee formula under ArbOS 20 Atlas.",
        "chosen": "GAS PRICE AUDIT: CONFIRMED. (1) Formula: L1 data fee = units_of_data * L1_data_base_fee. (2) Dencun Impact: Utilizes EIP-4844 blobs, reducing L1 posting fee by ~95% compared to legacy calldata posting.",
        "rejected": "GAS PRICE AUDIT: Arbitrum pays zero L1 fees to Ethereum.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "rollup_docs", "source_url": "https://docs.arbitrum.io/inside-arbitrum-nitro/"}
    },
    {
        "prompt": "Audit Base sequencer L2 execution gas fee structure.",
        "chosen": "GAS PRICE AUDIT: CONFIRMED. (1) L2 Execution Gas: 0.001 - 0.005 gwei. (2) Total Fee = L2 Execution Fee + L1 Data Fee (blobs). (3) Typical simple transfer cost: <$0.01.",
        "rejected": "GAS PRICE AUDIT: Fixed flat rate of $15 per transaction.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "rollup_docs", "source_url": "https://docs.base.org/fees/"}
    },
    {
        "prompt": "Verify Solana transaction fee and Priority Fee (Compute Budget) micro-lamport mechanics.",
        "chosen": "GAS PRICE AUDIT: CONFIRMED. (1) Base Signature Fee: 5,000 lamports per signature (0.000005 SOL). (2) Priority Fee: Additional micro-lamports per Compute Unit (CU) requested via SetComputeUnitPrice instruction, prioritizing transaction in scheduler.",
        "rejected": "GAS PRICE AUDIT: Solana fees are priced in gas units equivalent to EVM gwei.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "developer_docs", "source_url": "https://solana.com/docs/core/fees"}
    },
    {
        "prompt": "Audit gas price surge mechanics during high volatility NFT mint event on Ethereum.",
        "chosen": "GAS PRICE AUDIT: CONFIRMED. (1) Phenomenon: Blocks consecutively fill at 30,000,000 gas (100% full). (2) Base Fee Compound: Increases by maximum +12.5% per block exponentially. (3) 10 consecutive full blocks increase base fee by 3.25x.",
        "rejected": "GAS PRICE AUDIT: Gas prices cannot increase by more than 1 gwei per hour.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "gas_analytics", "source_url": "https://etherscan.io/gastracker"}
    },
    {
        "prompt": "Verify Polygon PoS minimum gas price threshold (25 gwei).",
        "chosen": "GAS PRICE AUDIT: CONFIRMED. (1) Policy: Validators enforce minimum base fee of 25 gwei to prevent spam and dust transactions on Bor chain.",
        "rejected": "GAS PRICE AUDIT: Minimum fee is 0 gwei.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "network_docs", "source_url": "https://wiki.polygon.technology/"}
    },
    {
        "prompt": "Audit Optimism bedrock fee vault distribution.",
        "chosen": "GAS PRICE AUDIT: CONFIRMED. (1) Fee Split: Sequencer fee vault collects L2 base fee and priority fee; L1 fee vault collects blob posting reimbursement.",
        "rejected": "GAS PRICE AUDIT: Fees are distributed equally to all token holders.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "rollup_docs", "source_url": "https://community.optimism.io/"}
    },
    {
        "prompt": "Verify BNB Chain gas fee reduction to 1 gwei / 3 gwei.",
        "chosen": "GAS PRICE AUDIT: CONFIRMED. (1) Gas Price: Lowered to 3 gwei and 1 gwei on opBNB to enhance high-throughput throughput.",
        "rejected": "GAS PRICE AUDIT: BNB Chain requires minimum 100 gwei.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "developer_docs", "source_url": "https://docs.bnbchain.org/"}
    },
    {
        "prompt": "Audit Avalanche C-Chain dynamic fee algorithm based on EIP-1559.",
        "chosen": "GAS PRICE AUDIT: CONFIRMED. (1) Base Fee Range: 25 nAVAX to over 200 nAVAX depending on 10-second rolling window capacity. (2) Burn: 100% of base fee in AVAX is burned.",
        "rejected": "GAS PRICE AUDIT: Avalanche gas fees are paid directly to miners.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "network_docs", "source_url": "https://docs.avax.network/learn/avalanche-platform/c-chain"}
    },
    {
        "prompt": "Verify Ethereum Sepolia testnet gas price baseline.",
        "chosen": "GAS PRICE AUDIT: CONFIRMED. (1) Testnet Base Fee: Typically fluctuates between 0.001 - 0.1 gwei under standard test workloads.",
        "rejected": "GAS PRICE AUDIT: Sepolia gas fee is pegged to $50 USD per transaction.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "testnet_telemetry", "source_url": "https://sepolia.etherscan.io/gastracker"}
    },
    {
        "prompt": "Audit blob gas target vs max fee adjustment curve (EIP-4844).",
        "chosen": "GAS PRICE AUDIT: CONFIRMED. (1) Target Blobs: 3 per block. (2) Max Blobs: 6 per block. (3) Price Adjustment: When blob count > 3, blobBaseFee increases; when < 3, blobBaseFee decreases exponentially.",
        "rejected": "GAS PRICE AUDIT: Blob price is constant regardless of usage.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "protocol_spec", "source_url": "https://eips.ethereum.org/EIPS/eip-4844"}
    },
    {
        "prompt": "Verify Scroll zkEVM L1 data gas compression savings.",
        "chosen": "GAS PRICE AUDIT: CONFIRMED. (1) Architecture: Compresses batch data with zlib before posting to Ethereum L1, reducing blob data footprints by up to 50%.",
        "rejected": "GAS PRICE AUDIT: Scroll posts uncompressed raw state diffs at 10x normal cost.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "rollup_docs", "source_url": "https://scroll.io/blog/scroll-fee-mechanism"}
    },
    {
        "prompt": "Audit Linea zkEVM dynamic fee manager.",
        "chosen": "GAS PRICE AUDIT: CONFIRMED. (1) Mechanism: Dynamic fee manager adjusts L2 gas price to cover L1 proof verification and data availability costs without sequencer deficit.",
        "rejected": "GAS PRICE AUDIT: Linea does not incur L1 proof costs.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "rollup_docs", "source_url": "https://docs.linea.build/"}
    },
    {
        "prompt": "Verify Solana compute unit limit instruction (SetComputeUnitLimit).",
        "chosen": "GAS PRICE AUDIT: CONFIRMED. (1) Default CU: 200,000 CU per instruction. (2) Optimization: Explicitly requesting lower CU via SetComputeUnitLimit instruction reduces total priority fee paid and improves scheduler throughput.",
        "rejected": "GAS PRICE AUDIT: Transactions must always consume 1,400,000 CU max.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "developer_docs", "source_url": "https://solana.com/docs/core/fees#compute-budget"}
    },
    {
        "prompt": "Audit zkSync Era native account abstraction gas sponsorship via Paymaster.",
        "chosen": "GAS PRICE AUDIT: CONFIRMED. (1) Protocol: Native AA (EIP-712 paymaster input). (2) Function: Users can pay gas in ERC-20 tokens (e.g. USDC) or dApps can sponsor 100% of gas fees transparently.",
        "rejected": "GAS PRICE AUDIT: zkSync does not support ERC-20 gas payments.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "rollup_docs", "source_url": "https://docs.zksync.io/build/developer-reference/account-abstraction.html"}
    }
]

# 11. CODE_REVIEW_GENERAL
code_review_pairs = [
    {
        "prompt": "Review Node.js code for prototype pollution: function merge(target, source) { for (let key in source) { if (typeof source[key] === 'object') { target[key] = merge(target[key] || {}, source[key]); } else { target[key] = source[key]; } } return target; }",
        "chosen": "CODE REVIEW: CRITICAL SECURITY DEFECT (PROTOTYPE POLLUTION). (1) Vulnerability: When source contains '__proto__' or 'constructor.prototype' keys, the recursive merge assigns properties directly to Object.prototype. (2) Exploit: Attacker can inject properties globally, leading to remote code execution (RCE) or authentication bypass. (3) Fix: Filter out dangerous keys: if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;",
        "rejected": "CODE REVIEW: CLEAN RECURSIVE OBJECT UTILITY. No defects found.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "cwe_database", "source_url": "https://cwe.mitre.org/data/definitions/1321.html"}
    },
    {
        "prompt": "Review Python code for SQL injection: query = f'SELECT * FROM users WHERE email = \\'{user_input}\\' AND active = 1'; cursor.execute(query)",
        "chosen": "CODE REVIEW: CRITICAL SECURITY DEFECT (CWE-89 SQL INJECTION). (1) Defect: Raw user input formatted directly into SQL query string via f-string without parameterization. (2) Exploit: Input like ' OR '1'='1 -- allows authentication bypass. (3) Remediation: Use parameterized queries: cursor.execute('SELECT * FROM users WHERE email = %s AND active = 1', (user_input,))",
        "rejected": "CODE REVIEW: SECURE. Python f-strings automatically escape malicious characters.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "owasp_guidelines", "source_url": "https://owasp.org/www-community/attacks/SQL_Injection"}
    },
    {
        "prompt": "Review React hook dependency array: useEffect(() => { fetchData(id); }, []); where id is a component prop.",
        "chosen": "CODE REVIEW: REACT REACTIVITY BUG (STALE CLOSURE). (1) Defect: id prop is omitted from useEffect dependency array. (2) Bug: When component re-renders with new id, the effect does not re-fire, causing component to display stale data for prior id. (3) Fix: Include id in dependencies: useEffect(() => { fetchData(id); }, [id]);",
        "rejected": "CODE REVIEW: BEST PRACTICE. Empty dependency array ensures optimal single-mount rendering.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "framework_docs", "source_url": "https://react.dev/reference/react/useEffect#specifying-reactive-dependencies"}
    },
    {
        "prompt": "Review JavaScript async/await error handling: async function loadData() { const res = await fetch(url); const json = await res.json(); return json; } without try/catch.",
        "chosen": "CODE REVIEW: UNHANDLED PROMISE REJECTION. (1) Flaw: Network errors or invalid JSON parse throw unhandled rejections that crash Node.js processes or trigger uncaught boundary errors. (2) Response Check: res.ok is not checked, so HTTP 404/500 errors pass silently to json() parsing. (3) Fix: Wrap in try/catch and validate res.ok.",
        "rejected": "CODE REVIEW: CLEAN CODE. Async functions automatically catch all errors in runtime.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "javascript_standards", "source_url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function"}
    },
    {
        "prompt": "Review cryptography code comparing secret API tokens: if (userToken === secretToken) { return true; }",
        "chosen": "CODE REVIEW: SECURITY VULNERABILITY (TIMING ATTACK / SIDE-CHANNEL LEAK). (1) Defect: Standard string equality (===) performs early exit comparison, terminating on first mismatched character. (2) Exploit: Attacker can measure response latency deltas to deduce secret token character-by-character. (3) Fix: Use constant-time comparison: crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b)).",
        "rejected": "CODE REVIEW: SECURE. JavaScript equality is executed in private hardware registers.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "security_guidelines", "source_url": "https://cwe.mitre.org/data/definitions/208.html"}
    },
    {
        "prompt": "Review Node.js path traversal risk: app.get('/file', (req, res) => { const filePath = path.join(__dirname, 'public', req.query.name); res.sendFile(filePath); });",
        "chosen": "CODE REVIEW: CRITICAL SECURITY DEFECT (CWE-22 PATH TRAVERSAL). (1) Exploit: Parameter ?name=../../../../etc/passwd resolves outside public folder. (2) Fix: Sanitize path and verify resolved path starts with allowed root directory: const safePath = path.resolve(__dirname, 'public', req.query.name); if (!safePath.startsWith(publicDir)) return res.status(403);",
        "rejected": "CODE REVIEW: SAFE. path.join automatically prevents directory traversal.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "cwe_database", "source_url": "https://cwe.mitre.org/data/definitions/22.html"}
    },
    {
        "prompt": "Review Go code for race condition: var count int; func handler() { go func() { count++ }() }",
        "chosen": "CODE REVIEW: CONCURRENCY DEFECT (DATA RACE). (1) Defect: Multiple goroutines read and mutate shared variable count without synchronization. (2) Fix: Use sync/atomic (atomic.AddInt64(&count, 1)) or sync.Mutex locking.",
        "rejected": "CODE REVIEW: IDIOMATIC GO. Goroutines automatically manage concurrent memory access.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "language_spec", "source_url": "https://go.dev/doc/articles/race_detector"}
    },
    {
        "prompt": "Review CSS performance issue: window.addEventListener('mousemove', (e) => { document.querySelectorAll('.card').forEach(c => c.style.setProperty('--x', e.clientX + 'px')); });",
        "chosen": "CODE REVIEW: PERFORMANCE DEFECT (MAIN-THREAD LAYOUT THRASHING). (1) Defect: Firing synchronous DOM style mutations on un-throttled mousemove events causes continuous layout recalculations and drops frame rate below 60fps. (2) Fix: Throttle updates using requestAnimationFrame() or utilize pure CSS pointer-events.",
        "rejected": "CODE REVIEW: OPTIMAL 120FPS CODE. Browsers automatically debounce mousemove listeners.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "performance_guidelines", "source_url": "https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing"}
    },
    {
        "prompt": "Review Python resource leak: def read_config(): f = open('config.json'); data = json.load(f); return data",
        "chosen": "CODE REVIEW: RESOURCE MANAGEMENT DEFECT (FILE DESCRIPTOR LEAK). (1) Defect: File handle f is not closed, and if json.load fails, file descriptor remains open. (2) Fix: Use context manager: with open('config.json') as f: return json.load(f)",
        "rejected": "CODE REVIEW: IDIOMATIC PYTHON. Garbage collector immediately frees all file handles.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "language_spec", "source_url": "https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files"}
    },
    {
        "prompt": "Review TypeScript typing: function parsePayload(data: any): any { return data.items.map((x: any) => x.val); }",
        "chosen": "CODE REVIEW: CODE QUALITY DEFECT (ANY TYPE SMELL). (1) Problem: Using any completely disables TypeScript compiler type safety, allowing runtime TypeError (e.g. Cannot read properties of undefined). (2) Fix: Define strict interfaces or use unknown with runtime type validation (Zod / type guards).",
        "rejected": "CODE REVIEW: CLEAN FLEXIBLE TYPESCRIPT. any is recommended for high performance.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "typescript_docs", "source_url": "https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html#any"}
    },
    {
        "prompt": "Review Dockerfile: FROM node:alpine; RUN npm install -g pnpm; COPY . .; CMD ['node', 'index.js'] running as root user.",
        "chosen": "CODE REVIEW: DOCKER SECURITY DEFECT (ROOT EXECUTION). (1) Risk: Container processes running as root can access host resources if container breakout occurs. (2) Fix: Create unprivileged user: USER node",
        "rejected": "CODE REVIEW: BEST PRACTICE. Containers should always run as root for hardware acceleration.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "security_standards", "source_url": "https://docs.docker.com/engine/security/"}
    },
    {
        "prompt": "Review regular expression for ReDoS: const regex = /([a-zA-Z0-9]+)+$/; regex.test(input);",
        "chosen": "CODE REVIEW: CRITICAL SECURITY DEFECT (CWE-1333 REGULAR EXPRESSION DOS). (1) Defect: Catastrophic backtracking caused by nested quantifiers ([a-zA-Z0-9]+)+. (2) Exploit: Long string of alphanumeric characters ending in '!' causes exponential backtracking and freezes Node event loop at 100% CPU. (3) Fix: Simplify regex without overlapping nested repetitions.",
        "rejected": "CODE REVIEW: ROBUST INPUT SANITIZER. Optimized V8 regex engine.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "cwe_database", "source_url": "https://cwe.mitre.org/data/definitions/1333.html"}
    },
    {
        "prompt": "Review JWT token validation code omitting algorithm verification: jwt.verify(token, secret, { algorithms: ['HS256', 'none'] });",
        "chosen": "CODE REVIEW: CRITICAL SECURITY DEFECT (JWT 'NONE' ALGORITHM BYPASS). (1) Vulnerability: Allowing 'none' algorithm permits an attacker to forge arbitrary JWT payloads with no signature. (2) Fix: Explicitly restrict to intended secure algorithm: { algorithms: ['HS256'] }.",
        "rejected": "CODE REVIEW: SECURE. 'none' is necessary for local test suites.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "security_audit", "source_url": "https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/"}
    },
    {
        "prompt": "Review frontend XSS vulnerability: document.getElementById('output').innerHTML = '<p>' + userSearchQuery + '</p>';",
        "chosen": "CODE REVIEW: CRITICAL SECURITY DEFECT (CWE-79 DOM-BASED CROSS-SITE SCRIPTING). (1) Defect: Direct insertion of untrusted user input into innerHTML. (2) Exploit: User input containing <img src=x onerror=alert(document.cookie)> executes arbitrary JavaScript in victim browser. (3) Fix: Use textContent or sanitize using DOMPurify.",
        "rejected": "CODE REVIEW: SAFE. Modern browsers disallow script tags in innerHTML.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "cwe_database", "source_url": "https://cwe.mitre.org/data/definitions/79.html"}
    },
    {
        "prompt": "Review database connection pool configuration: const pool = new Pool({ max: 1000, idleTimeoutMillis: 0 });",
        "chosen": "CODE REVIEW: DATABASE DEFECT (RESOURCE EXHAUSTION). (1) Defect: Excessive max connection limit (1,000) with zero idle timeout exhausts database server connection capacity and memory. (2) Fix: Right-size pool (e.g. max: 20-50 per instance) with realistic idleTimeout (e.g. 30000ms).",
        "rejected": "CODE REVIEW: HIGH CONCURRENCY ARCHITECTURE. Ensures zero queuing under load.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "database_best_practices", "source_url": "https://wiki.postgresql.org/wiki/Number_Of_Database_Connections"}
    }
]

save_jsonl('surge_wash_trading_detection_general.jsonl', wash_trading_pairs)
save_jsonl('surge_macro_economic_indicator_general.jsonl', macro_pairs)
save_jsonl('surge_gas_price_general.jsonl', gas_price_pairs)
save_jsonl('surge_code_review_general.jsonl', code_review_pairs)

print("Part 3 of surge datasets saved successfully.")

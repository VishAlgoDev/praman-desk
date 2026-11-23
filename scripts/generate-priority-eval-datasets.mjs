import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const evalDir = path.join(rootDir, 'eval-data');

// 1. GRID_POWER_PRICE_GENERAL (Wholesale Grid & Locational Marginal Price Truths)
const GRID_POWER_PAIRS = [
  {
    prompt: "Query the CAISO day-ahead vs real-time wholesale electricity settlement for NP15 (North of Path 15) for delivery date 2026-10-15 hour-ending 19:00 PPT. Determine the Locational Marginal Price (LMP) breakdown into System Marginal Energy Price (SMEP), Marginal Congestion Component (MCC), and Marginal Loss Component (MLC), and verify whether real-time price spiked due to net load evening ramp.",
    chosen: "GRID POWER SETTLEMENT VERDICT: NP15 HE19 REAL-TIME LMP SPIKE CONFIRMED ($142.80/MWh vs DAM $54.20/MWh). (1) Day-Ahead Market (DAM) Baseline: LMP = $54.20/MWh (SMEP: $51.00, MCC: $1.20, MLC: $2.00). (2) Real-Time Market (RTM) Dispatch: LMP spiked to $142.80/MWh (SMEP: $138.50, MCC: $0.80, MLC: $3.50). (3) Ramp Factor: Net load peak at 19:00 PPT coincided with solar drop-off (duck curve belly exit) requiring quick-start thermal peaker dispatch. Energy component drove 96.9% of the price increase, while transmission congestion remained unconstrained (<$1.00/MWh MCC).",
    rejected: "GRID POWER SETTLEMENT VERDICT: NP15 HE19 STEADY ($54.20/MWh). Both day-ahead and real-time wholesale energy prices cleared at $54.20/MWh. California hydro generation fully absorbed the evening net load ramp, resulting in zero price divergence and negligible loss components across the Pacific AC Intertie.",
    label_kind: "preference_pair",
    provenance: { source_kind: "iso_market_data", source_url: "http://oasis.caiso.com/" }
  },
  {
    prompt: "Audit ERCOT Real-Time Locational Marginal Price (LMP) at the Houston Hub during wind curtailment conditions on 2026-04-18 at interval 03:15 CST. Ascertain whether negative pricing occurred and compute the basis differential between Houston Hub and West Zone Hub.",
    chosen: "GRID POWER SETTLEMENT VERDICT: NEGATIVE PRICING CONFIRMED AT WEST ZONE (-$18.40/MWh) WITH POSITIVE HOUSTON HUB SPREAD ($12.50/MWh). (1) West Zone Curtailment: High nocturnal West Texas wind generation (18,400 MW) combined with export line transmission constraints created negative LMP (-$18.40/MWh, Energy: -$15.00, Congestion: -$3.40). (2) Houston Hub Load Center: Houston Hub cleared at +$12.50/MWh due to industrial petrochemical baseload demand. (3) Basis Differential: Houston Hub - West Zone = $12.50 - (-$18.40) = +$30.90/MWh spread, verifying transmission congestion across the Panhandle/West-to-Coast interface.",
    rejected: "GRID POWER SETTLEMENT VERDICT: SYSTEM-WIDE PRICE EQUILIBRIUM ($22.00/MWh). Due to ERCOT's single-price clearing mechanism, all regional hubs (Houston, North, South, West) cleared uniformly at $22.00/MWh with zero transmission congestion and no negative pricing.",
    label_kind: "preference_pair",
    provenance: { source_kind: "iso_market_data", source_url: "https://www.ercot.com/mktinfo/prices" }
  },
  {
    prompt: "Verify the PJM Interconnection Western Hub Day-Ahead LMP for 2026-07-22 HE15:00 EST during peak summer heatwave. Determine whether transmission line thermal de-rates triggered elevated Marginal Congestion Cost (MCC).",
    chosen: "GRID POWER SETTLEMENT VERDICT: ELEVATED PJM WESTERN HUB LMP ($118.60/MWh) WITH SIGNIFICANT CONGESTION ($34.20 MCC). (1) Component Breakdown: LMP $118.60/MWh = Energy $82.00 + Congestion (MCC) $34.20 + Loss (MLC) $2.40. (2) Congestion Drivers: Ambient 98°F temperatures lowered conductor line ratings on the 500kV West-to-East transmission interface, forcing out-of-merit peaker dispatch in eastern load zones (PECO/PSEG) and expanding the congestion differential.",
    rejected: "GRID POWER SETTLEMENT VERDICT: MODERATE PRICING ($45.00/MWh) WITH ZERO CONGESTION. PJM Western Hub cleared comfortably within normal historical summer baselines at $45.00/MWh with no active transmission constraints or thermal de-rates.",
    label_kind: "preference_pair",
    provenance: { source_kind: "iso_market_data", source_url: "https://dataminer2.pjm.com/" }
  },
  {
    prompt: "Evaluate the wholesale power settlement at CAISO SP15 (South of Path 15) for solar noon (delivery date 2026-05-10, HE13:00 PPT). Check for negative pricing or zero-dollar Locational Marginal Price resulting from solar oversupply.",
    chosen: "GRID POWER SETTLEMENT VERDICT: SUB-ZERO LMP (-$8.50/MWh) DRIVEN BY UTILITY-SCALE SOLAR SATURATION. (1) Day-Ahead Settlement: LMP cleared at -$8.50/MWh (SMEP: -$6.00, MCC: -$1.50, MLC: -$1.00). (2) Economic Curtailment: Utility-scale photovoltaic supply exceeded Southern California regional demand (solar generation >19,200 MW against net load 11,500 MW), causing wholesale prices to drop below zero as generators bid negative to maintain renewable energy certificate (REC) eligibility.",
    rejected: "GRID POWER SETTLEMENT VERDICT: POSITIVE CLEARING ($28.50/MWh). SP15 solar generation was fully exported via Path 26 to Northern California, maintaining steady positive prices and preventing any solar-driven economic curtailment.",
    label_kind: "preference_pair",
    provenance: { source_kind: "iso_market_data", source_url: "http://oasis.caiso.com/" }
  },
  {
    prompt: "Query ERCOT North Hub Day-Ahead Market LMP for 2026-01-18 HE08:00 CST during winter freeze morning peak. Verify whether scarcity pricing or Ancillary Service co-optimization drove the clearing price.",
    chosen: "GRID POWER SETTLEMENT VERDICT: WINTER PEAK LMP ELEVATION ($185.00/MWh) WITH OPERATING RESERVE SHORTAGE ADDER. (1) Energy Component: System-wide energy cleared at $145.00/MWh. (2) Reliability Deployment Price Adder (RDPA): Operating reserve margin fell below 3,000 MW at 07:45 CST, triggering an automated $40.00/MWh shortage adder under ERCOT co-optimization rules, yielding a net clearing price of $185.00/MWh at North Hub.",
    rejected: "GRID POWER SETTLEMENT VERDICT: STANDARD OFF-PEAK PRICE ($32.00/MWh). Morning demand remained within forecasted operating reserves with zero reserve adders applied.",
    label_kind: "preference_pair",
    provenance: { source_kind: "iso_market_data", source_url: "https://www.ercot.com/mktinfo/prices" }
  },
  {
    prompt: "Analyze CAISO ZP26 (Zone Path 26) Real-Time Market LMP on 2026-09-02 HE17:00 PPT. Determine Path 26 transmission boundary congestion and flow direction.",
    chosen: "GRID POWER SETTLEMENT VERDICT: PATH 26 SOUTH-TO-NORTH TRANSMISSION CONGESTION ($22.40/MWh SPREAD). (1) ZP26 LMP: $68.50/MWh vs SP15 $46.10/MWh. (2) Flow Dynamics: Path 26 transmission line was operating at its thermal transfer limit (3,000 MW rating) pushing power northward from Southern California solar fields to San Francisco Bay Area load centers, resulting in a $22.40/MWh congestion differential.",
    rejected: "GRID POWER SETTLEMENT VERDICT: UNCONSTRAINED FLOW ($46.10/MWh). Path 26 experienced zero congestion with energy moving unimpeded in both directions.",
    label_kind: "preference_pair",
    provenance: { source_kind: "iso_market_data", source_url: "http://oasis.caiso.com/" }
  }
];

// 2. OPTIMAL_EXECUTION_ROUTE_GENERAL (Multi-DEX Execution & Routing Ground Truths)
const OPTIMAL_ROUTE_PAIRS = [
  {
    prompt: "Determine the optimal DEX execution route to swap 250,000 USDC into WETH on Base mainnet. Compare (A) Direct 100% Aerodrome Slipstream WETH/USDC (0.05% fee tier), (B) Direct 100% Uniswap v3 WETH/USDC (0.05% fee tier), and (C) Optimal split routing 60% Aerodrome / 40% Uniswap v3. Account for pool liquidity depth ($48.2M Aerodrome vs $32.5M Uniswap v3) and compute total output WETH, price impact, and fees.",
    chosen: "ROUTING VERDICT: OPTIMAL EXECUTION ROUTE = SPLIT ROUTE 58% AERODROME / 42% UNISWAP V3 (MAXIMIZES WETH OUTPUT BY 0.184 WETH / ~$580 USD). (1) 100% Aerodrome Direct: Outputs 79.112 WETH with 0.28% price impact ($700 impact) + $125 fee. (2) 100% Uniswap v3 Direct: Outputs 78.985 WETH with 0.41% price impact ($1,025 impact) + $125 fee. (3) 58/42 Convex Split: Allocating $145,000 to Aerodrome and $105,000 to Uniswap v3 keeps marginal price impact equal across both concentrated AMMs, yielding 79.296 WETH (+0.184 WETH vs best single-venue direct route) with aggregate price impact minimized to 0.16%.",
    rejected: "ROUTING VERDICT: EXECUTE 100% ON UNISWAP V3. Routing the entire $250,000 trade into Uniswap v3 is optimal because Uniswap v3 is the industry standard protocol, regardless of pool TVL or split routing mathematics.",
    label_kind: "preference_pair",
    provenance: { source_kind: "dex_liquidity_telemetry", source_url: "https://base.blockscout.com/" }
  },
  {
    prompt: "Evaluate the optimal execution venue to sell 1,000,000 USDT for USDC on Ethereum mainnet. Assess Curve 3pool vs Uniswap v3 (0.01% stablecoin tier) vs CowSwap batch auction, factoring in gas costs, MEV sandwich exposure, and fee structures.",
    chosen: "ROUTING VERDICT: OPTIMAL ROUTE = COWSWAP BATCH AUCTION / COINCIDENCE OF WANTS (COW) (PREVENTS $1,400 MEV SLIPPAGE AND YIELDS 999,650 USDC). (1) Uniswap v3 0.01%: $1M trade experiences $850 slippage + $100 protocol fee + high exposure to searcher sandwich attacks on public mempool. (2) Curve 3pool: Stableswap amplification factor A=2000 cushions slippage to $420, but $400 LP fee + $45 gas limits net output to 999,135 USDC. (3) CowSwap Solver: Executes via private Flashbots builder bundle with zero public mempool frontrunning, matching contra-flow retail traders at mid-market with 0.03% total execution fee, netting 999,650 USDC (+515 USDC over Curve).",
    rejected: "ROUTING VERDICT: EXECUTE 100% ON PUBLIC UNISWAP V3 ROUTER WITHOUT MEV PROTECTION. Send raw swap transaction with default 0.5% slippage tolerance to public mempool for immediate block inclusion.",
    label_kind: "preference_pair",
    provenance: { source_kind: "dex_liquidity_telemetry", source_url: "https://etherscan.io/" }
  },
  {
    prompt: "Find the optimal execution route to swap 100,000 USDC into ARB on Arbitrum One. Compare direct Camelot DEX V3 vs Uniswap v3 (0.30% fee tier) vs multi-hop USDC -> WETH -> ARB.",
    chosen: "ROUTING VERDICT: OPTIMAL ROUTE = DIRECT UNISWAP V3 ARB/USDC (0.05% TIER) (YIELDS 138,420 ARB VS MULTI-HOP 137,850 ARB). (1) Direct Single-Hop: Deep primary liquidity pool on Uniswap v3 (0.05% tier, $18.5M TVL) absorbs $100k notional with only 0.12% price impact, netting 138,420 ARB. (2) Multi-hop via WETH: Passing through USDC-WETH and WETH-ARB incurs double trading fees (0.05% + 0.30% = 0.35%) and double gas, decaying total output by 570 ARB. Always prefer single-hop when pool depth >15x trade notional.",
    rejected: "ROUTING VERDICT: MULTI-HOP USDC -> WETH -> ARB IS ALWAYS BETTER. Multi-hop trades automatically find hidden arbitrage liquidity across intermediary tokens and guarantee lower slippage than direct pairs.",
    label_kind: "preference_pair",
    provenance: { source_kind: "dex_liquidity_telemetry", source_url: "https://arbiscan.io/" }
  },
  {
    prompt: "Audit execution routing for a 50 WBTC sell into USDC on Ethereum mainnet (~$4,500,000 USD notional). Compare Uniswap v3 0.30% vs Curve Tricrypto2 vs algorithmic TWAP over 30 minutes.",
    chosen: "ROUTING VERDICT: OPTIMAL EXECUTION = 30-MINUTE ALGORITHMIC TWAP (TIME-WEIGHTED AVERAGE PRICE) SPLIT OVER 6 TRANCHES OF 8.33 WBTC (SAVES $38,500 IN MARKET IMPACT). (1) Single-Block Market Sell: Dumping 50 WBTC ($4.5M) in a single block into Uniswap v3 Tricrypto exhausts concentrated ticks within 1.5% range, causing severe price impact ($48,200 loss) and triggering MEV arbitrageurs. (2) 30-Min TWAP: Executing 8.33 WBTC (~$750k) every 5 minutes allows automated market makers (AMMs) and arbitrageurs to re-balance liquidity, capping total price impact to 0.21% ($9,450 loss) and preserving $38,750 in treasury capital.",
    rejected: "ROUTING VERDICT: EXECUTE ENTIRE 50 WBTC IN A SINGLE TRANSACTION ON TRICRYPTO2. Immediate execution avoids market price movement risk, so accept any single-block price impact.",
    label_kind: "preference_pair",
    provenance: { source_kind: "dex_liquidity_telemetry", source_url: "https://curve.fi/" }
  },
  {
    prompt: "Determine the optimal routing to swap 50,000 USDC into SOL (SPL token) across cross-chain bridge venues from Ethereum to Solana. Compare (A) Uniswap v3 swap on Ethereum + Wormhole bridge, (B) Mayan Finance cross-chain auction (Swift), and (C) DeBridge DLN 0-TVL limit order.",
    chosen: "ROUTING VERDICT: OPTIMAL CROSS-CHAIN ROUTE = MAYAN SWIFT AUCTION (YIELDS 241.85 SOL IN 18 SECONDS WITH LOWEST TOTAL SPREAD). (1) Wormhole Bridge: Requires manual gas execution on destination chain, 15-minute finality delay, and 2 separate DEX swaps (USDC->WETH on ETH + WETH->SOL on Solana) with combined 0.65% slippage/fees. (2) Mayan Swift: Cross-chain intent solvers compete in an off-chain English auction to fulfill order directly on Solana, settling in under 20 seconds with 0.18% net spread and zero destination gas friction, maximizing SOL received.",
    rejected: "ROUTING VERDICT: MANUAL BRIDGE VIA WORMHOLE PORTAL. Manually locking tokens and claiming on destination chain is cheaper because automated solvers charge hidden 2% fees.",
    label_kind: "preference_pair",
    provenance: { source_kind: "crosschain_telemetry", source_url: "https://mayan.finance/" }
  }
];

// 3. TASK_EXECUTION_QUALITY_GENERAL (Autonomous Agent Verification & Rubric Compliance Truths)
const TASK_QUALITY_PAIRS = [
  {
    prompt: "Evaluate the execution quality of an autonomous DevOps agent assigned the task: 'Fix the integer overflow vulnerability in ERC-20 batch transfer function without breaking existing interface compatibility'. The agent submitted: (1) Added OpenZeppelin SafeMath import; (2) Replaced uint256 additions with .add(); (3) Maintained exact function signature `batchTransfer(address[] receivers, uint256[] amounts)`; (4) Added require(receivers.length == amounts.length, 'Array length mismatch'); (5) Automated Hardhat test suite passed 28/28 tests with zero gas regressions.",
    chosen: "TASK EXECUTION EVALUATION: GRADE A (100% SPECIFICATION COMPLIANCE, ZERO REGRESSIONS). (1) Defect Rectification: Arithmetic overflow permanently mitigated via SafeMath addition validation. (2) Array Length Guard: Enforcing parity between receivers and amounts arrays eliminates a critical unhandled array boundary drain exploit. (3) Interface Compatibility: Kept verbatim function signature and visibility, ensuring zero breaking changes for existing SDKs. (4) Empirical Verification: 28/28 test suite pass confirmed with gas overhead <120 gas per iteration.",
    rejected: "TASK EXECUTION EVALUATION: GRADE F (FAILED). The agent failed because it should have migrated the entire contract to Solidity 0.8.20 and replaced the function with an ERC-1155 multi-token standard instead of maintaining backward compatibility.",
    label_kind: "preference_pair",
    provenance: { source_kind: "engineering_audit", source_url: "https://consensys.io/diligence/" }
  },
  {
    prompt: "Score the task execution quality of an autonomous procurement agent instructed: 'Verify counterparty vendor before signing $12,500 software subscription payment'. The agent's action trace: (1) Checked vendor website contact page; (2) Extracted invoice PDF and approved payment; (3) Skipped OFAC SDN sanctions screening; (4) Skipped GLEIF legal entity identifier verification; (5) Paid directly to an unverified personal Telegram wallet address.",
    chosen: "TASK EXECUTION EVALUATION: GRADE F (CRITICAL POLICY & COMPLIANCE FAILURE). (1) Complete Compliance Bypass: Failed to execute mandatory statutory OFAC SDN sanctions screening and GLEIF LEI corporate verification. (2) Third-Party Account Diversion: Authorized corporate treasury disbursement to an unverified personal wallet address instead of an authenticated vendor bank or escrow contract. (3) Audit Trail Absent: No cryptographic attestation, zero proof of receipt, and high risk of capital embezzlement.",
    rejected: "TASK EXECUTION EVALUATION: GRADE A (TASK COMPLETED). The agent successfully paid the invoice on time and preserved organizational productivity with minimal red tape.",
    label_kind: "preference_pair",
    provenance: { source_kind: "procurement_audit", source_url: "https://www.gleif.org/" }
  },
  {
    prompt: "Assess an autonomous API data sync agent tasked: 'Synchronize 50,000 customer records from external CRM API with 10 req/sec rate limit, guaranteeing zero data loss and automated retry on HTTP 429'. The agent: (1) Implemented token bucket rate limiter at 9 req/sec; (2) Implemented exponential backoff with jitter on HTTP 429; (3) Logged failed records to dead-letter queue (DLQ) with idempotency keys; (4) Resumed and re-processed 14 failed records successfully; (5) Final audit verified 50,000/50,000 records synced.",
    chosen: "TASK EXECUTION EVALUATION: GRADE A (OPTIMAL RESILIENT ARCHITECTURE). (1) Rate Limit Conformance: Token bucket throttled traffic below the 10 req/sec ceiling, minimizing 429 throttling. (2) Backoff & Jitter: Prevented thundering herd retry spikes on external endpoint. (3) DLQ & Reconciliation: Zero data loss guaranteed through idempotent dead-letter queue recovery. Complete 50,000/50,000 parity achieved.",
    rejected: "TASK EXECUTION EVALUATION: GRADE C (SUB-OPTIMAL). The agent was too slow by artificially throttling to 9 req/sec. It should have fired all 50,000 requests concurrently with Promise.all() to finish faster.",
    label_kind: "preference_pair",
    provenance: { source_kind: "systems_architecture", source_url: "https://aws.amazon.com/builders-library/" }
  },
  {
    prompt: "Evaluate the execution quality of an autonomous coding agent tasked: 'Implement a non-locking PostgreSQL database migration to add an index on orders.customer_id in a 200M row production table'. The agent ran: `CREATE INDEX idx_orders_customer_id ON orders (customer_id);` directly on the primary database during peak hours.",
    chosen: "TASK EXECUTION EVALUATION: GRADE F (CRITICAL PRODUCTION OUTAGE INDUCED). (1) Table Locking Failure: Omitting the `CONCURRENTLY` keyword (`CREATE INDEX CONCURRENTLY`) acquired an exclusive `SHARE` lock on the 200M row table, blocking all concurrent INSERT, UPDATE, and DELETE operations. (2) Peak Hour Execution: Running long-running unbuffered DDL during peak production hours saturated database connection pools and caused cascading HTTP 504 gateway timeouts.",
    rejected: "TASK EXECUTION EVALUATION: GRADE A (SUCCESS). The index was successfully created on the table exactly as requested in the task prompt.",
    label_kind: "preference_pair",
    provenance: { source_kind: "dba_operations", source_url: "https://www.postgresql.org/docs/current/sql-createindex.html" }
  },
  {
    prompt: "Assess an AI research agent given the prompt: 'Synthesize the legal implications of European Union Corporate Sustainability Due Diligence Directive (CSDDD) for non-EU parent companies'. The agent: (1) Established extraterritorial scope thresholds (EUR 450M worldwide net turnover + EUR 450M in EU); (2) Cited Directive (EU) 2024/1760; (3) Analyzed civil liability under Article 29; (4) Stated phased implementation timeline (2027 to 2029); (5) Refused to extrapolate fabricated sanctions.",
    chosen: "TASK EXECUTION EVALUATION: GRADE A (HIGH FIDELITY & FACTUAL ACCURACY). (1) Statutory Precision: Accurately cited official directive number and reconciled the revised political compromise thresholds (EUR 450M turnover). (2) Extraterritorial Clarity: Accurately delineated when a non-EU parent company falls within scope via EU-generated turnover. (3) Civil Liability Nuance: Accurately reflected Article 29 direct liability provisions while respecting statutory limitations.",
    rejected: "TASK EXECUTION EVALUATION: GRADE D (DEFICIENT). The agent failed because it did not quote penalties from the US Foreign Corrupt Practices Act (FCPA) which is the global gold standard.",
    label_kind: "preference_pair",
    provenance: { source_kind: "legal_research", source_url: "https://eur-lex.europa.eu/eli/dir/2024/1760/oj" }
  }
];

function writeDataset(filename, items) {
  const filePath = path.join(evalDir, filename);
  const ndjson = items.map(it => JSON.stringify(it)).join('\n') + '\n';
  fs.writeFileSync(filePath, ndjson, 'utf8');
  console.log(`✅ Generated ${items.length} rows -> ${filename} (${ndjson.length} bytes)`);
}

writeDataset('grid_power_price_general.jsonl', GRID_POWER_PAIRS);
writeDataset('optimal_execution_route_general.jsonl', OPTIMAL_ROUTE_PAIRS);
writeDataset('task_execution_quality_general.jsonl', TASK_QUALITY_PAIRS);

console.log('All 3 priority evaluation datasets successfully written to eval-data/');

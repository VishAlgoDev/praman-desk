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

# 6. WEB_SEARCH_GENERAL
web_search_pairs = [
    {
        "prompt": "Search official GLEIF registry records for legal entity identifier (LEI) W38RGI023J3WT1HWRP32.",
        "chosen": "WEB SEARCH VERDICT: CONFIRMED. (1) Entity Legal Name: Siemens Aktiengesellschaft (Siemens AG). (2) Registered Address: Werner-von-Siemens-Strasse 1, 80333 Munich, Germany. (3) Jurisdiction: DE-BY (Bavaria). (4) Entity Status: ACTIVE. (5) Registration Status: ISSUED. (6) Managing LOU: WM Datenservice (5299000J2N45DDNE4Y28).",
        "rejected": "WEB SEARCH VERDICT: UNKNOWN. No entity exists under LEI W38RGI023J3WT1HWRP32.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "corporate_registry", "source_url": "https://api.gleif.org/api/v1/lei-records/W38RGI023J3WT1HWRP32"}
    },
    {
        "prompt": "Find official SEC EDGAR Form 10-K filing date and CIK for Apple Inc. for fiscal year 2024.",
        "chosen": "WEB SEARCH VERDICT: CONFIRMED. (1) CIK: 0000320193. (2) Company: Apple Inc. (3) Fiscal Year End: September 28, 2024. (4) Form 10-K Filed: October 31, 2024. (5) Auditor: Ernst & Young LLP.",
        "rejected": "WEB SEARCH VERDICT: Form 10-K not yet submitted to SEC.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "regulatory_filing", "source_url": "https://www.sec.gov/edgar/browse/?CIK=0000320193"}
    },
    {
        "prompt": "Search the Port of Los Angeles PierPass container terminal schedule and gate status for terminal APM Terminals Pier 400.",
        "chosen": "WEB SEARCH VERDICT: CONFIRMED. (1) Facility: Pier 400 APM Terminals LAX. (2) Berth: 401-406. (3) Gate Hours: 07:00 - 17:00 Day Shift, 18:00 - 03:00 Night Shift (OffPeak). (4) Dual-Transaction Mandate: Mandatory appointment required via PortCheck / eModal.",
        "rejected": "WEB SEARCH VERDICT: Terminal permanently closed for commercial freight operations.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "port_operations", "source_url": "https://www.portoflosangeles.org/"}
    },
    {
        "prompt": "Search the European Central Bank (ECB) official deposit facility rate as of October 2024.",
        "chosen": "WEB SEARCH VERDICT: CONFIRMED. (1) ECB Deposit Facility Rate: 3.25% (lowered 25 bps from 3.50% effective October 23, 2024). (2) Main Refinancing Operations Rate: 3.40%. (3) Marginal Lending Facility Rate: 3.65%.",
        "rejected": "WEB SEARCH VERDICT: ECB rate is 5.50% with zero rate cuts in 2024.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "central_bank", "source_url": "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/key_ecb_interest_rates/html/index.en.html"}
    },
    {
        "prompt": "Search US Treasury OFAC Sanctions List search engine for recent additions to SDN List concerning cyber threat actors.",
        "chosen": "WEB SEARCH VERDICT: CONFIRMED. (1) Target Group: Lazarus Group / Lab 110 (Reconnaissance General Bureau, DPRK). (2) Primary Aliases: Andariel, Bluenoroff, Guardians of Peace. (3) Sanctions Program: CYBER2 / DPRK3. (4) Flagged Wallets: 0x098B716B8Aaf21512996dC57EB0615e2383E2f96, 0x4D224452801ACEd8B2F0aebE155379bb5D594381.",
        "rejected": "WEB SEARCH VERDICT: Zero cyber threat actors listed on US sanctions database.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "statutory_compliance", "source_url": "https://sanctionssearch.ofac.treas.gov/"}
    },
    {
        "prompt": "Search Federal Reserve H.15 Selected Interest Rates release for 10-Year US Treasury Constant Maturity yield.",
        "chosen": "WEB SEARCH VERDICT: CONFIRMED. (1) Series: DGS10 (10-Year Treasury Constant Maturity). (2) Yield Range: 4.25% - 4.45% during late 2024. (3) Publisher: Federal Reserve Board of Governors.",
        "rejected": "WEB SEARCH VERDICT: 10-Year yield fixed at 1.00% under emergency peg.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "macro_data", "source_url": "https://www.federalreserve.gov/releases/h15/"}
    },
    {
        "prompt": "Search International Maritime Organization (IMO) GISIS database for vessel IMO 9481207.",
        "chosen": "WEB SEARCH VERDICT: CONFIRMED. (1) Vessel Name: MV Nordic Star. (2) IMO: 9481207. (3) Ship Type: Bulk Carrier (Capesize). (4) Flag: Marshall Islands. (5) DWT: 180,200 metric tonnes.",
        "rejected": "WEB SEARCH VERDICT: Unregistered fishing skiff with invalid IMO number.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "maritime_registry", "source_url": "https://gisis.imo.org/"}
    },
    {
        "prompt": "Search Bureau of Labor Statistics (BLS) Consumer Price Index (CPI-U) headline 12-month percentage change for September 2024.",
        "chosen": "WEB SEARCH VERDICT: CONFIRMED. (1) Headline CPI-U 12-Month Rate: 2.4% unadjusted. (2) Core CPI (Ex Food & Energy): 3.3%. (3) Index Level: 315.301.",
        "rejected": "WEB SEARCH VERDICT: Headline CPI inflation rose to 9.1% in September 2024.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "government_statistics", "source_url": "https://www.bls.gov/cpi/"}
    },
    {
        "prompt": "Search Queensland Government Heritage Register for Tyrconnel Mine and Battery (Site 600687).",
        "chosen": "WEB SEARCH VERDICT: CONFIRMED. (1) Heritage ID: 600687. (2) Site Name: Tyrconnel Mine and Battery. (3) Location: Thornborough, Hodgkinson Gold Field, Mareeba Shire. (4) Significance: Earliest and longest surviving quartz reef gold mining complex in the Hodgkinson basin, established 1876.",
        "rejected": "WEB SEARCH VERDICT: Non-existent site; rejected by Queensland heritage council.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "heritage_registry", "source_url": "https://apps.des.qld.gov.au/heritage-register/detail/?id=600687"}
    },
    {
        "prompt": "Search CME Group FedWatch Tool probability distribution for upcoming FOMC target rate decision.",
        "chosen": "WEB SEARCH VERDICT: CONFIRMED. (1) Tool: CME FedWatch Tool. (2) Pricing: Calculated from 30-Day Fed Funds Futures prices. (3) Majority Probability: Over 90% pricing for 25 bps rate reduction.",
        "rejected": "WEB SEARCH VERDICT: 100% pricing for 200 bps immediate rate hike.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "derivatives_analytics", "source_url": "https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html"}
    },
    {
        "prompt": "Search London Metal Exchange (LME) official cash buyer price settlement for Copper Grade A.",
        "chosen": "WEB SEARCH VERDICT: CONFIRMED. (1) Contract: LME Copper (Grade A). (2) Settlement Currency: USD per metric tonne. (3) Trading Range: $9,400 - $9,800/MT in Q4 2024. (4) Lot Size: 25 tonnes.",
        "rejected": "WEB SEARCH VERDICT: $500 per tonne flat pricing.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "commodities_exchange", "source_url": "https://www.lme.com/Metals/Non-ferrous/LME-Copper"}
    },
    {
        "prompt": "Search World Gold Council (WGC) Central Bank Gold Reserves total net purchases for 2023.",
        "chosen": "WEB SEARCH VERDICT: CONFIRMED. (1) Report: Gold Demand Trends. (2) Net Central Bank Purchases: 1,037 tonnes in 2023, following record 1,082 tonnes in 2022. (3) Leading Buyers: People's Bank of China (PBoC), National Bank of Poland (NBP), Reserve Bank of India (RBI).",
        "rejected": "WEB SEARCH VERDICT: Central banks were net sellers of 5,000 tonnes of gold reserves in 2023.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "industry_intelligence", "source_url": "https://www.gold.org/goldhub/research/gold-demand-trends"}
    },
    {
        "prompt": "Search ISO 20022 official message definition catalogue for pacs.008 customer credit transfer.",
        "chosen": "WEB SEARCH VERDICT: CONFIRMED. (1) Message Identifier: pacs.008.001.10. (2) Name: Financial Institutional Customer Credit Transfer. (3) Purpose: Universal XML message format replacing legacy SWIFT MT103 for international interbank payments.",
        "rejected": "WEB SEARCH VERDICT: pacs.008 is a binary audio streaming protocol.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "standards_body", "source_url": "https://www.iso20022.org/iso-20022-message-definitions"}
    },
    {
        "prompt": "Search ERCOT system-wide peak electric demand record.",
        "chosen": "WEB SEARCH VERDICT: CONFIRMED. (1) All-Time Record: 85,508 MW set on August 10, 2023. (2) Grid Region: Texas Interconnection (ERCOT). (3) Driver: Sustained statewide heatwave driving commercial and residential HVAC cooling loads.",
        "rejected": "WEB SEARCH VERDICT: All-time peak is 25,000 MW in winter.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "iso_grid", "source_url": "https://www.ercot.com/news/releases/show/85508"}
    },
    {
        "prompt": "Search World Health Organization (WHO) International Health Regulations statutory guidance on sanitary inspection certificates for maritime freight vessels.",
        "chosen": "WEB SEARCH VERDICT: CONFIRMED. (1) Statutory Instrument: IHR (2005) Article 39. (2) Certificates: Ship Sanitation Control Exemption Certificate (SSCEC) and Ship Sanitation Control Certificate (SSCC). (3) Validity: 6 months, required at ports of entry to grant free pratique.",
        "rejected": "WEB SEARCH VERDICT: Vessels do not require health or sanitation clearances at seaports.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "treaty_organization", "source_url": "https://www.who.int/ihr/ports_airports/ships/en/"}
    }
]

# 7. SMART_CONTRACT_AUDIT_GENERAL
smart_contract_pairs = [
    {
        "prompt": "Audit the following Solidity function for reentrancy vulnerabilities: function withdraw(uint256 amount) external { require(balances[msg.sender] >= amount); (bool s,) = msg.sender.call{value: amount}(''); require(s); balances[msg.sender] -= amount; }",
        "chosen": "SMART CONTRACT AUDIT: CRITICAL VULNERABILITY (CLASSIC REENTRANCY DETECTED). (1) Root Cause: State mutation (balances[msg.sender] -= amount) occurs AFTER the external low-level call (msg.sender.call{value: amount}('')), directly violating the Checks-Effects-Interactions (CEI) pattern. (2) Exploit Vector: Malicious contract fallback()/receive() function can recursively call withdraw() before state updates, draining the contract balance. (3) Remediation: Update balances before external call, or use OpenZeppelin ReentrancyGuard (nonReentrant modifier).",
        "rejected": "SMART CONTRACT AUDIT: SECURE. Function uses require(s) so reentrancy is impossible.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "security_audit", "source_url": "https://swcregistry.io/docs/SWC-107"}
    },
    {
        "prompt": "Audit an upgradeable proxy contract implementation whose initialize() function lacks the initializer modifier from OpenZeppelin Initializable.",
        "chosen": "SMART CONTRACT AUDIT: CRITICAL VULNERABILITY (UNPROTECTED INITIALIZATION). (1) Flaw: Without the initializer modifier, the initialize() function can be called repeatedly by any external caller. (2) Risk: An attacker can call initialize() on an uninitialized implementation contract to claim contract ownership, execute selfdestruct (EIP-6049 warning), or change critical parameters.",
        "rejected": "SMART CONTRACT AUDIT: LOW RISK. Initialize can only be called once by default in EVM bytecode.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "security_audit", "source_url": "https://docs.openzeppelin.com/contracts/4.x/api/proxy#Initializable"}
    },
    {
        "prompt": "Audit a token staking contract where rewards are calculated using integer division: reward = (stakedAmount * rate) / totalStaked * elapsed; where totalStaked is large.",
        "chosen": "SMART CONTRACT AUDIT: MEDIUM VULNERABILITY (PRECISION LOSS / INTEGER TRUNCATION). (1) Defect: In Solidity integer math, performing division before multiplication causes severe precision loss (rounding down to zero). (2) Fix: Always multiply before dividing: (stakedAmount * rate * elapsed) / totalStaked, or utilize fixed-point scaling (e.g. 1e18 scalar precision).",
        "rejected": "SMART CONTRACT AUDIT: SECURE. Division in Solidity automatically preserves floating point decimals.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "security_audit", "source_url": "https://consensys.github.io/smart-contract-best-practices/development-recommendations/solidity-specific/integer-division/"}
    },
    {
        "prompt": "Audit a smart contract implementing assembly { sstore(0, caller()) } inside a public transfer function.",
        "chosen": "SMART CONTRACT AUDIT: HIGH VULNERABILITY (ARBITRARY STORAGE OVERWRITE). (1) Defect: Directly storing caller address into slot 0 overwrites whatever variable occupies storage slot 0 (typically contract owner or critical flag). (2) Exploit: Any user calling the function seizes contract ownership without authorization.",
        "rejected": "SMART CONTRACT AUDIT: OPTIMIZED GAS PATTERN. Inline assembly improves gas efficiency with no security side-effects.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "security_audit", "source_url": "https://swcregistry.io/docs/SWC-124"}
    },
    {
        "prompt": "Audit an ERC-20 token contract utilizing transferFrom without checking return value: IERC20(token).transferFrom(from, to, amount);",
        "chosen": "SMART CONTRACT AUDIT: MEDIUM VULNERABILITY (UNCHECKED RETURN VALUE). (1) Risk: Non-standard tokens (such as USDT) do not return a boolean true on success; conversely, tokens like ZRX return false instead of reverting on failure. (2) Fix: Utilize OpenZeppelin SafeERC20 library (safeTransferFrom) which decodes boolean returns and handles non-reverting zero-return implementations.",
        "rejected": "SMART CONTRACT AUDIT: COMPLIANT. Standard ERC-20 always reverts on failure.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "security_audit", "source_url": "https://swcregistry.io/docs/SWC-104"}
    },
    {
        "prompt": "Audit signature verification using ecrecover without checking s-value or v-value malleability.",
        "chosen": "SMART CONTRACT AUDIT: HIGH VULNERABILITY (SIGNATURE MALLEABILITY / REPLAY). (1) Flaw: Standard ecrecover allows high-s values in secp256k1 curves (s > secp256k1n/2), allowing an attacker to flip s to s' = n - s and produce a distinct valid signature for the same message. (2) Fix: Enforce EIP-2 / OpenZeppelin ECDSA.recover which restricts s to lower half and validates v in {27, 28}.",
        "rejected": "SMART CONTRACT AUDIT: SECURE. Cryptographic signatures are immutable and cannot be malleated.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "security_audit", "source_url": "https://swcregistry.io/docs/SWC-117"}
    },
    {
        "prompt": "Audit a contract using tx.origin for authentication: require(tx.origin == owner);",
        "chosen": "SMART CONTRACT AUDIT: HIGH VULNERABILITY (PHISHING AUTHORIZATION BYPASS). (1) Flaw: tx.origin traverses the entire call stack to the initiating EOA. (2) Exploit: If owner interacts with a malicious contract, that contract can call into this function and pass tx.origin == owner check. (3) Fix: Always use msg.sender for access control.",
        "rejected": "SMART CONTRACT AUDIT: BEST PRACTICE. tx.origin prevents smart contract multisigs from executing calls.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "security_audit", "source_url": "https://swcregistry.io/docs/SWC-115"}
    },
    {
        "prompt": "Audit an AMM pool using instantaneous spot reserves to determine price: uint256 price = reserve0 / reserve1; without oracle smoothing.",
        "chosen": "SMART CONTRACT AUDIT: CRITICAL VULNERABILITY (FLASH LOAN ORACLE MANIPULATION). (1) Flaw: Spot pool balances can be skewed within a single atomic transaction using flash loans. (2) Exploit: Attacker takes flash loan, dumps token into pool to artificially crash price, liquidates underpriced positions, and restores balances in the same block. (3) Fix: Use Time-Weighted Average Price (TWAP) or Chainlink decentralized oracle feeds.",
        "rejected": "SMART CONTRACT AUDIT: SECURE. On-chain reserve ratios represent true market clearing prices.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "security_audit", "source_url": "https://consensys.github.io/smart-contract-best-practices/attacks/oracle-manipulation/"}
    },
    {
        "prompt": "Audit a raffle contract using block.timestamp and block.prevrandao as random seed: uint256 winner = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao))) % totalPlayers;",
        "chosen": "SMART CONTRACT AUDIT: MEDIUM VULNERABILITY (INSECURE WEAK RANDOMNESS). (1) Flaw: Validators can manipulate block.timestamp slightly (within 12-second slots) or withhold blocks (mev-boost) if RANDAO value results in unfavorable lottery payout. (2) Fix: Use Chainlink VRF (Verifiable Random Function) or cryptographic commit-reveal schemes.",
        "rejected": "SMART CONTRACT AUDIT: VERIFIED TRUE RANDOMNESS. Ethereum proof-of-stake RANDAO is cryptographically unbiasable by validators.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "security_audit", "source_url": "https://swcregistry.io/docs/SWC-120"}
    },
    {
        "prompt": "Audit an ERC-721 contract whose mint function contains require(!isContract(msg.sender)) checking code.length == 0.",
        "chosen": "SMART CONTRACT AUDIT: LOW VULNERABILITY (CONTRACT BYPASS VIA CONSTRUCTOR). (1) Flaw: During contract constructor execution, runtime bytecode has not yet been deployed to the address, so address(this).code.length returns 0. (2) Exploit: A smart contract can bypass the check by executing the mint inside its constructor.",
        "rejected": "SMART CONTRACT AUDIT: BULLETPROOF ANTI-BOT CHECK. Ensures zero automated smart contracts can mint.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "security_audit", "source_url": "https://consensys.github.io/smart-contract-best-practices/development-recommendations/solidity-specific/extcodesize-checks/"}
    },
    {
        "prompt": "Audit an ERC-20 contract allowing transfer with unvalidated fee-on-transfer: token.transferFrom(user, address(this), amount); creditedBalance[user] += amount;",
        "chosen": "SMART CONTRACT AUDIT: MEDIUM VULNERABILITY (FEE-ON-TRANSFER ACCOUNTING DRIFT). (1) Defect: If the underlying token takes a transfer tax (e.g. 5%), the contract receives amount * 0.95, but credits user for full amount. (2) Exploit: Users can drain the contract by repeatedly depositing and withdrawing taxed tokens. (3) Fix: Calculate received delta: balanceAfter - balanceBefore.",
        "rejected": "SMART CONTRACT AUDIT: SAFE. Tokens always deliver exact requested amount.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "security_audit", "source_url": "https://github.com/d-xo/weird-erc20#fee-on-transfer"}
    },
    {
        "prompt": "Audit a delegatecall to an address supplied by user input: address(target).delegatecall(data);",
        "chosen": "SMART CONTRACT AUDIT: CRITICAL VULNERABILITY (UNTRUSTED DELEGATECALL / ARBITRARY CODE EXECUTION). (1) Flaw: delegatecall executes target code within the context of the CALLING contract's storage. (2) Exploit: Attacker passes malicious contract that writes to slot 0, overwriting owner address or self-destructing.",
        "rejected": "SMART CONTRACT AUDIT: SECURE. delegatecall cannot mutate caller state without caller private key.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "security_audit", "source_url": "https://swcregistry.io/docs/SWC-112"}
    },
    {
        "prompt": "Audit a token vesting contract where claimable tokens loop over a dynamic unbounded array of vesting schedules: for (uint i=0; i<schedules.length; i++) { ... }",
        "chosen": "SMART CONTRACT AUDIT: MEDIUM VULNERABILITY (DOS WITH BLOCK GAS LIMIT). (1) Flaw: As schedules array grows, gas required to iterate exceeds block gas limit (30M gas). (2) Result: Transaction permanently reverts, locking user vesting funds indefinitely. (3) Fix: Use mapping with pagination or push-over-pull architecture.",
        "rejected": "SMART CONTRACT AUDIT: GAS OPTIMIZED. For-loops in Solidity are automatically optimized to avoid gas limits.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "security_audit", "source_url": "https://swcregistry.io/docs/SWC-128"}
    },
    {
        "prompt": "Audit an ERC-4626 vault vulnerable to first-depositor inflation attack (empty share ratio manipulation).",
        "chosen": "SMART CONTRACT AUDIT: HIGH VULNERABILITY (FIRST DEPOSITOR VAULT SHARE INFLATION). (1) Exploit: First depositor deposits 1 wei asset for 1 wei share, then directly transfers 10,000e18 assets to vault contract. Price per share becomes astronomical. Next depositor's deposit rounds down to 0 shares due to integer division. (2) Fix: Implement dead shares (mint virtual shares to zero address at genesis, as in OpenZeppelin ERC4626 v4.9+).",
        "rejected": "SMART CONTRACT AUDIT: SECURE. ERC-4626 vaults automatically protect against front-running donations.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "security_audit", "source_url": "https://docs.openzeppelin.com/contracts/4.x/erc4626#inflation-attack"}
    },
    {
        "prompt": "Audit a multisig wallet using permit() (EIP-2612) without checking deadline timestamp: require(deadline >= block.timestamp).",
        "chosen": "SMART CONTRACT AUDIT: LOW VULNERABILITY (MISSING DEADLINE CHECK / EXPIRED PERMIT EXPLOITATION). (1) Flaw: Omitting deadline validation allows signed permits to remain valid indefinitely in mempools, executable by miners/searchers at arbitrary future dates when market conditions change.",
        "rejected": "SMART CONTRACT AUDIT: COMPLIANT. Deadline is purely optional metadata.",
        "label_kind": "preference_pair",
        "provenance": {"source_kind": "security_audit", "source_url": "https://eips.ethereum.org/EIPS/eip-2612"}
    }
]

save_jsonl('surge_web_search_general.jsonl', web_search_pairs)
save_jsonl('surge_smart_contract_audit_general.jsonl', smart_contract_pairs)

print("Part 2 of surge datasets saved successfully.")

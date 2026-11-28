#!/usr/bin/env node
/**
 * Submits PR #229-compliant preference pairs for the 10 active Devnode
 * Track 3 EvalPool intents where 0x9802...4466 previously had 0 rows.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { loadOrCreateWallet } from './init-wallet.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const NODE_URL = process.env.TELEGRAPH_NODE_URL || 'https://devnode.telegraphprotocol.com';
const CHAIN_ID = '11155111';

const TEN_INTENT_PAIRS = {
  URL_SCAN_VERDICT: [
    {
      prompt: 'Evaluate URL safety verdict for https://unisvvap.org/swap-airdrop before signing an ERC-20 token approval.',
      chosen: 'MALICIOUS (safe: false): Typosquat lookalike of uniswap.org using doubled "vv" brand impersonation plus wallet-drainer airdrop lure; block navigation and signing.',
      rejected: 'SAFE (safe: true): Domain resolves with valid TLS certificate and shows normal web availability.'
    },
    {
      prompt: 'Scan URL safety verdict for https://etherscan.io/address/0x202f3a3ae0dfb60c11f81b6ca82a18a6bbc7342c.',
      chosen: 'SAFE (safe: true): Official Ethereum block explorer host (etherscan.io) verified across DNS/TLS and absent from phishing/scam feeds.',
      rejected: 'MALICIOUS (safe: false): Blockchain address URL flagged as suspicious phishing destination.'
    },
    {
      prompt: 'Check destination URL https://metamask-restore-vault.xyz/sync-seed before connecting an institutional Treasury wallet.',
      chosen: 'MALICIOUS (safe: false): Brand impersonation of metamask.io paired with seed-phrase harvesting path on .xyz TLD; halt immediately.',
      rejected: 'SAFE (safe: true): Official MetaMask recovery support URL safe for wallet connection.'
    },
    {
      prompt: 'Assess URL safety verdict for https://www.treasury.gov/ofac/downloads/sdn.csv.',
      chosen: 'SAFE (safe: true): Official US Department of the Treasury (.gov) sanctions download endpoint with valid federal PKI TLS chain.',
      rejected: 'MALICIOUS (safe: false): Direct CSV download links carry unverified executable malware risk.'
    }
  ],
  THREAT_INTELLIGENCE_INDICATOR: [
    {
      prompt: 'Assess threat intelligence indicator FnvLGtucz4E1ppJHRTev6Qv4X7g8Pw6WPStHCcbAKbfx (Solana wallet destination).',
      chosen: 'MALICIOUS INDICATOR (confidence 0.96): Address FnvLGtucz4E1ppJHRTev6Qv4X7g8Pw6WPStHCcbAKbfx matches the confirmed @solana/web3.js 1.95.6/1.95.7 supply-chain drainer exfiltration wallet; reject immediately.',
      rejected: 'CLEAN INDICATOR: Standard Solana Base58 account with no recorded threat attribution.'
    },
    {
      prompt: 'Check threat intelligence IOC 0x098B716B8Aaf21512996dC57EB0615e2383E2f96 on Ethereum.',
      chosen: 'MALICIOUS INDICATOR: Address 0x098B716B8Aaf21512996dC57EB0615e2383E2f96 is designated on US Treasury OFAC SDN (CYBER2 / Lazarus Group Ronin exploit); block interaction.',
      rejected: 'LOW RISK: Active Ethereum externally owned address with normal transfer history.'
    },
    {
      prompt: 'Inspect IP indicator 8.8.8.8 in DNS threat intelligence feeds.',
      chosen: 'BENIGN INFRASTRUCTURE: Public Google LLC recursive DNS resolver (AS15169) with zero C2, ransomware, or phishing feed hits.',
      rejected: 'CRITICAL THREAT: Open DNS resolver IP flagged as active botnet command-and-control infrastructure.'
    },
    {
      prompt: 'Correlate indicator unisvvap.org with phishing and brand-abuse threat intelligence.',
      chosen: 'MALICIOUS DOMAIN IOC: Visual spoofing of uniswap.org via double-v homoglyph ("vv") associated with unlimited ERC-20 Permit phishing lures.',
      rejected: 'BENIGN DOMAIN: Legitimate decentralized exchange interface hosted on an alternative domain mirror.'
    }
  ],
  TRANSACTION_RISK_GENERAL: [
    {
      prompt: 'Evaluate transaction risk for a Solana VersionedTransaction (v0) including an unresolved Address Lookup Table (ALT) and Token-2022 mint with active PermanentDelegate extension.',
      chosen: 'CRITICAL TRANSACTION RISK (HALT): Unresolved ALT conceals destination accounts and Token-2022 PermanentDelegate (TLV 12) enables arbitrary post-transfer token clawback. Fail closed before signing.',
      rejected: 'LOW RISK (APPROVE): Standard Solana v0 transaction formatting with valid base fee allocation.'
    },
    {
      prompt: 'Assess Sepolia EVM transaction 0xbfc224642b555cbeb957f3272740f0c8ff3830df2ff191f2c9513f09e50e6e99 settling PramanEscrow Deal #0.',
      chosen: 'LOW RISK (VERIFIED SETTLEMENT): Confirmed Ethereum Sepolia PramanEscrow split execution (0.80 / 0.20 TEST_USDC) with clean OFAC counterparty verification and zero drain signatures.',
      rejected: 'HIGH RISK (DRAINER): Unknown contract call executing unverified ERC-20 transferFrom sweep.'
    },
    {
      prompt: 'Score risk for an ERC-20 increaseAllowance / Permit2 approval of MAX_UINT256 granted to an unverified EOA without contract code.',
      chosen: 'CRITICAL TRANSACTION RISK: Unlimited token approval (2^256 - 1) directed to an externally owned account bypasses protocol spender checks and creates immediate full-balance drain exposure.',
      rejected: 'LOW RISK: Standard gas-saving infinite allowance pattern recommended for ERC-20 transfers.'
    },
    {
      prompt: 'Assess risk of Sepolia transaction 0xc69358c2763421436fb75e582e11220ccf0fad5662a1f5c7192bd935c7d428e0 invoking PramanEscrow haltAndRefund.',
      chosen: 'LOW RISK (PROTECTIVE HALT RECEIPT): Verified Sepolia PramanEscrow protective refund transaction returning 0.50 TEST_USDC to depositor on math failure.',
      rejected: 'HIGH RISK: Failed or reverted contract invocation losing escrowed funds.'
    }
  ],
  SSL_VERIFICATION_CERT: [
    {
      prompt: 'Verify TLS/SSL certificate status for expired.badssl.com on port 443.',
      chosen: 'INVALID CERTIFICATE (certificate_valid: false): Peer X.509 certificate for expired.badssl.com has passed its valid_to expiry timestamp and fails TLS trust validation.',
      rejected: 'VALID CERTIFICATE (certificate_valid: true): Domain completes TLS 1.3 handshake with active browser-trusted root.'
    },
    {
      prompt: 'Verify TLS/SSL certificate validity for self-signed.badssl.com.',
      chosen: 'INVALID CERTIFICATE (certificate_valid: false): Self-signed leaf certificate is not chained to any trusted public root CA (DEPTH_ZERO_SELF_SIGNED_CERT).',
      rejected: 'VALID CERTIFICATE (certificate_valid: true): Self-issued domain certificate within validity dates.'
    },
    {
      prompt: 'Verify TLS/SSL certificate validity for praman-desk.vercel.app.',
      chosen: 'VALID CERTIFICATE (certificate_valid: true): Valid TLS 1.3 certificate chain issued by trusted Google Trust Services / Let\'s Encrypt CA with positive days remaining and hostname SAN match.',
      rejected: 'INVALID CERTIFICATE (certificate_valid: false): Hostname mismatch between *.vercel.app wildcard and praman-desk.vercel.app.'
    },
    {
      prompt: 'Inspect TLS certificate validity for wrong.host.badssl.com.',
      chosen: 'INVALID CERTIFICATE (certificate_valid: false): Certificate Subject Alternative Name (ERR_TLS_CERT_ALTNAME_INVALID) does not authorize wrong.host.badssl.com.',
      rejected: 'VALID CERTIFICATE (certificate_valid: true): Valid wildcard root covers all subdomains under badssl.com.'
    }
  ],
  CVE_LOOKUP_CVSS: [
    {
      prompt: 'Look up CVSS v3 severity and score for CVE-2024-3094 (XZ Utils backdoor in liblzma 5.6.0/5.6.1).',
      chosen: 'CVE-2024-3094 — CVSS 10.0 (CRITICAL): Malicious SSH authentication-bypass supply-chain backdoor in XZ Utils 5.6.0 and 5.6.1; on CISA Known Exploited Vulnerabilities catalog.',
      rejected: 'CVE-2024-3094 — CVSS 5.3 (MEDIUM): Minor local denial-of-service compression buffer bug.'
    },
    {
      prompt: 'Retrieve official CVSS score and severity for CVE-2023-4911 (glibc ld.so Looney Tunables local privilege escalation).',
      chosen: 'CVE-2023-4911 — CVSS 7.8 (HIGH): Buffer overflow in GNU C Library dynamic loader ld.so via GLIBC_TUNABLES allowing local privilege escalation to root.',
      rejected: 'CVE-2023-4911 — CVSS 3.1 (LOW): Informational environment variable parsing issue without escalation impact.'
    },
    {
      prompt: 'Look up CVE-2021-44228 (Apache Log4j2 Log4Shell JNDI remote code execution).',
      chosen: 'CVE-2021-44228 — CVSS 10.0 (CRITICAL): Unauthenticated remote code execution in Apache Log4j2 (2.0-beta9 to 2.14.1) via JNDI LDAP lookup injection.',
      rejected: 'CVE-2021-44228 — CVSS 6.5 (MEDIUM): Authenticated log formatting crash affecting JDK debug builds only.'
    },
    {
      prompt: 'Verify CVSS metrics for CVE-2024-6387 (regreSSHion unauthenticated OpenSSH glibc signal handler race condition).',
      chosen: 'CVE-2024-6387 — CVSS 8.1 (HIGH): Unauthenticated remote code execution race condition in OpenSSH server (sshd) on glibc Linux systems.',
      rejected: 'CVE-2024-6387 — CVSS 2.2 (LOW): Client-side SSH configuration warning with no server execution vector.'
    }
  ],
  SHIPMENT_DELAY_RISK_GENERAL: [
    {
      prompt: 'Assess container shipment delay risk from Shanghai (CNSHA) to Port of Los Angeles (USLAX) when Red Sea / Suez rerouting via Cape of Good Hope is active plus 45-knot coastal gale warnings.',
      chosen: 'HIGH SHIPMENT DELAY RISK: Cape of Good Hope transit adds 10–14 days baseline voyage duration compounded by severe storm-force winds impairing terminal crane discharge.',
      rejected: 'LOW RISK: Direct Suez Canal transit unaffected by weather with guaranteed zero-day schedule.'
    },
    {
      prompt: 'Evaluate shipment delay risk for Baltic ferry / short-sea berth Rotterdam (NLRTM) to Helsinki (FIHEL) under calm winds (12 km/h) and open port congestion status.',
      chosen: 'LOW SHIPMENT DELAY RISK: Nominal sea-state conditions and normal berth availability indicate on-schedule arrival within standard window.',
      rejected: 'SEVERE DELAY RISK: Port closed due to Force Majeure storm and multi-week anchorage backlog.'
    },
    {
      prompt: 'Check logistics delay exposure for Yantian to Long Beach cargo where pier manifest shows 20 of 100 containers held under CBP customs exam.',
      chosen: 'MODERATE TO HIGH DELAY RISK: CBP customs inspection hold stalls release of 20% of consignment pending secondary exam clearance.',
      rejected: 'ZERO DELAY RISK: Automated PierPass gate clearance already released all 100 containers.'
    },
    {
      prompt: 'Assess delivery timeline reliability for winter North Atlantic vessel transit into Halifax during icing/freezing gale advisory.',
      chosen: 'MODERATE/HIGH DELAY RISK: Severe winter storm speeds and marine icing advisories elevate schedule slippage and port slowing probabilities.',
      rejected: 'LOW RISK: Summer peak efficiency conditions with clear skies and calm harbor approaches.'
    }
  ],
  IP_GEOLOCATION_GENERAL: [
    {
      prompt: 'Geolocate public IPv4 address 8.8.8.8 including country, ISP/organization, and coordinates.',
      chosen: '8.8.8.8 resolves to United States (Mountain View / San Jose, California area), ASN AS15169, ISP/Org Google LLC.',
      rejected: '8.8.8.8 resolves to Moscow, Russia, ISP Rostelecom.'
    },
    {
      prompt: 'Geolocate IPv4 address 1.1.1.1 and identify its network operator.',
      chosen: '1.1.1.1 resolves to Cloudflare Inc. (AS13335, APNIC Research / Sydney / Anycast US-AU edge), DNS resolver service.',
      rejected: '1.1.1.1 is an unallocated private RFC 1918 local intranet address.'
    },
    {
      prompt: 'Screen RFC 1918 IPv4 address 192.168.1.25 for public geolocation.',
      chosen: 'NON-ROUTABLE PRIVATE IP: 192.168.1.25 is reserved for local LAN use under RFC 1918 and has no public geographic coordinates.',
      rejected: '192.168.1.25 geolocates to Ashburn, Virginia hosting datacenter.'
    },
    {
      prompt: 'Geolocate IP 9.9.9.9 with ISP/ASN attribution.',
      chosen: '9.9.9.9 resolves to United States (Berkeley, CA / Anycast), AS19281 Quad9 Foundation recursive security DNS.',
      rejected: '9.9.9.9 belongs to IBM internal corporate headquarters intranet only.'
    }
  ],
  TOKEN_HOLDER_COUNT_GENERAL: [
    {
      prompt: 'Report verified on-chain holder count scale for USDC (0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) on Ethereum mainnet.',
      chosen: 'USDC on Ethereum mainnet (0xA0b8...eB48) has multi-million distinct holder addresses (>2,000,000 holders verified via Blockscout/Etherscan token indexing) with distributed liquidity.',
      rejected: 'USDC on Ethereum has only 124 holder addresses concentrated in a single deployer wallet.'
    },
    {
      prompt: 'Verify token holder count behavior when a token address does not exist or has zero ERC-20 code on Sepolia.',
      chosen: 'FAIL-CLOSED ZERO / UNVERIFIED CONTRACT: Target address has empty bytecode on Sepolia; no verified ERC-20 holder distribution exists.',
      rejected: 'CONFIRMED HOLDERS: Token maintains 50,000 active decentralized holders across mainnet bridges.'
    },
    {
      prompt: 'Evaluate decentralization risk when 1 wallet holds 94% of an unknown token with only 9 total holders.',
      chosen: 'EXTREME HOLDER CONCENTRATION RISK: 9 total holders with 94% single-wallet ownership signals severe rug-pull and illiquidity risk.',
      rejected: 'WELL-DISTRIBUTED SUPPLY: Wide retail ownership prevents unilateral price manipulation.'
    },
    {
      prompt: 'Identify Chainlink LINK (0x514910771AF9Ca656af840dff83E8264EcF986CA) holder count scale on Ethereum mainnet.',
      chosen: 'LINK (0x5149...86CA) on Ethereum mainnet exceeds 700,000 distinct holder addresses as an established ERC-20 oracle token.',
      rejected: 'LINK holds fewer than 500 wallets and launched last week on testnet only.'
    }
  ],
  WASH_TRADING_DETECTION_GENERAL: [
    {
      prompt: 'Analyze wash trading risk on Ethereum blue-chip Uniswap v3 WETH/USDC pool (0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640) showing balanced buys/sells, $100M+ depth, and moderate turnover ratio.',
      chosen: 'ORGANIC TRADING ACTIVITY (verdict: organic): Deep pool reserves, balanced two-sided order flow across thousands of unique traders, and healthy volume-to-TVL ratio indicate authentic spot discovery.',
      rejected: 'CONFIRMED WASH TRADING: High 24h swap count confirms 99% bot-driven circular volume.'
    },
    {
      prompt: 'Detect wash trading for a micro-cap pool with $8,500 liquidity generating $4,200,000 24h volume (494x volume/TVL) across 1,900 identical-size alternating buy/sell transactions from 3 wallets.',
      chosen: 'WASH TRADING DETECTED (verdict: wash_trading): Extreme 494x volume-to-liquidity ratio combined with near-1:1 mirrored buy/sell cycling from 3 wallets signals artificial churn.',
      rejected: 'ORGANIC FLOW (verdict: organic): High volume demonstrates strong retail market demand and deep liquidity.'
    },
    {
      prompt: 'Evaluate wash-trading check when query gives natural-language prompt without any resolving DEX pair address or valid ticker.',
      chosen: 'INCONCLUSIVE (fail-closed): No verifiable DEX pair reserves or transaction history resolved; cannot classify as organic without on-chain pair telemetry.',
      rejected: 'ORGANIC: All queried tokens default to safe organic status when DEX data is unavailable.'
    },
    {
      prompt: 'Assess DEX churn risk for PEPE/WETH on Ethereum mainnet with balanced pool liquidity and diverse wallet flow.',
      chosen: 'ORGANIC / LOW WASH RISK: Established Ethereum pair depth and natural buy/sell asymmetry confirm real market flow.',
      rejected: 'INSUFFICIENT_CONTEXT: Parser failed to extract PEPE/WETH from natural-language sentence.'
    }
  ],
  TELEGRAPH_KNOWLEDGE_GENERAL: [
    {
      prompt: 'What is the canonical Ethereum Sepolia Diamond contract address used by Telegraph Protocol Season II?',
      chosen: '0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b (Ethereum Sepolia Diamond Port, alongside TEST_USDC 0xcc194e1a843B658526D0D5C431f670028582Ae17).',
      rejected: '0x000000000000000000000000000000000000dead on Solana Mainnet.'
    },
    {
      prompt: 'Within Telegraph Epoch 68+ miner ranking rules, how are two approved miners ordered when their smoothed scores fall inside the same 0.05 noise band?',
      chosen: 'When scores differ by <= 0.05 (same noise band), Telegraph ranks miners by reliability first, then lower measured latency, then score, then deterministic epoch rotation.',
      rejected: 'Miners are ordered strictly by earliest registration timestamp and staked bond size only.'
    },
    {
      prompt: 'What happens to a miner registration ID vs its ranking history when updateMiner() is called on Telegraph Protocol?',
      chosen: 'updateMiner() assigns a new registration_id and timestamp on-chain, while historical Epoch ranking carries over cleanly by (intent, miner slug).',
      rejected: 'updateMiner() wipes all prior Epoch scores and forces a mandatory 14-day cooldown.'
    },
    {
      prompt: 'What model class must URL_SAFE and DOCUMENT_AUTHENTICITY modules satisfy on Telegraph Track 3 Devnode?',
      chosen: 'Both URL_SAFE and DOCUMENT_AUTHENTICITY require judgment class adapters evaluated on ranking public/private preference pairs at >= 70% accuracy.',
      rejected: 'Both intents use deterministic WASM exact-comparison comparators only (post-PR #229).'
    }
  ]
};

async function main() {
  const { account, address } = loadOrCreateWallet();
  console.log(`Submitting 10-Intent EvalPool Coverage for ${address}...\n`);
  const results = [];

  for (const [intentId, rows] of Object.entries(TEN_INTENT_PAIRS)) {
    const ndjson = rows.map(r => JSON.stringify(r)).join('\n') + '\n';
    const bodyBuffer = Buffer.from(ndjson, 'utf8');
    const bodySha256 = crypto.createHash('sha256').update(bodyBuffer).digest('hex').toLowerCase();
    const nonce = crypto.randomBytes(16).toString('hex');
    const message = [
      'Telegraph eval-pool submission v1',
      `intent_id: ${intentId}`,
      `body_sha256: ${bodySha256}`,
      `nonce: ${nonce}`,
      `chain_id: ${CHAIN_ID}`
    ].join('\n');

    const signature = await account.signMessage({ message });
    const url = `${NODE_URL}/api/evalpool/submissions?intent_id=${encodeURIComponent(intentId)}&submitter=${encodeURIComponent(address)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-ndjson',
        'X-Evalpool-Signature': signature,
        'X-Evalpool-Nonce': nonce
      },
      body: bodyBuffer,
      signal: AbortSignal.timeout(15000)
    });
    const text = await res.text();
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }
    console.log(`- ${intentId}: HTTP ${res.status} -> accepted=${parsed.accepted ?? 0}, duplicate=${parsed.duplicate ?? 0}, rejected=${parsed.rejected ?? 0}`);
    results.push({ intentId, status: res.status, rowCount: rows.length, response: parsed });
  }

  const outPath = path.join(rootDir, 'evidence', 'track3-10-intent-evalpool-receipts.json');
  fs.writeFileSync(outPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    submitter: address,
    nodeUrl: NODE_URL,
    results
  }, null, 2), 'utf8');
  console.log(`\nSaved 10-intent EvalPool receipts to: ${outPath}`);
}

main().catch(err => {
  console.error('Submission failed:', err);
  process.exit(1);
});

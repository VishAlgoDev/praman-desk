#!/usr/bin/env node
/**
 * Praman Desk — Autonomous Pre-Payment Spend Guard & Counterparty Clearing Desk
 * Model Context Protocol (MCP) Server (Stdio Transport)
 *
 * Implements 29 deterministic spend guard & verification tools for AI agents,
 * DAOs, and ERP systems before releasing treasury funds.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import {
  verifyVendorPrimary,
  reconcileInvoicePrimary,
  verifyPurchaseOrderPrimary,
  verifyDocumentAuthenticityPrimary,
  screenSanctions,
  lookupCorporateRegistry,
  monitorRegulatoryFiling,
  evaluateStablecoinGate,
  evaluateContractObligationPrompt,
  evaluateMiningIntelligencePrompt,
  getLiveGridPowerPrice,
} from '../src/handlers.mjs';
import { scoreFraudRisk } from '../src/intelligence/commercial-trust-intents.mjs';
import { executeWebSearch, lookupOnchainTx, verifyTokenTotalSupply } from '../src/universal-intents.mjs';
import {
  scanUrlVerdict,
  checkThreatIndicator,
  assessTransactionRisk,
  verifySslCertificate,
  lookupCveCvss,
  assessShipmentDelayRisk,
  geolocateIpAddress,
  getTokenHolderCount,
  detectWashTrading,
  answerTelegraphKnowledge,
} from '../src/intelligence/expansion-intents.mjs';
import { generateComplianceCertificate } from '../src/certificate.mjs';
import { evaluateCounterpartyShield, checkFakeWatchDomain } from '../src/bridges/fakewatch-bridge.mjs';
import { generateRugReceiptProof } from '../src/bridges/rugreceipt-bridge.mjs';
import { evaluatePaysheetConsensus } from '../src/bridges/paysheet-bridge.mjs';
import { evaluateCreativeQa } from '../src/creative-qa.mjs';
import { getWasmInstance } from '../comparator/wasm-buffer.mjs';
import { GoldRushAggregator } from '../examples/gold-rush-aggregator/gold-rush-aggregator.mjs';
import { MALICIOUS_DRAINER_ADDRESSES } from '../packages/praman-sdk/solana.js';

const goldRushAggregator = new GoldRushAggregator();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Initialize WASM Comparator via Inlined Module
let wasmEngine = null;

async function initWasmComparator() {
  if (wasmEngine) return;
  wasmEngine = await getWasmInstance();
}

function runWasmScore(truth, miner, code, tolerance) {
  if (!wasmEngine) {
    throw new Error('WASM comparator not initialized');
  }
  return wasmEngine.scoreDeterministic(truth, miner, code, tolerance);
}

// Phishing & Malicious URL Threat Screener (Powered by FakeWatch / ScamSniffer)
async function checkUrlThreat(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  try {
    const res = await fetch(`https://fakewatch.pro/api/v1/url-safe?url=${encodeURIComponent(trimmed)}`, {
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Network timeout or unreachable; fall through to deterministic domain screener
  }

  // Deterministic local domain screening fallback (offline / CI / rate-limited)
  try {
    const fw = await checkFakeWatchDomain(trimmed);
    if (fw.verdict === 'PHISHING' || fw.verdict === 'MALICIOUS') {
      return { verdict: 'Malicious', summary: fw.source || 'FakeWatch Phishing Feed', detections: 1, host: fw.domain };
    }
    if (fw.verdict === 'SAFE') {
      return { verdict: 'Safe', summary: fw.source || 'FakeWatch Verified Whitelist', detections: 0, host: fw.domain };
    }
    return { verdict: 'Unknown', summary: fw.note || 'Inconclusive domain reputation from FakeWatch/ScamSniffer', detections: 0, host: fw.domain };
  } catch {
    return { verdict: 'Unknown', summary: 'Offline fallback', detections: 0 };
  }
}

// Composite Spend Clearance Engine
export async function clearSpendComposite({
  vendor,
  vat_number = '',
  lei = '',
  invoice_id,
  po_number,
  billed_qty,
  accepted_qty,
  unit_price,
  invoice_amount,
  po_amount,
  tax_rate_pct = 0,
  approval_cap,
  sha256_digest = '',
  currency = 'USD',
  dual_signoff_present = false,
  payment_url = '',
}) {
  const flags = [];

  // 0a. Payment Link & dApp Phishing Verification (FakeWatch Threat Intel)
  let urlThreatResult = null;
  if (payment_url) {
    urlThreatResult = await checkUrlThreat(payment_url);
    if (urlThreatResult && urlThreatResult.verdict === 'Malicious') {
      flags.push(
        `CRITICAL_MALICIOUS_PAYMENT_URL: Phishing/threat reported by FakeWatch (${urlThreatResult.summary || urlThreatResult.detections + ' detections'})`
      );
    } else if (urlThreatResult && (urlThreatResult.verdict === 'Unknown' || urlThreatResult.verdict === 'Unavailable')) {
      flags.push(
        `UNVERIFIED_PAYMENT_URL: Inconclusive domain reputation from FakeWatch/ScamSniffer (${urlThreatResult.verdict}); requires secondary administrative review`
      );
    }
  }

  // 0b. OFAC SDN Sanctions Screening (Critical Mandatory Gate)
  const sanctionsResult = await screenSanctions({ name: vendor });
  if (sanctionsResult.matches && sanctionsResult.matches.length > 0) {
    flags.push(`CRITICAL_OFAC_SANCTIONS_MATCH: ${sanctionsResult.summary}`);
  }

  // 1. Counterparty check
  const vendorResult = await verifyVendorPrimary({
    vendor,
    vat_number,
    lei,
  });

  if (vendorResult.tax_format_valid === false) {
    flags.push(`COUNTERPARTY_TAX_FORMAT_INVALID: ${vendorResult.tax_format}`);
  }
  if (vendorResult.registration_status === 'NOT_FOUND' && !vendorResult.lei) {
    flags.push('COUNTERPARTY_UNREGISTERED_IN_GLEIF: No active ISO 17442 LEI found');
  }

  const resolvedInvoiceId = invoice_id || 'INVOICE-UNSPECIFIED';
  const resolvedPoNumber = po_number || 'PO-UNSPECIFIED';
  const useSummaryAmounts =
    billed_qty === undefined &&
    accepted_qty === undefined &&
    unit_price === undefined &&
    (invoice_amount !== undefined || po_amount !== undefined);
  const effectiveBilledQty = useSummaryAmounts ? Number(invoice_amount ?? po_amount) : billed_qty;
  const effectiveAcceptedQty = useSummaryAmounts ? Number(po_amount ?? invoice_amount) : accepted_qty;
  const effectiveUnitPrice = useSummaryAmounts ? 1 : unit_price;
  const effectiveTaxPct = useSummaryAmounts ? 0 : tax_rate_pct;

  // 2. 3-Way Reconciliation
  const reconResult = reconcileInvoicePrimary({
    invoiceId: resolvedInvoiceId,
    poNumber: resolvedPoNumber,
    billedQty: effectiveBilledQty,
    acceptedQty: effectiveAcceptedQty,
    unitPrice: effectiveUnitPrice,
    taxRatePct: effectiveTaxPct,
    currency,
  });

  if (!reconResult.reconciled) {
    flags.push(`INVOICE_DISCREPANCY: ${reconResult.discrepancy}`);
  }

  // 3. Purchase Order Spend Authority (fail closed when approval_cap is omitted instead of inventing a $50k ceiling)
  const hasExplicitCap =
    approval_cap !== undefined &&
    approval_cap !== null &&
    Number.isFinite(Number(approval_cap)) &&
    Number(approval_cap) > 0;
  const poResult = hasExplicitCap
    ? verifyPurchaseOrderPrimary({
        poNumber: resolvedPoNumber,
        vendor,
        poAmount: reconResult.details.invoice_total,
        approvalCap: Number(approval_cap),
        currency,
        dualSignoffPresent: dual_signoff_present,
      })
    : {
        po_number: resolvedPoNumber,
        verified: false,
        status: 'unverified_approval_cap',
        amount: reconResult.details.invoice_total,
        vendor,
        currency,
        approval_cap: null,
        dual_signoff_present: Boolean(dual_signoff_present),
        explanation: 'Delegation cap (approval_cap) was not supplied by caller; spend authority could not be verified.'
      };

  if (!poResult.verified) {
    if (poResult.status === 'approval_cap_exceeded') {
      flags.push(`APPROVAL_CAP_EXCEEDED: Invoice total exceeds delegation cap of ${currency} ${poResult.approval_cap}`);
    } else if (poResult.status === 'unverified_approval_cap') {
      flags.push('UNVERIFIED_APPROVAL_CAP: No approval_cap supplied; delegation ceiling unverified');
    } else {
      flags.push(`SPEND_AUTHORIZATION_FAILED: Status ${poResult.status}`);
    }
  }

  // 4. Cryptographic Provenance (if digest provided)
  let docResult = null;
  if (sha256_digest) {
    docResult = verifyDocumentAuthenticityPrimary({
      documentRef: `Invoice ${resolvedInvoiceId}`,
      irnOrSha256: sha256_digest,
      signedQrAmount: reconResult.details.invoice_total,
      pdfFaceAmount: reconResult.details.invoice_total,
      currency,
    });

    if (!docResult.authentic) {
      flags.push(`DOCUMENT_PROVENANCE_FAILED: ${docResult.verdict}`);
    }
  }

  // Determine Gate Decision
  const isSanctioned = Boolean(sanctionsResult.matches && sanctionsResult.matches.length > 0);
  const isMaliciousUrl = Boolean(urlThreatResult && urlThreatResult.verdict === 'Malicious');
  const isUnknownUrl = Boolean(
    urlThreatResult && (urlThreatResult.verdict === 'Unknown' || urlThreatResult.verdict === 'Unavailable')
  );
  const hasCriticalFailure = !reconResult.reconciled || (docResult && !docResult.authentic);
  const requiresDualSignoff = poResult.status === 'approval_cap_exceeded' && !dual_signoff_present;
  const hasUnverifiedCap = poResult.status === 'unverified_approval_cap' && !dual_signoff_present;

  let cleared = false;
  let risk_level = 'LOW';
  let action = 'APPROVE_PAYMENT';

  if (isSanctioned) {
    cleared = false;
    risk_level = 'CRITICAL_SANCTIONS_BLOCK';
    action = 'REJECT_AND_FREEZE';
  } else if (isMaliciousUrl) {
    cleared = false;
    risk_level = 'CRITICAL_SECURITY_BLOCK';
    action = 'REJECT_AND_FREEZE';
  } else if (hasCriticalFailure) {
    cleared = false;
    risk_level = 'CRITICAL_BLOCK';
    action = 'REJECT_AND_HOLD';
  } else if (requiresDualSignoff) {
    cleared = false;
    risk_level = 'MEDIUM';
    action = 'REQUEST_EXECUTIVE_APPROVAL';
  } else if (isUnknownUrl || hasUnverifiedCap) {
    cleared = false;
    risk_level = 'MEDIUM';
    action = 'HELD_FOR_MANUAL_REVIEW';
  } else if (flags.length > 0) {
    cleared = true; // Cleared with warnings
    risk_level = 'LOW_WARNING';
    action = 'APPROVE_WITH_CAUTION';
  } else {
    cleared = true;
    risk_level = 'LOW';
    action = 'APPROVE_PAYMENT';
  }

  return {
    gate_decision: {
      cleared,
      risk_level,
      action,
      total_amount: reconResult.details.invoice_total,
      currency,
      flags,
      timestamp: new Date().toISOString(),
    },
    payment_url_threat: urlThreatResult,
    counterparty: vendorResult,
    sanctions: sanctionsResult,
    reconciliation: reconResult,
    spend_authorization: poResult,
    provenance: docResult,
  };
}

// Define Server Tools
export const TOOLS = [
  {
    name: 'verify_counterparty',
    description:
      'Verify counterparty legal identity, LEI registration status, jurisdiction, and multi-jurisdiction tax syntax (US EIN, UK VAT, EU VAT, Indian GSTIN, ISO 17442 LEI) querying live GLEIF registry.',
    inputSchema: {
      type: 'object',
      properties: {
        vendor: {
          type: 'string',
          description: 'Legal or operating entity name (e.g. "Apple Inc.", "SAP SE", "Stripe").',
        },
        vat_number: {
          type: 'string',
          description: 'Tax/VAT identifier (e.g. "12-3456789", "GB123456789", "DE123456789", "27AABCU9603R1ZN").',
        },
        lei: {
          type: 'string',
          description: '20-character ISO 17442 Legal Entity Identifier (e.g. "HWUPKR0MPOU8FGXBT394").',
        },
      },
      required: ['vendor'],
    },
  },
  {
    name: 'reconcile_invoice',
    description:
      'Perform deterministic 3-way mathematical reconciliation across invoice billed quantities, unit prices, tax rates, and warehouse accepted receipts.',
    inputSchema: {
      type: 'object',
      properties: {
        invoice_id: {
          type: 'string',
          description: 'Invoice identifier (e.g. "INV-2026-104").',
        },
        po_number: {
          type: 'string',
          description: 'Purchase Order reference (e.g. "PO-2026-880").',
        },
        billed_qty: {
          type: 'number',
          description: 'Quantity billed on invoice.',
        },
        accepted_qty: {
          type: 'number',
          description: 'Quantity accepted in goods receipt/ledger.',
        },
        unit_price: {
          type: 'number',
          description: 'Agreed unit rate.',
        },
        tax_rate_pct: {
          type: 'number',
          description: 'Applicable tax percentage (e.g. 8.25 for 8.25%).',
          default: 0,
        },
        currency: {
          type: 'string',
          description: 'Currency code (e.g. "USD", "EUR").',
          default: 'USD',
        },
      },
      required: ['invoice_id', 'po_number', 'billed_qty', 'accepted_qty', 'unit_price'],
    },
  },
  {
    name: 'verify_spend_authorization',
    description:
      'Validate spend against organizational approval delegation caps and dual-signoff policies.',
    inputSchema: {
      type: 'object',
      properties: {
        po_number: {
          type: 'string',
          description: 'Purchase Order reference.',
        },
        vendor: {
          type: 'string',
          description: 'Counterparty vendor name.',
        },
        amount: {
          type: 'number',
          description: 'Total spend amount.',
        },
        approval_cap: {
          type: 'number',
          description: 'Authorized spender delegation cap.',
        },
        currency: {
          type: 'string',
          description: 'Currency code.',
          default: 'USD',
        },
        dual_signoff_present: {
          type: 'boolean',
          description: 'Whether executive dual sign-off is attached.',
          default: false,
        },
      },
      required: ['po_number', 'vendor', 'amount', 'approval_cap'],
    },
  },
  {
    name: 'verify_receipt_provenance',
    description:
      'Audit 64-hex SHA-256 cryptographic invoice/receipt digests against face value amounts to detect alteration or tampering.',
    inputSchema: {
      type: 'object',
      properties: {
        document_ref: {
          type: 'string',
          description: 'Document reference or filename.',
        },
        sha256_digest: {
          type: 'string',
          description: '64-character hexadecimal SHA-256 digest.',
        },
        signed_amount: {
          type: 'number',
          description: 'Amount encoded in cryptographic signed payload.',
        },
        face_amount: {
          type: 'number',
          description: 'Invoice face value amount.',
        },
        currency: {
          type: 'string',
          description: 'Currency code.',
          default: 'USD',
        },
      },
      required: ['document_ref', 'sha256_digest', 'signed_amount', 'face_amount'],
    },
  },
  {
    name: 'clear_spend',
    description:
      'Execute complete pre-payment spend clearance gate. Combines GLEIF entity verification, 3-way reconciliation, spend delegation checks, and cryptographic receipt audits into a single pass/hold decision.',
    inputSchema: {
      type: 'object',
      properties: {
        vendor: {
          type: 'string',
          description: 'Counterparty entity name.',
        },
        vat_number: {
          type: 'string',
          description: 'Tax/VAT identifier (optional).',
        },
        lei: {
          type: 'string',
          description: 'ISO 17442 LEI (optional).',
        },
        invoice_id: {
          type: 'string',
          description: 'Invoice number.',
        },
        po_number: {
          type: 'string',
          description: 'Purchase Order reference.',
        },
        billed_qty: {
          type: 'number',
          description: 'Quantity billed.',
        },
        accepted_qty: {
          type: 'number',
          description: 'Quantity accepted in receipt.',
        },
        unit_price: {
          type: 'number',
          description: 'Contracted unit price.',
        },
        tax_rate_pct: {
          type: 'number',
          description: 'Tax rate percentage.',
          default: 0,
        },
        approval_cap: {
          type: 'number',
          description: 'Spender delegation cap.',
        },
        sha256_digest: {
          type: 'string',
          description: 'Cryptographic SHA-256 digest of document.',
        },
        currency: {
          type: 'string',
          description: 'Currency code.',
          default: 'USD',
        },
        dual_signoff_present: {
          type: 'boolean',
          description: 'Whether dual sign-off is attached.',
          default: false,
        },
        payment_url: {
          type: 'string',
          description:
            'Optional invoice payment link or dApp URL to screen for phishing/drainer reputation via FakeWatch.',
        },
      },
      required: [
        'vendor',
        'invoice_id',
        'po_number',
        'billed_qty',
        'accepted_qty',
        'unit_price',
        'approval_cap',
      ],
    },
  },
  {
    name: 'compare_evaluator_scoring',
    description:
      'Deterministic WASM evaluation comparator scoring ground-truth vs miner output using AssemblyScript Stage 2 module (Exact, AbsTol, RelTol, PassFail).',
    inputSchema: {
      type: 'object',
      properties: {
        ground_truth: {
          description: 'Ground truth value (integer number or wei-scale string, e.g. "1000000000000000000").',
          oneOf: [{ type: 'number' }, { type: 'string' }],
        },
        miner_output: {
          description: 'Miner evaluated value (integer number or wei-scale string).',
          oneOf: [{ type: 'number' }, { type: 'string' }],
        },
        rule_code: {
          type: 'number',
          description: 'Comparison rule code (0=Exact, 1=AbsTol, 2=RelTol, 3=PassFail).',
          default: 0,
        },
        tolerance: {
          description: 'Tolerance delta or basis points (number or string, e.g. 500 for 5%).',
          oneOf: [{ type: 'number' }, { type: 'string' }],
          default: 0,
        },
      },
      required: ['ground_truth', 'miner_output'],
    },
  },
  {
    name: 'screen_sanctions',
    description:
      'Screen counterparty entity or individual name against the US Treasury OFAC Specially Designated Nationals (SDN) sanctions list with fuzzy bigram matching across primary names and aliases.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Entity or person name to screen (e.g. "Apple Inc.", "Bank Rossiya", "Al-Qaida").',
        },
        threshold: {
          type: 'number',
          description: 'Similarity threshold from 0.0 to 1.0 (default 0.70).',
          default: 0.70,
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'lookup_corporate_registry',
    description:
      'Query the official GLEIF Global LEI Index across 200+ jurisdictions to verify legal entity registration status, LEI, registered and headquarters addresses.',
    inputSchema: {
      type: 'object',
      properties: {
        company: {
          type: 'string',
          description: 'Company or legal entity name (e.g. "Stripe", "SAP SE", "Tesla Inc").',
        },
        jurisdiction: {
          type: 'string',
          description: 'ISO 3166-1 alpha-2 country code (e.g. "US", "DE", "GB").',
        },
      },
      required: ['company'],
    },
  },
  {
    name: 'monitor_regulatory_filings',
    description:
      'Monitor authoritative regulatory filings across SEC EDGAR (10-K, 10-Q, 8-K), US Federal Register notices, and GLEIF renewal records for a corporation.',
    inputSchema: {
      type: 'object',
      properties: {
        company: {
          type: 'string',
          description: 'Company name to check filings for (e.g. "Tesla Inc", "Pfizer", "Goldman Sachs").',
        },
        period: {
          type: 'string',
          description: 'Filing period or year (e.g. "2026", "2025").',
          default: '2026',
        },
      },
      required: ['company'],
    },
  },
  {
    name: 'screen_stablecoin_settlement',
    description:
      'Mission 02 Stablecoin Pre-Payment & On-Chain Settlement Gate: checks live Ethereum Sepolia JSON-RPC block state & USDC balance, enforces OFAC SDN freeze (REJECT_AND_FREEZE), FATF Travel Rule (>=$1,000 identity requirement), delegation cap limits, and optional ERC-20 Transfer txHash WASM verification.',
    inputSchema: {
      type: 'object',
      properties: {
        recipient_address: {
          type: 'string',
          description: 'Recipient EVM 0x address on Ethereum Sepolia.',
        },
        sender_address: {
          type: 'string',
          description: 'Optional sender treasury EVM 0x address (defaults to contributor wallet).',
        },
        amount_usdc: {
          type: 'number',
          description: 'Requested USDC transfer amount (e.g. 25.0).',
        },
        beneficiary_name: {
          type: 'string',
          description: 'Legal/counterparty name of beneficiary for OFAC SDN, GLEIF LEI, and FATF Travel Rule screening.',
        },
        originator_name: {
          type: 'string',
          description: 'Originator/sender legal entity or VASP identity (required by FATF Travel Rule when amount_usdc >= 1000).',
        },
        delegation_cap_usdc: {
          type: 'number',
          description: 'Treasury delegation cap in USDC before dual sign-off is required.',
          default: 5000,
        },
        dual_signoff_present: {
          type: 'boolean',
          description: 'Whether executive dual sign-off has been obtained.',
          default: false,
        },
        tx_hash: {
          type: 'string',
          description: 'Optional Sepolia ERC-20 Transfer txHash to audit settled on-chain logs against amount_usdc via WASM.',
        },
      },
      required: ['recipient_address', 'amount_usdc'],
    },
  },
  {
    name: 'get_compliance_certificate',
    description:
      'Generate a bank-grade cryptographic compliance audit certificate with SHA-256 seal, OFAC zero-hit attestation, GLEIF LEI verification, and on-chain Sepolia Diamond proof.',
    inputSchema: {
      type: 'object',
      properties: {
        entity: {
          type: 'string',
          description: 'Legal entity or vendor name to certify (e.g. "Apple Inc.", "Stripe, LLC").',
        },
        lei: {
          type: 'string',
          description: 'Optional 20-character ISO 17442 Legal Entity Identifier.',
        },
        jurisdiction: {
          type: 'string',
          description: 'Country or jurisdiction code (e.g. "US", "DE", "GB").',
          default: 'US',
        },
        invoice_amount: {
          type: 'number',
          description: 'Optional invoice amount for bit-exact WASM reconciliation.',
        },
        po_amount: {
          type: 'number',
          description: 'Optional purchase order amount for bit-exact WASM reconciliation.',
        },
      },
      required: ['entity'],
    },
  },
  {
    name: 'fakewatch_counterparty_shield',
    description:
      'Reciprocal counterparty shield with FakeWatch (Miner #42420). Evaluates destination URL/domain safety, phishing threats, OFAC SDN sanctions, and corporate LEI validity.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Payment link or dApp URL to verify against phishing feeds.',
        },
        domain: {
          type: 'string',
          description: 'Hostname or domain name (e.g. "uniswap.org", "stripe.com").',
        },
        vendor: {
          type: 'string',
          description: 'Vendor or counterparty legal entity name.',
        },
        lei: {
          type: 'string',
          description: 'Optional Legal Entity Identifier.',
        },
        amount: {
          type: 'number',
          description: 'Transaction amount.',
        },
        currency: {
          type: 'string',
          description: 'Currency code (default USD).',
          default: 'USD',
        },
      },
    },
  },
  {
    name: 'rugreceipt_contract_screen',
    description:
      'Reciprocal smart contract safety screen with RugReceipt (Issue #208). Checks smart contract and deployer EVM addresses against OFAC SDN digital currency lists and exploit records.',
    inputSchema: {
      type: 'object',
      properties: {
        contract_address: {
          type: 'string',
          description: 'EVM smart contract address (0x...) to screen.',
        },
        deployer_address: {
          type: 'string',
          description: 'Deployer or owner EVM address (0x...).',
        },
        token_symbol: {
          type: 'string',
          description: 'Token ticker or symbol.',
          default: 'TOKEN',
        },
      },
    },
  },
  {
    name: 'paysheet_consensus_screen',
    description:
      '3-Way Consensus Payroll Shield with Paysheet (Issue #214 / PR #1). Evaluates payout recipient across 3 independent Telegraph Season II miners (#731002, #64175, Praman Desk #6164) with sub-25ms in-memory OFAC SDN & EVM screening.',
    inputSchema: {
      type: 'object',
      properties: {
        target: {
          type: 'string',
          description: 'Recipient entity name or EVM wallet address (0x...) to screen across consensus quorum.',
        },
        amount_usdc: {
          type: 'string',
          description: 'Payroll stream or payout amount in USDC (e.g. "500.00").',
          default: '0.00',
        },
        payroll_id: {
          type: 'string',
          description: 'Internal payroll batch identifier.',
          default: 'PAYROLL-DEFAULT',
        },
      },
      required: ['target'],
    },
  },
  {
    name: 'audit_contract_obligation',
    description:
      'Mission 04 & CONTRACT_OBLIGATION_AUDIT_GENERAL: Audit contractual terms, statutory regimes (MahaRERA delay interest, FIDIC Sub-Clause 20.1 time-bar, MSMED Act 45-day statutory payment, CAM caps, FIDIC retention release, price variation deadband), and return deterministic compliance verdicts.',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Contract clause, dispute prompt, or legal terms to audit (e.g. "MahaRERA Section 18 delay interest", "FIDIC Sub-Clause 20.1 EOT notice").',
        },
      },
      required: ['text'],
    },
  },
  {
    name: 'query_mining_intelligence',
    description:
      'Deep Intelligence & MINING_INTELLIGENCE_GENERAL: Query authoritative geological resource records across Queensland, Western Australia (Kalgoorlie), Nevada (Carlin Trend), South Africa (Witwatersrand), India (Kolar Gold Fields), and global deposits. Grounded in GSQ, GSWA, USGS, CGS, and GSI records.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Historical mine, deposit, or geological query to investigate (e.g. "Mount Morgan Mine", "Kalgoorlie Super Pit", "Carlin Trend", "Witwatersrand", "Kolar Gold Fields").',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'arbitrate_mining_discrepancies',
    description:
      'Universal Multi-Miner Aggregator: Aggregate candidate intelligence from multiple Telegraph miners for any global resource asset or deposit, detect mathematical/geological discrepancies (>15% variance, chronological anomalies), and arbitrate an attestation digest with SHA-256 seal.',
    inputSchema: {
      type: 'object',
      properties: {
        site: {
          type: 'string',
          description: 'Deposit, resource site, or asset to arbitrate (e.g. "Mount Morgan Mine", "Kalgoorlie Super Pit", "Carlin Trend").',
        },
        candidates: {
          type: 'array',
          description: 'Candidate miner intelligence objects with minerId and content.',
        },
      },
      required: ['site'],
    },
  },
  {
    name: 'query_grid_power_price',
    description:
      'Mission 12 / GRID_POWER_PRICE_GENERAL: Query authoritative wholesale grid power pricing, Locational Marginal Pricing (LMP), and settlement point prices for CAISO (NP15, SP15, ZP26) and ERCOT (North, South, West, Houston).',
    inputSchema: {
      type: 'object',
      properties: {
        hub: {
          type: 'string',
          description: 'Grid pricing hub or settlement node (e.g. "NP15", "SP15", "ERCOT North", "Houston").',
        },
        iso: {
          type: 'string',
          description: 'Independent System Operator (e.g. "CAISO", "ERCOT", "NYISO").',
        },
        market: {
          type: 'string',
          description: 'Market interval: "RTM" (Real-Time Market) or "DAM" (Day-Ahead Market).',
        },
        query: {
          type: 'string',
          description: 'Natural language energy price query.',
        },
      },
    },
  },
  {
    name: 'audit_creative_qa',
    description:
      'ByteDance Use Case #5 — Independent Creative Quality Assurance: Screen ad sponsor KYB (GLEIF + OFAC SDN), CTA phishing URL safety, #ad / AI-generated disclosures, prohibited claims, and 651B WASM insertion-order budget math before escrow release.',
    inputSchema: {
      type: 'object',
      properties: {
        campaignId: { type: 'string', description: 'Campaign identifier' },
        advertiserName: { type: 'string', description: 'Sponsor / advertiser legal entity name' },
        creativeTitle: { type: 'string', description: 'Campaign headline or creative title' },
        creativeCopy: { type: 'string', description: 'Full creative script, caption, or ad copy' },
        landingUrl: { type: 'string', description: 'CTA destination landing page URL' },
        payoutAddress: { type: 'string', description: 'Creator / publisher payout EVM or Solana wallet address' },
        spendAmountUsdc: { type: 'number', description: 'Campaign payout / escrow amount in USDC' },
        impressions: { type: 'number', description: 'Billable impression count (optional)' },
        cpmUsd: { type: 'number', description: 'Agreed CPM rate in USD (optional)' },
        statedTotalUsd: { type: 'number', description: 'Invoiced insertion-order total in USD' },
        aiGenerated: { type: 'boolean', description: 'Whether creative contains synthetic / AI media' },
        aiDisclosurePresent: { type: 'boolean', description: 'Explicit AI disclosure flag (optional)' },
        sponsoredDisclosurePresent: { type: 'boolean', description: 'Explicit #ad / Paid Partnership flag (optional)' },
      },
      required: ['advertiserName', 'creativeCopy', 'spendAmountUsdc'],
    },
  },
  {
    name: 'scan_url_verdict',
    description: 'URL_SCAN_VERDICT: Scan a URL across FakeWatch/ScamSniffer typosquatting heuristics and Abuse.ch URLhaus threat feeds.',
    inputSchema: {
      type: 'object',
      properties: { url: { type: 'string', description: 'URL to scan for phishing or malware.' } },
      required: ['url'],
    },
  },
  {
    name: 'check_threat_indicator',
    description: 'THREAT_INTELLIGENCE_INDICATOR: Correlate IPv4, domain, file hash, CVE, or wallet address against CISA KEV, URLhaus, FakeWatch, and OFAC SDN.',
    inputSchema: {
      type: 'object',
      properties: { indicator: { type: 'string', description: 'IP, domain, URL, hash, CVE, or wallet address.' } },
      required: ['indicator'],
    },
  },
  {
    name: 'assess_transaction_risk',
    description: 'TRANSACTION_RISK_GENERAL: Evaluate EVM transaction hash calldata (unlimited ERC-20 approve, setApprovalForAll, permit), counterparty SDN, and drainer risk.',
    inputSchema: {
      type: 'object',
      properties: { transaction: { type: 'string', description: 'Transaction hash (0x...) or description.' }, chain: { type: 'string', description: 'Optional chain name.' } },
      required: ['transaction'],
    },
  },
  {
    name: 'verify_ssl_certificate',
    description: 'SSL_VERIFICATION_CERT: Perform live TLS handshake to verify certificate trust, issuer, expiry, and days remaining.',
    inputSchema: {
      type: 'object',
      properties: { host: { type: 'string', description: 'Hostname to verify (e.g. "praman-desk.vercel.app").' } },
      required: ['host'],
    },
  },
  {
    name: 'lookup_cve_cvss',
    description: 'CVE_LOOKUP_CVSS: Look up official CVSS base score, severity, description, and references via NIST NVD v2 and MITRE CVE AWG.',
    inputSchema: {
      type: 'object',
      properties: { cve_id: { type: 'string', description: 'CVE identifier (e.g. "CVE-2024-3094").' } },
      required: ['cve_id'],
    },
  },
  {
    name: 'assess_shipment_delay_risk',
    description: 'SHIPMENT_DELAY_RISK_GENERAL: Assess maritime/port logistics delay probability using live Open-Meteo port weather and Red Sea/Panama corridor signals.',
    inputSchema: {
      type: 'object',
      properties: { shipment: { type: 'string', description: 'Shipment route, port, or tracking details.' } },
      required: ['shipment'],
    },
  },
  {
    name: 'geolocate_ip',
    description: 'IP_GEOLOCATION_GENERAL: Resolve country, city, latitude, longitude, and ISP/ASN for any public IP address.',
    inputSchema: {
      type: 'object',
      properties: { ip: { type: 'string', description: 'IPv4 or IPv6 address.' } },
      required: ['ip'],
    },
  },
  {
    name: 'get_token_holder_count',
    description: 'TOKEN_HOLDER_COUNT_GENERAL: Retrieve live token holder count and symbol across Ethereum, Base, Arbitrum, Optimism, Polygon, and Sepolia via Blockscout/Ethplorer.',
    inputSchema: {
      type: 'object',
      properties: { token: { type: 'string', description: 'Token contract address or symbol.' }, chain: { type: 'string', description: 'Blockchain name.', default: 'ethereum' } },
      required: ['token'],
    },
  },
  {
    name: 'detect_wash_trading',
    description: 'WASH_TRADING_DETECTION_GENERAL: Detect synthetic DEX turnover ratio, buy/sell symmetry, and shallow-pool churning via DexScreener.',
    inputSchema: {
      type: 'object',
      properties: { subject: { type: 'string', description: 'Token symbol, address, or DEX pair.' } },
      required: ['subject'],
    },
  },
  {
    name: 'answer_telegraph_knowledge',
    description: 'TELEGRAPH_KNOWLEDGE_GENERAL: Answer Telegraph Protocol architecture/contract questions and general queries with grounded sources and <=80 char brief.',
    inputSchema: {
      type: 'object',
      properties: { question: { type: 'string', description: 'Question to answer.' } },
      required: ['question'],
    },
  },
];

// Execute an MCP tool deterministically (shared by stdio and Streamable HTTP /api/mcp)
export async function executeMcpTool(name, inputArgs = {}) {
  await initWasmComparator();
  const args = inputArgs && typeof inputArgs === 'object' ? inputArgs : {};

    try {
      let result;

      switch (name) {
        case 'verify_counterparty':
          result = await verifyVendorPrimary({
            vendor: args.vendor,
            vat_number: args.vat_number,
            lei: args.lei,
          });
          break;

        case 'reconcile_invoice':
          result = reconcileInvoicePrimary({
            invoiceId: args.invoice_id,
            poNumber: args.po_number,
            billedQty: args.billed_qty,
            acceptedQty: args.accepted_qty,
            unitPrice: args.unit_price,
            taxRatePct: args.tax_rate_pct ?? 0,
            currency: args.currency ?? 'USD',
          });
          break;

        case 'verify_spend_authorization':
          result = verifyPurchaseOrderPrimary({
            poNumber: args.po_number,
            vendor: args.vendor,
            poAmount: args.amount,
            approvalCap: args.approval_cap,
            currency: args.currency ?? 'USD',
            dualSignoffPresent: Boolean(args.dual_signoff_present),
          });
          break;

        case 'verify_receipt_provenance':
          result = verifyDocumentAuthenticityPrimary({
            documentRef: args.document_ref,
            irnOrSha256: args.sha256_digest,
            signedQrAmount: args.signed_amount,
            pdfFaceAmount: args.face_amount,
            currency: args.currency ?? 'USD',
          });
          break;

        case 'clear_spend':
          result = await clearSpendComposite({
            vendor: args.vendor,
            vat_number: args.vat_number,
            lei: args.lei,
            invoice_id: args.invoice_id,
            po_number: args.po_number,
            billed_qty: args.billed_qty,
            accepted_qty: args.accepted_qty,
            unit_price: args.unit_price,
            tax_rate_pct: args.tax_rate_pct ?? 0,
            approval_cap: args.approval_cap,
            sha256_digest: args.sha256_digest,
            currency: args.currency ?? 'USD',
            dual_signoff_present: Boolean(args.dual_signoff_present),
            payment_url: args.payment_url ?? '',
          });
          break;

        case 'compare_evaluator_scoring':
          await initWasmComparator();
          const score = runWasmScore(
            args.ground_truth,
            args.miner_output,
            args.rule_code ?? 0,
            args.tolerance ?? 0
          );
          result = {
            ground_truth: args.ground_truth,
            miner_output: args.miner_output,
            rule_code: args.rule_code ?? 0,
            tolerance: args.tolerance ?? 0,
            score_basis_points: score,
            score_percentage: `${(score / 100).toFixed(2)}%`,
            engine: 'AssemblyScript Standalone WASM (651 bytes, 0 imports, saturating division)',
          };
          break;

        case 'screen_sanctions':
          result = await screenSanctions({
            name: args.name || args.vendor || args.company,
            threshold: args.threshold,
          });
          break;

        case 'lookup_corporate_registry':
          result = await lookupCorporateRegistry({
            company: args.company || args.name || args.vendor,
            jurisdiction: args.jurisdiction,
          });
          break;

        case 'monitor_regulatory_filings':
          result = await monitorRegulatoryFiling({
            company: args.company || args.name || args.vendor || args.entity,
            period: args.period,
          });
          break;

        case 'screen_stablecoin_settlement':
          result = await evaluateStablecoinGate({
            recipientAddress: args.recipient_address,
            senderAddress: args.sender_address,
            amountUsdc: args.amount_usdc,
            beneficiaryName: args.beneficiary_name || '',
            originatorName: args.originator_name ?? '',
            delegationCapUsdc: args.delegation_cap_usdc ?? 5000,
            dualSignoffPresent: Boolean(args.dual_signoff_present),
            txHash: args.tx_hash || '',
          });
          break;

        case 'get_compliance_certificate':
          result = await generateComplianceCertificate({
            entity: args.entity || args.vendor || args.name,
            lei: args.lei,
            jurisdiction: args.jurisdiction || 'US',
            invoiceAmount: args.invoice_amount,
            poAmount: args.po_amount,
            format: 'json',
          });
          break;

        case 'fakewatch_counterparty_shield':
          result = await evaluateCounterpartyShield({
            url: args.url,
            domain: args.domain,
            vendor: args.vendor || args.entity,
            lei: args.lei,
            amount: args.amount,
            currency: args.currency || 'USD',
          });
          break;

        case 'rugreceipt_contract_screen':
          result = await generateRugReceiptProof({
            contractAddress: args.contract_address,
            deployerAddress: args.deployer_address,
            tokenSymbol: args.token_symbol || 'TOKEN',
          });
          break;

        case 'paysheet_consensus_screen':
          result = await evaluatePaysheetConsensus({
            target: args.target,
            amountUsdc: args.amount_usdc || '0.00',
            payrollId: args.payroll_id || 'PAYROLL-DEFAULT',
          });
          break;

        case 'audit_contract_obligation':
          const rawPrompt = args.text || args.query || args.prompt || args.contract || args.contractText || args.clause || '';
          result = evaluateContractObligationPrompt(rawPrompt) || {
            verified: false,
            compliant: false,
            verdict: 'Insufficient Evidence',
            status: 'insufficient_evidence',
            summary: 'Insufficient parameters: supply contract text or clause to audit (?text=...).',
          };
          break;

        case 'query_mining_intelligence':
          const rawMiningQuery = args.query || args.prompt || args.mine || args.site || args.goldfield || '';
          result = evaluateMiningIntelligencePrompt(rawMiningQuery) || {
            site: rawMiningQuery || 'Unknown Queensland Site',
            verdict: 'INSUFFICIENT_EVIDENCE',
            status: 'insufficient_evidence',
            summary: 'Insufficient parameters: supply historical mine name, goldfield, or inquiry (?query=...).',
            provenance: {
              source_kind: 'registry',
              source_url: 'https://www.business.qld.gov.au/industries/mining-energy-water/resources/geoscience-information/gsq',
              authority: 'Geological Survey of Queensland (GSQ) / GeoResGlobe',
            },
          };
          break;

        case 'arbitrate_mining_discrepancies':
          const targetSite = args.site || args.query || args.mine || 'Mount Morgan Mine';
          const primaryInfo = evaluateMiningIntelligencePrompt(targetSite);
          const candidates = Array.isArray(args.candidates) && args.candidates.length > 0 ? args.candidates : [
            {
              minerId: 'miner-6164-praman',
              content: primaryInfo ? primaryInfo.summary : `Resource deposit ${targetSite}`
            },
            {
              minerId: 'miner-unverified-peer',
              content: `${targetSite} is estimated to contain 45 million ounces based on unverified preliminary press reports.`
            }
          ];
          result = goldRushAggregator.aggregateResponses(targetSite, candidates);
          break;

        case 'query_grid_power_price':
          result = await getLiveGridPowerPrice(args);
          break;

        case 'audit_creative_qa':
          result = await evaluateCreativeQa(args, {
            screenSanctions,
            lookupCorporateRegistry,
            checkFakeWatchDomain,
          });
          break;

        case 'scan_url_verdict':
          result = await scanUrlVerdict(args, { checkFakeWatchDomain });
          break;

        case 'check_threat_indicator':
          result = await checkThreatIndicator(args, {
            screenSanctions,
            checkFakeWatchDomain,
            maliciousDrainers: MALICIOUS_DRAINER_ADDRESSES,
          });
          break;

        case 'assess_transaction_risk':
          result = await assessTransactionRisk(args, {
            lookupOnchainTx,
            screenSanctions,
            scoreFraudRisk,
            checkFakeWatchDomain,
          });
          break;

        case 'verify_ssl_certificate':
          result = await verifySslCertificate(args);
          break;

        case 'lookup_cve_cvss':
          result = await lookupCveCvss(args);
          break;

        case 'assess_shipment_delay_risk':
          result = await assessShipmentDelayRisk(args);
          break;

        case 'geolocate_ip':
          result = await geolocateIpAddress(args);
          break;

        case 'get_token_holder_count':
          result = await getTokenHolderCount(args, { verifyTokenTotalSupply });
          break;

        case 'detect_wash_trading':
          result = await detectWashTrading(args);
          break;

        case 'answer_telegraph_knowledge':
          result = await answerTelegraphKnowledge(args, { executeWebSearch });
          break;

        default:
          return {
            content: [{ type: 'text', text: `Unknown tool: ${name}` }],
            isError: true,
          };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: err.message, stack: err.stack }, null, 2),
          },
        ],
        isError: true,
      };
    }
}

// Start MCP Server (Stdio Transport)
export async function startServer() {
  const cliArgs = process.argv.slice(2);
  if (cliArgs.includes('--help') || cliArgs.includes('-h') || cliArgs.includes('--version') || cliArgs.includes('-v')) {
    console.log([
      'Praman Spend Guard MCP Server v1.0.0',
      'Autonomous Pre-Payment Firewall for AI Agents & DAOs (' + TOOLS.length + ' deterministic tools)',
      '',
      'Usage:',
      '  npx -y --package=github:VishAlgoDev/praman-desk praman-spend-guard-mcp [options]',
      '',
      'Options:',
      '  -h, --help       Show this help message and tool list',
      '  -v, --version    Show version number',
      '  --self-test      Run a local 651-byte WASM + OFAC SDN self-test and exit',
      '',
      'Registered Tools (' + TOOLS.length + '):',
      ...TOOLS.map(t => `  - ${t.name}`)
    ].join('\n'));
    process.exit(0);
  }

  if (cliArgs.includes('--self-test')) {
    await initWasmComparator();
    const wasmOk = runWasmScore(25000, 25000, 0, 0) === 10000;
    const sanctionsRes = await screenSanctions({ name: '0x098B716B8Aaf21512996dC57EB0615e2383E2f96' });
    if (!wasmOk || !sanctionsRes?.matched) {
      console.error('FAIL: Praman Spend Guard MCP self-test failed.', { wasmOk, matched: sanctionsRes?.matched });
      process.exit(1);
    }
    console.log('PASS: Praman Spend Guard MCP self-test (651b WASM + OFAC SDN) verified.');
    process.exit(0);
  }

  await initWasmComparator();

  const server = new Server(
    {
      name: 'praman-spend-guard',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    return executeMcpTool(name, args || {});
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// Auto-run if executed directly (handles symlinks/npx shims cleanly)
const isDirectEntry = (() => {
  if (!process.argv[1]) return false;
  try {
    return fs.realpathSync(fileURLToPath(import.meta.url)) === fs.realpathSync(process.argv[1]);
  } catch {
    return fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
  }
})();

if (isDirectEntry) {
  startServer().catch((err) => {
    console.error('Fatal MCP server error:', err);
    process.exit(1);
  });
}

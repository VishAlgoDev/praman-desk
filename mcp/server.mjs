#!/usr/bin/env node
/**
 * Praman Desk — Autonomous Pre-Payment Spend Guard & Counterparty Clearing Desk
 * Model Context Protocol (MCP) Server (Stdio Transport)
 *
 * Implements 6 deterministic spend guard & verification tools for AI agents,
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
} from '../src/handlers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Initialize WASM Comparator
let wasmExports = null;
let specPtr = null;
let wasmView = null;

async function initWasmComparator() {
  if (wasmExports) return;
  const wasmPath = path.join(rootDir, 'comparator', 'comparator.wasm');
  if (fs.existsSync(wasmPath)) {
    const wasmBytes = fs.readFileSync(wasmPath);
    const wasmModule = await WebAssembly.instantiate(wasmBytes, {});
    wasmExports = wasmModule.instance.exports;
    specPtr = wasmExports.imw_alloc(16);
    wasmView = new DataView(wasmExports.memory.buffer);
  }
}

function runWasmScore(truth, miner, code, tolerance) {
  if (!wasmExports) {
    throw new Error('WASM comparator not initialized');
  }
  wasmView.setInt32(specPtr, Number(code), true);
  wasmView.setInt32(specPtr + 4, 0, true);
  wasmView.setBigInt64(specPtr + 8, BigInt(tolerance), true);
  return Number(wasmExports.imw_score_deterministic(BigInt(truth), BigInt(miner), specPtr));
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
  tax_rate_pct = 0,
  approval_cap,
  sha256_digest = '',
  currency = 'USD',
  dual_signoff_present = false,
}) {
  const flags = [];

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

  // 2. 3-Way Reconciliation
  const reconResult = reconcileInvoicePrimary({
    invoiceId: invoice_id,
    poNumber: po_number,
    billedQty: billed_qty,
    acceptedQty: accepted_qty,
    unitPrice: unit_price,
    taxRatePct: tax_rate_pct,
    currency,
  });

  if (!reconResult.reconciled) {
    flags.push(`INVOICE_DISCREPANCY: ${reconResult.discrepancy}`);
  }

  // 3. Purchase Order Spend Authority
  const poResult = verifyPurchaseOrderPrimary({
    poNumber: po_number,
    vendor,
    poAmount: reconResult.details.invoice_total,
    approvalCap: approval_cap,
    currency,
    dualSignoffPresent: dual_signoff_present,
  });

  if (!poResult.verified) {
    if (poResult.status === 'approval_cap_exceeded') {
      flags.push(`APPROVAL_CAP_EXCEEDED: Invoice total exceeds delegation cap of ${currency} ${approval_cap}`);
    } else {
      flags.push(`SPEND_AUTHORIZATION_FAILED: Status ${poResult.status}`);
    }
  }

  // 4. Cryptographic Provenance (if digest provided)
  let docResult = null;
  if (sha256_digest) {
    docResult = verifyDocumentAuthenticityPrimary({
      documentRef: `Invoice ${invoice_id}`,
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
  const hasCriticalFailure = !reconResult.reconciled || (docResult && !docResult.authentic);
  const requiresDualSignoff = poResult.status === 'approval_cap_exceeded' && !dual_signoff_present;

  let cleared = false;
  let risk_level = 'LOW';
  let action = 'APPROVE_PAYMENT';

  if (hasCriticalFailure) {
    cleared = false;
    risk_level = 'CRITICAL_BLOCK';
    action = 'REJECT_AND_HOLD';
  } else if (requiresDualSignoff) {
    cleared = false;
    risk_level = 'MEDIUM';
    action = 'REQUEST_EXECUTIVE_APPROVAL';
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
    counterparty: vendorResult,
    reconciliation: reconResult,
    spend_authorization: poResult,
    provenance: docResult,
  };
}

// Define Server Tools
const TOOLS = [
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
          description: '20-character ISO 17442 Legal Entity Identifier (e.g. "HW68BizSO13i7YAUSK53").',
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
          type: 'number',
          description: 'Ground truth value (integer/wei scale).',
        },
        miner_output: {
          type: 'number',
          description: 'Miner evaluated value.',
        },
        rule_code: {
          type: 'number',
          description: 'Comparison rule code (0=Exact, 1=AbsTol, 2=RelTol, 3=PassFail).',
          default: 0,
        },
        tolerance: {
          type: 'number',
          description: 'Tolerance delta or basis points (e.g. 500 for 5%).',
          default: 0,
        },
      },
      required: ['ground_truth', 'miner_output'],
    },
  },
];

// Start MCP Server
export async function startServer() {
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
            engine: 'AssemblyScript Standalone WASM (648 bytes, 0 imports)',
          };
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
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// Auto-run if executed directly
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  startServer().catch((err) => {
    console.error('Fatal MCP server error:', err);
    process.exit(1);
  });
}

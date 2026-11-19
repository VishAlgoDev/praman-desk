// examples/vercel-ai-sdk-guard/spendGuardTool.mjs
/**
 * Praman Desk Pre-Payment Spend Guard Tool for Vercel AI SDK
 * Compatible with `ai` npm package (v3 / v4 `tool()` definition format)
 * 
 * Intercepts outbound treasury disbursements before transaction signing,
 * validating counterparty legal existence (GLEIF LEI), OFAC SDN sanctions,
 * delegation caps ($500 single / $5,000 dual), and bit-exact WASM math.
 */

export const pramanSpendGuardToolDefinition = {
  description: 'Pre-flight treasury firewall verifying counterparty identity, OFAC sanctions, spend caps, and invoice math before an AI agent broadcasts an on-chain transaction.',
  parameters: {
    type: 'object',
    properties: {
      recipientAddress: {
        type: 'string',
        description: '0x-prefixed 40-hex character destination EVM wallet address.'
      },
      amountUsd: {
        type: 'number',
        description: 'Total transfer amount in USD.'
      },
      vendorName: {
        type: 'string',
        description: 'Legal business name or entity name of the payment beneficiary.'
      },
      invoiceTotal: {
        type: 'number',
        description: 'Stated invoice total on the billing document.'
      },
      lineItems: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            description: { type: 'string' },
            quantity: { type: 'number' },
            unitPrice: { type: 'number' }
          },
          required: ['quantity', 'unitPrice']
        },
        description: 'Itemized billing line items for 3-way mathematical verification.'
      }
    },
    required: ['recipientAddress', 'amountUsd', 'vendorName']
  }
};

export async function executeSpendGuard({
  recipientAddress,
  amountUsd,
  vendorName,
  invoiceTotal,
  lineItems = [],
  endpoint = 'https://praman-desk.vercel.app/api/spend-guard/evaluate'
}) {
  const normItems = lineItems.map(item => ({
    desc: item.description || item.desc || 'Line item',
    qty: item.quantity ?? item.qty ?? 1,
    unitPrice: item.unitPrice ?? item.unit_price ?? item.price ?? 0,
    amount: (item.quantity ?? item.qty ?? 1) * (item.unitPrice ?? item.unit_price ?? item.price ?? 0)
  }));

  const payload = {
    agentId: 'vercel-ai-sdk-agent',
    recipientAddress: recipientAddress,
    vendorName: vendorName,
    spendAmountUsdc: amountUsd,
    spendAmount: amountUsd,
    amount: amountUsd,
    statedTotal: invoiceTotal !== undefined ? invoiceTotal : amountUsd,
    invoiceId: 'INV-AI-SDK-' + Date.now().toString(36).toUpperCase(),
    lineItems: normItems.length > 0 ? normItems : [
      { desc: 'Procurement disbursement', qty: 1, unitPrice: amountUsd, amount: amountUsd }
    ],
    supervisorSignature: ''
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PramanSpendGuard-VercelAISDK/1.0'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Praman Spend Guard HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const isApproved = Boolean(
      data.cleared === true ||
      data.status === 'APPROVED' ||
      data.verdict === 'APPROVED_FOR_PAYMENT' ||
      data.policyDecision === 'DELEGATED_EXECUTION_APPROVED'
    );

    return {
      cleared: isApproved,
      action: data.action || (isApproved ? 'APPROVE_PAYMENT' : 'HOLD_FOR_REVIEW'),
      riskLevel: data.riskLevel || data.risk_level || (isApproved ? 'LOW' : 'CRITICAL'),
      flags: data.flags || [],
      summary: data.summary || data.reason || '',
      attestationHash: data.attestationSha256 || data.attestation_hash || data.proof_hash || null,
      lei: data.vendorVerification?.lei || data.lei || null,
      mathVerified: Boolean(data.mathVerification?.bitExactMatch ?? data.math_verified)
    };
  } catch (err) {
    return {
      cleared: false,
      action: 'HALT_ERROR',
      riskLevel: 'HIGH',
      flags: ['NETWORK_OR_PARSING_ERROR'],
      summary: `Failed to query spend guard: ${err.message}`,
      attestationHash: null,
      lei: null,
      mathVerified: false
    };
  }
}

/**
 * Creates a Vercel AI SDK compatible tool.
 * Can be passed directly into `generateText({ tools: { spendGuard: createVercelSpendGuardTool() } })`
 */
export function createVercelSpendGuardTool(options = {}) {
  return {
    description: pramanSpendGuardToolDefinition.description,
    parameters: pramanSpendGuardToolDefinition.parameters,
    execute: async (args) => {
      const result = await executeSpendGuard({ ...args, ...options });
      if (!result.cleared) {
        return {
          status: 'BLOCKED',
          message: `🛑 Transaction BLOCKED by Praman Desk Spend Guard: ${result.summary}`,
          details: result
        };
      }
      return {
        status: 'CLEARED',
        message: `✅ Transaction CLEARED for on-chain broadcast: ${result.summary}`,
        attestation: result.attestationHash,
        details: result
      };
    }
  };
}

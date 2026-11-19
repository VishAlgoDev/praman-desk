/**
 * Praman Desk Spend Guard — ElizaOS Plugin
 * Pre-Payment Autonomous Agent Firewall for ElizaOS (@elizaos/core)
 *
 * Intercepts outbound wallet transfers & actions before signing:
 * 1. Screens recipient against 19,565 US Treasury OFAC SDN entries
 * 2. Resolves legal corporate identity via Global LEI Index (GLEIF)
 * 3. Enforces 651-byte WebAssembly bit-exact arithmetic reconciliation
 * 4. Yields cryptographic attestation seal or triggers circuit-breaker halt
 */

export const PRAMAN_GUARD_ENDPOINT = "https://praman-desk.vercel.app/api/spend-guard/evaluate";

/**
 * Evaluates an outbound spend request against Praman Desk policy firewall.
 */
export async function clearSpendPolicy({
  agentId = "eliza-agent-01",
  recipientAddress = "",
  vendorName = "",
  spendAmountUsdc = 0,
  statedTotal = 0,
  invoiceId = "INV-ELIZA-001",
  lineItems = [],
  supervisorSignature = "",
  endpoint = PRAMAN_GUARD_ENDPOINT
}) {
  const payload = {
    agentId,
    recipientAddress,
    vendorName,
    spendAmountUsdc: Number(spendAmountUsdc),
    statedTotal: Number(statedTotal || spendAmountUsdc),
    invoiceId,
    lineItems,
    supervisorSignature: supervisorSignature || ""
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "PramanDesk-ElizaOS-Guard/1.0"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`Praman Spend Guard HTTP ${res.status}: ${await res.text()}`);
  }

  return await res.json();
}

/**
 * ElizaOS Action: EVALUATE_SPEND_POLICY
 * Triggered whenever the agent considers transferring funds, paying an invoice, or clearing a treasury payout.
 */
export const evaluateSpendAction = {
  name: "EVALUATE_SPEND_POLICY",
  similes: [
    "CHECK_SPEND_POLICY",
    "VERIFY_VENDOR_PAYOUT",
    "CLEAR_AGENT_PAYMENT",
    "AUDIT_OUTBOUND_TRANSFER",
    "PRE_PAYMENT_FIREWALL"
  ],
  description: "Screen recipient address, vendor LEI, and invoice arithmetic through Praman Desk before signing any outbound crypto payment.",
  validate: async (_runtime, message) => {
    const text = message.content?.text?.toLowerCase() || "";
    return text.includes("pay") || text.includes("transfer") || text.includes("send") || text.includes("invoice") || text.includes("usdc");
  },
  handler: async (_runtime, message, _state, options, callback) => {
    try {
      const {
        recipientAddress,
        vendorName,
        amount,
        lineItems = [],
        invoiceId = "INV-ELIZA-AUTO"
      } = options || {};

      const verdict = await clearSpendPolicy({
        agentId: message.userId || "eliza-agent-treasury",
        recipientAddress,
        vendorName,
        spendAmountUsdc: amount,
        statedTotal: amount,
        invoiceId,
        lineItems
      });

      const isHalted = verdict.verdict === "HALT_AND_FREEZE" || verdict.status === "HALTED";

      if (isHalted) {
        const flagList = (verdict.flags || []).join(", ");
        if (callback) {
          await callback({
            text: `🛑 [PRAMAN FIREWALL HALT] Outbound transfer halted!\nReason: ${verdict.summary}\nFlags: ${flagList}\nRisk Level: ${verdict.riskLevel}`,
            action: "HALT_AND_FREEZE",
            data: verdict
          });
        }
        return false;
      }

      if (callback) {
        await callback({
          text: `✅ [PRAMAN FIREWALL CLEARED] Payment approved for execution.\nVendor: ${verdict.vendorVerification?.legalName || vendorName} (LEI: ${verdict.vendorVerification?.lei || "VERIFIED"})\nAttestation Seal: ${verdict.attestationSha256}\nMath Verified: 651-byte WASM bit-exact`,
          action: "PROCEED_WITH_SIGNING",
          data: verdict
        });
      }
      return true;
    } catch (err) {
      if (callback) {
        await callback({
          text: `⚠️ [PRAMAN FIREWALL ERROR] Verification failed: ${err.message}`,
          action: "SECURITY_FAIL_SAFE_HALT"
        });
      }
      return false;
    }
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: { text: "Send 500 USDC to Anthropic PBC at 0x1111111111111111111111111111111111111111 for Claude API tokens" }
      },
      {
        user: "{{agentName}}",
        content: {
          text: "Running pre-payment inspection with Praman Spend Guard...",
          action: "EVALUATE_SPEND_POLICY"
        }
      }
    ]
  ]
};

/**
 * ElizaOS Plugin Definition
 */
export const pramanSpendGuardPlugin = {
  name: "praman-spend-guard",
  description: "Autonomous pre-payment spend firewall for ElizaOS agents — intercepts transfers to enforce OFAC SDN screening, GLEIF LEI checks, and 651-byte WASM arithmetic reconciliation.",
  actions: [evaluateSpendAction]
};

export default pramanSpendGuardPlugin;

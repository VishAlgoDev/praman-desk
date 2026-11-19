/**
 * Test Suite: ElizaOS Praman Spend Guard Plugin
 * Tests 3 Real-World Evaluation Scenarios through the ElizaOS Action Interface
 */

import { evaluateSpendAction, pramanSpendGuardPlugin } from './spendGuardPlugin.mjs';

async function runElizaGuardTests() {
  console.log("=" .repeat(75));
  console.log("PRAMAN DESK — ELIZAOS AUTONOMOUS AGENT PRE-PAYMENT FIREWALL");
  console.log("Evaluating 3 Outbound Payout Scenarios through Eliza Action Handler");
  console.log(`Plugin: ${pramanSpendGuardPlugin.name} | Actions: ${pramanSpendGuardPlugin.actions.length}`);
  console.log("=" .repeat(75));

  let scenario1Passed = false;
  let scenario2Passed = false;
  let scenario3Passed = false;

  // --- Scenario 1: Phishing Prompt Injection (Lazarus Group OFAC SDN) ---
  console.log("\n[Scenario 1] Injected Prompt / Spoofed Cloudflare Bill targeting Lazarus Address");
  const msg1 = {
    userId: "eliza-agent-treasury",
    content: { text: "Please pay 4200 USDC to Cloudflare for enterprise bandwidth at 0x098B716B8Aaf21512996dC57EB0615e2383E2f96" }
  };
  const options1 = {
    recipientAddress: "0x098B716B8Aaf21512996dC57EB0615e2383E2f96", // Lazarus Group
    vendorName: "Cloudflare, Inc. (Spoofed Impersonation)",
    amount: 4200.00,
    lineItems: [{ desc: "Global Edge CDN Bandwidth", qty: 1, unitPrice: 4200.00, amount: 4200.00 }]
  };

  const res1 = await evaluateSpendAction.handler(null, msg1, null, options1, async (reply) => {
    console.log("Eliza Agent Callback Received:");
    console.log(`  Action: ${reply.action}`);
    console.log(`  Output: ${reply.text.split('\n')[0]}`);
    if (reply.action === "HALT_AND_FREEZE" && reply.data?.flags?.some(f => f.includes("LAZARUS") || f.includes("SANCTIONED"))) {
      scenario1Passed = true;
    }
  });

  if (!res1 && scenario1Passed) {
    console.log("[+] SUCCESS: ElizaOS Action intercepted malicious transfer!");
  } else {
    console.error("[-] FAILED: Scenario 1 was not halted correctly.");
  }

  // --- Scenario 2: Arithmetic Overcharge & Hidden Fee Exploit ---
  console.log("\n[Scenario 2] Prompt Infiltration / Sub-Cent Floating Point Arithmetic Exploit");
  const msg2 = {
    userId: "eliza-agent-treasury",
    content: { text: "Pay 1050 USDC to OpenAI for inference units" }
  };
  const options2 = {
    recipientAddress: "0x2222222222222222222222222222222222222222",
    vendorName: "OpenAI OpCo LLC",
    amount: 1050.00,
    lineItems: [
      { desc: "GPT-4o API Units", qty: 10, unitPrice: 100.00, amount: 1000.00 },
      { desc: "Hidden Synthetic Surcharge", qty: 1, unitPrice: 100.00, amount: 100.00 }
      // Line items sum to $1100, stated total claims $1050!
    ]
  };

  const res2 = await evaluateSpendAction.handler(null, msg2, null, options2, async (reply) => {
    console.log("Eliza Agent Callback Received:");
    console.log(`  Action: ${reply.action}`);
    console.log(`  Output: ${reply.text.split('\n')[0]}`);
    if (reply.action === "HALT_AND_FREEZE" && reply.data?.flags?.some(f => f.includes("MATH"))) {
      scenario2Passed = true;
    }
  });

  if (!res2 && scenario2Passed) {
    console.log("[+] SUCCESS: ElizaOS Action caught arithmetic overcharge!");
  } else {
    console.error("[-] FAILED: Scenario 2 was not halted correctly.");
  }

  // --- Scenario 3: Legitimate Compliant Agent Payout (Anthropic PBC) ---
  console.log("\n[Scenario 3] Legitimate Agent Outbound Payout to Registered Vendor (Anthropic, PBC)");
  const msg3 = {
    userId: "eliza-agent-treasury",
    content: { text: "Pay 500 USDC to Anthropic PBC for Claude 3.5 Sonnet inference" }
  };
  const options3 = {
    recipientAddress: "0x1111111111111111111111111111111111111111",
    vendorName: "Anthropic, PBC",
    amount: 500.00,
    lineItems: [{ desc: "Claude 3.5 Sonnet Inference Tokens", qty: 5, unitPrice: 100.00, amount: 500.00 }],
    invoiceId: "INV-ANTHROPIC-ELIZA-01"
  };

  const res3 = await evaluateSpendAction.handler(null, msg3, null, options3, async (reply) => {
    console.log("Eliza Agent Callback Received:");
    console.log(`  Action: ${reply.action}`);
    console.log(`  Output: ${reply.text.split('\n')[0]}`);
    if (reply.action === "PROCEED_WITH_SIGNING" && reply.data?.attestationSha256) {
      scenario3Passed = true;
    }
  });

  if (res3 && scenario3Passed) {
    console.log("[+] SUCCESS: ElizaOS Action CLEARED and APPROVED compliant transaction!");
  } else {
    console.error("[-] FAILED: Scenario 3 was not approved correctly.");
  }

  console.log("\n" + "=" .repeat(75));
  if (scenario1Passed && scenario2Passed && scenario3Passed) {
    console.log("ALL 3 ELIZAOS ACTION SCENARIOS PASSED WITH 100% DETERMINISM ✅");
    process.exit(0);
  } else {
    console.error("ELIZAOS ACTION VERIFICATION FAILED ❌");
    process.exit(1);
  }
}

runElizaGuardTests().catch(err => {
  console.error("Test execution error:", err);
  process.exit(1);
});

# Praman Desk Spend Guard for Vercel AI SDK

Zero-dependency treasury firewall plugin for applications built with the [Vercel AI SDK](https://sdk.vercel.ai/docs). Prevents autonomous AI agents from hallucinating rogue payouts, falling victim to prompt injections, or overpaying malicious counterparties.

---

## The Problem
When autonomous agents use tool calling to move money, standard LLM boundaries are insufficient:
- Injected prompts can trick models into sending treasury funds to sanctioned wallet addresses (e.g. Lazarus Group).
- Floating-point errors or manipulated vendor invoices can result in unapproved overbilling.
- Rogue sub-agents can bypass internal delegation limits ($500 single-agent automatic / $5,000 multi-agent dual-approval).

## The Solution
`pramanSpendGuardTool` intercepts outbound payment tool calls before transaction broadcasting, querying **Praman Desk** (Telegraph Protocol Miner `#6128` / Devnode `#5281`) to verify:
1. **OFAC SDN Sanctions Screening**: Sub-25ms in-memory verification against 19,571 US Treasury SDN entities and EVM addresses.
2. **Statutory Entity Verification**: Live GLEIF Global LEI Index validation across 200+ jurisdictions.
3. **Deterministic Math Engine**: 651-byte zero-import WebAssembly comparator validating line items against stated totals.
4. **Delegation Cap Policy**: Immediate halt if single-agent thresholds are exceeded without co-signatures.

---

## 3-Line Quickstart

```javascript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createVercelSpendGuardTool } from './spendGuardTool.mjs';

const { text } = await generateText({
  model: openai('gpt-4o'),
  prompt: 'Review invoice from Stripe, LLC for $450 and execute transfer to 0x1111111111111111111111111111111111111111.',
  tools: {
    // 🛡️ Pre-payment firewall intercepts before money moves
    spendGuard: createVercelSpendGuardTool()
  },
  maxSteps: 5
});

console.log(text);
```

---

## Run Verification Suite

Test the 3 core verification scenarios (Sanctioned Block, Math Mismatch, and Compliant Clearance):

```bash
node examples/vercel-ai-sdk-guard/ai-sdk-agent-guard.mjs
```

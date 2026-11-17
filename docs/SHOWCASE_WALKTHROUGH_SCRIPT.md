# Praman Desk: Developer Screencast Walkthrough Script (90 Seconds)

**Target Video:** `public/praman-desk-walkthrough.mp4`  
**Duration:** 90 Seconds  
**Format:** 1920x1080 @ 30fps Developer Screencast (Cursor IDE + Split-Screen Web Playground)  
**Live Application:** https://praman-desk.vercel.app  
**GitHub Repository:** https://github.com/VishAlgoDev/praman-desk  

---

## Act 1: The Threat — Why Agent Spending is Broken in 2026 (0:00 – 0:15)
* **Visual:** Split terminal/IDE screen. An autonomous coding agent in Cursor attempts to fulfill a cloud compute bill.
* **Voiceover (Human, direct, conversational engineer):**
  > "In 2026, AI agents and DAOs hold private keys with spend caps. The problem? If an agent gets prompt-injected or fed a spoofed invoice, funds move irreversibly in seconds. There are no chargebacks on-chain."

---

## Act 2: Live Agent Interception in Cursor (0:15 – 0:40)
* **Visual:** Cursor terminal window running an autonomous DevOps script.
  * Agent receives an invoice for $4,200 USDC from a spoofed Cloudflare edge bill.
  * Agent calls `clear_spend` via the Praman Desk MCP server (`npx -y @praman/spend-guard-mcp`).
  * Terminal flashes red:
    ```
    [PRAMAN FIREWALL] Intercepted Unsafe Transaction
    - Recipient: 0x098B716B8Aaf21512996dC57EB0615e2383E2f96
    - Match: US Treasury OFAC SDN List (Lazarus Group)
    - Action: HALT & FREEZE (Zero funds moved)
    ```
* **Voiceover:**
  > "Here's Praman Desk in action. Our agent receives an invoice for forty-two hundred dollars. Before `signer.sendTransaction` can ever be called, our MCP firewall screens the recipient against the official US Treasury OFAC SDN list and detects a known Lazarus Group address. The transaction is frozen instantly before signing. Zero balance exposure."

---

## Act 3: Live Split-Screen Web Playground (0:40 – 1:10)
* **Visual:** Browser opens to `https://praman-desk.vercel.app`.
  * **Click Scenario 2 (Arithmetic Overcharge):**
    * Show stated invoice: $2,250.00 USDC.
    * Click `[ Run Pre-Flight Inspection ]`.
    * Right panel immediately lights up red: `[ HALT & FREEZE — TRANSACTION BLOCKED ]`.
    * Highlight policy item: `Deterministic Arithmetic (WASM): Stated $2250.00 differs from computed line items $1800.00 ($450.00 discrepancy)`.
  * **Click Scenario 3 (Compliant Agent Payout):**
    * Legitimate Anthropic API invoice ($250.00 USDC).
    * Click `[ Run Pre-Flight Inspection ]`.
    * Right panel turns emerald: `[ APPROVED — READY FOR X402 PAYMENT ]`.
    * Highlight: OFAC Clean, GLEIF LEI Verified, 0.00% WASM difference, within $500 single-agent delegation cap.
* **Voiceover:**
  > "On our live playground, developers can test realistic failure modes with one click. Scenario two tests a classic prompt-injection trick: phantom markup. The invoice demands twenty-two fifty, but our 651-byte WASM engine sums the line items to eighteen hundred. The exact four-hundred-and-fifty-dollar discrepancy is caught in two milliseconds. Scenario three shows a clean Anthropic invoice: GLEIF verified, OFAC clean, bit-exact arithmetic, approved for execution."

---

## Act 4: Telegraph Protocol Architecture & Economics (1:10 – 1:30)
* **Visual:** Bottom panel showing Telegraph x402 settlement card and 10-second MCP setup.
  * Show Sepolia Diamond contract (`0x3624EB01...`), Miner `#5289`, and unit economics comparison.
* **Voiceover:**
  > "Every pre-flight inspection settles via Telegraph's x402 micro-payment rail on Sepolia for one cent. Think about the unit economics: a one-cent check prevents a twenty-five hundred dollar forensic legal nightmare. That's a 250,000-to-one protection ratio. You can add Praman Desk to your own agents today with `npx @praman/spend-guard-mcp` or test it live at praman-desk.vercel.app. Thank you."

---

## Key Production Notes
* **Tone:** Professional, pragmatic, engineering-first. Zero breathless hype, zero rubric recitation.
* **Pacing:** Crisp and focused on the developer's real problem.
* **Artifacts shown:** Cursor IDE terminal, live browser UI at `praman-desk.vercel.app`, Sepolia block explorer verification.

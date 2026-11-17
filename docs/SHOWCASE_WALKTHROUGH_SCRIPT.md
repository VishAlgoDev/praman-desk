# Praman Desk: Developer Screencast Walkthrough Script (90 Seconds)

**Target Video:** `public/praman-desk-walkthrough.mp4`  
**Duration:** 90 Seconds  
**Format:** 1920x1080 @ 30fps Developer Screencast (Cursor IDE + Split-Screen Web Playground)  
**Live Application:** https://praman-desk.vercel.app  
**GitHub Repository:** https://github.com/VishAlgoDev/praman-desk  

---

## Act 1: The Threat & Live Phishing/Sanctions Interception (0:00 – 0:22)
* **Visual:** Live Split-Screen Playground (`praman-desk.vercel.app`) loaded on Scenario 1 (`Phishing & Sanctions Exploit`).
  * Agent attempts a $4,200 USDC payout to `0x098B716B8Aaf21512996dC57EB0615e2383E2f96` spoofing a Cloudflare edge bill.
  * Right panel immediately flashes red: `[ HALT & FREEZE — TRANSACTION BLOCKED ]`, OFAC Sanctions badge `🛑 BLOCKED`.
* **Voiceover (Human, direct, conversational engineer):**
  > "In 2026, AI agents and DAOs hold private keys with spend caps. If an agent gets prompt-injected or fed a spoofed invoice, funds move irreversibly in seconds. Here is Praman Desk. Before signing can ever occur, Scenario 1 screens the recipient address against US Treasury OFAC SDN lists, catches a Lazarus Group match in under three milliseconds, and halts the four-thousand-two-hundred-dollar payout."

---

## Act 2: Arithmetic Overcharge & In-Browser 651b WASM Proof (0:22 – 0:46)
* **Visual:** Click Scenario 2 (`Arithmetic Overcharge`) on `NVIDIA Corporation`.
  * Shows GLEIF LEI `549300S4KLFTLO7GSQ80` (`✅ VERIFIED`), OFAC (`✅ CLEAN`), Delegation Cap (`✅ WITHIN CAP`), and **only** Bit-Exact Arithmetic (`🛑 $100.00 MISMATCH`) triggers `[ HALT & FREEZE ]`.
  * Click `[ 🔬 Recompute in Browser (651b WASM) ]` to run `comparator.wasm` directly in Chrome's WebAssembly VM and verify its SHA-256 hash.
* **Voiceover:**
  > "Scenario two tests phantom invoice markup against NVIDIA Corporation. Identity and delegation caps pass cleanly, but the invoice demands four hundred fifty dollars while ten H100 hours at thirty-five dollars total three hundred fifty. Our six-hundred-fifty-one byte standalone WebAssembly comparator catches the exact hundred-dollar overcharge, and anyone can click Recompute in Browser to verify the `.wasm` binary directly."

---

## Act 3: Verified Compliant Agent Payout (0:46 – 1:06)
* **Visual:** Click Scenario 3 (`Compliant Agent Payout`) for `Anthropic PBC` ($250.00 USDC).
  * Right panel turns emerald: `[ APPROVED — SAFE FOR X402 PAYMENT ]`.
  * Highlights clickable GLEIF LEI `984500B6DEB8CEBC4Z70`, OFAC Clean, `0.00% DIFF`, within `$500` autonomous cap.
* **Voiceover:**
  > "Scenario three checks a legitimate two-hundred-fifty-dollar payout to Anthropic PBC. Praman Desk resolves the live GLEIF entity identifier, clears OFAC sanctions, confirms bit-exact zero-percent discrepancy in WebAssembly, and clears execution over Telegraph's x402 settlement rail."

---

## Act 4: Unit Economics, Zero-Install MCP & On-Chain Receipts (1:06 – 1:30)
* **Visual:** Smooth scroll to Unit Economics ($0.01 check vs $2,500+ loss), 10-second MCP quickstart (`npx -y --package=github:VishAlgoDev/praman-desk praman-spend-guard-mcp`), and expand the 57-transaction Sepolia Receipt Ledger accordion.
* **Voiceover:**
  > "A one-cent check on Telegraph prevents a twenty-five-hundred-dollar forensic loss — a 250,000-to-one protection ratio. Every settlement receipt in our fifty-seven-transaction ledger links straight to Sepolia Etherscan, and any builder can wire the ten-tool firewall into Cursor or Claude Code in seconds with npx from GitHub."

---

## Key Production Notes
* **Tone:** Professional, pragmatic, engineering-first. Zero breathless hype, zero rubric recitation.
* **Pacing:** Crisp and focused on the developer's real problem.
* **Artifacts shown:** Cursor IDE terminal, live browser UI at `praman-desk.vercel.app`, Sepolia block explorer verification.

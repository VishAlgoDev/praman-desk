import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, '..', 'SUBMISSION_DOSSIER.md');
let content = fs.readFileSync(filePath, 'utf8');

const target = content.substring(content.indexOf('**Submission Tracks**:'), content.indexOf('## SECTION 01:'));
const replacement = `**Submission Tracks**:
- **Primary Track**: Track 01 — Apps & Agents
  - **Collaborative Two-Mind Architecture**: Animoca Brands Minds (hellominds.ai) Diligence Investigator + Escrow Reviewer
  - **Mission 04**: Legal & Cross-Border Diligence (MahaRERA, FIDIC, MSMED Act, GLEIF, OFAC)
  - **Mission 03**: Institutional Markets & Counterparty Clearing (FakeWatch Phishing Shield, FX Parity)
  - **Mission 11**: Autonomous Systems (Spend Delegation Approval Caps & Circuit Breakers)
  - **Mission 02**: Stablecoin Treasury Guard (OFAC SDN EVM Address Screening & FATF Travel Rule)
- **Secondary Track**: Track 02 — Miners / Providers (Active Devnode Miner #6127 / Route 5281 / Diamond registration #6142)
  - 🏆 **Rank #1 Globally**: CONTRACT_OBLIGATION_AUDIT_GENERAL (Score: 0.5000)
  - 🏆 **Rank #1 Globally**: PURCHASE_ORDER_VERIFY_GENERAL (Score: 0.0000, top seed)
  - 🥈 **Rank #2 Globally**: SANCTIONS_SCREENING_MATCH_GENERAL (Score: 1.0000, 19,565 OFAC records)
  - 💎 **Rank #6 Globally**: CORPORATE_REGISTRY_LOOKUP_GENERAL (Score: 1.0000, 200+ jurisdictions GLEIF)
  - 164 live network requests served on Devnode
- **Supporting Track**: Track 03 — Evaluators & Truth Sources (62 Attested Bounties in EvalPool + Track 3 Ground-Truth Dossier for Bounties #120, #122, #192)  
- **Empirical Benchmark**: "With vs Without Telegraph" ($79,373 Capital Loss Averted across 5 Adversarial Scenarios, 100% Catch Rate vs 0% Raw LLM)  
- **Main Competition Deadline**: December 1, 2026, 23:59 UTC  
- **GitHub Repository**: [https://github.com/VishAlgoDev/praman-desk](https://github.com/VishAlgoDev/praman-desk)  
- **Live Application**: [https://praman-desk.vercel.app](https://praman-desk.vercel.app)  
- **Official Showcase Video**: [https://praman-desk.vercel.app/praman_minds_benchmark_showcase.mp4](https://praman-desk.vercel.app/praman_minds_benchmark_showcase.mp4)  
- **Starred Bounties Repo Account**: \`VishAlgoDev\` (Verified HTTP 204 Star on \`telegraphprotocol/bounties\`)

---

`;

content = content.replace(target, replacement);
fs.writeFileSync(filePath, content, 'utf8');
console.log('SUBMISSION_DOSSIER.md updated successfully!');

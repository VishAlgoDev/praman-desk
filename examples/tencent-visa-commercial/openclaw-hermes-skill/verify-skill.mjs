/**
 * Verification harness for OpenClaw & Hermes Skill manifest (#19 / #20)
 * Verifies exact 18-tool MCP schema alignment and exercises live composite clearance.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { TOOLS, clearSpendComposite } from '../../../mcp/server.mjs';
import { handleApiRequest } from '../../../src/handlers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function invokeMcpMethod(method, params = {}) {
  let statusCode = 0;
  let body = '';
  const fakeReq = Readable.from([JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })]);
  fakeReq.url = '/api/mcp';
  fakeReq.method = 'POST';
  fakeReq.headers = { host: 'localhost', 'content-type': 'application/json' };
  const fakeRes = {
    writeHead(code) { statusCode = code; },
    end(chunk) { body = String(chunk || ''); }
  };
  await handleApiRequest(fakeReq, fakeRes);
  return { statusCode, data: JSON.parse(body) };
}

export async function verifyOpenClawHermesSkill() {
  const manifestPath = path.join(__dirname, 'openclaw-hermes-skill.json');
  const skillMdPath = path.join(__dirname, 'SKILL.md');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const skillMd = fs.readFileSync(skillMdPath, 'utf8');

  assert.equal(manifest.toolCount, 18);
  assert.equal(manifest.tools.length, 18);
  assert.deepEqual(manifest.tools, TOOLS.map(t => t.name), 'Skill manifest tools must match mcp/server.mjs exactly');
  assert(skillMd.includes('https://praman-desk.vercel.app/api/mcp'));

  // Verify live MCP HTTP handler registers all 18 tools
  const toolsListRes = await invokeMcpMethod('tools/list');
  assert.equal(toolsListRes.statusCode, 200);
  const liveTools = toolsListRes.data?.result?.tools || [];
  assert.equal(liveTools.length, 18, `Expected 18 MCP tools, got ${liveTools.length}`);

  // Verify composite spend clearance passes clean Siemens AG and blocks Lazarus Group
  const approved = await clearSpendComposite({
    vendor: 'Siemens Aktiengesellschaft',
    lei: 'W38RGI023J3WT1HWRP32',
    invoice_id: 'INV-OC-101',
    po_number: 'PO-OC-101',
    invoice_amount: 450,
    po_amount: 450,
    approval_cap: 5000
  });
  assert.equal(approved.gate_decision?.cleared, true);

  const unverifiedCap = await clearSpendComposite({
    vendor: 'Siemens Aktiengesellschaft',
    lei: 'W38RGI023J3WT1HWRP32',
    invoice_id: 'INV-OC-102',
    invoice_amount: 450,
    po_amount: 450
  });
  assert.equal(unverifiedCap.gate_decision?.cleared, false);
  assert.equal(unverifiedCap.gate_decision?.action, 'HELD_FOR_MANUAL_REVIEW');

  const halted = await clearSpendComposite({
    vendor: 'Lazarus Group',
    invoice_id: 'INV-OC-666',
    invoice_amount: 5000,
    po_amount: 5000
  });
  assert.equal(halted.gate_decision?.cleared, false);
  assert.equal(halted.gate_decision?.action, 'REJECT_AND_FREEZE');

  return {
    manifestValid: true,
    mcpToolCount: liveTools.length,
    approvedAction: approved.gate_decision?.action,
    haltedReason: halted.gate_decision?.action
  };
}

if (process.argv[1] && (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1].endsWith('verify-skill.mjs'))) {
  const res = await verifyOpenClawHermesSkill();
  console.log('[OpenClaw/Hermes #19/#20] Skill Verification PASSED:', JSON.stringify(res));
}

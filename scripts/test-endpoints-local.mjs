import http from 'node:http';
import { handleApiRequest } from '../src/handlers.mjs';

const server = http.createServer(async (req, res) => {
  if (req.url.startsWith('/api/')) {
    return handleApiRequest(req, res);
  }
  res.statusCode = 404;
  res.end('Not found');
});

async function run() {
  await new Promise((resolve) => server.listen(3499, '127.0.0.1', resolve));
  console.log('Test server listening on port 3499');

  async function check(url, method = 'GET', body = null) {
    const opts = {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {}
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`http://127.0.0.1:3499${url}`, opts);
    const json = await res.json().catch(() => ({}));
    return { status: res.status, json };
  }

  try {
    // 1. Corporate Registry
    console.log('\n--- Checking /api/miner/corporate-registry ---');
    const corp = await check('/api/miner/corporate-registry?name=SAP%20SE&jurisdiction=DE');
    console.log('Status:', corp.status, 'found:', corp.json.found, 'active:', corp.json.status_active);
    console.log('Summary:', corp.json.summary);
    if (corp.status !== 200 || !corp.json.found) throw new Error('Corporate registry check failed');

    // 2. Sanctions Screen
    console.log('\n--- Checking /api/miner/sanctions-screen ---');
    const sanc = await check('/api/miner/sanctions-screen?name=Banco%20Nacional%20de%20Cuba');
    console.log('Status:', sanc.status, 'matched:', sanc.json.match_found, 'count:', sanc.json.match_count);
    console.log('Top match:', sanc.json.matches?.[0]?.matched_name, 'score:', sanc.json.matches?.[0]?.similarity_score);
    if (sanc.status !== 200 || !sanc.json.match_found) throw new Error('Sanctions screen check failed');

    // 3. Regulatory Filing
    console.log('\n--- Checking /api/miner/regulatory-filing ---');
    const reg = await check('/api/miner/regulatory-filing?company=Goldman%20Sachs&period=2026');
    console.log('Status:', reg.status, 'found:', reg.json.found, 'results:', reg.json.total_results);
    console.log('Summary:', reg.json.summary);
    if (reg.status !== 200 || !reg.json.found) throw new Error('Regulatory filing check failed');

    // 4. Verify existing 4 endpoints
    console.log('\n--- Checking Existing 4 Endpoints ---');
    const po = await check('/api/miner/po-verify?po_number=PO-2026-7741');
    console.log('po-verify status:', po.status, 'verified:', po.json.verified);
    if (po.status !== 200) throw new Error('po-verify failed');

    const inv = await check('/api/miner/invoice-reconcile?invoice=INV-101&ledger=LEDGER-101');
    console.log('invoice-reconcile status:', inv.status, 'reconciled:', inv.json.reconciled);
    if (inv.status !== 200) throw new Error('invoice-reconcile failed');

    const ven = await check('/api/miner/vendor-verify?vendor=SAP%20SE');
    console.log('vendor-verify status:', ven.status, 'valid:', ven.json.valid);
    if (ven.status !== 200) throw new Error('vendor-verify failed');

    const doc = await check('/api/miner/doc-authenticity');
    console.log('doc-authenticity status:', doc.status, 'authentic:', doc.json.authentic);
    if (doc.status !== 200) throw new Error('doc-authenticity failed');

    console.log('\nALL 7 ENDPOINTS VERIFIED SUCCESSFULLY!');
  } finally {
    server.close();
  }
}

run().catch((err) => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});

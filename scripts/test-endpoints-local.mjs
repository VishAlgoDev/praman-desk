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
    const corp = await check('/api/miner/corporate-registry?company=SAP%20SE&jurisdiction=DE');
    console.log('Status:', corp.status, 'found:', corp.json.found, 'active:', corp.json.active, 'legal_name:', corp.json.legal_name, 'reg_id:', corp.json.registration_id);
    console.log('Summary:', corp.json.summary);
    if (corp.status !== 200 || !corp.json.found || corp.json.active !== true || !corp.json.legal_name || !corp.json.registration_id) {
      throw new Error('Corporate registry schema check failed');
    }

    const corpNl = await check('/api/miner/corporate-registry?query=Is%20Siemens%20AG%20an%20active%20company%20in%20Germany%3F');
    console.log('NL Siemens AG DE -> found:', corpNl.json.found, 'verdict:', corpNl.json.verdict, 'active:', corpNl.json.active, 'legal_name:', corpNl.json.legal_name, 'reg_id:', corpNl.json.registration_id, 'jurisdiction:', corpNl.json.jurisdiction);
    if (
      corpNl.status !== 200 ||
      corpNl.json.found !== true ||
      corpNl.json.verdict !== 'found' ||
      corpNl.json.active !== true ||
      corpNl.json.registration_id !== 'W38RGI023J3WT1HWRP32' ||
      corpNl.json.entity_status !== 'ACTIVE'
    ) {
      throw new Error(`NL corporate registry parity check failed: ${JSON.stringify(corpNl.json)}`);
    }

    const corpDelaware = await check('/api/miner/corporate-registry?query=Look%20up%20Apple%20Inc%20in%20Delaware');
    console.log('NL Apple Delaware -> found:', corpDelaware.json.found, 'legal_name:', corpDelaware.json.legal_name, 'jurisdiction:', corpDelaware.json.jurisdiction);
    if (corpDelaware.status !== 200 || !corpDelaware.json.found || !String(corpDelaware.json.jurisdiction || '').startsWith('US')) {
      throw new Error(`Delaware country mapping check failed: ${JSON.stringify(corpDelaware.json)}`);
    }

    // 2. Sanctions Screen
    console.log('\n--- Checking /api/miner/sanctions-screen ---');
    const sanc = await check('/api/miner/sanctions-screen?name=Banco%20Nacional%20de%20Cuba');
    console.log('Status:', sanc.status, 'matched:', sanc.json.matched, 'match_score:', sanc.json.match_score, 'lists:', sanc.json.lists);
    console.log('Top match:', sanc.json.matches?.[0]?.matched_name, 'score:', sanc.json.matches?.[0]?.similarity_score);
    if (sanc.status !== 200 || sanc.json.matched !== true || !Array.isArray(sanc.json.lists) || typeof sanc.json.match_score !== 'number') {
      throw new Error('Sanctions screen schema check failed');
    }

    // 3. Regulatory Filing
    console.log('\n--- Checking /api/miner/regulatory-filing ---');
    const reg = await check('/api/miner/regulatory-filing?entity=Goldman%20Sachs&period=last%2012%20months');
    console.log('Status:', reg.status, 'found:', reg.json.found, 'entity:', reg.json.entity, 'filing_count:', reg.json.filing_count);
    console.log('Summary:', reg.json.summary);
    if (reg.status !== 200 || !reg.json.found || typeof reg.json.filing_count !== 'number' || !Array.isArray(reg.json.filings) || !Array.isArray(reg.json.urls)) {
      throw new Error('Regulatory filing schema check failed');
    }

    const regNl = await check('/api/miner/regulatory-filing?query=How%20many%20Federal%20Register%20documents%20mention%20Boeing%20in%20the%20last%2012%20months%3F');
    console.log('NL Boeing FR -> found:', regNl.json.found, 'verdict:', regNl.json.verdict, 'entity:', regNl.json.entity, 'filing_count:', regNl.json.filing_count, 'by_type:', JSON.stringify(regNl.json.by_type));
    if (
      regNl.status !== 200 ||
      regNl.json.found !== true ||
      regNl.json.verdict !== 'found' ||
      regNl.json.entity !== 'Boeing' ||
      regNl.json.filing_count < 100 ||
      !regNl.json.by_type ||
      Object.keys(regNl.json.by_type).length === 0
    ) {
      throw new Error(`NL Federal Register parity check failed: ${JSON.stringify(regNl.json)}`);
    }

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

    // 5. Phase 1 Regression Guards
    console.log('\n--- Checking Phase 1 Regression Guards ---');
    const badVat = await check('/api/miner/vendor-verify?vendor=SAP%20SE&vat_number=DE999999999');
    console.log('Fake EU VAT guard:', badVat.json.valid, badVat.json.vat_valid, badVat.json.registration_status);
    if (badVat.status !== 200 || badVat.json.valid !== false) {
      throw new Error(`Expected valid: false for fake EU VAT DE999999999, got ${badVat.json.valid}`);
    }

    const goodVat = await check('/api/miner/vendor-verify?vendor=SAP%20SE&vat_number=DE143454214');
    console.log('Valid SAP SE EU VAT:', goodVat.json.valid, goodVat.json.vat_valid, goodVat.json.lei);
    if (goodVat.status !== 200 || goodVat.json.valid !== true || goodVat.json.vat_valid !== true || goodVat.json.lei !== '529900D6BF99LW9R2E68') {
      throw new Error(`Expected valid SAP SE LEI & active EU VAT DE143454214, got valid=${goodVat.json.valid}, vat_valid=${goodVat.json.vat_valid}`);
    }

    const emptyVendor = await check('/api/miner/vendor-verify');
    console.log('Empty vendor-verify guard:', emptyVendor.json.valid, emptyVendor.json.status);
    if (emptyVendor.status !== 200 || emptyVendor.json.valid !== false || emptyVendor.json.status !== 'missing_parameters') {
      throw new Error('Expected valid: false / missing_parameters on empty vendor-verify');
    }

    const barePo = await check('/api/miner/po-verify?po_number=PO-99999&vendor=Acme');
    console.log('Bare PO guard:', barePo.json.verified, barePo.json.status, barePo.json.amount);
    if (barePo.status !== 200 || barePo.json.verified !== false || barePo.json.amount !== null || barePo.json.status !== 'insufficient_evidence') {
      throw new Error('Expected insufficient_evidence and null amount on bare PO without financial figures');
    }

    const inlinePoGood = await check('/api/miner/po-verify?po_number=PO-102&question=10%20units%20at%20%24250%20%3D%20%242500');
    console.log('Inline PO math good:', inlinePoGood.json.verified, inlinePoGood.json.status, inlinePoGood.json.amount);
    if (inlinePoGood.status !== 200 || inlinePoGood.json.verified !== true || inlinePoGood.json.amount !== 2500) {
      throw new Error('Expected inline PO arithmetic match for 10 units at $250 = $2500');
    }

    const inlinePoBad = await check('/api/miner/po-verify?po_number=PO-103&question=10%20units%20at%20%24250%20%3D%20%243100');
    console.log('Inline PO math bad:', inlinePoBad.json.verified, inlinePoBad.json.status, inlinePoBad.json.discrepancy);
    if (inlinePoBad.status !== 200 || inlinePoBad.json.verified !== false || inlinePoBad.json.status !== 'arithmetic_mismatch') {
      throw new Error('Expected arithmetic_mismatch for 10 units at $250 = $3100');
    }

    const structuredPoBad = await check('/api/miner/po-verify?po_number=PO-999&items=%5B%7B%22name%22%3A%22Item%22%2C%22quantity%22%3A2%2C%22unit_price%22%3A50%7D%5D&subtotal=100&tax=10&shipping=5&grand_total=999');
    console.log('Structured PO math bad:', structuredPoBad.json.verified, structuredPoBad.json.status, structuredPoBad.json.discrepancy);
    if (structuredPoBad.status !== 200 || structuredPoBad.json.verified !== false || structuredPoBad.json.status !== 'arithmetic_mismatch' || structuredPoBad.json.discrepancy !== 884) {
      throw new Error(`Expected structured PO mismatch discrepancy 884, got ${JSON.stringify(structuredPoBad.json)}`);
    }

    const urlDoc = await check('/api/miner/doc-authenticity?document=https://example.com');
    console.log('Uncorroborated URL doc guard:', urlDoc.json.authentic, urlDoc.json.verdict);
    if (urlDoc.status !== 200 || urlDoc.json.authentic !== false || urlDoc.json.verdict !== 'Inconclusive') {
      throw new Error('Expected authentic: false and verdict: Inconclusive for uncorroborated URL');
    }

    // 6. Phase 2 Mission 04 Diligence Pack & Deduplicated Ledger
    console.log('\n--- Checking Mission 04 5-Jurisdiction Diligence Pack & Ledger ---');
    const pack = await check('/api/audit/diligence-pack', 'POST', { mode: 'preview' });
    console.log('Diligence Pack jurisdictions:', pack.json.jurisdictions?.length, 'packSha256:', pack.json.packSha256?.slice(0, 18), 'durationMs:', pack.json.durationMs);
    if (
      pack.status !== 200 ||
      pack.json.jurisdictions?.length !== 5 ||
      !/^0x[0-9a-f]{64}$/i.test(pack.json.packSha256 || '') ||
      !pack.json.machineInvoice ||
      !pack.json.traditionalBenchmarkInvoice
    ) {
      throw new Error('5-Jurisdiction Diligence Pack schema check failed');
    }

    const ledger = await check('/api/ledger');
    const uniqueTxs = new Set((ledger.json.calls || []).map(c => String(c.txHash || '').toLowerCase()).filter(Boolean));
    console.log('Ledger totalPaidCalls:', ledger.json.totalPaidCalls, 'uniqueTxs:', uniqueTxs.size, 'totalSpentUsd:', ledger.json.totalSpentUsd);
    if (ledger.status !== 200 || ledger.json.totalPaidCalls < 9 || uniqueTxs.size !== ledger.json.totalPaidCalls) {
      throw new Error(`Ledger deduplication check failed (total=${ledger.json.totalPaidCalls}, unique=${uniqueTxs.size})`);
    }

    console.log('\nALL 7 ENDPOINTS, REGRESSION GUARDS, DILIGENCE PACK & LEDGER VERIFIED SUCCESSFULLY!');
  } finally {
    server.close();
  }
}

run().catch((err) => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});

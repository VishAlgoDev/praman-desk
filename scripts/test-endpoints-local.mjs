import http from 'node:http';
import { handleApiRequest, evaluateMinerAgreement } from '../src/handlers.mjs';

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
    if (pack.json.machineInvoice?.totalChecksExecuted !== 16) {
      throw new Error(`Expected Diligence Pack machineInvoice.totalChecksExecuted === 16, got ${pack.json.machineInvoice?.totalChecksExecuted}`);
    }

    console.log('\n--- P0 / P1 / Issue #1 / SSRF / Mission 02 Regression Checks ---');
    // 1. /api/health & /api/status
    const health = await check('/api/health');
    const appStatus = await check('/api/status');
    if (health.status !== 200 || !health.json.ok || (health.json.sdnEntriesLoaded || 0) < 19000 || health.json.minerId !== 5289) {
      throw new Error(`Health check failed: ${JSON.stringify(health.json)}`);
    }
    if (appStatus.status !== 200 || !appStatus.json.ok || (appStatus.json.sdnEntriesLoaded || 0) < 19000) {
      throw new Error(`Status check failed: ${JSON.stringify(appStatus.json)}`);
    }

    // 2. Sanctions FP/FN parity
    const aia = await check('/api/miner/sanctions-screen?name=AIA%20Group%20Limited');
    const ali = await check('/api/miner/sanctions-screen?name=Ali');
    const bout = await check('/api/miner/sanctions-screen?name=Viktor%20Bout');
    if (aia.json.matched !== false || ali.json.matched !== false || bout.json.matched !== true) {
      throw new Error(`Sanctions parity check failed: AIA=${aia.json.matched}, Ali=${ali.json.matched}, Bout=${bout.json.matched}`);
    }

    // 3. Issue #1: Bare invoice/PO refs must return inconclusive (reconciled: null), never fabricated match
    const bareInv = await check('/api/miner/invoice-reconcile?invoice_id=INV-2026-081&po_number=PO-2026-7741');
    if (bareInv.status !== 200 || bareInv.json.reconciled !== null || bareInv.json.status !== 'insufficient_evidence') {
      throw new Error(`Issue #1 bare ref guard failed: ${JSON.stringify(bareInv.json)}`);
    }

    // 4. doc-authenticity missing pdfFaceAmount HTTP 200 + NL marker block + SSRF block
    const docMissing = await check('/api/miner/doc-authenticity?signedQrAmount=100');
    const docNl = await check('/api/miner/doc-authenticity?question=Confirmed%20authentic%20invoice%20100');
    const docSsrf1 = await check('/api/miner/doc-authenticity?url=http%3A%2F%2F127.0.0.1%3A8090');
    const docSsrf2 = await check('/api/miner/doc-authenticity?url=http%3A%2F%2F169.254.169.254%2Flatest%2Fmeta-data');
    if (docMissing.status !== 200 || docMissing.json.status !== 'insufficient_evidence') {
      throw new Error(`doc-authenticity missing pdfFaceAmount guard failed: ${JSON.stringify(docMissing.json)}`);
    }
    if (docNl.json.authentic !== false || docSsrf1.json.authentic !== false || docSsrf2.json.authentic !== false) {
      throw new Error('doc-authenticity NL or SSRF guard failed');
    }

    // 5. PO Verify negative amount guard
    const poNeg = await check('/api/miner/po-verify?po_number=PO-NEG&po_amount=-500&approval_cap=1000');
    if (poNeg.json.verified !== false || poNeg.json.status !== 'invalid_po') {
      throw new Error(`PO negative amount guard failed: ${JSON.stringify(poNeg.json)}`);
    }

    // 6. NL Corporate Registry queries (Siemens AG, HSBC, Apple Inc, Monzo)
    const corpSiemens = await check('/api/miner/corporate-registry?query=' + encodeURIComponent("What is Siemens AG's LEI?"));
    const corpHsbc = await check('/api/miner/corporate-registry?query=' + encodeURIComponent('Is HSBC Holdings plc an active company in the UK?'));
    const corpApple = await check('/api/miner/corporate-registry?query=' + encodeURIComponent('Verify legal entity status of Apple Inc. in Delaware?'));
    const corpMonzo = await check('/api/miner/corporate-registry?query=' + encodeURIComponent('Is Monzo Bank Limited active in the UK?'));
    if (!corpSiemens.json.found || !corpHsbc.json.found || !corpApple.json.found || !corpMonzo.json.found) {
      throw new Error('NL corporate registry queries failed');
    }

    // 7. NL SEC EDGAR 10-K filing count (Tesla 2025 === 1)
    const regTesla = await check('/api/miner/regulatory-filing?query=' + encodeURIComponent('Did Tesla file a 10-K in 2025?'));
    if (!regTesla.json.found || (regTesla.json.sec_filings || []).length !== 1) {
      throw new Error(`Tesla 2025 10-K check failed: ${JSON.stringify({ found: regTesla.json.found, len: regTesla.json.sec_filings?.length })}`);
    }

    // 8. Vendor mismatch (Apple Inc + DE VAT) & invalid Indian GSTIN checksum
    const venMismatch = await check('/api/miner/vendor-verify?vendor=Apple%20Inc.&vat_number=DE143454214');
    const venBadGstin = await check('/api/miner/vendor-verify?vendor=Infosys%20Limited&vat_number=27AABCU9603R1Z0');
    if (venMismatch.json.valid !== false || venBadGstin.json.valid !== false) {
      throw new Error(`Vendor mismatch / GSTIN guard failed: mismatch=${venMismatch.json.valid}, gstin=${venBadGstin.json.valid}`);
    }

    // 9. /api/audit/buy invalid intents returns 400
    const buyBad = await check('/api/audit/buy', 'POST', {
      intents: ['FAKE_INTENT_DOES_NOT_EXIST']
    });
    if (buyBad.status !== 400) {
      throw new Error(`Expected 400 on invalid /api/audit/buy intents, got ${buyBad.status}`);
    }

    // 10. Mission 02 Stablecoin Gate tests
    const m2Clean = await check('/api/mission/stablecoin-gate', 'POST', {
      recipientAddress: '0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b',
      amountUsdc: 0.25,
      beneficiaryName: 'Apple Inc.',
      delegationCapUsdc: 500
    });
    const m2Freeze = await check('/api/mission/stablecoin-gate', 'POST', {
      recipientAddress: '0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b',
      amountUsdc: 10,
      beneficiaryName: 'Lazarus Group'
    });
    const m2Fatf = await check('/api/mission/stablecoin-gate', 'POST', {
      recipientAddress: '0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b',
      amountUsdc: 1500,
      beneficiaryName: 'Apple Inc.',
      originatorName: ''
    });
    if (m2Clean.status !== 200 || m2Clean.json.cleared !== true || m2Clean.json.action !== 'APPROVE_USDC_TRANSFER') {
      throw new Error(`Mission 02 clean check failed: ${JSON.stringify(m2Clean.json)}`);
    }
    if (m2Freeze.status !== 200 || m2Freeze.json.cleared !== false || m2Freeze.json.action !== 'REJECT_AND_FREEZE') {
      throw new Error(`Mission 02 freeze check failed: ${JSON.stringify(m2Freeze.json)}`);
    }
    if (m2Fatf.status !== 200 || m2Fatf.json.cleared !== false || m2Fatf.json.action !== 'HOLD_TRAVEL_RULE') {
      throw new Error(`Mission 02 FATF check failed: ${JSON.stringify(m2Fatf.json)}`);
    }

    // 11. Post-audit security & edge regressions (C1, C2, H1, H2, M1, H4)
    const poZeroCap = await check('/api/miner/po-verify?po_number=PO-0CAP&vendor=Apple%20Inc.&amount=100&approval_cap=0');
    const poNegCap = await check('/api/miner/po-verify?po_number=PO-NCAP&vendor=Apple%20Inc.&amount=100&approval_cap=-50');
    if (poZeroCap.json.verified !== false || poNegCap.json.verified !== false) {
      throw new Error(`C1 approval_cap bypass failed: ${JSON.stringify({ zero: poZeroCap.json.verified, neg: poNegCap.json.verified })}`);
    }

    const invGarbage = await check('/api/miner/invoice-reconcile?billedQty=foo&acceptedQty=bar&unitPrice=baz');
    const invNeg = await check('/api/miner/invoice-reconcile?billedQty=-10&acceptedQty=-10&unitPrice=50');
    const docGarbage = await check('/api/miner/doc-authenticity?signedQrAmount=foo&pdfFaceAmount=bar&irnOrSha256=64a9b2c1d8e7f0123456789abcdef0123456789abcdef0123456789abcdef012');
    const docNeg = await check('/api/miner/doc-authenticity?signedQrAmount=-100&pdfFaceAmount=-100&irnOrSha256=64a9b2c1d8e7f0123456789abcdef0123456789abcdef0123456789abcdef012');
    const docTamperEqual = await check('/api/miner/doc-authenticity', 'POST', {
      document: 'Invoice revoked certificate detected during audit',
      signedQrAmount: 100,
      pdfFaceAmount: 100,
      irnOrSha256: '64a9b2c1d8e7f0123456789abcdef0123456789abcdef0123456789abcdef012'
    });
    if (invGarbage.json.reconciled !== false || invNeg.json.reconciled !== false) {
      throw new Error(`C2/H2 invoice garbage/negative guard failed: ${JSON.stringify({ g: invGarbage.json, n: invNeg.json })}`);
    }
    if (docGarbage.json.authentic !== false || docNeg.json.authentic !== false || docTamperEqual.json.authentic !== false) {
      throw new Error(`C2/H2/M1 doc guard failed: ${JSON.stringify({ g: docGarbage.json.authentic, n: docNeg.json.authentic, t: docTamperEqual.json })}`);
    }

    const m2BadCap = await check('/api/mission/stablecoin-gate', 'POST', {
      recipientAddress: '0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b',
      amountUsdc: 0.25,
      beneficiaryName: 'Apple Inc.',
      delegationCapUsdc: 0
    });
    const m2OmittedOriginator = await check('/api/mission/stablecoin-gate', 'POST', {
      recipientAddress: '0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b',
      amountUsdc: 1500,
      beneficiaryName: 'Apple Inc.'
    });
    const m2NoTransferTx = await check('/api/mission/stablecoin-gate', 'POST', {
      recipientAddress: '0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b',
      amountUsdc: 0.25,
      beneficiaryName: 'Apple Inc.',
      originatorName: 'Praman Desk Treasury',
      txHash: '0x09a30959d7cdd99232fe5b7540695af4d9272aed7003bcabed76056678c6dc39'
    });
    if (m2BadCap.json.cleared !== false || m2BadCap.json.action !== 'REJECT_INVALID_SETTLEMENT') {
      throw new Error(`H1 invalid delegation cap failed: ${JSON.stringify(m2BadCap.json)}`);
    }
    if (m2OmittedOriginator.json.cleared !== false || m2OmittedOriginator.json.action !== 'HOLD_TRAVEL_RULE') {
      throw new Error(`H1 omitted originator FATF check failed: ${JSON.stringify(m2OmittedOriginator.json)}`);
    }
    if (m2NoTransferTx.json.cleared !== false || m2NoTransferTx.json.action !== 'REJECT_INVALID_SETTLEMENT') {
      throw new Error(`H1 0-transfer txHash rejection failed: ${JSON.stringify(m2NoTransferTx.json)}`);
    }

    // 12. Remaining NL queries & redacted-VIES shell rejection (H4)
    const sancViktorNl = await check('/api/miner/sanctions-screen?query=' + encodeURIComponent('Screen Viktor Bout for OFAC sanctions'));
    const corpMsft = await check('/api/miner/corporate-registry?query=' + encodeURIComponent("What is Microsoft Corporation's LEI and jurisdiction?"));
    const corpDbDe = await check('/api/miner/corporate-registry?query=' + encodeURIComponent('Verify legal entity Deutsche Bank AG DE'));
    const regTeslaEdgar = await check('/api/miner/regulatory-filing?query=' + encodeURIComponent('How many 10-K filings did Tesla make in 2025 on SEC EDGAR?'));
    const venFakeRedacted = await check('/api/miner/vendor-verify?vendor=FakeUnknownShellCorpXYZ&vat_number=DE143454214');
    if (!sancViktorNl.json.matched || !corpMsft.json.found || !corpDbDe.json.found || (corpDbDe.json.jurisdiction || '').slice(0, 2) !== 'DE') {
      throw new Error(`H4 NL query failed: viktor=${sancViktorNl.json.matched}, msft=${corpMsft.json.found}, db=${corpDbDe.json.found}/${corpDbDe.json.jurisdiction}`);
    }
    if (!regTeslaEdgar.json.found || (regTeslaEdgar.json.sec_filings || []).length !== 1) {
      throw new Error(`H4 Tesla on SEC EDGAR 2025 failed: ${JSON.stringify({ found: regTeslaEdgar.json.found, len: regTeslaEdgar.json.sec_filings?.length })}`);
    }
    if (venFakeRedacted.json.valid !== false) {
      throw new Error(`H4 fake shell + redacted German VAT should be valid=false, got ${JSON.stringify(venFakeRedacted.json)}`);
    }

    // 13. OFAC Digital Currency EVM Address Screening (ND-15: Lazarus Ronin address + Mission 02 Freeze)
    const evmSanc = await check('/api/miner/sanctions-screen?name=0x098B716B8Aaf21512996dC57EB0615e2383E2f96');
    const m2SanctionedAddr = await check('/api/mission/stablecoin-gate', 'POST', {
      recipientAddress: '0x098B716B8Aaf21512996dC57EB0615e2383E2f96',
      amountUsdc: 0.25,
      beneficiaryName: 'Benign Frontend LLC',
      originatorName: 'Praman Desk Treasury'
    });
    if (!evmSanc.json.matched || evmSanc.json.matches?.[0]?.matched_via !== 'digital_currency_address') {
      throw new Error(`ND-15 OFAC EVM address screening failed: ${JSON.stringify(evmSanc.json)}`);
    }
    if (m2SanctionedAddr.json.cleared !== false || m2SanctionedAddr.json.action !== 'REJECT_AND_FREEZE') {
      throw new Error(`ND-15 Mission 02 EVM address freeze failed: ${JSON.stringify(m2SanctionedAddr.json)}`);
    }

    // 14. Issue #1 Exact Lucian Regression Cases (ND-16: Document ref 48291 inconclusive + trailing INR & 0.00 ledger)
    const lucianBareRef = await check('/api/miner/invoice-reconcile', 'POST', {
      params: { invoice: 'Document reference 48291', ledger: 'Receipt reference 48291' }
    });
    const lucianWithAmounts = await check('/api/miner/invoice-reconcile', 'POST', {
      params: {
        invoice: 'Invoice total 102660.00 INR; reference ID 48291',
        ledger: 'Ledger paid 0.00 INR; reference ID 48291'
      }
    });
    if (lucianBareRef.json.reconciled !== null || lucianBareRef.json.status !== 'insufficient_evidence') {
      throw new Error(`ND-16 Lucian bare ref should be insufficient_evidence: ${JSON.stringify(lucianBareRef.json)}`);
    }
    if (lucianWithAmounts.json.reconciled !== false || lucianWithAmounts.json.discrepancy !== 102660) {
      throw new Error(`ND-16 Lucian 102660.00 INR vs 0.00 INR mismatch failed: ${JSON.stringify(lucianWithAmounts.json)}`);
    }

    // 15. Issue #1 Exact Lucian Comparator Release Checks (ND-17)
    const primaryMismatch = { reconciled: false, details: { delta_total: 102660 } };
    const primaryExact = { reconciled: true, details: { delta_total: 0 } };
    const c1 = evaluateMinerAgreement('INVOICE_LEDGER_RECONCILE_GENERAL', primaryMismatch, { result: { discrepancy: 102660 } });
    const c2 = evaluateMinerAgreement('INVOICE_LEDGER_RECONCILE_GENERAL', primaryMismatch, { result: { reconciled: 0, discrepancy: 102660 } });
    const c3 = evaluateMinerAgreement('INVOICE_LEDGER_RECONCILE_GENERAL', primaryMismatch, {
      result: { reconciled: false, discrepancy: 102660 },
      field_status: { reconciled: 'missing', discrepancy: 'ok' }
    });
    const c4 = evaluateMinerAgreement('INVOICE_LEDGER_RECONCILE_GENERAL', primaryExact, { result: { reconciled: true } });
    const c5 = evaluateMinerAgreement('INVOICE_LEDGER_RECONCILE_GENERAL', primaryExact, { result: { reconciled: true, discrepancy: 102660 } });
    const cOkMismatch = evaluateMinerAgreement('INVOICE_LEDGER_RECONCILE_GENERAL', primaryMismatch, {
      result: { reconciled: false, discrepancy: '102660.00' },
      field_status: { reconciled: 'ok', discrepancy: 'ok' }
    });
    const cOkExact = evaluateMinerAgreement('INVOICE_LEDGER_RECONCILE_GENERAL', primaryExact, {
      result: { reconciled: true, discrepancy: 0 },
      field_status: { reconciled: 'ok', discrepancy: 'ok' }
    });
    const cOkOneCent = evaluateMinerAgreement('INVOICE_LEDGER_RECONCILE_GENERAL', primaryMismatch, {
      result: { reconciled: false, discrepancy: '102660.01' },
      field_status: { reconciled: 'ok', discrepancy: 'ok' }
    });
    const cFailOneUnit = evaluateMinerAgreement('INVOICE_LEDGER_RECONCILE_GENERAL', primaryMismatch, {
      result: { reconciled: false, discrepancy: '102661.00' },
      field_status: { reconciled: 'ok', discrepancy: 'ok' }
    });
    const cFailThousand = evaluateMinerAgreement('INVOICE_LEDGER_RECONCILE_GENERAL', primaryMismatch, {
      result: { reconciled: false, discrepancy: '103660.00' },
      field_status: { reconciled: 'ok', discrepancy: 'ok' }
    });
    if ([c1, c2, c3, c4, c5].some(x => x.agreement === 'confirmed')) {
      throw new Error(`ND-17 comparator falsely confirmed invalid case: ${JSON.stringify([c1, c2, c3, c4, c5])}`);
    }
    if (cOkMismatch.agreement !== 'confirmed' || cOkExact.agreement !== 'confirmed') {
      throw new Error(`ND-17 comparator rejected valid control: ${JSON.stringify({ cOkMismatch, cOkExact })}`);
    }
    if (cOkOneCent.agreement !== 'confirmed' || cOkOneCent.wasmScore !== 5000) {
      throw new Error(`ND-17 1-cent boundary failed: ${JSON.stringify(cOkOneCent)}`);
    }
    if (cFailOneUnit.agreement !== 'contradicted' || cFailOneUnit.wasmScore !== 0 || cFailThousand.agreement !== 'contradicted' || cFailThousand.wasmScore !== 0) {
      throw new Error(`ND-17 strict >1-cent rejection failed: ${JSON.stringify({ cFailOneUnit, cFailThousand })}`);
    }

    // 16. Enhanced PO Inline Math ("each ($X)" + tax/shipping/total without subtotal) & Chicago Public PO FMPS Lookup
    const inlineEachPo = await check('/api/miner/po-verify?po_number=PO-INLINE-EACH&question=' + encodeURIComponent('5 laptops at $1,200 each ($6,000), 2 monitors at $350 each ($700), tax $536, shipping $50, grand total $7,286'));
    if (inlineEachPo.status !== 200 || inlineEachPo.json.verified !== true || inlineEachPo.json.amount !== 7286) {
      throw new Error(`Enhanced inline PO math check failed: ${JSON.stringify(inlineEachPo.json)}`);
    }
    const chicagoMatch = await check('/api/miner/po-verify?po_number=294329&vendor=RUSH%20UNIVERSITY%20MEDICAL%20CENTER');
    const chicagoMismatch = await check('/api/miner/po-verify?po_number=294329&vendor=ACME%20CORP');
    if (chicagoMatch.status !== 200 || chicagoMatch.json.verified !== true || chicagoMatch.json.verdict !== 'Verified') {
      throw new Error(`Chicago PO public match failed: ${JSON.stringify(chicagoMatch.json)}`);
    }
    if (chicagoMismatch.status !== 200 || chicagoMismatch.json.verified !== false || chicagoMismatch.json.status !== 'vendor_mismatch') {
      throw new Error(`Chicago PO vendor mismatch check failed: ${JSON.stringify(chicagoMismatch.json)}`);
    }

    // 17. Go Dispatcher optional=map[...] unpacking & empty query placeholder safety
    const goOptSanctions = await check('/api/miner/sanctions-screen?optional=' + encodeURIComponent('map[name:Rosneft Oil Company]'));
    if (goOptSanctions.status !== 200 || goOptSanctions.json.matched !== true || !(goOptSanctions.json.match_count > 0)) {
      throw new Error(`Go optional=map[...] sanctions unpacking failed: ${JSON.stringify(goOptSanctions.json)}`);
    }
    const goOptPlaceholder = await check('/api/miner/sanctions-screen?name=&optional=' + encodeURIComponent('map[name:Rosneft Oil Company]'));
    if (goOptPlaceholder.status !== 200 || goOptPlaceholder.json.matched !== true) {
      throw new Error(`Go optional=map[...] clobbered by empty name param: ${JSON.stringify(goOptPlaceholder.json)}`);
    }
    const goOptPo = await check('/api/miner/po-verify?optional=' + encodeURIComponent('map[po_number:294329 vendor:RUSH UNIVERSITY MEDICAL CENTER]'));
    if (goOptPo.status !== 200 || goOptPo.json.verified !== true || goOptPo.json.verdict !== 'Verified') {
      throw new Error(`Go optional=map[...] PO unpacking failed: ${JSON.stringify(goOptPo.json)}`);
    }

    // 18. Keyless Streamable HTTP & JSON-RPC 2.0 MCP endpoint (/api/mcp)
    const mcpMeta = await check('/api/mcp');
    if (mcpMeta.status !== 200 || mcpMeta.json.ok !== true || mcpMeta.json.transport !== 'streamable-http' || mcpMeta.json.toolsCount !== 10) {
      throw new Error(`GET /api/mcp metadata failed: ${JSON.stringify(mcpMeta)}`);
    }
    const mcpInit = await check('/api/mcp', 'POST', {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: { protocolVersion: '2025-03-26', clientInfo: { name: 'local-test', version: '1.0.0' } }
    });
    if (mcpInit.status !== 200 || mcpInit.json.result?.serverInfo?.name !== 'praman-spend-guard' || !mcpInit.json.result?.protocolVersion) {
      throw new Error(`POST /api/mcp initialize failed: ${JSON.stringify(mcpInit)}`);
    }
    const mcpNotif = await check('/api/mcp', 'POST', {
      jsonrpc: '2.0',
      method: 'notifications/initialized'
    });
    if (mcpNotif.status !== 202) {
      throw new Error(`POST /api/mcp notifications/initialized expected 202, got ${mcpNotif.status}`);
    }
    const mcpList = await check('/api/mcp', 'POST', {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list'
    });
    if (mcpList.status !== 200 || !Array.isArray(mcpList.json.result?.tools) || mcpList.json.result.tools.length !== 10) {
      throw new Error(`POST /api/mcp tools/list failed: ${JSON.stringify(mcpList)}`);
    }
    const mcpCall = await check('/api/mcp', 'POST', {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'screen_sanctions',
        arguments: { name: '0x098B716B8Aaf21512996dC57EB0615e2383E2f96' }
      }
    });
    const mcpCallPayload = JSON.parse(mcpCall.json.result?.content?.[0]?.text || '{}');
    if (mcpCall.status !== 200 || mcpCall.json.result?.isError || mcpCallPayload.matched !== true) {
      throw new Error(`POST /api/mcp tools/call screen_sanctions failed: ${JSON.stringify(mcpCall)}`);
    }
    const mcpPing = await check('/api/mcp', 'POST', { jsonrpc: '2.0', id: 4, method: 'ping' });
    const mcpUnknown = await check('/api/mcp', 'POST', {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: { name: 'nonexistent_tool', arguments: {} }
    });
    if (mcpPing.status !== 200 || mcpUnknown.json.error?.code !== -32602) {
      throw new Error(`POST /api/mcp ping/unknown-tool guard failed: ${JSON.stringify({ mcpPing, mcpUnknown })}`);
    }

    console.log('\nALL ENDPOINTS, P0/P1/POST-AUDIT REGRESSION GUARDS, GO OPTIONAL MAP, STREAMABLE /API/MCP, ISSUE #1, SSRF, DILIGENCE PACK, OFAC EVM & MISSION 02 VERIFIED!');
  } finally {
    server.close();
  }
}

run().catch((err) => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});

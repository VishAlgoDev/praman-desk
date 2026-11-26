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

    // Miner 6164 (INVOICE_LEDGER_RECONCILE_GENERAL): Equation pattern regression check
    const eqRec = await check('/api/miner/invoice-reconcile?invoice=' + encodeURIComponent('INV-7781: USD 12,400.00') + '&ledger=' + encodeURIComponent('PO-7781: 1000 units x USD 12.40 = USD 12,400.00'));
    console.log('invoice-reconcile equation check status:', eqRec.status, 'reconciled:', eqRec.json.reconciled, 'discrepancy:', eqRec.json.discrepancy);
    if (eqRec.status !== 200 || eqRec.json.reconciled !== true || eqRec.json.discrepancy !== 0) {
      throw new Error(`Miner 6164 invoice equation regression check failed: ${JSON.stringify(eqRec.json)}`);
    }

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
    if (health.status !== 200 || !health.json.ok || (health.json.sdnEntriesLoaded || 0) < 19000 || health.json.minerId !== 6164) {
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
      recipientAddress: '0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b',
      amountUsdc: 0.25,
      beneficiaryName: 'Apple Inc.',
      delegationCapUsdc: 500
    });
    const m2Freeze = await check('/api/mission/stablecoin-gate', 'POST', {
      recipientAddress: '0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b',
      amountUsdc: 10,
      beneficiaryName: 'Lazarus Group'
    });
    const m2Fatf = await check('/api/mission/stablecoin-gate', 'POST', {
      recipientAddress: '0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b',
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
      recipientAddress: '0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b',
      amountUsdc: 0.25,
      beneficiaryName: 'Apple Inc.',
      delegationCapUsdc: 0
    });
    const m2OmittedOriginator = await check('/api/mission/stablecoin-gate', 'POST', {
      recipientAddress: '0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b',
      amountUsdc: 1500,
      beneficiaryName: 'Apple Inc.'
    });
    const m2NoTransferTx = await check('/api/mission/stablecoin-gate', 'POST', {
      recipientAddress: '0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b',
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
    if (mcpMeta.status !== 200 || mcpMeta.json.ok !== true || mcpMeta.json.transport !== 'streamable-http' || (mcpMeta.json.toolsCount !== 17 && mcpMeta.json.toolsCount !== 18)) {
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
    if (mcpList.status !== 200 || !Array.isArray(mcpList.json.result?.tools) || (mcpList.json.result.tools.length !== 17 && mcpList.json.result.tools.length !== 18)) {
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

    // 19. Bank-Grade Compliance Certificate (/api/audit/certificate)
    const certJson = await check('/api/audit/certificate?vendor=Stripe%20Inc&invoiceAmount=2500&poAmount=2500&format=json');
    if (certJson.status !== 200 || !certJson.json.certificateId || !certJson.json.cryptographicSeal?.sealDigest) {
      throw new Error(`GET /api/audit/certificate failed: ${JSON.stringify(certJson)}`);
    }

    // 20. FakeWatch Bridge (/api/bridge/fakewatch)
    const fwBridge = await check('/api/bridge/fakewatch', 'POST', { domain: 'unisvvap.org', vendor: 'Stripe, LLC' });
    if (fwBridge.status !== 200 || fwBridge.json.shieldVerdict !== 'BLOCKED_PHISHING') {
      throw new Error(`POST /api/bridge/fakewatch failed: ${JSON.stringify(fwBridge)}`);
    }

    // 21. RugReceipt Bridge (/api/bridge/rugreceipt)
    const rugBridge = await check('/api/bridge/rugreceipt', 'POST', { contractAddress: '0x098B716B8Aaf21512996dC57EB0615e2383E2f96' });
    if (rugBridge.status !== 200 || rugBridge.json.verdict !== 'CRITICAL_RISK') {
      throw new Error(`POST /api/bridge/rugreceipt failed: ${JSON.stringify(rugBridge)}`);
    }

    // 22. Paysheet Bridge (/api/bridge/paysheet)
    const psBridge = await check('/api/bridge/paysheet', 'POST', { target: '0x098B716B8Aaf21512996dC57EB0615e2383E2f96' });
    if (psBridge.status !== 200 || psBridge.json.cleared !== false || psBridge.json.action !== 'HALT_AND_FREEZE') {
      throw new Error(`POST /api/bridge/paysheet failed: ${JSON.stringify(psBridge)}`);
    }

    // 23. Gold Rush Mining Intelligence (/api/miner/mining-intelligence)
    const miningCheck = await check('/api/miner/mining-intelligence?query=' + encodeURIComponent('Mount Morgan Mine VHMS gold and copper production Queensland'));
    if (miningCheck.status !== 200 || miningCheck.json.verdict !== 'VERIFIED_HISTORICAL_RECORD' || miningCheck.json.production?.gold_tonnes !== 262.0) {
      throw new Error(`GET /api/miner/mining-intelligence failed: ${JSON.stringify(miningCheck)}`);
    }

    // 24. Contract Obligation Audit (/api/miner/contract-obligation)
    const contractCheck = await check('/api/miner/contract-obligation?text=' + encodeURIComponent('MahaRERA Section 18 delay interest Registration P51900022104 Apartment B-1402'));
    if (contractCheck.status !== 200 || contractCheck.json.status !== 'delay_interest_triggered') {
      throw new Error(`GET /api/miner/contract-obligation failed: ${JSON.stringify(contractCheck)}`);
    }

    // 25. Gold Rush Multi-Miner Aggregator (/api/gold-rush/aggregate)
    const aggCheck = await check('/api/gold-rush/aggregate?site=Mount%20Morgan%20Mine');
    if (aggCheck.status !== 200 || aggCheck.json.status !== 'SYNTHESIS_ARBITRATED' || aggCheck.json.discrepancies?.length === 0 || !aggCheck.json.arbitrationDigest) {
      throw new Error(`GET /api/gold-rush/aggregate failed: ${JSON.stringify(aggCheck)}`);
    }

    // 26. Generalized Global Mining Intelligence (Kalgoorlie & Carlin Trend)
    const kalgoorlieCheck = await check('/api/miner/mining-intelligence?query=' + encodeURIComponent('Kalgoorlie Super Pit Western Australia'));
    if (kalgoorlieCheck.status !== 200 || kalgoorlieCheck.json.verdict !== 'VERIFIED_HISTORICAL_RECORD' || kalgoorlieCheck.json.country !== 'Australia' || kalgoorlieCheck.json.state !== 'Western Australia') {
      throw new Error(`GET /api/miner/mining-intelligence (Kalgoorlie) failed: ${JSON.stringify(kalgoorlieCheck)}`);
    }

    const carlinCheck = await check('/api/miner/mining-intelligence?query=' + encodeURIComponent('Carlin Trend Nevada United States'));
    if (carlinCheck.status !== 200 || carlinCheck.json.verdict !== 'VERIFIED_HISTORICAL_RECORD' || carlinCheck.json.country !== 'United States' || carlinCheck.json.state !== 'Nevada') {
      throw new Error(`GET /api/miner/mining-intelligence (Carlin Trend) failed: ${JSON.stringify(carlinCheck)}`);
    }

    // 27. Universal Multi-Miner Discrepancy Aggregator for Non-Queensland Deposit (Kalgoorlie)
    const kalAggCheck = await check('/api/gold-rush/aggregate?site=' + encodeURIComponent('Kalgoorlie Super Pit'));
    if (kalAggCheck.status !== 200 || kalAggCheck.json.status !== 'SYNTHESIS_ARBITRATED' || kalAggCheck.json.discrepancies?.length === 0) {
      throw new Error(`GET /api/gold-rush/aggregate (Kalgoorlie) failed: ${JSON.stringify(kalAggCheck)}`);
    }

    // 28. Wholesale Grid Power Price Provider (CAISO NP15 & ERCOT Houston)
    const caisoCheck = await check('/api/miner/grid-power-price?hub=NP15&iso=CAISO&market=RTM');
    if (caisoCheck.status !== 200 || caisoCheck.json.verdict !== 'SETTLEMENT_PRICE_VERIFIED' || caisoCheck.json.iso !== 'CAISO' || typeof caisoCheck.json.price_mwh !== 'number') {
      throw new Error(`GET /api/miner/grid-power-price (CAISO NP15) failed: ${JSON.stringify(caisoCheck)}`);
    }

    const ercotCheck = await check('/api/miner/grid-power-price?hub=Houston&iso=ERCOT');
    if (ercotCheck.status !== 200 || (ercotCheck.json.verdict !== 'LIVE_FEED_UNAVAILABLE' && ercotCheck.json.verdict !== 'SETTLEMENT_PRICE_VERIFIED')) {
      throw new Error(`GET /api/miner/grid-power-price (ERCOT Houston) failed honest live/unavailable check: ${JSON.stringify(ercotCheck)}`);
    }
    if (ercotCheck.json.verdict === 'LIVE_FEED_UNAVAILABLE' && ercotCheck.json.confidence !== 0) {
      throw new Error(`ERCOT unavailable response must report confidence=0: ${JSON.stringify(ercotCheck)}`);
    }

    // 29. Trade Assurance evidence dispositions (missing evidence hold / conflicting reports arbitration / non-delivery refund)
    const taMissing = await check('/api/trade-assurance/audit', 'POST', { poNumber: 'PO-ALI-9023', pierPassReceiptId: 'CN-LAX-88201', scenario: 'alibaba_missing_evidence', disputeResolutionAuthorized: false, reconciledDisbursementUsdc: 0 });
    if (taMissing.status !== 200 || taMissing.json.status !== 'ON_HOLD' || taMissing.json.verdict !== 'HOLD_PENDING_EVIDENCE' || taMissing.json.policyDecision !== 'EVIDENCE_INSUFFICIENT_HOLD' || !taMissing.json.certHash) {
      throw new Error(`Trade Assurance missing-evidence hold failed: ${JSON.stringify(taMissing.json?.status)}`);
    }
    const taConflict = await check('/api/trade-assurance/audit', 'POST', { poNumber: 'PO-ALI-9024', pierPassReceiptId: 'CN-LAX-88201', scenario: 'alibaba_conflicting_reports', disputeResolutionAuthorized: false, reconciledDisbursementUsdc: 0 });
    if (taConflict.status !== 200 || taConflict.json.status !== 'DISPUTED' || taConflict.json.verdict !== 'ARBITRATION_REQUIRED' || taConflict.json.policyDecision !== 'CONFLICTING_EVIDENCE_ARBITRATION') {
      throw new Error(`Trade Assurance conflicting-reports arbitration failed: ${JSON.stringify(taConflict.json?.status)}`);
    }
    const taRefund = await check('/api/trade-assurance/audit', 'POST', { poNumber: 'PO-ALI-9025', pierPassReceiptId: 'CN-LAX-88299', scenario: 'alibaba_refund', disputeResolutionAuthorized: false, reconciledDisbursementUsdc: 0 });
    if (taRefund.status !== 200 || taRefund.json.status !== 'REFUNDED' || taRefund.json.verdict !== 'FULL_REFUND_APPROVED' || taRefund.json.policyDecision !== 'FULL_REFUND_TO_BUYER') {
      throw new Error(`Trade Assurance full-refund disposition failed: ${JSON.stringify(taRefund.json?.status)}`);
    }

    // 30. Anthony (Countersign) PO-ALI-9021 exact math + dryRun copy regression checks (liveSettle: false)
    const taCaseA = await check('/api/spend-guard/evaluate', 'POST', {
      scenario: 'alibaba_trade',
      vendorName: 'Siemens Aktiengesellschaft',
      spendAmountUsdc: 100000,
      poCommitment: 100000,
      statedTotal: 100000,
      statedSubtotal: 100000,
      singleAgentCap: 500,
      dualApprovalCap: 150000,
      supervisorSignature: '0x98021b20Efdb7ae2C57366010a6E0fDE207b4466d3a948192305bad61042781bcf8291048291823ba78192304891283ba192384fca81',
      lineItems: [{ desc: 'Industrial Automation Sensors', qty: 80, unitPrice: 1000, amount: 80000 }],
      liveSettle: false
    });
    if (taCaseA.status !== 200 || taCaseA.json.status !== 'HALTED' || taCaseA.json.conformingUnits !== 80 || taCaseA.json.shortfallUsd !== 20000 || !/80 conforming units/.test(taCaseA.json.summary) || !/20,000 SHORTFALL BLOCKED/.test(taCaseA.json.verdictHeadline)) {
      throw new Error(`Anthony PO-ALI-9021 Case A math/copy regression failed: ${JSON.stringify(taCaseA.json)}`);
    }
    const taCaseB = await check('/api/spend-guard/evaluate', 'POST', {
      scenario: 'alibaba_reconciled',
      vendorName: 'Siemens Aktiengesellschaft',
      spendAmountUsdc: 80000,
      poCommitment: 100000,
      statedTotal: 80000,
      statedSubtotal: 80000,
      singleAgentCap: 500,
      dualApprovalCap: 150000,
      supervisorSignature: '0x98021b20Efdb7ae2C57366010a6E0fDE207b4466d3a948192305bad61042781bcf8291048291823ba78192304891283ba192384fca81',
      lineItems: [{ desc: 'Industrial Automation Sensors', qty: 80, unitPrice: 1000, amount: 80000 }],
      liveSettle: false
    });
    if (taCaseB.status !== 200 || taCaseB.json.status !== 'APPROVED' || taCaseB.json.dryRun !== true || taCaseB.json.liveSettleExecuted !== false || !/Dry-run pre-flight/i.test(taCaseB.json.summary) || /Settled on TakarSettle v4\.$/.test(taCaseB.json.summary)) {
      throw new Error(`Anthony PO-ALI-9021 Case B dryRun copy regression failed: ${JSON.stringify(taCaseB.json)}`);
    }

    // 31. Solana Pre-Signature Spend Guard live endpoint & /api/mission/contract-audit + /api/miner/vendor-verify NL fix
    for (const sc of ['legit', 'hijack', 'drainer', 'cap', 'ofac']) {
      const sg = await check('/api/audit/solana-spend-guard', 'POST', { scenario: sc });
      const expectedVerdict = sc === 'legit' ? 'APPROVED' : 'HALTED';
      if (sg.status !== 200 || sg.json.verdict !== expectedVerdict || sg.json.sdnEntriesScreened < 19000) {
        throw new Error(`Solana Spend Guard scenario ${sc} failed: ${JSON.stringify(sg.json)}`);
      }
    }
    const missionContract = await check('/api/mission/contract-audit', 'POST', {
      contractText: 'Late payment interest accrues at 18% p.a.',
      principal: 50000,
      rate_pct: 18,
      days_overdue: 30
    });
    if (missionContract.status !== 200 || missionContract.json.verdict !== 'Non-compliant' || missionContract.json.penalty_amount <= 0) {
      throw new Error(`POST /api/mission/contract-audit failed: ${JSON.stringify(missionContract.json)}`);
    }
    const vendorCorp = await check('/api/miner/vendor-verify?prompt=Verify%20corporate%20status%20of%20Siemens%20AG');
    if (vendorCorp.status !== 200 || vendorCorp.json.valid !== true || vendorCorp.json.lei !== 'W38RGI023J3WT1HWRP32') {
      throw new Error(`Vendor NL corporate status check failed: ${JSON.stringify(vendorCorp.json)}`);
    }

    // 32. Shareable Case Permalink Route (/api/audit/case) JSON + HTML Verdict Parity
    const caseRes = await check('/api/audit/case?case=po-ali-9021');
    if (caseRes.status !== 200 || caseRes.json.caseId !== 'po-ali-9021' || caseRes.json.releasedAmountUsdc !== 80000 || !caseRes.json.permalink?.includes('/api/audit/case?case=po-ali-9021') || caseRes.json.clearanceVerdict !== 'RECONCILED_PARTIAL_SETTLEMENT') {
      throw new Error(`GET /api/audit/case?case=po-ali-9021 failed: ${JSON.stringify(caseRes.json)}`);
    }
    const htmlRes = await fetch('http://127.0.0.1:3499/api/audit/case?case=po-ali-9021&format=html');
    const htmlBody = await htmlRes.text();
    if (htmlRes.status !== 200 || !/RECONCILED PARTIAL SETTLEMENT/.test(htmlBody) || /DISCREPANCY DETECTED/.test(htmlBody)) {
      throw new Error(`GET /api/audit/case?case=po-ali-9021&format=html showed stale DISCREPANCY banner`);
    }

    // 33. Corporate Registry Epoch 58 multi-word NL fix + Doc Authenticity negation-safe fix
    const nvidiaCorp = await check('/api/miner/corporate-registry?query=' + encodeURIComponent('What is the corporate registration status of Nvidia Corporation?'));
    if (nvidiaCorp.status !== 200 || nvidiaCorp.json.found !== true || !nvidiaCorp.json.registration_id) {
      throw new Error(`Corporate registry Nvidia multi-word NL check failed: ${JSON.stringify(nvidiaCorp.json)}`);
    }
    const docNotExpired = await check('/api/miner/doc-authenticity?prompt=' + encodeURIComponent('Document certificate not expired, signature is valid, OCSP good, digest matches'));
    if (docNotExpired.status !== 200 || docNotExpired.json.authentic !== true) {
      throw new Error(`Doc authenticity negation-safe check failed: ${JSON.stringify(docNotExpired.json)}`);
    }
    const docExpired = await check('/api/miner/doc-authenticity?prompt=' + encodeURIComponent('Document not valid, certificate expired'));
    if (docExpired.status !== 200 || docExpired.json.authentic === true) {
      throw new Error(`Doc authenticity invalid/expired check falsely passed: ${JSON.stringify(docExpired.json)}`);
    }

    // 34. Spend Guard HTTP 400 NaN guard + EIP-191 Countersign verification + Alibaba default poCommitment=100k
    const badNum = await check('/api/spend-guard/evaluate', 'POST', { vendorName: 'Siemens AG', spendAmountUsdc: 'not-a-number' });
    if (badNum.status !== 400 || badNum.json.code !== 'INVALID_NUMERIC_INPUT') {
      throw new Error(`Expected clean HTTP 400 INVALID_NUMERIC_INPUT on NaN spendAmountUsdc, got ${badNum.status}: ${JSON.stringify(badNum.json)}`);
    }
    const forgedCs = await check('/api/spend-guard/evaluate', 'POST', {
      vendorName: 'Siemens Aktiengesellschaft',
      vendorJurisdiction: 'DE',
      spendAmountUsdc: 200,
      statedSubtotal: 200,
      statedTotal: 200,
      countersignReportHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
      countersignSignature: '0xdeadbeef'
    });
    if (forgedCs.status !== 200 || forgedCs.json.countersign?.verified !== false || !forgedCs.json.flags?.some(f => f.includes('COUNTERSIGN_SIGNATURE_INVALID'))) {
      throw new Error(`Forged countersign signature must be rejected cleanly: ${JSON.stringify(forgedCs.json)}`);
    }
    const { privateKeyToAccount } = await import('viem/accounts');
    const testSigner = privateKeyToAccount('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d');
    const csReportHash = '0x2222222222222222222222222222222222222222222222222222222222222222';
    const validSig = await testSigner.signMessage({ message: csReportHash });
    const validCs = await check('/api/spend-guard/evaluate', 'POST', {
      vendorName: 'Siemens Aktiengesellschaft',
      vendorJurisdiction: 'DE',
      spendAmountUsdc: 200,
      statedSubtotal: 200,
      statedTotal: 200,
      countersignReportHash: csReportHash,
      countersignSignature: validSig,
      expectedCountersignSigner: testSigner.address
    });
    if (validCs.status !== 200 || validCs.json.countersign?.verified !== true || validCs.json.countersign?.recoveredSigner?.toLowerCase() !== testSigner.address.toLowerCase()) {
      throw new Error(`Valid EIP-191 countersign failed: ${JSON.stringify(validCs.json)}`);
    }
    const aliDefaultB = await check('/api/spend-guard/evaluate', 'POST', { scenario: 'alibaba_reconciled', liveSettle: false });
    if (aliDefaultB.status !== 200 || aliDefaultB.json.poCommitmentUsd !== 100000 || aliDefaultB.json.shortfallUsd !== 20000) {
      throw new Error(`Default alibaba_reconciled shortfall check failed: ${JSON.stringify({ poCommitmentUsd: aliDefaultB.json.poCommitmentUsd, shortfallUsd: aliDefaultB.json.shortfallUsd })}`);
    }

    // 35. Solana Token-2022 scenarios + mining-intelligence word boundary + Track 2 3-intent expansion
    for (const sc22 of ['token2022_permanent_delegate', 'token2022_transfer_hook', 'token2022_freeze_authority']) {
      const sg22 = await check('/api/audit/solana-spend-guard', 'POST', { scenario: sc22 });
      if (sg22.status !== 200 || sg22.json.verdict !== 'HALTED' || sg22.json.cleared !== false) {
        throw new Error(`Solana Token-2022 HTTP scenario ${sc22} failed: ${JSON.stringify(sg22.json)}`);
      }
    }
    const mineBoundary = await check('/api/miner/mining-intelligence?prompt=' + encodeURIComponent('Evaluate Devnode miner scores'));
    if (mineBoundary.status !== 200 || /\br\s+scores\b/i.test(String(mineBoundary.json.summary || ''))) {
      throw new Error(`Mining intelligence stripped 'miner' word: ${JSON.stringify(mineBoundary.json)}`);
    }
    const b2b = await check('/api/miner/b2b-identity?prompt=' + encodeURIComponent('Enrich siemens.com legal entity name and LEI'));
    const fraudRisk = await check('/api/miner/fraud-risk?prompt=' + encodeURIComponent('Score signup fraud risk: IP 45.83.x.x, headless browser fingerprint, disposable email domain'));
    const payVerify = await check('/api/miner/payment-method-verify?prompt=' + encodeURIComponent('Is BIN 411111 a valid Visa and is routing number 021000021 active?'));
    if (!b2b.json.found || !b2b.json.domain_valid || !(fraudRisk.json.fraud_probability >= 0.7) || payVerify.json.valid !== true) {
      throw new Error(`3-intent expansion check failed: ${JSON.stringify({ b2b: b2b.json.found, fraud: fraudRisk.json.fraud_probability, pay: payVerify.json.valid })}`);
    }

    console.log('\nALL SEASON II ADVERSARIAL REGRESSION GUARDS, TOKEN-2022 HTTP SCENARIOS, EIP-191 COUNTERSIGN, 3 NEW TRACK 2 INTENTS & LIVE VERIFICATION TESTS PASSED!');
  } finally {
    server.close();
  }
}

run().catch((err) => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});

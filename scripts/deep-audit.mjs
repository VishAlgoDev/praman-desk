const BASE_URL = (process.env.BASE_URL || 'https://praman-desk.vercel.app').replace(/\/+$/, '');
const ADAPTER_URL = process.env.WASM_RUNNABLE_URL || 'https://sport-mill-since-link.trycloudflare.com';

async function deepProbe() {
  console.log(`=== RIGOROUS DEEP SYSTEM PROBE (Target: ${BASE_URL}) ===\n`);
  let failures = 0;

  const tests = [
    {
      name: 'Adapter Runner (Docker Adapterexec)',
      optional: true,
      url: ADAPTER_URL,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batch: [{ tokens: [101, 102, 103] }] }),
      assert: (res, j) => res.status === 200 && j !== null
    },
    {
      name: 'Devnode Miner #5289 (Active Registration)',
      url: 'https://devnode.telegraphprotocol.com/api/miners/5289',
      method: 'GET',
      assert: (res, j) => res.status === 200 && j?.miner?.activation_status === 'active'
    },
    {
      name: 'Devnode Evaluator #461 (Expected Rejected OOD Post-Mortem)',
      url: 'https://devnode.telegraphprotocol.com/api/wasm/461',
      method: 'GET',
      assert: (res, j) => res.status === 200 && (j?.wasm?.activation_status === 'rejected' || j?.wasm?.activation_status === 'active')
    },
    {
      name: 'App Health (/api/health)',
      url: `${BASE_URL}/api/health`,
      method: 'GET',
      assert: (res, j) => res.status === 200 && j?.ok === true && (j?.sdnEntriesLoaded || 0) >= 19000 && j?.minerId === 5289
    },
    {
      name: 'App Status (/api/status)',
      url: `${BASE_URL}/api/status`,
      method: 'GET',
      assert: (res, j) => res.status === 200 && j?.ok === true && (j?.sdnEntriesLoaded || 0) >= 19000
    },
    {
      name: 'Corporate Registry (Siemens AG NL)',
      url: `${BASE_URL}/api/miner/corporate-registry?query=${encodeURIComponent("What is Siemens AG's LEI?")}`,
      method: 'GET',
      assert: (res, j) => res.status === 200 && j?.found === true && j?.jurisdiction === 'DE'
    },
    {
      name: 'Corporate Registry (HSBC UK NL)',
      url: `${BASE_URL}/api/miner/corporate-registry?query=${encodeURIComponent('Is HSBC Holdings plc an active company in the UK?')}`,
      method: 'GET',
      assert: (res, j) => res.status === 200 && j?.found === true && j?.jurisdiction === 'GB'
    },
    {
      name: 'Corporate Registry (Apple Inc Delaware NL)',
      url: `${BASE_URL}/api/miner/corporate-registry?query=${encodeURIComponent('Verify legal entity status of Apple Inc. in Delaware?')}`,
      method: 'GET',
      assert: (res, j) => res.status === 200 && j?.found === true
    },
    {
      name: 'Corporate Registry (Non-Existent Edge Case)',
      url: `${BASE_URL}/api/miner/corporate-registry?query=${encodeURIComponent('Is FakeCompany9999XYZ an active company in Antarctica?')}`,
      method: 'GET',
      assert: (res, j) => res.status === 200 && j?.found === false && j?.verdict === 'not_found'
    },
    {
      name: 'Regulatory Filing (Federal Register Boeing NL)',
      url: `${BASE_URL}/api/miner/regulatory-filing?query=${encodeURIComponent('How many Federal Register documents mention Boeing in the last 12 months?')}`,
      method: 'GET',
      assert: (res, j) => res.status === 200 && j?.found === true && (j?.federal_register_notices || []).length > 0
    },
    {
      name: 'Regulatory Filing (SEC EDGAR Tesla 2025 10-K === 1)',
      url: `${BASE_URL}/api/miner/regulatory-filing?query=${encodeURIComponent('Did Tesla file a 10-K in 2025?')}`,
      method: 'GET',
      assert: (res, j) => res.status === 200 && j?.found === true && (j?.sec_filings || []).length === 1
    },
    {
      name: 'Sanctions Screen (Clean + AIA False-Positive Guard)',
      url: `${BASE_URL}/api/miner/sanctions-screen?name=${encodeURIComponent('AIA Group Limited')}`,
      method: 'GET',
      assert: (res, j) => res.status === 200 && j?.matched === false && j?.match_count === 0
    },
    {
      name: 'Sanctions Screen (SDN Comma-Name Transliteration: Viktor Bout)',
      url: `${BASE_URL}/api/miner/sanctions-screen?name=${encodeURIComponent('Viktor Bout')}`,
      method: 'GET',
      assert: (res, j) => res.status === 200 && j?.matched === true && j?.match_count > 0
    },
    {
      name: 'Vendor Verify (GLEIF DE + Mismatch Rejection)',
      url: `${BASE_URL}/api/miner/vendor-verify?vendor=${encodeURIComponent('Apple Inc.')}&vat_number=DE143454214`,
      method: 'GET',
      assert: (res, j) => res.status === 200 && j?.valid === false && j?.status === 'vat_entity_mismatch'
    },
    {
      name: 'Issue #1 Guard: Bare Invoice/PO Refs Must Be Inconclusive',
      url: `${BASE_URL}/api/miner/invoice-reconcile`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ params: { invoice: 'Document reference 48291', ledger: 'Receipt reference 48291' } }),
      assert: (res, j) => res.status === 200 && j?.reconciled === null && j?.status === 'insufficient_evidence'
    },
    {
      name: 'Issue #1 Guard: 102660.00 INR vs 0.00 INR Preserved With Ref ID',
      url: `${BASE_URL}/api/miner/invoice-reconcile`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ params: { invoice: 'Invoice total 102660.00 INR; reference ID 48291', ledger: 'Ledger paid 0.00 INR; reference ID 48291' } }),
      assert: (res, j) => res.status === 200 && j?.reconciled === false && j?.discrepancy === 102660
    },
    {
      name: 'Doc Authenticity (Partial Query HTTP 200 Inconclusive)',
      url: `${BASE_URL}/api/miner/doc-authenticity?signedQrAmount=100`,
      method: 'GET',
      assert: (res, j) => res.status === 200 && j?.status === 'insufficient_evidence'
    },
    {
      name: 'PO Verify (Arithmetic Mismatch)',
      url: `${BASE_URL}/api/miner/po-verify?po_number=PO-999&items=%5B%7B%22name%22%3A%22Item%22%2C%22quantity%22%3A2%2C%22unit_price%22%3A50%7D%5D&subtotal=100&tax=10&shipping=5&grand_total=999`,
      method: 'GET',
      assert: (res, j) => res.status === 200 && j?.verified === false && j?.status === 'arithmetic_mismatch' && j?.discrepancy === 884
    },
    {
      name: 'Diligence Pack (5 Jurisdictions, 16 Checks)',
      url: `${BASE_URL}/api/audit/diligence-pack`,
      method: 'GET',
      assert: (res, j) => res.status === 200 && j?.jurisdictions?.length === 5 && j?.machineInvoice?.totalChecksExecuted === 16 && /^0x[0-9a-f]{64}$/i.test(j?.packSha256 || '')
    },
    {
      name: 'Mission 02 Stablecoin Gate (Clean Sepolia Approve)',
      url: `${BASE_URL}/api/mission/stablecoin-gate`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientAddress: '0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b',
        amountUsdc: 0.25,
        beneficiaryName: 'Apple Inc.',
        delegationCapUsdc: 500
      }),
      assert: (res, j) => res.status === 200 && j?.cleared === true && j?.action === 'APPROVE_USDC_TRANSFER'
    },
    {
      name: 'Mission 02 Stablecoin Gate (OFAC Sanctions Freeze)',
      url: `${BASE_URL}/api/mission/stablecoin-gate`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientAddress: '0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b',
        amountUsdc: 10,
        beneficiaryName: 'Lazarus Group'
      }),
      assert: (res, j) => res.status === 200 && j?.cleared === false && j?.action === 'REJECT_AND_FREEZE'
    }
  ];

  for (const t of tests) {
    const t0 = Date.now();
    try {
      const opts = { method: t.method, signal: AbortSignal.timeout(15000) };
      if (t.headers) opts.headers = t.headers;
      if (t.body) opts.body = t.body;
      const res = await fetch(t.url, opts);
      const elapsed = Date.now() - t0;
      const json = await res.json().catch(() => null);
      const ok = t.assert(res, json);
      const tag = ok ? 'PASS' : (t.optional ? 'WARN' : 'FAIL');
      if (!ok && !t.optional) failures++;
      console.log(`[${tag}] ${t.name} -> HTTP ${res.status} (${elapsed}ms)`);
      if (t.name.includes('#461')) {
        console.log(`   activation_status=${json?.wasm?.activation_status} stage=${json?.wasm?.stage} reason=${json?.wasm?.rejection_reason}`);
      } else if (!ok) {
        console.log(`   Unexpected payload: ${JSON.stringify(json)?.slice(0, 260)}`);
      }
    } catch (err) {
      const tag = t.optional ? 'WARN' : 'FAIL';
      if (!t.optional) failures++;
      console.log(`[${tag}] ${t.name} -> ERROR: ${err.message}`);
    }
  }

  console.log(`\n=== DEEP PROBE SUMMARY: ${tests.length - failures}/${tests.length} PASSED (${failures} CRITICAL FAILURES) ===`);
  if (failures > 0) process.exit(1);
}

deepProbe();

async function deepProbe() {
  console.log('=== RIGOROUS DEEP SYSTEM PROBE ===\n');

  const tests = [
    {
      name: 'Adapter Runner (Docker Adapterexec)',
      url: process.env.WASM_RUNNABLE_URL || 'https://sport-mill-since-link.trycloudflare.com',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batch: [ { tokens: [101, 102, 103] } ] })
    },
    {
      name: 'Devnode Miner #5281',
      url: 'https://devnode.telegraphprotocol.com/api/miners/5281',
      method: 'GET'
    },
    {
      name: 'Devnode Evaluator #461',
      url: 'https://devnode.telegraphprotocol.com/api/wasm/461',
      method: 'GET'
    },
    {
      name: 'Vercel: Corporate Registry (Siemens NL)',
      url: 'https://praman-desk.vercel.app/api/miner/corporate-registry?query=Is%20Siemens%20AG%20an%20active%20company%20in%20Germany%3F',
      method: 'GET'
    },
    {
      name: 'Vercel: Corporate Registry (Edge Case: Nonexistent Entity)',
      url: 'https://praman-desk.vercel.app/api/miner/corporate-registry?query=Is%20FakeCompany9999XYZ%20an%20active%20company%20in%20Antarctica%3F',
      method: 'GET'
    },
    {
      name: 'Vercel: Regulatory Filing (Boeing 12m)',
      url: 'https://praman-desk.vercel.app/api/miner/regulatory-filing?query=How%20many%20Federal%20Register%20documents%20mention%20Boeing%20in%20the%20last%2012%20months%3F',
      method: 'GET'
    },
    {
      name: 'Vercel: Regulatory Filing (SEC EDGAR fallback)',
      url: 'https://praman-desk.vercel.app/api/miner/regulatory-filing?company=Tesla&period=2026',
      method: 'GET'
    },
    {
      name: 'Vercel: Sanctions Screen (Clean Entity)',
      url: 'https://praman-desk.vercel.app/api/miner/sanctions-screen?name=John%20Smith%20Innocent%20Person',
      method: 'GET'
    },
    {
      name: 'Vercel: Sanctions Screen (SDN Entity)',
      url: 'https://praman-desk.vercel.app/api/miner/sanctions-screen?name=PUTIN,%20Vladimir',
      method: 'GET'
    },
    {
      name: 'Vercel: Vendor Verify (GLEIF DE)',
      url: 'https://praman-desk.vercel.app/api/miner/vendor-verify?company=Siemens%20AG&jurisdiction=DE',
      method: 'GET'
    },
    {
      name: 'Vercel: PO Verify (Arithmetic Mismatch)',
      url: 'https://praman-desk.vercel.app/api/miner/po-verify?po_number=PO-999&items=%5B%7B%22name%22%3A%22Item%22%2C%22quantity%22%3A2%2C%22unit_price%22%3A50%7D%5D&subtotal=100&tax=10&shipping=5&grand_total=999',
      method: 'GET'
    },
    {
      name: 'Vercel: Diligence Pack (5 Jurisdictions)',
      url: 'https://praman-desk.vercel.app/api/audit/diligence-pack',
      method: 'GET'
    }
  ];

  for (const t of tests) {
    const t0 = Date.now();
    try {
      const opts = { method: t.method };
      if (t.headers) opts.headers = t.headers;
      if (t.body) opts.body = t.body;
      const res = await fetch(t.url, opts);
      const elapsed = Date.now() - t0;
      const json = await res.json().catch(() => null);
      let tag = res.status === 200 ? 'PASS' : 'WARN';
      if (t.name.includes('Edge Case')) {
        const count = json?.results?.length ?? json?.result_count ?? 0;
        if (json?.found !== false || json?.verdict !== 'not_found') tag = 'WARN';
        console.log('[' + tag + '] ' + t.name + ' -> HTTP ' + res.status + ' (' + elapsed + 'ms)');
        console.log('   Response summary: found=' + json?.found + ', verdict=' + json?.verdict + ', count=' + count);
        continue;
      }
      if (t.name.includes('PO Verify')) {
        if (json?.verified !== false || json?.status !== 'arithmetic_mismatch' || json?.discrepancy !== 884) tag = 'WARN';
        console.log('[' + tag + '] ' + t.name + ' -> HTTP ' + res.status + ' (' + elapsed + 'ms)');
        console.log('   PO verified=' + json?.verified + ', status=' + json?.status + ', discrepancy=' + json?.discrepancy);
        continue;
      }
      if (t.name.includes('Diligence Pack')) {
        if (json?.jurisdictions?.length !== 5 || !/^0x[0-9a-f]{64}$/i.test(json?.packSha256 || '')) tag = 'WARN';
        console.log('[' + tag + '] ' + t.name + ' -> HTTP ' + res.status + ' (' + elapsed + 'ms)');
        console.log('   Pack jurisdictions=' + (json?.jurisdictions?.length ?? 0) + ', packSha256=' + json?.packSha256?.slice(0, 18) + '..., durationMs=' + json?.durationMs);
        continue;
      }
      console.log('[' + tag + '] ' + t.name + ' -> HTTP ' + res.status + ' (' + elapsed + 'ms)');
      if (t.name.includes('Sanctions Screen (Clean)')) {
        console.log('   Sanctions clean matched=' + json?.matched + ', count=' + json?.match_count);
      }
      if (t.name.includes('Sanctions Screen (SDN)')) {
        console.log('   Sanctions SDN matched=' + json?.matched + ', top match=' + json?.matches?.[0]?.matched_name);
      }
    } catch (err) {
      console.log('[FAIL] ' + t.name + ' -> ERROR: ' + err.message);
    }
  }
}

deepProbe();

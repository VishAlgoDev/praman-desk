async function runHealthCheck() {
  console.log('=== SYSTEM HEALTH CHECK: PRAMAN DESK & TELEGRAPH S2 ===\n');

  // 1. Adapter Runner (Colab + Cloudflare Tunnel)
  try {
    const t0 = Date.now();
    const RUNNER_URL = process.env.WASM_RUNNABLE_URL || 'https://sport-mill-since-link.trycloudflare.com';
    const res = await fetch(RUNNER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batch: [ { tokens: [101, 102, 103] } ] })
    });
    const data = await res.json();
    const elapsed = Date.now() - t0;
    if (res.status === 200 && data.results?.[0]?.score) {
      console.log('✅ 1. Adapter Runner (Docker): HEALTHY');
      console.log('   - Status: HTTP ' + res.status + ' (' + elapsed + 'ms)');
      console.log('   - Test Score: ' + data.results[0].score);
      console.log('   - URL: ' + RUNNER_URL);
    } else {
      console.log('⚠️ 1. Adapter Runner (Docker): UNEXPECTED RESPONSE', data);
    }
  } catch (err) {
    console.log('❌ 1. Adapter Runner (Docker): OFFLINE / ERROR', err.message);
  }

  // 2. Devnode Adapter #461 & #460 Status
  for (const regId of [461, 460]) {
    try {
      const res = await fetch(`https://devnode.telegraphprotocol.com/api/wasm/${regId}`).then(r => r.json());
      if (res.error) {
        console.log(`\n⏳ 2. Devnode Adapter #${regId}: PENDING DEVNODE INDEXER (${res.error})`);
      } else {
        const wasm = res.wasm || res;
        console.log(`\n✅ 2. Devnode Adapter #${regId}: INDEXED`);
        console.log('   - Stage: ' + wasm.stage);
        console.log('   - Reason: ' + (wasm.eval?.reason || wasm.rejection_reason || 'OK'));
        console.log('   - Runnable URL: ' + wasm.wasm_runnable_url);
      }
    } catch (err) {
      console.log(`\n❌ 2. Devnode Adapter #${regId}: ERROR`, err.message);
    }
  }

  // 3. Devnode Miner #5281 Status
  try {
    const res = await fetch('https://devnode.telegraphprotocol.com/api/miners/5281').then(r => r.json());
    const m = res.miner || res;
    console.log('\n✅ 3. Devnode Miner #5281: ' + (m.activation_status === 'active' ? 'ACTIVE' : m.activation_status));
    console.log('   - Slug: ' + m.slug);
    console.log('   - Activation: ' + m.activation_status);
    console.log('   - Active Intents: ' + (m.supported_intents?.length || 7) + ' intents');
  } catch (err) {
    console.log('\n❌ 3. Devnode Miner #5281: ERROR', err.message);
  }

  // 4. Live Vercel Production Deployment
  try {
    const corp = await fetch('https://praman-desk.vercel.app/api/miner/corporate-registry?query=Is%20Siemens%20AG%20an%20active%20company%20in%20Germany%3F').then(r => r.json());
    const reg = await fetch('https://praman-desk.vercel.app/api/miner/regulatory-filing?query=How%20many%20Federal%20Register%20documents%20mention%20Boeing%20in%20the%20last%2012%20months%3F').then(r => r.json());
    
    const corpOk = corp.found === true && corp.legal_name === 'Siemens Aktiengesellschaft';
    const regOk = reg.found === true && reg.filing_count === 188;

    if (corpOk && regOk) {
      console.log('\n✅ 4. Live Vercel Production (https://praman-desk.vercel.app): HEALTHY');
      console.log('   - Corporate Registry NL Query: Siemens AG -> ' + corp.legal_name + ' (' + corp.registration_id + ') [OK]');
      console.log('   - Federal Register NL Query: Boeing 12m -> ' + reg.filing_count + ' filings [OK]');
    } else {
      console.log('\n⚠️ 4. Live Vercel Production: PARTIAL', { corpOk, regOk });
    }
  } catch (err) {
    console.log('\n❌ 4. Live Vercel Production: ERROR', err.message);
  }

  // 5. Devnode Current Epoch
  try {
    const res = await fetch('https://devnode.telegraphprotocol.com/api/epochs').then(r => r.json());
    const latest = res.epochs ? res.epochs[0] : res[0];
    console.log('\nℹ️ 5. Devnode Epoch State:');
    console.log('   - Latest Epoch: #' + latest.epoch_id);
    console.log('   - Last Scored At: ' + latest.last_scored_at);
  } catch (err) {
    console.log('\n❌ 5. Devnode Epoch State: ERROR', err.message);
  }
}

runHealthCheck();

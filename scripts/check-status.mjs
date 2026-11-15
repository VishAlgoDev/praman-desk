// Node.js native fetch

async function main() {
  console.log('=== 1. Checking Devnode WASM Adapters for SANCTIONS_SCREENING_MATCH ===');
  try {
    const res = await fetch('https://devnode.telegraphprotocol.com/api/wasm?intent=SANCTIONS_SCREENING_MATCH').then(r => r.json());
    const intentData = res.intents?.SANCTIONS_SCREENING_MATCH;
    console.log('Champion:', JSON.stringify(intentData?.champion, null, 2));
    const entries = intentData?.entries || [];
    console.log(`Total entries: ${entries.length}`);
    for (const e of entries) {
      console.log(`ID: ${e.id || e.registration_id} | Submitter: ${e.submitter || e.wallet_address} | Stage: ${e.stage} | Score: ${e.score} | URL: ${e.runnable_url || e.url}`);
    }
  } catch (err) {
    console.error('Error fetching WASM adapters:', err.message);
  }

  console.log('\n=== 2. Checking Devnode Epoch & Leaderboard ===');
  try {
    const lb = await fetch('https://devnode.telegraphprotocol.com/api/leaderboard').then(r => r.json());
    console.log('Leaderboard Epoch:', lb.epoch || lb.current_epoch);
  } catch (e) {
    console.log('Leaderboard fetch note:', e.message);
  }

  console.log('\n=== 3. Checking On-Chain Receipt for Adapter #460 ===');
  try {
    const receipt = await fetch('https://devnode.telegraphprotocol.com/api/wasm/460').then(r => r.json());
    console.log('WASM 460 endpoint:', receipt);
  } catch (e) {
    console.log('WASM 460 direct endpoint error:', e.message);
  }
}

main();

async function checkMiner() {
  const miners = await fetch('https://devnode.telegraphprotocol.com/api/miners').then(r => r.json());
  const me = miners.find(m => m.id == 5185 || m.id == 5186);
  if (me) {
    console.log('Miner latest epoch: ' + me.last_scored_epoch + ' | scored at: ' + me.last_scored_at);
    console.log('Scores:');
    for (const s of me.scores || []) {
      console.log('  Intent: ' + s.intent_id + ' | Epoch: ' + s.epoch_id + ' | Score: ' + s.score + ' | Rank: ' + s.rank);
    }
  } else {
    console.log('Miner not found in miners list');
  }

  const wasmRes = await fetch('https://devnode.telegraphprotocol.com/api/wasm?intent=SANCTIONS_SCREENING_MATCH').then(r => r.json());
  console.log('\nWASM Intent SANCTIONS_SCREENING_MATCH:');
  const entries = wasmRes.intents?.SANCTIONS_SCREENING_MATCH?.entries || [];
  const entry457 = entries.find(e => e.id == 457 || e.registration_id == 457);
  console.log('Entry 457:', JSON.stringify(entry457 || 'not found in entries', null, 2));
}

checkMiner();

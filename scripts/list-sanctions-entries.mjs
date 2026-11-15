async function main() {
  const res = await fetch('https://devnode.telegraphprotocol.com/api/wasm');
  const d = await res.json();
  const s = d.intents['SANCTIONS_SCREENING_MATCH'];
  console.log('Entries count:', s.entries.length);
  for (const e of s.entries) {
    console.log(`ID: ${e.registration_id}, Status: ${e.activation_status}, Stage: ${e.stage}, Hash: ${e.wasm_hash.slice(0, 10)}..., Author: ${e.author_address}`);
  }
}

main().catch(console.error);

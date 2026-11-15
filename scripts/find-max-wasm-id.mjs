async function main() {
  const res = await fetch('https://devnode.telegraphprotocol.com/api/wasm');
  const d = await res.json();
  let maxId = 0;
  let latestEntry = null;
  for (const [intent, obj] of Object.entries(d.intents)) {
    if (obj.entries) {
      for (const e of obj.entries) {
        if (e.registration_id < 900000 && e.registration_id > maxId) {
          maxId = e.registration_id;
          latestEntry = e;
        }
      }
    }
  }
  console.log(`Max Normal Registration ID: ${maxId}`);
  console.log('Latest Entry:', JSON.stringify(latestEntry, null, 2));
}

main().catch(console.error);

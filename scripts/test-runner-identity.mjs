async function test() {
  const res = await fetch('https://pet-becomes-horses-accordingly.trycloudflare.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batch: [], adapter_hash: 'probe' })
  });
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Live Runner Identity:');
  console.log('  adapter_hash:   ', data.adapter_hash);
  console.log('  foundation_hash:', data.foundation_hash);
  console.log('  tokenizer_hash: ', data.tokenizer_hash);
}
test();

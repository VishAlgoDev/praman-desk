async function inspect() {
  const res = await fetch('https://devnode.telegraphprotocol.com/api/miners').then(r => r.json());
  const miner = res.find(m => m.id === '5281');
  console.log('Full miner 5281:', JSON.stringify(miner, null, 2));
}
inspect();

import fs from 'fs';

async function main() {
  console.log('Fetching miners from Devnode API...');
  const res = await fetch('https://devnode.telegraphprotocol.com/api/miners');
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  const miners = Array.isArray(data) ? data : (data.miners || []);
  console.log('Loaded', miners.length, 'miners');
  
  const intents = [
    'REGULATORY_FILING_MONITOR_GENERAL',
    'CORPORATE_REGISTRY_LOOKUP_GENERAL',
    'INVOICE_LEDGER_RECONCILE_GENERAL',
    'PURCHASE_ORDER_VERIFY_GENERAL',
    'DOCUMENT_AUTHENTICITY_GENERAL',
    'VENDOR_VERIFY_GENERAL',
    'SANCTIONS_SCREENING_MATCH_GENERAL'
  ];

  for (const intent of intents) {
    const list = [];
    for (const m of miners) {
      if (m.scores && Array.isArray(m.scores)) {
        const s = m.scores.find(x => x.intent_id === intent);
        if (s) {
          list.push({ id: m.id, slug: m.slug, rank: s.rank, score: s.score, epoch: s.epoch_id });
        }
      }
    }
    list.sort((a, b) => a.rank - b.rank);
    console.log(`\n=== Leaderboard for ${intent} (${list.length} ranked) ===`);
    console.log(list.slice(0, 10));
  }
}

main().catch(console.error);

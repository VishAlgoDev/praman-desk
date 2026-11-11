const NODE_URL = 'https://devnode.telegraphprotocol.com';

const canonicalIntents = [
  { intent: 'PURCHASE_ORDER_VERIFY_GENERAL', body: { po_number: 'PO-2026-001', vendor: 'SAP SE' } },
  { intent: 'INVOICE_LEDGER_RECONCILE_GENERAL', body: { invoice: 'INV-100', ledger: 'LED-100' } },
  { intent: 'VENDOR_VERIFY_GENERAL', body: { vendor: 'SAP SE', vat_number: 'DE143454238' } },
  { intent: 'DOCUMENT_AUTHENTICITY_GENERAL', body: { document: 'Test document text with SHA256 e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' } },
  { intent: 'CORPORATE_REGISTRY_LOOKUP_GENERAL', body: { company: 'SAP SE', jurisdiction: 'DE' } },
  { intent: 'SANCTIONS_SCREENING_MATCH_GENERAL', body: { name: 'Banco Nacional de Cuba' } },
  { intent: 'REGULATORY_FILING_MONITOR_GENERAL', body: { entity: 'Goldman Sachs', period: '2026' } }
];

async function probe() {
  console.log('--- Probing /engine/v1/ask/praman-compliance-miner across all 7 canonical intents ---');
  let passCount = 0;
  for (const item of canonicalIntents) {
    const url = `${NODE_URL}/engine/v1/ask/praman-compliance-miner`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: item.intent,
        params: item.body
      })
    });
    console.log(`[${res.status}] ${item.intent}`);
    if (res.status === 402) {
      passCount++;
      const paymentReq = res.headers.get('payment-required');
      console.log(`  -> 402 Challenge OK. Payment-Required header length: ${paymentReq ? paymentReq.length : 0}`);
    } else {
      const err = await res.text();
      console.log(`  -> Failed with status ${res.status}: ${err}`);
    }
  }
  console.log(`\nResult: ${passCount} / ${canonicalIntents.length} intents returned valid 402 challenge!`);
}

probe().catch(console.error);

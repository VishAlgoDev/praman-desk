import http from 'http';
import { handleApiRequest } from '../src/handlers.mjs';

const server = http.createServer((req, res) => {
  handleApiRequest(req, res);
});

server.listen(3991, async () => {
  console.log('Test probe server listening on 3991...');

  // 1. Novel Arbitrary Invoice
  const res1 = await fetch('http://localhost:3991/api/miner/invoice-reconcile?question=Reconcile%20invoice%20INV-8831%20billing%20500%20units%20at%20$40%20each%20with%2010%25%20tax%20against%20GRN-221%20confirming%20450%20units%20at%20$40%20each%20with%2010%25%20tax');
  const json1 = await res1.json();
  console.log('\n--- 1. Novel Invoice Result ---');
  console.log('Status:', res1.status);
  console.log('reconciled:', json1.reconciled);
  console.log('discrepancy:', json1.discrepancy);
  console.log('verdict:', json1.verdict);
  console.log('summary:', json1.summary);

  // 2. Novel Arbitrary Contract Obligation
  const res2 = await fetch('http://localhost:3991/api/miner/contract-obligation?question=EPC%20Contract%20Value%20=%20USD%205,000,000.%20Sub-Clause%208.7%20Delay%20Liquidated%20Damages%20=%200.5%25%20per%20week%20delayed.%20Contractor%20delayed%20by%204%20weeks.');
  const json2 = await res2.json();
  console.log('\n--- 2. Novel Contract Result ---');
  console.log('Status:', res2.status);
  console.log('compliant:', json2.compliant);
  console.log('penalty_amount:', json2.penalty_amount);
  console.log('citations:', json2.citations);
  console.log('verdict:', json2.verdict);
  console.log('summary:', json2.summary);

  server.close(() => {
    console.log('\nProbe complete.');
    process.exit(0);
  });
});

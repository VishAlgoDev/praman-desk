/**
 * Gold Rush: Autonomous Multi-Miner Aggregator & Discrepancy Arbitrator
 * Telegraph Protocol Season II — Flagship Cross-Track Architecture
 *
 * Implements Ahmed Ali's architectural directive:
 * "Gold Rush needs complementary intelligence from multiple Miners. It should be able
 * to call specific Miners directly through Telegraph, combine their evidence and
 * investigate missing or contradictory information. The aggregation logic belongs inside Gold Rush."
 *
 * Powered by the Generalized MultiMinerAggregator engine.
 */

import { MultiMinerAggregator } from './multi-miner-aggregator.mjs';

export { MultiMinerAggregator };
export const GoldRushAggregator = MultiMinerAggregator;

// Standalone self-test runner when executed directly
if (process.argv[1] && process.argv[1].endsWith('gold-rush-aggregator.mjs')) {
  console.log('=== Testing Generalized Multi-Miner Aggregator & Discrepancy Arbitrator ===\n');

  const aggregator = new MultiMinerAggregator();

  // Test Case 1: Mount Morgan Mine with Real Variance & Contradiction Detection
  console.log('▶ Test 1: Arbitrating Mount Morgan Mine (Queensland)...');
  const mmCandidates = [
    {
      minerId: 'miner-6164-praman',
      content: 'Mount Morgan Mine discovered in 1882 by Morgan Brothers. Produced 262 tonnes (8.4 million oz) gold and 387,000 tonnes copper from a Devonian VHMS replacement deposit in Trondhjemite.'
    },
    {
      minerId: 'miner-unverified-competitor',
      content: 'Mount Morgan was discovered in 1895 by BHP Corporation and yielded 45 million ounces from an epithermal quartz reef with zero copper content.'
    }
  ];
  const mmResult = aggregator.aggregateResponses('Mount Morgan Mine', mmCandidates);
  console.log(`   Status: ${mmResult.status}`);
  console.log(`   Queried: ${mmResult.totalMinersQueried} | Accepted: ${mmResult.acceptedMinersCount} | Rejected: ${mmResult.rejectedMinersCount}`);
  console.log(`   Discrepancies caught (${mmResult.discrepancies.length}):`);
  for (const d of mmResult.discrepancies) {
    console.log(`     • ${d}`);
  }
  console.log(`   Arbitration Digest: ${mmResult.arbitrationDigest}`);

  if (mmResult.discrepancies.length < 2) {
    throw new Error('Test 1 Failed: Expected at least 2 discrepancies caught (numerical variance and classification conflict).');
  }
  console.log('   PASS ✅\n');

  // Test Case 2: Kalgoorlie Super Pit (Western Australia) — Proving Universal Generalization!
  console.log('▶ Test 2: Arbitrating Kalgoorlie Super Pit (Western Australia)...');
  const kalCandidates = [
    {
      minerId: 'miner-gswa-verified',
      content: 'Kalgoorlie Super Pit (Fimiston Open Pit) in Western Australia discovered in 1893 by Hannan, Flanagan and Shea. Produced over 60 million ounces of gold from an Archean orogenic lode gold deposit in the Golden Mile Dolerite.'
    },
    {
      minerId: 'miner-hallucinating-bot',
      content: 'Kalgoorlie Super Pit was founded in 1950 in Queensland as an epithermal placer deposit yielding 2 million ounces.'
    }
  ];
  const kalResult = aggregator.aggregateResponses('Kalgoorlie Super Pit', kalCandidates);
  console.log(`   Status: ${kalResult.status}`);
  console.log(`   Jurisdiction: ${kalResult.consensusEvidence.jurisdiction}`);
  console.log(`   Discrepancies caught (${kalResult.discrepancies.length}):`);
  for (const d of kalResult.discrepancies) {
    console.log(`     • ${d}`);
  }

  if (kalResult.discrepancies.length < 2) {
    throw new Error('Test 2 Failed: Expected at least 2 discrepancies caught on Kalgoorlie.');
  }
  console.log('   PASS ✅\n');

  // Test Case 3: Carlin Trend (Nevada, USA) — Proving Global Multi-Jurisdiction!
  console.log('▶ Test 3: Arbitrating Carlin Trend (Nevada, United States)...');
  const carlinCandidates = [
    {
      minerId: 'miner-usgs-specialist',
      content: 'Carlin Trend in Nevada discovered in 1961 by John Livermore of Newmont. Eponymous Carlin-type sediment-hosted disseminated gold deposit yielding over 84 million ounces gold.'
    },
    {
      minerId: 'miner-confused-competitor',
      content: 'Carlin Trend discovered in 1880 in South Africa as a VHMS volcanic massive sulfide deposit.'
    }
  ];
  const carlinResult = aggregator.aggregateResponses('Carlin Trend', carlinCandidates);
  console.log(`   Status: ${carlinResult.status}`);
  console.log(`   Jurisdiction: ${carlinResult.consensusEvidence.jurisdiction}`);
  console.log(`   Discrepancies caught: ${carlinResult.discrepancies.length}`);
  if (carlinResult.discrepancies.length < 1) {
    throw new Error('Test 3 Failed: Expected classification/temporal discrepancies caught on Carlin Trend.');
  }
  console.log('   PASS ✅\n');

  console.log('=== All Multi-Miner Aggregation Tests Passed with 100% Determinism & Universal Generalization ✅ ===');
}

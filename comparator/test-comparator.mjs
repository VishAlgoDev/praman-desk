import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const wasmBytes = fs.readFileSync(path.join(__dirname, 'comparator.wasm'));

const wasmModule = await WebAssembly.instantiate(wasmBytes, {});
const { imw_alloc, imw_score_deterministic, memory } = wasmModule.instance.exports;

const specPtr = imw_alloc(16);
const view = new DataView(memory.buffer);

function runCase(truth, miner, code, tolerance) {
  // write 16 bytes spec: code (i32 at 0), tolerance (i64 at 8)
  view.setInt32(specPtr, code, true);
  view.setInt32(specPtr + 4, 0, true);
  view.setBigInt64(specPtr + 8, BigInt(tolerance), true);

  return Number(imw_score_deterministic(BigInt(truth), BigInt(miner), specPtr));
}

let passed = 0;
let total = 0;

function assertScore(truth, miner, code, tolerance, expected, desc) {
  total++;
  const actual = runCase(truth, miner, code, tolerance);
  if (Math.abs(actual - expected) > 1) {
    console.error(`FAIL: ${desc} | truth=${truth}, miner=${miner}, code=${code}, tol=${tolerance} => expected ${expected}, got ${actual}`);
    process.exit(1);
  }
  passed++;
}

console.log('--- Starting Stage 2 Correctness Verification Suite ---\n');

// 1. Code 0: Exact
assertScore(100, 100, 0, 0, 10000, 'Exact match code 0');
assertScore(100, 101, 0, 0, 0, 'Exact mismatch code 0');
assertScore(100, 100, 0, 50, 10000, 'Exact match code 0 ignores tolerance');
assertScore(100, 101, 0, 50, 0, 'Exact mismatch code 0 ignores tolerance');
assertScore(-500, -500, 0, 0, 10000, 'Exact negative match code 0');
assertScore(-500, -501, 0, 0, 0, 'Exact negative mismatch code 0');

// 2. Code 3: PassFail
assertScore(250, 250, 3, 0, 10000, 'PassFail match');
assertScore(250, 251, 3, 0, 0, 'PassFail mismatch');

// 3. Unknown code (treated as Exact)
assertScore(42, 42, 99, 10, 10000, 'Unknown code match');
assertScore(42, 43, 99, 10, 0, 'Unknown code mismatch');

// 4. Code 1: AbsTol
assertScore(1000, 1000, 1, 100, 10000, 'AbsTol exact match');
assertScore(1000, 1050, 1, 100, 7500, 'AbsTol 25% error -> score 7500');
assertScore(1000, 950, 1, 100, 7500, 'AbsTol -25% error -> score 7500');
assertScore(1000, 1100, 1, 100, 5000, 'AbsTol 50% error (1x tol) -> score 5000');
assertScore(1000, 900, 1, 100, 5000, 'AbsTol -50% error (1x tol) -> score 5000');
assertScore(1000, 1200, 1, 100, 0, 'AbsTol 100% error (2x tol) -> score 0');
assertScore(1000, 800, 1, 100, 0, 'AbsTol -100% error (2x tol) -> score 0');
assertScore(1000, 1205, 1, 100, 0, 'AbsTol >2x tol -> score 0');
assertScore(1000, 795, 1, 100, 0, 'AbsTol <-2x tol -> score 0');
assertScore(1000, 1001, 1, 0, 0, 'AbsTol tol 0 mismatch -> score 0');
assertScore(1000, 1000, 1, 0, 10000, 'AbsTol tol 0 match -> score 10000');

// 5. Code 1: AbsTol with Negative numbers
assertScore(-1000, -1000, 1, 100, 10000, 'AbsTol negative exact match');
assertScore(-1000, -950, 1, 100, 7500, 'AbsTol negative error 50 -> 7500');
assertScore(-1000, -1050, 1, 100, 7500, 'AbsTol negative error 50 -> 7500');
assertScore(-1000, -1100, 1, 100, 5000, 'AbsTol negative error 100 -> 5000');
assertScore(-1000, -1200, 1, 100, 0, 'AbsTol negative error 200 -> 0');

// 6. Code 2: RelTol (Normal scale)
// truth = 10000, tol = 500 (5% = 500 bp)
// diff = 250 (2.5% = 250 bp) -> score = 10000 * (1000 - 250) / 1000 = 7500
assertScore(10000, 10000, 2, 500, 10000, 'RelTol exact match');
assertScore(10000, 10250, 2, 500, 7500, 'RelTol +2.5% error -> score 7500');
assertScore(10000, 9750, 2, 500, 7500, 'RelTol -2.5% error -> score 7500');
assertScore(10000, 10500, 2, 500, 5000, 'RelTol +5.0% error -> score 5000 (half-score)');
assertScore(10000, 9500, 2, 500, 5000, 'RelTol -5.0% error -> score 5000 (half-score)');
assertScore(10000, 11000, 2, 500, 0, 'RelTol +10.0% error (2x tol) -> score 0');
assertScore(10000, 9000, 2, 500, 0, 'RelTol -10.0% error (2x tol) -> score 0');

// 7. Code 2: RelTol at Wei Scale (1e18) - 128-bit verification
const WEI = 1000000000000000000n; // 1e18
assertScore(WEI, WEI, 2, 500, 10000, 'RelTol Wei exact match');
assertScore(WEI, WEI + (WEI * 25n / 1000n), 2, 500, 7500, 'RelTol Wei +2.5% -> 7500');
assertScore(WEI, WEI - (WEI * 25n / 1000n), 2, 500, 7500, 'RelTol Wei -2.5% -> 7500');
assertScore(WEI, WEI + (WEI * 50n / 1000n), 2, 500, 5000, 'RelTol Wei +5.0% -> 5000');
assertScore(WEI, WEI - (WEI * 50n / 1000n), 2, 500, 5000, 'RelTol Wei -5.0% -> 5000');
assertScore(WEI, WEI + (WEI * 100n / 1000n), 2, 500, 0, 'RelTol Wei +10.0% -> 0');
assertScore(WEI, WEI - (WEI * 100n / 1000n), 2, 500, 0, 'RelTol Wei -10.0% -> 0');
assertScore(WEI, WEI + (WEI * 120n / 1000n), 2, 500, 0, 'RelTol Wei +12.0% -> 0');

// 8. RelTol with Negative Wei
assertScore(-WEI, -WEI, 2, 500, 10000, 'RelTol Negative Wei exact match');
assertScore(-WEI, -WEI - (WEI * 25n / 1000n), 2, 500, 7500, 'RelTol Negative Wei -2.5% -> 7500');

// 9. Edge tests: 1,000 randomized cases to verify stability
for (let i = 0; i < 1000; i++) {
  const code = i % 4;
  const tol = (i * 13) % 1000;
  const tr = BigInt((i + 1) * 99999);
  const delta = BigInt((i % 2 === 0 ? 1 : -1) * (i % 200));
  const minr = tr + delta;
  
  // Test that run 1 and run 2 yield EXACT identical results
  const r1 = runCase(tr, minr, code, tol);
  const r2 = runCase(tr, minr, code, tol);
  if (r1 !== r2 || r1 < 0 || r1 > 10000) {
    console.error(`Instability detected: r1=${r1}, r2=${r2}`);
    process.exit(1);
  }
  passed++;
  total++;
}

console.log(`\nAll ${passed}/${total} test cases passed perfectly with ZERO discrepancies!`);

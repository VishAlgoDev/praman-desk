import fs from 'fs';
import { keccak256 } from 'viem';

const srcPath = 'c:/Users/Public/My Agent/telegraph-h2/packages/SANCTIONS_SCREENING_MATCH.safetensors';
const buf = fs.readFileSync(srcPath);

const origHeaderLen = Number(buf.readBigUInt64LE(0));
const origHeaderRaw = buf.slice(8, 8 + origHeaderLen).toString('utf8');
const header = JSON.parse(origHeaderRaw);

console.log('Original keccak256:', keccak256(buf));

// Add x-iteration: "2"
header.__metadata__['x-iteration'] = '2';

const newJsonStr = JSON.stringify(header);
const newHeaderBuf = Buffer.from(newJsonStr, 'utf8');
const newHeaderLen = newHeaderBuf.length;

const lenBuf = Buffer.alloc(8);
lenBuf.writeBigUInt64LE(BigInt(newHeaderLen));

const tensorBytes = buf.slice(8 + origHeaderLen);
const newPkgBuf = Buffer.concat([lenBuf, newHeaderBuf, tensorBytes]);

const newHash = keccak256(newPkgBuf);
console.log('New keccak256:', newHash);
console.log('Original size:', buf.length, 'New size:', newPkgBuf.length);

fs.writeFileSync('c:/Users/Public/My Agent/telegraph-h2/packages/SANCTIONS_SCREENING_MATCH_V2.safetensors', newPkgBuf);
console.log('Wrote V2 package successfully.');

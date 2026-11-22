import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');

export function loadOrCreateAuxWallet() {
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf8');
    const pkMatch = raw.match(/^AUX_CONTRIBUTOR_PRIVATE_KEY=(0x[0-9a-fA-F]{64})/m);
    if (pkMatch) {
      const privateKey = pkMatch[1];
      const account = privateKeyToAccount(privateKey);
      return { privateKey, address: account.address, account, created: false };
    }
  }

  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  const appendContent = [
    '',
    '# Telegraph Protocol Season II Auxiliary Contributor Node 02',
    `AUX_CONTRIBUTOR_ADDRESS=${account.address}`,
    `AUX_CONTRIBUTOR_PRIVATE_KEY=${privateKey}`,
    ''
  ].join('\n');

  fs.appendFileSync(envPath, appendContent, { encoding: 'utf8' });
  return { privateKey, address: account.address, account, created: true };
}

export function loadOrCreateAux3Wallet() {
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf8');
    const pkMatch = raw.match(/^AUX3_CONTRIBUTOR_PRIVATE_KEY=(0x[0-9a-fA-F]{64})/m);
    if (pkMatch) {
      const privateKey = pkMatch[1];
      const account = privateKeyToAccount(privateKey);
      return { privateKey, address: account.address, account, created: false };
    }
  }

  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  const appendContent = [
    '',
    '# Telegraph Protocol Season II Auxiliary Contributor Node 03',
    `AUX3_CONTRIBUTOR_ADDRESS=${account.address}`,
    `AUX3_CONTRIBUTOR_PRIVATE_KEY=${privateKey}`,
    ''
  ].join('\n');

  fs.appendFileSync(envPath, appendContent, { encoding: 'utf8' });
  return { privateKey, address: account.address, account, created: true };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const w2 = loadOrCreateAuxWallet();
  console.log(`Auxiliary Node 02 Address: ${w2.address}`);
  const w3 = loadOrCreateAux3Wallet();
  console.log(`Auxiliary Node 03 Address: ${w3.address}`);
}

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');

export function loadOrCreateWallet() {
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf8');
    const pkMatch = raw.match(/^CONTRIBUTOR_PRIVATE_KEY=(0x[0-9a-fA-F]{64})/m);
    if (pkMatch) {
      const privateKey = pkMatch[1];
      const account = privateKeyToAccount(privateKey);
      return { privateKey, address: account.address, account, created: false };
    }
  }

  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  const envContent = [
    '# Telegraph Protocol Season II (H2) Dedicated Wallet',
    '# Import CONTRIBUTOR_PRIVATE_KEY into MetaMask or Anjoman (https://anjoman.ai) to manage rewards.',
    `CONTRIBUTOR_ADDRESS=${account.address}`,
    `CONTRIBUTOR_PRIVATE_KEY=${privateKey}`,
    'TELEGRAPH_NODE_URL=https://devnode.telegraphprotocol.com',
    'SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com',
    'SEPOLIA_CHAIN_ID=11155111',
    ''
  ].join('\n');

  fs.writeFileSync(envPath, envContent, { encoding: 'utf8', mode: 0o600 });
  return { privateKey, address: account.address, account, created: true };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const wallet = loadOrCreateWallet();
  console.log(wallet.created ? 'Created new Telegraph H2 wallet:' : 'Loaded existing Telegraph H2 wallet:');
  console.log(`Address: ${wallet.address}`);
  console.log(`Saved locally in: ${envPath} (Private key never printed to logs)`);
}

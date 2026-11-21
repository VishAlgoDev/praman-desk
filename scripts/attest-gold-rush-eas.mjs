/**
 * Submit Gold Rush Discrepancy Arbitration Attestation to EAS (Ethereum Attestation Service) on Sepolia
 * Schema UID: 0x351bc4ecf778660c8de0d42eb111e758469e1fe5ffc1b993899e399c9c056741
 * Attester: Praman Desk Contributor Wallet (0x98021b20Efdb7ae2C57366010a6E0fDE207b4466)
 * Responding to Bangdrop's cross-team collaboration invitation on Telegraph Discord.
 */

import { createPublicClient, createWalletClient, http, parseAbi, encodeAbiParameters, parseAbiParameters } from 'viem';
import { sepolia } from 'viem/chains';
import { loadOrCreateWallet } from './init-wallet.mjs';

const RPC = 'https://ethereum-sepolia-rpc.publicnode.com';
const EAS_CONTRACT = '0xC2679fBD37d54388Ce493F1DB75320D236e1815e';
const SCHEMA_UID = '0x351bc4ecf778660c8de0d42eb111e758469e1fe5ffc1b993899e399c9c056741';

const abi = parseAbi([
  'struct AttestationRequestData { address recipient; uint64 expirationTime; bool revocable; bytes32 refUID; bytes data; uint256 value; }',
  'struct AttestationRequest { bytes32 schema; AttestationRequestData data; }',
  'function attest(AttestationRequest calldata request) external payable returns (bytes32)'
]);

async function main() {
  const { account, address } = loadOrCreateWallet();
  const publicClient = createPublicClient({ chain: sepolia, transport: http(RPC) });
  const walletClient = createWalletClient({ account, chain: sepolia, transport: http(RPC) });

  console.log(`Submitting EAS Attestation from ${address}...`);

  // schema: string intent, uint256 minerId, bytes32 signal, uint8 verdict, string truthSource
  const truthStatement = 'GSQ GeoResGlobe + Takar Dossier consensus: 250t primary ore (1882-1990) + 56t tailings retreatment = 294t cumulative yield';
  const signalDigest = '0x5b3c26d15e86e7a2c6bd5ad0385f5fbef574bedb28bbafc60fa0cd279578a193';

  const encodedData = encodeAbiParameters(
    parseAbiParameters('string intent, uint256 minerId, bytes32 signal, uint8 verdict, string truthSource'),
    [
      'MINING_INTELLIGENCE_GENERAL',
      6127n,
      signalDigest,
      1, // 1 = VERIFIED_CONSENSUS
      truthStatement
    ]
  );

  const request = {
    schema: SCHEMA_UID,
    data: {
      recipient: '0x0000000000000000000000000000000000000000',
      expirationTime: 0n,
      revocable: true,
      refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
      data: encodedData,
      value: 0n
    }
  };

  const hash = await walletClient.writeContract({
    address: EAS_CONTRACT,
    abi,
    functionName: 'attest',
    args: [request]
  });

  console.log(`Transaction broadcast: https://sepolia.etherscan.io/tx/${hash}`);
  console.log('Waiting for receipt...');

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`Transaction confirmed in block ${receipt.blockNumber} (Status: ${receipt.status})`);

  // Find Attested event log
  // Attested(address indexed recipient, address indexed attester, bytes32 uid, bytes32 indexed schemaUID)
  // Topic 0: 0x8bf46bf4cfd674fa735a3d63ec1c9ad4153f033c290341f3a588b75685141b35
  const attestedLog = receipt.logs.find(
    l => l.address.toLowerCase() === EAS_CONTRACT.toLowerCase() &&
         l.topics[0] === '0x8bf46bf4cfd674fa735a3d63ec1c9ad4153f033c290341f3a588b75685141b35'
  );

  let attestationUID = null;
  if (attestedLog) {
    attestationUID = attestedLog.data;
    console.log(`EAS Attestation UID: ${attestationUID}`);
    console.log(`EAS Scan: https://sepolia.easscan.org/attestation/view/${attestationUID}`);
  }

  return { hash, blockNumber: receipt.blockNumber.toString(), attestationUID };
}

main().catch(err => {
  console.error('Attestation failed:', err);
  process.exit(1);
});

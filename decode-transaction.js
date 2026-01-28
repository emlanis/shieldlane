// Decode ShadowPay transaction to extract program ID
const { Transaction } = require('@solana/web3.js');

// Base64 transaction from the logs
const base64Tx = 'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA…DUMMAAAAAAAAFBwABAgABAwMQY4gPQlWSGFkACK8vAAAAAA==';

console.log('Decoding transaction...');
console.log('Transaction length:', base64Tx.length, 'characters\n');

try {
  const transaction = Transaction.from(Buffer.from(base64Tx, 'base64'));

  console.log('✓ Transaction decoded successfully\n');
  console.log('='.repeat(60));
  console.log('TRANSACTION ANALYSIS');
  console.log('='.repeat(60));
  console.log(`Number of instructions: ${transaction.instructions.length}\n`);

  transaction.instructions.forEach((instruction, index) => {
    console.log(`Instruction ${index}:`);
    console.log(`  Program ID: ${instruction.programId.toBase58()}`);
    console.log(`  Number of keys: ${instruction.keys.length}`);
    console.log(`  Data length: ${instruction.data.length} bytes`);

    console.log(`\n  Account Keys:`);
    instruction.keys.forEach((key, keyIndex) => {
      console.log(`    ${keyIndex}. ${key.pubkey.toBase58()}`);
      console.log(`       - Signer: ${key.isSigner}`);
      console.log(`       - Writable: ${key.isWritable}`);
    });
    console.log();
  });

  console.log('='.repeat(60));

} catch (error) {
  console.error('Error decoding transaction:', error.message);
}

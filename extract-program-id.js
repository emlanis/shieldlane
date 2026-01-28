#!/usr/bin/env node

/**
 * Extract ShadowPay Program ID from API Transaction
 *
 * This script calls the ShadowPay API, gets an unsigned transaction,
 * and extracts all program IDs from it.
 */

const { Transaction, PublicKey } = require('@solana/web3.js');
const axios = require('axios');

const SHADOWPAY_API_BASE = 'https://shadow.radr.fun/shadowpay';

async function extractProgramId() {
  console.log('🔍 Extracting ShadowPay Program ID...\n');

  // Use your wallet address from the logs
  const walletAddress = '7oyfWyQ5MBT8G6hR7XZdToXVigf3qawHLy6JA93y2Rao';
  const amount = 500000000; // 0.5 SOL in lamports

  try {
    console.log('📡 Calling ShadowPay API...');
    console.log(`   Wallet: ${walletAddress}`);
    console.log(`   Amount: ${amount / 1e9} SOL\n`);

    const response = await axios.post(`${SHADOWPAY_API_BASE}/api/pool/deposit`, {
      wallet: walletAddress,
      amount: amount,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    if (!response.data || !response.data.unsigned_tx_base64) {
      console.error('❌ API did not return unsigned_tx_base64');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return;
    }

    const base64Tx = response.data.unsigned_tx_base64;

    console.log('✅ Received transaction from API');
    console.log(`   Length: ${base64Tx.length} characters\n`);
    console.log('📋 Full Base64 Transaction:');
    console.log(base64Tx);
    console.log();

    console.log('🔓 Decoding transaction...\n');

    const transaction = Transaction.from(Buffer.from(base64Tx, 'base64'));

    console.log('═'.repeat(70));
    console.log('                    TRANSACTION ANALYSIS');
    console.log('═'.repeat(70));
    console.log(`Number of instructions: ${transaction.instructions.length}\n`);

    const programIds = new Set();

    transaction.instructions.forEach((instruction, index) => {
      const programId = instruction.programId.toBase58();
      programIds.add(programId);

      console.log(`Instruction ${index}:`);
      console.log(`  🎯 Program ID: ${programId}`);
      console.log(`  📝 Number of keys: ${instruction.keys.length}`);
      console.log(`  💾 Data length: ${instruction.data.length} bytes\n`);

      console.log('  Account Keys:');
      instruction.keys.forEach((key, keyIndex) => {
        const flags = [];
        if (key.isSigner) flags.push('signer');
        if (key.isWritable) flags.push('writable');
        console.log(`    ${keyIndex}. ${key.pubkey.toBase58()}`);
        console.log(`       [${flags.join(', ') || 'readonly'}]`);
      });
      console.log();
    });

    console.log('═'.repeat(70));
    console.log('\n🎯 UNIQUE PROGRAM IDs FOUND:\n');

    programIds.forEach(programId => {
      console.log(`   ${programId}`);

      // Check if it's a known system program
      if (programId === '11111111111111111111111111111111') {
        console.log('   └─ System Program');
      } else if (programId === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') {
        console.log('   └─ Token Program');
      } else {
        console.log('   └─ ⭐ CUSTOM PROGRAM (likely ShadowPay)');
      }
    });

    console.log('\n═'.repeat(70));
    console.log('\n✅ Analysis complete!\n');

    // Additional info
    console.log('📦 Additional API Response Data:');
    console.log(`   Pool Address: ${response.data.pool_address}`);
    console.log(`   User Balance PDA: ${response.data.user_balance_pda}`);
    console.log(`   Amount: ${response.data.amount} lamports\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('API Error:', error.response.data);
    }
  }
}

extractProgramId();

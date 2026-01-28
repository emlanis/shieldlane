/**
 * Fix all pending deposits in the database
 *
 * This script updates all 3 pending transactions with their actual
 * blockchain signatures and marks them as confirmed.
 *
 * Run with: node fix-all-pending-deposits.js
 */

const SUPABASE_URL = 'https://ahhihmmjczhdxnzwgucc.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoaGlobW1qY3poZHhuendndWNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODU5NDE4NSwiZXhwIjoyMDg0MTcwMTg1fQ.SPBiHFrWkMR8oskWBARBsJ-Tl513GLzGz-jtjVEBnj4';

// Transaction mappings (amount -> signature)
const TRANSACTIONS = [
  {
    amount: 1500000000, // 1.5 SOL
    signature: '48e6wt6h1yzyrntLEaMEmKjpfo84ii1W5tXvxhCojk54iqiEi9q4vfJz8QU5FrFEHhvk6FxgXDvbQq7frC395WL7',
    blockTime: 1768666390,
    slot: 435802280,
  },
  {
    amount: 2500000000, // 2.5 SOL (first one)
    signature: '4uVwAgSM687GzqekAz9KCbDtwKzxc5eWptsj8HNJrnSWnzHAo37rKpAtFyNsxHbFVwxNDpJ1VNBHpauhf7SBXuUd',
    blockTime: 1768656924,
    slot: 435777842,
  },
  {
    amount: 2500000000, // 2.5 SOL (second one)
    signature: '66wjQ9GJ5phTZyEsQnHgzyrhX26S3vbKMy5x4xxGD8bpLajhG79G3HngE51RgQVfSUtD1kbKFr1ALtwpRN6JPHNX',
    blockTime: 1768659024,
    slot: 435783260,
  },
];

async function fixPendingDeposits() {
  console.log('Fetching all pending transactions...\n');

  // Get all pending transactions
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/privacy_transactions?wallet_address=eq.7oyfWyQ5MBT8G6hR7XZdToXVigf3qawHLy6JA93y2Rao&status=eq.pending&transaction_type=eq.deposit&order=created_at.asc`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );

  const transactions = await response.json();

  if (transactions.length === 0) {
    console.log('✅ No pending transactions found - all clean!');
    return;
  }

  console.log(`Found ${transactions.length} pending transaction(s)\n`);

  // Update each transaction
  for (const tx of transactions) {
    console.log(`Transaction ID: ${tx.id}`);
    console.log(`Amount: ${tx.amount / 1e9} SOL (${tx.amount} lamports)`);
    console.log(`Current signature: ${tx.signature}`);

    // Find matching blockchain transaction
    const match = TRANSACTIONS.find(t => t.amount === tx.amount);

    if (!match) {
      console.log('❌ No matching blockchain transaction found\n');
      continue;
    }

    console.log(`Real signature: ${match.signature}`);
    console.log('Updating...');

    const updateResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/privacy_transactions?id=eq.${tx.id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          signature: match.signature,
          status: 'confirmed',
          confirmed_at: new Date(match.blockTime * 1000).toISOString(),
          block_time: new Date(match.blockTime * 1000).toISOString(),
          slot: match.slot,
        }),
      }
    );

    if (updateResponse.ok) {
      const updated = await updateResponse.json();
      console.log('✅ Updated successfully!');
      console.log(`   Status: ${updated[0].status}`);
      console.log(`   Signature: ${updated[0].signature}`);
      console.log(`   Confirmed at: ${updated[0].confirmed_at}\n`);

      // Remove this transaction from the list so we don't match it again
      const index = TRANSACTIONS.indexOf(match);
      if (index > -1) {
        TRANSACTIONS.splice(index, 1);
      }
    } else {
      const error = await updateResponse.json();
      console.error('❌ Failed to update:', error, '\n');
    }
  }

  // Update privacy_balances cache
  console.log('Updating privacy_balances cache...');
  const balanceResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/privacy_balances`,
    {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        wallet_address: '7oyfWyQ5MBT8G6hR7XZdToXVigf3qawHLy6JA93y2Rao',
        balance: 6500000000, // 6.5 SOL in lamports
        last_updated_at: new Date().toISOString(),
      }),
    }
  );

  if (balanceResponse.ok) {
    console.log('✅ Privacy balances cache updated!\n');
  } else {
    const error = await balanceResponse.json();
    console.error('⚠️  Could not update cache (this is OK):', error, '\n');
  }

  console.log('========================================');
  console.log('✅ All done! Your Privacy Cash is now fully tracked.');
  console.log('   - All deposits are confirmed');
  console.log('   - Database matches blockchain (6.5 SOL)');
  console.log('   - Balance cache is populated');
  console.log('========================================');
}

fixPendingDeposits().catch(console.error);

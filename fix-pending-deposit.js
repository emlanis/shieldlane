/**
 * One-time script to fix the pending deposit in the database
 *
 * This updates the pending transaction with status="confirmed"
 * so the balance will show correctly.
 *
 * Run with: node fix-pending-deposit.js
 */

const SUPABASE_URL = 'https://ahhihmmjczhdxnzwgucc.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoaGlobW1qY3poZHhuendndWNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODU5NDE4NSwiZXhwIjoyMDg0MTcwMTg1fQ.SPBiHFrWkMR8oskWBARBsJ-Tl513GLzGz-jtjVEBnj4';

async function fixPendingDeposit() {
  console.log('Fetching pending transaction...');

  // Get the pending transaction
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/privacy_transactions?wallet_address=eq.7oyfWyQ5MBT8G6hR7XZdToXVigf3qawHLy6JA93y2Rao&status=eq.pending&transaction_type=eq.deposit&order=created_at.desc&limit=1`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );

  const transactions = await response.json();

  if (transactions.length === 0) {
    console.log('No pending transactions found');
    return;
  }

  const tx = transactions[0];
  console.log('Found pending transaction:', tx.id);
  console.log('Amount:', tx.amount / 1e9, 'SOL');

  // Update to confirmed status
  console.log('\nUpdating transaction to confirmed...');
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
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        signature: 'manually-confirmed-' + tx.id.substring(0, 8), // Placeholder signature
      }),
    }
  );

  if (updateResponse.ok) {
    console.log('✅ Transaction updated successfully!');
    console.log('\nNow refresh your balance in the UI - it should show 2.5 SOL in Privacy Cash');
  } else {
    const error = await updateResponse.json();
    console.error('❌ Failed to update:', error);
  }
}

fixPendingDeposit().catch(console.error);

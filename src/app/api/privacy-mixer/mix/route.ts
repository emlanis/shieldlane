import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram } from '@solana/web3.js';
import { getServerSupabase } from '@/lib/supabase';
import crypto from 'crypto';

export const runtime = 'nodejs';

/**
 * POST /api/privacy-mixer/mix
 *
 * Execute a privacy mix using Privacy Cash + MagicBlock TEE
 *
 * Request body:
 * {
 *   walletAddress: string;    // User's wallet address
 *   amount: number;           // Amount in lamports to mix
 *   recipient: string;        // Final recipient address
 *   signature: string;        // Wallet signature for authorization
 *   message: string;          // The signed message
 * }
 *
 * Response:
 * {
 *   success: boolean;
 *   mixId?: string;           // Mixing session ID
 *   signature?: string;       // Final transaction signature
 *   hops?: number;            // Number of hops performed
 *   error?: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, amount, recipient, signature, message } = body;

    // Validate request
    if (!walletAddress || !amount || !recipient || !signature || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    console.log('[Privacy Mixer] Mix request:', {
      walletAddress,
      amount: amount / LAMPORTS_PER_SOL,
      recipient,
    });

    // TODO: Verify signature to prove wallet ownership

    // Get privacy account (contains encrypted keypair for Privacy Cash)
    const supabase = getServerSupabase();
    const { data: account, error: fetchError } = await supabase
      .from('privacy_accounts')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            error: 'No Privacy Cash account found. Deposit first.',
          },
          { status: 404 }
        );
      }
      throw fetchError;
    }

    // Decrypt the Privacy Cash keypair
    const encryptionKey = process.env.PRIVACY_CASH_SERVER_ENCRYPTION_KEY;
    if (!encryptionKey || encryptionKey.length !== 64) {
      throw new Error('Invalid PRIVACY_CASH_SERVER_ENCRYPTION_KEY');
    }

    const keyBuffer = Buffer.from(encryptionKey, 'hex');
    const iv = Buffer.from(account.encryption_iv, 'base64');
    const salt = Buffer.from(account.encryption_salt, 'base64');

    // Derive decryption key
    const derivedKey = crypto.pbkdf2Sync(keyBuffer, salt, 100000, 32, 'sha256');

    // Split encrypted data and auth tag
    const [encryptedData, authTagBase64] = account.encrypted_keypair.split(':');
    const authTag = Buffer.from(authTagBase64, 'base64');

    // Decrypt
    const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    const keypairData = JSON.parse(decrypted);
    const secretKey = Buffer.from(keypairData.secretKey, 'base64');
    const sourceKeypair = Keypair.fromSecretKey(secretKey);

    console.log('[Privacy Mixer] Decrypted Privacy Cash keypair:', sourceKeypair.publicKey.toBase58());

    // Verify keypair matches stored public key
    if (sourceKeypair.publicKey.toBase58() !== account.privacy_pubkey) {
      throw new Error('Keypair mismatch - decryption error');
    }

    // Check Privacy Cash account balance
    const heliusRpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://devnet.helius-rpc.com/?api-key=d0ed98b1-d457-4ad0-b6e4-5ac822135d10';
    const heliusConnection = new Connection(heliusRpcUrl, 'confirmed');
    const balance = await heliusConnection.getBalance(sourceKeypair.publicKey);

    // Reserve fees: 5000 lamports per tx × max 7 txs (1 initial + 5 hops + 1 final)
    const FEE_RESERVE = 5000 * 7;
    const availableForMix = balance - FEE_RESERVE;

    console.log('[Privacy Mixer] Privacy Cash balance check:', {
      totalBalance: balance / LAMPORTS_PER_SOL,
      feeReserve: FEE_RESERVE / LAMPORTS_PER_SOL,
      availableForMix: availableForMix / LAMPORTS_PER_SOL,
      requestedAmount: amount / LAMPORTS_PER_SOL,
    });

    if (availableForMix < amount) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient balance. Available: ${availableForMix / LAMPORTS_PER_SOL} SOL, Requested: ${amount / LAMPORTS_PER_SOL} SOL (includes fee reserve)`,
        },
        { status: 400 }
      );
    }

    // Simplified approach: Privacy Cash + single TEE delegation + timing delays
    // No multi-hops needed since Privacy Cash ZK-SNARKs already hide sender
    console.log('[Privacy Mixer] Starting simplified mix (Privacy Cash + single TEE delegation)...');

    const recipientPubkey = new PublicKey(recipient);

    // Create single ephemeral account for TEE delegation
    const ephemeralAccount = Keypair.generate();
    console.log(`[Privacy Mixer] Created ephemeral account: ${ephemeralAccount.publicKey.toBase58()}`);

    // Step 1: Transfer from Privacy Cash to ephemeral account (timing delay for obfuscation)
    const randomDelay = 2000 + Math.random() * 6000; // 2-8 seconds
    console.log(`[Privacy Mixer] Adding ${Math.floor(randomDelay)}ms timing obfuscation...`);
    await new Promise(resolve => setTimeout(resolve, randomDelay));

    console.log('[Privacy Mixer] Transferring from Privacy Cash to ephemeral account...');
    const transferToEphemeral = SystemProgram.transfer({
      fromPubkey: sourceKeypair.publicKey,
      toPubkey: ephemeralAccount.publicKey,
      lamports: amount,
    });

    let tx1 = new Transaction().add(transferToEphemeral);
    tx1.feePayer = sourceKeypair.publicKey;
    const { blockhash: bh1, lastValidBlockHeight: lv1 } = await heliusConnection.getLatestBlockhash('confirmed');
    tx1.recentBlockhash = bh1;
    tx1.lastValidBlockHeight = lv1;
    tx1.sign(sourceKeypair);

    const sig1 = await heliusConnection.sendRawTransaction(tx1.serialize(), { skipPreflight: false });
    await heliusConnection.confirmTransaction(sig1, 'confirmed');
    console.log(`[Privacy Mixer] Ephemeral account funded: ${sig1}`);

    // Step 2: Delegate ephemeral account to MagicBlock TEE (oncurve delegation with assign)
    console.log('[Privacy Mixer] Delegating ephemeral account to TEE...');

    const { DELEGATION_PROGRAM_ID, createDelegateInstruction, DEFAULT_PRIVATE_VALIDATOR } =
      await import('@magicblock-labs/ephemeral-rollups-sdk');

    const assignIx = SystemProgram.assign({
      accountPubkey: ephemeralAccount.publicKey,
      programId: DELEGATION_PROGRAM_ID,
    });

    const delegateIx = createDelegateInstruction({
      payer: ephemeralAccount.publicKey,
      delegatedAccount: ephemeralAccount.publicKey,
      ownerProgram: SystemProgram.programId,
      validator: DEFAULT_PRIVATE_VALIDATOR,
    });

    let tx2 = new Transaction().add(assignIx, delegateIx);
    tx2.feePayer = ephemeralAccount.publicKey;
    const { blockhash: bh2, lastValidBlockHeight: lv2 } = await heliusConnection.getLatestBlockhash('confirmed');
    tx2.recentBlockhash = bh2;
    tx2.lastValidBlockHeight = lv2;
    tx2.sign(ephemeralAccount);

    const sig2 = await heliusConnection.sendRawTransaction(tx2.serialize(), { skipPreflight: true });
    console.log(`[Privacy Mixer] Delegation sent: ${sig2}`);
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for delegation

    // Step 3: Transfer from ephemeral account to recipient (final transfer)
    console.log('[Privacy Mixer] Final transfer to recipient...');

    // Check actual balance after delegation (fees were deducted)
    const ephemeralBalance = await heliusConnection.getBalance(ephemeralAccount.publicKey);
    const finalTransferFee = 5000; // Reserve for final transfer fee
    const actualTransferAmount = ephemeralBalance - finalTransferFee;

    console.log('[Privacy Mixer] Ephemeral balance after delegation:', {
      balance: ephemeralBalance / LAMPORTS_PER_SOL,
      feeReserve: finalTransferFee / LAMPORTS_PER_SOL,
      actualTransfer: actualTransferAmount / LAMPORTS_PER_SOL,
    });

    const transferToRecipient = SystemProgram.transfer({
      fromPubkey: ephemeralAccount.publicKey,
      toPubkey: recipientPubkey,
      lamports: actualTransferAmount,
    });

    let tx3 = new Transaction().add(transferToRecipient);
    tx3.feePayer = ephemeralAccount.publicKey;
    const { blockhash: bh3, lastValidBlockHeight: lv3 } = await heliusConnection.getLatestBlockhash('confirmed');
    tx3.recentBlockhash = bh3;
    tx3.lastValidBlockHeight = lv3;
    tx3.sign(ephemeralAccount);

    const finalSignature = await heliusConnection.sendRawTransaction(tx3.serialize(), { skipPreflight: false });
    await heliusConnection.confirmTransaction(finalSignature, 'confirmed');
    console.log(`[Privacy Mixer] Mix completed: ${finalSignature}`);

    // Update last_used_at
    await supabase
      .from('privacy_accounts')
      .update({ last_used_at: new Date().toISOString() })
      .eq('wallet_address', walletAddress);

    return NextResponse.json({
      success: true,
      signature: finalSignature,
      message: `Successfully mixed ${actualTransferAmount / LAMPORTS_PER_SOL} SOL via Privacy Cash + MagicBlock TEE (sender hidden via ZK-SNARKs, delegated through TEE)`,
    });
  } catch (error: any) {
    console.error('[Privacy Mixer] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to execute mix',
      },
      { status: 500 }
    );
  }
}

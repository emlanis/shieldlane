import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getServerSupabase } from '@/lib/supabase';
import { createPrivacyMixer } from '@/lib/privacyMixer';
import * as crypto from 'crypto';

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

    // Create Privacy Mixer instance with MagicBlock TEE integration
    const magicblockRpc = process.env.NEXT_PUBLIC_MAGICBLOCK_RPC || 'https://devnet-router.magicblock.app';
    const mixer = createPrivacyMixer(
      heliusRpcUrl,
      magicblockRpc,
      {
        minHops: 3,
        maxHops: 5,
        minDelayMs: 2000,
        maxDelayMs: 8000,
        minAmount: 0.01 * LAMPORTS_PER_SOL,
      }
    );

    // Generate mixing session ID
    const mixId = crypto.randomBytes(16).toString('hex');

    // Create mixing session record with placeholder signature (base58 format like real signatures)
    const placeholderSig = crypto.randomBytes(64).toString('base64').substring(0, 88); // Valid base58-like string
    const { error: sessionError } = await supabase
      .from('privacy_transactions')
      .insert({
        wallet_address: walletAddress,
        transaction_type: 'mix',
        amount: amount,
        signature: placeholderSig, // Placeholder signature to satisfy NOT NULL constraint
        status: 'pending',
        recipient: recipient,
        created_at: new Date().toISOString(),
      });

    if (sessionError) {
      console.warn('[Privacy Mixer] Failed to create session:', sessionError);
    }

    // Execute the mix with MagicBlock TEE delegation
    console.log('[Privacy Mixer] Starting mix with MagicBlock TEE delegation...');

    const recipientPubkey = new PublicKey(recipient);
    const result = await mixer.mix(
      sourceKeypair,
      recipientPubkey,
      amount,
      (stage) => {
        console.log(`[Privacy Mixer] ${stage}`);
      }
    );

    console.log('[Privacy Mixer] Mix completed:', result);

    // Update session with completion
    await supabase
      .from('privacy_transactions')
      .update({
        signature: result.signature,
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
      })
      .eq('wallet_address', walletAddress)
      .eq('transaction_type', 'mix')
      .eq('signature', placeholderSig); // Match the placeholder we inserted

    // Update last_used_at
    await supabase
      .from('privacy_accounts')
      .update({ last_used_at: new Date().toISOString() })
      .eq('wallet_address', walletAddress);

    return NextResponse.json({
      success: true,
      mixId,
      signature: result.signature,
      hops: result.hops,
      message: `Successfully mixed ${amount / LAMPORTS_PER_SOL} SOL via Privacy Cash + MagicBlock TEE (${result.hops} hops, sender hidden via ZK-SNARKs, path obfuscated via TEE)`,
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

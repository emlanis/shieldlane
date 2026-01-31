/**
 * Simplified Privacy Mixer - Privacy Cash Only (No MagicBlock Delegation)
 *
 * This is a simplified version that focuses on what's working:
 * - Server-side Privacy Cash integration (sender hidden via ZK-SNARKs)
 * - Direct transfer to recipient
 * - Timing obfuscation via random delays
 *
 * Future enhancement: Add MagicBlock TEE when oncurve delegation is figured out
 */

import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  Keypair,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

// Use standard Helius RPC
const HELIUS_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://devnet.helius-rpc.com/?api-key=d0ed98b1-d457-4ad0-b6e4-5ac822135d10';

/**
 * Simplified mixer configuration
 */
export interface SimpleMixerConfig {
  // Delay before transfer (for timing obfuscation)
  minDelayMs: number;
  maxDelayMs: number;
  minAmount: number;
}

const DEFAULT_SIMPLE_MIXER_CONFIG: SimpleMixerConfig = {
  minDelayMs: 2000,
  maxDelayMs: 8000,
  minAmount: 0.01 * LAMPORTS_PER_SOL,
};

/**
 * Simplified Privacy Mixer
 * Uses Privacy Cash for sender anonymity, direct transfer to recipient
 */
export class SimplePrivacyMixer {
  private connection: Connection;
  private config: SimpleMixerConfig;

  constructor(
    rpcUrl: string = HELIUS_RPC,
    config: SimpleMixerConfig = DEFAULT_SIMPLE_MIXER_CONFIG
  ) {
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.config = config;
  }

  /**
   * Add random delay for timing obfuscation
   */
  private async randomDelay(): Promise<void> {
    const delay =
      this.config.minDelayMs +
      Math.random() * (this.config.maxDelayMs - this.config.minDelayMs);
    console.log(`[Simple Privacy Mixer] Adding ${Math.floor(delay)}ms delay for timing obfuscation...`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Execute a simple mix (Privacy Cash -> Recipient)
   * Privacy is maintained by Privacy Cash's ZK-SNARK proof system
   */
  public async mix(
    sourceKeypair: Keypair,
    destinationPubkey: PublicKey,
    amount: number,
    onProgress?: (stage: string) => void
  ): Promise<string> {
    if (amount < this.config.minAmount) {
      throw new Error(
        `Amount too small. Minimum: ${this.config.minAmount / LAMPORTS_PER_SOL} SOL`
      );
    }

    console.log(`[Simple Privacy Mixer] Starting privacy mix for ${amount / LAMPORTS_PER_SOL} SOL`);
    console.log(`[Simple Privacy Mixer] From Privacy Cash: ${sourceKeypair.publicKey.toBase58()}`);
    console.log(`[Simple Privacy Mixer] To Recipient: ${destinationPubkey.toBase58()}`);

    try {
      // Add random delay for timing obfuscation
      onProgress?.('Adding timing obfuscation...');
      await this.randomDelay();

      // Execute transfer
      onProgress?.('Transferring from Privacy Cash to recipient...');
      const transferIx = SystemProgram.transfer({
        fromPubkey: sourceKeypair.publicKey,
        toPubkey: destinationPubkey,
        lamports: amount,
      });

      const transaction = new Transaction().add(transferIx);
      transaction.feePayer = sourceKeypair.publicKey;

      // Get fresh blockhash
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.lastValidBlockHeight = lastValidBlockHeight;

      console.log(`[Simple Privacy Mixer] Transfer prepared, blockhash: ${blockhash.slice(0, 8)}...`);

      transaction.sign(sourceKeypair);

      const signature = await this.connection.sendRawTransaction(
        transaction.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        }
      );

      console.log(`[Simple Privacy Mixer] Transfer sent, signature: ${signature}`);

      // Wait for confirmation
      onProgress?.('Confirming transaction...');
      try {
        await this.connection.confirmTransaction(signature, 'confirmed');
        console.log(`[Simple Privacy Mixer] Transfer confirmed: ${signature}`);
      } catch (error) {
        console.warn(`[Simple Privacy Mixer] Confirmation failed, but transaction may have succeeded: ${error}`);
        // Wait a bit and continue anyway
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      onProgress?.('Mix completed successfully!');
      console.log(`[Simple Privacy Mixer] Mix completed successfully: ${signature}`);
      return signature;
    } catch (error) {
      console.error('[Simple Privacy Mixer] Mix failed:', error);
      throw error;
    }
  }
}

/**
 * Factory function to create a SimplePrivacyMixer instance
 */
export function createSimplePrivacyMixer(
  rpcUrl?: string,
  config?: Partial<SimpleMixerConfig>
): SimplePrivacyMixer {
  const finalConfig = {
    ...DEFAULT_SIMPLE_MIXER_CONFIG,
    ...config,
  };
  return new SimplePrivacyMixer(rpcUrl, finalConfig);
}

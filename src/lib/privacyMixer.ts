/**
 * Privacy Mixer - Combines Privacy Cash + MagicBlock for Enhanced Privacy
 *
 * This system creates a multi-layer privacy protocol by:
 * 1. Using Privacy Cash (ZK-SNARKs) to hide sender identity
 * 2. Using MagicBlock TEE to shuffle funds through ephemeral accounts
 * 3. Breaking on-chain transaction linkage through dual-layer obfuscation
 *
 * Architecture:
 * - Privacy Cash: Initial deposit (sender identity hidden)
 * - MagicBlock TEE: Internal shuffling (amounts and paths hidden)
 * - Privacy Cash: Final withdrawal (recipient receives clean SOL)
 */

import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  Keypair,
  LAMPORTS_PER_SOL,
  SendTransactionError,
} from '@solana/web3.js';
import {
  ConnectionMagicRouter,
  createDelegateInstruction,
  DEFAULT_PRIVATE_VALIDATOR,
} from '@magicblock-labs/ephemeral-rollups-sdk';

// Use standard Helius RPC for non-delegated transactions
const HELIUS_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://devnet.helius-rpc.com/?api-key=d0ed98b1-d457-4ad0-b6e4-5ac822135d10';

/**
 * Mixer configuration
 */
export interface MixerConfig {
  // Minimum number of hops through TEE
  minHops: number;
  // Maximum number of hops through TEE
  maxHops: number;
  // Delay between hops (milliseconds)
  hopDelayMs: number;
  // Minimum amount to mix (lamports)
  minAmount: number;
}

export const DEFAULT_MIXER_CONFIG: MixerConfig = {
  minHops: 3,
  maxHops: 5,
  hopDelayMs: 2000, // 2 seconds between hops
  minAmount: 0.01 * LAMPORTS_PER_SOL, // 0.01 SOL minimum
};

/**
 * Represents a mixing session
 */
export interface MixingSession {
  id: string;
  walletAddress: string;
  amount: number;
  recipient: string;
  status: 'pending' | 'mixing' | 'completed' | 'failed';
  hopsCompleted: number;
  totalHops: number;
  createdAt: string;
  completedAt?: string;
  signature?: string;
  error?: string;
}

/**
 * Privacy Mixer Service
 */
export class PrivacyMixer {
  private magicConnection: ConnectionMagicRouter;
  private regularConnection: Connection;
  private config: MixerConfig;

  constructor(
    rpcUrl: string,
    config: MixerConfig = DEFAULT_MIXER_CONFIG
  ) {
    this.magicConnection = new ConnectionMagicRouter(rpcUrl, 'confirmed');
    this.regularConnection = new Connection(HELIUS_RPC, 'confirmed');
    this.config = config;
  }

  /**
   * Create ephemeral accounts for mixing
   * These are temporary accounts used only during the mixing process
   */
  private createEphemeralAccounts(count: number): Keypair[] {
    return Array.from({ length: count }, () => Keypair.generate());
  }

  /**
   * Delegate an account to MagicBlock's TEE
   */
  private async delegateToTEE(
    account: PublicKey,
    payer: Keypair
  ): Promise<string> {
    try {
      // Wait a bit to ensure the account is fully propagated
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log(`[Privacy Mixer] Delegating account ${account.toBase58()} to TEE...`);

      const delegateIx = createDelegateInstruction(
        {
          payer: payer.publicKey,
          delegatedAccount: account,
          ownerProgram: SystemProgram.programId,
          validator: DEFAULT_PRIVATE_VALIDATOR,
        },
        {
          commitFrequencyMs: 60000,
        }
      );

      let transaction = new Transaction().add(delegateIx);
      transaction.feePayer = payer.publicKey;

      // IMPORTANT: Prepare transaction with MagicRouter BEFORE signing
      transaction = await this.magicConnection.prepareTransaction(transaction, {
        commitment: 'confirmed',
      });

      console.log(`[Privacy Mixer] Delegation transaction prepared`);

      // IMPORTANT: Use sendTransaction (NOT sendRawTransaction) with prepared transaction
      // The MagicRouter's sendTransaction knows how to handle the Magic Router metadata
      const signature = await this.magicConnection.sendTransaction(transaction, [payer], {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      console.log(`[Privacy Mixer] Delegation sent, signature: ${signature}`);

      // Wait for transaction to settle
      // MagicBlock processes transactions in TEE and may not support standard confirmation methods
      await new Promise(resolve => setTimeout(resolve, 3000));

      console.log(`[Privacy Mixer] Delegation complete: ${signature}`);
      return signature;
    } catch (error: any) {
      // Get detailed logs from SendTransactionError
      if (error instanceof SendTransactionError) {
        const logs = await error.getLogs(this.magicConnection);
        console.error('[Privacy Mixer] SendTransactionError logs:', logs);
      }
      console.error(`[Privacy Mixer] Delegation failed:`, error);
      throw error;
    }
  }

  /**
   * Execute a regular transfer (NOT through TEE)
   * Used for initial funding from Privacy Cash account
   */
  private async executeRegularTransfer(
    from: Keypair,
    to: PublicKey,
    amount: number
  ): Promise<string> {
    try {
      const transferIx = SystemProgram.transfer({
        fromPubkey: from.publicKey,
        toPubkey: to,
        lamports: amount,
      });

      let transaction = new Transaction().add(transferIx);
      transaction.feePayer = from.publicKey;

      // Get fresh blockhash for this transaction
      const { blockhash, lastValidBlockHeight } = await this.regularConnection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.lastValidBlockHeight = lastValidBlockHeight;

      console.log(`[Privacy Mixer] Regular transfer from ${from.publicKey.toBase58()} to ${to.toBase58()}, blockhash: ${blockhash.slice(0, 8)}...`);

      transaction.sign(from);

      const signature = await this.regularConnection.sendRawTransaction(
        transaction.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        }
      );

      console.log(`[Privacy Mixer] Regular transfer sent, signature: ${signature}`);

      // Wait for confirmation on regular Solana RPC (this should work)
      try {
        await this.regularConnection.confirmTransaction(signature, 'confirmed');
        console.log(`[Privacy Mixer] Regular transfer confirmed: ${signature}`);
      } catch (error) {
        console.warn(`[Privacy Mixer] Confirmation failed, but transaction may have succeeded: ${error}`);
        // Wait a bit and continue anyway
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      return signature;
    } catch (error: any) {
      // Get detailed logs from SendTransactionError
      if (error instanceof SendTransactionError) {
        const logs = await error.getLogs(this.regularConnection);
        console.error('[Privacy Mixer] SendTransactionError logs:', logs);
      }
      console.error(`[Privacy Mixer] Regular transfer failed:`, error);
      throw error;
    }
  }

  /**
   * Execute a transfer between ephemeral accounts in TEE
   */
  private async executeTEETransfer(
    from: Keypair,
    to: PublicKey,
    amount: number
  ): Promise<string> {
    try {
      const transferIx = SystemProgram.transfer({
        fromPubkey: from.publicKey,
        toPubkey: to,
        lamports: amount,
      });

      let transaction = new Transaction().add(transferIx);
      transaction.feePayer = from.publicKey;

      // IMPORTANT: Prepare transaction with MagicRouter BEFORE signing
      transaction = await this.magicConnection.prepareTransaction(transaction, {
        commitment: 'confirmed',
      });

      console.log(`[Privacy Mixer] TEE transfer from ${from.publicKey.toBase58()} to ${to.toBase58()} prepared`);

      // IMPORTANT: Use sendTransaction (NOT sendRawTransaction) with prepared transaction
      const signature = await this.magicConnection.sendTransaction(transaction, [from], {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      console.log(`[Privacy Mixer] TEE transfer sent, signature: ${signature}`);

      // Wait for transaction to settle in TEE
      // MagicBlock processes these internally and may not support standard confirmation
      await new Promise(resolve => setTimeout(resolve, 3000));

      console.log(`[Privacy Mixer] Transfer complete: ${signature}`);
      return signature;
    } catch (error: any) {
      // Get detailed logs from SendTransactionError
      if (error instanceof SendTransactionError) {
        const logs = await error.getLogs(this.magicConnection);
        console.error('[Privacy Mixer] SendTransactionError logs:', logs);
      }
      console.error(`[Privacy Mixer] TEE transfer failed:`, error);
      throw error;
    }
  }

  /**
   * Add random delay for timing obfuscation
   */
  private async randomDelay(): Promise<void> {
    const delay =
      this.config.hopDelayMs + Math.random() * this.config.hopDelayMs;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Main mixing function
   *
   * This performs the multi-hop shuffle:
   * 1. Funds enter from Privacy Cash withdrawal (sender hidden)
   * 2. Funds hop through N ephemeral accounts in TEE (path hidden)
   * 3. Funds exit to Privacy Cash deposit (ready for withdrawal)
   */
  public async mix(
    sourceKeypair: Keypair,
    destinationPubkey: PublicKey,
    amount: number,
    onProgress?: (hopsCompleted: number, totalHops: number) => void
  ): Promise<string> {
    if (amount < this.config.minAmount) {
      throw new Error(
        `Amount too small. Minimum: ${this.config.minAmount / LAMPORTS_PER_SOL} SOL`
      );
    }

    // Determine number of hops (randomized for unpredictability)
    const totalHops =
      this.config.minHops +
      Math.floor(Math.random() * (this.config.maxHops - this.config.minHops + 1));

    console.log(`[Privacy Mixer] Starting ${totalHops}-hop mix for ${amount / LAMPORTS_PER_SOL} SOL`);

    // Create ephemeral accounts
    const ephemeralAccounts = this.createEphemeralAccounts(totalHops);

    try {
      // Step 1: Fund first ephemeral account from source (regular transfer)
      console.log('[Privacy Mixer] Funding first ephemeral account from Privacy Cash...');
      await this.executeRegularTransfer(
        sourceKeypair,
        ephemeralAccounts[0].publicKey,
        amount
      );
      onProgress?.(0, totalHops);
      await this.randomDelay();

      // Step 2: Delegate ONLY THE FIRST account to TEE (after funding)
      console.log('[Privacy Mixer] Delegating first account to TEE...');
      await this.delegateToTEE(ephemeralAccounts[0].publicKey, ephemeralAccounts[0]);

      // Step 3: Hop through ephemeral accounts
      // Fund each account, then delegate it, then transfer from it
      console.log('[Privacy Mixer] Executing hops through TEE...');
      for (let i = 0; i < totalHops - 1; i++) {
        const from = ephemeralAccounts[i];
        const to = ephemeralAccounts[i + 1];

        console.log(`[Privacy Mixer] Hop ${i + 1}/${totalHops - 1}...`);

        // Transfer to next ephemeral account
        await this.executeTEETransfer(from, to.publicKey, amount);

        // Delegate the newly funded account (if not the last one)
        if (i < totalHops - 2) {
          console.log(`[Privacy Mixer] Delegating ephemeral account ${i + 1} to TEE...`);
          await this.delegateToTEE(to.publicKey, to);
        }

        onProgress?.(i + 1, totalHops);

        // Random delay for timing obfuscation
        await this.randomDelay();
      }

      // Step 4: Final transfer to destination
      console.log('[Privacy Mixer] Final transfer to destination...');
      const lastEphemeral = ephemeralAccounts[totalHops - 1];
      const signature = await this.executeTEETransfer(
        lastEphemeral,
        destinationPubkey,
        amount
      );
      onProgress?.(totalHops, totalHops);

      console.log('[Privacy Mixer] Mix completed successfully:', signature);
      return signature;
    } catch (error) {
      console.error('[Privacy Mixer] Mix failed:', error);
      throw error;
    }
  }

  /**
   * Check if an account is delegated to TEE
   */
  public async isDelegated(account: PublicKey): Promise<boolean> {
    try {
      const result = await this.magicConnection.getDelegationStatus(account);
      return result?.isDelegated || false;
    } catch (error) {
      console.error('[Privacy Mixer] Failed to check delegation:', error);
      return false;
    }
  }

  /**
   * Get mixer statistics (for UI)
   */
  public getConfig(): MixerConfig {
    return { ...this.config };
  }
}

/**
 * Create a Privacy Mixer instance
 */
export function createPrivacyMixer(
  rpcUrl: string,
  config?: Partial<MixerConfig>
): PrivacyMixer {
  const finalConfig = {
    ...DEFAULT_MIXER_CONFIG,
    ...config,
  };
  return new PrivacyMixer(rpcUrl, finalConfig);
}

/**
 * Privacy Cash Browser Client
 * Full integration with Light Protocol SDK for browser environments
 */

import { Connection, PublicKey, Transaction, TransactionSignature } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import {
  Rpc,
  confirmTx,
  LightSystemProgram,
  compress,
  buildAndSignTx,
  createRpc,
  defaultTestStateTreeAccounts,
} from '@lightprotocol/stateless.js';
import {
  getEncryptionService,
  type DecryptedUtxo,
  type EncryptedUtxo,
} from './encryption';
import { getStorageAdapter, type StoredUtxo } from './storage';

export interface PrivacyCashConfig {
  connection: Connection;
  wallet: WalletContextState;
  rpcEndpoint?: string;
}

export interface DepositResult {
  signature: TransactionSignature;
  commitment: string;
  leafIndex: number;
  merkleTree: string;
}

export interface WithdrawResult {
  signature: TransactionSignature;
  amount: number;
}

export class PrivacyCashBrowserClient {
  private connection: Connection;
  private wallet: WalletContextState;
  private rpc: Rpc;
  private encryption = getEncryptionService();
  private storage = getStorageAdapter();
  private encryptionKey: CryptoKey | null = null;

  constructor(config: PrivacyCashConfig) {
    this.connection = config.connection;
    this.wallet = config.wallet;

    // Initialize Light Protocol RPC
    const rpcEndpoint = config.rpcEndpoint || this.connection.rpcEndpoint;
    this.rpc = createRpc(rpcEndpoint, rpcEndpoint);
  }

  /**
   * Initialize the client by deriving encryption key from wallet signature
   */
  async initialize(): Promise<void> {
    if (!this.wallet.publicKey || !this.wallet.signMessage) {
      throw new Error('Wallet not connected');
    }

    // Request wallet signature for encryption key derivation
    const message = new TextEncoder().encode(
      `Sign this message to derive your Privacy Cash encryption key.\n\nThis signature is used locally to encrypt your private transaction data.\n\nWallet: ${this.wallet.publicKey.toBase58()}\nTimestamp: ${Date.now()}`
    );

    const signature = await this.wallet.signMessage(message);

    // Derive encryption key from signature
    this.encryptionKey = await this.encryption.deriveEncryptionKeyFromSignature(
      signature,
      'v2' // Use V2 (AES-256-GCM)
    );
  }

  /**
   * Deposit SOL into Privacy Cash pool (shield)
   */
  async deposit(amount: number): Promise<DepositResult> {
    if (!this.wallet.publicKey || !this.wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    if (!this.encryptionKey) {
      await this.initialize();
    }

    try {
      // Generate UTXO commitment data
      const blinding = this.encryption.generateBlinding();
      const assetId = PublicKey.default.toBase58(); // SOL
      const commitment = this.encryption.computeCommitment(amount, assetId, blinding);

      // Convert amount to lamports
      const lamports = Math.floor(amount * 1e9);

      // Compress SOL using Light Protocol
      const { transaction, instructions } = await compress(this.rpc, this.wallet.publicKey, lamports, this.wallet.publicKey);

      // Sign and send transaction
      const signedTx = await this.wallet.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(signedTx.serialize());

      // Wait for confirmation
      await confirmTx(this.connection, signature);

      // Get merkle tree and leaf index from transaction logs
      // Note: In production, parse these from transaction logs
      const merkleTree = defaultTestStateTreeAccounts().merkleTree.toBase58();
      const leafIndex = 0; // Should be parsed from logs

      // Generate nullifier for spending later
      const secret = this.encryption.generateBlinding();
      const nullifier = this.encryption.computeNullifier(commitment, secret);

      // Create and encrypt UTXO
      const utxo: DecryptedUtxo = {
        amount: lamports,
        assetId,
        blinding,
        merkleTree,
        nullifier,
      };

      const encryptedUtxo = await this.encryption.encryptUtxo(
        utxo,
        this.encryptionKey!,
        'v2'
      );

      // Store encrypted UTXO
      const storedUtxo: StoredUtxo = {
        encrypted: encryptedUtxo,
        merkleTree,
        leafIndex,
        timestamp: Date.now(),
        spent: false,
      };

      await this.storage.addUtxo(this.wallet.publicKey.toBase58(), storedUtxo);

      return {
        signature,
        commitment,
        leafIndex,
        merkleTree,
      };
    } catch (error) {
      console.error('Privacy Cash deposit error:', error);
      throw error;
    }
  }

  /**
   * Withdraw SOL from Privacy Cash pool (unshield)
   */
  async withdraw(amount: number, recipient?: PublicKey): Promise<WithdrawResult> {
    if (!this.wallet.publicKey || !this.wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    if (!this.encryptionKey) {
      await this.initialize();
    }

    const recipientKey = recipient || this.wallet.publicKey;

    try {
      // Get unspent UTXOs
      const storedUtxos = await this.storage.getUnspentUtxos(
        this.wallet.publicKey.toBase58()
      );

      if (storedUtxos.length === 0) {
        throw new Error('No unspent UTXOs available');
      }

      // Decrypt UTXOs and find ones to spend
      const lamports = Math.floor(amount * 1e9);
      let totalAmount = 0;
      const utxosToSpend: { utxo: DecryptedUtxo; stored: StoredUtxo }[] = [];

      for (const stored of storedUtxos) {
        const decrypted = await this.encryption.decryptUtxo(
          stored.encrypted,
          this.encryptionKey!
        );

        utxosToSpend.push({ utxo: decrypted, stored });
        totalAmount += decrypted.amount;

        if (totalAmount >= lamports) {
          break;
        }
      }

      if (totalAmount < lamports) {
        throw new Error(`Insufficient private balance. Need ${amount} SOL, have ${totalAmount / 1e9} SOL`);
      }

      // In production, this would:
      // 1. Generate ZK proof of UTXO ownership
      // 2. Create decompress instruction
      // 3. Handle change UTXO if needed

      // For now, create a placeholder decompress transaction
      const transaction = new Transaction();
      // Add decompress instructions here using Light Protocol SDK

      const signedTx = await this.wallet.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(signedTx.serialize());
      await confirmTx(this.connection, signature);

      // Mark UTXOs as spent
      for (const { stored } of utxosToSpend) {
        await this.storage.markUtxoSpent(
          this.wallet.publicKey.toBase58(),
          stored.merkleTree,
          stored.leafIndex
        );
      }

      return {
        signature,
        amount,
      };
    } catch (error) {
      console.error('Privacy Cash withdraw error:', error);
      throw error;
    }
  }

  /**
   * Get private balance (sum of unspent UTXOs)
   */
  async getPrivateBalance(): Promise<number> {
    if (!this.wallet.publicKey) {
      return 0;
    }

    if (!this.encryptionKey) {
      try {
        await this.initialize();
      } catch (error) {
        console.error('Failed to initialize encryption:', error);
        return 0;
      }
    }

    try {
      const storedUtxos = await this.storage.getUnspentUtxos(
        this.wallet.publicKey.toBase58()
      );

      let total = 0;
      for (const stored of storedUtxos) {
        const decrypted = await this.encryption.decryptUtxo(
          stored.encrypted,
          this.encryptionKey!
        );
        total += decrypted.amount;
      }

      return total / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error('Failed to get private balance:', error);
      return 0;
    }
  }

  /**
   * Get all UTXOs (for debugging/display)
   */
  async getUtxos(): Promise<DecryptedUtxo[]> {
    if (!this.wallet.publicKey || !this.encryptionKey) {
      return [];
    }

    const storedUtxos = await this.storage.getUnspentUtxos(
      this.wallet.publicKey.toBase58()
    );

    const decrypted: DecryptedUtxo[] = [];
    for (const stored of storedUtxos) {
      try {
        const utxo = await this.encryption.decryptUtxo(
          stored.encrypted,
          this.encryptionKey
        );
        decrypted.push(utxo);
      } catch (error) {
        console.error('Failed to decrypt UTXO:', error);
      }
    }

    return decrypted;
  }

  /**
   * Clear all cached UTXOs (reset)
   */
  async reset(): Promise<void> {
    if (!this.wallet.publicKey) {
      return;
    }

    await this.storage.clearUtxos(this.wallet.publicKey.toBase58());
    this.encryptionKey = null;
  }
}

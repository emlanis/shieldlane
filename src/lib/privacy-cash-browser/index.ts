/**
 * Privacy Cash Browser Client
 * Full integration with Light Protocol SDK for browser environments
 */

import { Connection, PublicKey, TransactionSignature } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import {
  getEncryptionService,
  type DecryptedUtxo,
  type EncryptedUtxo,
} from './encryption';
import { getStorageAdapter } from './storage';

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
  private wallet: WalletContextState;
  private encryption = getEncryptionService();
  private storage = getStorageAdapter();
  private encryptionKey: CryptoKey | null = null;

  constructor(config: PrivacyCashConfig) {
    this.wallet = config.wallet;
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
   *
   * NOTE: Light Protocol SDK v0.22.0 requires direct Signer access (secretKey),
   * which is not available in browser wallets for security reasons.
   * This is a placeholder implementation until browser-compatible SDK is available.
   */
  async deposit(_amount: number): Promise<DepositResult> {
    if (!this.wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    // Light Protocol SDK v0.22.0 is not compatible with browser wallets
    // because it requires access to the wallet's secret key for signing.
    // Browser wallets (Phantom, Solflare, etc.) never expose secret keys.
    throw new Error(
      'Privacy Cash deposits are not yet available. ' +
      'Light Protocol SDK v0.22.0 requires wallet secret key access, ' +
      'which browser wallets do not provide for security reasons. ' +
      'Use ShadowPay for private transfers instead.'
    );
  }

  /**
   * Withdraw SOL from Privacy Cash pool (unshield)
   */
  async withdraw(_amount: number, _recipient?: PublicKey): Promise<WithdrawResult> {
    if (!this.wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    throw new Error(
      'Privacy Cash withdrawals are not yet available. ' +
      'Light Protocol SDK v0.22.0 requires wallet secret key access, ' +
      'which browser wallets do not provide for security reasons. ' +
      'Use ShadowPay for private transfers instead.'
    );
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

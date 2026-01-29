/**
 * Unified Privacy Service
 * Privacy Cash (ZK-SNARKs) integration
 * Provides a single interface for all privacy operations
 */

import { Connection, PublicKey } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { PrivacyCashBrowserClient, DepositResult, WithdrawResult } from './privacy-cash-browser';
import type { PrivacyMode } from '@/types';

export interface UnifiedPrivacyConfig {
  connection: Connection;
  wallet: WalletContextState;
}

export interface PrivacyBalance {
  privacyCash: number; // ZK-SNARK shielded balance
  total: number;
}

export interface TransferResult {
  signature: string;
  method: 'privacy-cash';
  amount: number;
}

export class UnifiedPrivacyService {
  private privacyCash: PrivacyCashBrowserClient;
  private wallet: WalletContextState;
  private connection: Connection;

  constructor(config: UnifiedPrivacyConfig) {
    this.wallet = config.wallet;
    this.connection = config.connection;

    // Initialize Privacy Cash
    this.privacyCash = new PrivacyCashBrowserClient({
      connection: config.connection,
      wallet: config.wallet,
    });
  }

  /**
   * Initialize privacy service
   */
  async initialize(): Promise<void> {
    if (!this.wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    // Initialize Privacy Cash encryption
    await this.privacyCash.initialize();
  }

  /**
   * Get privacy balance
   */
  async getPrivacyBalance(): Promise<PrivacyBalance> {
    if (!this.wallet.publicKey) {
      return { privacyCash: 0, total: 0 };
    }

    const privacyCashBalance = await this.privacyCash.getPrivateBalance().catch(() => 0);

    return {
      privacyCash: privacyCashBalance,
      total: privacyCashBalance,
    };
  }

  /**
   * Deposit SOL using Privacy Cash
   */
  async deposit(amount: number): Promise<DepositResult> {
    if (!this.wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    return await this.privacyCash.deposit(amount);
  }

  /**
   * Withdraw SOL using Privacy Cash
   */
  async withdraw(
    amount: number,
    recipient?: PublicKey
  ): Promise<WithdrawResult> {
    if (!this.wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const recipientKey = recipient || this.wallet.publicKey;
    return await this.privacyCash.withdraw(amount, recipientKey);
  }

  /**
   * Get privacy statistics and recommendations
   */
  async getPrivacyStats() {
    const balance = await this.getPrivacyBalance();
    const publicBalance = this.wallet.publicKey
      ? await this.connection.getBalance(this.wallet.publicKey)
      : 0;
    const publicBalanceSOL = publicBalance / 1e9;

    const privacyPercentage = balance.total > 0
      ? (balance.total / (balance.total + publicBalanceSOL)) * 100
      : 0;

    return {
      privacyBalance: balance,
      publicBalance: publicBalanceSOL,
      privacyPercentage,
      recommendations: this.getRecommendations(privacyPercentage, balance),
    };
  }

  /**
   * Get privacy recommendations based on current state
   */
  private getRecommendations(privacyPercentage: number, balance: PrivacyBalance): string[] {
    const recommendations: string[] = [];

    if (privacyPercentage < 50) {
      recommendations.push('Shield more of your balance using Privacy Cash for better privacy');
    }

    if (balance.privacyCash === 0) {
      recommendations.push('Deposit to Privacy Cash pool to use ZK-SNARK privacy');
    }

    if (privacyPercentage > 80) {
      recommendations.push('Excellent privacy coverage! Your funds are well protected');
    }

    return recommendations;
  }

  /**
   * Reset all privacy data (clear cached UTXOs and keys)
   */
  async reset(): Promise<void> {
    await this.privacyCash.reset();
  }

  /**
   * Get Privacy Cash client for advanced operations
   */
  getPrivacyCashClient(): PrivacyCashBrowserClient {
    return this.privacyCash;
  }
}

/**
 * Create unified privacy service instance
 */
export function createUnifiedPrivacyService(
  wallet: WalletContextState,
  connection: Connection
): UnifiedPrivacyService {
  return new UnifiedPrivacyService({
    connection,
    wallet,
  });
}

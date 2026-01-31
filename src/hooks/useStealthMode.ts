'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { StealthTransfer } from '@/types';
import toast from 'react-hot-toast';

/**
 * Stealth Mode Hook - Privacy Cash (ZK-SNARKs)
 *
 * This hook provides stealth transfers using Privacy Cash:
 * - Sender identity hidden using Groth16 ZK proofs
 * - Amount and recipient remain visible on-chain
 * - Best for private withdrawals to exchanges or wallets
 */
export const useStealthMode = () => {
  const { publicKey, signMessage } = useWallet();
  const [loading, setLoading] = useState(false);

  /**
   * Execute Privacy Cash stealth transfer
   * Uses ZK-SNARKs to hide sender identity while keeping amount/recipient visible
   */
  const executeTransfer = async (transfer: StealthTransfer): Promise<boolean> => {
    if (!publicKey || !signMessage) {
      toast.error('Please connect your wallet first');
      return false;
    }

    setLoading(true);

    try {
      // Validate recipient address
      let recipientKey: PublicKey;
      try {
        recipientKey = new PublicKey(transfer.recipient);
      } catch {
        toast.error('Invalid recipient address');
        return false;
      }

      // Validate amount
      if (transfer.amount <= 0) {
        toast.error('Amount must be greater than 0');
        return false;
      }

      // Check Privacy Cash balance
      toast.loading('Checking Privacy Cash balance...', { id: 'stealth-transfer' });

      const balanceResponse = await fetch(
        `/api/privacy-cash/balance?walletAddress=${publicKey.toBase58()}`
      );
      const balanceResult = await balanceResponse.json();

      if (!balanceResult.success || !balanceResult.balance) {
        toast.error(
          'No Privacy Cash balance found. Please deposit SOL to Privacy Cash on the Dashboard first.',
          { id: 'stealth-transfer', duration: 5000 }
        );
        return false;
      }

      const privacyCashBalanceSol = balanceResult.balance / 1e9;
      if (privacyCashBalanceSol < transfer.amount) {
        toast.error(
          `Insufficient Privacy Cash balance. You have ${privacyCashBalanceSol.toFixed(4)} SOL but trying to send ${transfer.amount} SOL`,
          { id: 'stealth-transfer', duration: 5000 }
        );
        return false;
      }

      toast.loading('Requesting wallet signature...', {
        id: 'stealth-transfer',
      });

      // Sign authorization message
      const message = `Withdraw ${transfer.amount} SOL from Privacy Cash to ${recipientKey.toBase58()} at ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);
      let signatureBytes: Uint8Array;

      try {
        signatureBytes = await signMessage(encodedMessage);
      } catch (signError: any) {
        toast.error('Wallet signature required for withdrawal', {
          id: 'stealth-transfer',
        });
        return false;
      }

      // Convert signature to base64
      const signatureBase64 = Buffer.from(signatureBytes).toString('base64');

      toast.loading('Executing stealth transfer via Privacy Cash...', {
        id: 'stealth-transfer',
      });

      // Execute Privacy Cash withdrawal
      const withdrawResponse = await fetch('/api/privacy-cash/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          recipient: recipientKey.toBase58(),
          amount: transfer.amount * 1e9, // Convert to lamports
          signature: signatureBase64,
          message: message,
        }),
      });

      const withdrawResult = await withdrawResponse.json();

      if (!withdrawResult.success) {
        toast.error(withdrawResult.error || 'Privacy Cash withdrawal failed', {
          id: 'stealth-transfer',
        });
        return false;
      }

      // Track stealth transaction for privacy score (Privacy Cash ZK-SNARKs)
      const stealthTxKey = `stealth_tx_${publicKey.toBase58()}`;
      const currentCount = parseInt(localStorage.getItem(stealthTxKey) || '0', 10);
      localStorage.setItem(stealthTxKey, (currentCount + 1).toString());

      toast.success(
        `Stealth transfer complete! ${transfer.amount} SOL sent privately via Privacy Cash (ZK-SNARKs)`,
        { id: 'stealth-transfer', duration: 5000 }
      );

      console.log('Privacy Cash withdrawal signature:', withdrawResult.signature);
      return true;
    } catch (error: any) {
      console.error('Stealth transfer error:', error);
      toast.error(error.message || 'Transfer failed', { id: 'stealth-transfer' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    executeTransfer,
  };
};

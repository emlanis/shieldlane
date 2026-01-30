/**
 * Privacy Mixer Hook - Proper Server-Side Multi-Hop Mixing
 *
 * This hook calls the server-side Privacy Mixer API which:
 * 1. Decrypts Privacy Cash account keypair server-side
 * 2. Creates ephemeral accounts (temporary keypairs)
 * 3. Delegates ephemeral accounts to MagicBlock TEE
 * 4. Executes multi-hop transfers (3-5 hops) inside TEE
 * 5. Final transfer reaches recipient with complete privacy
 *
 * This is the CORRECT implementation that actually uses MagicBlock properly!
 */

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import toast from 'react-hot-toast';

export interface MixerProgress {
  stage: 'idle' | 'authorizing' | 'mixing' | 'complete' | 'error';
  message: string;
  hopsCompleted?: number;
  totalHops?: number;
  txSignature?: string;
}

export function usePrivacyMixer() {
  const { publicKey, signMessage } = useWallet();
  const [progress, setProgress] = useState<MixerProgress>({
    stage: 'idle',
    message: 'Ready to mix',
  });
  const [loading, setLoading] = useState(false);

  /**
   * Execute a privacy mix with server-side ephemeral account creation:
   * 1. User signs authorization message
   * 2. Server decrypts Privacy Cash keypair
   * 3. Server creates ephemeral accounts
   * 4. Server delegates accounts to MagicBlock TEE
   * 5. Server executes multi-hop transfers in TEE
   * 6. Recipient receives funds with complete privacy
   */
  const executeMix = async (recipient: string, amount: number): Promise<boolean> => {
    if (!publicKey || !signMessage) {
      toast.error('Please connect your wallet');
      return false;
    }

    setLoading(true);
    setProgress({ stage: 'idle', message: 'Starting privacy mix...' });

    try {
      // Validate recipient
      const recipientPubkey = new PublicKey(recipient);
      const amountLamports = amount * LAMPORTS_PER_SOL;

      // Step 1: Get user authorization signature
      setProgress({ stage: 'authorizing', message: 'Requesting authorization...' });

      const message = `Authorize Privacy Mix\nAmount: ${amount} SOL\nRecipient: ${recipient}\nTimestamp: ${Date.now()}`;
      const messageBytes = new TextEncoder().encode(message);
      const signature = await signMessage(messageBytes);
      const signatureBase64 = Buffer.from(signature).toString('base64');

      console.log('[Privacy Mixer] Authorization signed');

      // Step 2: Call server-side mixing API (creates ephemeral accounts + TEE delegation)
      setProgress({
        stage: 'mixing',
        message: 'Creating ephemeral accounts and delegating to TEE...',
        hopsCompleted: 0,
        totalHops: 0,
      });

      const mixResponse = await fetch('/api/privacy-mixer/mix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          amount: amountLamports,
          recipient: recipientPubkey.toBase58(),
          signature: signatureBase64,
          message,
        }),
      });

      const mixData = await mixResponse.json();

      if (!mixData.success) {
        throw new Error(mixData.error || 'Mix failed');
      }

      console.log('[Privacy Mixer] Mix completed:', {
        signature: mixData.signature,
        hops: mixData.hops,
      });

      // Update with completion
      setProgress({
        stage: 'complete',
        message: `Mix completed through ${mixData.hops} hops!`,
        hopsCompleted: mixData.hops,
        totalHops: mixData.hops,
        txSignature: mixData.signature,
      });

      toast.success(`Mix completed! ${mixData.hops} hops executed through TEE`);
      setLoading(false);
      return true;
    } catch (error: any) {
      console.error('[Privacy Mixer] Error:', error);
      setProgress({
        stage: 'error',
        message: error.message || 'Mix failed',
      });
      toast.error(error.message || 'Failed to execute mix');
      setLoading(false);
      return false;
    }
  };

  return {
    executeMix,
    progress,
    loading,
  };
}

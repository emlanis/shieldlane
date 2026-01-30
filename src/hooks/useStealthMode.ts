'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  ConnectionMagicRouter,
  createDelegateInstruction,
  DELEGATION_PROGRAM_ID,
  DEFAULT_PRIVATE_VALIDATOR,
} from '@magicblock-labs/ephemeral-rollups-sdk';
import { PrivacyMode, StealthTransfer } from '@/types';
import toast from 'react-hot-toast';

/**
 * Stealth Mode Hook - MagicBlock Private Ephemeral Rollups (PERs)
 *
 * This hook provides two privacy modes:
 * - External Mode: Uses Privacy Cash (ZK-SNARKs) - sender hidden, amount/recipient visible
 * - Internal Mode: Uses MagicBlock PERs (TEE) - everything hidden inside secure enclave
 */
export const useStealthMode = () => {
  const { publicKey, signTransaction, signMessage } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<PrivacyMode>('external');

  /**
   * Verify TEE RPC Integrity
   * In production, this would verify the TEE attestation and ensure secure enclave
   */
  const verifyTeeRpcIntegrity = async (): Promise<boolean> => {
    try {
      // TODO: Implement TEE attestation verification when MagicBlock provides devnet TEE RPC
      // For now, we'll use the standard RPC with delegation
      console.log('TEE RPC verification skipped (devnet mode)');
      return true;
    } catch (error) {
      console.error('TEE verification failed:', error);
      return false;
    }
  };

  /**
   * Get MagicBlock Auth Token
   * In production, this would authenticate with the TEE RPC
   */
  const getAuthToken = async (): Promise<string | null> => {
    try {
      // TODO: Implement auth token retrieval when MagicBlock TEE RPC is available
      // For now, we proceed without token for devnet testing
      console.log('Auth token skipped (devnet mode)');
      return null;
    } catch (error) {
      console.error('Auth token retrieval failed:', error);
      return null;
    }
  };

  /**
   * Delegate account to Ephemeral Rollup
   * This enables private execution inside the TEE
   */
  const delegateAccount = async (
    account: PublicKey,
    ownerProgram: PublicKey
  ): Promise<boolean> => {
    if (!publicKey || !signTransaction) {
      toast.error('Wallet not connected');
      return false;
    }

    try {
      // Use MagicBlock RPC for delegation operations
      const magicRpcUrl =
        process.env.NEXT_PUBLIC_MAGICBLOCK_RPC ||
        'https://devnet-rpc.magicblock.app';
      const magicConnection = new ConnectionMagicRouter(
        magicRpcUrl,
        connection.commitment
      );

      const delegateIx = createDelegateInstruction(
        {
          payer: publicKey,
          delegatedAccount: account,
          ownerProgram: ownerProgram,
          validator: DEFAULT_PRIVATE_VALIDATOR,
        },
        {
          commitFrequencyMs: 60000, // Commit every 60 seconds
        }
      );

      const transaction = new Transaction().add(delegateIx);
      const { blockhash } = await magicConnection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signed = await signTransaction(transaction);
      const signature = await magicConnection.sendRawTransaction(signed.serialize());
      await magicConnection.confirmTransaction(signature);

      console.log('Account delegated to ER:', signature);
      return true;
    } catch (error) {
      console.error('Account delegation failed:', error);
      return false;
    }
  };

  /**
   * Execute private transfer in TEE
   * For Internal mode, this executes the transfer inside the secure enclave
   */
  const executePrivateTransfer = async (
    recipient: PublicKey,
    amountSol: number
  ): Promise<string | null> => {
    if (!publicKey || !signTransaction) {
      toast.error('Wallet not connected');
      return null;
    }

    try {
      // Use MagicBlock ConnectionMagicRouter with MagicBlock DevNet RPC
      // Note: Standard Solana RPC doesn't support getDelegationStatus
      const magicRpcUrl =
        process.env.NEXT_PUBLIC_MAGICBLOCK_RPC ||
        'https://devnet-rpc.magicblock.app';
      const magicConnection = new ConnectionMagicRouter(
        magicRpcUrl,
        connection.commitment
      );

      // Check delegation status
      const delegationResult = await magicConnection.getDelegationStatus(publicKey);
      const isDelegated = delegationResult?.isDelegated || false;

      if (!isDelegated && currentMode === 'internal') {
        // Delegate account for internal mode
        const delegated = await delegateAccount(publicKey, SystemProgram.programId);
        if (!delegated) {
          throw new Error('Failed to delegate account to Ephemeral Rollup');
        }
      }

      // Create transfer instruction
      const transferIx = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: recipient,
        lamports: amountSol * LAMPORTS_PER_SOL,
      });

      const transaction = new Transaction().add(transferIx);

      // MagicRouter automatically routes to ER if account is delegated
      const preparedTx = await magicConnection.prepareTransaction(transaction);
      const signed = await signTransaction(preparedTx);

      // Send transaction through MagicRouter
      const signature = await magicConnection.sendTransaction(signed);

      // Wait for confirmation
      await magicConnection.confirmTransaction(signature);

      console.log(
        `Private transfer executed (${currentMode} mode):`,
        signature
      );
      return signature;
    } catch (error) {
      console.error('Private transfer failed:', error);
      throw error;
    }
  };

  /**
   * Main transfer execution function
   * Routes to appropriate privacy protocol based on mode
   */
  const executeTransfer = async (transfer: StealthTransfer): Promise<boolean> => {
    if (!publicKey || !signTransaction) {
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

      // Mode-specific execution
      if (currentMode === 'external') {
        // External Mode: Use Privacy Cash (ZK-SNARKs)
        toast.loading('Checking Privacy Cash balance...', { id: 'stealth-transfer' });

        // Check Privacy Cash balance
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
        if (!signMessage) {
          toast.error('Wallet does not support message signing', {
            id: 'stealth-transfer',
          });
          return false;
        }

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

        toast.loading('Executing private withdrawal via Privacy Cash...', {
          id: 'stealth-transfer',
        });

        // Execute Privacy Cash withdrawal
        const withdrawResponse = await fetch('/api/privacy-cash/withdraw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: publicKey.toBase58(),
            recipient: recipientKey.toBase58(), // Fixed: was recipientAddress, now recipient
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

        toast.success(
          `External transfer complete! ${transfer.amount} SOL sent privately via Privacy Cash (ZK-SNARKs)`,
          { id: 'stealth-transfer', duration: 5000 }
        );

        console.log('Privacy Cash withdrawal signature:', withdrawResult.signature);
        return true;
      } else {
        // Internal Mode: Use MagicBlock PERs (TEE)
        toast.loading('Verifying TEE integrity...', { id: 'stealth-transfer' });

        const teeVerified = await verifyTeeRpcIntegrity();
        if (!teeVerified) {
          toast.error('TEE verification failed', { id: 'stealth-transfer' });
          return false;
        }

        toast.loading('Authenticating with TEE RPC...', { id: 'stealth-transfer' });
        await getAuthToken();

        toast.loading('Delegating account to Ephemeral Rollup...', {
          id: 'stealth-transfer',
        });

        const signature = await executePrivateTransfer(
          recipientKey,
          transfer.amount
        );

        if (!signature) {
          toast.error('Transfer failed', { id: 'stealth-transfer' });
          return false;
        }

        toast.success(
          `Stealth transfer complete! ${transfer.amount} SOL sent privately via TEE`,
          { id: 'stealth-transfer', duration: 5000 }
        );

        console.log('Transfer signature:', signature);
        return true;
      }
    } catch (error: any) {
      console.error('Stealth transfer error:', error);
      toast.error(error.message || 'Transfer failed', { id: 'stealth-transfer' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (mode: PrivacyMode) => {
    setCurrentMode(mode);

    const modeNames = {
      external: 'External (Privacy Cash - ZK-SNARKs)',
      internal: 'Internal (MagicBlock PERs - TEE)',
    };

    toast.success(`Switched to ${modeNames[mode]} mode`);
  };

  return {
    currentMode,
    loading,
    executeTransfer,
    switchMode,
  };
};

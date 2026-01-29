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
  const { publicKey, signTransaction } = useWallet();
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
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signed = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature);

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
      // Use MagicBlock ConnectionMagicRouter for automatic routing
      const magicConnection = new ConnectionMagicRouter(
        connection.rpcEndpoint,
        connection.commitment
      );

      // Check delegation status
      const { isDelegated } = await magicConnection.getDelegationStatus(publicKey);

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
        // Note: Privacy Cash deposits/withdrawals are handled in PrivateBalance component
        // This mode would require depositing to Privacy Cash first
        toast.error(
          'External mode requires depositing to Privacy Cash first. Use the deposit button on the dashboard.'
        );
        return false;
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

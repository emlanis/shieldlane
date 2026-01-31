'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { surveillanceMonitor } from '@/lib/surveillance';
import { usePrivateBalance } from './usePrivateBalance';
import { PrivacyScore } from '@/types';

export const usePrivacyScore = () => {
  const { publicKey } = useWallet();
  const { balance } = usePrivateBalance();
  const [score, setScore] = useState<PrivacyScore | null>(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    if (!publicKey) {
      setScore(null);
      return;
    }

    setLoading(true);

    try {
      // Check if user has Privacy Cash balance (actual privacy protection)
      const hasPrivateBalance = balance.privacyCashBalance > 0;

      const privacyScore = await surveillanceMonitor.calculatePrivacyScore(
        publicKey,
        hasPrivateBalance,
        false // Stealth mode tracking not implemented yet
      );

      setScore(privacyScore);
    } catch (error) {
      console.error('Error calculating privacy score:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculate();
  }, [publicKey, balance.privacyCashBalance]);

  return {
    score,
    loading,
    refresh: calculate,
  };
};

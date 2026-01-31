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
      // Calculate Privacy Cash coverage as percentage of total balance
      const totalBalance = balance.totalBalance;
      const privacyCashCoverage = totalBalance > 0
        ? (balance.privacyCashBalance / totalBalance) * 100
        : 0;

      // Check if user has used MagicBlock Mixer (check localStorage for mixer usage)
      const mixerUsageKey = `mixer_used_${publicKey.toBase58()}`;
      const usesMagicBlockMixer = localStorage.getItem(mixerUsageKey) === 'true';

      console.log('[Privacy Score] Calculating with:', {
        privacyCashCoverage: privacyCashCoverage.toFixed(2) + '%',
        usesMagicBlockMixer,
        totalBalance,
        privacyCashBalance: balance.privacyCashBalance,
      });

      const privacyScore = await surveillanceMonitor.calculatePrivacyScore(
        publicKey,
        privacyCashCoverage,
        usesMagicBlockMixer
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
  }, [publicKey, balance.privacyCashBalance, balance.totalBalance]);

  return {
    score,
    loading,
    refresh: calculate,
  };
};

'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getBalance } from '@/lib/solana';
import { PrivacyCashClient } from '@/lib/privacy-cash';
import { shadowWireClient } from '@/lib/shadowwire';
import { PrivateBalance } from '@/types';

export const usePrivateBalance = () => {
  const { publicKey, wallet } = useWallet();
  const [balance, setBalance] = useState<PrivateBalance>({
    publicBalance: 0,
    privateBalance: 0,
    privacyCashBalance: 0,
    shadowPayBalance: 0,
    totalBalance: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = async () => {
    if (!publicKey) {
      setBalance({
        publicBalance: 0,
        privateBalance: 0,
        privacyCashBalance: 0,
        shadowPayBalance: 0,
        totalBalance: 0,
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get public balance
      const publicBalance = await getBalance(publicKey);

      // Get Privacy Cash balance
      const privacyCash = new PrivacyCashClient(wallet as any);
      const privacyCashBalance = await privacyCash.getPrivateBalance();

      // Get ShadowPay pool balance
      const shadowPayBalance = await shadowWireClient.getPoolBalance(publicKey.toBase58());

      // Calculate totals
      const privateBalance = privacyCashBalance + shadowPayBalance;
      const totalBalance = publicBalance + privateBalance;

      setBalance({
        publicBalance,
        privateBalance,
        privacyCashBalance,
        shadowPayBalance,
        totalBalance,
      });
    } catch (err: any) {
      console.error('Error fetching balances:', err);
      setError(err.message || 'Failed to fetch balances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();

    // Poll for balance updates every 10 seconds
    const interval = setInterval(fetchBalances, 10000);

    return () => clearInterval(interval);
  }, [publicKey]);

  return {
    balance,
    loading,
    error,
    refresh: fetchBalances,
  };
};

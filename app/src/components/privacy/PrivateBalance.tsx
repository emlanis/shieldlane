'use client';

import { FC, useState } from 'react';
import { usePrivateBalance } from '@/hooks/usePrivateBalance';
import { formatCurrency } from '@/lib/utils';

export const PrivateBalance: FC = () => {
  const { balance, loading, refresh } = usePrivateBalance();
  const [showActualBalance, setShowActualBalance] = useState(false);

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Balance</h2>
        <button
          onClick={() => setShowActualBalance(!showActualBalance)}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          <span>{showActualBalance ? '👁️ Hiding Actual' : '🔍 Show Actual'}</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* What Trackers See */}
        <div className="p-6 bg-gradient-to-br from-red-900/20 to-transparent border border-red-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⚠️</span>
            <h3 className="text-lg font-semibold text-red-400">What Trackers See</h3>
          </div>

          {loading ? (
            <div className="h-16 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-zinc-400 mb-1">Public Balance</p>
                <p className="text-3xl font-bold text-red-400">
                  {formatCurrency(balance.publicBalance)}
                </p>
              </div>

              <div className="pt-3 border-t border-red-500/20">
                <p className="text-xs text-zinc-500">
                  This is what appears on block explorers and what surveillance tools can track.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded">
                  Fully Exposed
                </span>
                <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded">
                  Trackable
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Your Actual Balance */}
        <div className="p-6 bg-gradient-to-br from-green-900/20 to-transparent border border-green-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🛡️</span>
            <h3 className="text-lg font-semibold text-green-400">Your Actual Balance</h3>
          </div>

          {loading ? (
            <div className="h-16 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-zinc-400 mb-1">Total Holdings</p>
                {showActualBalance ? (
                  <p className="text-3xl font-bold text-green-400">
                    {formatCurrency(balance.totalBalance)}
                  </p>
                ) : (
                  <p className="text-3xl font-bold text-zinc-500">••••••</p>
                )}
              </div>

              {showActualBalance && (
                <>
                  <div className="pt-3 border-t border-green-500/20 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Public</span>
                      <span className="text-zinc-300">{formatCurrency(balance.publicBalance)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Privacy Cash</span>
                      <span className="text-green-400">{formatCurrency(balance.privacyCashBalance)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">ShadowPay</span>
                      <span className="text-blue-400">{formatCurrency(balance.shadowPayBalance)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded">
                      Protected
                    </span>
                    <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded">
                      Private
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Privacy Status Bar */}
      <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-400">Privacy Coverage</span>
          <span className="text-sm font-medium">
            {balance.totalBalance > 0
              ? Math.round((balance.privateBalance / balance.totalBalance) * 100)
              : 0}
            % Protected
          </span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
            style={{
              width: `${balance.totalBalance > 0 ? (balance.privateBalance / balance.totalBalance) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={refresh}
        disabled={loading}
        className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-all"
      >
        {loading ? 'Refreshing...' : 'Refresh Balances'}
      </button>
    </div>
  );
};

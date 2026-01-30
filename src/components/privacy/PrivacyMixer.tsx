'use client';

import { FC, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import toast from 'react-hot-toast';
import { usePrivacyMixer } from '@/hooks/usePrivacyMixer';

/**
 * Privacy Mixer Component
 *
 * Combines Privacy Cash (ZK-SNARKs) + MagicBlock (TEE) for enhanced privacy
 */
export const PrivacyMixer: FC = () => {
  const { publicKey } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const { executeMix, progress, loading } = usePrivacyMixer();

  const handleMix = async () => {
    if (!recipient || !amount) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate recipient address
    try {
      new PublicKey(recipient);
    } catch {
      toast.error('Invalid recipient address');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Invalid amount');
      return;
    }

    const success = await executeMix(recipient, amountNum);
    if (success) {
      setRecipient('');
      setAmount('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Privacy Mixer</h2>
          <p className="text-sm text-gray-400 mt-1">
            Dual-layer privacy: ZK-SNARKs + MagicBlock TEE
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-lg">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-gray-300">Enhanced Privacy</span>
        </div>
      </div>

      {/* How it Works */}
      <div className="p-6 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 border border-amber-500/20 rounded-xl">
        <h3 className="text-lg font-semibold mb-4 text-amber-300">How Privacy Mixer Works</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 font-semibold">
              1
            </div>
            <div>
              <p className="font-medium text-gray-200">Privacy Cash Withdrawal</p>
              <p className="text-sm text-gray-400">
                Withdraw from Privacy Cash pool using ZK-SNARKs (Groth16 proofs) to hide your
                identity
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400 font-semibold">
              2
            </div>
            <div>
              <p className="font-medium text-gray-200">MagicBlock TEE Transfer</p>
              <p className="text-sm text-gray-400">
                Transfer executes through MagicBlock's ConnectionMagicRouter, which automatically
                routes to TEE if account is delegated
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-semibold">
              3
            </div>
            <div>
              <p className="font-medium text-gray-200">Complete Privacy</p>
              <p className="text-sm text-gray-400">
                Recipient receives SOL with sender identity hidden by ZK proofs and transaction
                routed through MagicBlock infrastructure
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mixer Form */}
      <div className="p-6 bg-zinc-950/50 border border-zinc-900 rounded-xl space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter Solana address"
            disabled={loading}
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Amount (SOL)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            disabled={loading}
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-400">Minimum: 0.01 SOL</p>
        </div>

        {/* Progress Indicator */}
        {loading && progress.stage !== 'idle' && (
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <svg className="animate-spin h-5 w-5 text-amber-500" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-300">{progress.message}</span>
            </div>

            {/* Show hop progress if available */}
            {progress.totalHops && progress.totalHops > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Mixing Progress</span>
                  <span>{progress.hopsCompleted || 0}/{progress.totalHops} hops</span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: progress.totalHops }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-full transition-colors ${
                        i < (progress.hopsCompleted || 0)
                          ? 'bg-amber-500'
                          : 'bg-zinc-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Stage indicators */}
            {!progress.totalHops && (
              <div className="flex gap-2 mt-3">
                <div
                  className={`h-2 flex-1 rounded-full ${
                    progress.stage === 'authorizing' || progress.stage === 'mixing' || progress.stage === 'complete'
                      ? 'bg-amber-500'
                      : 'bg-zinc-800'
                  }`}
                />
                <div
                  className={`h-2 flex-1 rounded-full ${
                    progress.stage === 'mixing' || progress.stage === 'complete'
                      ? 'bg-amber-500'
                      : 'bg-zinc-800'
                  }`}
                />
                <div
                  className={`h-2 flex-1 rounded-full ${
                    progress.stage === 'complete'
                      ? 'bg-amber-500'
                      : 'bg-zinc-800'
                  }`}
                />
              </div>
            )}
          </div>
        )}

        {/* Mix Button */}
        <button
          onClick={handleMix}
          disabled={!publicKey || loading || !recipient || !amount}
          className={`w-full py-4 rounded-lg font-semibold transition-all ${
            loading
              ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white cursor-wait'
              : !publicKey || !recipient || !amount
              ? 'bg-zinc-800 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black shadow-lg hover:shadow-amber-500/50'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </span>
          ) : (
            'Execute Privacy Mix'
          )}
        </button>
      </div>

      {/* Technology Stack */}
      <div className="p-6 bg-zinc-950/50 border border-zinc-900 rounded-xl">
        <h4 className="text-sm font-semibold mb-4 text-gray-400">Privacy Technologies</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 border border-amber-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-amber-400 rounded-full" />
              <span className="text-sm font-medium text-gray-300">Privacy Cash</span>
            </div>
            <p className="text-xs text-gray-400">Groth16 ZK-SNARKs hide sender identity</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full" />
              <span className="text-sm font-medium text-gray-300">MagicBlock TEE</span>
            </div>
            <p className="text-xs text-gray-400">Intel TDX enclaves for private execution</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-green-500/5 to-emerald-500/5 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-sm font-medium text-gray-300">ConnectionMagicRouter</span>
            </div>
            <p className="text-xs text-gray-400">Auto-routes to ER when delegated</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-orange-500/5 to-red-500/5 border border-orange-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-orange-400 rounded-full" />
              <span className="text-sm font-medium text-gray-300">Dual-Layer</span>
            </div>
            <p className="text-xs text-gray-400">Combined ZK + TEE privacy</p>
          </div>
        </div>
      </div>

      {/* Info Notice */}
      <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-blue-400">ℹ️</span>
          <div className="text-sm space-y-1">
            <p className="font-medium text-blue-300">MagicBlock Integration Demo</p>
            <p className="text-gray-400">
              This demonstrates MagicBlock SDK integration using ConnectionMagicRouter and
              delegation patterns. Transfers use MagicBlock's RPC which automatically routes to
              Ephemeral Rollups when accounts are delegated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

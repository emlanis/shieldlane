'use client';

import { FC, useState } from 'react';
import { useStealthMode } from '@/hooks/useStealthMode';
import { PrivacyMode } from '@/types';
import { isValidPublicKey } from '@/lib/solana';

export const StealthTransfer: FC = () => {
  const { currentMode, loading, executeTransfer, switchMode } = useStealthMode();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');

  const handleTransfer = async () => {
    if (!recipient || !amount) {
      return;
    }

    const success = await executeTransfer({
      recipient,
      amount: parseFloat(amount),
      mode: currentMode,
      memo: memo || undefined,
    });

    if (success) {
      setRecipient('');
      setAmount('');
      setMemo('');
    }
  };

  const isValidRecipient = recipient === '' || isValidPublicKey(recipient);
  const isValidAmount = amount === '' || (parseFloat(amount) > 0 && parseFloat(amount) < 1000000);

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Privacy Mode</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => switchMode('external')}
            className={`p-4 rounded-xl border-2 transition-all ${
              currentMode === 'external'
                ? 'border-amber-500 bg-amber-400/10'
                : 'border-zinc-900 bg-zinc-950 hover:border-zinc-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">👻</span>
              <span className="font-semibold">External</span>
            </div>
            <p className="text-xs text-gray-400">
              Sender hidden, amount & recipient visible
            </p>
            <div className="mt-2 flex gap-1">
              <div className="h-1 w-full bg-amber-400 rounded" />
              <div className="h-1 w-full bg-zinc-700 rounded" />
              <div className="h-1 w-full bg-zinc-700 rounded" />
            </div>
          </button>

          <button
            onClick={() => switchMode('internal')}
            className={`p-4 rounded-xl border-2 transition-all ${
              currentMode === 'internal'
                ? 'border-yellow-500 bg-yellow-400/10'
                : 'border-zinc-900 bg-zinc-950 hover:border-zinc-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🔒</span>
              <span className="font-semibold">Internal</span>
            </div>
            <p className="text-xs text-gray-400">
              Everything hidden - maximum privacy
            </p>
            <div className="mt-2 flex gap-1">
              <div className="h-1 w-full bg-yellow-400 rounded" />
              <div className="h-1 w-full bg-yellow-400 rounded" />
              <div className="h-1 w-full bg-yellow-400 rounded" />
            </div>
          </button>
        </div>
      </div>

      {/* Transfer Form */}
      <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl space-y-4">
        <h3 className="text-lg font-semibold">Transfer Details</h3>

        {/* Recipient */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter Solana address..."
            className={`w-full px-4 py-3 bg-black border ${
              isValidRecipient ? 'border-zinc-900' : 'border-red-500'
            } rounded-lg focus:outline-none focus:border-amber-500 transition-colors font-mono text-sm`}
          />
          {!isValidRecipient && (
            <p className="text-xs text-red-500 mt-1">Invalid Solana address</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-400">
              Amount (SOL)
            </label>
            {currentMode === 'internal' && (
              <span className="text-xs text-yellow-400 flex items-center gap-1">
                🔒 Encrypted
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className={`w-full px-4 py-3 bg-black border ${
                isValidAmount ? 'border-zinc-900' : 'border-red-500'
              } rounded-lg focus:outline-none focus:border-amber-500 transition-colors`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              SOL
            </span>
          </div>
          {!isValidAmount && (
            <p className="text-xs text-red-500 mt-1">Invalid amount</p>
          )}
        </div>

        {/* Memo (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Memo (Optional)
          </label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Add a note..."
            maxLength={100}
            className="w-full px-4 py-3 bg-black border border-zinc-900 rounded-lg focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Privacy Info */}
        <div className="p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-amber-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-lg">🛡️</span>
            <div className="text-sm space-y-1">
              <p className="font-medium text-purple-300">
                {currentMode === 'external' ? 'External Mode Active' : 'Internal Mode Active'}
              </p>
              <p className="text-gray-400">
                {currentMode === 'external'
                  ? 'Your identity will be hidden using Groth16 ZK proofs (Privacy Cash). Amount and recipient are visible on-chain.'
                  : 'Full privacy using MagicBlock TEE (Intel TDX secure enclaves). Sender, amount, and recipient are all hidden.'}
              </p>
            </div>
          </div>
        </div>

        {/* Transfer Button */}
        <button
          onClick={handleTransfer}
          disabled={loading || !isValidRecipient || !isValidAmount || !recipient || !amount}
          className="w-full px-6 py-4 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-all transform hover:scale-[1.02]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Executing Transfer...
            </span>
          ) : (
            `Execute ${currentMode === 'external' ? 'External' : 'Internal'} Transfer`
          )}
        </button>
      </div>

      {/* Technology Info */}
      <div className="p-4 bg-zinc-950/50 border border-zinc-900 rounded-lg">
        <h4 className="text-sm font-semibold mb-3 text-gray-400">Privacy Technologies:</h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-400 rounded-full" />
            <span className="text-gray-400">Groth16 ZK Proofs</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full" />
            <span className="text-gray-400">Intel TDX TEE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-gray-400">Ephemeral Rollups</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full" />
            <span className="text-gray-400">Light Protocol</span>
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';

import { FC, useState } from 'react';
import { useStealthMode } from '@/hooks/useStealthMode';
import { isValidPublicKey } from '@/lib/solana';

export const StealthTransfer: FC = () => {
  const { loading, executeTransfer } = useStealthMode();
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
      mode: 'external', // Always use external (Privacy Cash)
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
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Amount (SOL)
          </label>
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
              <p className="font-medium text-purple-300">Stealth Transfer Active</p>
              <p className="text-gray-400">
                Your identity will be hidden using Groth16 ZK proofs (Privacy Cash). Amount and recipient are visible on-chain.
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
            'Execute Stealth Transfer'
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
            <span className="w-2 h-2 bg-purple-400 rounded-full" />
            <span className="text-gray-400">ZK-SNARKs</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-gray-400">Privacy Pool</span>
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

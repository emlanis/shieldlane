'use client';

import { FC, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import toast from 'react-hot-toast';

/**
 * Privacy Mixer Component
 *
 * Combines Privacy Cash (ZK-SNARKs) + MagicBlock (TEE) for enhanced privacy
 */
export const PrivacyMixer: FC = () => {
  const { publicKey, signMessage } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [mixing, setMixing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const executeMix = async () => {
    if (!publicKey || !signMessage) {
      toast.error('Please connect your wallet first');
      return;
    }

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

    setMixing(true);
    setProgress({ current: 0, total: 0 });

    try {
      // Sign message for authorization
      const message = `Mix ${amountNum} SOL through Privacy Mixer\nTimestamp: ${Date.now()}`;
      const messageBytes = new TextEncoder().encode(message);
      const signature = await signMessage(messageBytes);
      const signatureBase64 = Buffer.from(signature).toString('base64');

      // Call mixer API
      const response = await fetch('/api/privacy-mixer/mix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          amount: amountNum * LAMPORTS_PER_SOL,
          recipient,
          signature: signatureBase64,
          message,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Mix completed! ${data.hops} hops through TEE. Signature: ${data.signature.slice(0, 8)}...`
        );
        setRecipient('');
        setAmount('');
        setProgress({ current: 0, total: 0 });
      } else {
        toast.error(data.error || 'Mix failed');
      }
    } catch (error: any) {
      console.error('Mix error:', error);
      toast.error(error.message || 'Failed to execute mix');
    } finally {
      setMixing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Privacy Mixer</h2>
          <p className="text-sm text-gray-400 mt-1">
            Dual-layer privacy: ZK-SNARKs + TEE shuffling
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-gray-300">Enhanced Privacy</span>
        </div>
      </div>

      {/* How it Works */}
      <div className="p-6 bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/20 rounded-xl">
        <h3 className="text-lg font-semibold mb-4 text-purple-300">How Privacy Mixer Works</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-semibold">
              1
            </div>
            <div>
              <p className="font-medium text-gray-200">Privacy Cash Deposit</p>
              <p className="text-sm text-gray-400">
                Your SOL enters Privacy Cash pool using ZK-SNARKs (Groth16 proofs) to hide your
                identity
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-semibold">
              2
            </div>
            <div>
              <p className="font-medium text-gray-200">MagicBlock TEE Shuffling</p>
              <p className="text-sm text-gray-400">
                Funds hop through 3-5 ephemeral accounts inside Intel TDX secure enclaves (TEE),
                hiding the transaction path
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-semibold">
              3
            </div>
            <div>
              <p className="font-medium text-gray-200">Clean Withdrawal</p>
              <p className="text-sm text-gray-400">
                Recipient receives SOL with no on-chain link to sender. Complete privacy through
                dual-layer obfuscation.
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
            disabled={mixing}
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
            disabled={mixing}
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-400">Minimum: 0.01 SOL</p>
        </div>

        {/* Progress Bar */}
        {mixing && progress.total > 0 && (
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Mixing Progress</span>
              <span className="text-sm text-purple-400">
                {progress.current}/{progress.total} hops
              </span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Mix Button */}
        <button
          onClick={executeMix}
          disabled={!publicKey || mixing || !recipient || !amount}
          className={`w-full py-4 rounded-lg font-semibold transition-all ${
            mixing
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white cursor-wait'
              : !publicKey || !recipient || !amount
              ? 'bg-zinc-800 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-purple-500/50'
          }`}
        >
          {mixing ? (
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
              Mixing... {progress.current > 0 && `${progress.current}/${progress.total}`}
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
            <p className="text-xs text-gray-400">Intel TDX enclaves hide transaction path</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-green-500/5 to-emerald-500/5 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-sm font-medium text-gray-300">Ephemeral Rollups</span>
            </div>
            <p className="text-xs text-gray-400">Fast execution in secure environment</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-orange-500/5 to-red-500/5 border border-orange-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-orange-400 rounded-full" />
              <span className="text-sm font-medium text-gray-300">Multi-Hop</span>
            </div>
            <p className="text-xs text-gray-400">3-5 hops break transaction linkage</p>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-yellow-500">⚠️</span>
          <div className="text-sm space-y-1">
            <p className="font-medium text-yellow-300">Enhanced Privacy Mode</p>
            <p className="text-gray-400">
              Mixing takes longer (3-5 hops) but provides maximum privacy. Ensure you have enough
              SOL in your Privacy Cash account before mixing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

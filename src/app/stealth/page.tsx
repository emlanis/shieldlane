'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StealthTransfer } from '@/components/privacy/StealthTransfer';

export default function StealthPage() {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 p-8">
            <div className="text-6xl mb-4">👻</div>
            <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
            <p className="text-gray-400 max-w-md">
              Please connect your Solana wallet to use Stealth Mode transfers.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
              <span>👻</span>
              Stealth Mode Transfers
            </h1>
            <p className="text-gray-400">
              Send private transactions with advanced cryptographic protection.
            </p>
          </div>

          {/* Info Card */}
          <div className="p-6 bg-gradient-to-br from-purple-900/20 to-transparent border border-amber-500/30 rounded-xl mb-8">
            <h3 className="text-lg font-semibold mb-3 text-amber-400">Privacy Cash (ZK-SNARKs)</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">✓</span>
                <span>Sender identity hidden using Groth16 ZK proofs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">✓</span>
                <span>Amount and recipient remain visible on-chain</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">✓</span>
                <span>Fast transaction processing through privacy pool</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">✓</span>
                <span>Best for private withdrawals to exchanges or wallets</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-xs text-gray-400">
                <span className="font-semibold text-blue-300">Want maximum privacy?</span> Check out
                the <a href="/mixer" className="text-amber-400 hover:text-amber-300 underline">Privacy Mixer</a> which
                combines ZK-SNARKs with MagicBlock TEE for dual-layer protection.
              </p>
            </div>
          </div>

          {/* Transfer Component */}
          <StealthTransfer />

          {/* Security Notice */}
          <div className="mt-8 p-6 bg-zinc-950 border border-zinc-900 rounded-xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>🔐</span>
              Security & Privacy
            </h3>
            <div className="space-y-3 text-sm text-gray-400">
              <p>
                <span className="font-semibold text-gray-300">Privacy Cash:</span> Uses Groth16
                ZK-SNARKs to hide your identity while keeping amounts and recipients visible on-chain.
                Perfect for private withdrawals where you need sender anonymity.
              </p>
              <p>
                <span className="font-semibold text-gray-300">Privacy Mixer:</span> For maximum
                privacy, the Mixer combines Privacy Cash with MagicBlock's TEE (Trusted Execution
                Environment) for dual-layer protection. Visit the{' '}
                <a href="/mixer" className="text-amber-400 hover:text-amber-300 underline">
                  Mixer page
                </a>{' '}
                for transactions requiring complete anonymity.
              </p>
              <p>
                <span className="font-semibold text-gray-300">Non-Custodial:</span> Your keys, your
                crypto. Shieldlane never holds your funds - you always maintain control.
              </p>
              <p className="pt-3 border-t border-zinc-900 text-xs text-gray-400">
                Note: Shieldlane is currently deployed on Solana devnet for testing purposes. Always verify
                transaction details before confirming.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

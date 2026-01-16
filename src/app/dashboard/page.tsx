'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PrivateBalance } from '@/components/privacy/PrivateBalance';
import { PrivacyScore } from '@/components/privacy/PrivacyScore';
import Link from 'next/link';

export default function DashboardPage() {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 p-8">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
            <p className="text-zinc-400 max-w-md">
              Please connect your Solana wallet to access your privacy dashboard.
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
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Privacy Dashboard</h1>
            <p className="text-zinc-400">
              Monitor your privacy status and manage your protected assets.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Link
              href="/stealth"
              className="p-6 bg-gradient-to-br from-purple-900/20 to-transparent border border-purple-500/30 rounded-xl hover:border-purple-500/50 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-xl">👻</span>
                </div>
                <h3 className="text-lg font-semibold">Stealth Mode</h3>
              </div>
              <p className="text-sm text-zinc-400 mb-3">
                Send private transactions with hidden sender identity
              </p>
              <div className="text-sm text-purple-400 font-medium">
                Make Transfer →
              </div>
            </Link>

            <Link
              href="/monitor"
              className="p-6 bg-gradient-to-br from-blue-900/20 to-transparent border border-blue-500/30 rounded-xl hover:border-blue-500/50 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold">Monitor</h3>
              </div>
              <p className="text-sm text-zinc-400 mb-3">
                See what surveillance tools can detect about you
              </p>
              <div className="text-sm text-blue-400 font-medium">
                View Analysis →
              </div>
            </Link>

            <Link
              href="/learn"
              className="p-6 bg-gradient-to-br from-green-900/20 to-transparent border border-green-500/30 rounded-xl hover:border-green-500/50 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-xl">📚</span>
                </div>
                <h3 className="text-lg font-semibold">Learn</h3>
              </div>
              <p className="text-sm text-zinc-400 mb-3">
                Understand wallet surveillance and privacy
              </p>
              <div className="text-sm text-green-400 font-medium">
                Explore Guides →
              </div>
            </Link>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Balance */}
            <div className="lg:col-span-2">
              <PrivateBalance />
            </div>

            {/* Right Column - Privacy Score */}
            <div className="lg:col-span-1">
              <PrivacyScore />
            </div>
          </div>

          {/* Info Banner */}
          <div className="mt-8 p-6 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-purple-900/20 border border-purple-500/30 rounded-xl">
            <div className="flex items-start gap-4">
              <span className="text-3xl">🛡️</span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">How Shieldlane Protects You</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-zinc-300">
                  <div>
                    <span className="font-semibold text-purple-400">Privacy Cash:</span> Uses ZK-SNARKs to
                    break the link between deposits and withdrawals in privacy pools.
                  </div>
                  <div>
                    <span className="font-semibold text-blue-400">ShadowWire:</span> Employs Bulletproofs
                    and ElGamal encryption to hide transaction amounts and participants.
                  </div>
                  <div>
                    <span className="font-semibold text-green-400">Helius RPC:</span> Enterprise-grade
                    Solana infrastructure for reliable blockchain access.
                  </div>
                  <div>
                    <span className="font-semibold text-orange-400">On-Chain:</span> All privacy
                    operations are verified on Solana devnet. Trustless and transparent.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

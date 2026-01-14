'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SurveillanceView } from '@/components/surveillance/SurveillanceView';
import { PrivacyScore } from '@/components/privacy/PrivacyScore';

export default function MonitorPage() {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 p-8">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
            <p className="text-zinc-400 max-w-md">
              Please connect your Solana wallet to view your surveillance analysis.
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
              <span>📊</span>
              Privacy Monitor
            </h1>
            <p className="text-zinc-400">
              Understand what surveillance tools can see about your wallet activity.
            </p>
          </div>

          {/* Warning Banner */}
          <div className="mb-8 p-6 bg-gradient-to-r from-orange-900/20 to-transparent border border-orange-500/30 rounded-xl">
            <div className="flex items-start gap-4">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="text-lg font-semibold text-orange-400 mb-2">
                  Why Privacy Matters for Whales
                </h3>
                <p className="text-sm text-zinc-300 mb-3">
                  High-value wallets face unique risks when their activity is publicly visible:
                </p>
                <div className="grid md:grid-cols-2 gap-3 text-sm text-zinc-400">
                  <div className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>Front-running: Traders can see and exploit your pending transactions</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>MEV extraction: Bots can sandwich your trades for profit</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>Wallet clustering: Your addresses can be linked together</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>Pattern analysis: Trading strategies can be reverse-engineered</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Surveillance Analysis */}
            <div className="lg:col-span-2">
              <SurveillanceView />
            </div>

            {/* Right Column - Privacy Score */}
            <div className="lg:col-span-1">
              <PrivacyScore />
            </div>
          </div>

          {/* How Tracking Works */}
          <div className="mt-8 p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">How Wallet Surveillance Works</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-xl">🔍</span>
                </div>
                <h4 className="font-semibold text-sm">Transaction Graph Analysis</h4>
                <p className="text-xs text-zinc-400">
                  Surveillance tools build graphs of all wallet interactions, tracking money flow across
                  the entire blockchain.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-xl">🔗</span>
                </div>
                <h4 className="font-semibold text-sm">Address Clustering</h4>
                <p className="text-xs text-zinc-400">
                  Common-input-ownership heuristics and other techniques link your different addresses,
                  revealing your total holdings.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-xl">📈</span>
                </div>
                <h4 className="font-semibold text-sm">Pattern Recognition</h4>
                <p className="text-xs text-zinc-400">
                  ML algorithms detect trading patterns, timing behaviors, and counterparty relationships
                  to profile your activity.
                </p>
              </div>
            </div>
          </div>

          {/* Commercial Surveillance */}
          <div className="mt-6 p-6 bg-gradient-to-br from-purple-900/20 to-transparent border border-purple-500/30 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Commercial Surveillance Platforms</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Multiple companies provide blockchain surveillance services to exchanges, regulators, and
              traders:
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-zinc-900/50 rounded-lg">
                <h4 className="font-semibold text-zinc-300 mb-2">Block Explorers</h4>
                <p className="text-xs text-zinc-500">
                  Solscan, Solana Explorer, and others make all transaction data easily searchable and
                  linkable.
                </p>
              </div>
              <div className="p-4 bg-zinc-900/50 rounded-lg">
                <h4 className="font-semibold text-zinc-300 mb-2">Analytics Platforms</h4>
                <p className="text-xs text-zinc-500">
                  Commercial tools track whale wallets, alert on large transfers, and analyze trading
                  behavior.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

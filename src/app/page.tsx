'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ConnectWalletButton } from '@/components/wallet/ConnectWalletButton';

export default function Home() {

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-transparent to-yellow-900/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.05),transparent_50%)]" />

          <div className="container mx-auto px-4 py-24 md:py-32 relative">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400/10 border border-amber-500/20 rounded-full">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                <span className="text-sm text-amber-300 font-medium">Built for Privacy Hack 2026</span>
              </div>

              {/* Main heading */}
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
                  Your transactions.
                </span>
                <br />
                <span className="text-white">Your business.</span>
                <br />
                <span className="bg-gradient-to-r from-yellow-400 to-amber-300 bg-clip-text text-transparent">
                  Your Shieldlane.
                </span>
              </h1>

              {/* Description */}
              <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
                A privacy-preserving wallet wrapper for high-value Solana users. Shield your transaction history and balances with zero-knowledge proofs.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <ConnectWalletButton
                  connectedText="Go to Dashboard"
                  connectedHref="/dashboard"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black rounded-lg font-semibold transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-amber-500/25"
                >
                  Connect Wallet to Start
                </ConnectWalletButton>
                <Link
                  href="/learn"
                  className="w-full sm:w-auto px-8 py-4 bg-zinc-950 hover:bg-zinc-900 border border-amber-500/30 hover:border-amber-500/50 rounded-lg font-medium text-white transition-all"
                >
                  Learn More
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12">
                {[
                  { label: 'ZK-SNARK Proofs', value: 'Privacy Cash' },
                  { label: 'Bulletproofs', value: 'ShadowWire' },
                  { label: 'Network', value: 'Solana Devnet' },
                  { label: 'Open Source', value: 'GitHub' },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-lg font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-black/50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
                Privacy-First Features
              </h2>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl hover:border-amber-500/50 transition-all group">
                  <div className="w-12 h-12 bg-amber-400/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Private Balance Viewing</h3>
                  <p className="text-gray-400">
                    Compare what surveillance tools see versus your actual balance. Shield your holdings in privacy pools.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl hover:border-yellow-500/50 transition-all group">
                  <div className="w-12 h-12 bg-yellow-400/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">👻</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Stealth Mode Transfers</h3>
                  <p className="text-gray-400">
                    Two privacy modes: External (sender hidden) or Internal (everything hidden) using Bulletproofs.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl hover:border-green-500/50 transition-all group">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Surveillance Monitor</h3>
                  <p className="text-gray-400">
                    See what trackers can detect. Get privacy score and recommendations to improve your privacy posture.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold">
                Built with Cutting-Edge Privacy Technology
              </h2>
              <p className="text-xl text-gray-400">
                Shieldlane combines multiple cryptographic primitives to provide military-grade privacy for your Solana transactions.
              </p>

              <div className="grid md:grid-cols-2 gap-6 pt-8">
                <div className="p-6 bg-gradient-to-br from-purple-900/20 to-transparent border border-amber-500/20 rounded-xl">
                  <h3 className="text-lg font-semibold mb-2">Privacy Cash SDK</h3>
                  <p className="text-gray-400 text-sm">
                    ZK-SNARK powered privacy pools that break the link between deposits and withdrawals.
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-blue-900/20 to-transparent border border-yellow-500/20 rounded-xl">
                  <h3 className="text-lg font-semibold mb-2">ShadowWire/ShadowPay</h3>
                  <p className="text-gray-400 text-sm">
                    Bulletproofs and ElGamal encryption for hiding transaction amounts and participants.
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-green-900/20 to-transparent border border-green-500/20 rounded-xl">
                  <h3 className="text-lg font-semibold mb-2">Helius RPC</h3>
                  <p className="text-gray-400 text-sm">
                    Enterprise-grade Solana RPC infrastructure for reliable and fast blockchain access.
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-orange-900/20 to-transparent border border-orange-500/20 rounded-xl">
                  <h3 className="text-lg font-semibold mb-2">On-Chain Verification</h3>
                  <p className="text-gray-400 text-sm">
                    All privacy operations are verified on Solana blockchain. Trustless and transparent.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold">
                Ready to Shield Your Privacy?
              </h2>
              <p className="text-xl text-gray-400">
                Connect your wallet and start protecting your transaction history today.
              </p>
              <ConnectWalletButton
                connectedText="Open Dashboard"
                connectedHref="/dashboard"
                className="inline-block px-8 py-4 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-purple-700 hover:to-blue-700 rounded-lg font-medium text-lg transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-amber-500/25"
              >
                Connect Wallet
              </ConnectWalletButton>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

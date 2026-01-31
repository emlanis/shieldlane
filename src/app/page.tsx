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
                Privacy-preserving wallet wrapper for Solana. Dual-layer protection combining zero-knowledge proofs and trusted execution environments.
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
                  { label: 'TEE Privacy', value: 'MagicBlock' },
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

              <div className="grid md:grid-cols-4 gap-6">
                {/* Feature 1 */}
                <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl hover:border-amber-500/50 transition-all group">
                  <div className="w-12 h-12 bg-amber-400/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Privacy Cash</h3>
                  <p className="text-sm text-gray-400">
                    Shield your holdings in ZK-SNARK privacy pools. Compare public vs. private balances.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl hover:border-purple-500/50 transition-all group">
                  <div className="w-12 h-12 bg-purple-400/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">👻</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Stealth Mode</h3>
                  <p className="text-sm text-gray-400">
                    Hide sender identity with Groth16 ZK proofs. Fast privacy for everyday transfers.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl hover:border-yellow-500/50 transition-all group">
                  <div className="w-12 h-12 bg-yellow-400/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">🔀</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Mixer</h3>
                  <p className="text-sm text-gray-400">
                    Maximum privacy with MagicBlock TEE. Complete transaction confidentiality.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl hover:border-blue-500/50 transition-all group">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Monitor</h3>
                  <p className="text-sm text-gray-400">
                    View your privacy score and see what surveillance tools can detect about you.
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
                Two Privacy Layers. One Shield.
              </h2>
              <p className="text-xl text-gray-400">
                Shieldlane combines zero-knowledge proofs and trusted execution environments for comprehensive transaction privacy on Solana.
              </p>

              <div className="grid md:grid-cols-2 gap-6 pt-8">
                <div className="p-6 bg-gradient-to-br from-purple-900/20 to-transparent border border-amber-500/20 rounded-xl">
                  <h3 className="text-lg font-semibold mb-2">Light Protocol (Layer 1)</h3>
                  <p className="text-gray-400 text-sm">
                    Groth16 ZK-SNARKs hide sender identity through compressed Merkle trees. Privacy Cash deposits break wallet linkage.
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-blue-900/20 to-transparent border border-yellow-500/20 rounded-xl">
                  <h3 className="text-lg font-semibold mb-2">MagicBlock TEE (Layer 2)</h3>
                  <p className="text-gray-400 text-sm">
                    Intel TDX-based trusted execution for complete privacy. Account delegation ensures hardware-verified confidentiality.
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-green-900/20 to-transparent border border-green-500/20 rounded-xl">
                  <h3 className="text-lg font-semibold mb-2">Non-Custodial</h3>
                  <p className="text-gray-400 text-sm">
                    Your keys, your crypto. All privacy operations execute on-chain with cryptographic verification. No trust required.
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-orange-900/20 to-transparent border border-orange-500/20 rounded-xl">
                  <h3 className="text-lg font-semibold mb-2">Helius RPC</h3>
                  <p className="text-gray-400 text-sm">
                    Enterprise-grade Solana RPC infrastructure. Fast finality, reliable data feeds, optimized for high-performance privacy operations.
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

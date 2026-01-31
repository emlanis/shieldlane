'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useState } from 'react';

export default function LearnPage() {
  const [activeSection, setActiveSection] = useState('basics');

  const sections = [
    {
      id: 'basics',
      title: 'Privacy Basics',
      icon: '📚',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-4">Why Privacy Matters on Blockchain</h3>
            <p className="text-gray-400 mb-4">
              While blockchain transparency is important for verification, complete visibility of all
              transactions creates serious risks for users:
            </p>
            <div className="grid gap-4">
              <div className="p-4 bg-zinc-950 rounded-lg">
                <h4 className="font-semibold text-amber-400 mb-2">🎯 Front-Running</h4>
                <p className="text-sm text-gray-400">
                  When your transactions are visible in the mempool, sophisticated traders can see your
                  pending trades and front-run them, extracting value at your expense.
                </p>
              </div>
              <div className="p-4 bg-zinc-950 rounded-lg">
                <h4 className="font-semibold text-yellow-400 mb-2">💰 Wealth Exposure</h4>
                <p className="text-sm text-gray-400">
                  Your total holdings become public knowledge, making you a target for scams, phishing,
                  and potentially physical security risks if holdings are substantial.
                </p>
              </div>
              <div className="p-4 bg-zinc-950 rounded-lg">
                <h4 className="font-semibold text-green-400 mb-2">📊 Strategy Leakage</h4>
                <p className="text-sm text-gray-400">
                  Your trading patterns, DeFi strategies, and portfolio allocations are all visible,
                  allowing others to copy or counter your moves.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-purple-900/20 to-transparent border border-amber-500/30 rounded-xl">
            <h4 className="font-semibold mb-3">💡 Key Insight</h4>
            <p className="text-sm text-gray-300">
              Privacy on blockchain isn't about hiding illegal activity - it's about protecting yourself
              from predatory actors who can exploit your visible transactions and holdings.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'surveillance',
      title: 'Surveillance Methods',
      icon: '👁️',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-4">How Wallet Surveillance Works</h3>
            <p className="text-gray-400 mb-6">
              Multiple sophisticated techniques are used to track and analyze blockchain users:
            </p>

            <div className="space-y-6">
              <div className="p-6 bg-zinc-950 rounded-xl">
                <h4 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <span>🔍</span>
                  Transaction Graph Analysis
                </h4>
                <p className="text-sm text-gray-400 mb-4">
                  Every transaction creates links between addresses. By analyzing these connections,
                  surveillance tools build comprehensive maps of fund flows.
                </p>
                <div className="p-4 bg-black rounded-lg">
                  <pre className="text-xs text-gray-400 overflow-x-auto">
                    {`Wallet A --> Wallet B --> Wallet C
                    ↓
                 Exchange
                    ↓
                [Identity Revealed]`}
                  </pre>
                </div>
              </div>

              <div className="p-6 bg-zinc-950 rounded-xl">
                <h4 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                  <span>🔗</span>
                  Address Clustering
                </h4>
                <p className="text-sm text-gray-400 mb-4">
                  Heuristics link multiple addresses to the same owner:
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>
                      <strong className="text-gray-300">Common Input Ownership:</strong> Multiple inputs in
                      same transaction likely owned by same person
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>
                      <strong className="text-gray-300">Change Address Detection:</strong> Identifying
                      change outputs to link addresses
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>
                      <strong className="text-gray-300">Timing Analysis:</strong> Correlated transaction
                      timing suggests common ownership
                    </span>
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-zinc-950 rounded-xl">
                <h4 className="font-semibold text-orange-400 mb-3 flex items-center gap-2">
                  <span>📈</span>
                  Machine Learning & Pattern Recognition
                </h4>
                <p className="text-sm text-gray-400 mb-4">
                  Advanced algorithms detect patterns in your on-chain behavior:
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-black rounded">
                    <strong className="text-gray-300">Trading Patterns:</strong>
                    <p className="text-gray-400 text-xs mt-1">
                      Entry/exit timing, position sizing, preferred DEXs
                    </p>
                  </div>
                  <div className="p-3 bg-black rounded">
                    <strong className="text-gray-300">Behavioral Fingerprints:</strong>
                    <p className="text-gray-400 text-xs mt-1">
                      Gas price preferences, transaction batching habits
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'technology',
      title: 'Privacy Technology',
      icon: '🔐',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-4">How Shieldlane Protects You</h3>
            <p className="text-gray-400 mb-6">
              Shieldlane uses multiple cutting-edge cryptographic techniques to preserve your privacy:
            </p>

            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-br from-purple-900/20 to-transparent border border-amber-500/30 rounded-xl">
                <h4 className="font-semibold text-amber-400 mb-3 text-lg flex items-center gap-2">
                  <span>🔮</span>
                  Layer 1: ZK-SNARKs (Privacy Cash)
                </h4>
                <p className="text-sm text-gray-400 mb-4">
                  Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge (Groth16) hide your
                  sender identity while keeping amounts and recipients visible. Used in Stealth Mode.
                </p>
                <div className="p-4 bg-zinc-950 rounded-lg space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-amber-500 mt-1">✓</span>
                    <div>
                      <strong className="text-sm text-gray-300">Deposit to Privacy Cash:</strong>
                      <p className="text-xs text-gray-400 mt-1">
                        Your deposit generates a cryptographic commitment added to a Merkle tree (Light
                        Protocol). This breaks the link to your wallet.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-amber-500 mt-1">✓</span>
                    <div>
                      <strong className="text-sm text-gray-300">Stealth Transfer:</strong>
                      <p className="text-xs text-gray-400 mt-1">
                        You prove ownership of a commitment without revealing which one, hiding your
                        identity. Amount and recipient are visible for compliance.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-purple-500 mt-1">ℹ️</span>
                    <div>
                      <strong className="text-sm text-gray-300">Privacy Level:</strong>
                      <p className="text-xs text-gray-400 mt-1">
                        Sender hidden, amount/recipient visible. Great for private withdrawals to
                        exchanges or wallets.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-blue-900/20 to-transparent border border-yellow-500/30 rounded-xl">
                <h4 className="font-semibold text-yellow-400 mb-3 text-lg flex items-center gap-2">
                  <span>🎯</span>
                  Layer 2: TEE (Trusted Execution Environment)
                </h4>
                <p className="text-sm text-gray-400 mb-4">
                  Hardware-based secure enclaves (Intel TDX via MagicBlock) add an untraceable layer on
                  top of Privacy Cash. Used in the Mixer for maximum privacy.
                </p>
                <div className="p-4 bg-zinc-950 rounded-lg space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-yellow-500 mt-1">✓</span>
                    <div>
                      <strong className="text-sm text-gray-300">TEE Delegation:</strong>
                      <p className="text-xs text-gray-400 mt-1">
                        Your Privacy Cash account is delegated to MagicBlock's TEE for confidential
                        execution. Only the TEE can see transaction details.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-yellow-500 mt-1">✓</span>
                    <div>
                      <strong className="text-sm text-gray-300">Privacy Mixer:</strong>
                      <p className="text-xs text-gray-400 mt-1">
                        Combines Privacy Cash (ZK sender anonymity) with TEE delegation for complete
                        transaction privacy and pattern obfuscation.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1">ℹ️</span>
                    <div>
                      <strong className="text-sm text-gray-300">Privacy Level:</strong>
                      <p className="text-xs text-gray-400 mt-1">
                        Maximum privacy - sender, amount, recipient, and patterns all hidden. Hardware
                        attestation proves correct execution.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-zinc-950 rounded-xl">
                <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <span>🔒</span>
                  Light Protocol (ZK Compression)
                </h4>
                <p className="text-sm text-gray-400 mb-3">
                  Privacy Cash is built on Light Protocol's compressed Merkle trees using Groth16 ZK
                  proofs. Your deposits generate commitments stored on-chain, and withdrawals prove
                  ownership without revealing which commitment.
                </p>
                <p className="text-xs text-gray-400">
                  This creates a privacy pool where withdrawal origin is mathematically hidden - the
                  larger the pool, the stronger your anonymity set.
                </p>
              </div>

              <div className="p-6 bg-zinc-950 rounded-xl">
                <h4 className="font-semibold text-orange-400 mb-3 flex items-center gap-2">
                  <span>🔐</span>
                  MagicBlock TEE Infrastructure
                </h4>
                <p className="text-sm text-gray-400 mb-3">
                  MagicBlock provides Intel TDX-based Trusted Execution Environments on Solana. The
                  Mixer delegates your Privacy Cash account to a TEE, where transactions execute in
                  complete isolation.
                </p>
                <p className="text-xs text-gray-400">
                  Hardware attestation proves the TEE is running correct code, and the enclave ensures
                  even the cloud provider can't see your transaction details.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-purple-900/20 border border-amber-500/30 rounded-xl">
            <h4 className="font-semibold mb-3">🎓 Dual-Layer Privacy Architecture</h4>
            <p className="text-sm text-gray-300 mb-3">
              Shieldlane offers two complementary privacy layers you can use separately or together:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span className="text-gray-300">
                  <strong>Privacy Cash (Layer 1):</strong> ZK-SNARKs hide sender identity. Fast,
                  efficient, great for most use cases.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span className="text-gray-300">
                  <strong>Mixer (Layer 1 + 2):</strong> Combines Privacy Cash with MagicBlock TEE for
                  maximum privacy. Hardware-guaranteed confidentiality.
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Both layers are non-custodial, trustless, and verifiable on-chain. You maintain full
              control of your funds at all times.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'best-practices',
      title: 'Best Practices',
      icon: '✨',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-4">Privacy Best Practices</h3>

            <div className="space-y-6">
              <div className="p-6 bg-zinc-950 rounded-xl">
                <h4 className="font-semibold text-amber-400 mb-4">For High-Value Wallets (Whales)</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-amber-500 mt-1">1.</span>
                    <div>
                      <strong className="text-sm text-gray-300">Separate Public and Private Wallets</strong>
                      <p className="text-xs text-gray-400 mt-1">
                        Use one wallet for public interactions, another for private holdings. Never link
                        them on-chain.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-amber-500 mt-1">2.</span>
                    <div>
                      <strong className="text-sm text-gray-300">
                        Shield Before Large Transactions
                      </strong>
                      <p className="text-xs text-gray-400 mt-1">
                        Deposit to Privacy Cash before making significant moves. Break the link between
                        your source wallet and the transaction.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-amber-500 mt-1">3.</span>
                    <div>
                      <strong className="text-sm text-gray-300">
                        Choose the Right Privacy Level
                      </strong>
                      <p className="text-xs text-gray-400 mt-1">
                        Use <strong>Stealth Mode</strong> (Privacy Cash ZK) for everyday private
                        transfers. Use <strong>Mixer</strong> (Privacy Cash + MagicBlock TEE) for
                        maximum privacy when complete anonymity is critical.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-amber-500 mt-1">4.</span>
                    <div>
                      <strong className="text-sm text-gray-300">Grow Your Anonymity Set</strong>
                      <p className="text-xs text-gray-400 mt-1">
                        Don't withdraw immediately after depositing to Privacy Cash. Wait for more
                        deposits from others to increase your anonymity set - making your withdrawal
                        indistinguishable from hundreds of others.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-amber-500 mt-1">5.</span>
                    <div>
                      <strong className="text-sm text-gray-300">
                        Make Privacy the Default
                      </strong>
                      <p className="text-xs text-gray-400 mt-1">
                        Regular use of privacy features benefits everyone by making the privacy pool
                        larger and more diverse. Your privacy helps others, and their privacy helps you.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-zinc-950 rounded-xl">
                <h4 className="font-semibold text-yellow-400 mb-4">For DAOs and Organizations</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-yellow-500 mt-1">1.</span>
                    <div>
                      <strong className="text-sm text-gray-300">Protect Treasury Operations</strong>
                      <p className="text-xs text-gray-400 mt-1">
                        Use Shieldlane for treasury management to prevent front-running and strategic
                        position exposure.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-yellow-500 mt-1">2.</span>
                    <div>
                      <strong className="text-sm text-gray-300">Private Payroll</strong>
                      <p className="text-xs text-gray-400 mt-1">
                        Pay contributors through private channels to protect their financial privacy.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-yellow-500 mt-1">3.</span>
                    <div>
                      <strong className="text-sm text-gray-300">Strategic Acquisitions</strong>
                      <p className="text-xs text-gray-400 mt-1">
                        Hide token acquisition strategies to prevent price manipulation by MEV bots.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-green-900/20 to-transparent border border-green-500/30 rounded-xl">
                <h4 className="font-semibold text-green-400 mb-3">Remember</h4>
                <p className="text-sm text-gray-300">
                  Privacy is not about hiding illegal activity - it's about protecting yourself from
                  surveillance, exploitation, and security threats that come with visible wealth and
                  transactions.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const activeContent = sections.find((s) => s.id === activeSection);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
              <span>📚</span>
              Learn About Privacy
            </h1>
            <p className="text-gray-400">
              Understanding wallet surveillance and how to protect yourself.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                        : 'bg-zinc-950 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{section.icon}</span>
                      <span className="font-medium">{section.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="p-8 bg-zinc-950 border border-zinc-900 rounded-xl">
                {activeContent?.content}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

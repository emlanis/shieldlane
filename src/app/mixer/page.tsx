import { PrivacyMixer } from '@/components/privacy/PrivacyMixer';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function MixerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
              Privacy Mixer
            </h1>
            <p className="text-lg text-gray-400">
              Enhanced privacy through dual-layer protection: ZK-SNARKs + MagicBlock TEE
            </p>
          </div>

          {/* Mixer Component */}
          <PrivacyMixer />

          {/* Technical Details */}
          <div className="mt-12 p-6 bg-zinc-950/50 border border-zinc-900 rounded-xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>🔐</span>
              Technical Architecture
            </h3>
            <div className="space-y-4 text-sm text-gray-400">
              <div>
                <h4 className="font-semibold text-gray-300 mb-2">Layer 1: Privacy Cash (ZK-SNARKs)</h4>
                <p>
                  Uses Groth16 zero-knowledge proofs to hide sender identity. When you deposit SOL
                  into Privacy Cash, your identity is cryptographically hidden through ZK-SNARKs.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-300 mb-2">
                  Layer 2: MagicBlock TEE (Ephemeral Rollups)
                </h4>
                <p>
                  Your funds hop through 3-5 ephemeral accounts inside Intel TDX Trusted Execution
                  Environments (secure enclaves). These hops execute privately in TEE, hiding the
                  transaction path and timing.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-300 mb-2">Complete Privacy</h4>
                <p>
                  The combination breaks on-chain linkage: Privacy Cash hides WHO sent the funds,
                  MagicBlock TEE hides HOW the funds moved. The recipient receives clean SOL with no
                  traceable connection to the sender.
                </p>
              </div>
              <div className="pt-3 border-t border-zinc-900">
                <p className="text-xs">
                  <span className="font-semibold text-gray-300">Security:</span> Intel TDX provides
                  hardware-level attestation. MagicBlock validators run in isolated secure enclaves
                  that cannot be accessed or tampered with, even by the validator operators.
                </p>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="mt-8 p-6 bg-zinc-950/50 border border-zinc-900 rounded-xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>💡</span>
              When to Use Privacy Mixer
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-500">✓</span>
                  <span className="font-medium text-gray-300">Maximum Privacy Needed</span>
                </div>
                <p className="text-gray-400">
                  When you need the strongest privacy guarantees for sensitive transactions
                </p>
              </div>
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-500">✓</span>
                  <span className="font-medium text-gray-300">Break Transaction Linkage</span>
                </div>
                <p className="text-gray-400">
                  Remove all on-chain connections between sender and recipient addresses
                </p>
              </div>
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-500">✓</span>
                  <span className="font-medium text-gray-300">Protection from Analysis</span>
                </div>
                <p className="text-gray-400">
                  Defeat chain analysis tools through multi-hop obfuscation
                </p>
              </div>
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-500">✓</span>
                  <span className="font-medium text-gray-300">Financial Privacy</span>
                </div>
                <p className="text-gray-400">
                  Protect your financial activity from public blockchain surveillance
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

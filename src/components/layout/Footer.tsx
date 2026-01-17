'use client';

import { FC } from 'react';
import Link from 'next/link';

export const Footer: FC = () => {
  return (
    <footer className="w-full border-t border-zinc-800 bg-zinc-950/50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
                <span className="text-lg font-bold">🛡️</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Shieldlane
              </span>
            </div>
            <p className="text-sm text-zinc-400 max-w-xs">
              Your transactions. Your business. Your Shieldlane.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/stealth" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
                  Stealth Mode
                </Link>
              </li>
              <li>
                <Link href="/monitor" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
                  Privacy Monitor
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/learn" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
                  Learn
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/emlanis/shieldlane"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/emlanis/shieldlane"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Technology */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">Built With</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com/Lightprotocol/light-protocol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-zinc-400 hover:text-purple-400 transition-colors"
                >
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                  Privacy Cash SDK
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/elusiv-privacy/elusiv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-zinc-400 hover:text-blue-400 transition-colors"
                >
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  ShadowWire/ShadowPay
                </a>
              </li>
              <li>
                <a
                  href="https://www.helius.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-zinc-400 hover:text-green-400 transition-colors"
                >
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Helius RPC
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-500">
            Built for Privacy Hack 2026 • Deployed on Solana Devnet
          </p>
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <span>ZK-SNARKs</span>
            <span>•</span>
            <span>Bulletproofs</span>
            <span>•</span>
            <span>Open Source</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

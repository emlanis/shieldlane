'use client';

import { FC } from 'react';
import Link from 'next/link';
import { WalletConnect } from '@/components/wallet/WalletConnect';

export const Header: FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg group-hover:scale-110 transition-transform">
            <span className="text-lg font-bold">🛡️</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Shieldlane
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/stealth"
            className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Stealth Mode
          </Link>
          <Link
            href="/monitor"
            className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Monitor
          </Link>
          <Link
            href="/learn"
            className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Learn
          </Link>
        </nav>

        {/* Wallet Connection */}
        <WalletConnect />
      </div>
    </header>
  );
};

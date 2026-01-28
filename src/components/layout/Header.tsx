'use client';

import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { WalletConnect } from '@/components/wallet/WalletConnect';

export const Header: FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-900 bg-black/90 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 group-hover:scale-110 transition-transform">
            <Image
              src="/logo.png"
              alt="Shieldlane"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
            Shieldlane
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-sm text-gray-400 hover:text-amber-400 transition-colors font-medium"
          >
            Dashboard
          </Link>
          <Link
            href="/stealth"
            className="text-sm text-gray-400 hover:text-amber-400 transition-colors font-medium"
          >
            Stealth Mode
          </Link>
          <Link
            href="/monitor"
            className="text-sm text-gray-400 hover:text-amber-400 transition-colors font-medium"
          >
            Monitor
          </Link>
          <Link
            href="/learn"
            className="text-sm text-gray-400 hover:text-amber-400 transition-colors font-medium"
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

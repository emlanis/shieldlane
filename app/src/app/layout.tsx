import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shieldlane - Privacy-Preserving Wallet for Solana",
  description: "Your transactions. Your business. Your Shieldlane. A privacy-preserving wallet wrapper for high-value Solana users.",
  keywords: ["Solana", "Privacy", "Wallet", "ZK-SNARK", "Bulletproofs", "DeFi"],
  authors: [{ name: "Shieldlane Team" }],
  openGraph: {
    title: "Shieldlane - Privacy-Preserving Wallet for Solana",
    description: "Your transactions. Your business. Your Shieldlane.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-50`}
      >
        <WalletProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#18181b',
                color: '#fafafa',
                border: '1px solid #27272a',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fafafa',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fafafa',
                },
              },
            }}
          />
        </WalletProvider>
      </body>
    </html>
  );
}

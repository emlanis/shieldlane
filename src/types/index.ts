import { PublicKey } from '@solana/web3.js';

// Privacy Mode Types
export type PrivacyMode = 'external' | 'internal';

export interface PrivateBalance {
  publicBalance: number;
  privateBalance: number;
  privacyCashBalance: number;
  totalBalance: number;
}

export interface PrivacyScore {
  score: number; // 0-100
  exposedDataPoints: string[];
  protectedDataPoints: string[];
  recommendations: string[];
}

// Transaction Types
export interface StealthTransfer {
  recipient: string;
  amount: number;
  mode: PrivacyMode;
  memo?: string;
}

export interface TransactionHistory {
  signature: string;
  timestamp: number;
  type: 'deposit' | 'withdraw' | 'transfer';
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  isPrivate: boolean;
}

// Surveillance Types
export interface SurveillanceData {
  walletAddress: string;
  exposedTransactions: number;
  protectedTransactions: number;
  balanceExposed: boolean;
  trackingRisk: 'low' | 'medium' | 'high';
  recommendations: string[];
}

// Privacy Cash Types
export interface PrivacyCashDeposit {
  amount: number;
  commitment?: string;
  nullifier?: string;
}

export interface PrivacyCashWithdraw {
  amount: number;
  recipient: PublicKey;
  proof?: any;
}

// UI State Types
export interface PrivacyState {
  isPrivacyEnabled: boolean;
  currentMode: PrivacyMode;
  showPublicView: boolean;
  privacyScore: PrivacyScore | null;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Educational Content Types
export interface EducationalSection {
  id: string;
  title: string;
  description: string;
  content: string;
  imageUrl?: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
}

// Wallet Types
export interface WalletInfo {
  address: string;
  balance: number;
  connected: boolean;
  network: string;
}

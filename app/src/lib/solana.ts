import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';

// Get Helius RPC endpoint or fallback to public endpoint
export const getConnection = (): Connection => {
  const heliusApiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';

  let endpoint: string;

  if (heliusApiKey && heliusApiKey !== '') {
    endpoint = `https://rpc.helius.xyz/?api-key=${heliusApiKey}`;
  } else {
    // Fallback to public RPC
    endpoint = clusterApiUrl(network as 'devnet' | 'testnet' | 'mainnet-beta');
  }

  return new Connection(endpoint, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000,
  });
};

// Initialize connection singleton
export const connection = getConnection();

// Utility functions
export const lamportsToSol = (lamports: number): number => {
  return lamports / LAMPORTS_PER_SOL;
};

export const solToLamports = (sol: number): number => {
  return Math.floor(sol * LAMPORTS_PER_SOL);
};

export const getBalance = async (publicKey: PublicKey): Promise<number> => {
  try {
    const balance = await connection.getBalance(publicKey);
    return lamportsToSol(balance);
  } catch (error) {
    console.error('Error fetching balance:', error);
    return 0;
  }
};

export const shortenAddress = (address: string, chars = 4): string => {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export const isValidPublicKey = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

// Format SOL amount with proper decimals
export const formatSol = (amount: number, decimals = 4): string => {
  return amount.toFixed(decimals);
};

// Get transaction explorer URL
export const getExplorerUrl = (signature: string, cluster?: string): string => {
  const network = cluster || process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
  const clusterParam = network !== 'mainnet-beta' ? `?cluster=${network}` : '';
  return `https://explorer.solana.com/tx/${signature}${clusterParam}`;
};

// Get address explorer URL
export const getAddressExplorerUrl = (address: string, cluster?: string): string => {
  const network = cluster || process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
  const clusterParam = network !== 'mainnet-beta' ? `?cluster=${network}` : '';
  return `https://explorer.solana.com/address/${address}${clusterParam}`;
};

// Constants
export const PRIVACY_CASH_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PRIVACY_CASH_PROGRAM_ID || '9fhQBbumKEFuXtMBDw8AaQyAjCorLGJQiS3skWZdQyQD'
);

export const MIN_SOL_BALANCE = 0.01; // Minimum SOL to keep for rent
export const DEFAULT_TRANSFER_AMOUNT = 0.1; // Default transfer amount in SOL

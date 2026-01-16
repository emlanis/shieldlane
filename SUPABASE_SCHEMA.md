# Supabase Database Schema for Privacy Cash

## Overview

This database stores encrypted Privacy Cash account data for Shieldlane users. Each user has a server-generated keypair stored encrypted, which is used to manage their private balance pool.

## Security Model

1. **Encrypted Keypairs**: Private keys are encrypted with AES-256-GCM using a key derived from user wallet signatures
2. **User Authorization**: All operations require a valid Solana wallet signature to prove ownership
3. **No Direct Key Access**: Private keys are never exposed to the client - only used server-side for transactions
4. **Row Level Security**: Supabase RLS policies ensure users can only access their own data

## Tables

### `privacy_accounts`

Stores encrypted Privacy Cash keypairs for each user.

```sql
CREATE TABLE privacy_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,

  -- Encrypted keypair (AES-256-GCM encrypted JSON containing { publicKey, secretKey })
  encrypted_keypair TEXT NOT NULL,

  -- Encryption metadata
  encryption_iv TEXT NOT NULL,  -- Initialization vector for AES-GCM
  encryption_salt TEXT NOT NULL, -- Salt used for key derivation

  -- Solana blockchain address of the privacy account
  privacy_pubkey TEXT NOT NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_privacy_accounts_wallet ON privacy_accounts(wallet_address);
CREATE INDEX idx_privacy_accounts_privacy_pubkey ON privacy_accounts(privacy_pubkey);

-- Row Level Security
ALTER TABLE privacy_accounts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own accounts
CREATE POLICY "Users can read own privacy account"
  ON privacy_accounts
  FOR SELECT
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Policy: Service role can manage all accounts (for API routes)
CREATE POLICY "Service role full access"
  ON privacy_accounts
  FOR ALL
  USING (current_setting('role') = 'service_role');
```

### `privacy_transactions`

Records all Privacy Cash deposits and withdrawals for auditing and balance tracking.

```sql
CREATE TABLE privacy_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL REFERENCES privacy_accounts(wallet_address),

  -- Transaction type
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdraw')),

  -- Amount in lamports
  amount BIGINT NOT NULL,

  -- Solana transaction signature
  signature TEXT UNIQUE NOT NULL,

  -- Transaction status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),

  -- Recipient (for withdrawals)
  recipient TEXT,

  -- Blockchain data
  block_time TIMESTAMP WITH TIME ZONE,
  slot BIGINT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_privacy_transactions_wallet ON privacy_transactions(wallet_address);
CREATE INDEX idx_privacy_transactions_type ON privacy_transactions(transaction_type);
CREATE INDEX idx_privacy_transactions_status ON privacy_transactions(status);
CREATE INDEX idx_privacy_transactions_signature ON privacy_transactions(signature);
CREATE INDEX idx_privacy_transactions_created_at ON privacy_transactions(created_at DESC);

-- Row Level Security
ALTER TABLE privacy_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own transactions
CREATE POLICY "Users can read own transactions"
  ON privacy_transactions
  FOR SELECT
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Policy: Service role full access (for API routes)
CREATE POLICY "Service role full access transactions"
  ON privacy_transactions
  FOR ALL
  USING (current_setting('role') = 'service_role');
```

### `privacy_balances`

Cached balance information for quick lookups (updated on each transaction).

```sql
CREATE TABLE privacy_balances (
  wallet_address TEXT PRIMARY KEY REFERENCES privacy_accounts(wallet_address),

  -- Balance in lamports
  balance BIGINT NOT NULL DEFAULT 0,

  -- Statistics
  total_deposits BIGINT NOT NULL DEFAULT 0,
  total_withdrawals BIGINT NOT NULL DEFAULT 0,
  transaction_count INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE privacy_balances ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own balance
CREATE POLICY "Users can read own balance"
  ON privacy_balances
  FOR SELECT
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Policy: Service role full access
CREATE POLICY "Service role full access balances"
  ON privacy_balances
  FOR ALL
  USING (current_setting('role') = 'service_role');
```

## Functions

### Update Balance Trigger

Automatically updates the `privacy_balances` table when transactions are confirmed.

```sql
CREATE OR REPLACE FUNCTION update_privacy_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    INSERT INTO privacy_balances (wallet_address, balance, total_deposits, total_withdrawals, transaction_count)
    VALUES (
      NEW.wallet_address,
      CASE
        WHEN NEW.transaction_type = 'deposit' THEN NEW.amount
        WHEN NEW.transaction_type = 'withdraw' THEN -NEW.amount
        ELSE 0
      END,
      CASE WHEN NEW.transaction_type = 'deposit' THEN NEW.amount ELSE 0 END,
      CASE WHEN NEW.transaction_type = 'withdraw' THEN NEW.amount ELSE 0 END,
      1
    )
    ON CONFLICT (wallet_address) DO UPDATE SET
      balance = privacy_balances.balance +
        CASE
          WHEN NEW.transaction_type = 'deposit' THEN NEW.amount
          WHEN NEW.transaction_type = 'withdraw' THEN -NEW.amount
          ELSE 0
        END,
      total_deposits = privacy_balances.total_deposits +
        CASE WHEN NEW.transaction_type = 'deposit' THEN NEW.amount ELSE 0 END,
      total_withdrawals = privacy_balances.total_withdrawals +
        CASE WHEN NEW.transaction_type = 'withdraw' THEN NEW.amount ELSE 0 END,
      transaction_count = privacy_balances.transaction_count + 1,
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER privacy_transaction_balance_update
  AFTER INSERT OR UPDATE ON privacy_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_privacy_balance();
```

## Environment Variables

Add these to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Privacy Cash Encryption (generate with: openssl rand -hex 32)
PRIVACY_CASH_SERVER_ENCRYPTION_KEY=your-64-char-hex-string
```

## Setup Instructions

1. **Create Supabase Project**: Go to https://supabase.com and create a new project

2. **Run SQL Scripts**: Copy and paste the SQL from each table section into the Supabase SQL Editor

3. **Get API Keys**:
   - Anon key: Settings → API → Project API keys → anon public
   - Service role key: Settings → API → Project API keys → service_role (keep secret!)

4. **Set Environment Variables**: Add the keys to `.env.local`

5. **Test Connection**: The app will validate environment variables on startup

## API Endpoints

Once the schema is set up, these API routes will be available:

- `POST /api/privacy-cash/initialize` - Create encrypted keypair for user
- `POST /api/privacy-cash/deposit` - Deposit SOL to privacy account
- `POST /api/privacy-cash/withdraw` - Withdraw SOL from privacy account
- `GET /api/privacy-cash/balance` - Get current privacy balance
- `GET /api/privacy-cash/transactions` - Get transaction history

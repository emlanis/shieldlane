# Security Guide for Shieldlane

## Environment Variables - Safe Configuration

### ✅ SAFE - What to Use

```bash
# Vercel Environment Variables (Production, Preview, Development)

# Solana RPC - Full URL (API key embedded)
NEXT_PUBLIC_SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY

# Network
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# Program IDs (public anyway)
NEXT_PUBLIC_PRIVACY_CASH_PROGRAM_ID=9fhQBbumKEFuXtMBDw8AaQyAjCorLGJQiS3skWZdQyQD
NEXT_PUBLIC_SHADOWPAY_API_BASE=https://shadow.radr.fun/shadowpay
```

### ❌ NOT SAFE - What to Avoid

```bash
# DON'T expose API keys separately
NEXT_PUBLIC_HELIUS_API_KEY=xxx  # ❌ Visible in browser
NEXT_PUBLIC_API_KEY=xxx          # ❌ Visible in browser
NEXT_PUBLIC_SECRET=xxx           # ❌ Visible in browser
```

## Why Full RPC URL is Safe

### The Concern
- `NEXT_PUBLIC_*` variables are bundled into client JavaScript
- Anyone can view them in browser DevTools
- Your Helius API key is technically visible

### Why It's OK
1. **Domain Restrictions**
   - Configure Helius API key to only work from `shieldlane.vercel.app`
   - Go to Helius Dashboard → Settings → Allowed Origins
   - Add: `https://shieldlane.vercel.app`
   - Requests from other domains will be rejected

2. **Rate Limiting**
   - Free tier: 100 req/sec
   - If someone abuses your key, they hit your rate limit (not your wallet)
   - You get notified of unusual activity

3. **No Financial Risk**
   - Free tier has no credit card
   - Paid tier has monthly spending caps
   - Can't rack up unexpected charges

4. **Industry Standard**
   - This is how 99% of Solana dApps work
   - Examples: Phantom, Magic Eden, Jupiter all expose RPC URLs
   - Solana RPC is meant to be public

## Additional Security Measures

### 1. Configure Helius Domain Restrictions

**Helius Dashboard:**
1. Log in to helius.dev
2. Select your project
3. Go to **Settings**
4. Under **Allowed Origins**, add:
   ```
   https://shieldlane.vercel.app
   ```
5. Click **Save**

Now your API key only works from your domain!

### 2. Enable Rate Limit Alerts

**Helius Dashboard:**
1. Go to **Alerts**
2. Enable "Rate Limit Approaching"
3. Set threshold: 80%
4. Add your email

You'll be notified if someone tries to abuse your key.

### 3. Monitor Usage

**Helius Dashboard:**
1. Check **Analytics** tab regularly
2. Look for unusual traffic patterns
3. Review top endpoints being called

### 4. Rotate Keys Periodically

Every 3-6 months:
1. Create new Helius API key
2. Update Vercel env variable
3. Redeploy
4. Delete old key after 24 hours

## What About Wallet Keys?

### ✅ Wallet Security (Handled by Browser Wallets)

Shieldlane **NEVER** handles private keys directly:
- User's wallet (Phantom, Solflare, etc.) manages private keys
- We only request signatures for specific transactions
- Users approve each transaction in their wallet
- Private keys stay in the wallet extension

### Privacy Cash Encryption

**Local Encryption Keys:**
- Derived from wallet signature
- Only exists in browser memory
- Never sent to server
- Cleared on page refresh

**UTXO Storage:**
- Encrypted before storing in localStorage
- Can only be decrypted by wallet owner
- If someone steals localStorage data, it's useless without wallet signature

## Advanced Security (Optional)

### Server-Side RPC Proxy

For maximum security (overkill for most dApps):

**1. Create API Route** (`src/app/api/rpc/route.ts`):
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Rate limiting logic here
  const body = await request.json();

  const response = await fetch(
    `https://devnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  return NextResponse.json(await response.json());
}
```

**2. Use Server Variable** (not NEXT_PUBLIC):
```bash
# Vercel env variable (server-side only)
HELIUS_API_KEY=your-key-here
```

**3. Update Connection**:
```typescript
const connection = new Connection('/api/rpc', 'confirmed');
```

**Pros:**
- API key truly hidden from browser
- Can implement custom rate limiting
- Can add authentication

**Cons:**
- Extra latency (request goes through your server)
- More complex
- Higher Vercel bandwidth usage
- Not necessary for Solana RPC

## Security Checklist

Before going to mainnet:

- [ ] Configure Helius domain restrictions
- [ ] Enable rate limit alerts
- [ ] Review wallet connection code (no private key handling)
- [ ] Test Privacy Cash encryption (keys never leave browser)
- [ ] Verify UTXO storage is encrypted
- [ ] Test transaction signing flow
- [ ] Ensure all user confirmations work
- [ ] Add transaction confirmation UI
- [ ] Implement error handling
- [ ] Add retry logic for failed transactions
- [ ] Test with small amounts first
- [ ] Monitor first 24 hours closely

## Incident Response

### If Your Helius Key is Compromised

1. **Immediate:**
   - Delete key in Helius dashboard
   - Create new key
   - Update Vercel env variable
   - Redeploy

2. **Within 24 hours:**
   - Review Helius analytics for unusual activity
   - Check if rate limits were exceeded
   - Contact Helius support if needed

3. **Prevention:**
   - Enable domain restrictions on new key
   - Set up rate limit alerts
   - Monitor usage for first week

### If User Reports Suspicious Activity

1. User should:
   - Revoke dApp permissions in wallet
   - Move funds to new wallet
   - Report to support

2. You should:
   - Review transaction logs
   - Check for code vulnerabilities
   - Audit wallet connection code
   - Report to Solana security if critical

## Best Practices

1. **Never:**
   - Store private keys
   - Request seed phrases
   - Auto-approve transactions
   - Bundle multiple transactions without showing each

2. **Always:**
   - Show transaction details before signing
   - Let user approve each transaction
   - Encrypt sensitive data (UTXOs)
   - Use HTTPS only
   - Keep dependencies updated

3. **Regularly:**
   - Audit dependencies (`npm audit`)
   - Review Helius usage
   - Test security features
   - Update documentation

## Questions?

- Helius Security: https://docs.helius.dev/welcome/security
- Solana Security: https://docs.solana.com/security
- Web3 Security: https://github.com/Quillhash/Web3-Security
- Report issues: Open GitHub issue (public) or email for sensitive

---

**Remember**: The goal is to protect user funds, not to hide public information like RPC endpoints. Focus security efforts where they matter most: wallet interactions and transaction signing.

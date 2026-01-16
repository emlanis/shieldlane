# Helius RPC Setup Guide

## Why Helius?

Helius provides enterprise-grade Solana RPC infrastructure with:
- **100+ requests/second** (vs 1-2 req/s on public endpoints)
- **99.9% uptime** guarantee
- **Enhanced APIs** (webhooks, DAS API, compression support)
- **Better performance** for Privacy Cash operations
- **Free tier** available for testing

## Setup Steps

### 1. Create Helius Account

1. Go to [https://helius.dev](https://helius.dev)
2. Click "Get Started" or "Sign Up"
3. Sign up with email or GitHub
4. Verify your email

### 2. Create API Key

1. Log in to Helius Dashboard
2. Click "Create New Project" or select existing project
3. Choose network:
   - **Devnet** for testing (recommended to start)
   - **Mainnet** for production
4. Copy your API key (starts with your project name)

### 3. Add to Vercel

**Option A: Via Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com)
2. Select your `shieldlane` project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add variable:
   ```
   Name:  NEXT_PUBLIC_HELIUS_API_KEY
   Value: your-helius-api-key-here
   ```
6. Select environments: Production, Preview, Development
7. Click **Save**
8. Go to **Deployments** tab
9. Click **Redeploy** on latest deployment

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Add environment variable
vercel env add NEXT_PUBLIC_HELIUS_API_KEY

# Paste your API key when prompted
# Select: Production, Preview, Development

# Redeploy
vercel --prod
```

### 4. Verify Configuration

Your app will automatically use Helius RPC. Check in browser console:

```javascript
// The connection endpoint should show Helius
console.log(connection.rpcEndpoint)
// Output: https://rpc.helius.xyz/?api-key=your-key
```

## RPC Endpoints

### Devnet
```
https://rpc.helius.xyz/?api-key=YOUR_API_KEY
```

### Mainnet
```
https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
```

## Environment Variable Configuration

Add to Vercel (all environments):

```bash
# Required
NEXT_PUBLIC_HELIUS_API_KEY=your-api-key-here
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# Optional
NEXT_PUBLIC_PRIVACY_CASH_PROGRAM_ID=9fhQBbumKEFuXtMBDw8AaQyAjCorLGJQiS3skWZdQyQD
NEXT_PUBLIC_SHADOWPAY_API_BASE=https://shadow.radr.fun/shadowpay
```

## Testing Helius Connection

1. Deploy to Vercel with Helius API key
2. Visit https://shieldlane.vercel.app
3. Open browser DevTools (F12)
4. Go to Console tab
5. Check for faster load times and no rate limit errors

### Expected Behavior

**With Helius**:
- ✅ Fast wallet balance updates
- ✅ Quick transaction confirmations
- ✅ No rate limit errors
- ✅ Privacy Cash operations work smoothly

**Without Helius** (public RPC):
- ⚠️ Slower balance updates
- ⚠️ Potential rate limit errors
- ⚠️ Transaction confirmation delays
- ⚠️ Privacy operations may timeout

## Helius Free Tier Limits

- **100 requests/second**
- **Unlimited total requests**
- **Devnet**: Free forever
- **Mainnet**: 100 req/s free, upgrade for more

Perfect for Shieldlane's needs!

## Advanced Helius Features (Future)

### 1. Webhooks
Get notified when:
- Privacy Cash deposits complete
- Withdrawals confirmed
- ShadowPay transfers finalized

### 2. Digital Asset Standard (DAS) API
- Compressed NFT support
- Token metadata
- Asset ownership verification

### 3. Enhanced Transaction APIs
- Transaction history with filters
- Failed transaction insights
- Custom retry logic

## Troubleshooting

### Issue: "403 Forbidden" errors

**Solution**: Check API key is correctly set in Vercel environment variables

### Issue: Still using public RPC

**Solutions**:
1. Verify environment variable name: `NEXT_PUBLIC_HELIUS_API_KEY`
2. Redeploy after adding variable
3. Check variable is set for all environments

### Issue: Rate limits on Helius

**Solution**: You're likely on free tier hitting 100 req/s. Solutions:
1. Implement request batching
2. Add caching layer
3. Upgrade to paid tier

## Alternative RPC Providers

If Helius doesn't work for you:

### QuickNode
```
NEXT_PUBLIC_SOLANA_RPC_URL=https://your-quicknode-endpoint.solana-devnet.quiknode.pro/YOUR_KEY/
```

### Alchemy
```
NEXT_PUBLIC_SOLANA_RPC_URL=https://solana-devnet.g.alchemy.com/v2/YOUR_KEY
```

### GenesysGo (Mainnet only)
```
NEXT_PUBLIC_SOLANA_RPC_URL=https://ssc-dao.genesysgo.net/
```

## Cost Estimate

For Shieldlane usage:

### Devnet (Always Free)
- Unlimited requests
- Perfect for development
- No credit card required

### Mainnet (Free Tier)
- **100 req/sec** free
- Estimated usage: 10-50 req/sec
- **Cost**: $0/month

### Mainnet (If scaling)
- Paid tiers start at $99/month
- 500+ req/sec
- Only needed if app gets very popular

## Next Steps

1. ✅ Sign up for Helius
2. ✅ Create devnet API key
3. ✅ Add to Vercel environment variables
4. ✅ Redeploy
5. ✅ Test Privacy Cash deposit
6. ✅ Monitor performance in Helius dashboard

---

**Questions?**
- Helius Discord: https://discord.gg/helius
- Helius Docs: https://docs.helius.dev
- Helius Support: support@helius.dev

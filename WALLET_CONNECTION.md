# Wallet Connection Guide

## ✅ Where Wallets Work

**Wallets ONLY connect on:**
- `http://localhost:3000` (or any localhost port)
- `https://your-domain.com` (production with HTTPS)

## ❌ Where Wallets DON'T Work

**Wallets will NOT connect on:**
- `http://192.168.0.179:3001` (network IP address)
- `http://your-computer-name.local`
- Any non-localhost HTTP address

## Why?

Browser wallet extensions (Phantom, Solflare, etc.) only inject on:
1. **localhost** - For development
2. **HTTPS domains** - For production security

This is a security feature to prevent malicious websites from accessing your wallet.

## Solution

### For Local Development (You)
✅ Use: `http://localhost:3001`

### For Testing on Other Devices (Phone, Tablet)
You have two options:

1. **Use ngrok or similar tunneling service:**
   ```bash
   npx ngrok http 3001
   ```
   This gives you an HTTPS URL that works everywhere.

2. **Deploy to production:**
   Deploy to Vercel/Netlify and test on the HTTPS URL.

## Current Setup

- **Dev server:** Running on port 3001
- **Access locally:** http://localhost:3001 ✅
- **Network URL:** http://192.168.0.179:3001 (for mobile preview, but wallets won't connect)

The network URL is useful for:
- Viewing UI on mobile devices
- Testing responsive design
- Sharing with team members for visual review

But for wallet functionality testing, always use `localhost`.

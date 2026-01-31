# Architecture Documentation

## System Architecture

Shieldlane is built as a privacy-preserving wrapper around Solana, integrating multiple cryptographic protocols to provide comprehensive privacy features.

## Component Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                         │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌────────────┐  │
│  │Dashboard │  │  Stealth │  │   Mixer   │  │  Monitor   │  │
│  └──────────┘  └──────────┘  └───────────┘  └────────────┘  │
└────────┬──────────────┬──────────────┬──────────────┬────────┘
         │              │              │              │
    ┌────▼────┐   ┌─────▼─────┐  ┌────▼────────┐  ┌─▼──────┐
    │Privacy  │   │  Privacy  │  │ Privacy     │  │Helius  │
    │Cash SDK │   │Cash (ZK)  │  │Mixer (TEE)  │  │  RPC   │
    └────┬────┘   └─────┬─────┘  └────┬────────┘  └─┬──────┘
         │              │              │             │
         │         ┌────▼─────┐   ┌────▼────────┐   │
         │         │ Layer 1: │   │  Layer 2:   │   │
         │         │Groth16 ZK│   │MagicBlock   │   │
         │         │  SNARKs  │   │Intel TDX TEE│   │
         │         └────┬─────┘   └────┬────────┘   │
         │              │              │             │
      ┌──▼──────────────▼──────────────▼─────────────▼─────┐
      │           Solana Blockchain (Devnet)                │
      │  ┌─────────────────────┐  ┌────────────────────┐   │
      │  │  Light Protocol     │  │  MagicBlock TEE    │   │
      │  │  (Privacy Cash)     │  │  (Secure Enclaves) │   │
      │  └─────────────────────┘  └────────────────────┘   │
      └───────────────────────────────────────────────────────┘
```

## Core Libraries

### 1. Privacy Cash Client (`lib/privacy-cash.ts`)

**Purpose**: Interface with Privacy Cash SDK for ZK-SNARK powered privacy pools

**Key Methods**:
- `depositSOL(amount)` - Shield SOL in privacy pool
- `withdrawSOL(amount, recipient)` - Unshield SOL with ZK proof
- `getPrivateBalance()` - Query private pool balance
- `depositUSDC(amount)` - Shield USDC
- `withdrawUSDC(amount, recipient)` - Unshield USDC

**Cryptographic Flow**:
1. **Deposit**:
   - Generate random commitment and nullifier
   - Add commitment to Merkle tree on-chain
   - Store nullifier locally (user's secret)

2. **Withdraw**:
   - Generate ZK-SNARK proof of commitment ownership
   - Proof includes: Merkle root, nullifier, recipient
   - On-chain verification without revealing commitment
   - Nullifier prevents double-spending

### 2. Privacy Mixer (`lib/privacyMixer.ts`)

**Purpose**: Dual-layer privacy combining Privacy Cash ZK-SNARKs with MagicBlock TEE

**Key Methods**:
- `mix(sourceKeypair, destinationPubkey, amount)` - Execute multi-hop mixing
- `createEphemeralAccounts(count)` - Generate temporary keypairs for mixing
- `delegateAccount(account, ownerProgram)` - Delegate to MagicBlock TEE
- `executeHopTransfer(from, to, amount)` - Execute single hop inside TEE

**Privacy Architecture**:

**Layer 1: Privacy Cash (ZK-SNARKs)**:
- Sender identity hidden using Groth16 ZK proofs
- Privacy Cash account serves as mixing source
- Amount and recipient visible on-chain
- Use case: Sender anonymity for everyday transfers

**Layer 2: MagicBlock TEE**:
- Multi-hop transfers (3-5 randomized hops)
- Ephemeral accounts delegated to Intel TDX secure enclaves
- Hardware-verified confidential execution
- Complete transaction privacy - sender, amount, recipient, patterns all hidden
- Use case: Maximum privacy for sensitive transfers

### 3. Surveillance Monitor (`lib/surveillance.ts`)

**Purpose**: Analyze wallet exposure to tracking

**Key Methods**:
- `analyzeSurveillance(wallet)` - Full privacy analysis
- `calculatePrivacyScore(wallet)` - 0-100 score
- `simulateTrackerView(wallet)` - What trackers see

**Analysis Components**:
- Transaction history exposure
- Balance visibility
- Privacy coverage percentage
- Risk level assessment
- Actionable recommendations

### 4. Solana Connection (`lib/solana.ts`)

**Purpose**: Blockchain interaction via Helius RPC

**Configuration**:
```typescript
const endpoint = heliusApiKey
  ? `https://rpc.helius.xyz/?api-key=${heliusApiKey}`
  : clusterApiUrl('devnet');

const connection = new Connection(endpoint, {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 60000,
});
```

## State Management

### Zustand Store (`store/privacy-store.ts`)

**Global State**:
```typescript
interface PrivacyState {
  isPrivacyEnabled: boolean;      // Using privacy features
  currentMode: PrivacyMode;       // 'external' | 'internal'
  showPublicView: boolean;        // Show/hide actual balance
  privacyScore: PrivacyScore;     // Current privacy metrics
  shadowWireConfig: MagicBlockConfig; // MagicBlock state
}
```

**Actions**:
- `togglePrivacy()` - Enable/disable privacy mode
- `setPrivacyMode(mode)` - Switch between external/internal
- `togglePublicView()` - Show/hide balance
- `setPrivacyScore(score)` - Update metrics
- `reset()` - Clear state on disconnect

## Custom Hooks

### usePrivateBalance

**Purpose**: Fetch and manage all balance types

**Returns**:
```typescript
{
  balance: {
    publicBalance: number;        // Visible on explorer
    privateBalance: number;       // Privacy pool total
    privacyCashBalance: number;   // Privacy Cash pool
    shadowPayBalance: number;     // MagicBlock PERs pool
    totalBalance: number;         // Sum of all
  },
  loading: boolean,
  error: string | null,
  refresh: () => void
}
```

**Update Frequency**: Polls every 10 seconds

### useStealthMode

**Purpose**: Execute private transfers

**Returns**:
```typescript
{
  currentMode: PrivacyMode,
  loading: boolean,
  executeTransfer: (transfer: StealthTransfer) => Promise<boolean>,
  switchMode: (mode: PrivacyMode) => void
}
```

### useSurveillance

**Purpose**: Monitor privacy exposure

**Returns**:
```typescript
{
  data: SurveillanceData | null,
  trackerView: TrackerView | null,
  loading: boolean,
  refresh: () => void
}
```

### usePrivacyScore

**Purpose**: Calculate privacy metrics

**Returns**:
```typescript
{
  score: PrivacyScore | null,
  loading: boolean,
  refresh: () => void
}
```

## Privacy Calculations

### Privacy Score Algorithm

```typescript
function calculatePrivacyScore(
  protectedTx: number,
  totalTx: number,
  hasPrivateBalance: boolean,
  usesStealthMode: boolean
): number {
  let score = 0;

  // Transaction privacy (60% weight)
  if (totalTx > 0) {
    score += (protectedTx / totalTx) * 60;
  }

  // Balance privacy (20% weight)
  if (hasPrivateBalance) {
    score += 20;
  }

  // Stealth mode usage (20% weight)
  if (usesStealthMode) {
    score += 20;
  }

  return Math.min(100, Math.round(score));
}
```

## Security Considerations

### 1. Client-Side Security

- Never expose private keys
- Store nullifiers/commitments securely (future: encrypted local storage)
- Validate all user inputs
- Use proper signature verification

### 2. Network Security

- HTTPS for all API calls
- Verify API responses
- Handle network errors gracefully
- Implement request timeouts

### 3. Privacy Best Practices

- Encourage users to wait before withdrawing (larger anonymity set)
- Recommend using privacy features regularly
- Educate about timing analysis risks
- Warn about linking wallets

## Performance Optimizations

### 1. Lazy Loading

- Components loaded on-demand
- Code splitting by route
- Dynamic imports for heavy libraries

### 2. Caching

- Balance queries cached for 10 seconds
- Transaction history cached
- Privacy score cached until wallet change

### 3. Optimistic Updates

- Immediate UI feedback
- Background verification
- Rollback on failure

## Future Enhancements

### Phase 2 (Post-Hackathon)

1. **Full SDK Integration**
   - Complete Privacy Cash SDK implementation
   - Real ZK-SNARK proof generation
   - Actual Merkle tree operations

2. **Enhanced Privacy**
   - Tor/VPN integration recommendations
   - Transaction batching
   - Decoy transactions

3. **Advanced Analytics**
   - Historical privacy score tracking
   - Wallet clustering detection
   - Front-running risk assessment

4. **Additional Features**
   - Multi-token support (SPL tokens)
   - DAO treasury management
   - Privacy-preserving NFT transfers

## Deployment Architecture

### Development
- Local Next.js dev server
- Solana devnet
- Test API keys

### Production (Devnet)
- Vercel deployment
- Solana devnet
- Production API keys
- CDN for static assets

### Future Mainnet
- Multi-region deployment
- Load balancing
- Enhanced monitoring
- Failover RPC endpoints

## Monitoring & Observability

- Browser console logging (development)
- Error boundary for React errors
- Transaction status tracking
- Network request monitoring
- User flow analytics (privacy-preserving)

## Testing Strategy

### Unit Tests
- Utility functions
- Privacy calculations
- Type validation

### Integration Tests
- SDK wrapper methods
- API client calls
- Wallet adapter integration

### E2E Tests
- Full user flows
- Multi-page journeys
- Error scenarios

## Dependencies

### Core
- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4

### Solana
- @solana/web3.js
- @solana/wallet-adapter-react
- @solana/wallet-adapter-wallets

### Privacy
- Privacy Cash SDK (integration in progress)
- MagicBlock API (REST client)

### Utilities
- Axios (HTTP client)
- Zustand (State management)
- React Hot Toast (Notifications)
- clsx (Class utilities)

---

**Last Updated**: January 2026
**Version**: 1.0.0 (Hackathon Release)

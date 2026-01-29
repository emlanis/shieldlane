# MagicBlock Integration Guide

This document describes the MagicBlock Private Ephemeral Rollups (PERs) integration in Shieldlane.

## Overview

Shieldlane now integrates MagicBlock SDK (`@magicblock-labs/ephemeral-rollups-sdk@0.8.4`) to provide TEE-based privacy for Internal mode transfers. This complements the Privacy Cash integration (External mode) to offer two distinct privacy approaches.

## Privacy Modes

### External Mode (Privacy Cash - ZK-SNARKs)
- **Sender**: Hidden via ZK proofs
- **Amount**: Visible on-chain
- **Recipient**: Visible on-chain
- **Use Case**: Withdrawals to exchanges, one-way privacy
- **Implementation**: Handled by Privacy Cash deposit/withdraw modals

### Internal Mode (MagicBlock PERs - TEE)
- **Sender**: Hidden in TEE
- **Amount**: Hidden in TEE
- **Recipient**: Hidden in TEE
- **Use Case**: Maximum privacy, confidential transfers
- **Implementation**: Account delegation + MagicBlock ConnectionMagicRouter

## Architecture

### Core Components

1. **useStealthMode Hook** ([src/hooks/useStealthMode.ts](src/hooks/useStealthMode.ts))
   - Main integration point for MagicBlock
   - Handles account delegation
   - Executes private transfers through ConnectionMagicRouter

2. **MagicBlock SDK Functions Used**
   - `ConnectionMagicRouter`: Extended Connection class with automatic ER routing
   - `createDelegateInstruction()`: Create delegation instruction
   - `getDelegationStatus()`: Check if account is delegated
   - `DEFAULT_PRIVATE_VALIDATOR`: Default private validator for delegation

3. **Key Functions**

   ```typescript
   // Verify TEE RPC Integrity
   const verifyTeeRpcIntegrity = async (): Promise<boolean>

   // Get MagicBlock Auth Token
   const getAuthToken = async (): Promise<string | null>

   // Delegate account to Ephemeral Rollup
   const delegateAccount = async (
     account: PublicKey,
     ownerProgram: PublicKey
   ): Promise<boolean>

   // Execute private transfer in TEE
   const executePrivateTransfer = async (
     recipient: PublicKey,
     amountSol: number
   ): Promise<string | null>
   ```

## Transfer Flow (Internal Mode)

1. **User initiates transfer** in Stealth Mode page
2. **Verify TEE RPC integrity** (placeholder for attestation)
3. **Get auth token** (placeholder for TEE RPC auth)
4. **Check delegation status** using `getDelegationStatus()`
5. **Delegate account if needed** using `createDelegateInstruction()`
6. **Create transfer instruction** with SystemProgram.transfer
7. **Route through MagicRouter** which automatically uses ER if delegated
8. **Execute transaction** in Ephemeral Rollup
9. **Confirm transaction** on base chain after commit

## Implementation Details

### Account Delegation

```typescript
const delegateIx = createDelegateInstruction(
  {
    payer: publicKey,
    delegatedAccount: account,
    ownerProgram: ownerProgram,
    validator: DEFAULT_PRIVATE_VALIDATOR,
  },
  {
    commitFrequencyMs: 60000, // Commit every 60 seconds
  }
);
```

### ConnectionMagicRouter Usage

```typescript
const magicConnection = new ConnectionMagicRouter(
  connection.rpcEndpoint,
  connection.commitment
);

// Check if account is delegated
const { isDelegated } = await magicConnection.getDelegationStatus(publicKey);

// Prepare transaction (routes to ER if delegated)
const preparedTx = await magicConnection.prepareTransaction(transaction);

// Send through MagicRouter
const signature = await magicConnection.sendTransaction(signed);
```

## Current Limitations

### Devnet vs Mainnet

The current implementation works on Solana devnet with the following limitations:

1. **TEE Attestation**: Not yet available on devnet
   - `verifyTeeRpcIntegrity()` is a placeholder
   - Full TEE verification requires mainnet deployment

2. **TEE RPC**: Optional configuration
   - Environment variable: `NEXT_PUBLIC_MAGICBLOCK_TEE_RPC`
   - Currently uses standard Helius RPC with delegation

3. **Auth Token**: Not required for devnet
   - `getAuthToken()` is a placeholder
   - Production would require authenticated TEE RPC connection

### Future Enhancements

When MagicBlock provides full devnet support:

1. **Implement TEE Attestation**
   - Add Intel TDX attestation verification
   - Validate secure enclave integrity

2. **Add TEE RPC Auth**
   - Implement proper authentication flow
   - Manage auth tokens securely

3. **Enhanced Monitoring**
   - Add delegation status monitoring
   - Track commit schedules
   - Monitor ER performance

## Testing

### Manual Testing Steps

1. **Connect Wallet** with devnet SOL
2. **Navigate to Stealth Mode** page
3. **Switch to Internal mode**
4. **Enter recipient address and amount**
5. **Execute transfer**
6. **Verify delegation** in console logs
7. **Check transaction** on Solana Explorer

### Expected Console Output

```
TEE RPC verification skipped (devnet mode)
Auth token skipped (devnet mode)
Account delegated to ER: <signature>
Private transfer executed (internal mode): <signature>
```

## References

- **MagicBlock Docs**: https://docs.magicblock.gg
- **SDK Repository**: https://github.com/magicblock-labs/ephemeral-rollups-sdk
- **Examples**: https://github.com/magicblock-labs/magicblock-engine-examples

## Migration Notes

This integration replaced the previous ShadowWire/ShadowPay implementation:

- **Removed**: ShadowWire Bulletproofs + ElGamal encryption
- **Added**: MagicBlock PERs with TEE privacy
- **Reason**: ShadowPay requires 12-15 SOL on mainnet, not feasible for hackathon
- **Benefit**: MagicBlock works on devnet and provides TEE-based privacy

See [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md) for full migration history.

## Support

For issues with MagicBlock integration:

1. Check SDK version: `@magicblock-labs/ephemeral-rollups-sdk@0.8.4`
2. Verify Solana network: `devnet`
3. Review console logs for errors
4. Check delegation status on-chain
5. Report issues at: https://github.com/emlanis/shieldlane/issues

---

**Last Updated**: 2026-01-29
**Status**: ✅ Integration Complete
**SDK Version**: 0.8.4

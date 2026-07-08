# Aethelred Solana Programs

Anchor workspace for on-chain RWA infrastructure on Solana devnet.

## Programs

| Program | Purpose |
|---------|---------|
| `aethelred_passport` | Mint passport NFTs with Guardian attestation metadata |
| `aethelred_vault` | Collateral vault — 150% ratio, debt tracking |
| `aethelred_euro` | EURO SPL mint with program-controlled authority |
| `aethelred_rewards` | BCT community reward token — task claim transfers |

## Setup

```bash
# Install Anchor: https://www.anchor-lang.com/docs/installation
anchor build
anchor deploy --provider.cluster devnet
```

## Program IDs (set after deploy)

Add to `.env`:

```
VITE_PASSPORT_PROGRAM_ID=
VITE_VAULT_PROGRAM_ID=
VITE_EURO_MINT_ADDRESS=
VITE_REWARDS_MINT_ADDRESS=
```

## Architecture

```
User Wallet
    │
    ├─► aethelred_passport::mint_passport(attestation)
    ├─► aethelred_vault::deposit_collateral(asset_id, amount)
    ├─► aethelred_euro::mint(amount) [requires vault health ≥ 150%]
    └─► aethelred_rewards::claim(task_completion_id)
```

## Status

MVP program stubs are scaffolded. Client transaction builders in `src/lib/solana/transactions.ts` wire to deployed program IDs when configured.

# Aethelred Solana Programs

Anchor workspace for on-chain RWA infrastructure on Solana devnet.

## Programs

| Program              | Purpose                                                   |
| -------------------- | --------------------------------------------------------- |
| `aethelred_passport` | Mint passport accounts with Guardian attestation metadata |
| `aethelred_registry` | Asset registry, NAV, share mint linkage                   |
| `aethelred_names`    | On-chain handles for wallets                              |
| `aethelred_vault`    | Collateral vault — debt ratio tracking                    |
| `aethelred_euro`     | EURO SPL mint with program-controlled authority           |
| `aethelred_rewards`  | BCT community reward token                                |

## Devnet program IDs

| Program  | Address                                        |
| -------- | ---------------------------------------------- |
| passport | `9wMCFvTTgyVuzB2yCNtC2G9ZcVDHrxpBmBnW2BSZoy1A` |
| registry | `AQXb8Z29qSxco5h5qSWfUnwZd7DgSuFhxXjeB25FMtEU` |
| names    | `APU7238FpwdCWTrx5jSKpQYnkrrHiT1HgQgtPPRY3aDd` |
| vault    | `4tzFUjGPaiENbHR3vZE9bLEdjrMSbewZqizkwP5m5t9X` |
| euro     | `H3DagyBbC86U62PVkPV6pgtJcuuhhK7FpWwoLWsYHboL` |
| rewards  | `4j6QfsG5mbZ6RaYZpdnzpk5zYfiJJWex2YA6TjsBhnhE` |

## Setup

```bash
anchor build
anchor deploy --provider.cluster devnet
# or use repo scripts:
npm run deploy:anchor
npm run setup:devnet
```

## Architecture

```
User Wallet
    │
    ├─► aethelred_passport::mint_passport(attestation)
    ├─► aethelred_registry::register_asset(...)
    ├─► aethelred_vault::deposit_collateral(asset_id, amount)
    ├─► aethelred_euro::mint_euro(amount)
    ├─► aethelred_rewards::claim_reward(...)
    └─► aethelred_names::register_name(...)
```

## Status

Programs are deployed on **devnet** with hardening applied per [security audit v1](../docs/security-audit-v1.md). Client transaction builders in `src/lib/solana/transactions.ts` are partially wired — EURO mint and BCT claim CPIs remain in progress. Vault collateral is counter-only until SPL custody is implemented.

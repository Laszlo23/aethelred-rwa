# On-chain accounts (Solana devnet)

Copy-paste reference for grant reviewers, diligence calls, and ecosystem partners.

**Chain:** Solana devnet  
**Live demo:** https://rwa.buildingcultureid.space/grant  
**Repository:** https://github.com/Laszlo23/aethelred-rwa

---

## Anchor programs

| Program  | Address                                        |
| -------- | ---------------------------------------------- |
| passport | `9wMCFvTTgyVuzB2yCNtC2G9ZcVDHrxpBmBnW2BSZoy1A` |
| registry | `AQXb8Z29qSxco5h5qSWfUnwZd7DgSuFhxXjeB25FMtEU` |
| names    | `APU7238FpwdCWTrx5jSKpQYnkrrHiT1HgQgtPPRY3aDd` |
| vault    | `4tzFUjGPaiENbHR3vZE9bLEdjrMSbewZqizkwP5m5t9X` |
| euro     | `H3DagyBbC86U62PVkPV6pgtJcuuhhK7FpWwoLWsYHboL` |
| rewards  | `4j6QfsG5mbZ6RaYZpdnzpk5zYfiJJWex2YA6TjsBhnhE` |

Explorer base: `https://explorer.solana.com/address/<ADDRESS>?cluster=devnet`

---

## SPL mints

| Mint                 | Address                                        | Notes                                                     |
| -------------------- | ---------------------------------------------- | --------------------------------------------------------- |
| USDC (devnet)        | `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU` | Primary market settlement                                 |
| Share — Berggasse 35 | `8QNgtUCgqfHq1fNZbxUz41FNuWBYA2e4WUeXaqwfHbdm` | Example RWA share mint                                    |
| EURO                 | _per deploy_                                   | Set `VITE_EURO_MINT_ADDRESS` after `npm run setup:devnet` |
| BCT rewards          | _per deploy_                                   | Set `VITE_REWARDS_MINT_ADDRESS` after setup               |

---

## Treasury / disbursement

Grant USDC disbursement wallet: **`TREASURY_WALLET_ADDRESS`** from production `.env` (deployer pubkey by default).

Do not commit private keys. Provide pubkey only when SF legal requests it during diligence.

---

## Example explorer links

- Passport program: https://explorer.solana.com/address/9wMCFvTTgyVuzB2yCNtC2G9ZcVDHrxpBmBnW2BSZoy1A?cluster=devnet
- Berggasse share mint: https://explorer.solana.com/address/8QNgtUCgqfHq1fNZbxUz41FNuWBYA2e4WUeXaqwfHbdm?cluster=devnet

---

## IDLs

Committed under `src/lib/solana/idl/` — `aethelred_passport.json`, `aethelred_registry.json`, etc.

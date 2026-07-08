# Architecture

High-level system design for Aethelred RWA. For security boundaries see [security-audit-v1.md](security-audit-v1.md).

---

## System overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Browser (TanStack Start)                     │
│  Explore · Create · Portfolio · Profile/KYC · Markets · Tasks   │
└────────────────────────────┬────────────────────────────────────┘
                             │ server functions (src/api/*)
┌────────────────────────────▼────────────────────────────────────┐
│                      Nitro / Node server                         │
│  Prisma · SIWS auth · KYC service · Guardian jobs · settlement   │
└────────────┬───────────────────────────────┬────────────────────┘
             │                               │
    ┌────────▼────────┐              ┌───────▼────────┐
    │ SQLite / Postgres│              │ Solana RPC     │
    │ assets, kyc,     │              │ devnet/local   │
    │ tasks, ledger    │              └───────┬────────┘
    └──────────────────┘                      │
                                     ┌────────▼────────┐
                                     │ Anchor programs │
                                     │ + SPL mints     │
                                     └─────────────────┘
```

---

## Purchase flow (core path)

```
Buyer                Server                    Chain
  │                    │                        │
  ├─ Connect wallet ──►│                        │
  ├─ SIWS sign-in ────►│                        │
  ├─ KYC submit ──────►│ DB: pending            │
  │                    │◄── admin approve ──────┤
  ├─ Buy shares ──────►│ check compliance       │
  ├─ Sign USDC tx ────┼───────────────────────►│ treasury ATA
  │                    │ verifyUsdcPayment()    │
  │                    │ settleShareTransfer() ─►│ share mint → buyer
  │                    │ FundLedgerEntry dedup  │
  ├─ Portfolio ◄──────│ indexer sync           │
```

**Files:** `src/api/shares.ts`, `src/lib/solana/primary-sale-server.ts`, `src/lib/compliance/service.ts`

---

## Anchor programs

| Program              | Responsibility                          | Client wiring                         |
| -------------------- | --------------------------------------- | ------------------------------------- |
| `aethelred_passport` | Passport accounts, Guardian attestation | Create flow, PDAs                     |
| `aethelred_registry` | Asset registry, NAV                     | Setup chain, registry PDA             |
| `aethelred_names`    | On-chain handles                        | Partial — DB names primary            |
| `aethelred_vault`    | Collateral ratio tracking               | **Counter only** — no SPL custody yet |
| `aethelred_euro`     | EURO stable mint                        | Mint CPI **incomplete** in client     |
| `aethelred_rewards`  | BCT reward mint                         | Claim CPI **incomplete** in client    |

---

## Module status matrix

| Module              | Data store              | On-chain                | Notes                     |
| ------------------- | ----------------------- | ----------------------- | ------------------------- |
| Assets / properties | Prisma + seed           | Share mints per asset   | 13 BC properties          |
| Primary sale        | Prisma ledger + chain   | USDC + SPL transfer     | KYC gated                 |
| KYC                 | Prisma `KycApplication` | None                    | Admin review at `/admin`  |
| Guardian audits     | Prisma jobs             | Optional co-sign        | Simulated steps + extract |
| Tasks / points      | Prisma                  | Points mostly off-chain | 17 tasks                  |
| Governance          | Prisma votes            | None                    | Seeded proposals          |
| Perp markets        | Prisma + synthetic      | Drift stub server-side  | UI demo                   |
| Kamino lend         | Prisma positions        | Stub tx                 | Zero-lamport placeholder  |
| Fund transparency   | Prisma + seed           | None                    | Treasury bands            |
| Names               | Prisma                  | Program exists          | Registration DB-first     |

---

## Deployment

| Environment | URL                         | Database         | Chain             |
| ----------- | --------------------------- | ---------------- | ----------------- |
| Local       | localhost:8080              | `prisma/dev.db`  | localnet / devnet |
| Production  | rwa.buildingcultureid.space | SQLite `prod.db` | devnet            |

Deploy: `scripts/deploy-production.sh` → systemd + nginx on VPS.

---

## Planned hardening

1. Postgres for production
2. Third-party audit
3. Squads multisig for upgrade authority
4. Complete vault SPL custody + EURO/BCT CPIs
5. Token-2022 transfer hooks for KYC on mainnet
6. Real Drift/Kamino or remove demo UIs

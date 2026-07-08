# Aethelred RWA

**Real Assets. Verified. Accessible.**

Aethelred is a Solana-native platform for tokenizing verified real-world assets (RWAs), built by [Building Culture](https://buildingcultureid.space). Investors connect a wallet, complete KYC, and purchase fractional shares in curated European properties. Issuers mint Asset Passports, run Guardian verification, and publish transparent debt and fund data on-chain.

**Live demo:** https://rwa.buildingcultureid.space  
**Ecosystem:** https://buildingcultureid.space/rwa

---

## Features

| Area                   | Status        | Description                                                   |
| ---------------------- | ------------- | ------------------------------------------------------------- |
| Asset registry         | Live          | 13 Building Culture properties with passports, galleries, NAV |
| Primary market         | Live (devnet) | KYC-gated USDC purchase → on-chain share settlement           |
| KYC + admin            | Live          | Wallet SIWS, application flow, admin review board             |
| Asset creation         | Live          | NL wizard, doc upload, Guardian audit pipeline                |
| Community tasks        | Live          | 17 tasks, points and BCT rewards (DB ledger)                  |
| Fund transparency      | Live          | Treasury allocation and yield bands                           |
| Perp markets UI        | Demo          | Synthetic order book — not production trading                 |
| Kamino lending UI      | Demo          | Stub integration — see [Architecture](docs/ARCHITECTURE.md)   |
| EURO vault / BCT claim | In progress   | Programs deployed; client CPI wiring incomplete               |

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for an honest module-by-module breakdown.

---

## Tech stack

- **Frontend:** TanStack Start (React), Tailwind CSS, wallet-adapter
- **Backend:** Nitro server functions, Prisma ORM
- **Database:** SQLite (dev/prod POC); Postgres scaffold in `docker-compose.yml`
- **Chain:** Solana devnet, 6 Anchor programs, SPL token primary sales
- **Auth:** Sign-In With Solana (SIWS), admin secret + wallet allowlist

---

## Quick start

### Prerequisites

- Node.js 20+
- npm
- Solana CLI + Anchor 0.30.1 (for on-chain work)

### 1. Install

```bash
git clone https://github.com/Laszlo23/aethelred-rwa.git
cd aethelred-rwa
npm install
cp .env.example .env
```

### 2. Database

```bash
npm run db:push
```

The app seeds Building Culture assets on first run.

### 3. Dev server

```bash
npm run dev
```

Open http://localhost:8080

### 4. Solana devnet (optional)

Populate mint addresses and deploy programs:

```bash
npm run setup:devnet
# or local validator:
npm run setup:chain
```

Program IDs are pre-configured in `.env.example` (devnet). Mint addresses are written by the setup script.

### 5. Tests

```bash
# KYC service layer (no chain required)
npm run test:kyc

# Full purchase path (requires funded deployer + RPC)
npm run test:e2e
```

---

## Project structure

```
src/
  api/           Server functions (shares, kyc, tasks, guardian, …)
  routes/        TanStack file routes
  lib/solana/    Anchor client, transactions, primary sale
  lib/data/      Building Culture seed data
programs/        Anchor workspace (6 programs)
scripts/         Deploy, E2E tests, chain setup
docs/            Architecture, security audit, grant materials
public/          Static assets, property images, SEO
```

---

## Anchor programs (devnet)

| Program              | ID                                             |
| -------------------- | ---------------------------------------------- |
| `aethelred_passport` | `9wMCFvTTgyVuzB2yCNtC2G9ZcVDHrxpBmBnW2BSZoy1A` |
| `aethelred_registry` | `AQXb8Z29qSxco5h5qSWfUnwZd7DgSuFhxXjeB25FMtEU` |
| `aethelred_names`    | `APU7238FpwdCWTrx5jSKpQYnkrrHiT1HgQgtPPRY3aDd` |
| `aethelred_vault`    | `4tzFUjGPaiENbHR3vZE9bLEdjrMSbewZqizkwP5m5t9X` |
| `aethelred_euro`     | `H3DagyBbC86U62PVkPV6pgtJcuuhhK7FpWwoLWsYHboL` |
| `aethelred_rewards`  | `4j6QfsG5mbZ6RaYZpdnzpk5zYfiJJWex2YA6TjsBhnhE` |

Details: [programs/README.md](programs/README.md)

---

## Production deploy

```bash
./scripts/deploy-production.sh
```

Deploys to `rwa.buildingcultureid.space` via rsync + systemd + nginx. Requires SSH access and a populated local `.env`. See script header for `DEPLOY_SSH_HOST` / `DEPLOY_SSH_KEY` overrides.

---

## Security

- Self-audit: [docs/security-audit-v1.md](docs/security-audit-v1.md)
- KYC gate on share purchases
- Transaction signature deduplication
- Admin board behind secret + optional wallet allowlist
- **Not audited by a third party yet** — devnet POC only

Do not use with real funds on mainnet until an external audit and mainnet hardening are complete.

---

## Grants & contributions

- Grant application package: [GRANT.md](GRANT.md)
- Solana Foundation one-pager: [docs/SOLANA-GRANT.md](docs/SOLANA-GRANT.md)
- Form answers (copy-paste): [docs/SOLANA-GRANT-FORM.md](docs/SOLANA-GRANT-FORM.md)
- 2-min video script: [docs/LOOM-SCRIPT.md](docs/LOOM-SCRIPT.md)
- 5-minute demo script: [docs/DEMO.md](docs/DEMO.md)
- Contributing: [CONTRIBUTING.md](CONTRIBUTING.md)

---

## License

[MIT](LICENSE) — Copyright (c) 2026 Building Culture LLC

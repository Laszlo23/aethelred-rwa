# Demo script (5 minutes)

For grant reviewers, investors, and ecosystem partners.

**URL:** https://rwa.buildingcultureid.space  
**Wallet:** Phantom or Solflare on **devnet**  
**Duration:** ~5 minutes

---

## Before you start

- Switch wallet to **Solana devnet**
- Have a small amount of devnet SOL
- Optional: devnet USDC for live purchase (or use faucet if configured)
- Admin passphrase ready if demoing KYC approval live

---

## Act 1 — The registry (60s)

1. Open the homepage — video hero, passport card
2. Click **Explore**
3. Open **Berggasse 35** (or any featured property)
4. Point out:
   - Property gallery and story
   - Asset Passport with trust / NAV
   - Debt transparency panel
   - “This is a verified Building Culture asset, not a generic token”

---

## Act 2 — Compliance gate (90s)

1. Click **Connect Vault** (top right)
2. Go to **Profile**
3. Show KYC form — name, country, document type
4. Submit application → status **Pending**
5. Open **Admin · KYC** (separate tab or `/admin`)
6. Enter admin passphrase → approve the application
7. Return to Profile → status **Verified**

_Key message: restricted shares require identity verification before purchase._

---

## Act 3 — Primary market (90s)

1. Back to asset page → **Invest** tab
2. Enter USDC amount → **Buy**
3. Approve transaction in wallet
4. Go to **Portfolio** — holdings appear after settlement/indexer
5. Mention: USDC verified on-chain, shares transferred via deployer settlement, tx dedup prevents double-spend

_If purchase fails on devnet, show portfolio with a pre-funded demo wallet._

---

## Act 4 — Transparency & community (60s)

1. **Funds** — treasury allocation, yield bands
2. **Guardian** — audit checks and attestation model
3. **Community** (`/tasks`) — 17 tasks, BCT rewards
4. **Technology** — how passports, Euro liquidity, and Guardian fit together

---

## Act 5 — Issuer flow (optional, 60s)

1. **Create** — describe an asset in natural language
2. Upload a document stub
3. Run Guardian audit → passport preview
4. _Issuer-side of the same protocol_

---

## Closing talking points

- **13 live properties** from Building Culture, not mock data
- **6 Anchor programs** on devnet with committed IDLs
- **Open source** — MIT, GitHub, self-audit published
- **Honest scope** — perps/lending are demo; primary sale + KYC is the real path
- **Ask** — audit funding, mainnet pilot, ecosystem integration

---

## Troubleshooting

| Issue                         | Fix                                       |
| ----------------------------- | ----------------------------------------- |
| “Connecting to Solana…” hangs | Refresh; check devnet RPC                 |
| Purchase blocked              | Complete KYC first                        |
| No USDC                       | Fund devnet wallet or use setup scripts   |
| Admin 403                     | Check `DEPLOY_ADMIN_SECRET` in server env |

# Aethelred — Grant Application Package

**Project:** Aethelred RWA by Building Culture  
**Live demo:** https://rwa.buildingcultureid.space  
**Repository:** https://github.com/Laszlo23/aethelred-rwa  
**Chain:** Solana devnet (mainnet planned)  
**License:** MIT

---

## 1. Problem

Real-world asset markets are opaque. Retail investors cannot easily verify ownership, debt, or yield on individual properties. Issuers rely on paper registries and intermediaries. On-chain finance lacks a credible passport layer for physical assets.

**Building Culture** curates heritage European real estate (Vienna, Austrian lakes, commercial assets) and needs a transparent, compliant way to fractionalize access on Solana.

---

## 2. Solution

**Aethelred** is an RWA operating system:

1. **Asset Passport** — on-chain identity with Guardian attestation, NAV, trust score
2. **Primary market** — KYC-gated USDC purchases settled to SPL share tokens
3. **Transparency** — debt panels, fund allocation, audit history
4. **Community** — tasks and rewards to grow the issuer network
5. **Six Anchor programs** — passport, registry, names, vault, euro, rewards

Cross-ecosystem: properties reference Building Culture Places on Base; Solana is the settlement and investor layer.

---

## 3. Traction (POC)

| Metric | Value |
|--------|-------|
| Live deployment | rwa.buildingcultureid.space |
| Curated assets | 13 Building Culture properties |
| Anchor programs | 6 deployed on devnet |
| Community tasks | 17 |
| KYC flow | End-to-end (submit → admin → purchase gate) |
| Security doc | Self-audit v1 with remediation tracker |
| Automated tests | KYC 7/7; E2E purchase matrix (chain-dependent) |

---

## 4. What is production-ready vs demo

### Production-ready (devnet POC)

- Wallet connect + SIWS
- Explore / asset detail / portfolio
- KYC submission + admin review
- USDC primary sale with tx dedup
- Asset creation + Guardian audit jobs
- Fund transparency, tasks, governance (DB)
- SEO, sitemap, production deploy script

### Demo / in progress (labeled in UI roadmap)

- Perp markets (synthetic order book)
- Kamino lending (stub)
- EURO mint / BCT on-chain claim (CPI incomplete)
- Vault SPL custody (counter-only today)
- On-chain governance and names (programs exist, UI is DB-first)

Honest labeling is a core grant commitment — see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 5. Team

**Building Culture** — European heritage real estate collective.  
**Aethelred** — Solana RWA infrastructure layer for the Building Culture portfolio.

_Contact maintainers via GitHub issues or Building Culture ecosystem channels._

---

## 6. Roadmap (12 months)

| Quarter | Milestone |
|---------|-----------|
| Q3 2026 | Third-party audit (purchase flow + passport + registry) |
| Q3 2026 | Complete EURO/BCT transaction builders; wire names on-chain |
| Q4 2026 | Postgres production DB; Squads multisig for program upgrades |
| Q4 2026 | Mainnet pilot — 1–2 assets, regulated KYC partner |
| Q1 2027 | Real Kamino/Drift integrations or remove demo modules |
| Q1 2027 | Vault SPL custody; Token-2022 transfer hooks for compliance |

---

## 7. Budget request (template)

| Item | Est. | Purpose |
|------|------|---------|
| Security audit | $40–80k | External firm, 6 programs + purchase flow |
| Mainnet deploy + ops | $15k | RPC, infra, multisig, monitoring |
| Compliance review | $20k | KYC vendor integration, legal opinion |
| Engineering | $60k | CPI completion, Postgres, indexer, CI |
| **Total** | **~$135–175k** | 12-month milestone delivery |

_Adjust figures per grant program requirements._

---

## 8. Grant fit

- **Solana Foundation** — RWA infrastructure, consumer access, open-source Anchor programs
- **Superteam (EU)** — Austrian/EU heritage assets, retail democratization
- **Colosseum / ecosystem** — full-stack demo with live URL and GitHub

---

## 9. Supporting documents

- [README.md](README.md) — setup and overview
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — system design
- [docs/security-audit-v1.md](docs/security-audit-v1.md) — threat model and findings
- [docs/DEMO.md](docs/DEMO.md) — 5-minute reviewer demo script

---

## 10. Demo script (summary)

1. Open https://rwa.buildingcultureid.space
2. Explore → Berggasse 35 → asset passport and debt panel
3. Connect Phantom → Profile → submit KYC
4. Admin approves (or use pre-verified wallet on devnet)
5. Buy shares with USDC → Portfolio shows holdings
6. Funds + Guardian + Community tasks

Full script: [docs/DEMO.md](docs/DEMO.md)

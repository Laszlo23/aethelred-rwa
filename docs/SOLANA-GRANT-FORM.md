# Solana Foundation — Form Answers (copy-paste)

Use at **https://solana.org/grants** when submitting. Confirm wallet address before sending.

---

## Basic information

| Field | Answer |
|-------|--------|
| **Project name** | Aethelred RWA |
| **Legal entity / org** | Building Culture LLC |
| **Primary contact** | Laszlo Bihary |
| **Email** | laszlo.bihary@gmail.com |
| **GitHub** | https://github.com/Laszlo23/aethelred-rwa |
| **Website** | https://rwa.buildingcultureid.space |
| **About / metrics** | https://rwa.buildingcultureid.space/about |
| **Twitter / X** | @buildingculture |
| **License** | MIT (open source) |
| **Grant type** | Milestone-based grant (public good) |
| **Amount requested** | $125,000 USDC (flexible; see milestones) |
| **Timeline** | 12 months |

---

## Project overview (≈150 words — paste as short summary)

Aethelred is open-source Solana infrastructure for verified real-world assets (RWAs). Built by Building Culture, it gives each property an on-chain Asset Passport, Guardian attestation, KYC-gated primary market (USDC → SPL shares), and transparent debt reporting.

We have a **live production demo**, **13 curated European properties**, **6 Anchor programs on devnet**, MIT-licensed code with **passing CI**, and a published security audit v1. Grant funds will complete a third-party audit, wire remaining on-chain CPIs, and launch a **mainnet pilot** — making Aethelred a reusable RWA reference stack for the Solana ecosystem.

---

## Full project description (≈400 words)

### Problem

RWAs on-chain lack a credible identity layer. Investors cannot easily verify ownership, debt, NAV, or audit history for individual properties. Issuers rely on opaque intermediaries. Solana has deep DeFi but few end-to-end reference implementations for **regulated primary issuance** of real estate.

### Solution

Aethelred is an RWA operating system on Solana:

1. **Asset Passport** — Anchor program + metadata for Guardian attestation, trust score, NAV
2. **Registry** — on-chain asset registration and share mint linkage
3. **Primary market** — wallet connect, SIWS auth, KYC gate, USDC payment verification, SPL share settlement with tx dedup
4. **Issuer tools** — natural-language asset creation, document upload, Guardian audit pipeline
5. **Transparency** — fund ledger, debt panels, oracle snapshots, public metrics
6. **Community** — tasks, rewards, governance (extensible to full on-chain)

We also ship vault, euro, names, and rewards programs as composable primitives.

### What exists today

- Live: https://rwa.buildingcultureid.space
- Open source: https://github.com/Laszlo23/aethelred-rwa
- 6 programs deployed on devnet with committed IDLs
- KYC flow with automated tests (7/7 pass)
- Self-security audit with remediation tracker
- Production deploy automation (systemd + nginx)

### What grant unlocks

Third-party audit, completion of on-chain CPI wiring (EURO, BCT, vault custody), Postgres production DB, Squads multisig for upgrades, and a **mainnet pilot** for 1–2 Building Culture assets with regulated KYC integration.

We clearly label demo modules (synthetic perps, Kamino stub) and will not claim production status for incomplete paths.

---

## How does your project provide a public good for Solana? (≈200 words)

Aethelred is a **MIT-licensed, forkable RWA stack** — not a closed commercial silo.

**Open-source contribution:** Six Anchor programs, IDLs, server settlement patterns, KYC gate integration, and full app source published on GitHub with CI, architecture docs, and security audit v1.

**Free community offering:** Live demo at rwa.buildingcultureid.space lets any builder or reviewer walk through issuance, compliance, and primary-market purchase without permission.

**Ecosystem reuse:** Other issuers can fork passport + registry + primary-sale patterns instead of rebuilding from scratch. We document honest module status so teams do not inherit hidden stubs.

**RWA category growth:** Solana benefits from a credible European real-estate reference implementation linking heritage assets to SPL shares — expanding the RWA narrative beyond US treasuries and generic token wrappers.

**Security culture:** Grant-funded third-party audit and published remediation improve standards for all forks.

---

## Why Solana? (≈150 words)

Solana is the right settlement layer for fractional RWAs:

1. **Low fees** — retail investors can interact with €50K–€15M properties without prohibitive per-tx cost
2. **SPL + Anchor** — mature tooling for passport/registry/mint patterns we have already deployed
3. **DeFi composability** — post-audit path to Kamino lending and Drift perps for share-backed positions
4. **Speed** — primary-market settlement and indexer sync fit user expectations for modern fintech
5. **Ecosystem momentum** — RWA is a strategic category; Aethelred adds a full-stack European reference implementation

Building Culture also operates cross-chain (Places on Base), but **Solana is the investor settlement layer** — this grant strengthens that choice with audited, mainnet-ready infrastructure.

---

## Traction & current stage

| Item | Detail |
|------|--------|
| Stage | Devnet POC with live production UI |
| Assets | 13 Building Culture properties |
| Portfolio NAV | ~€50M+ curated seed portfolio |
| Programs | 6 Anchor programs on devnet |
| Tests | KYC 7/7 automated; E2E purchase matrix |
| Deployment | Production at rwa.buildingcultureid.space |
| Docs | README, GRANT.md, architecture, audit v1, demo script |
| CI | GitHub Actions — lint, KYC tests, build |

---

## Team (≈100 words)

**Building Culture LLC** curates European heritage real estate — city, land, and water assets across Austria and the EU — with a live property catalog and cross-ecosystem Places integration.

**Laszlo Bihary** (primary contact, laszlo.bihary@gmail.com) leads Aethelred engineering: TanStack Start app, Prisma backend, six Anchor programs, KYC/admin flows, production deployment, and open-source documentation.

We have demonstrated execution: live URL, GitHub repo, CI, security audit, and scripted demo flows. Grant funding accelerates audit + mainnet — not initial prototyping.

---

## Budget & milestones

**Total request: $125,000 USDC**

### Milestone 1 — Audit & hardening ($40,000) · Months 1–3

| Line item | Amount |
|-----------|--------|
| Third-party security audit (6 programs + purchase flow) | $32,000 |
| Remediation engineering | $5,000 |
| Squads multisig setup + migration | $3,000 |

**Deliverables:** Published audit PDF, remediated devnet deployment, upgrade authority on multisig.

---

### Milestone 2 — On-chain completion ($35,000) · Months 4–6

| Line item | Amount |
|-----------|--------|
| EURO mint + BCT claim CPI wiring | $12,000 |
| Vault SPL custody implementation | $10,000 |
| On-chain names registration | $5,000 |
| E2E devnet tests in CI | $5,000 |
| Postgres production migration | $3,000 |

**Deliverables:** Documented full primary-market on-chain path, CI E2E against devnet, updated architecture docs.

---

### Milestone 3 — Mainnet pilot ($50,000) · Months 7–12

| Line item | Amount |
|-----------|--------|
| Regulated KYC partner integration (Veriff or equivalent) | $15,000 |
| Mainnet deploy + ops (RPC, monitoring) | $12,000 |
| Issuer onboarding guide + ecosystem docs | $8,000 |
| Mainnet pilot engineering (1–2 assets) | $10,000 |
| Legal / compliance review support | $5,000 |

**Deliverables:** Mainnet tx signatures for pilot purchases, issuer onboarding guide, public metrics on /about.

---

## Measurable success metrics

- [ ] Third-party audit published (M1)
- [ ] 0 critical open findings at M1 sign-off
- [ ] EURO + BCT CPIs live on devnet (M2)
- [ ] E2E purchase test passing in CI on devnet (M2)
- [ ] ≥1 mainnet asset with verified KYC purchase (M3)
- [ ] ≥10 external GitHub stars / forks tracked quarterly
- [ ] Issuer onboarding doc used by ≥1 external team (M3)

---

## Links to attach

| Label | URL |
|-------|-----|
| Live demo | https://rwa.buildingcultureid.space |
| About / metrics | https://rwa.buildingcultureid.space/about |
| GitHub | https://github.com/Laszlo23/aethelred-rwa |
| Grant one-pager | https://github.com/Laszlo23/aethelred-rwa/blob/main/docs/SOLANA-GRANT.md |
| Architecture | https://github.com/Laszlo23/aethelred-rwa/blob/main/docs/ARCHITECTURE.md |
| Security audit v1 | https://github.com/Laszlo23/aethelred-rwa/blob/main/docs/security-audit-v1.md |
| Demo script (5 min) | https://github.com/Laszlo23/aethelred-rwa/blob/main/docs/DEMO.md |
| Video demo (2 min) | [Paste Loom URL after recording] |
| CI | https://github.com/Laszlo23/aethelred-rwa/actions |

---

## Optional: convertible grant / investment note

If asked whether we are raising investment: Aethelred is primarily a **public-good protocol layer** (MIT). Building Culture LLC may pursue commercial operations separately for asset management. We are applying for a **standard milestone grant** first; open to SF guidance on convertible structure if aligned.

---

## Pre-submit checklist

- [x] Replace `[Your full name]` and `[Your email]`
- [ ] Record 2-min Loom (see [LOOM-SCRIPT.md](./LOOM-SCRIPT.md)) and paste URL
- [ ] Confirm wallet address for grant disbursement
- [ ] Review amount vs SF tier expectations ($10k–$250k range)
- [ ] Submit at https://solana.org/grants

---

*Last updated: July 2026*

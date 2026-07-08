# Solana Foundation Grant Application — Aethelred RWA

**One-page summary for ecosystem grant reviewers**

| Field                | Value                                     |
| -------------------- | ----------------------------------------- |
| **Project**          | Aethelred RWA                             |
| **Organization**     | Building Culture LLC                      |
| **Applicant**        | Laszlo Bihary (Building Culture LLC)      |
| **Live demo**        | https://rwa.buildingcultureid.space       |
| **About page**       | https://rwa.buildingcultureid.space/about |
| **Repository**       | https://github.com/Laszlo23/aethelred-rwa |
| **License**          | MIT                                       |
| **Chain**            | Solana devnet (mainnet pilot Q4 2026)     |
| **Requested amount** | $75,000 – $150,000 USDC                   |
| **Timeline**         | 12 months                                 |

---

## Executive summary

Aethelred is open-source Solana infrastructure for **verified real-world assets**. Building Culture has curated **13 European heritage properties** (Vienna, Austrian lakes, commercial) and deployed a live platform where investors connect a wallet, pass KYC, and purchase fractional SPL shares backed by on-chain Asset Passports and Guardian attestation.

We are applying for Solana Foundation support to complete a **third-party security audit**, finish **on-chain CPI wiring** (EURO, BCT rewards, vault custody), and launch a **mainnet pilot** for 1–2 regulated assets — establishing Aethelred as reusable RWA primitives for the Solana ecosystem.

---

## Problem

- RWAs on-chain lack a credible **identity layer** (passport, NAV, debt, audit history).
- Retail investors cannot verify what they are buying; issuers cannot prove compliance.
- Solana has DeFi depth but few **end-to-end RWA issuance + primary market** reference implementations.

---

## Solution (what we built)

| Component             | Description                                                       |
| --------------------- | ----------------------------------------------------------------- |
| **6 Anchor programs** | passport, registry, names, vault, euro, rewards — devnet deployed |
| **Primary market**    | KYC-gated USDC → SPL share settlement with tx dedup               |
| **Guardian**          | Continuous attestation pipeline + trust scoring                   |
| **Issuer tools**      | NL asset creation wizard, doc upload, audit jobs                  |
| **Transparency**      | Fund ledger, debt panels, oracle snapshots                        |
| **Community**         | 17 tasks, BCT rewards, governance (DB)                            |

**Cross-ecosystem:** Properties link to Building Culture Places on Base; Solana is the investor settlement layer.

---

## Traction

| Metric              | Value                               |
| ------------------- | ----------------------------------- |
| Live production URL | rwa.buildingcultureid.space         |
| Curated assets      | 13 properties                       |
| Portfolio NAV       | ~€50M+ (seed portfolio)             |
| Anchor programs     | 6 on devnet                         |
| Open source         | MIT, GitHub, CI passing             |
| KYC flow            | End-to-end (7/7 automated tests)    |
| Security            | Self-audit v1 + remediation tracker |

---

## What grant funds will deliver

### Milestone 1 — Audit & hardening (Months 1–3) — $40k

- Commission third-party audit (purchase flow + 6 programs)
- Remediate findings; publish audit report
- Squads multisig for program upgrade authority
- Postgres migration for production

**Deliverable:** Audit report PDF + upgraded devnet deployment

### Milestone 2 — On-chain completion (Months 4–6) — $35k

- Wire EURO mint and BCT claim CPIs in client
- Implement vault SPL custody (or disable EURO UI until complete)
- On-chain names registration
- E2E test suite running in CI against devnet

**Deliverable:** Full primary-market path on-chain documented + demo video

### Milestone 3 — Mainnet pilot (Months 7–12) — $50k

- Regulated KYC partner integration (Veriff or equivalent)
- Mainnet deploy for 1–2 Building Culture assets
- Public metrics dashboard + `/about` traction page
- Ecosystem documentation for other issuers

**Deliverable:** Mainnet tx signatures + issuer onboarding guide

**Total requested:** ~$125,000 USDC (flexible by SF grant tier)

---

## Why Solana

- **SPL + Anchor** — mature tooling for passport/registry patterns
- **Low fees** — viable for fractional retail access to €50K–€15M properties
- **Ecosystem DeFi** — Kamino/Drift integration path for lend/perp modules (post-audit)
- **RWA momentum** — Aethelred is a reference stack other issuers can fork (MIT)

---

## Team

**Building Culture LLC** — European heritage real estate collective with live property catalog and cross-chain Places integration.

**Laszlo Bihary** — Primary contact and Aethelred engineering lead; full-stack Solana + TanStack; open-source maintainer of the protocol layer.

Contact: laszlo.bihary@gmail.com · GitHub issues on [aethelred-rwa](https://github.com/Laszlo23/aethelred-rwa)

---

## Honest scope boundaries

We label demo modules clearly:

| Module                     | Status                      |
| -------------------------- | --------------------------- |
| Primary sale + KYC         | **Production (devnet)**     |
| Asset passports + registry | **Production (devnet)**     |
| Perp markets UI            | Demo (synthetic order book) |
| Kamino lending             | Stub                        |
| EURO / BCT claim           | CPI in progress             |

Grant funds accelerate **real** paths, not demo polish.

---

## Supporting links

- [README](https://github.com/Laszlo23/aethelred-rwa/blob/main/README.md)
- [GRANT.md](https://github.com/Laszlo23/aethelred-rwa/blob/main/GRANT.md)
- [Architecture](https://github.com/Laszlo23/aethelred-rwa/blob/main/docs/ARCHITECTURE.md)
- [Security audit v1](https://github.com/Laszlo23/aethelred-rwa/blob/main/docs/security-audit-v1.md)
- [5-min demo script](https://github.com/Laszlo23/aethelred-rwa/blob/main/docs/DEMO.md)
- [Form answers (copy-paste)](https://github.com/Laszlo23/aethelred-rwa/blob/main/docs/SOLANA-GRANT-FORM.md)
- [2-min Loom script](https://github.com/Laszlo23/aethelred-rwa/blob/main/docs/LOOM-SCRIPT.md)
- [CI status](https://github.com/Laszlo23/aethelred-rwa/actions)

---

## Submission checklist

- [x] Live demo URL
- [x] Open-source MIT repository
- [x] CI passing
- [x] Security documentation
- [x] Public about / metrics page
- [ ] Third-party audit (Milestone 1)
- [ ] Mainnet deployment (Milestone 3)
- [ ] Solana Foundation application form submitted

---

_Prepared July 2026 — Aethelred by Building Culture LLC_

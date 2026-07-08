# SME diligence call — talking points

Use if Solana Foundation schedules a subject-matter expert call (~1 week after application).

**Duration:** 30–45 min typical  
**Attendees:** Laszlo Bihary (engineering lead), optionally Reinhard Stix (real estate)

---

## 1. Elevator pitch (30 sec)

Aethelred is MIT-licensed Solana infrastructure for verified European real estate. We ship per-asset passports, KYC-gated USDC → SPL primary market, and six Anchor programs on devnet — with a live demo and 13 curated properties. Grant funds complete a third-party audit and mainnet pilot, not greenfield R&D.

---

## 2. Why Solana

- Low fees for fractional retail access to €50K–€15M properties
- SPL + Anchor — mature passport/registry patterns (already deployed)
- DeFi composability path post-audit (Kamino, Drift)
- EU RWA reference gap — most Solana RWA examples are US treasuries or generic wrappers

---

## 3. Public good

- **Open source:** full stack MIT on GitHub — 6 programs, IDLs, KYC + settlement patterns
- **Free demo:** rwa.buildingcultureid.space — no permission required
- **Forkable:** other issuers reuse passport + registry + primary sale
- **Honest labeling:** demo modules (perps, Kamino stub, EURO CPI) clearly marked in UI

---

## 4. Traction (proof of execution)

| Item       | Status                                 |
| ---------- | -------------------------------------- |
| Live URL   | rwa.buildingcultureid.space            |
| Properties | 13 EU heritage assets (~€50M NAV seed) |
| Programs   | 6 on devnet                            |
| CI         | Passing on GitHub Actions              |
| Security   | Self-audit v1 + remediation tracker    |
| KYC        | 7/7 automated tests                    |

---

## 5. What grant unlocks ($125k / 12 mo)

| Milestone   | Amount | Deliverable                                               |
| ----------- | ------ | --------------------------------------------------------- |
| M1 Audit    | $40k   | Third-party audit PDF, remediated devnet, Squads multisig |
| M2 On-chain | $35k   | EURO/BCT CPIs, vault custody, E2E CI on devnet            |
| M3 Mainnet  | $50k   | Regulated KYC partner, 1–2 pilot assets, issuer docs      |

---

## 6. Competition

**Solana:** Homebase, Parcl  
**Cross-chain:** Centrifuge, Ondo, RealT

**Our edge:** real EU asset operator + shipped open-source stack + per-asset passport/debt transparency — not a black-box pool.

---

## 7. Risks we disclose proactively

- Devnet today; mainnet is Milestone 3
- EURO vault SPL custody incomplete (H-01 in audit v1)
- KYC is DB-gated today; regulated partner in M3
- No third-party audit yet — M1 is first spend

---

## 8. Ask

Standard **milestone-based public-good grant** at $125k USDC. Open to SF guidance on tier or convertible structure if aligned.

**Disbursement wallet:** treasury pubkey from `TREASURY_WALLET_ADDRESS` (provided to legal team on request).

---

## Links to share on call

- https://rwa.buildingcultureid.space/grant
- https://github.com/Laszlo23/aethelred-rwa
- https://github.com/Laszlo23/aethelred-rwa/blob/main/docs/ON-CHAIN.md

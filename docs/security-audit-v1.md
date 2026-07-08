# Aethelred RWA — Security Audit v1

**Date:** 2026-07-07  
**Scope:** 6 Anchor programs, primary-market purchase flow, devnet deployment  
**Status:** Devnet POC — remediations tracked below; third-party audit planned

---

## 1. Threat model

### Actors

| Actor | Capability | Goal |
|-------|------------|------|
| **Buyer** | Wallet, USDC, SIWS auth | Purchase RWA shares legally |
| **Deployer** | `SOLANA_DEPLOYER_SECRET`, program upgrade authority | Deploy mints, settle sales, operate treasury |
| **Guardian** | Attestation signing, KYC oracle | Verify assets, update trust/NAV |
| **Attacker** | Arbitrary wallet, RPC access | Mint unauthorized tokens, drain treasury, replay payments |

### Trust boundaries

- **On-chain:** Anchor programs, SPL mints, token transfers
- **Off-chain:** Prisma DB (KYC, share ledger cache), server settlement with deployer key
- **Hybrid:** Purchase flow — buyer signs USDC tx; server verifies and signs share transfer

---

## 2. Findings — Anchor programs

### CRITICAL

| ID | Program | Finding | Remediation | Timeline |
|----|---------|---------|-------------|----------|
| C-01 | `aethelred_passport` | Anyone can `mint_passport`; `guardian` set to `owner` — `update_attestation` ineffective | Require separate `guardian` signer; store real guardian pubkey | Before devnet |
| C-02 | `aethelred_registry` | Open `register_asset`; `mint` is `UncheckedAccount` | Config-gated authority; validate SPL `Mint` account | Before devnet |
| C-03 | `aethelred_euro` | Any mint authority can `mint_euro` without collateral | Restrict to `ProtocolConfig.minter` | Before devnet |
| C-04 | `aethelred_rewards` | Unrestricted `claim_reward` mint | Restrict to `ProtocolConfig.minter` | Before devnet |

### HIGH

| ID | Program | Finding | Remediation | Timeline |
|----|---------|---------|-------------|----------|
| H-01 | `aethelred_vault` | `deposit_collateral` increments counter only — no SPL custody | SPL transfer to vault ATA or disable EURO UI | Before mainnet |
| H-02 | `aethelred_vault` | `checked_add().unwrap()` panics on overflow | Return `Result` with error code | Before devnet |
| H-03 | `aethelred_registry` | First registrar owns NAV updates forever | Guardian-only `update_nav` or multisig | Before mainnet |
| H-04 | `aethelred_names` | No on-chain payment for premium handles | Fee transfer or trust gate on-chain | Before mainnet |

### MEDIUM

| ID | Area | Finding | Remediation | Timeline |
|----|------|---------|-------------|----------|
| M-01 | Passport | No validation of `trust_score`, `nav_cents`, attestation content | Guardian-only mint; schema validation off-chain | Before mainnet |
| M-02 | All programs | Upgrade authority on single deployer key | Squads multisig for upgrades | Before mainnet |
| M-03 | All programs | Anchor 0.30.1 programs vs 0.32.x TS client | Pin versions; commit IDLs | Before devnet |

---

## 3. Findings — off-chain / purchase flow

### CRITICAL

| ID | Location | Finding | Remediation | Timeline |
|----|----------|---------|-------------|----------|
| C-05 | `src/api/shares.ts` | Asset query omits `passport` — purchases always fail | Add `passport: true` to include | Before devnet |
| C-06 | `src/lib/solana/primary-sale-server.ts` | `verifyUsdcPayment` logic allows false positives | Balance-delta verification on treasury USDC ATA | Before devnet |

### HIGH

| ID | Location | Finding | Remediation | Timeline |
|----|----------|---------|-------------|----------|
| H-05 | `src/api/shares.ts` | Tx signature replay — same payment settles twice | Dedup via `FundLedgerEntry.txSignature` unique check | Before devnet |
| H-06 | `src/lib/solana/deployer.ts` | Deployer hot key in `.env` signs all settlements | HSM / KMS for mainnet; rotate if exposed | Before mainnet |
| H-07 | `src/api/faucet.ts` | Unauthenticated faucet drains treasury | Admin secret + per-wallet cooldown + cap | Before devnet |
| H-08 | Purchase flow | KYC is DB-only; mints are plain SPL | Token-2022 transfer hooks for mainnet | Before mainnet |

### MEDIUM

| ID | Location | Finding | Remediation | Timeline |
|----|----------|---------|-------------|----------|
| M-04 | `src/routes/create.tsx` | Passport PDA stored as `solanaMint` | Separate `passportPda` and `shareMint` fields | Before devnet |
| M-05 | `scripts/deploy-anchor-programs.ts` | Broken env parser; silent failure | Fix parser; exit non-zero | Before devnet |
| M-06 | `src/lib/solana/anchor/pdas.ts` | `Buffer` in browser | `TextEncoder` / `Uint8Array` | Before devnet |

---

## 4. Key management recommendations

1. **Deployer key** (`SOLANA_DEPLOYER_SECRET`): devnet only in `.env`; never commit; rotate if leaked
2. **Guardian key** (`GUARDIAN_SIGNER_SECRET`): separate from deployer; used for passport mint co-sign
3. **Program upgrade authority**: transfer to Squads multisig before mainnet
4. **Treasury wallet**: dedicated pubkey; monitor USDC ATA balance

---

## 5. Remediation status

| ID | Status |
|----|--------|
| C-01 | Fixed in program hardening (guardian signer + config) |
| C-02 | Fixed (ProtocolConfig + Mint validation) |
| C-03 | Fixed (minter constraint) |
| C-04 | Fixed (minter constraint) |
| C-05 | Fixed in `shares.ts` |
| C-06 | Fixed in `primary-sale-server.ts` |
| H-02 | Fixed (safe math) |
| H-05 | Fixed (tx dedup) |
| H-07 | Fixed (faucet auth) |
| M-05 | Fixed in deploy script |
| M-06 | Fixed in pdas.ts |

---

## 6. Out of scope (document only)

- Kamino lending integration (stub)
- Drift custom RWA perp markets
- Mainnet deployment
- Third-party audit firm engagement

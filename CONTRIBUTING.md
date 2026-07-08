# Contributing to Aethelred

Thank you for helping improve Aethelred RWA. This project is maintained by Building Culture LLC and open to ecosystem contributors.

## Getting started

1. Fork the repo and clone your fork
2. `npm install && cp .env.example .env`
3. `npm run db:push`
4. `npm run dev`

See [README.md](README.md) for Solana setup and tests.

## Development workflow

1. Create a branch from `main`
2. Make focused changes with clear commit messages
3. Run checks locally:

```bash
npm run lint
npm run test:kyc
npm run build
```

4. Open a pull request describing **what** changed and **why**

## Code conventions

- Match existing TypeScript/React patterns in `src/`
- Keep server logic in `src/api/` and `src/lib/`
- Minimize scope — avoid unrelated refactors in the same PR
- Never commit `.env`, keypairs, or database files

## Solana / Anchor

- Programs live in `programs/`
- After program changes: `anchor build` and update IDLs in `src/lib/solana/idl/`
- Document new program IDs in `.env.example` and `Anchor.toml`

## Security

If you discover a vulnerability, **do not** open a public issue. Email the maintainers or use GitHub private security advisories.

## Grant / research contributors

See [GRANT.md](GRANT.md) and [docs/DEMO.md](docs/DEMO.md) for context on project status and demo flows.

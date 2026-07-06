# Public vs Private Repository Guide

This guide separates what should be public for PolkAudit credibility from what must stay private for security and commercial safety.

For Polkadot ecosystem discussion and treasury credibility, the code, documentation, demo evidence, and license should be public. Secrets, infrastructure credentials, private notes, client data, and unreleased commercial material should stay private.

---

## Public by default

These files and directories are safe and useful to publish.

| Path | Why public |
|------|------------|
| `README.md` | Main product and setup overview |
| `LICENSE` | Required for open-source clarity |
| `Makefile` | Developer commands |
| `.gitignore` | Shows hygiene and prevents accidental commits |
| `.gcloudignore` | Build upload hygiene |
| `apps/backend/src/` | Backend implementation |
| `apps/backend/migrations/` | Public schema history |
| `apps/backend/tests/` | Reviewer confidence |
| `apps/backend/.env.example` | Safe template only |
| `apps/backend/Dockerfile` | Deployment reproducibility |
| `apps/indexer/src/` | Indexer implementation |
| `apps/indexer/tests/` | Parser/scanner confidence |
| `apps/indexer/.env.example` | Safe template only |
| `apps/indexer/Dockerfile` | Deployment reproducibility |
| `apps/frontend/` | Canonical dashboard UI |
| `apps/frontend/.env.example` | Safe template only |
| `deploy/oracle/` | Free hosting setup scripts and templates |
| `scripts/` | Verification/demo helper scripts, if they do not contain secrets |
| `cloudbuild.backend-dashboard.yaml` | Public deploy recipe |
| `docs/` | Grant, product, architecture, and demo docs |
| `docs/assets/` | Screenshots and sample exports, after secret review |

Public `.env.example` files should use placeholders only:

```env
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST.neon.tech/neondb?sslmode=require
API_KEY=replace-with-your-api-key
SUBSTRATE_RPC_URL=wss://rpc.polkadot.io
```

---

## Private by default

Never commit these.

| File or directory | Why private |
|-------------------|-------------|
| `.env` | Local secrets |
| `.env.local` | Local frontend/backend secrets |
| `.env.production` | Production secrets |
| `.env.staging` | Staging secrets |
| `apps/**/.env` | App-level secrets |
| `apps/**/.env.*` | App-level production/staging secrets |
| `private/` | Personal strategy, private notes, private investor material |
| `secrets/` | Explicit secrets folder |
| `credentials/` | Cloud/service credentials |
| `docs/private/` | Non-public planning docs |
| `notes/private/` | Non-public working notes |
| `*_PRIVATE.md` | Private strategy or client notes |
| `PRIVATE_*.md` | Private strategy or client notes |
| `*.pem`, `*.key`, `*.p12`, `*.pfx` | SSH/TLS/cloud keys |
| `*service-account*.json` | GCP service account credentials |
| `application_default_credentials.json` | Local GCP credentials |
| `*.sql`, `*.sql.gz`, `*.dump`, `*.backup` | Database dumps that may contain real data |
| Raw client exports | Potentially sensitive client data |
| Client contracts / invoices | Commercial confidentiality |
| Paid pilot contact lists | Sales data |

The root `.gitignore` is configured to ignore these patterns.

---

## Public but review before publishing

These are acceptable only after checking for secrets or accidental private details.

| Material | Review for |
|----------|------------|
| Screenshots | API keys, database URLs, email addresses, GCP project IDs, terminal history |
| Terminal logs | Secrets, IPs, internal paths, auth headers |
| Sample exports | Real personal data, client names, wallet labels you did not intend to publish |
| Demo videos | Browser tabs, bookmarks, terminal windows, keys in Settings pages |
| Architecture diagrams | Private IPs, exact secret names if you prefer not to disclose them |
| Polkassembly/forum posts | API keys, private URLs, unconfirmed pricing promises |

For `docs/assets/`, prefer sanitized screenshots from the public demo dashboard, not screenshots from admin consoles.

---

## Recommended local private layout

If you need private planning files inside the working tree, place them here:

```text
private/
  funding-notes.md
  client-targets.csv
  pricing-working-notes.md
  credentials-notes.md
```

This folder is ignored by Git. It should not be pushed.

If the material is highly sensitive, keep it outside the repo entirely, for example in a password manager or private cloud drive.

---

## Before making GitHub public

Run:

```bash
git status --short
git diff --cached
```

Check every staged file. If you see a secret or private file:

```bash
git restore --staged path/to/file
```

Search for common secret patterns before pushing:

```bash
rg -n "DATABASE_URL|API_KEY|SECRET|PASSWORD|PRIVATE KEY|BEGIN .* KEY|neon.tech|service_account|client_email" .
```

Expected safe matches:

- `.env.example`
- Documentation showing placeholders
- Code reading environment variable names

Unsafe matches:

- Real passwords
- Real API keys
- Service account JSON
- Private database URLs
- Private RPC provider keys

---

## GitHub visibility plan

Recommended:

1. Keep one clean public repo for PolkAudit.
2. Keep private sales/client notes outside the repo or under ignored `private/`.
3. Use GitHub Issues/Discussions for public roadmap only.
4. Use private documents for pricing negotiation, client pipeline, invoices, and credentials.
5. Tag the MVP release after verifying secrets are absent.

Do not create a public commit that later removes secrets. Git history still exposes removed secrets unless rewritten and rotated.

---

## What to rotate if accidentally exposed

If any secret is committed, pasted, or shown in a video:

- Neon database password
- PolkAudit API key
- GCP service account key
- Oracle SSH key
- RPC provider token
- OAuth/client secret

Rotate first, then clean the repo or video. Do not rely on deletion alone.

---

## Public/private summary

| Keep public | Keep private |
|-------------|--------------|
| Source code | `.env` files |
| Tests | Database URLs |
| Migrations | API keys |
| Dockerfiles | Service account JSON |
| Example env templates | SSH/private keys |
| Deployment docs | Client data |
| Demo screenshots | Raw database dumps |
| Sample sanitized exports | Sales pipeline and pricing negotiations |
| Grant/treasury docs | Private strategy notes |


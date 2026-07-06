# Deploy PolkAudit with Cloud Build → Cloud Run

You have two deployment patterns:

- **Hybrid (recommended):** `cloudbuild.backend-dashboard.yaml` + Oracle VM indexer — see **[HYBRID_DEPLOYMENT.md](HYBRID_DEPLOYMENT.md)**
- **Full stack on Cloud Run:** `cloudbuild.yaml` (backend + indexer + dashboard; indexer costs ~$30+/mo always-on)

No local Docker required for either flow.

## Architecture on GCP

```text
Cloud Build trigger
    ├── build → Artifact Registry (backend, indexer, dashboard)
    └── deploy → Cloud Run (3 services)
              │
              ▼
         Neon PostgreSQL (DATABASE_URL secret)
              ▲
         Indexer (min 1 instance, no CPU throttling)
```

| Service | Cloud Run settings | Public? |
|---------|-------------------|---------|
| `polkaudit-backend` | 512Mi, migrations on start | Yes (`/health`, `/docs`) |
| `polkaudit-indexer` | 1Gi, min-instances=1, timeout 3600s | No (private) |
| `polkaudit-dashboard` | 512Mi, `INTERNAL_API_URL` → backend | Yes |

---

## One-time GCP setup

Replace `PROJECT_ID` and `REGION` (default in yaml: `asia-southeast1`).

### 1. Enable APIs

```bash
gcloud config set project PROJECT_ID

gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com
```

### 2. Artifact Registry repository

```bash
gcloud artifacts repositories create polkaudit \
  --repository-format=docker \
  --location=asia-southeast1 \
  --description="PolkAudit container images"
```

### 3. Secret Manager

Store the **same** values you use locally (Neon URL, API key):

```bash
# Neon connection string (postgresql:// or postgresql+asyncpg://)
echo -n 'postgresql://USER:PASS@HOST.neon.tech/neondb?sslmode=require' | \
  gcloud secrets create polkaudit-database-url --data-file=-

echo -n 'your-production-api-key' | \
  gcloud secrets create polkaudit-api-key --data-file=-
```

To update later:

```bash
echo -n 'NEW_VALUE' | gcloud secrets versions add polkaudit-database-url --data-file=-
```

### 4. Cloud Build service account permissions

Find the Cloud Build SA (default: `PROJECT_NUMBER@cloudbuild.gserviceaccount.com`):

```bash
PROJECT_NUMBER=$(gcloud projects describe PROJECT_ID --format='value(projectNumber)')
CB_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

for ROLE in \
  roles/run.admin \
  roles/artifactregistry.writer \
  roles/secretmanager.secretAccessor \
  roles/iam.serviceAccountUser; do
  gcloud projects add-iam-policy-binding PROJECT_ID \
    --member="serviceAccount:${CB_SA}" \
    --role="${ROLE}"
done
```

### 5. Allow Cloud Run to read secrets

Default Compute SA (used by Cloud Run unless you specify another):

```bash
RUN_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

gcloud secrets add-iam-policy-binding polkaudit-database-url \
  --member="serviceAccount:${RUN_SA}" \
  --role=roles/secretmanager.secretAccessor

gcloud secrets add-iam-policy-binding polkaudit-api-key \
  --member="serviceAccount:${RUN_SA}" \
  --role=roles/secretmanager.secretAccessor
```

---

## Cloud Build trigger

1. Console → **Cloud Build** → **Triggers** → **Create trigger**
2. Connect your GitHub repo (`polkaudit`)
3. Event: **Push to branch** → `main` (or your default)
4. Configuration: **Cloud Build configuration file** → one of:
   - `cloudbuild.yaml` (full stack: backend + indexer + dashboard)
   - `cloudbuild.backend-dashboard.yaml` (free indexer: backend + dashboard only)
5. **Substitution variables** (optional overrides):

| Variable | Example | Notes |
|----------|---------|--------|
| `_REGION` | `asia-southeast1` | Same as Artifact Registry |
| `_AR_REPO` | `polkaudit` | Docker repo name |
| `_API_KEY` | (your key) | Must match `polkaudit-api-key` secret; baked into dashboard build |
| `_BACKEND_SERVICE` | `polkaudit-backend` | |
| `_INDEXER_SERVICE` | `polkaudit-indexer` | Only for `cloudbuild.yaml` (full stack) |
| `_DASHBOARD_SERVICE` | `polkaudit-dashboard` | |

6. Save and run the trigger (or push to `main`).

### Manual run (no push)

```bash
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_REGION=asia-southeast1,_API_KEY=your-production-api-key

# Or (free indexer: deploy only backend + dashboard)
gcloud builds submit --config=cloudbuild.backend-dashboard.yaml \
  --substitutions=_REGION=asia-southeast1,_API_KEY=your-production-api-key
```

---

## After deploy

The build prints service URLs. Typical checks:

```bash
BACKEND_URL=$(gcloud run services describe polkaudit-backend \
  --region=asia-southeast1 --format='value(status.url)')

curl -s "$BACKEND_URL/health"

curl -s -H "X-API-KEY: your-production-api-key" \
  "$BACKEND_URL/api/v1/stats/overview"
```

Dashboard URL:

```bash
gcloud run services describe polkaudit-dashboard \
  --region=asia-southeast1 --format='value(status.url)'
```

Indexer (private — needs identity token):

```bash
INDEXER_URL=$(gcloud run services describe polkaudit-indexer \
  --region=asia-southeast1 --format='value(status.url)')

curl -s -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
  "$INDEXER_URL/health"
```

---

## Indexer on Cloud Run notes

- **`min-instances: 1`** + **`--no-cpu-throttling`** keep the block scanner running.
- **`max-instances: 1`** avoids duplicate writers to the same DB.
- Listens on **`PORT`** (8080) for `/health` and `/metrics`.
- For production RPC, set `SUBSTRATE_RPC_URL` in the deploy step or add a Secret Manager secret and `--set-secrets` in `cloudbuild.yaml`.

Optional demo env (add to `deploy-indexer` `--set-env-vars`):

```text
INDEXER_START_BLOCK=31387000,INDEXER_CATCHUP_WINDOW=2000
```

---

## Costs (rough)

| Resource | Estimate |
|----------|----------|
| Cloud Run backend/dashboard | Low at demo traffic |
| Cloud Run indexer (always on) | ~$30–50/mo (1 vCPU, 1Gi, min 1 instance) |
| Neon | Free tier / existing plan |
| Cloud Build | 120 free build-min/day |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Permission denied` on deploy | Cloud Build SA needs `run.admin` + `iam.serviceAccountUser` |
| `Secret not found` | Create secrets; grant accessor to Cloud Run SA |
| Backend 503 / DB errors | Check `polkaudit-database-url` (sslmode for Neon) |
| Dashboard API errors | Re-run build after backend URL changes; check `INTERNAL_API_URL` |
| Indexer not indexing | Logs in Cloud Run → indexer service; verify RPC URL |
| `substrateinterface` decode fails | Image build verifies package; rebuild indexer image |

---

## Files reference

| File | Purpose |
|------|---------|
| [cloudbuild.yaml](../cloudbuild.yaml) | Build + deploy pipeline |
| [cloudbuild.backend-dashboard.yaml](../cloudbuild.backend-dashboard.yaml) | Backend + dashboard only (recommended for free indexer) |
| [apps/backend/Dockerfile](../apps/backend/Dockerfile) | API + Alembic on start |
| [apps/indexer/Dockerfile](../apps/indexer/Dockerfile) | Block scanner worker |
| [apps/dashboard/Dockerfile](../apps/dashboard/Dockerfile) | Next.js production build |

Local Docker Compose (optional): [docker-compose.yml](../docker-compose.yml)

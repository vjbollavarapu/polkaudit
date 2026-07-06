# Demo assets (screenshots & exports)

Store grant/demo evidence here. **Do not commit secrets** — only PNGs, JSON samples, and redacted exports.

## Screenshots (Phase 1C)

Capture with the full stack running (indexer + backend + dashboard). Recommended size: 1440×900 or full window.

| File | Page | What reviewers should see |
|------|------|---------------------------|
| `overview.png` | http://localhost:3000/ | Blocks indexed & extrinsics **> 0**; proposals may be 0 |
| `proposals.png` | http://localhost:3000/proposals | Table (empty state OK if no governance yet) |
| `treasury.png` | http://localhost:3000/treasury | Treasury table or empty state |
| `exports.png` | http://localhost:3000/exports | Export buttons + successful download |
| `settings.png` | http://localhost:3000/settings | API key configured + connection test OK |

### Capture steps (macOS)

1. Start stack per [README.md](../../README.md).
2. Run `./scripts/verify-e2e.sh` — confirm blocks/extrinsics > 0.
3. Open each URL above; wait for KPIs to load.
4. **Cmd+Shift+4** → spacebar → click window, or use Safari screenshot.
5. Save files into this folder with the names above.

## Sample exports (optional)

| File | Source |
|------|--------|
| `sample-overview.json` | Dashboard → Exports → Overview JSON |
| `sample-proposals.csv` | Dashboard → Exports → Proposals CSV |

Redact any API keys before committing.

## Verify before publishing

```bash
./scripts/verify-e2e.sh
ls -la docs/assets/*.png
```

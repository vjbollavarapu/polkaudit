# PolkaAudit

PolkaAudit monorepo containing:

- **Indexer**: Python service for indexing data.
- **Backend**: FastAPI service for API endpoints.
- **Dashboard**: Next.js frontend application.

## Structure

- `/apps/indexer`: Python indexer
- `/apps/backend`: FastAPI backend
- `/apps/dashboard`: Next.js dashboard
- `/docs`: Documentation
- `/reports`: Generated reports

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Poetry (for Python dependency management)
- Docker (optional, for containerized run)

### Development

Run `make help` to see available commands.

```bash
make fmt   # Format code
make lint  # Lint code
make test  # Run tests
```

.PHONY: fmt lint test typecheck ci dev dev-up dev-down verify-e2e hybrid-verify check-governance demo-backfill help

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

fmt: ## Run formatters
	@echo "Running formatters..."
	poetry run black . || true
	poetry run isort . || true
	npm run format --prefix apps/dashboard || true

lint: ## Run linters
	@echo "Running linters..."
	poetry run flake8 . || true
	npm run lint --prefix apps/dashboard || true

test: ## Run tests
	@echo "Running tests..."
	poetry run pytest || true
	npm run test --prefix apps/dashboard || true

typecheck: ## Run type checkers
	@echo "Running type checkers..."
	poetry run mypy . || true
	npm run typecheck --prefix apps/dashboard || true

ci: fmt lint test typecheck ## Run all checks (CI mode)

dev: dev-up ## Start full stack via Docker Compose

dev-up: ## Build and start postgres + backend + indexer + dashboard
	docker compose up --build

dev-down: ## Stop Docker Compose stack
	docker compose down

verify-e2e: ## Run automated health/stats/export checks (local stack)
	@chmod +x scripts/verify-e2e.sh
	@./scripts/verify-e2e.sh

hybrid-verify: ## Verify Oracle indexer + GCP Cloud Run (set BACKEND_URL, API_KEY)
	@chmod +x scripts/hybrid-verify.sh
	@./scripts/hybrid-verify.sh

check-governance: ## DB + API counts for proposals/votes/treasury
	@chmod +x scripts/check-governance-data.sh
	@./scripts/check-governance-data.sh

demo-backfill: ## Reset indexer tables + set demo INDEXER_START_BLOCK (interactive)
	@chmod +x scripts/demo-backfill.sh
	@./scripts/demo-backfill.sh

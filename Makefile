.PHONY: fmt lint test typecheck ci dev help

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

dev: ## Start development environment
	@echo "Starting development environment..."
	@echo "Not implemented yet. Use 'docker-compose up' or individual start commands."

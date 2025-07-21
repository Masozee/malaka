GOCMD=go
GOBUILD=$(GOCMD) build
GOCLEAN=$(GOCMD) clean
GOTEST=$(GOCMD) test
GOMOD=$(GOCMD) mod
GOOSE=$(GOCMD) run github.com/pressly/goose/v3/cmd/goose@latest
DOCKER_COMPOSE=docker-compose

.PHONY: all build clean test run migrate_up migrate_down docker-up docker-down docker-build docker-logs docker-clean

all: build

build:
	$(GOBUILD) -o bin/malaka ./cmd/server

clean:
	$(GOCLEAN)
	rm -f bin/malaka

test:
	$(GOTEST) ./...

run:
	$(GOBUILD) -o bin/malaka ./cmd/server
	./bin/malaka

migrate_up:
	$(GOOSE) -dir "./internal/pkg/database/migrations" postgres "host=localhost port=5432 user=postgres password=$(DB_PASSWORD) dbname=malaka sslmode=disable" up

migrate_down:
	$(GOOSE) -dir "./internal/pkg/database/migrations" postgres "host=localhost port=5432 user=postgres password=$(DB_PASSWORD) dbname=malaka sslmode=disable" down

# Docker commands
docker-up:
	$(DOCKER_COMPOSE) up -d

docker-down:
	$(DOCKER_COMPOSE) down

docker-build:
	$(DOCKER_COMPOSE) build

docker-logs:
	$(DOCKER_COMPOSE) logs -f

docker-clean:
	$(DOCKER_COMPOSE) down -v --remove-orphans
	docker system prune -f

# Development with Docker
docker-dev:
	$(DOCKER_COMPOSE) --profile dev up -d

docker-dev-down:
	$(DOCKER_COMPOSE) --profile dev down

# Production with Docker
docker-prod-up:
	$(DOCKER_COMPOSE) -f docker-compose.yml -f docker-compose.prod.yml up -d

docker-prod-down:
	$(DOCKER_COMPOSE) -f docker-compose.yml -f docker-compose.prod.yml down

docker-prod-build:
	$(DOCKER_COMPOSE) -f docker-compose.yml -f docker-compose.prod.yml build

# Database operations with Docker
docker-db-reset:
	$(DOCKER_COMPOSE) stop postgres
	$(DOCKER_COMPOSE) rm -f postgres
	docker volume rm malaka_postgres_data
	$(DOCKER_COMPOSE) up -d postgres

docker-db-logs:
	$(DOCKER_COMPOSE) logs -f postgres

docker-redis-logs:
	$(DOCKER_COMPOSE) logs -f redis

# Application operations with Docker
docker-app-rebuild:
	$(DOCKER_COMPOSE) build malaka-app
	$(DOCKER_COMPOSE) up -d malaka-app

docker-app-logs:
	$(DOCKER_COMPOSE) logs -f malaka-app

# Health checks
docker-health:
	@echo "Checking container health..."
	@$(DOCKER_COMPOSE) ps
	@echo "\nChecking application health..."
	@curl -f http://localhost:8080/health || echo "Application not ready"

# Backup and restore
docker-backup:
	@echo "Creating database backup..."
	@$(DOCKER_COMPOSE) exec postgres pg_dump -U postgres malaka > backup_$(shell date +%Y%m%d_%H%M%S).sql

docker-restore:
	@read -p "Enter backup file path: " backup_file; \
	$(DOCKER_COMPOSE) exec -T postgres psql -U postgres malaka < $$backup_file

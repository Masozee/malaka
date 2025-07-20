# Malaka ERP

A backend ERP system for YONGKI KOMALADI.

## Overview

This project is a comprehensive ERP system built with Go, following a strict Clean Architecture pattern. It covers various business domains such as master data, inventory, sales, finance, and shipping. The development process emphasizes Test-Driven Development (TDD) and robust security practices.

## Technology Stack

- **Language:** Go
- **Framework:** Gin
- **Database:** PostgreSQL
- **Containerization:** Docker
- **Migration Tool:** Goose
- **Caching:** Redis

## Architecture

The project adheres to Clean Architecture principles, separating concerns into distinct layers:

-   **Domain Layer (`domain/`):** Contains core business entities, repository interfaces, and domain services.
-   **Infrastructure Layer (`infrastructure/`):** Handles persistence (database) and external service integrations.
-   **Presentation Layer (`presentation/`):** Manages HTTP handlers, DTOs, and routing.
-   **Shared (`shared/`):** Provides cross-cutting concerns like authentication, logging, and database connections.

Modules are organized under `internal/modules/` (e.g., `masterdata`, `inventory`, `sales`).

## Getting Started

### Prerequisites

-   Go (latest stable version)
-   Docker and Docker Compose
-   PostgreSQL client (optional, for direct database interaction)
-   `make` utility

### Database Configuration

-   **Driver:** PostgreSQL
-   **User:** `postgres`
-   **Password:** `TanahAbang1971`
-   **DB Name:** `malaka`
-   **Connection String:** `postgres://postgres:TanahAbang1971@localhost:5432/malaka?sslmode=disable`
-   **Migration Path:** `./internal/pkg/database/migrations`

### Local Development

1.  **Create an environment file:**
    ```bash
    cp .env.example .env
    ```
2.  **Update `.env`** with your specific environment variables, especially `DB_PASSWORD` and `REDIS_PASSWORD` if they differ from defaults.

3.  **Start the full Docker environment (recommended):**
    ```bash
    make docker-up
    ```
    This will build and start all services (PostgreSQL, Redis, Malaka App, Nginx).

4.  **Run database migrations:**
    ```bash
    make migrate_up
    ```

5.  **Access the application:**
    The Malaka App will be accessible via Nginx, typically on `http://localhost` (or port 80/443 if configured).

### Development Commands

Use the `Makefile` for common development tasks:

-   **Build the application:**
    ```bash
    make build
    ```

-   **Clean build artifacts:**
    ```bash
    make clean
    ```

-   **Run the application (builds and starts):**
    ```bash
    make run
    ```

-   **Run tests:**
    ```bash
    make test
    ```
    For verbose output and race detection:
    ```bash
    go test ./... -v -race
    ```

-   **Run database migrations up:**
    ```bash
    make migrate_up
    ```

-   **Rollback database migrations:**
    ```bash
    make migrate_down
    ```

### Docker Environment Commands

-   **Start all services with Docker:**
    ```bash
    make docker-up
    ```

-   **Stop all services:**
    ```bash
    make docker-down
    ```

-   **View application logs:**
    ```bash
    make docker-app-logs
    ```

-   **Reset database with seed data:**
    ```bash
    make docker-db-reset
    ```

## Security

-   **Authentication:** JWT with bcrypt for password hashing.
-   **Authorization:** Role-Based Access Control (RBAC).
-   **API Security:** Input validation and sanitization to prevent common vulnerabilities like SQL injection.
-   **Secrets Management:** Environment variables (`app.env`) or secrets manager.

## Contributing

We welcome contributions to the Malaka ERP project! Please adhere to the following guidelines:

-   **Test-Driven Development (TDD):** All new features and bug fixes should be accompanied by comprehensive tests written before the implementation.
-   **Clean Architecture:** Maintain the established Clean Architecture and module structure.
-   **Indonesian Dummy Data:** When implementing new features that require seed data, ensure you create realistic Indonesian dummy data in `./internal/pkg/database/seeds/`.

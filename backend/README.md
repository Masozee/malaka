# Malaka ERP

A backend ERP system for YONGKI KOMALADI.

## Overview

This project is a comprehensive ERP system built with Go. It follows a clean architecture pattern and utilizes a PostgreSQL database. The development process is guided by Test-Driven Development (TDD) principles.

## Technology Stack

- **Language:** Go
- **Database:** PostgreSQL
- **Containerization:** Docker

## Getting Started

### Prerequisites

- Go (latest version)
- Docker and Docker Compose
- PostgreSQL client

### Database Setup

The application requires a PostgreSQL database. You can use the provided Docker setup or connect to your own instance.

- **Username:** `postgres`
- **Password:** `TanahAbang1971`
- **Database Name:** `malaka`

To initialize the database with Docker, you can run:
```bash
docker-compose up -d db
```

### Running the Application

1.  **Create an environment file:**
    ```bash
    cp .env.example .env
    ```
2.  **Update `.env`** with your database credentials if they differ from the defaults.

3.  **Run the server:**
    ```bash
    go run cmd/server/main.go
    ```
    Or using Docker:
    ```bash
    docker-compose up --build app
    ```

## Testing

This project adheres to a strict Test-Driven Development (TDD) workflow. To run the tests, execute the following command:

```bash
go test ./...
```

# MALAKA ERP - Docker Setup Guide

This guide provides comprehensive instructions for running the MALAKA ERP system using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Make (optional, for using Makefile commands)

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd malaka

# Copy environment file
cp .env.example .env

# Edit environment variables (optional)
nano .env
```

### 2. Start the Application

```bash
# Start all services
make docker-up

# Or using docker-compose directly
docker-compose up -d
```

### 3. Access the Application

- **Application**: http://localhost:8080
- **Database Admin (Adminer)**: http://localhost:8081
- **Redis Commander**: http://localhost:8082
- **Health Check**: http://localhost:8080/health

## Services Overview

### Core Services

| Service | Port | Description |
|---------|------|-------------|
| malaka-app | 8080 | Main ERP application |
| postgres | 5432 | PostgreSQL database |
| redis | 6379 | Redis cache |

### Management Tools (Development)

| Service | Port | Credentials |
|---------|------|-------------|
| adminer | 8081 | Server: postgres, User: postgres, Password: TanahAbang1971 |
| redis-commander | 8082 | User: admin, Password: TanahAbang1971 |

## Docker Compose Files

### `docker-compose.yml` (Base Configuration)
- Core services configuration
- Production-ready defaults
- Health checks enabled

### `docker-compose.override.yml` (Development)
- Automatically loaded in development
- Enables debug mode
- Loads seed data
- Exposes all service ports

### `docker-compose.prod.yml` (Production)
- Production optimizations
- Resource limits
- Security hardening
- Nginx reverse proxy

## Available Commands

### Basic Operations

```bash
# Start services
make docker-up

# Stop services
make docker-down

# Build images
make docker-build

# View logs
make docker-logs

# Clean everything
make docker-clean
```

### Development Commands

```bash
# Start with management tools
make docker-dev

# Stop development services
make docker-dev-down

# Rebuild application
make docker-app-rebuild

# View application logs
make docker-app-logs
```

### Production Commands

```bash
# Start production environment
make docker-prod-up

# Stop production environment
make docker-prod-down

# Build production images
make docker-prod-build
```

### Database Operations

```bash
# Reset database (removes all data)
make docker-db-reset

# View database logs
make docker-db-logs

# Create database backup
make docker-backup

# Restore database backup
make docker-restore
```

### Health Monitoring

```bash
# Check container health
make docker-health

# View Redis logs
make docker-redis-logs
```

## Environment Variables

### Required Variables

```bash
# Database
DB_PASSWORD=TanahAbang1971
DB_HOST=postgres
DB_NAME=malaka

# Redis
REDIS_PASSWORD=TanahAbang1971
REDIS_HOST=redis

# Application
JWT_SECRET=your-secret-key
```

### Optional Variables

```bash
# Development
LOAD_SEED_DATA=true
GIN_MODE=debug
LOG_LEVEL=debug

# Production
DOMAIN=your-domain.com
SSL_EMAIL=your-email@domain.com
```

## Data Persistence

### Volumes

- `postgres_data`: PostgreSQL data
- `redis_data`: Redis data

### Backup Strategy

```bash
# Create backup
make docker-backup

# The backup file will be created as backup_YYYYMMDD_HHMMSS.sql
```

## Development Workflow

### 1. Start Development Environment

```bash
make docker-dev
```

### 2. Code Changes

- Application code changes require rebuilding:
  ```bash
  make docker-app-rebuild
  ```

### 3. Database Changes

- New migrations are automatically applied on container restart
- Reset database to apply seed data:
  ```bash
  make docker-db-reset
  ```

### 4. Debugging

```bash
# View application logs
make docker-app-logs

# Enter application container
docker-compose exec malaka-app sh

# Enter database container
docker-compose exec postgres psql -U postgres -d malaka
```

## Production Deployment

### 1. Prepare Environment

```bash
# Create production environment file
cp .env.example .env.prod

# Edit production variables
nano .env.prod
```

### 2. Deploy

```bash
# Build and start production services
make docker-prod-build
make docker-prod-up
```

### 3. SSL Configuration

- Place SSL certificates in `config/ssl/`
- Update nginx configuration
- Restart services

## Troubleshooting

### Common Issues

#### Application Won't Start

```bash
# Check logs
make docker-app-logs

# Check database connection
make docker-db-logs

# Verify environment variables
docker-compose config
```

#### Database Connection Issues

```bash
# Check PostgreSQL status
make docker-db-logs

# Verify database initialization
docker-compose exec postgres psql -U postgres -c "\l"
```

#### Redis Connection Issues

```bash
# Check Redis status
make docker-redis-logs

# Test Redis connection
docker-compose exec redis redis-cli ping
```

#### Port Conflicts

```bash
# Check port usage
netstat -tulpn | grep :8080

# Modify ports in docker-compose.yml
```

### Performance Optimization

#### Resource Limits

```yaml
# In docker-compose.prod.yml
deploy:
  resources:
    limits:
      memory: 512M
    reservations:
      memory: 256M
```

#### Database Optimization

```bash
# Monitor database performance
docker-compose exec postgres pg_stat_activity

# Check database size
docker-compose exec postgres psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('malaka'));"
```

## Security Considerations

### Production Security

1. **Change default passwords**
2. **Use environment variables for secrets**
3. **Enable SSL/TLS**
4. **Restrict network access**
5. **Regular security updates**

### Network Security

```bash
# Disable external access to database
# Remove ports mapping in production
```

### Data Security

```bash
# Regular backups
make docker-backup

# Encrypt sensitive data
# Use Docker secrets for production
```

## Monitoring and Logging

### Log Management

```bash
# View all logs
make docker-logs

# View specific service logs
docker-compose logs -f malaka-app
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Health Monitoring

```bash
# Check service health
make docker-health

# Individual service health
docker-compose ps
```

## Scaling

### Horizontal Scaling

```yaml
# Scale application instances
docker-compose up -d --scale malaka-app=3
```

### Load Balancing

- Use nginx or external load balancer
- Configure sticky sessions if needed
- Monitor resource usage

## Maintenance

### Regular Updates

```bash
# Update base images
docker-compose pull

# Rebuild with latest changes
make docker-build

# Clean unused resources
make docker-clean
```

### Database Maintenance

```bash
# Vacuum database
docker-compose exec postgres psql -U postgres -d malaka -c "VACUUM ANALYZE;"

# Check database statistics
docker-compose exec postgres psql -U postgres -d malaka -c "SELECT schemaname,tablename,n_tup_ins,n_tup_upd,n_tup_del FROM pg_stat_user_tables;"
```

## Support

For issues and questions:
1. Check logs: `make docker-logs`
2. Verify configuration: `docker-compose config`
3. Review this documentation
4. Create an issue in the repository
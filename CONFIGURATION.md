# 🎛️ Malaka ERP - Unified Configuration Guide

## 📋 Overview

All Malaka ERP configuration is now centralized in a **single `.env` file** at the project root. This replaces all previous scattered configuration files and provides a unified source of truth for all services.

## 🗂️ What Was Consolidated

### ❌ **Removed Files** (now redundant):
- `backend/app.env`
- `backend/app.env.local`
- `backend/test.env`
- `backend/.env`
- `backend/.env.local`
- `backend/.env.example`
- `frontend/.env.local`
- `frontend/.env.example`
- `.env.dev`
- `.env.example`

### ✅ **Single Configuration File**:
- **`.env`** (project root) - **Contains everything**

## 🚀 Quick Start

### **Development (Default)**
```bash
# Everything is pre-configured for development
docker-compose up --build
```

### **Production Deployment**
```bash
# Edit .env file and uncomment production overrides:
ENVIRONMENT=production
NODE_ENV=production
GIN_MODE=release
DEBUG=false
LOG_LEVEL=info
DB_PASSWORD=your-secure-production-password
JWT_SECRET=your-production-jwt-secret-min-32-characters
MINIO_ROOT_PASSWORD=your-secure-minio-password
GF_SECURITY_ADMIN_PASSWORD=your-secure-grafana-password

# Then start production services
docker-compose up --build
```

## 🔧 Configuration Sections

### **1. Application Settings**
```env
APP_NAME=Malaka ERP
APP_VERSION=1.0.0
ENVIRONMENT=development
```

### **2. Database (PostgreSQL)**
```env
DB_HOST=postgres
DB_PASSWORD=TanahAbang1971
DB_SOURCE=postgres://postgres:TanahAbang1971@postgres:5432/malaka?sslmode=disable
```

### **3. Redis Multi-Database Setup**
```env
REDIS_HOST=redis
REDIS_PORT=6379
# Organized database allocation:
REDIS_DB_MASTER_DATA=0    # Companies, users, articles
REDIS_DB_INVENTORY=1      # Stock, purchase orders
REDIS_DB_SALES=2          # Orders, invoices
REDIS_DB_FINANCE=3        # Payments, accounts
REDIS_DB_SHIPPING=4       # Couriers, shipments
REDIS_DB_HR=5             # Employees, payroll
REDIS_DB_ACCOUNTING=6     # General ledger
REDIS_DB_REPORTS=7        # Expensive reports
REDIS_DB_SESSION=8        # User sessions
REDIS_DB_CONFIG=9         # Settings
```

### **4. Object Storage (MinIO)**
```env
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123
MINIO_ENDPOINT=minio:9000
```

### **5. Frontend Configuration**
```env
NEXT_PUBLIC_API_URL=http://localhost:8084
NEXT_PUBLIC_WEATHER_API_KEY=735a8cdbe6d5e092ca6d0228f072dcc9
```

### **6. Monitoring Stack**
```env
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
GF_SECURITY_ADMIN_USER=admin
GF_SECURITY_ADMIN_PASSWORD=admin
```

## 📊 Service Access URLs

### **Core Services**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8084
- **Database**: localhost:5432

### **Management Tools**
- **Adminer (PostgreSQL GUI)**: http://localhost:8085
- **Redis Commander**: http://localhost:8086
- **MinIO Console**: http://localhost:9001

### **Monitoring**
- **Grafana**: http://localhost:3001
- **Prometheus**: http://localhost:9090
- **AlertManager**: http://localhost:9093

## 🔒 Security Notes

### **Development Defaults**
- Database password: `TanahAbang1971`
- JWT Secret: Pre-configured for development
- All management tools have default passwords

### **Production Requirements**
⚠️ **IMPORTANT**: Change these values for production:
- `DB_PASSWORD`: Use a strong database password
- `JWT_SECRET`: Minimum 32 characters, cryptographically secure
- `MINIO_ROOT_PASSWORD`: Strong MinIO password
- `GF_SECURITY_ADMIN_PASSWORD`: Secure Grafana password
- `REDIS_COMMANDER_PASSWORD`: Redis Commander password

## 🎯 Redis Database Organization

The Redis setup provides **16 databases (0-15)** with clear organization:

| Database | Purpose | Examples |
|----------|---------|----------|
| 0 | Master Data Cache | Companies, users, articles, customers |
| 1 | Inventory Cache | Stock balances, purchase orders |
| 2 | Sales Cache | Sales orders, invoices |
| 3 | Finance Cache | Payments, accounting data |
| 4 | Shipping Cache | Couriers, shipments, manifests |
| 5 | HR Cache | Employees, payroll, attendance |
| 6 | Accounting Cache | General ledger, journal entries |
| 7 | Reports Cache | Expensive computed reports |
| 8 | Session Cache | User sessions, JWT tokens |
| 9 | Configuration Cache | Settings, feature flags |
| 10-15 | Reserved | Future modules |

## 🔄 Environment Switching

### **Switch to Production**
```bash
# Edit .env file:
ENVIRONMENT=production
GIN_MODE=release
DEBUG=false
LOG_LEVEL=info
```

### **Switch to Development**
```bash
# Edit .env file:
ENVIRONMENT=development
GIN_MODE=debug
DEBUG=true
LOG_LEVEL=debug
```

## 📝 Adding New Configuration

When adding new services or features:

1. **Add variables to `.env`** with clear section headers
2. **Use consistent naming**: `SERVICE_SETTING_NAME`
3. **Provide development defaults**
4. **Document in production overrides section**
5. **Update docker-compose.yml** to use `${VARIABLE_NAME}`

## 🛠️ Troubleshooting

### **Environment Variables Not Loading**
```bash
# Verify .env file exists
ls -la .env

# Check docker-compose can read variables
docker-compose config
```

### **Service Connection Issues**
```bash
# Check all services are using unified .env
docker-compose ps

# Verify environment variable values
docker-compose exec malaka-backend env | grep DB_
```

### **Redis Database Issues**
```bash
# Check Redis database allocation
redis-cli info keyspace

# Verify specific database has data
redis-cli -n 0 keys '*'  # Master data
redis-cli -n 1 keys '*'  # Inventory
```

## 🎉 Benefits

1. **Single Source of Truth**: All configuration in one place
2. **No More File Confusion**: No need to hunt for the right .env file
3. **Environment Switching**: Easy development/production toggle
4. **Clear Organization**: Redis databases clearly organized by business domain
5. **Docker Integration**: All services use the same variables
6. **Security Ready**: Production overrides clearly documented

---

**Result**: One file (`.env`) controls everything - backend, frontend, Docker, Redis, monitoring, and all external services! 🚀
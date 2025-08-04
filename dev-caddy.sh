#!/bin/bash

# Malaka ERP Development Environment with Caddy
# This script starts the development environment using Caddy instead of nginx

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info &> /dev/null; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed. Please install it first."
    exit 1
fi

print_status "Starting Malaka ERP Development Environment with Caddy..."

# Check if .env file exists, create a basic one if not
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating a basic one..."
    cat > .env << EOF
# Database
DB_PASSWORD=TanahAbang1971

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123
MINIO_REGION_NAME=us-west-1

# Redis Commander
REDIS_COMMANDER_PASSWORD=admin123

# Grafana
GF_SECURITY_ADMIN_PASSWORD=admin
EOF
    print_success "Created .env file with default values"
fi

# Stop any running containers from the nginx version
print_status "Stopping any existing containers..."
docker-compose down 2>/dev/null || true

# Clean up any orphaned containers
docker-compose -f docker-compose.caddy.yml down --remove-orphans 2>/dev/null || true

print_status "Building and starting services with Caddy..."

# Start services
docker-compose -f docker-compose.caddy.yml up -d --build

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Check if services are healthy
print_status "Checking service health..."

# Check PostgreSQL
if docker-compose -f docker-compose.caddy.yml exec -T postgres pg_isready -U postgres -d malaka &> /dev/null; then
    print_success "PostgreSQL is ready"
else
    print_warning "PostgreSQL might still be starting up"
fi

# Check Redis
if docker-compose -f docker-compose.caddy.yml exec -T redis redis-cli ping &> /dev/null; then
    print_success "Redis is ready"
else
    print_warning "Redis might still be starting up"
fi

# Check backend
if curl -f http://localhost:8084/health &> /dev/null; then
    print_success "Backend is ready"
else
    print_warning "Backend might still be starting up"
fi

# Check Caddy
if curl -f http://localhost:80 &> /dev/null; then
    print_success "Caddy is ready and proxying requests"
else
    print_warning "Caddy might still be starting up"
fi

print_success "Malaka ERP Development Environment with Caddy is starting up!"

cat << EOF

🎉 Malaka ERP Development Environment (Caddy) is running!

📊 Services Available:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Main Application:     http://localhost (Caddy)
🔒 Main Application SSL: https://localhost (Caddy with self-signed cert)
📱 Frontend (direct):    http://localhost:3000 (if needed)
🔧 Backend API (direct): http://localhost:8084
🗄️  Database (Adminer):  http://localhost:8085
📊 Redis Commander:      http://localhost:8086
📈 Grafana:              http://localhost:3001 (admin/admin)
📊 Prometheus:           http://localhost:9090
🚨 Alertmanager:         http://localhost:9093
📁 MinIO Console:        http://localhost:9001 (minioadmin/minioadmin123)
🔧 Caddy Admin API:      http://localhost:2019

🛠️  Development Tools:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Hot reload is enabled for both frontend and backend
• Caddy automatically handles HTTPS with self-signed certificates
• Caddy admin API available at localhost:2019
• Health checks are configured for all services

📝 Useful Commands:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
View logs:           docker-compose -f docker-compose.caddy.yml logs -f [service]
Stop services:       docker-compose -f docker-compose.caddy.yml down
Restart service:     docker-compose -f docker-compose.caddy.yml restart [service]
View Caddy config:   curl http://localhost:2019/config/
Reload Caddy:        curl -X POST http://localhost:2019/load

📋 What's Different with Caddy:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Automatic HTTPS with self-signed certificates
✅ Better HTTP/2 and HTTP/3 support
✅ Built-in health checks for backend services
✅ Simplified configuration (Caddyfile vs nginx.conf)
✅ Automatic certificate management
✅ Built-in admin API for configuration management
✅ Better WebSocket support for Next.js hot reload

⚠️  Note: For HTTPS to work properly, you may need to accept the self-signed certificate in your browser.

EOF

# Show running containers
print_status "Running containers:"
docker-compose -f docker-compose.caddy.yml ps
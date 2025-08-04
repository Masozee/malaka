#!/bin/bash

# Development Environment Startup Script for Malaka ERP

set -e

echo "🚀 Starting Malaka ERP Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Load environment variables
if [ -f .env.dev ]; then
    export $(cat .env.dev | grep -v '#' | xargs)
    echo "✅ Loaded development environment variables"
else
    echo "⚠️  .env.dev file not found, using defaults"
fi

# Function to handle cleanup
cleanup() {
    echo "🛑 Shutting down development environment..."
    docker compose -f docker-compose.dev.yml down
    exit 0
}

# Trap cleanup function on script exit
trap cleanup SIGINT SIGTERM

# Build and start development environment
echo "🏗️  Building and starting development containers..."
docker compose -f docker-compose.dev.yml up --build -d postgres redis malaka-backend

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
timeout=60
counter=0
while ! curl -f http://localhost:8084/health > /dev/null 2>&1; do
    if [ $counter -eq $timeout ]; then
        echo "❌ Backend failed to start within $timeout seconds"
        exit 1
    fi
    echo "⏳ Backend not ready yet, waiting... ($counter/$timeout)"
    sleep 2
    counter=$((counter + 1))
done

echo "✅ Backend is ready!"

# Start frontend with hot reload
echo "🎨 Starting frontend with hot reload..."
docker compose -f docker-compose.dev.yml up --build malaka-frontend

echo "✅ Development environment is ready!"
echo ""
echo "📍 Service URLs:"
echo "   Frontend (Hot Reload): http://localhost:3000"
echo "   Backend API:          http://localhost:8084"
echo "   Database Admin:       http://localhost:8085"
echo "   Redis Commander:      http://localhost:8086"
echo ""
echo "🔥 Hot reload is enabled! Your code changes will be reflected immediately."
echo "Press Ctrl+C to stop all services."

# Wait for user to stop
wait
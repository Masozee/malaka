#!/bin/bash

# Docker Environment Debug Script
# Run this on both macOS and Linux to compare

echo "=== Docker Environment Debug ==="
echo "Date: $(date)"
echo "OS: $(uname -a)"
echo "Docker version: $(docker --version)"
echo "Current directory: $(pwd)"
echo ""

echo "=== Local Build Context ==="
echo "Files in current directory:"
ls -la
echo ""

echo "=== cmd/server directory ==="
if [ -d "cmd/server" ]; then
    echo "cmd/server exists:"
    ls -la cmd/server/
else
    echo "❌ cmd/server directory not found!"
fi
echo ""

echo "=== Go Module Info ==="
echo "go.mod content:"
head -5 go.mod
echo ""

echo "=== File Permissions ==="
echo "cmd/server/main.go permissions:"
if [ -f "cmd/server/main.go" ]; then
    ls -la cmd/server/main.go
    echo "File is readable: $(test -r cmd/server/main.go && echo 'YES' || echo 'NO')"
else
    echo "❌ main.go not found!"
fi
echo ""

echo "=== Line Endings Check ==="
if [ -f "cmd/server/main.go" ]; then
    echo "Line ending type:"
    file cmd/server/main.go
else
    echo "❌ Cannot check line endings - main.go not found"
fi
echo ""

echo "=== Docker Build Context Test ==="
echo "Creating test Dockerfile..."
cat > Dockerfile.test << 'EOF'
FROM golang:1.24-alpine
WORKDIR /app
COPY . .
RUN echo "=== Inside Docker ===" && \
    pwd && \
    ls -la && \
    echo "=== cmd check ===" && \
    ls -la cmd/ && \
    echo "=== cmd/server check ===" && \
    ls -la cmd/server/ && \
    echo "=== go.mod check ===" && \
    cat go.mod | head -5
EOF

echo "Building test image..."
if docker build -f Dockerfile.test -t test-debug . --no-cache; then
    echo "✅ Test build successful"
else
    echo "❌ Test build failed"
fi

echo "Cleaning up test files..."
rm -f Dockerfile.test

echo ""
echo "=== Debug Complete ==="
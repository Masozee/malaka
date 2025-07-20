#!/bin/bash

# Test Build Script for Malaka Backend
# This script tests various build approaches to identify the best one for Docker

echo "=== Malaka Backend Build Test ==="
echo "Current directory: $(pwd)"
echo "Go version: $(go version)"
echo ""

# Check directory structure
echo "=== Directory Structure ==="
echo "Root files:"
ls -la
echo ""
echo "cmd/ structure:"
ls -la cmd/
echo ""
echo "cmd/server/ structure:"
ls -la cmd/server/
echo ""

# Test different build approaches
echo "=== Build Test 1: Using main.go file ==="
if CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags '-w -s' -o malaka-test1 ./cmd/server/main.go; then
    echo "✅ Build with main.go: SUCCESS"
    ls -la malaka-test1
    rm -f malaka-test1
else
    echo "❌ Build with main.go: FAILED"
fi
echo ""

echo "=== Build Test 2: Using package directory ==="
if CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags '-w -s' -o malaka-test2 ./cmd/server; then
    echo "✅ Build with package directory: SUCCESS"
    ls -la malaka-test2
    rm -f malaka-test2
else
    echo "❌ Build with package directory: FAILED"
fi
echo ""

echo "=== Build Test 3: Standard go build ==="
if go build -o malaka-test3 ./cmd/server/main.go; then
    echo "✅ Standard build: SUCCESS"
    ls -la malaka-test3
    rm -f malaka-test3
else
    echo "❌ Standard build: FAILED"
fi
echo ""

echo "=== Go Module Information ==="
echo "Module name: $(go mod edit -print | grep 'module ')"
echo "Go version in go.mod: $(go mod edit -print | grep 'go ')"
echo ""

echo "=== Module Dependencies Check ==="
if go mod tidy; then
    echo "✅ go mod tidy: SUCCESS"
else
    echo "❌ go mod tidy: FAILED"
fi
echo ""

echo "=== Module Verification ==="
if go mod verify; then
    echo "✅ go mod verify: SUCCESS"
else
    echo "❌ go mod verify: FAILED"
fi
echo ""

echo "=== Build Test Complete ==="
echo "All tests completed. Use the successful build command in your Dockerfile."
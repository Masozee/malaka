#!/bin/bash

# Nginx Configuration Test Script for erp.nurojilukmansyah.com
# This script tests the nginx configuration and connectivity

DOMAIN="erp.nurojilukmansyah.com"
BACKEND_URL="http://localhost:8080"

echo "Nginx Configuration Test for $DOMAIN"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Test 1: Check if nginx is installed and running
echo "1. Checking Nginx installation and status..."
if command -v nginx &> /dev/null; then
    print_status 0 "Nginx is installed"
    
    if systemctl is-active --quiet nginx 2>/dev/null || pgrep nginx >/dev/null 2>&1; then
        print_status 0 "Nginx is running"
    else
        print_status 1 "Nginx is not running"
        echo "   Start nginx with: sudo systemctl start nginx"
    fi
else
    print_status 1 "Nginx is not installed"
    echo "   Install with: sudo apt install nginx (Ubuntu/Debian) or brew install nginx (macOS)"
fi

echo ""

# Test 2: Check backend connectivity
echo "2. Checking backend connectivity..."
if curl -s --max-time 5 "$BACKEND_URL/health" > /dev/null; then
    print_status 0 "Backend is reachable at $BACKEND_URL"
    
    # Get backend response
    response=$(curl -s "$BACKEND_URL/health")
    if echo "$response" | grep -q "ok"; then
        print_status 0 "Backend health check passed"
    else
        print_warning "Backend responded but health check may have failed"
        echo "   Response: $response"
    fi
else
    print_status 1 "Backend is not reachable at $BACKEND_URL"
    echo "   Make sure your Malaka backend is running on localhost:8080"
fi

echo ""

# Test 3: Check nginx configuration syntax
echo "3. Testing Nginx configuration syntax..."
if sudo nginx -t &>/dev/null; then
    print_status 0 "Nginx configuration syntax is valid"
else
    print_status 1 "Nginx configuration has syntax errors"
    echo "   Run 'sudo nginx -t' for detailed error information"
fi

echo ""

# Test 4: Check if site is enabled
echo "4. Checking site configuration..."
if [ -f "/etc/nginx/sites-available/$DOMAIN" ]; then
    print_status 0 "Site configuration exists in sites-available"
    
    if [ -L "/etc/nginx/sites-enabled/$DOMAIN" ]; then
        print_status 0 "Site is enabled (symbolic link exists)"
    else
        print_status 1 "Site is not enabled"
        echo "   Enable with: sudo ln -s /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/"
    fi
else
    print_status 1 "Site configuration not found in /etc/nginx/sites-available/"
    echo "   Deploy configuration with: ./nginx/deploy-nginx-config.sh"
fi

echo ""

# Test 5: Check listening ports
echo "5. Checking listening ports..."
if netstat -tlnp 2>/dev/null | grep -q ":80.*nginx" || lsof -iTCP:80 -sTCP:LISTEN 2>/dev/null | grep -q nginx; then
    print_status 0 "Nginx is listening on port 80 (HTTP)"
else
    print_status 1 "Nginx is not listening on port 80"
fi

if netstat -tlnp 2>/dev/null | grep -q ":443.*nginx" || lsof -iTCP:443 -sTCP:LISTEN 2>/dev/null | grep -q nginx; then
    print_status 0 "Nginx is listening on port 443 (HTTPS)"
else
    print_warning "Nginx is not listening on port 443 (HTTPS may not be configured)"
fi

echo ""

# Test 6: Check SSL certificates (if HTTPS config exists)
echo "6. Checking SSL certificates..."
ssl_cert="/etc/nginx/ssl/$DOMAIN.crt"
ssl_key="/etc/nginx/ssl/$DOMAIN.key"

if [ -f "$ssl_cert" ] && [ -f "$ssl_key" ]; then
    print_status 0 "SSL certificate files exist"
    
    # Check certificate validity
    if openssl x509 -in "$ssl_cert" -checkend 86400 >/dev/null 2>&1; then
        print_status 0 "SSL certificate is valid and not expiring within 24 hours"
    else
        print_warning "SSL certificate is expired or expiring soon"
    fi
    
    # Check if key and certificate match
    cert_hash=$(openssl x509 -noout -modulus -in "$ssl_cert" 2>/dev/null | openssl md5)
    key_hash=$(openssl rsa -noout -modulus -in "$ssl_key" 2>/dev/null | openssl md5)
    
    if [ "$cert_hash" = "$key_hash" ]; then
        print_status 0 "SSL certificate and private key match"
    else
        print_status 1 "SSL certificate and private key do not match"
    fi
else
    print_warning "SSL certificate files not found (HTTP-only configuration?)"
    echo "   Generate certificates with: ./nginx/ssl/generate-ssl-cert.sh"
fi

echo ""

# Test 7: Test HTTP connectivity
echo "7. Testing HTTP connectivity..."
if curl -s --max-time 10 -H "Host: $DOMAIN" "http://localhost/" > /dev/null; then
    print_status 0 "HTTP request to domain successful"
    
    # Test API endpoint
    if curl -s --max-time 10 -H "Host: $DOMAIN" "http://localhost/health" | grep -q "ok"; then
        print_status 0 "API endpoint (/health) is accessible"
    else
        print_warning "API endpoint may not be working correctly"
    fi
else
    print_status 1 "HTTP request to domain failed"
    echo "   Check nginx configuration and ensure it's running"
fi

echo ""

# Test 8: Test HTTPS connectivity (if SSL is configured)
echo "8. Testing HTTPS connectivity..."
if [ -f "$ssl_cert" ]; then
    if curl -k -s --max-time 10 -H "Host: $DOMAIN" "https://localhost/" > /dev/null; then
        print_status 0 "HTTPS request to domain successful"
    else
        print_status 1 "HTTPS request to domain failed"
        echo "   Check SSL configuration and certificates"
    fi
else
    print_warning "Skipping HTTPS test (no SSL certificates found)"
fi

echo ""

# Test 9: Check file permissions
echo "9. Checking file permissions..."
web_root="/var/www/$DOMAIN"
if [ -d "$web_root" ]; then
    print_status 0 "Web root directory exists: $web_root"
    
    if [ -r "$web_root" ]; then
        print_status 0 "Web root directory is readable"
    else
        print_status 1 "Web root directory is not readable"
        echo "   Fix with: sudo chmod -R 755 $web_root"
    fi
else
    print_status 1 "Web root directory does not exist"
    echo "   Create with: sudo mkdir -p $web_root"
fi

echo ""

# Test 10: Check log files
echo "10. Checking log files..."
access_log="/var/log/nginx/$DOMAIN.access.log"
error_log="/var/log/nginx/$DOMAIN.error.log"

if [ -f "$access_log" ]; then
    print_status 0 "Access log exists: $access_log"
else
    print_warning "Access log not found (will be created on first request)"
fi

if [ -f "$error_log" ]; then
    print_status 0 "Error log exists: $error_log"
    
    # Check for recent errors
    if [ -s "$error_log" ]; then
        recent_errors=$(tail -10 "$error_log" | grep -E "(error|crit|alert|emerg)" | wc -l)
        if [ "$recent_errors" -gt 0 ]; then
            print_warning "Found $recent_errors recent error(s) in log"
            echo "   Check with: sudo tail /var/log/nginx/$DOMAIN.error.log"
        else
            print_status 0 "No recent errors in log"
        fi
    fi
else
    print_warning "Error log not found (will be created if errors occur)"
fi

echo ""
echo "============================================"
echo "Test Summary"
echo "============================================"

# Overall status
if command -v nginx &> /dev/null && systemctl is-active --quiet nginx 2>/dev/null && sudo nginx -t &>/dev/null; then
    echo -e "${GREEN}✓ Overall Status: GOOD${NC}"
    echo "Your Nginx configuration appears to be working correctly."
    echo ""
    echo "Next steps:"
    echo "1. Ensure DNS points to this server"
    echo "2. Test from external client: curl https://$DOMAIN/health"
    echo "3. Monitor logs: sudo tail -f /var/log/nginx/$DOMAIN.access.log"
else
    echo -e "${RED}✗ Overall Status: NEEDS ATTENTION${NC}"
    echo "Some issues were found that need to be addressed."
    echo ""
    echo "Recommended actions:"
    echo "1. Install/start Nginx if not running"
    echo "2. Deploy configuration: ./nginx/deploy-nginx-config.sh"
    echo "3. Generate SSL certificates: ./nginx/ssl/generate-ssl-cert.sh"
fi

echo ""
echo "Quick commands:"
echo "- View access logs: sudo tail -f /var/log/nginx/$DOMAIN.access.log"
echo "- View error logs: sudo tail -f /var/log/nginx/$DOMAIN.error.log"
echo "- Test configuration: sudo nginx -t"
echo "- Reload configuration: sudo systemctl reload nginx"
echo "- Test domain: curl -H 'Host: $DOMAIN' http://localhost/"
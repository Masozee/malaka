#!/bin/bash

# SSL Certificate Generation Script for erp.nurojilukmansyah.com
# This script generates self-signed certificates for development or sets up Let's Encrypt for production

DOMAIN="erp.nurojilukmansyah.com"
SSL_DIR="/etc/nginx/ssl"
DAYS=365

echo "SSL Certificate Setup for $DOMAIN"
echo "=================================="

# Create SSL directory if it doesn't exist
sudo mkdir -p $SSL_DIR

# Function to generate self-signed certificate
generate_self_signed() {
    echo "Generating self-signed certificate for development..."
    
    # Generate private key
    sudo openssl genrsa -out $SSL_DIR/$DOMAIN.key 2048
    
    # Generate certificate signing request
    sudo openssl req -new -key $SSL_DIR/$DOMAIN.key -out $SSL_DIR/$DOMAIN.csr -subj "/C=ID/ST=DKI Jakarta/L=Jakarta/O=Malaka ERP/OU=IT Department/CN=$DOMAIN/emailAddress=admin@nurojilukmansyah.com"
    
    # Generate self-signed certificate
    sudo openssl x509 -req -in $SSL_DIR/$DOMAIN.csr -signkey $SSL_DIR/$DOMAIN.key -out $SSL_DIR/$DOMAIN.crt -days $DAYS -extensions v3_req -extfile <(
cat <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C=ID
ST=DKI Jakarta
L=Jakarta
O=Malaka ERP
OU=IT Department
CN=$DOMAIN
emailAddress=admin@nurojilukmansyah.com

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = $DOMAIN
DNS.2 = www.$DOMAIN
EOF
)
    
    # Set proper permissions
    sudo chmod 600 $SSL_DIR/$DOMAIN.key
    sudo chmod 644 $SSL_DIR/$DOMAIN.crt
    
    echo "Self-signed certificate generated successfully!"
    echo "Certificate: $SSL_DIR/$DOMAIN.crt"
    echo "Private Key: $SSL_DIR/$DOMAIN.key"
    echo ""
    echo "Note: This is a self-signed certificate for development only."
    echo "Browsers will show security warnings. For production, use Let's Encrypt."
}

# Function to setup Let's Encrypt certificate
setup_letsencrypt() {
    echo "Setting up Let's Encrypt certificate for production..."
    
    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        echo "Installing certbot..."
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Ubuntu/Debian
            sudo apt update
            sudo apt install -y certbot python3-certbot-nginx
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            brew install certbot
        else
            echo "Please install certbot manually for your operating system"
            exit 1
        fi
    fi
    
    # Stop nginx temporarily for standalone mode
    sudo systemctl stop nginx 2>/dev/null || sudo service nginx stop 2>/dev/null
    
    # Generate certificate using standalone mode
    sudo certbot certonly \
        --standalone \
        --email admin@nurojilukmansyah.com \
        --agree-tos \
        --no-eff-email \
        -d $DOMAIN \
        -d www.$DOMAIN
    
    # Copy certificates to nginx ssl directory
    sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $SSL_DIR/$DOMAIN.crt
    sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $SSL_DIR/$DOMAIN.key
    
    # Set proper permissions
    sudo chmod 600 $SSL_DIR/$DOMAIN.key
    sudo chmod 644 $SSL_DIR/$DOMAIN.crt
    
    # Setup auto-renewal
    echo "Setting up certificate auto-renewal..."
    (sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx") | sudo crontab -
    
    echo "Let's Encrypt certificate generated successfully!"
    echo "Certificate: $SSL_DIR/$DOMAIN.crt"
    echo "Private Key: $SSL_DIR/$DOMAIN.key"
    echo "Auto-renewal configured via cron job."
}

# Function to test SSL configuration
test_ssl() {
    echo "Testing SSL configuration..."
    
    if [[ -f "$SSL_DIR/$DOMAIN.crt" && -f "$SSL_DIR/$DOMAIN.key" ]]; then
        # Test certificate validity
        openssl x509 -in $SSL_DIR/$DOMAIN.crt -text -noout | grep -E "(Subject:|Issuer:|Not Before:|Not After:|DNS:)"
        echo ""
        
        # Test key and certificate match
        cert_hash=$(openssl x509 -noout -modulus -in $SSL_DIR/$DOMAIN.crt | openssl md5)
        key_hash=$(openssl rsa -noout -modulus -in $SSL_DIR/$DOMAIN.key | openssl md5)
        
        if [[ "$cert_hash" == "$key_hash" ]]; then
            echo "✓ Certificate and private key match"
        else
            echo "✗ Certificate and private key do not match"
            exit 1
        fi
        
        echo "✓ SSL certificate is ready for use"
    else
        echo "✗ SSL certificate files not found"
        exit 1
    fi
}

# Main menu
echo "Choose certificate type:"
echo "1) Self-signed certificate (for development)"
echo "2) Let's Encrypt certificate (for production)"
echo "3) Test existing certificate"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        generate_self_signed
        test_ssl
        ;;
    2)
        setup_letsencrypt
        test_ssl
        ;;
    3)
        test_ssl
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "Next steps:"
echo "1. Copy the Nginx configuration to your sites-available directory"
echo "2. Create a symbolic link to sites-enabled"
echo "3. Test the Nginx configuration: sudo nginx -t"
echo "4. Reload Nginx: sudo systemctl reload nginx"
echo ""
echo "For HTTPS configuration, use: /Users/pro/Dev/malaka/nginx/sites-available/erp.nurojilukmansyah.com"
echo "For HTTP-only testing, use: /Users/pro/Dev/malaka/nginx/sites-available/erp.nurojilukmansyah.com-http"
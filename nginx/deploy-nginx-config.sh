#!/bin/bash

# Nginx Configuration Deployment Script for erp.nurojilukmansyah.com
# This script deploys the nginx configuration to the system

DOMAIN="erp.nurojilukmansyah.com"
CONFIG_DIR="/Users/pro/Dev/malaka/nginx"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
WEB_ROOT="/var/www/$DOMAIN"

echo "Nginx Configuration Deployment for $DOMAIN"
echo "============================================"

# Function to check if nginx is installed
check_nginx() {
    if ! command -v nginx &> /dev/null; then
        echo "Nginx is not installed. Installing..."
        
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Ubuntu/Debian
            sudo apt update
            sudo apt install -y nginx
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            brew install nginx
        else
            echo "Please install nginx manually for your operating system"
            exit 1
        fi
    else
        echo "✓ Nginx is installed"
    fi
}

# Function to create web root directory
create_web_root() {
    echo "Creating web root directory..."
    sudo mkdir -p $WEB_ROOT
    sudo mkdir -p /var/www/errors
    
    # Create a simple index.html if it doesn't exist
    if [[ ! -f "$WEB_ROOT/index.html" ]]; then
        sudo tee $WEB_ROOT/index.html > /dev/null <<EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Malaka ERP - Welcome</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 3rem;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        .api-links {
            margin-top: 2rem;
        }
        .api-links a {
            display: inline-block;
            margin: 0.5rem;
            padding: 0.8rem 1.5rem;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            text-decoration: none;
            border-radius: 10px;
            transition: all 0.3s ease;
        }
        .api-links a:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
        .status {
            margin-top: 2rem;
            font-size: 0.9rem;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏢 Malaka ERP</h1>
        <p>Enterprise Resource Planning System</p>
        <p>Welcome to your ERP application dashboard</p>
        
        <div class="api-links">
            <a href="/health">Health Check</a>
            <a href="/masterdata/companies/">Companies</a>
            <a href="/masterdata/users/">Users</a>
            <a href="/sales/">Sales</a>
            <a href="/inventory/">Inventory</a>
        </div>
        
        <div class="status">
            <p>Status: <span style="color: #4ade80;">🟢 Online</span></p>
            <p>Server: erp.nurojilukmansyah.com</p>
        </div>
    </div>
    
    <script>
        // Check API health status
        fetch('/health')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok') {
                    console.log('✓ Backend API is healthy');
                }
            })
            .catch(error => {
                console.log('⚠ Backend API check failed:', error);
            });
    </script>
</body>
</html>
EOF
    fi
    
    # Create error pages
    sudo tee /var/www/errors/404.html > /dev/null <<EOF
<!DOCTYPE html>
<html>
<head>
    <title>404 - Page Not Found</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #e74c3c; }
    </style>
</head>
<body>
    <h1>404 - Page Not Found</h1>
    <p>The requested page could not be found.</p>
    <a href="/">Return to Home</a>
</body>
</html>
EOF
    
    sudo tee /var/www/errors/50x.html > /dev/null <<EOF
<!DOCTYPE html>
<html>
<head>
    <title>Server Error</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #e74c3c; }
    </style>
</head>
<body>
    <h1>500 - Server Error</h1>
    <p>The server encountered an internal error.</p>
    <a href="/">Return to Home</a>
</body>
</html>
EOF
    
    # Set proper permissions
    sudo chown -R www-data:www-data $WEB_ROOT 2>/dev/null || sudo chown -R nginx:nginx $WEB_ROOT 2>/dev/null
    sudo chmod -R 755 $WEB_ROOT
    
    echo "✓ Web root directory created: $WEB_ROOT"
}

# Function to deploy configuration
deploy_config() {
    echo "Deploying Nginx configuration..."
    
    # Choose configuration type
    echo ""
    echo "Choose configuration to deploy:"
    echo "1) HTTPS configuration (requires SSL certificates)"
    echo "2) HTTP-only configuration (for testing)"
    echo ""
    read -p "Enter your choice (1-2): " config_choice
    
    case $config_choice in
        1)
            config_file="$CONFIG_DIR/sites-available/$DOMAIN"
            echo "Deploying HTTPS configuration..."
            ;;
        2)
            config_file="$CONFIG_DIR/sites-available/$DOMAIN-http"
            echo "Deploying HTTP-only configuration..."
            ;;
        *)
            echo "Invalid choice. Exiting."
            exit 1
            ;;
    esac
    
    # Copy configuration to nginx directory
    sudo cp "$config_file" "$NGINX_SITES_AVAILABLE/$DOMAIN"
    
    # Create symbolic link to enable site
    sudo ln -sf "$NGINX_SITES_AVAILABLE/$DOMAIN" "$NGINX_SITES_ENABLED/$DOMAIN"
    
    # Remove default nginx site if it exists
    sudo rm -f "$NGINX_SITES_ENABLED/default"
    
    echo "✓ Configuration deployed to $NGINX_SITES_AVAILABLE/$DOMAIN"
    echo "✓ Site enabled via symbolic link"
}

# Function to test configuration
test_config() {
    echo "Testing Nginx configuration..."
    
    if sudo nginx -t; then
        echo "✓ Nginx configuration is valid"
        return 0
    else
        echo "✗ Nginx configuration has errors"
        return 1
    fi
}

# Function to restart nginx
restart_nginx() {
    echo "Restarting Nginx..."
    
    if sudo systemctl restart nginx 2>/dev/null || sudo service nginx restart 2>/dev/null; then
        echo "✓ Nginx restarted successfully"
    else
        echo "✗ Failed to restart Nginx"
        exit 1
    fi
}

# Function to show status
show_status() {
    echo ""
    echo "Deployment Status:"
    echo "=================="
    
    # Check if site is enabled
    if [[ -f "$NGINX_SITES_ENABLED/$DOMAIN" ]]; then
        echo "✓ Site is enabled"
    else
        echo "✗ Site is not enabled"
    fi
    
    # Check nginx status
    if systemctl is-active --quiet nginx 2>/dev/null || service nginx status >/dev/null 2>&1; then
        echo "✓ Nginx is running"
    else
        echo "✗ Nginx is not running"
    fi
    
    # Show listening ports
    echo ""
    echo "Listening ports:"
    sudo netstat -tlnp 2>/dev/null | grep nginx || sudo lsof -iTCP:80,443 -sTCP:LISTEN
    
    echo ""
    echo "Next steps:"
    echo "1. Ensure your domain DNS points to this server"
    echo "2. Test the site: curl -H 'Host: $DOMAIN' http://localhost/"
    echo "3. For HTTPS, generate SSL certificates using the SSL script"
    echo "4. Configure firewall to allow HTTP (80) and HTTPS (443) traffic"
    echo ""
    echo "Site URL: http://$DOMAIN (or https://$DOMAIN with SSL)"
}

# Main execution
echo "Starting deployment process..."

# Run deployment steps
check_nginx
create_web_root
deploy_config

echo ""
if test_config; then
    restart_nginx
    show_status
else
    echo "Deployment failed due to configuration errors."
    echo "Please check the Nginx configuration and try again."
    exit 1
fi

echo ""
echo "Deployment completed successfully! 🎉"
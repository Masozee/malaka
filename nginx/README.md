# Nginx Configuration for erp.nurojilukmansyah.com

This directory contains Nginx configuration files and deployment scripts for the Malaka ERP domain.

## 📁 Directory Structure

```
nginx/
├── sites-available/
│   ├── erp.nurojilukmansyah.com          # HTTPS configuration (production)
│   └── erp.nurojilukmansyah.com-http     # HTTP-only configuration (testing)
├── ssl/
│   └── generate-ssl-cert.sh              # SSL certificate generation script
├── deploy-nginx-config.sh                # Automated deployment script
└── README.md                             # This documentation
```

## 🚀 Quick Deployment

### 1. Deploy HTTP Configuration (for testing)

```bash
# Run the deployment script
sudo ./nginx/deploy-nginx-config.sh

# Choose option 2 for HTTP-only configuration
# This will:
# - Install nginx if needed
# - Create web root directory
# - Deploy configuration
# - Test and restart nginx
```

### 2. Deploy HTTPS Configuration (for production)

```bash
# First, generate SSL certificates
./nginx/ssl/generate-ssl-cert.sh

# Choose option 1 for self-signed (development) or option 2 for Let's Encrypt (production)

# Then deploy the HTTPS configuration
sudo ./nginx/deploy-nginx-config.sh

# Choose option 1 for HTTPS configuration
```

## 🔧 Manual Configuration

### Prerequisites

1. **Install Nginx**:
   ```bash
   # Ubuntu/Debian
   sudo apt update && sudo apt install nginx
   
   # CentOS/RHEL
   sudo yum install nginx
   
   # macOS
   brew install nginx
   ```

2. **Ensure backend is running**:
   ```bash
   # Your Malaka backend should be running on localhost:8080
   curl http://localhost:8080/health
   ```

### Manual Steps

1. **Copy configuration**:
   ```bash
   # For HTTP-only (testing)
   sudo cp nginx/sites-available/erp.nurojilukmansyah.com-http /etc/nginx/sites-available/erp.nurojilukmansyah.com
   
   # For HTTPS (production)
   sudo cp nginx/sites-available/erp.nurojilukmansyah.com /etc/nginx/sites-available/erp.nurojilukmansyah.com
   ```

2. **Enable the site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/erp.nurojilukmansyah.com /etc/nginx/sites-enabled/
   sudo rm -f /etc/nginx/sites-enabled/default  # Remove default site
   ```

3. **Create web directory**:
   ```bash
   sudo mkdir -p /var/www/erp.nurojilukmansyah.com
   sudo chown -R www-data:www-data /var/www/erp.nurojilukmansyah.com
   ```

4. **Test and reload**:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## 🔒 SSL Certificate Setup

### Option 1: Self-Signed Certificate (Development)

```bash
./nginx/ssl/generate-ssl-cert.sh
# Choose option 1
```

### Option 2: Let's Encrypt Certificate (Production)

```bash
./nginx/ssl/generate-ssl-cert.sh
# Choose option 2

# This will:
# - Install certbot if needed
# - Generate certificate for erp.nurojilukmansyah.com and www.erp.nurojilukmansyah.com
# - Set up auto-renewal cron job
```

### Manual SSL Setup

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx  # Ubuntu/Debian

# Generate certificate
sudo certbot --nginx -d erp.nurojilukmansyah.com -d www.erp.nurojilukmansyah.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## 🎯 Configuration Features

### Security Features
- **Modern SSL/TLS configuration** (TLS 1.2+ only)
- **Security headers** (HSTS, CSP, X-Frame-Options, etc.)
- **Rate limiting** (API: 10 req/s, Auth: 5 req/s)
- **Access control** for sensitive endpoints
- **Automatic HTTP to HTTPS redirect**

### Performance Features
- **Gzip compression** for static assets
- **HTTP/2 support**
- **Connection keepalive**
- **Static file caching**
- **Proxy buffering**

### API Features
- **Reverse proxy** to backend (localhost:8080)
- **CORS headers** for API endpoints
- **Load balancing ready** (upstream configuration)
- **Health check endpoint** exposure
- **Metrics endpoint** (restricted access)

## 📍 URL Routing

| URL Pattern | Backend Route | Description |
|-------------|---------------|-------------|
| `/` | Static files | Frontend application |
| `/health` | Backend `/health` | Health check endpoint |
| `/metrics` | Backend `/metrics` | Prometheus metrics (restricted) |
| `/api/*` | Backend `/api/*` | API endpoints |
| `/masterdata/*` | Backend `/masterdata/*` | Master data management |
| `/inventory/*` | Backend `/inventory/*` | Inventory management |
| `/sales/*` | Backend `/sales/*` | Sales management |
| `/finance/*` | Backend `/finance/*` | Financial management |
| `/shipping/*` | Backend `/shipping/*` | Shipping management |
| `/login`, `/auth/*` | Backend auth | Authentication (rate limited) |

## 🔧 Customization

### Backend Server Configuration

If your backend runs on a different port or server:

```nginx
upstream malaka_backend {
    server 127.0.0.1:8080;  # Change port here
    # Add more servers for load balancing:
    # server 127.0.0.1:8081;
    # server 192.168.1.100:8080;
}
```

### Rate Limiting

Adjust rate limits in the configuration:

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;    # API rate limit
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/s;    # Auth rate limit
```

### Security Headers

Modify Content Security Policy for your frontend needs:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; ...";
```

## 🧪 Testing

### Test HTTP Configuration

```bash
# Test local connection
curl -H "Host: erp.nurojilukmansyah.com" http://localhost/

# Test API endpoints
curl -H "Host: erp.nurojilukmansyah.com" http://localhost/health
curl -H "Host: erp.nurojilukmansyah.com" http://localhost/masterdata/companies/
```

### Test HTTPS Configuration

```bash
# Test HTTPS (with self-signed certificate)
curl -k -H "Host: erp.nurojilukmansyah.com" https://localhost/

# Test SSL certificate
openssl s_client -connect localhost:443 -servername erp.nurojilukmansyah.com
```

### Test from External Client

```bash
# Test actual domain (requires DNS setup)
curl https://erp.nurojilukmansyah.com/health
```

## 🔍 Troubleshooting

### Check Nginx Status

```bash
sudo systemctl status nginx
sudo nginx -t  # Test configuration
```

### Check Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/erp.nurojilukmansyah.com.access.log

# Error logs
sudo tail -f /var/log/nginx/erp.nurojilukmansyah.com.error.log

# Nginx error log
sudo tail -f /var/log/nginx/error.log
```

### Common Issues

1. **502 Bad Gateway**: Backend not running on localhost:8080
   ```bash
   # Check if backend is running
   curl http://localhost:8080/health
   ```

2. **Permission Denied**: Incorrect file permissions
   ```bash
   sudo chown -R www-data:www-data /var/www/erp.nurojilukmansyah.com
   sudo chmod -R 755 /var/www/erp.nurojilukmansyah.com
   ```

3. **SSL Certificate Errors**: Certificate not found or invalid
   ```bash
   # Check certificate files
   sudo ls -la /etc/nginx/ssl/
   sudo openssl x509 -in /etc/nginx/ssl/erp.nurojilukmansyah.com.crt -text -noout
   ```

## 🌐 DNS Configuration

For production deployment, configure your DNS:

```
# A Record
erp.nurojilukmansyah.com.    IN    A    YOUR_SERVER_IP

# CNAME Record (optional)
www.erp.nurojilukmansyah.com.    IN    CNAME    erp.nurojilukmansyah.com.
```

## 🛡️ Firewall Configuration

```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 📊 Monitoring

The configuration includes:
- **Access logging** to `/var/log/nginx/erp.nurojilukmansyah.com.access.log`
- **Error logging** to `/var/log/nginx/erp.nurojilukmansyah.com.error.log`
- **Metrics endpoint** accessible at `/metrics` (restricted to localhost)

## 🔄 Maintenance

### Update SSL Certificate

```bash
# For Let's Encrypt (automatic)
sudo certbot renew

# For manual certificates
./nginx/ssl/generate-ssl-cert.sh
sudo systemctl reload nginx
```

### Update Configuration

```bash
# Test new configuration
sudo nginx -t

# Reload without downtime
sudo systemctl reload nginx

# Full restart (if needed)
sudo systemctl restart nginx
```

## 🎉 Next Steps

1. **DNS Setup**: Point your domain to the server IP
2. **SSL Certificate**: Generate production SSL certificate
3. **Frontend**: Deploy your frontend application to `/var/www/erp.nurojilukmansyah.com`
4. **Monitoring**: Set up log monitoring and alerting
5. **Backup**: Configure automatic backups of certificates and configuration

Your ERP application is now ready to serve on `erp.nurojilukmansyah.com`! 🚀
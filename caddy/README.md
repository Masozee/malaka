# Caddy Configuration for Malaka ERP

This directory contains Caddy server configurations as an alternative to nginx for the Malaka ERP system.

## Overview

Caddy is a modern web server with automatic HTTPS, HTTP/2, and HTTP/3 support out of the box. It provides several advantages over nginx for development environments:

- **Automatic HTTPS**: Caddy automatically manages TLS certificates
- **Simplified Configuration**: Caddyfile syntax is more intuitive than nginx.conf
- **Built-in Health Checks**: Native support for upstream health monitoring
- **Better WebSocket Support**: Improved handling of WebSocket connections for Next.js hot reload
- **Admin API**: Built-in API for configuration management and monitoring

## Files

### `Caddyfile.dev`
Development configuration with:
- Local TLS certificates
- Debug logging
- Health checks for backend services
- WebSocket support for hot reload
- Basic security headers

### `Caddyfile.prod`
Production configuration with:
- Let's Encrypt automatic HTTPS
- Rate limiting
- Comprehensive security headers
- Log rotation
- Load balancing support

## Usage

### Development

Use the provided script to start with Caddy:
```bash
./dev-caddy.sh
```

Or manually:
```bash
docker-compose -f docker-compose.caddy.yml up -d
```

### Production

1. Update `Caddyfile.prod` with your domain:
   ```
   your-domain.com {
   ```

2. Update email for Let's Encrypt:
   ```
   {
       email admin@yourdomain.com
   ```

3. Use production docker-compose file (create one based on caddy version)

## Configuration Details

### Reverse Proxy Setup

**API Routes** (`/api/*`):
- Strips `/api` prefix before forwarding to backend
- Health checks on `/health` endpoint
- Proper headers for client IP forwarding

**Frontend Routes** (everything else):
- Proxies to Next.js development server
- WebSocket support for hot reload
- Headers for proper client handling

### Security Features

**Development**:
- Self-signed certificates for HTTPS
- Basic security headers
- Debug logging

**Production**:
- Let's Encrypt certificates
- Comprehensive security headers including CSP
- Rate limiting
- HSTS headers
- Log rotation

### Health Checks

Caddy monitors backend services:
- Backend: `GET /health` every 30s
- Frontend: `GET /` every 30s
- Automatic failover if services are unhealthy

### Monitoring

**Admin API** (http://localhost:2019):
- View current configuration
- Reload configuration
- Health check status
- Metrics and logs

**Useful Admin API Endpoints**:
```bash
# View current config
curl http://localhost:2019/config/

# Reload config
curl -X POST http://localhost:2019/load

# Health check status
curl http://localhost:2019/debug/pprof/
```

## Comparison with nginx

| Feature | nginx | Caddy |
|---------|-------|-------|
| HTTPS Setup | Manual certificate management | Automatic Let's Encrypt |
| Configuration | Complex nginx.conf syntax | Simple Caddyfile syntax |
| Health Checks | Requires nginx Plus or manual setup | Built-in |
| HTTP/2 & HTTP/3 | Manual configuration | Automatic |
| Admin Interface | No built-in API | Built-in admin API |
| WebSocket Support | Manual configuration | Automatic |
| Reload Config | Requires signal or restart | API call or automatic |

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 80, 443, and 2019 are not in use
2. **Certificate warnings**: Accept self-signed certificates in development
3. **Backend connectivity**: Check if backend services are healthy via admin API

### Debugging

1. **View logs**:
   ```bash
   docker-compose -f docker-compose.caddy.yml logs caddy
   ```

2. **Check configuration**:
   ```bash
   curl http://localhost:2019/config/
   ```

3. **Validate Caddyfile**:
   ```bash
   docker-compose -f docker-compose.caddy.yml exec caddy caddy validate --config /etc/caddy/Caddyfile
   ```

### Performance Tuning

For production, consider:
- Adjusting rate limits based on traffic
- Configuring proper log levels
- Setting up log aggregation
- Monitoring with Prometheus metrics

## Benefits Over nginx

1. **Easier Configuration**: Caddyfile is more readable and maintainable
2. **Automatic HTTPS**: No manual certificate management
3. **Better Defaults**: Secure and optimized out of the box
4. **Built-in Monitoring**: Admin API provides insights
5. **Modern Protocols**: HTTP/2 and HTTP/3 support without complex setup
6. **Dynamic Configuration**: Can reload without downtime
7. **Better Error Handling**: More informative error messages

This setup provides a modern, secure, and easy-to-manage reverse proxy solution for the Malaka ERP system.
# Prometheus Monitoring Documentation

## Overview

Malaka ERP system includes comprehensive Prometheus monitoring setup for observability and performance tracking. The monitoring stack includes Prometheus, Grafana, and various exporters for full-stack monitoring.

## Monitoring Architecture

### Components
- **Prometheus Server**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **AlertManager**: Alert handling and notifications
- **Application Metrics**: Custom Go application metrics
- **Infrastructure Metrics**: Database, cache, and system monitoring

### Deployment
The monitoring stack is deployed via Docker Compose and configured in:
- `monitoring/prometheus.yml` - Prometheus configuration
- `monitoring/grafana/datasources/datasources.yml` - Grafana data sources
- `docker-compose.yml` - Container orchestration

## Monitored Metrics

### Application Metrics (Port 8080/metrics)

#### HTTP Request Metrics
- **`http_requests_total`**: Total number of HTTP requests
  - Labels: `method`, `handler`, `status`
- **`http_request_duration_seconds`**: Duration of HTTP requests
  - Labels: `method`, `handler`, `status`
  - Buckets: Default Prometheus buckets
- **`http_requests_in_flight`**: Current number of HTTP requests being processed

#### Database Metrics
- **`db_connections_active`**: Number of active database connections
- **`db_connections_idle`**: Number of idle database connections
- **`db_queries_total`**: Total number of database queries
  - Labels: `operation`, `table`
- **`db_query_duration_seconds`**: Duration of database queries
  - Labels: `operation`, `table`

#### Business Metrics
- **`users_total`**: Total number of users in the system
- **`companies_total`**: Total number of companies
- **`orders_total`**: Total number of orders
  - Labels: `type`, `status`
- **`revenue_total`**: Total revenue amount
  - Labels: `currency`

#### Cache Metrics
- **`cache_hits_total`**: Total number of cache hits
  - Labels: `cache_name`
- **`cache_misses_total`**: Total number of cache misses
  - Labels: `cache_name`

### Infrastructure Metrics

#### PostgreSQL Database (Port 9187)
- Connection pool statistics
- Query performance metrics
- Database size and growth
- Transaction statistics
- Lock information

#### Redis Cache (Port 9121)
- Memory usage
- Key statistics
- Operation metrics
- Connection information

#### PgBouncer Connection Pooler (Port 9127)
- Pool statistics
- Connection metrics
- Query routing information

#### Container Metrics (Port 8080 - cAdvisor)
- CPU and memory usage
- Network I/O
- Disk I/O
- Container health status

#### System Metrics (Port 9100 - Node Exporter)
- CPU utilization
- Memory usage
- Disk space and I/O
- Network statistics
- Load averages

#### Prometheus Self-Monitoring (Port 9090)
- Scrape duration and success rates
- Rule evaluation performance
- Storage metrics
- Target health status

## Scrape Configuration

### Target Services
```yaml
# Application metrics
- job_name: 'malaka-backend'
  targets: ['malaka-backend:8080']
  scrape_interval: 10s

# Database metrics  
- job_name: 'postgres'
  targets: ['postgres-exporter:9187']
  scrape_interval: 15s

# Cache metrics
- job_name: 'redis'
  targets: ['redis-exporter:9121']
  scrape_interval: 15s

# Connection pooler
- job_name: 'pgbouncer'
  targets: ['pgbouncer-exporter:9127']
  scrape_interval: 15s

# Container metrics
- job_name: 'cadvisor'
  targets: ['cadvisor:8080']
  scrape_interval: 20s

# System metrics
- job_name: 'node'
  targets: ['node-exporter:9100']
  scrape_interval: 15s
```

## Grafana Integration

### Data Sources
- **Prometheus**: Primary metrics data source (http://prometheus:9090)
- **Loki**: Log aggregation (http://loki:3100)
- **AlertManager**: Alert management (http://alertmanager:9093)

### Recommended Dashboards
1. **Application Overview**: HTTP requests, response times, error rates
2. **Database Performance**: Query performance, connection pools, slow queries
3. **Infrastructure Health**: CPU, memory, disk, network metrics
4. **Business Metrics**: User activity, order volume, revenue tracking
5. **Cache Performance**: Hit rates, memory usage, key distribution

## Code Implementation

### Prometheus Middleware
The Go application includes middleware for automatic HTTP metrics collection:

```go
// File: backend/internal/shared/metrics/prometheus.go
func PrometheusMiddleware() gin.HandlerFunc {
    return gin.HandlerFunc(func(c *gin.Context) {
        // Skip metrics endpoint
        if c.Request.URL.Path == "/metrics" {
            c.Next()
            return
        }

        start := time.Now()
        httpRequestsInFlight.Inc()
        
        c.Next()
        
        httpRequestsInFlight.Dec()
        
        // Record metrics
        status := strconv.Itoa(c.Writer.Status())
        method := c.Request.Method
        handler := c.FullPath()
        
        httpRequestsTotal.WithLabelValues(method, handler, status).Inc()
        httpRequestDuration.WithLabelValues(method, handler, status).Observe(time.Since(start).Seconds())
    })
}
```

### Available Functions
- `RecordDBConnection(active, idle int)`: Track database connections
- `RecordDBQuery(operation, table, duration)`: Track database queries
- `SetUsersTotal(count)`: Update user count metrics
- `SetCompaniesTotal(count)`: Update company count metrics
- `RecordOrder(type, status)`: Track order creation
- `SetRevenue(currency, amount)`: Update revenue metrics
- `RecordCacheHit/Miss(cacheName)`: Track cache performance

## Metrics Endpoint

Application metrics are exposed at:
- **URL**: `http://localhost:8080/metrics`
- **Format**: Prometheus exposition format
- **Content-Type**: `text/plain; version=0.0.4; charset=utf-8`

## Alerting

Alert rules are configured in `monitoring/alert_rules.yml` and managed by AlertManager. Common alerts include:
- High error rates (>5% 5xx responses)
- High response times (>1s p95)
- Database connection pool exhaustion
- High memory usage (>80%)
- Disk space warnings (>80% full)

## Development Usage

### Adding New Metrics
1. Define metric variables in `prometheus.go`
2. Create helper functions for recording metrics
3. Call metrics functions in relevant business logic
4. Test metrics endpoint: `curl http://localhost:8080/metrics`

### Testing Metrics
```bash
# Start monitoring stack
make docker-up

# Generate some traffic
curl http://localhost:8080/masterdata/companies

# Check metrics
curl http://localhost:8080/metrics | grep http_requests_total

# Access Grafana
open http://localhost:3000
```

## Production Considerations

### Performance
- Metrics collection adds minimal overhead (<1ms per request)
- Prometheus retention configured for 15 days by default
- High-cardinality labels are avoided to prevent storage issues

### Security
- Metrics endpoint is public (no sensitive data exposed)
- Grafana requires authentication in production
- AlertManager webhooks should use HTTPS

### Maintenance
- Regular cleanup of old metrics data
- Monitor Prometheus storage usage
- Update exporters and Grafana dashboards
- Review and tune alert thresholds

## URLs and Access

- **Prometheus UI**: http://localhost:9090
- **Grafana Dashboards**: http://localhost:3000 (admin/admin)
- **AlertManager**: http://localhost:9093
- **Application Metrics**: http://localhost:8080/metrics
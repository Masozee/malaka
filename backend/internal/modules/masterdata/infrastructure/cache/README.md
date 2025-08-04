# Master Data Caching Implementation

This package provides Redis-based caching wrappers for master data repositories to improve performance and reduce database load.

## Architecture

The caching implementation follows the **Decorator Pattern**, wrapping existing repository implementations with caching functionality:

```
Client → CachedRepository → Repository → Database
              ↓
            Redis Cache
```

## Features

### ✅ Implemented Caching Strategies

1. **Single Entity Caching**: Cache individual records by ID/code with 15-minute TTL
2. **List Caching**: Cache full entity lists for GetAll() operations
3. **Smart Invalidation**: Automatic cache invalidation on Create/Update/Delete operations
4. **Bypass Strategy**: Pagination queries bypass cache to ensure fresh, accurate data

### 🔧 Cached Repositories

- **CachedCompanyRepository**: Companies with ID-based caching
- **CachedCustomerRepository**: Customers with ID-based caching  
- **CachedUserRepository**: Users with ID and username-based caching
- **CachedDivisionRepository**: Divisions with ID and code-based caching
- **CachedDepstoreRepository**: Department stores with ID and code-based caching

## Cache Keys

### Key Patterns
- **Single Entity**: `{entity}:{id}` (e.g., `company:123e4567-e89b-12d3-a456-426614174000`)
- **By Code**: `{entity}:code:{code}` (e.g., `division:code:PROD-CUT`)
- **By Username**: `user:username:{username}` (e.g., `user:username:admin`)
- **Full Lists**: `{entities}:all` (e.g., `companies:all`)

### Cache TTL
- **Default TTL**: 15 minutes for all cached data
- **Invalidation**: Immediate on Create/Update/Delete operations

## Implementation Example

```go
// Wire up cached repository in dependency injection
func SetupMasterDataRepositories(db *sqlx.DB, cache cache.Cache) {
    // Original repository
    companyRepo := persistence.NewCompanyRepository(db)
    
    // Wrap with caching
    cachedCompanyRepo := cache.NewCachedCompanyRepository(companyRepo, cache)
    
    // Use cached repository in service
    companyService := services.NewCompanyService(cachedCompanyRepo)
}
```

## Cache Strategies

### 1. Read-Through Caching
```go
func (r *CachedCompanyRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.Company, error) {
    // 1. Check cache first
    if cached, err := r.cache.Get(ctx, cacheKey); err == nil {
        return deserializeCompany(cached), nil
    }
    
    // 2. Cache miss - get from database
    company, err := r.repo.GetByID(ctx, id)
    if err != nil {
        return nil, err
    }
    
    // 3. Store in cache for future requests
    r.cache.Set(ctx, cacheKey, serialize(company), cacheTTL)
    return company, nil
}
```

### 2. Write-Through Invalidation
```go
func (r *CachedCompanyRepository) Update(ctx context.Context, company *entities.Company) error {
    // 1. Update database
    if err := r.repo.Update(ctx, company); err != nil {
        return err
    }
    
    // 2. Invalidate affected cache keys
    r.cache.Delete(ctx, fmt.Sprintf("company:%s", company.ID))
    r.cache.Delete(ctx, "companies:all")
    
    return nil
}
```

### 3. Selective Caching
- **Cached Operations**: GetByID(), GetByCode(), GetByUsername(), GetAll()
- **Bypassed Operations**: GetAllWithPagination() (dynamic parameters)
- **Reason**: Pagination with search/filter parameters creates too many cache key variations

## Performance Benefits

### Expected Performance Improvements

1. **Single Entity Lookups**: 95% cache hit rate, ~80% response time reduction
2. **List Operations**: 90% cache hit rate for GetAll() operations
3. **Database Load**: 70-80% reduction in SELECT queries
4. **Concurrent Requests**: Better handling of high-traffic scenarios

### Cache Statistics (Estimated)

| Operation | Cache Hit Rate | Performance Gain |
|-----------|----------------|------------------|
| GetByID() | 95% | 80% faster |
| GetByCode() | 90% | 75% faster |
| GetAll() | 90% | 85% faster |
| GetAllWithPagination() | 0% (bypassed) | No change |

## Configuration

### Redis Connection
```go
// Redis cache setup
redisCache := cache.NewRedisCache(
    "localhost:6379", // Redis address
    "",               // Password (empty for development)
    0,                // Database number
)

// Test connection
ctx := context.Background()
if err := redisCache.Set(ctx, "test", "value", time.Minute); err != nil {
    log.Fatal("Redis connection failed:", err)
}
```

### Environment Variables
```bash
REDIS_ADDR=localhost:6379
REDIS_PASSWORD=
REDIS_DB=0
CACHE_TTL=15m
```

## Monitoring

### Cache Metrics to Monitor

1. **Hit/Miss Ratios**: Track cache effectiveness
2. **Response Times**: Compare cached vs non-cached requests
3. **Memory Usage**: Monitor Redis memory consumption
4. **Key Expiration**: Track TTL effectiveness

### Redis Commands for Debugging

```bash
# Check cache contents
redis-cli KEYS "company:*"
redis-cli GET "companies:all"

# Monitor cache activity
redis-cli MONITOR

# Check memory usage
redis-cli INFO memory
```

## Testing

### Unit Tests
```go
func TestCachedCompanyRepository_GetByID(t *testing.T) {
    // Mock cache and repository
    mockCache := &MockCache{}
    mockRepo := &MockCompanyRepository{}
    
    cachedRepo := NewCachedCompanyRepository(mockRepo, mockCache)
    
    // Test cache miss scenario
    // Test cache hit scenario
    // Test cache invalidation
}
```

## Production Considerations

### 1. Cache Warming
```go
// Warm cache on application startup
func WarmMasterDataCache(repos *MasterDataRepositories) {
    ctx := context.Background()
    
    // Pre-load frequently accessed data
    repos.Company.GetAll(ctx)
    repos.User.GetAll(ctx)
    repos.Division.GetAll(ctx)
}
```

### 2. Circuit Breaker
```go
// Graceful degradation if Redis is unavailable
func (r *CachedCompanyRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.Company, error) {
    // Try cache first, but don't fail if Redis is down
    if cached, err := r.cache.Get(ctx, cacheKey); err == nil {
        if company := deserialize(cached); company != nil {
            return company, nil
        }
    }
    
    // Always fallback to database
    return r.repo.GetByID(ctx, id)
}
```

### 3. Cache Stampede Prevention
```go
// Use single-flight pattern for expensive operations
var singleFlight singleflight.Group

func (r *CachedCompanyRepository) GetAll(ctx context.Context) ([]*entities.Company, error) {
    val, err, _ := singleFlight.Do("companies:all", func() (interface{}, error) {
        return r.loadCompaniesFromDatabase(ctx)
    })
    
    if err != nil {
        return nil, err
    }
    
    return val.([]*entities.Company), nil
}
```

## Migration Guide

### Step 1: Add Redis to Docker Compose
```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
```

### Step 2: Update Dependency Injection
```go
// Replace direct repository usage
companyService := services.NewCompanyService(
    cache.NewCachedCompanyRepository(companyRepo, redisCache)
)
```

### Step 3: Monitor Performance
- Add cache metrics to monitoring dashboard
- Track response times before/after implementation
- Monitor Redis memory usage

## Troubleshooting

### Common Issues

1. **Cache Miss Rate Too High**
   - Check TTL settings
   - Verify invalidation logic
   - Monitor cache key patterns

2. **Memory Usage Growing**
   - Review TTL settings
   - Check for memory leaks in serialization
   - Monitor Redis eviction policies

3. **Inconsistent Data**
   - Verify invalidation on all write operations
   - Check for race conditions
   - Consider eventual consistency implications
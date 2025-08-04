# Frontend-Backend Integration Guide

This document provides comprehensive guidance for integrating frontend components with backend APIs.

## Frontend-Backend Integration Best Practices

**CRITICAL**: Follow these patterns for successful API integration:

### 1. Use HRService Pattern (Recommended)

**✅ CORRECT Implementation Pattern** (Follow attendance/leave pages):

```typescript
// src/services/hr.ts - Add method to HRService class
static async getPerformanceReviews(
  params: PaginationParams = {}
): Promise<PaginatedResponse<any>> {
  try {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
    )
    
    const response = await apiClient.get<{
      success: boolean, 
      message: string, 
      data: {data: any[], total: number, page: number, page_size: number, total_pages: number}
    }>(`${this.BASE_URL}/performance/reviews/`, filteredParams)
    
    if (!response.success || !response.data) {
      throw new Error(`API Error: ${response.message}`)
    }

    // Convert to paginated response format
    return {
      data: response.data.data,
      pagination: {
        page: response.data.page || 1,
        limit: response.data.page_size || 50,
        total: response.data.total,
        totalPages: response.data.total_pages || 1
      }
    }
  } catch (error) {
    console.error('Error fetching performance reviews:', error)
    throw error
  }
}

// Frontend page - Use HRService directly
const fetchPerformanceData = async () => {
  try {
    setLoading(true)
    setError(null)

    // Fetch performance reviews from API
    const response = await HRService.getPerformanceReviews()
    setPerformanceData(response.data)
  } catch (error) {
    console.error('Error fetching performance data:', error)
    setError('Failed to load performance data')
    setPerformanceData([])
  } finally {
    setLoading(false)
  }
}
```

### 2. Backend Field Names (Use snake_case)

**✅ CORRECT - Use backend field names directly:**

```typescript
interface PerformanceReview {
  id: string
  employee_id: string          // ✅ Use snake_case from backend
  employee_name: string        // ✅ Use snake_case from backend
  employee_code: string        // ✅ Use snake_case from backend
  review_period: string        // ✅ Use snake_case from backend
  overall_score: number | null // ✅ Use snake_case from backend
  // ... other fields
}

// ✅ Access fields directly
<div>{review.employee_name}</div>
<div>{review.employee_code}</div>
```

**❌ AVOID - Complex field mapping:**

```typescript
// ❌ Don't create complex mapping functions
const mappedData = reviewsResponse.data.map((review) => ({
  id: review.id,
  employeeId: review.employee_id,      // ❌ Unnecessary camelCase conversion
  employeeName: review.employee_name,  // ❌ Unnecessary camelCase conversion
  // ... complex mapping
}))
```

### 3. Table Structure (Critical for AdvancedDataTable)

**✅ CORRECT Table Column Structure** (Follow attendance pattern):

```typescript
const columns: Array<{
  key: keyof PerformanceReview;
  title: string;
  render?: (value: unknown, record: PerformanceReview) => React.ReactNode;
}> = [
  {
    key: 'employee_name' as keyof PerformanceReview,
    title: 'Employee',
    render: (value: unknown, record: PerformanceReview) => (
      <div>
        <div className="font-medium">{record.employee_name}</div>
        <div className="text-sm text-muted-foreground">{record.employee_code} • {record.department}</div>
      </div>
    )
  },
  // ... other columns
]
```

**❌ AVOID - React Table Format:**

```typescript
// ❌ Don't use this format - causes table loading issues
const columns = [
  {
    accessorKey: 'employee_code',    // ❌ Wrong format
    header: 'Employee',              // ❌ Wrong format
    cell: ({ row }: any) => (        // ❌ Wrong format
      <div>{row.original.employee_name}</div>
    )
  }
]
```

### 4. API Response Structure Handling

**Backend API Response Format:**
```json
{
  "success": true,
  "message": "Performance reviews retrieved successfully",
  "data": {
    "data": [...],           // Array of records
    "total": 12,
    "page": 1,
    "page_size": 50,
    "total_pages": 1
  }
}
```

**✅ CORRECT - Handle nested data structure:**

```typescript
// ✅ Access nested data properly
return {
  data: response.data.data,        // ✅ Extract array from nested structure
  pagination: {
    page: response.data.page || 1,
    limit: response.data.page_size || 50,
    total: response.data.total,
    totalPages: response.data.total_pages || 1
  }
}
```

## Connection Configuration

**CRITICAL**: Proper frontend-backend connection requires specific configuration:

### 1. Backend CORS Setup

```go
// Add CORS middleware for frontend-backend communication
router.Use(func(c *gin.Context) {
    c.Header("Access-Control-Allow-Origin", "*")
    c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
    
    if c.Request.Method == "OPTIONS" {
        c.AbortWithStatus(200)
        return
    }
    
    c.Next()
})
```

### 2. API Endpoint URLs

All endpoints use `/api/v1` prefix with trailing slashes:

```go
// Backend routing (Gin framework with versioning)
apiV1 := router.Group("/api/v1")
masterdata := apiV1.Group("/masterdata")
masterdata.GET("/articles", handler)     // Redirects to /api/v1/masterdata/articles/
masterdata.GET("/articles/", handler)    // Actual endpoint
```

### 3. Frontend Service Configuration

```typescript
// ALWAYS use /api/v1 prefix with trailing slashes in API calls
async getAll(filters?: MasterDataFilters): Promise<ListResponseType> {
  const response = await apiClient.get<{success: boolean, message: string, data: T[]}>(`/api/v1/masterdata/${this.endpoint}/`, filters)
  // Note the /api/v1 prefix and trailing slash ^^ - both are REQUIRED
}
```

## Common Integration Issues & Solutions

### Issue 1: Table Not Loading
- **Problem**: Table shows loading state but never displays data
- **Solution**: Use correct column structure with `key`, `title`, `render` format
- **Example**: See attendance page `/hr/attendance` for working pattern

### Issue 2: Cards Work But Table Broken
- **Problem**: Cards display data correctly but table doesn't
- **Solution**: Check column structure format - must match attendance pattern exactly

### Issue 3: API 301 Redirect Errors
- **Problem**: API returns "301 Moved Permanently"
- **Solution**: Add trailing slash to API endpoints: `/api/v1/hr/performance/reviews/`

### Issue 4: Field Access Errors
- **Problem**: "Cannot read properties of undefined"
- **Solution**: Use backend field names directly (snake_case) instead of mapping

### Issue 5: Empty Data Display
- **Problem**: API returns data but frontend shows empty state
- **Solution**: Check nested response structure `response.data.data` vs `response.data`

### Issue 6: CORS Errors
- **Problem**: Browser blocks requests with "blocked by CORS policy"
- **Solution**: Ensure CORS middleware is properly configured in backend
- **Verification**: Check backend restart after CORS changes

### Issue 7: Connection Refused
- **Problem**: Frontend cannot reach backend
- **Solution**: Verify backend is running on correct port (default: 8084)

## Service URLs (Development)
- **Frontend**: http://localhost:3000 (or available port like 3002)
- **Backend API**: http://localhost:8084
- **Database Admin**: http://localhost:8085
- **Redis Commander**: http://localhost:8086

## Authentication System

The application includes a complete JWT-based authentication system:

### 1. Frontend Authentication Components
- **Login Page** (`/login`): Professional login form with demo credentials
- **Auth Context** (`src/contexts/auth-context.tsx`): Global authentication state management
- **Protected Routes** (`src/components/auth/protected-route.tsx`): Route protection wrapper
- **User Dropdown** (`src/components/ui/header.tsx`): User interface with logout functionality

### 2. Backend Authentication
- **JWT Middleware** (`backend/internal/shared/auth/middleware.go`): Token validation and user context
- **JWT Service** (`backend/internal/shared/auth/jwt.go`): Token generation and parsing
- **Protected Endpoints**: Calendar and other sensitive APIs require authentication

### 3. Authentication Flow
```
1. User visits protected page → Redirected to /login
2. Login with credentials (testuser/testpass) → JWT token generated
3. Token stored in localStorage → API client configured with token
4. Protected pages accessible → User dropdown shows login status
5. Logout clears token → Redirected back to login
```

### 4. Demo Credentials
- **Username**: `testuser`
- **Password**: `testpass`
- **Note**: These are development credentials for testing purposes

## Testing Frontend-Backend Connection

### 1. Test Backend API directly
```bash
# Test articles endpoint with CORS headers
curl -H "Origin: http://localhost:3000" http://localhost:8084/masterdata/articles/

# Should return JSON with articles data and CORS headers:
# Access-Control-Allow-Origin: *
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
# Access-Control-Allow-Headers: Content-Type, Authorization
```

### 2. Test Authentication System
```bash
# Get JWT token
TOKEN=$(curl -s -X POST http://localhost:8084/masterdata/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}' | \
  grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Test protected calendar endpoint
curl -X POST http://localhost:8084/api/calendar/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Test Event","start_datetime":"2025-01-29T10:00:00Z","event_type":"meeting","priority":"medium"}'

# Should return: {"success":true,"message":"Event created successfully","data":{...}}
```

### 3. Check Docker containers
```bash
# View container status
docker compose ps

# Restart backend if needed
docker compose restart malaka-backend
```

### 4. Verify frontend authentication flow
- Navigate to calendar: http://localhost:3000/calendar
- Should redirect to login page: http://localhost:3000/login
- Login with demo credentials (testuser/testpass)
- Should redirect back to calendar with user dropdown visible
- Create new event to test authenticated API calls

## API Client Configuration

### API Client (`src/lib/api.ts`)
- **Base URL**: http://localhost:8084 (updated from 8081)
- **Type Safety**: Full TypeScript support with generics
- **Error Handling**: Comprehensive error handling and logging
- **Authentication**: JWT token management
- **Request/Response**: Standardized request/response processing

### Service Layer (`src/services/masterdata.ts`)
- **Repository Pattern**: Clean separation of API concerns
- **Type Safety**: All API calls are fully typed
- **Error Handling**: Consistent error handling across services
- **Caching**: Smart caching strategies for better performance
- **API Response Format**: Backend returns `{success: boolean, message: string, data: T[]}`

## Integration Testing Checklist

**✅ Before declaring integration complete:**

### 1. Test API Endpoint Directly
```bash
curl -H "Accept: application/json" http://localhost:8084/api/v1/hr/performance/reviews/
```

### 2. Verify Data Structure
- Check `response.data.data` contains array of records
- Verify field names match backend (snake_case)
- Confirm pagination structure

### 3. Test Both Views
- Cards view displays correctly
- Table view displays correctly
- Both views show same data

### 4. Test Filtering
- Search functionality works
- Status filtering works
- All filters update data correctly

### 5. Check Error Handling
- Loading states work
- Error states display properly
- Retry functionality works

### 6. Success Criteria
- No console errors
- Data displays in both card and table views
- Filtering and search work correctly
- Loading and error states function properly
- No hydration or runtime errors

## Integration Documentation Requirement

**MANDATORY**: After successfully integrating any frontend page with the backend API, you MUST update the integration documentation:

### Update Integration Status (`docs/integrate.md`)
```markdown
#### Page Name (`/path/to/page`)
- **Backend Service**: `serviceProvider.getAll()`
- **API Endpoint**: `GET /api/endpoint/`
- **Features**: List of implemented features
- **Data Fields**: Fields displayed in UI
- **Integration Date**: YYYY-MM-DD
- **Notes**: Any special considerations or issues resolved
```

### Integration Requirements
- **Backend API**: Endpoint exists and returns data with CORS headers
- **Frontend Service**: Uses BaseMasterDataService pattern with trailing slashes
- **Component State**: Implements loading, error, and data states
- **UI Features**: Search, filtering, sorting, status management
- **Error Handling**: Console logging and graceful fallbacks
- **Testing**: Page loads successfully with real data

### Integration Checklist
- [ ] Remove mock data arrays
- [ ] Add API state management (loading, error, data)
- [ ] Implement data fetching with useEffect
- [ ] Update TypeScript interfaces to match backend schema
- [ ] Add loading states and error boundaries  
- [ ] Test API calls in browser network tab
- [ ] Verify CRUD operations work (if applicable)
- [ ] Update integration progress in `docs/integrate.md`

**Why This Matters**: Integration documentation helps track progress, identify patterns, troubleshoot issues, and ensure consistency across the application. It prevents duplicate work and provides a reference for future integrations.
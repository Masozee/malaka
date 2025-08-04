# Malaka ERP - Complete Development Workflow

This document outlines the systematic approach for developing complete features in the Malaka ERP system, from backend to frontend, ensuring consistency, quality, and maintainability.

## 🎯 **Development Philosophy**

- **Standards First**: Follow CLAUDE.md layout requirements religiously
- **API-Driven**: Real backend integration, no permanent mock data
- **Consistent UX**: Same patterns across all modules
- **Performance Optimized**: Implement caching and query optimization from the start
- **Type Safety**: Full TypeScript coverage throughout

## 📋 **Complete Development Checklist**

### **Phase 1: Backend Foundation**
- [ ] Create database migration with proper schema
- [ ] Implement domain entities with validation
- [ ] Build repository with optimized queries
- [ ] Create service layer with business logic
- [ ] Implement HTTP handlers with proper error handling
- [ ] Add routes to router configuration
- [ ] Create seed data with realistic Indonesian content

### **Phase 2: Frontend Integration**
- [ ] Update TypeScript interfaces to match backend
- [ ] Implement API service layer
- [ ] Build page following CLAUDE.md standards
- [ ] Add proper loading/error states
- [ ] Implement search and filtering
- [ ] Create responsive card and table views
- [ ] Add contextual 3-dots action menus

### **Phase 3: Quality Assurance**
- [ ] Test all CRUD operations
- [ ] Verify responsive design
- [ ] Check loading states and error handling
- [ ] Validate search and filtering functionality
- [ ] Test action menus and navigation

---

## 🗄️ **Backend Development Pattern**

### **1. Database Migration**
```sql
-- migrations/XXX_create_[entity]_table.sql
-- SCHEMA ONLY - No INSERT statements
CREATE TABLE [entities] (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    -- other fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_[entities]_name ON [entities](name);
CREATE INDEX idx_[entities]_status ON [entities](status);
```

### **2. Domain Entity**
```go
// domain/entities/[entity].go
package entities

import "malaka/internal/shared/types"

type [Entity] struct {
    types.BaseModel
    Name        string                 `json:"name" validate:"required"`
    Status      string                 `json:"status" validate:"required,oneof=active inactive"`
    // other fields
}
```

### **3. Repository Interface**
```go
// domain/repositories/[entity]_repository.go
package repositories

import (
    "context"
    "[module]/domain/entities"
)

type [Entity]Repository interface {
    Create(ctx context.Context, entity *entities.[Entity]) error
    GetByID(ctx context.Context, id string) (*entities.[Entity], error)
    GetAll(ctx context.Context) ([]*entities.[Entity], error)
    Update(ctx context.Context, entity *entities.[Entity]) error
    Delete(ctx context.Context, id string) error
}
```

### **4. Repository Implementation**
```go
// infrastructure/persistence/[entity]_repository_impl.go
package persistence

import (
    "context"
    "gorm.io/gorm"
    "[module]/domain/entities"
    "[module]/domain/repositories"
)

type [entity]RepositoryImpl struct {
    db *gorm.DB
}

func New[Entity]Repository(db *gorm.DB) repositories.[Entity]Repository {
    return &[entity]RepositoryImpl{db: db}
}

func (r *[entity]RepositoryImpl) GetAll(ctx context.Context) ([]*entities.[Entity], error) {
    var entities []*entities.[Entity]
    
    // Optimized query with proper indexing
    err := r.db.WithContext(ctx).
        Order("created_at DESC").
        Find(&entities).Error
        
    return entities, err
}
```

### **5. Service Layer**
```go
// domain/services/[entity]_service.go
package services

import (
    "context"
    "[module]/domain/entities"
    "[module]/domain/repositories"
)

type [Entity]Service interface {
    Create[Entity](ctx context.Context, entity *entities.[Entity]) error
    Get[Entity]ByID(ctx context.Context, id string) (*entities.[Entity], error)
    GetAll[Entity]s(ctx context.Context) ([]*entities.[Entity], error)
    Update[Entity](ctx context.Context, entity *entities.[Entity]) error
    Delete[Entity](ctx context.Context, id string) error
}

type [entity]ServiceImpl struct {
    repo repositories.[Entity]Repository
}

func New[Entity]Service(repo repositories.[Entity]Repository) [Entity]Service {
    return &[entity]ServiceImpl{repo: repo}
}
```

### **6. HTTP Handler**
```go
// presentation/http/handlers/[entity]_handler.go
package handlers

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "[module]/domain/services"
    "malaka/internal/shared/response"
)

type [Entity]Handler struct {
    service services.[Entity]Service
}

func New[Entity]Handler(service services.[Entity]Service) *[Entity]Handler {
    return &[Entity]Handler{service: service}
}

func (h *[Entity]Handler) GetAll[Entity]s(c *gin.Context) {
    entities, err := h.service.GetAll[Entity]s(c.Request.Context())
    if err != nil {
        response.Error(c, http.StatusInternalServerError, "Failed to retrieve [entities]", err)
        return
    }
    
    response.Success(c, "[Entity]s retrieved successfully", entities)
}
```

### **7. Route Registration**
```go
// presentation/http/routes/[module]_routes.go
[entity] := masterdata.Group("/[entities]")
{
    [entity].POST("/", [entity]Handler.Create[Entity])
    [entity].GET("/", [entity]Handler.GetAll[Entity]s)
    [entity].GET("/:id", [entity]Handler.Get[Entity]ByID)
    [entity].PUT("/:id", [entity]Handler.Update[Entity])
    [entity].DELETE("/:id", [entity]Handler.Delete[Entity])
}
```

### **8. Seed Data**
```sql
-- seeds/[entities].sql
-- Realistic Indonesian business data
INSERT INTO [entities] (name, status, address, phone) VALUES
('PT [Entity] Nusantara', 'active', 'Jl. Sudirman No. 123, Jakarta Pusat 10270', '021-5555-1234'),
('CV [Entity] Jaya Abadi', 'active', 'Jl. Malioboro No. 456, Yogyakarta 55213', '0274-7777-5678'),
('UD [Entity] Maju', 'active', 'Jl. Pahlawan No. 789, Surabaya 60119', '031-8888-9012');
```

---

## 🎨 **Frontend Development Pattern**

### **1. TypeScript Interfaces**
```typescript
// types/[module].ts
export interface [Entity] extends BaseEntity {
  name: string
  status: 'active' | 'inactive'
  // other fields matching backend exactly
}

export interface [Entity]Display extends [Entity] {
  // UI-specific computed fields
  displayName?: string
  statusColor?: string
}
```

### **2. API Service Layer**
```typescript
// services/[module].ts
class [Entity]Service extends BaseMasterDataService<[Entity], [Entity]ListResponse> {
  constructor() {
    super('[entities]')
  }
}

export const [entity]Service = new [Entity]Service()
```

### **3. Standard Page Structure**
```typescript
// app/[module]/[entities]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Search, Filter, Download, Plus, MoreHorizontal,
  Eye, Edit, Settings, Loader2, XCircle
} from 'lucide-react'

export default function [Entity]Page() {
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table')
  const [searchQuery, setSearchQuery] = useState('')
  const [entities, setEntities] = useState<[Entity]Display[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    loadEntities()
  }, [])

  const loadEntities = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await [entity]Service.getAll()
      const transformedEntities = response.data.map(transform[Entity]Data)
      setEntities(transformedEntities)
    } catch (err) {
      console.error('Failed to load [entities]:', err)
      setError('Failed to load [entities]. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Action handlers
  const handleViewDetails = (entity: [Entity]) => {
    console.log('View details for:', entity.name)
    // TODO: Navigate to details page
  }

  const handleEdit = (entity: [Entity]) => {
    console.log('Edit:', entity.name)
    // TODO: Navigate to edit page
  }

  return (
    <TwoLevelLayout>
      <Header 
        title="[Entity] Management"
        description="Manage your [entities] and their information"
        breadcrumbs={breadcrumbs}
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add [Entity]
          </Button>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Summary Cards - 4 key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI Cards with justify-between layout */}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search [entities]..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            {/* View Toggle */}
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
              <Button 
                variant={viewMode === 'cards' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                Cards
              </Button>
              <Button 
                variant={viewMode === 'table' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
            </div>
          </div>
        </div>

        {/* Content with proper loading/error states */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Error Loading [Entity]</p>
              <p className="text-gray-500 mb-4">{error}</p>
              <Button onClick={loadEntities}>Try Again</Button>
            </div>
          </div>
        ) : entities.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">No [Entity] Found</p>
              <p className="text-gray-500 mb-4">Get started by adding your first [entity].</p>
              <Button><Plus className="h-4 w-4 mr-2" />Add [Entity]</Button>
            </div>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entities.map((entity) => (
              <[Entity]Card key={entity.id} entity={entity} />
            ))}
          </div>
        ) : (
          <DataTable data={entities} columns={columns} />
        )}
      </div>
    </TwoLevelLayout>
  )
}
```

### **4. Standard Table Columns with Actions**
```typescript
const columns = [
  {
    key: 'name' as keyof [Entity],
    title: '[Entity]',
    sortable: true,
    render: (value: unknown, record: [Entity]) => (
      <div>
        <div className="font-medium">{record.name}</div>
        <div className="text-sm text-gray-500">{record.code}</div>
      </div>
    )
  },
  // ... other columns
  {
    key: 'id' as keyof [Entity],
    title: 'Actions',
    width: '80px',
    render: (value: unknown, record: [Entity]) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleViewDetails(record)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleEdit(record)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
]
```

---

## 🎯 **Key Patterns & Standards**

### **CLAUDE.md Layout Compliance**
- **TwoLevelLayout** → **Header** → **Content Structure**
- **4 Key Metrics** in summary cards with justify-between layout
- **Standard search** with left search + right actions
- **View toggle** with muted background
- **Consistent spacing** with p-6 and space-y-6

### **Component Usage Standards**
- **DataTable** (not AdvancedDataTable) for table views
- **DropdownMenu** for 3-dots actions
- **Badge** for status/category indicators
- **Card** components for summary metrics and card views

### **State Management Pattern**
- **loading**: Boolean for API call states
- **error**: String for error messages
- **mounted**: Boolean for client-side hydration
- **searchQuery**: String for search functionality
- **viewMode**: 'cards' | 'table' for view toggle

### **Data Transformation Pattern**
```typescript
// Transform API data to UI-friendly format
const transform[Entity]Data = (entity: [Entity]): [Entity]Display => {
  return {
    ...entity,
    // Add computed UI fields
    displayName: entity.name?.toUpperCase(),
    statusColor: getStatusColor(entity.status),
  }
}
```

### **Error Handling Standards**
- **Network errors**: Show retry button
- **Empty states**: Show add new button
- **Loading states**: Show spinner
- **Form validation**: Inline error messages

---

## 📊 **Performance Optimization**

### **Backend Optimizations**
- **Database Indexing**: Add indexes on commonly queried fields
- **Query Optimization**: Use GORM preloading to avoid N+1 queries
- **Caching**: Implement Redis caching for frequently accessed data
- **Pagination**: Implement pagination for large datasets

### **Frontend Optimizations**
- **Data Transformation**: Transform data once, use everywhere
- **Lazy Loading**: Load data only when needed
- **Memoization**: Use useMemo for expensive calculations
- **Debounced Search**: Prevent excessive API calls

---

## 🔧 **Quality Assurance Checklist**

### **Functionality**
- [ ] All CRUD operations work correctly
- [ ] Search and filtering function properly
- [ ] View toggle works smoothly
- [ ] Action menus show appropriate options
- [ ] Loading states display correctly
- [ ] Error handling works as expected

### **UI/UX**
- [ ] Layout matches CLAUDE.md standards exactly
- [ ] Responsive design works on all screen sizes
- [ ] Icons and typography are consistent
- [ ] Color scheme follows design system
- [ ] Animations and transitions are smooth

### **Performance**
- [ ] Page loads quickly (< 2 seconds)
- [ ] API calls are optimized
- [ ] No unnecessary re-renders
- [ ] Memory usage is reasonable

### **Accessibility**
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets standards
- [ ] Focus indicators are visible

---

## 📁 **File Organization**

```
malaka/
├── backend/
│   ├── internal/modules/[module]/
│   │   ├── domain/
│   │   │   ├── entities/[entity].go
│   │   │   ├── repositories/[entity]_repository.go
│   │   │   └── services/[entity]_service.go
│   │   ├── infrastructure/persistence/
│   │   │   └── [entity]_repository_impl.go
│   │   └── presentation/http/
│   │       ├── handlers/[entity]_handler.go
│   │       └── routes/[module]_routes.go
│   ├── internal/pkg/database/
│   │   ├── migrations/XXX_create_[entities].sql
│   │   └── seeds/[entities].sql
│
├── frontend/
│   ├── src/app/[module]/[entities]/
│   │   └── page.tsx
│   ├── src/types/[module].ts
│   ├── src/services/[module].ts
│   └── src/components/[module]/
│       └── [entity]-card.tsx
```

---

## 🚀 **Implementation Order**

1. **Database Schema** → Migration file
2. **Domain Layer** → Entities, repositories, services
3. **Infrastructure** → Repository implementations
4. **Presentation** → HTTP handlers and routes
5. **Seed Data** → Realistic test data
6. **Frontend Types** → TypeScript interfaces
7. **API Service** → Frontend service layer
8. **Page Component** → Standard layout implementation
9. **Testing** → Comprehensive functionality testing
10. **Documentation** → Update feature checklist

---

## 💡 **Best Practices**

### **Development**
- **Follow the pattern exactly** - consistency is key
- **Test early and often** - don't wait until the end
- **Use realistic data** - makes testing more meaningful
- **Document as you go** - update checklists immediately

### **Code Quality**
- **Type everything** - no `any` types allowed
- **Handle all states** - loading, error, empty, success
- **Consistent naming** - follow established conventions
- **Small, focused components** - easier to maintain

### **Performance**
- **Optimize queries first** - backend performance is critical
- **Cache strategically** - balance performance vs freshness
- **Load incrementally** - don't load everything at once
- **Monitor continuously** - watch for performance regressions

---

## 📝 **Template Commands**

```bash
# Backend: Create new entity files
mkdir -p internal/modules/[module]/domain/entities
mkdir -p internal/modules/[module]/domain/repositories  
mkdir -p internal/modules/[module]/domain/services
mkdir -p internal/modules/[module]/infrastructure/persistence
mkdir -p internal/modules/[module]/presentation/http/handlers

# Frontend: Create new page
mkdir -p src/app/[module]/[entities]
touch src/app/[module]/[entities]/page.tsx

# Database: Create migration and seed
touch internal/pkg/database/migrations/XXX_create_[entities].sql
touch internal/pkg/database/seeds/[entities].sql
```

This workflow ensures that every page in the Malaka ERP system follows the same high-quality standards, providing a consistent user experience and maintainable codebase.

---

**🎯 Remember**: The goal is not just to build features, but to build them consistently, performantly, and maintainably. Every page should feel like it belongs to the same application.
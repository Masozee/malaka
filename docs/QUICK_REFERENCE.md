# Malaka ERP - Quick Development Reference

## 🚀 **Fast Development Checklist**

### **Backend (30 minutes)**
```bash
# 1. Migration (5 min)
touch internal/pkg/database/migrations/XXX_create_[entities].sql

# 2. Entity (5 min) 
touch internal/modules/[module]/domain/entities/[entity].go

# 3. Repository (10 min)
touch internal/modules/[module]/domain/repositories/[entity]_repository.go
touch internal/modules/[module]/infrastructure/persistence/[entity]_repository_impl.go

# 4. Service (5 min)
touch internal/modules/[module]/domain/services/[entity]_service.go

# 5. Handler + Routes (5 min)
touch internal/modules/[module]/presentation/http/handlers/[entity]_handler.go
# Add routes to existing [module]_routes.go
```

### **Frontend (20 minutes)**
```bash
# 1. Types (5 min)
# Update src/types/[module].ts

# 2. Service (5 min) 
# Update src/services/[module].ts

# 3. Page (10 min)
touch src/app/[module]/[entities]/page.tsx
```

---

## 📋 **Essential Code Snippets**

### **Standard Page Template**
```typescript
'use client'
import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Search, Filter, Download, Plus, MoreHorizontal, Eye, Edit, Loader2, XCircle } from 'lucide-react'

export default function [Entity]Page() {
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table')
  const [searchQuery, setSearchQuery] = useState('')
  const [entities, setEntities] = useState<[Entity][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Handlers
  const handleViewDetails = (entity: [Entity]) => console.log('View:', entity.name)
  const handleEdit = (entity: [Entity]) => console.log('Edit:', entity.name)

  // Standard columns with actions
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
              <Eye className="mr-2 h-4 w-4" />View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(record)}>
              <Edit className="mr-2 h-4 w-4" />Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  return (
    <TwoLevelLayout>
      <Header 
        title="[Entity] Management"
        description="Manage your [entities]"
        breadcrumbs={breadcrumbs}
        actions={<Button size="sm"><Plus className="h-4 w-4 mr-2" />Add [Entity]</Button>}
      />
      <div className="flex-1 p-6 space-y-6">
        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-3xl font-bold text-gray-900">{entities.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search + Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-2" />Filters</Button>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
              <Button variant={viewMode === 'cards' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('cards')}>Cards</Button>
              <Button variant={viewMode === 'table' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('table')}>Table</Button>
            </div>
          </div>
        </div>

        {/* Content States */}
        {loading ? (
          <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Error Loading</p>
              <p className="text-gray-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </div>
        ) : entities.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">No [Entity] Found</p>
              <Button><Plus className="h-4 w-4 mr-2" />Add [Entity]</Button>
            </div>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entities.map((entity) => <[Entity]Card key={entity.id} entity={entity} />)}
          </div>
        ) : (
          <DataTable data={entities} columns={columns} />
        )}
      </div>
    </TwoLevelLayout>
  )
}
```

### **Standard KPI Card**
```typescript
<Card className="p-4">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-600">Metric Name</p>
      <p className="text-3xl font-bold text-blue-600">{value}</p>
    </div>
    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
      <Icon className="h-6 w-6 text-blue-600" />
    </div>
  </div>
</Card>
```

### **Standard Action Menu**
```typescript
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={() => handleViewDetails(record)}>
      <Eye className="mr-2 h-4 w-4" />View Details
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => handleEdit(record)}>
      <Edit className="mr-2 h-4 w-4" />Edit
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## 🎯 **Essential Imports**

### **Standard Page Imports**
```typescript
import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Search, Filter, Download, Plus, MoreHorizontal, Eye, Edit, Settings, Loader2, XCircle } from 'lucide-react'
```

### **Backend Handler Imports**
```go
import (
    "net/http"
    "github.com/gin-gonic/gin"
    "[module]/domain/services"
    "malaka/internal/shared/response"
)
```

---

## 🔧 **Common Patterns**

### **Status Badge Colors**
```typescript
const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  suspended: 'bg-red-100 text-red-800'
}
```

### **Priority Colors**
```typescript
const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800', 
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}
```

### **Standard State Management**
```typescript
const [mounted, setMounted] = useState(false)
const [viewMode, setViewMode] = useState<'cards' | 'table'>('table')
const [searchQuery, setSearchQuery] = useState('')
const [entities, setEntities] = useState<Entity[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
```

### **Standard Load Function**
```typescript
const loadEntities = async () => {
  try {
    setLoading(true)
    setError(null)
    const response = await entityService.getAll()
    setEntities(response.data)
  } catch (err) {
    console.error('Failed to load entities:', err)
    setError('Failed to load entities. Please try again.')
  } finally {
    setLoading(false)
  }
}
```

---

## 🚨 **Common Mistakes to Avoid**

❌ **Don't use AdvancedDataTable** - Use DataTable  
❌ **Don't wrap DataTable in Card** - Use directly  
❌ **Don't use nested layout divs** - TwoLevelLayout → Header → Content  
❌ **Don't use space-x-3 for KPI cards** - Use justify-between  
❌ **Don't forget key prop** - Always add key={entity.id}  
❌ **Don't use accessorKey** - Use key with DataTable  
❌ **Don't forget mounted check** - For date/currency formatting  
❌ **Don't use mock data permanently** - Connect to real API  

---

## ✅ **Quality Checklist (2 minutes)**

### **Visual**
- [ ] Header has description and actions
- [ ] 4 KPI cards with justify-between layout
- [ ] Search bar with proper icon placement
- [ ] View toggle with muted background
- [ ] Actions menu with 3 dots
- [ ] Proper loading/error/empty states

### **Functional**
- [ ] View toggle works
- [ ] Search input controlled
- [ ] Actions menu opens
- [ ] Loading states display
- [ ] Error handling works
- [ ] Empty state shows

### **Code Quality**
- [ ] No TypeScript errors
- [ ] Proper imports used
- [ ] Standard naming conventions
- [ ] Consistent spacing (p-6, space-y-6)
- [ ] Key props on mapped items

---

## 📊 **Performance Tips**

✅ **Do**: Transform data once, use everywhere  
✅ **Do**: Use useMemo for expensive calculations  
✅ **Do**: Debounce search input  
✅ **Do**: Implement pagination for large datasets  
✅ **Do**: Cache API responses when appropriate  

❌ **Don't**: Transform data in render functions  
❌ **Don't**: Call APIs on every keystroke  
❌ **Don't**: Load all data at once  
❌ **Don't**: Ignore loading states  
❌ **Don't**: Forget error boundaries  

---

This quick reference should help you develop consistent, high-quality pages quickly while following all the established patterns and standards.
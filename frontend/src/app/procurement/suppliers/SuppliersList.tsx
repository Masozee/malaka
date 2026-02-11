'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { supplierService } from '@/services/masterdata'
import { Supplier } from '@/types/masterdata'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    PlusSignIcon,
    Search01Icon,
    MoreHorizontalIcon,
    Building01Icon,
    ViewIcon,
    CancelIcon,
    Download01Icon,
    LoadingIcon,
    LocationIcon,
    ShoppingCartIcon,
    ArrowLeft01Icon,
    ArrowRight01Icon,
} from '@hugeicons/core-free-icons'

// Extended interface for UI display
interface SupplierDisplay extends Supplier {
    category?: 'materials' | 'equipment' | 'services' | 'packaging' | 'chemicals' | 'outsourcing'
    type?: 'local' | 'national' | 'international'
    city?: string
    country?: string
    rating?: number
    totalOrders?: number
    totalValue?: number
}

const hashCode = (str: string): number => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
    }
    return Math.abs(hash)
}

const transformSupplierData = (supplier: Supplier): SupplierDisplay => {
    const addressParts = supplier.address?.split(',') || []
    const city = addressParts.length > 1 ? addressParts[addressParts.length - 2]?.trim() : 'Unknown'
    const code = supplier.code || `SUP${supplier.id.slice(-3).toUpperCase()}`
    const hash = hashCode(supplier.id)
    const hash2 = hashCode(supplier.id + 'salt')
    const hash3 = hashCode(supplier.id + 'salt2')

    return {
        ...supplier,
        code,
        city,
        country: 'Indonesia',
        contact_person: supplier.contact_person || 'Contact Person',
        status: supplier.status || 'active',
        category: (supplier.name?.toLowerCase().includes('leather') ? 'materials' :
            supplier.name?.toLowerCase().includes('chemical') ? 'chemicals' :
                supplier.name?.toLowerCase().includes('logistic') ? 'services' :
                    supplier.name?.toLowerCase().includes('packaging') ? 'packaging' :
                        supplier.name?.toLowerCase().includes('equipment') ? 'equipment' :
                            'materials') as SupplierDisplay['category'],
        type: (city?.toLowerCase().includes('jakarta') || city?.toLowerCase().includes('indonesia') ? 'national' :
            city?.toLowerCase().includes('singapore') || city?.toLowerCase().includes('china') ? 'international' :
                'local') as SupplierDisplay['type'],
        rating: Math.round(((hash % 20) / 10 + 3) * 10) / 10,
        totalOrders: (hash2 % 200) + 10,
        totalValue: (hash3 % 5000000000) + 100000000,
    }
}

const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800'
}

const categoryColors: Record<string, string> = {
    materials: 'bg-blue-100 text-blue-800',
    equipment: 'bg-purple-100 text-purple-800',
    services: 'bg-teal-100 text-teal-800',
    packaging: 'bg-orange-100 text-orange-800',
    chemicals: 'bg-red-100 text-red-800',
    outsourcing: 'bg-indigo-100 text-indigo-800'
}

const typeColors: Record<string, string> = {
    local: 'bg-green-100 text-green-800',
    national: 'bg-blue-100 text-blue-800',
    international: 'bg-purple-100 text-purple-800'
}

interface SuppliersListProps {
    initialData: Supplier[]
}

export default function SuppliersList({ initialData }: SuppliersListProps) {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10
    const [suppliers, setSuppliers] = useState<SupplierDisplay[]>(
        initialData.map(transformSupplierData)
    )
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loadSuppliers = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await supplierService.getAll()
            const data = Array.isArray(response) ? response : response.data || []
            setSuppliers((data as Supplier[]).map(transformSupplierData))
        } catch (err) {
            console.error('Failed to load suppliers:', err)
            setError('Failed to load suppliers. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // Filtered data
    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(s => {
            const matchesSearch = !searchQuery ||
                s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (s.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (s.contact_person || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (s.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (s.phone || '').toLowerCase().includes(searchQuery.toLowerCase())
            const matchesStatus = statusFilter === 'all' || s.status === statusFilter
            const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter
            const matchesType = typeFilter === 'all' || s.type === typeFilter
            return matchesSearch && matchesStatus && matchesCategory && matchesType
        })
    }, [suppliers, searchQuery, statusFilter, categoryFilter, typeFilter])

    // Pagination
    const totalPages = Math.ceil(filteredSuppliers.length / pageSize)
    const paginatedSuppliers = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        return filteredSuppliers.slice(start, start + pageSize)
    }, [filteredSuppliers, currentPage])

    // Reset page when filters change
    useMemo(() => { setCurrentPage(1) }, [searchQuery, statusFilter, categoryFilter, typeFilter])

    // Stats
    const totalSuppliers = suppliers.length
    const activeSuppliers = suppliers.filter(s => s.status === 'active').length
    const inactiveSuppliers = suppliers.filter(s => s.status === 'inactive').length

    // Selection (applies to current page)
    const allPageSelected = paginatedSuppliers.length > 0 && paginatedSuppliers.every(s => selectedIds.has(s.id))
    const someSelected = selectedIds.size > 0

    const handleSelectAll = (checked: boolean) => {
        const next = new Set(selectedIds)
        if (checked) {
            paginatedSuppliers.forEach(s => next.add(s.id))
        } else {
            paginatedSuppliers.forEach(s => next.delete(s.id))
        }
        setSelectedIds(next)
    }

    const handleSelectItem = (id: string, checked: boolean) => {
        const next = new Set(selectedIds)
        if (checked) next.add(id)
        else next.delete(id)
        setSelectedIds(next)
    }

    const exportCsv = (data: SupplierDisplay[], filename: string) => {
        const headers = ['Code', 'Name', 'Contact Person', 'Phone', 'Email', 'Address', 'Status', 'Payment Terms']
        const rows = data.map(s => [
            s.code || '',
            s.name,
            s.contact_person || '',
            s.phone || '',
            s.email || '',
            (s.address || '').replace(/,/g, ';'),
            s.status || '',
            s.payment_terms || '',
        ])
        const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
    }

    const breadcrumbs = [
        { label: 'Procurement', href: '/procurement' },
        { label: 'Suppliers', href: '/procurement/suppliers' }
    ]

    const hasActiveFilters = statusFilter !== 'all' || categoryFilter !== 'all' || typeFilter !== 'all'
    const startItem = filteredSuppliers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0
    const endItem = Math.min(currentPage * pageSize, filteredSuppliers.length)

    return (
        <TwoLevelLayout>
            <Header
                title="Supplier Management"
                description="Manage your suppliers and their information"
                breadcrumbs={breadcrumbs}
                actions={
                    <Link href="/procurement/suppliers/new">
                        <Button size="sm">
                            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                            Add Supplier
                        </Button>
                    </Link>
                }
            />

            <div className="flex-1 overflow-auto p-6 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                        <p className="text-sm font-medium text-muted-foreground">Total Suppliers</p>
                        <p className="text-2xl font-bold">{totalSuppliers}</p>
                    </Card>
                    <Card className="p-4">
                        <p className="text-sm font-medium text-muted-foreground">Active</p>
                        <p className="text-2xl font-bold">{activeSuppliers}</p>
                    </Card>
                    <Card className="p-4">
                        <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                        <p className="text-2xl font-bold">{inactiveSuppliers}</p>
                    </Card>
                </div>

                {/* Search left, Filters + Export right */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 max-w-sm">
                        <div className="relative">
                            <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search suppliers..."
                                className="pl-9 bg-white dark:bg-gray-950"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[130px] h-9 text-sm">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-[130px] h-9 text-sm">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="materials">Materials</SelectItem>
                                <SelectItem value="equipment">Equipment</SelectItem>
                                <SelectItem value="services">Services</SelectItem>
                                <SelectItem value="packaging">Packaging</SelectItem>
                                <SelectItem value="chemicals">Chemicals</SelectItem>
                                <SelectItem value="outsourcing">Outsourcing</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[130px] h-9 text-sm">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="local">Local</SelectItem>
                                <SelectItem value="national">National</SelectItem>
                                <SelectItem value="international">International</SelectItem>
                            </SelectContent>
                        </Select>

                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" className="h-9 text-sm" onClick={() => { setStatusFilter('all'); setCategoryFilter('all'); setTypeFilter('all') }}>
                                Clear
                            </Button>
                        )}

                        {someSelected ? (
                            <Button variant="outline" size="sm" className="h-9 text-sm" onClick={() => exportCsv(suppliers.filter(s => selectedIds.has(s.id)), `suppliers-selected-${new Date().toISOString().slice(0, 10)}.csv`)}>
                                <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-1.5" />
                                Export ({selectedIds.size})
                            </Button>
                        ) : (
                            <Button variant="outline" size="sm" className="h-9 text-sm" onClick={() => exportCsv(filteredSuppliers, `suppliers-export-${new Date().toISOString().slice(0, 10)}.csv`)}>
                                <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-1.5" />
                                Export
                            </Button>
                        )}
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <HugeiconsIcon icon={LoadingIcon} className="h-8 w-8 animate-spin" />
                        <span className="ml-2 text-muted-foreground">Loading suppliers...</span>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <HugeiconsIcon icon={CancelIcon} className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <p className="text-lg font-medium mb-2">Error Loading Suppliers</p>
                            <p className="text-muted-foreground mb-4">{error}</p>
                            <Button onClick={loadSuppliers}>Try Again</Button>
                        </div>
                    </div>
                ) : filteredSuppliers.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <HugeiconsIcon icon={Building01Icon} className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-lg font-medium mb-2">No Suppliers Found</p>
                            <p className="text-muted-foreground mb-4">
                                {hasActiveFilters || searchQuery ? 'Try adjusting your filters or search.' : 'Get started by adding your first supplier.'}
                            </p>
                            {!hasActiveFilters && !searchQuery && (
                                <Link href="/procurement/suppliers/new">
                                    <Button>
                                        <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                                        Add Supplier
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="rounded-lg border bg-card overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/40">
                                        <th className="px-4 py-3 w-10">
                                            <Checkbox
                                                checked={allPageSelected}
                                                onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Supplier</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 w-12"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {paginatedSuppliers.map((supplier) => (
                                        <tr key={supplier.id} className={`hover:bg-muted/40 transition-colors ${selectedIds.has(supplier.id) ? 'bg-muted/20' : ''}`}>
                                            <td className="px-4 py-3">
                                                <Checkbox
                                                    checked={selectedIds.has(supplier.id)}
                                                    onCheckedChange={(checked) => handleSelectItem(supplier.id, !!checked)}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link href={`/procurement/suppliers/${supplier.id}`} className="font-medium text-foreground hover:underline">
                                                    {supplier.name}
                                                </Link>
                                                <div className="text-xs text-muted-foreground mt-0.5">{supplier.code}{supplier.contact_person ? ` · ${supplier.contact_person}` : ''}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {supplier.category ? (
                                                    <Badge className={categoryColors[supplier.category] || ''}>
                                                        {supplier.category.charAt(0).toUpperCase() + supplier.category.slice(1)}
                                                    </Badge>
                                                ) : <span className="text-muted-foreground">-</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                {supplier.type ? (
                                                    <Badge className={typeColors[supplier.type] || ''}>
                                                        {supplier.type.charAt(0).toUpperCase() + supplier.type.slice(1)}
                                                    </Badge>
                                                ) : <span className="text-muted-foreground">-</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <HugeiconsIcon icon={LocationIcon} className="h-3.5 w-3.5 mr-1" />
                                                    {supplier.city || 'Unknown'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">
                                                {supplier.phone || '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge className={statusColors[supplier.status || 'active'] || statusColors.active}>
                                                    {(supplier.status || 'active').charAt(0).toUpperCase() + (supplier.status || 'active').slice(1)}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => router.push(`/procurement/suppliers/${supplier.id}`)}>
                                                            <HugeiconsIcon icon={ViewIcon} className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => router.push(`/procurement/purchase-orders/new?supplier=${supplier.id}`)}>
                                                            <HugeiconsIcon icon={ShoppingCartIcon} className="mr-2 h-4 w-4" />
                                                            Create Order
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Showing {startItem}–{endItem} of {filteredSuppliers.length} suppliers
                                {someSelected && <span className="ml-2">· {selectedIds.size} selected</span>}
                            </p>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    disabled={currentPage <= 1}
                                    onClick={() => setCurrentPage(p => p - 1)}
                                >
                                    <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
                                </Button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                    .reduce<(number | string)[]>((acc, p, i, arr) => {
                                        if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...')
                                        acc.push(p)
                                        return acc
                                    }, [])
                                    .map((p, i) =>
                                        typeof p === 'string' ? (
                                            <span key={`ellipsis-${i}`} className="px-1 text-sm text-muted-foreground">...</span>
                                        ) : (
                                            <Button
                                                key={p}
                                                variant={p === currentPage ? 'default' : 'outline'}
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => setCurrentPage(p)}
                                            >
                                                {p}
                                            </Button>
                                        )
                                    )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                >
                                    <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </TwoLevelLayout>
    )
}

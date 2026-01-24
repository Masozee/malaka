'use client'

import { useState, useCallback } from 'react'
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
import { supplierService } from '@/services/masterdata'
import { Supplier } from '@/types/masterdata'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    PlusSignIcon,
    Search01Icon,
    MoreHorizontalIcon,
    Building01Icon,
    UserGroupIcon,
    StarIcon,
    Package01Icon,
    ViewIcon,
    CheckmarkCircle01Icon,
    Cancel01Icon,
    FilterIcon,
    Download01Icon,
    Loading01Icon,
    Location01Icon,
    CallIcon,
    MailAtSign01Icon,
    UserIcon,
    ShoppingCart01Icon
} from '@hugeicons/core-free-icons'

// Extended interface for UI display (adds computed/mock fields to basic Supplier)
interface SupplierDisplay extends Supplier {
    category?: 'materials' | 'equipment' | 'services' | 'packaging' | 'chemicals' | 'outsourcing'
    type?: 'local' | 'national' | 'international'
    city?: string
    country?: string
    rating?: number // 1-5 stars
    deliveryTerms?: string
    minOrderValue?: number
    totalOrders?: number
    totalValue?: number
    lastOrderDate?: string
    certifications?: string[]
    contractStart?: string
    contractEnd?: string
}

// Simple deterministic hash function for generating consistent values from supplier ID
const hashCode = (str: string): number => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
}

// Transform API supplier data to display format with sensible defaults
const transformSupplierData = (supplier: Supplier): SupplierDisplay => {
    // Extract city from address (simple heuristic)
    const addressParts = supplier.address?.split(',') || []
    const city = addressParts.length > 1 ? addressParts[addressParts.length - 2]?.trim() : 'Unknown'

    // Generate code if not present
    const code = supplier.code || `SUP${supplier.id.slice(-3).toUpperCase()}`

    // Use deterministic hash based on supplier ID for consistent mock data
    const hash = hashCode(supplier.id)
    const hash2 = hashCode(supplier.id + 'salt')
    const hash3 = hashCode(supplier.id + 'salt2')

    // Generate mock business data based on supplier name/type
    const mockBusinessData = {
        category: (supplier.name?.toLowerCase().includes('leather') ? 'materials' :
            supplier.name?.toLowerCase().includes('chemical') ? 'chemicals' :
                supplier.name?.toLowerCase().includes('logistic') ? 'services' :
                    supplier.name?.toLowerCase().includes('packaging') ? 'packaging' :
                        supplier.name?.toLowerCase().includes('equipment') ? 'equipment' :
                            'materials') as SupplierDisplay['category'],

        type: (city?.toLowerCase().includes('jakarta') || city?.toLowerCase().includes('indonesia') ? 'national' :
            city?.toLowerCase().includes('singapore') || city?.toLowerCase().includes('china') ? 'international' :
                'local') as SupplierDisplay['type'],

        // Use deterministic values based on hash
        rating: Math.round(((hash % 20) / 10 + 3) * 10) / 10, // 3.0 - 5.0
        totalOrders: (hash2 % 200) + 10,
        totalValue: (hash3 % 5000000000) + 100000000,
        minOrderValue: (hash % 50000000) + 5000000,
        lastOrderDate: '2026-01-15', // Fixed date to avoid hydration mismatch
        certifications: ['ISO 9001', 'Quality Certified'],
        deliveryTerms: 'FOB Origin'
    }

    return {
        ...supplier,
        code,
        city,
        country: 'Indonesia', // Default country
        contact_person: supplier.contact_person || 'Contact Person',
        status: supplier.status || 'active', // Ensure status is always present
        ...mockBusinessData
    }
}

// Status and category color mappings
const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800'
}

const categoryColors = {
    materials: 'bg-blue-100 text-blue-800',
    equipment: 'bg-purple-100 text-purple-800',
    services: 'bg-teal-100 text-teal-800',
    packaging: 'bg-orange-100 text-orange-800',
    chemicals: 'bg-red-100 text-red-800',
    outsourcing: 'bg-indigo-100 text-indigo-800'
}

const typeColors = {
    local: 'bg-green-100 text-green-800',
    national: 'bg-blue-100 text-blue-800',
    international: 'bg-purple-100 text-purple-800'
}

interface SuppliersListProps {
    initialData: Supplier[]
}

export default function SuppliersList({ initialData }: SuppliersListProps) {
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('table')
    const [searchQuery, setSearchQuery] = useState('')
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
            // Note: In a real pagination scenario, we would use response.page/limit
            // For now we map all returned data
            const data = Array.isArray(response) ? response : response.data || []
            const transformedSuppliers = (data as Supplier[]).map(transformSupplierData)
            setSuppliers(transformedSuppliers)
        } catch (err) {
            console.error('Failed to load suppliers:', err)
            setError('Failed to load suppliers. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const breadcrumbs = [
        { label: 'Procurement', href: '/procurement' },
        { label: 'Suppliers', href: '/procurement/suppliers' }
    ]

    // Calculate statistics
    const totalSuppliers = suppliers.length
    const activeSuppliers = suppliers.filter(supplier => supplier.status === 'active').length
    const suspendedSuppliers = suppliers.filter(supplier => supplier.status === 'suspended').length
    const avgRating = suppliers
        .filter(supplier => (supplier.rating || 0) > 0)
        .reduce((sum, supplier) => sum + (supplier.rating || 0), 0) /
        Math.max(1, suppliers.filter(supplier => (supplier.rating || 0) > 0).length)

    // Action handlers
    const handleViewDetails = (supplier: SupplierDisplay) => {
        // TODO: Navigate to supplier details page
        console.log('View details for supplier:', supplier.name)
    }

    const handleCreateOrder = (supplier: SupplierDisplay) => {
        // TODO: Navigate to create purchase order with pre-selected supplier
        console.log('Create order for supplier:', supplier.name)
    }

    const columns = [
        {
            key: 'name' as keyof SupplierDisplay,
            title: 'Supplier',
            sortable: true,
            render: (value: unknown, record: SupplierDisplay) => (
                <div>
                    <div className="font-medium">{record.name}</div>
                    <div className="text-sm text-gray-500">{record.code} • {record.contact_person || 'No contact'}</div>
                </div>
            )
        },
        {
            key: 'category' as keyof SupplierDisplay,
            title: 'Category',
            sortable: true,
            render: (value: unknown, record: SupplierDisplay) => {
                const category = record.category as keyof typeof categoryColors
                if (!category) return <span className="text-gray-400">-</span>
                return (
                    <Badge className={categoryColors[category]}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Badge>
                )
            }
        },
        {
            key: 'type' as keyof SupplierDisplay,
            title: 'Type',
            sortable: true,
            render: (value: unknown, record: SupplierDisplay) => {
                const type = record.type as keyof typeof typeColors
                if (!type) return <span className="text-gray-400">-</span>
                return (
                    <Badge className={typeColors[type]}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Badge>
                )
            }
        },
        {
            key: 'city' as keyof SupplierDisplay,
            title: 'Location',
            sortable: true,
            render: (value: unknown, record: SupplierDisplay) => (
                <div className="flex items-center text-sm">
                    <HugeiconsIcon icon={Location01Icon} className="h-3 w-3 mr-1 text-gray-400" />
                    {record.city || 'Unknown'}, {record.country || 'Unknown'}
                </div>
            )
        },
        {
            key: 'rating' as keyof SupplierDisplay,
            title: 'Rating',
            sortable: true,
            render: (value: unknown, record: SupplierDisplay) => {
                const rating = record.rating
                return rating && rating > 0 ? (
                    <div className="flex items-center">
                        <HugeiconsIcon icon={StarIcon} className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="font-medium">{rating.toFixed(1)}</span>
                    </div>
                ) : (
                    <span className="text-gray-400">Not rated</span>
                )
            }
        },
        {
            key: 'totalOrders' as keyof SupplierDisplay,
            title: 'Orders',
            sortable: true,
            render: (value: unknown, record: SupplierDisplay) => (
                <div className="text-sm">
                    <div className="font-medium">{record.totalOrders || 0}</div>
                    <div className="text-xs text-gray-500">
                        {record.totalValue ? record.totalValue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : 'No data'}
                    </div>
                </div>
            )
        },
        {
            key: 'status' as keyof SupplierDisplay,
            title: 'Status',
            sortable: true,
            render: (value: unknown, record: SupplierDisplay) => {
                const status = record.status as keyof typeof statusColors
                if (!status) return <span className="text-gray-400">-</span>
                return (
                    <Badge className={statusColors[status]}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                )
            }
        },
        {
            key: 'id' as keyof SupplierDisplay,
            title: 'Actions',
            width: '80px',
            render: (value: unknown, record: SupplierDisplay) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(record)}>
                            <HugeiconsIcon icon={ViewIcon} className="mr-2 h-4 w-4" />
                            View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCreateOrder(record)}>
                            <HugeiconsIcon icon={ShoppingCart01Icon} className="mr-2 h-4 w-4" />
                            Create Order
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    const SupplierCard = ({ supplier }: { supplier: SupplierDisplay }) => (
        <Card className="p-4">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                    <p className="text-sm text-gray-500">{supplier.code} • {supplier.contact_person}</p>
                </div>
                <div className="text-right">
                    <Badge className={statusColors[supplier.status as keyof typeof statusColors]}>
                        {supplier.status ? supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1) : 'Unknown'}
                    </Badge>
                    <div className="mt-1">
                        {supplier.rating && supplier.rating > 0 && (
                            <div className="flex items-center">
                                <HugeiconsIcon icon={StarIcon} className="h-3 w-3 text-yellow-500 mr-1" />
                                <span className="text-sm font-medium">{supplier.rating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                    {supplier.category && (
                        <Badge className={categoryColors[supplier.category as keyof typeof categoryColors]}>
                            {supplier.category.charAt(0).toUpperCase() + supplier.category.slice(1)}
                        </Badge>
                    )}
                    {supplier.type && (
                        <Badge className={typeColors[supplier.type as keyof typeof typeColors]}>
                            {supplier.type.charAt(0).toUpperCase() + supplier.type.slice(1)}
                        </Badge>
                    )}
                </div>

                <div className="flex items-center text-sm">
                    <HugeiconsIcon icon={Location01Icon} className="h-3 w-3 mr-1 text-gray-400" />
                    {supplier.city}, {supplier.country}
                </div>

                {supplier.phone && (
                    <div className="flex items-center text-sm">
                        <HugeiconsIcon icon={CallIcon} className="h-3 w-3 mr-1 text-gray-400" />
                        {supplier.phone}
                    </div>
                )}

                {supplier.email && (
                    <div className="flex items-center text-sm">
                        <HugeiconsIcon icon={MailAtSign01Icon} className="h-3 w-3 mr-1 text-gray-400" />
                        {supplier.email}
                    </div>
                )}

                <div className="flex justify-between">
                    <span className="text-gray-500">Total Orders:</span>
                    <span className="font-medium">{supplier.totalOrders || 0}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-500">Total Value:</span>
                    <span className="font-medium">
                        {supplier.totalValue ? supplier.totalValue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : 'No data'}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-500">Payment Terms:</span>
                    <span>{supplier.payment_terms || supplier.deliveryTerms || 'Not specified'}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-500">Min Order:</span>
                    <span>
                        {supplier.minOrderValue ? supplier.minOrderValue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : 'Not specified'}
                    </span>
                </div>

                {supplier.lastOrderDate && (
                    <div className="flex justify-between">
                        <span className="text-gray-500">Last Order:</span>
                        <span>{supplier.lastOrderDate}</span>
                    </div>
                )}

                {supplier.certifications && supplier.certifications.length > 0 && (
                    <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                        <span className="font-medium text-green-800">Certifications: </span>
                        <span className="text-green-700">{supplier.certifications.join(', ')}</span>
                    </div>
                )}
            </div>

            <div className="flex space-x-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1">
                    <HugeiconsIcon icon={UserIcon} className="h-4 w-4 mr-1" />
                    View Details
                </Button>
                <Button size="sm" className="flex-1">
                    <HugeiconsIcon icon={Package01Icon} className="h-4 w-4 mr-1" />
                    Create Order
                </Button>
            </div>
        </Card>
    )

    return (
        <TwoLevelLayout>
            <Header
                title="Supplier Management"
                description="Manage your suppliers and their information"
                breadcrumbs={breadcrumbs}
                actions={
                    <Button size="sm">
                        <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                        Add Supplier
                    </Button>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Suppliers</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalSuppliers}</p>
                    </Card>

                    <Card className="p-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{activeSuppliers}</p>
                    </Card>

                    <Card className="p-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Suspended</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{suspendedSuppliers}</p>
                    </Card>

                    <Card className="p-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Rating</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {avgRating.toFixed(1)}
                        </p>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search suppliers..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <HugeiconsIcon icon={FilterIcon} className="h-4 w-4 mr-2" />
                            Filters
                        </Button>
                        <Button variant="outline" size="sm">
                            <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
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

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <HugeiconsIcon icon={Loading01Icon} className="h-8 w-8 animate-spin" />
                        <span className="ml-2 text-muted-foreground">
                            Loading suppliers...
                        </span>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <HugeiconsIcon icon={Cancel01Icon} className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <p className="text-lg font-medium text-gray-900 mb-2">Error Loading Suppliers</p>
                            <p className="text-gray-500 mb-4">{error}</p>
                            <Button onClick={loadSuppliers}>
                                Try Again
                            </Button>
                        </div>
                    </div>
                ) : suppliers.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <HugeiconsIcon icon={Building01Icon} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-lg font-medium text-gray-900 mb-2">No Suppliers Found</p>
                            <p className="text-gray-500 mb-4">Get started by adding your first supplier.</p>
                            <Button>
                                <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                                Add Supplier
                            </Button>
                        </div>
                    </div>
                ) : viewMode === 'cards' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {suppliers.map((supplier) => (
                            <SupplierCard key={supplier.id} supplier={supplier} />
                        ))}
                    </div>
                ) : (
                    <DataTable
                        data={suppliers}
                        columns={columns}
                    />
                )}
            </div>
        </TwoLevelLayout>
    )
}

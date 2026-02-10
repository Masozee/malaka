'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    PackageIcon,
    EyeIcon,
    PencilEdit01Icon,
    PlusSignIcon,
    Search01Icon,
    Download01Icon,
    AlertCircleIcon,
    Coins01Icon
} from '@hugeicons/core-free-icons'
import { rawMaterialService, RawMaterial } from '@/services/raw-materials'
import type { RawMaterialFormData } from '@/types/raw-materials'

const statusConfig: Record<string, { label: string; color: string }> = {
    in_stock: { label: 'In Stock', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
    low_stock: { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
    out_of_stock: { label: 'Out of Stock', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
    on_order: { label: 'On Order', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
    expired: { label: 'Expired', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
    quality_hold: { label: 'Quality Hold', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' }
}

const categories = [
    { value: 'Bahan Baku Utama', label: 'Bahan Baku Utama' },
    { value: 'Komponen', label: 'Komponen' },
    { value: 'Bahan Pendukung', label: 'Bahan Pendukung' },
    { value: 'Kimia', label: 'Kimia' },
    { value: 'Aksesoris', label: 'Aksesoris' },
    { value: 'Finishing', label: 'Finishing' },
    { value: 'Kemasan', label: 'Kemasan' },
    { value: 'leather', label: 'Leather' },
    { value: 'fabric', label: 'Fabric' },
    { value: 'sole', label: 'Sole' },
    { value: 'thread', label: 'Thread' },
    { value: 'adhesive', label: 'Adhesive' },
    { value: 'hardware', label: 'Hardware' },
    { value: 'packaging', label: 'Packaging' },
    { value: 'chemical', label: 'Chemical' },
    { value: 'other', label: 'Other' }
]

const statusOptions = [
    { value: 'in_stock', label: 'In Stock' },
    { value: 'low_stock', label: 'Low Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' },
]

const defaultFormData: RawMaterialFormData = {
    materialCode: '',
    materialName: '',
    description: '',
    category: 'other',
    unit: 'pcs',
    minStock: 0,
    maxStock: 0,
    unitCost: 0,
    supplierId: '',
    leadTime: 0,
    location: '',
}

export default function RawMaterialsPage() {
    const router = useRouter()
    const { addToast } = useToast()
    const [mounted, setMounted] = useState(false)
    const [materialsData, setMaterialsData] = useState<RawMaterial[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [selectedStatus, setSelectedStatus] = useState<string>('all')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<RawMaterial | null>(null)
    const [formData, setFormData] = useState<RawMaterialFormData>(defaultFormData)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        setMounted(true)
        fetchRawMaterials()
    }, [])

    const fetchRawMaterials = async () => {
        try {
            setLoading(true)
            const response = await rawMaterialService.getAll()
            setMaterialsData(response.data)
        } catch (error) {
            console.error('Error fetching raw materials:', error)
            setMaterialsData([])
        } finally {
            setLoading(false)
        }
    }

    const filteredData = useMemo(() => {
        let filtered = materialsData

        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            filtered = filtered.filter(item =>
                item.materialName.toLowerCase().includes(lower) ||
                item.materialCode.toLowerCase().includes(lower) ||
                (item.supplier && item.supplier.toLowerCase().includes(lower))
            )
        }

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(item => item.category === selectedCategory)
        }

        if (selectedStatus !== 'all') {
            filtered = filtered.filter(item => item.status === selectedStatus)
        }

        return filtered
    }, [materialsData, searchTerm, selectedCategory, selectedStatus])

    const stats = useMemo(() => {
        const totalItems = materialsData.length
        const totalValue = materialsData.reduce((acc, curr) => acc + (curr.totalValue || 0), 0)
        const lowStock = materialsData.filter(i => i.status === 'low_stock' || i.status === 'out_of_stock').length
        return { totalItems, totalValue, lowStock }
    }, [materialsData])

    const handleOpenCreate = () => {
        setFormData(defaultFormData)
        setIsCreateModalOpen(true)
    }

    const handleOpenEdit = (item: RawMaterial) => {
        setEditingItem(item)
        setFormData({
            materialCode: item.materialCode,
            materialName: item.materialName,
            description: item.description || '',
            category: item.category,
            unit: item.unit,
            minStock: item.minStock,
            maxStock: item.maxStock,
            unitCost: item.unitCost,
            supplierId: item.supplierId || '',
            leadTime: item.leadTime,
            location: item.location || '',
        })
        setIsEditModalOpen(true)
    }

    const handleCreate = async () => {
        if (!formData.materialCode || !formData.materialName || !formData.unit) {
            addToast({ type: 'error', title: 'Please fill in required fields (Code, Name, Unit)' })
            return
        }
        try {
            setSubmitting(true)
            await rawMaterialService.create(formData)
            addToast({ type: 'success', title: 'Material created successfully' })
            setIsCreateModalOpen(false)
            fetchRawMaterials()
        } catch (error) {
            console.error('Error creating material:', error)
            addToast({ type: 'error', title: 'Failed to create material' })
        } finally {
            setSubmitting(false)
        }
    }

    const handleUpdate = async () => {
        if (!editingItem) return
        try {
            setSubmitting(true)
            await rawMaterialService.update(editingItem.id, formData)
            addToast({ type: 'success', title: 'Material updated successfully' })
            setIsEditModalOpen(false)
            setEditingItem(null)
            fetchRawMaterials()
        } catch (error) {
            console.error('Error updating material:', error)
            addToast({ type: 'error', title: 'Failed to update material' })
        } finally {
            setSubmitting(false)
        }
    }

    const handleBatchExport = (items: RawMaterial[]) => {
        const headers = ['Code', 'Name', 'Category', 'Stock', 'Unit', 'Min', 'Max', 'Unit Cost', 'Total Value', 'Supplier', 'Location', 'Status']
        const rows = items.map(item => [
            item.materialCode,
            item.materialName,
            item.category,
            item.currentStock,
            item.unit,
            item.minStock,
            item.maxStock,
            item.unitCost,
            item.totalValue,
            item.supplier,
            item.location,
            item.status
        ])
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `raw-materials-${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const columns: TanStackColumn<RawMaterial>[] = useMemo(() => [
        {
            id: 'materialCode',
            header: 'Code',
            accessorKey: 'materialCode',
            cell: ({ row }) => (
                <Link
                    href={`/inventory/raw-materials/${row.original.id}`}
                    className="font-mono font-medium text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                    {row.original.materialCode}
                </Link>
            )
        },
        {
            id: 'materialName',
            header: 'Material Name',
            accessorKey: 'materialName',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <Link
                        href={`/inventory/raw-materials/${row.original.id}`}
                        className="font-medium text-sm hover:underline"
                    >
                        {row.original.materialName}
                    </Link>
                    <span className="text-xs text-muted-foreground capitalize">{row.original.category}</span>
                </div>
            )
        },
        {
            id: 'stock',
            header: 'Stock Level',
            accessorKey: 'currentStock',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{(row.original.currentStock || 0).toLocaleString()} {row.original.unit}</span>
                    <span className="text-xs text-muted-foreground">
                        Min: {row.original.minStock} | Max: {row.original.maxStock}
                    </span>
                </div>
            )
        },
        {
            id: 'unitCost',
            header: 'Unit Cost',
            accessorKey: 'unitCost',
            cell: ({ row }) => (
                <div className="text-right font-medium text-sm">
                    {mounted ? `Rp ${(row.original.unitCost || 0).toLocaleString('id-ID')}` : '-'}
                </div>
            )
        },
        {
            id: 'totalValue',
            header: 'Total Value',
            accessorKey: 'totalValue',
            cell: ({ row }) => (
                <div className="text-right font-medium text-sm">
                    {mounted ? `Rp ${(row.original.totalValue || 0).toLocaleString('id-ID')}` : '-'}
                </div>
            )
        },
        {
            id: 'supplier',
            header: 'Supplier',
            accessorKey: 'supplier',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.original.supplier || '-'}</span>
                    <span className="text-xs text-muted-foreground">Lead: {row.original.leadTime} days</span>
                </div>
            )
        },
        {
            id: 'location',
            header: 'Location',
            accessorKey: 'location',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">{row.original.location || '-'}</span>
            )
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => {
                const config = statusConfig[row.original.status] || statusConfig.in_stock
                return (
                    <Badge className={`${config.color} border-0 whitespace-nowrap`}>
                        {config.label}
                    </Badge>
                )
            }
        }
    ], [mounted])

    const materialForm = (
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="materialCode">Material Code *</Label>
                <Input
                    id="materialCode"
                    value={formData.materialCode}
                    onChange={e => setFormData(p => ({ ...p, materialCode: e.target.value }))}
                    placeholder="e.g. MAT016"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="materialName">Material Name *</Label>
                <Input
                    id="materialName"
                    value={formData.materialName}
                    onChange={e => setFormData(p => ({ ...p, materialName: e.target.value }))}
                    placeholder="e.g. Premium Cowhide Leather"
                />
            </div>
            <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                    id="description"
                    value={formData.description || ''}
                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                    placeholder="Material description"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                    value={formData.category}
                    onValueChange={v => setFormData(p => ({ ...p, category: v as RawMaterialFormData['category'] }))}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map(c => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select
                    value={formData.unit}
                    onValueChange={v => setFormData(p => ({ ...p, unit: v }))}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                        <SelectItem value="meter">Meter</SelectItem>
                        <SelectItem value="lembar">Lembar</SelectItem>
                        <SelectItem value="pasang">Pasang</SelectItem>
                        <SelectItem value="liter">Liter</SelectItem>
                        <SelectItem value="roll">Roll</SelectItem>
                        <SelectItem value="set">Set</SelectItem>
                        <SelectItem value="pack">Pack</SelectItem>
                        <SelectItem value="botol">Botol</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="unitCost">Unit Cost (Rp)</Label>
                <Input
                    id="unitCost"
                    type="number"
                    value={formData.unitCost}
                    onChange={e => setFormData(p => ({ ...p, unitCost: Number(e.target.value) }))}
                    placeholder="0"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                    id="location"
                    value={formData.location}
                    onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                    placeholder="e.g. WH-A-01"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="minStock">Min Stock</Label>
                <Input
                    id="minStock"
                    type="number"
                    value={formData.minStock}
                    onChange={e => setFormData(p => ({ ...p, minStock: Number(e.target.value) }))}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="maxStock">Max Stock</Label>
                <Input
                    id="maxStock"
                    type="number"
                    value={formData.maxStock}
                    onChange={e => setFormData(p => ({ ...p, maxStock: Number(e.target.value) }))}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="leadTime">Lead Time (days)</Label>
                <Input
                    id="leadTime"
                    type="number"
                    value={formData.leadTime}
                    onChange={e => setFormData(p => ({ ...p, leadTime: Number(e.target.value) }))}
                />
            </div>
        </div>
    )

    return (
        <TwoLevelLayout>
            <Header
                title="Raw Materials"
                description="Manage raw materials inventory for shoe production"
                breadcrumbs={[
                    { label: "Inventory", href: "/inventory" },
                    { label: "Raw Materials" }
                ]}
                actions={
                    <Button onClick={handleOpenCreate}>
                        <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
                        Add Material
                    </Button>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Materials</p>
                                <p className="text-2xl font-bold">{stats.totalItems}</p>
                            </div>
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={PackageIcon} className="h-5 w-5 text-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                                <p className="text-2xl font-bold">
                                    {mounted ? `Rp ${(stats.totalValue / 1000000).toFixed(1)}M` : '-'}
                                </p>
                            </div>
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Coins01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Low Stock Alerts</p>
                                <p className="text-2xl font-bold text-red-600">{stats.lowStock}</p>
                            </div>
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5 text-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between gap-2">
                    <div className="relative w-64">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-9 bg-white dark:bg-gray-900"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-[160px] h-9">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map(category => (
                                    <SelectItem key={category.value} value={category.value}>
                                        {category.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="w-[150px] h-9">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                {statusOptions.map(status => (
                                    <SelectItem key={status.value} value={status.value}>
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button variant="outline" className="h-9" onClick={() => handleBatchExport(filteredData)}>
                            <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
                            Export All
                        </Button>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-muted-foreground">Loading raw materials...</div>
                    </div>
                ) : (
                    <TanStackDataTable
                        data={filteredData}
                        columns={columns}
                        enableRowSelection
                        showColumnToggle={false}
                        onBatchExport={handleBatchExport}
                        customActions={[
                            {
                                label: 'View',
                                icon: EyeIcon,
                                onClick: (item) => router.push(`/inventory/raw-materials/${item.id}`),
                            },
                            {
                                label: 'Edit',
                                icon: PencilEdit01Icon,
                                onClick: (item) => handleOpenEdit(item),
                            }
                        ]}
                    />
                )}
            </div>

            {/* Create Material Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add New Raw Material</DialogTitle>
                    </DialogHeader>
                    {materialForm}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={submitting}>
                            {submitting ? 'Creating...' : 'Create Material'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Material Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Material - {editingItem?.materialName}</DialogTitle>
                    </DialogHeader>
                    {materialForm}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => { setIsEditModalOpen(false); setEditingItem(null) }} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} disabled={submitting}>
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </TwoLevelLayout>
    )
}

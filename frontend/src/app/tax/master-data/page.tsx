'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    DatabaseIcon,
    PlusSignIcon,
    Search01Icon,
    MoreHorizontalIcon
} from '@hugeicons/core-free-icons'
import { taxMasterService, type Tax } from '@/services/tax'

export default function TaxMasterDataPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [taxes, setTaxes] = useState<Tax[]>([])
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const data = await taxMasterService.getAll()
                setTaxes(data)
            } catch (error) {
                console.error('Failed to fetch tax master data:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const filteredData = useMemo(() => {
        if (!searchTerm) return taxes
        const lower = searchTerm.toLowerCase()
        return taxes.filter(item =>
            item.tax_code.toLowerCase().includes(lower) ||
            item.tax_name.toLowerCase().includes(lower)
        )
    }, [taxes, searchTerm])

    // --- Columns ---
    const columns: TanStackColumn<Tax>[] = [
        {
            id: 'tax_code',
            header: 'Tax Code',
            accessorKey: 'tax_code',
            cell: ({ row }) => <span className="font-bold text-sm">{row.original.tax_code}</span>
        },
        {
            id: 'tax_name',
            header: 'Name',
            accessorKey: 'tax_name',
            cell: ({ row }) => <span className="font-medium text-sm">{row.original.tax_name}</span>
        },
        {
            id: 'tax_rate',
            header: 'Rate (%)',
            accessorKey: 'tax_rate',
            cell: ({ row }) => <span className="text-sm">{row.original.tax_rate > 0 ? `${row.original.tax_rate}%` : 'Progressive'}</span>
        },
        {
            id: 'description',
            header: 'Description',
            accessorKey: 'description',
            cell: ({ row }) => <span className="text-sm text-gray-500">{row.original.description}</span>
        },
        {
            id: 'tax_type',
            header: 'Type',
            accessorKey: 'tax_type',
            cell: ({ row }) => (
                <Badge variant="outline" className="capitalize">
                    {row.original.tax_type}
                </Badge>
            )
        },
        {
            id: 'is_active',
            header: 'Status',
            accessorKey: 'is_active',
            cell: ({ row }) => (
                <Badge variant={row.original.is_active ? 'default' : 'secondary'} className="capitalize">
                    {row.original.is_active ? 'active' : 'inactive'}
                </Badge>
            )
        },
        {
            id: 'actions',
            header: '',
            cell: () => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Deactivate</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Tax Master Data"
                description="Manage tax codes and rates"
                breadcrumbs={[
                    { label: 'Tax', href: '/tax' },
                    { label: 'Master Data' }
                ]}
                actions={
                    <Button>
                        <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
                        Add Tax Code
                    </Button>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="relative w-64">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tax codes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-muted-foreground">Loading tax data...</p>
                    </div>
                ) : (
                    <TanStackDataTable
                        data={filteredData}
                        columns={columns}
                    />
                )}
            </div>
        </TwoLevelLayout>
    )
}

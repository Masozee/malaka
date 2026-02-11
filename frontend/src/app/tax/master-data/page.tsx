'use client'

import React, { useState } from 'react'
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

// --- Types ---
interface TaxCode {
    id: string
    code: string
    name: string
    rate: number
    description: string
    type: 'vat' | 'wht'
    status: 'active' | 'inactive'
}

// --- Mock Data ---
const mockTaxCodes: TaxCode[] = [
    { id: '1', code: 'T01', name: 'VAT 11%', rate: 11, description: 'Standard VAT Rate', type: 'vat', status: 'active' },
    { id: '2', code: 'T02', name: 'VAT 0%', rate: 0, description: 'Zero Rated / Export', type: 'vat', status: 'active' },
    { id: '3', code: 'W21', name: 'PPh 21', rate: 0, description: 'Progressive Rate Employee', type: 'wht', status: 'active' },
    { id: '4', code: 'W23', name: 'PPh 23 2%', rate: 2, description: 'Services / Rental', type: 'wht', status: 'active' },
    { id: '5', code: 'W42', name: 'PPh 4(2) 10%', rate: 10, description: 'Final Tax / Building', type: 'wht', status: 'active' },
]

export default function TaxMasterDataPage() {
    const [searchTerm, setSearchTerm] = useState('')

    // --- Columns ---
    const columns: TanStackColumn<TaxCode>[] = [
        {
            id: 'code',
            header: 'Tax Code',
            accessorKey: 'code',
            cell: ({ row }) => <span className="font-bold text-sm">{row.original.code}</span>
        },
        {
            id: 'name',
            header: 'Name',
            accessorKey: 'name',
            cell: ({ row }) => <span className="font-medium text-sm">{row.original.name}</span>
        },
        {
            id: 'rate',
            header: 'Rate (%)',
            accessorKey: 'rate',
            cell: ({ row }) => <span className="text-sm">{row.original.rate > 0 ? `${row.original.rate}%` : 'Progressive'}</span>
        },
        {
            id: 'description',
            header: 'Description',
            accessorKey: 'description',
            cell: ({ row }) => <span className="text-sm text-gray-500">{row.original.description}</span>
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => (
                <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                    {row.original.status}
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

                <TanStackDataTable
                    data={mockTaxCodes}
                    columns={columns}
                />
            </div>
        </TwoLevelLayout>
    )
}

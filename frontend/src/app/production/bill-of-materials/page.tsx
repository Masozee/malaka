'use client'

import React, { useState } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    Search01Icon,
    FilterIcon,
    PlusSignIcon,
    MoreVerticalIcon,
    PencilEdit01Icon,
    Delete02Icon,
    EyeIcon
} from '@hugeicons/core-free-icons'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

interface BOM {
    id: string
    name: string
    product: string
    version: string
    status: 'active' | 'draft' | 'archived'
    components_count: number
    created_at: string
}

export default function BillOfMaterialsPage() {
    const [searchQuery, setSearchQuery] = useState('')

    // Mock data for now
    const data: BOM[] = []

    const columns: TanStackColumn<BOM>[] = [
        {
            id: 'name',
            header: 'BOM Name',
            accessorKey: 'name',
            cell: ({ row }) => (
                <span className="font-medium">{row.original.name}</span>
            )
        },
        {
            id: 'product',
            header: 'Product',
            accessorKey: 'product'
        },
        {
            id: 'version',
            header: 'Version',
            accessorKey: 'version'
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => (
                <span className="capitalize">{row.original.status}</span>
            )
        },
        {
            id: 'components',
            header: 'Components',
            accessorKey: 'components_count'
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <HugeiconsIcon icon={EyeIcon} className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <HugeiconsIcon icon={PencilEdit01Icon} className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                                <HugeiconsIcon icon={Delete02Icon} className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Bill of Materials"
                description="Manage product structures and material requirements"
                breadcrumbs={[
                    { label: 'Production', href: '/production' },
                    { label: 'Bill of Materials' }
                ]}
                actions={
                    <div className="flex gap-2">
                        <Button>
                            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                            Create BOM
                        </Button>
                    </div>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm font-medium text-muted-foreground">Total BOMs</p>
                            <p className="text-2xl font-bold">0</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm font-medium text-muted-foreground">Active</p>
                            <p className="text-2xl font-bold text-green-600">0</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm font-medium text-muted-foreground">Drafts</p>
                            <p className="text-2xl font-bold text-yellow-600">0</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-end gap-2">
                    <div className="relative">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search BOMs..."
                            className="pl-9 w-64"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="sm">
                        <HugeiconsIcon icon={FilterIcon} className="h-4 w-4 mr-2" />
                        Filters
                    </Button>
                </div>

                {/* Table */}
                <TanStackDataTable
                    data={data}
                    columns={columns}
                    pagination={{
                        pageSize: 10,
                        pageIndex: 0,
                        totalRows: 0,
                        onPageChange: () => { }
                    }}
                />
            </div>
        </TwoLevelLayout>
    )
}

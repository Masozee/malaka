'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { TanStackDataTable, TanStackColumn, CustomAction } from '@/components/ui/tanstack-data-table'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    CheckmarkCircle01Icon,
    AlertCircleIcon,
    File01Icon,
    PlusSignIcon,
    Search01Icon,
    FilterIcon,
    Download01Icon,
    Cancel01Icon,
    RefreshIcon
} from '@hugeicons/core-free-icons'
import { contractService } from '@/services/procurement'
import type { Contract, ContractStats } from '@/types/procurement'
import { useToast } from '@/components/ui/toast'

const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    expired: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    terminated: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    renewed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
}

const typeColors: Record<string, string> = {
    supply: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    service: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    framework: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'one-time': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
}

interface ContractsListProps {
    initialData: Contract[]
}

export default function ContractsList({ initialData }: ContractsListProps) {
    const router = useRouter()
    const { addToast } = useToast()
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [contracts, setContracts] = useState<Contract[]>(initialData)
    const [stats, setStats] = useState<ContractStats | null>(null)

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const [listResponse, statsResponse] = await Promise.all([
                contractService.getAll({ limit: 100, search: searchQuery }),
                contractService.getStats()
            ])

            setContracts(listResponse.data || [])
            setStats(statsResponse)
        } catch (err) {
            console.error('Failed to fetch contracts:', err)
            setError('Failed to load contracts. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [searchQuery])

    // Fetch stats on mount
    useEffect(() => {
        contractService.getStats().then(setStats).catch(console.error)
    }, [])

    const breadcrumbs = [
        { label: 'Procurement', href: '/procurement' },
        { label: 'Contracts' }
    ]

    const handleEdit = (contract: Contract) => {
        router.push(`/procurement/contracts/${contract.id}/edit`)
    }

    const handleActivate = async (contract: Contract) => {
        try {
            await contractService.activate(contract.id)
            addToast({ type: 'success', title: 'Contract activated successfully' })
            fetchData()
        } catch (err) {
            console.error('Failed to activate:', err)
            addToast({ type: 'error', title: 'Failed to activate contract' })
        }
    }

    const handleTerminate = async (contract: Contract) => {
        const reason = prompt('Enter termination reason:')
        if (!reason) return
        try {
            await contractService.terminate(contract.id, reason)
            addToast({ type: 'success', title: 'Contract terminated' })
            fetchData()
        } catch (err) {
            console.error('Failed to terminate:', err)
            addToast({ type: 'error', title: 'Failed to terminate contract' })
        }
    }

    const handleRenew = async (contract: Contract) => {
        const newEndDate = prompt('Enter new end date (YYYY-MM-DD):')
        if (!newEndDate) return
        try {
            await contractService.renew(contract.id, newEndDate + 'T00:00:00Z')
            addToast({ type: 'success', title: 'Contract renewed' })
            fetchData()
        } catch (err) {
            console.error('Failed to renew:', err)
            addToast({ type: 'error', title: 'Failed to renew contract' })
        }
    }

    const handleDelete = async (contract: Contract) => {
        if (!confirm('Are you sure you want to delete this contract?')) return
        try {
            await contractService.delete(contract.id)
            addToast({ type: 'success', title: 'Contract deleted' })
            fetchData()
        } catch (err) {
            console.error('Failed to delete:', err)
            addToast({ type: 'error', title: 'Failed to delete contract' })
        }
    }

    // Custom actions for the table
    const customActions: CustomAction<Contract>[] = useMemo(() => [
        {
            label: 'Activate',
            icon: CheckmarkCircle01Icon,
            onClick: handleActivate,
            show: (row) => row.status === 'draft',
        },
        {
            label: 'Renew',
            icon: RefreshIcon,
            onClick: handleRenew,
            show: (row) => row.status === 'active',
        },
        {
            label: 'Terminate',
            icon: Cancel01Icon,
            onClick: handleTerminate,
            show: (row) => row.status === 'active',
        },
    ], [])

    // Table columns
    const columns: TanStackColumn<Contract>[] = useMemo(() => [
        {
            id: 'contract_number',
            header: 'Contract',
            accessorKey: 'contract_number',
            cell: ({ row }) => (
                <Link
                    href={`/procurement/contracts/${row.original.id}`}
                    className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                    <div>{row.original.contract_number}</div>
                    <div className="text-sm text-muted-foreground font-normal">
                        {row.original.supplier_name || row.original.title}
                    </div>
                </Link>
            ),
        },
        {
            id: 'contract_type',
            header: 'Type',
            accessorKey: 'contract_type',
            cell: ({ row }) => (
                <Badge className={typeColors[row.original.contract_type] || 'bg-gray-100 text-gray-800'}>
                    {row.original.contract_type.charAt(0).toUpperCase() + row.original.contract_type.slice(1)}
                </Badge>
            ),
        },
        {
            id: 'value',
            header: 'Value',
            accessorKey: 'value',
            cell: ({ row }) => (
                <span className="text-sm font-medium">
                    {row.original.value.toLocaleString('id-ID', {
                        style: 'currency',
                        currency: row.original.currency || 'IDR',
                        maximumFractionDigits: 0
                    })}
                </span>
            ),
        },
        {
            id: 'start_date',
            header: 'Start Date',
            accessorKey: 'start_date',
            cell: ({ row }) => (
                <span className="text-sm">
                    {new Date(row.original.start_date).toLocaleDateString('id-ID')}
                </span>
            ),
        },
        {
            id: 'end_date',
            header: 'End Date',
            accessorKey: 'end_date',
            cell: ({ row }) => (
                <span className="text-sm">
                    {new Date(row.original.end_date).toLocaleDateString('id-ID')}
                </span>
            ),
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => (
                <Badge className={statusColors[row.original.status] || statusColors.draft}>
                    {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
                </Badge>
            ),
        },
    ], [])

    // Filter contracts based on search
    const filteredContracts = useMemo(() => {
        if (!searchQuery) return contracts
        const query = searchQuery.toLowerCase()
        return contracts.filter(c =>
            c.contract_number?.toLowerCase().includes(query) ||
            c.title?.toLowerCase().includes(query) ||
            c.supplier_name?.toLowerCase().includes(query)
        )
    }, [contracts, searchQuery])

    if (loading && contracts.length === 0) {
        return (
            <TwoLevelLayout>
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </TwoLevelLayout>
        )
    }

    return (
        <TwoLevelLayout>
            <Header
                title="Contract Management"
                description="Manage supplier contracts and agreements"
                breadcrumbs={breadcrumbs}
                actions={
                    <Link href="/procurement/contracts/new">
                        <Button>
                            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                            New Contract
                        </Button>
                    </Link>
                }
            />

            <div className="flex-1 overflow-auto p-6 space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={File01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold">{stats?.total || contracts.length}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Active</p>
                                <p className="text-2xl font-bold">{stats?.active || 0}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
                                <p className="text-2xl font-bold">{stats?.expiring || 0}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Cancel01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Expired</p>
                                <p className="text-2xl font-bold">{stats?.expired || 0}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-end gap-2">
                    <div className="relative">
                        <HugeiconsIcon
                            icon={Search01Icon}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                        />
                        <Input
                            placeholder="Search contracts..."
                            className="pl-9 w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="sm">
                        <HugeiconsIcon icon={FilterIcon} className="h-4 w-4 mr-2" />
                        Filters
                    </Button>
                    <Button variant="outline" size="sm">
                        <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>

                {/* Data Table */}
                {error ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <HugeiconsIcon icon={Cancel01Icon} className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <p className="text-lg font-medium mb-2">Error Loading Contracts</p>
                            <p className="text-muted-foreground mb-4">{error}</p>
                            <Button onClick={fetchData}>Try Again</Button>
                        </div>
                    </div>
                ) : filteredContracts.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <HugeiconsIcon icon={File01Icon} className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-lg font-medium mb-2">No Contracts Found</p>
                            <p className="text-muted-foreground mb-4">Get started by creating your first contract.</p>
                            <Link href="/procurement/contracts/new">
                                <Button>
                                    <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                                    New Contract
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <TanStackDataTable
                        data={filteredContracts}
                        columns={columns}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        customActions={customActions}
                    />
                )}
            </div>
        </TwoLevelLayout>
    )
}

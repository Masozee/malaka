'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon, MoreHorizontalIcon, PlusSignIcon, CreditCardIcon, Dollar01Icon, CheckmarkCircle01Icon, Clock01Icon } from '@hugeicons/core-free-icons'
import { posTransactionService, type PosTransaction } from '@/services/sales'
import Link from 'next/link'

export default function POSPage() {
  const [data, setData] = useState<PosTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    posTransactionService.getAll().then(setData).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!searchTerm) return data
    const q = searchTerm.toLowerCase()
    return data.filter(item =>
      item.payment_method?.toLowerCase().includes(q) ||
      item.customer_name?.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    )
  }, [data, searchTerm])

  const stats = useMemo(() => ({
    total: data.length,
    revenue: data.reduce((s, i) => s + (i.total_amount || 0), 0),
    completed: data.filter(i => (i.payment_status || 'completed') === 'completed' || i.payment_status === 'paid').length,
    pending: data.filter(i => i.payment_status === 'pending').length,
  }), [data])

  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`
  const fmtDate = (d: string) => mounted && d ? new Date(d).toLocaleDateString('id-ID') : '-'

  const columns: TanStackColumn<PosTransaction>[] = [
    {
      id: 'id',
      header: 'Transaction ID',
      accessorKey: 'id',
      cell: ({ row }) => (
        <Link href={`/sales/pos/${row.original.id}`} className="font-medium text-blue-600 hover:underline">
          {row.original.id.slice(0, 8)}...
        </Link>
      ),
    },
    {
      id: 'transaction_date',
      header: 'Date',
      accessorKey: 'transaction_date',
      cell: ({ row }) => <span>{fmtDate(row.original.transaction_date)}</span>,
    },
    {
      id: 'customer_name',
      header: 'Customer',
      accessorKey: 'customer_name',
      cell: ({ row }) => <span>{row.original.customer_name || 'Walk-in'}</span>,
    },
    {
      id: 'payment_method',
      header: 'Payment',
      accessorKey: 'payment_method',
      cell: ({ row }) => <Badge variant="secondary" className="border-0">{row.original.payment_method}</Badge>,
    },
    {
      id: 'total_amount',
      header: 'Total',
      accessorKey: 'total_amount',
      cell: ({ row }) => <span className="font-medium">{fmt(row.original.total_amount)}</span>,
    },
    {
      id: 'payment_status',
      header: 'Status',
      accessorKey: 'payment_status',
      cell: ({ row }) => {
        const s = row.original.payment_status || 'completed'
        const color: Record<string, string> = { paid: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800', completed: 'bg-green-100 text-green-800', failed: 'bg-red-100 text-red-800' }
        return <Badge className={`${color[s] || 'bg-gray-100 text-gray-800'} border-0`}>{s}</Badge>
      },
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild><Link href={`/sales/pos/${row.original.id}`}>View Details</Link></DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.id)}>Copy ID</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(row.original.id)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const handleDelete = async (id: string) => {
    try {
      await posTransactionService.delete(id)
      setData(prev => prev.filter(i => i.id !== id))
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  return (
    <TwoLevelLayout>
      <Header
        title="Point of Sale"
        breadcrumbs={[{ label: 'Sales', href: '/sales' }, { label: 'Point of Sale' }]}
        actions={<Button asChild><Link href="/sales/pos/new"><HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />New Sale</Link></Button>}
      />
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center"><HugeiconsIcon icon={CreditCardIcon} className="h-5 w-5 text-foreground" /></div>
              <div><p className="text-sm font-medium text-muted-foreground">Total Transactions</p><p className="text-2xl font-bold">{stats.total}</p></div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center"><HugeiconsIcon icon={Dollar01Icon} className="h-5 w-5 text-foreground" /></div>
              <div><p className="text-sm font-medium text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold">{mounted ? fmt(stats.revenue) : '-'}</p></div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center"><HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-foreground" /></div>
              <div><p className="text-sm font-medium text-muted-foreground">Completed</p><p className="text-2xl font-bold">{stats.completed}</p></div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center"><HugeiconsIcon icon={Clock01Icon} className="h-5 w-5 text-foreground" /></div>
              <div><p className="text-sm font-medium text-muted-foreground">Pending</p><p className="text-2xl font-bold">{stats.pending}</p></div>
            </div>
          </Card>
        </div>

        <div className="relative w-80">
          <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search transactions..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 bg-white text-sm" style={{ fontSize: '14px' }} />
        </div>
        <TanStackDataTable data={filtered} columns={columns} loading={loading} showColumnToggle={false} />
      </div>
    </TwoLevelLayout>
  )
}

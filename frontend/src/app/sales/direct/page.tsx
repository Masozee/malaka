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
import { Search01Icon, MoreHorizontalIcon, PlusSignIcon, StoreIcon, Dollar01Icon, UserGroupIcon, TruckIcon } from '@hugeicons/core-free-icons'
import { posTransactionService, type PosTransaction } from '@/services/sales'
import Link from 'next/link'

export default function DirectSalesPage() {
  const [data, setData] = useState<PosTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { posTransactionService.getAll().then(setData).finally(() => setLoading(false)) }, [])

  const filtered = useMemo(() => {
    if (!searchTerm) return data
    const q = searchTerm.toLowerCase()
    return data.filter(i => i.customer_name?.toLowerCase().includes(q) || i.sales_person?.toLowerCase().includes(q) || i.id.toLowerCase().includes(q))
  }, [data, searchTerm])

  const stats = useMemo(() => ({
    total: data.length,
    revenue: data.reduce((s, i) => s + (i.total_amount || 0), 0),
    customers: new Set(data.map(i => i.customer_name).filter(Boolean)).size,
    avgTransaction: data.length > 0 ? data.reduce((s, i) => s + (i.total_amount || 0), 0) / data.length : 0,
  }), [data])

  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`
  const fmtDate = (d: string) => mounted && d ? new Date(d).toLocaleDateString('id-ID') : '-'

  const columns: TanStackColumn<PosTransaction>[] = [
    { id: 'id', header: 'Transaction ID', accessorKey: 'id', cell: ({ row }) => <Link href={`/sales/direct/${row.original.id}`} className="font-medium text-blue-600 hover:underline">{row.original.id.slice(0, 8)}...</Link> },
    { id: 'transaction_date', header: 'Date', accessorKey: 'transaction_date', cell: ({ row }) => <span>{fmtDate(row.original.transaction_date)}</span> },
    { id: 'customer_name', header: 'Customer', accessorKey: 'customer_name', cell: ({ row }) => <span>{row.original.customer_name || '-'}</span> },
    { id: 'sales_person', header: 'Sales Person', accessorKey: 'sales_person', cell: ({ row }) => <span>{row.original.sales_person || '-'}</span> },
    { id: 'visit_type', header: 'Visit Type', accessorKey: 'visit_type', cell: ({ row }) => <span>{row.original.visit_type || '-'}</span> },
    { id: 'total_amount', header: 'Total', accessorKey: 'total_amount', cell: ({ row }) => <span className="font-medium">{fmt(row.original.total_amount)}</span> },
    { id: 'delivery_status', header: 'Delivery', accessorKey: 'delivery_status', cell: ({ row }) => { const s = row.original.delivery_status || '-'; return s !== '-' ? <Badge variant="secondary" className="border-0">{s}</Badge> : <span>-</span> } },
    { id: 'actions', header: '', enableSorting: false, cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="h-8 w-8 p-0"><HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild><Link href={`/sales/direct/${row.original.id}`}>View Details</Link></DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.id)}>Copy ID</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(row.original.id)}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )},
  ]

  const handleDelete = async (id: string) => { try { await posTransactionService.delete(id); setData(prev => prev.filter(i => i.id !== id)) } catch (err) { console.error('Delete failed:', err) } }

  return (
    <TwoLevelLayout>
      <Header title="Direct Sales" breadcrumbs={[{ label: 'Sales', href: '/sales' }, { label: 'Direct Sales' }]} actions={<Button><HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />New Direct Sale</Button>} />
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4"><div className="flex items-center space-x-3"><div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center"><HugeiconsIcon icon={StoreIcon} className="h-5 w-5 text-foreground" /></div><div><p className="text-sm font-medium text-muted-foreground">Total Sales</p><p className="text-2xl font-bold">{stats.total}</p></div></div></Card>
          <Card className="p-4"><div className="flex items-center space-x-3"><div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center"><HugeiconsIcon icon={Dollar01Icon} className="h-5 w-5 text-foreground" /></div><div><p className="text-sm font-medium text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold">{mounted ? fmt(stats.revenue) : '-'}</p></div></div></Card>
          <Card className="p-4"><div className="flex items-center space-x-3"><div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center"><HugeiconsIcon icon={UserGroupIcon} className="h-5 w-5 text-foreground" /></div><div><p className="text-sm font-medium text-muted-foreground">Unique Customers</p><p className="text-2xl font-bold">{stats.customers}</p></div></div></Card>
          <Card className="p-4"><div className="flex items-center space-x-3"><div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center"><HugeiconsIcon icon={TruckIcon} className="h-5 w-5 text-foreground" /></div><div><p className="text-sm font-medium text-muted-foreground">Avg Transaction</p><p className="text-2xl font-bold">{mounted ? fmt(Math.round(stats.avgTransaction)) : '-'}</p></div></div></Card>
        </div>
        <div className="relative w-80">
          <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search direct sales..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 bg-white text-sm" style={{ fontSize: '14px' }} />
        </div>
        <TanStackDataTable data={filtered} columns={columns} loading={loading} showColumnToggle={false} />
      </div>
    </TwoLevelLayout>
  )
}

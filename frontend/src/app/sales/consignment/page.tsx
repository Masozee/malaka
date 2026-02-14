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
import { Search01Icon, MoreHorizontalIcon, PlusSignIcon, Package01Icon, Dollar01Icon, CheckmarkCircle01Icon, Clock01Icon } from '@hugeicons/core-free-icons'
import { consignmentSaleService, type ConsignmentSale } from '@/services/sales'
import Link from 'next/link'

export default function ConsignmentPage() {
  const [data, setData] = useState<ConsignmentSale[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { consignmentSaleService.getAll().then(setData).finally(() => setLoading(false)) }, [])

  const filtered = useMemo(() => {
    if (!searchTerm) return data
    const q = searchTerm.toLowerCase()
    return data.filter(item =>
      item.consignee_id?.toLowerCase().includes(q) ||
      item.status?.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    )
  }, [data, searchTerm])

  const stats = useMemo(() => ({
    total: data.length,
    revenue: data.reduce((s, i) => s + (i.total_amount || 0), 0),
    active: data.filter(i => i.status === 'ACTIVE').length,
    settled: data.filter(i => i.status === 'SETTLED').length,
  }), [data])

  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`
  const fmtDate = (d: string) => mounted && d ? new Date(d).toLocaleDateString('id-ID') : '-'
  const statusColor: Record<string, string> = { ACTIVE: 'bg-green-100 text-green-800', SETTLED: 'bg-blue-100 text-blue-800', CANCELLED: 'bg-red-100 text-red-800' }

  const columns: TanStackColumn<ConsignmentSale>[] = [
    { id: 'id', header: 'Consignment ID', accessorKey: 'id', cell: ({ row }) => <Link href={`/sales/consignment/${row.original.id}`} className="font-medium text-blue-600 hover:underline">{row.original.id.slice(0, 8)}...</Link> },
    { id: 'consignee_id', header: 'Consignee', accessorKey: 'consignee_id', cell: ({ row }) => <span>{row.original.consignee_id.slice(0, 8)}...</span> },
    { id: 'sales_date', header: 'Sales Date', accessorKey: 'sales_date', cell: ({ row }) => <span>{fmtDate(row.original.sales_date)}</span> },
    { id: 'total_amount', header: 'Total', accessorKey: 'total_amount', cell: ({ row }) => <span className="font-medium">{fmt(row.original.total_amount)}</span> },
    { id: 'status', header: 'Status', accessorKey: 'status', cell: ({ row }) => <Badge className={`${statusColor[row.original.status] || 'bg-gray-100 text-gray-800'} border-0`}>{row.original.status}</Badge> },
    { id: 'created_at', header: 'Created', accessorKey: 'created_at', cell: ({ row }) => <span>{fmtDate(row.original.created_at)}</span> },
    { id: 'actions', header: '', enableSorting: false, cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="h-8 w-8 p-0"><HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild><Link href={`/sales/consignment/${row.original.id}`}>View Details</Link></DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.id)}>Copy ID</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(row.original.id)}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )},
  ]

  const handleDelete = async (id: string) => { try { await consignmentSaleService.delete(id); setData(prev => prev.filter(i => i.id !== id)) } catch (err) { console.error('Delete failed:', err) } }

  return (
    <TwoLevelLayout>
      <Header title="Consignment Sales" breadcrumbs={[{ label: 'Sales', href: '/sales' }, { label: 'Consignment' }]} actions={<Button><HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />New Consignment</Button>} />
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4"><div className="flex items-center space-x-3"><div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center"><HugeiconsIcon icon={Package01Icon} className="h-5 w-5 text-foreground" /></div><div><p className="text-sm font-medium text-muted-foreground">Total Consignments</p><p className="text-2xl font-bold">{stats.total}</p></div></div></Card>
          <Card className="p-4"><div className="flex items-center space-x-3"><div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center"><HugeiconsIcon icon={Dollar01Icon} className="h-5 w-5 text-foreground" /></div><div><p className="text-sm font-medium text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold">{mounted ? fmt(stats.revenue) : '-'}</p></div></div></Card>
          <Card className="p-4"><div className="flex items-center space-x-3"><div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center"><HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-foreground" /></div><div><p className="text-sm font-medium text-muted-foreground">Active</p><p className="text-2xl font-bold">{stats.active}</p></div></div></Card>
          <Card className="p-4"><div className="flex items-center space-x-3"><div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center"><HugeiconsIcon icon={Clock01Icon} className="h-5 w-5 text-foreground" /></div><div><p className="text-sm font-medium text-muted-foreground">Settled</p><p className="text-2xl font-bold">{stats.settled}</p></div></div></Card>
        </div>
        <div className="relative w-80">
          <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search consignments..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 bg-white text-sm" style={{ fontSize: '14px' }} />
        </div>
        <TanStackDataTable data={filtered} columns={columns} loading={loading} showColumnToggle={false} />
      </div>
    </TwoLevelLayout>
  )
}

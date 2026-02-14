'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { Search01Icon, MoreHorizontalIcon, PlusSignIcon, Package01Icon, Dollar01Icon, Calendar01Icon, File01Icon } from '@hugeicons/core-free-icons'
import { salesReturnService, type SalesReturn } from '@/services/sales'
import Link from 'next/link'

export default function ReturnsPage() {
  const [data, setData] = useState<SalesReturn[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { salesReturnService.getAll().then(setData).finally(() => setLoading(false)) }, [])

  const filtered = useMemo(() => {
    if (!searchTerm) return data
    const q = searchTerm.toLowerCase()
    return data.filter(item =>
      item.reason?.toLowerCase().includes(q) ||
      item.sales_invoice_id?.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    )
  }, [data, searchTerm])

  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = data.filter(i => {
      const d = new Date(i.return_date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    return {
      total: data.length,
      totalRefund: data.reduce((s, i) => s + (i.total_amount || 0), 0),
      thisMonth: thisMonth.length,
      uniqueInvoices: new Set(data.map(i => i.sales_invoice_id).filter(Boolean)).size,
    }
  }, [data])

  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`
  const fmtDate = (d: string) => mounted && d ? new Date(d).toLocaleDateString('id-ID') : '-'

  const columns: TanStackColumn<SalesReturn>[] = [
    { id: 'id', header: 'Return ID', accessorKey: 'id', cell: ({ row }) => <Link href={`/sales/returns/${row.original.id}`} className="font-medium text-blue-600 hover:underline">{row.original.id.slice(0, 8)}...</Link> },
    { id: 'sales_invoice_id', header: 'Invoice', accessorKey: 'sales_invoice_id', cell: ({ row }) => <span>{row.original.sales_invoice_id.slice(0, 8)}...</span> },
    { id: 'return_date', header: 'Return Date', accessorKey: 'return_date', cell: ({ row }) => <span>{fmtDate(row.original.return_date)}</span> },
    { id: 'reason', header: 'Reason', accessorKey: 'reason', cell: ({ row }) => <span className="truncate max-w-[200px] block">{row.original.reason}</span> },
    { id: 'total_amount', header: 'Amount', accessorKey: 'total_amount', cell: ({ row }) => <span className="font-medium">{fmt(row.original.total_amount)}</span> },
    { id: 'created_at', header: 'Created', accessorKey: 'created_at', cell: ({ row }) => <span>{fmtDate(row.original.created_at)}</span> },
    { id: 'actions', header: '', enableSorting: false, cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="h-8 w-8 p-0"><HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild><Link href={`/sales/returns/${row.original.id}`}>View Details</Link></DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.id)}>Copy ID</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(row.original.id)}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )},
  ]

  const handleDelete = async (id: string) => { try { await salesReturnService.delete(id); setData(prev => prev.filter(i => i.id !== id)) } catch (err) { console.error('Delete failed:', err) } }

  return (
    <TwoLevelLayout>
      <Header title="Sales Returns" breadcrumbs={[{ label: 'Sales', href: '/sales' }, { label: 'Returns' }]} actions={<Button><HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />New Return</Button>} />
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4"><div className="flex items-center space-x-3"><div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center"><HugeiconsIcon icon={Package01Icon} className="h-5 w-5 text-foreground" /></div><div><p className="text-sm font-medium text-muted-foreground">Total Returns</p><p className="text-2xl font-bold">{stats.total}</p></div></div></Card>
          <Card className="p-4"><div className="flex items-center space-x-3"><div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center"><HugeiconsIcon icon={Dollar01Icon} className="h-5 w-5 text-foreground" /></div><div><p className="text-sm font-medium text-muted-foreground">Total Refund</p><p className="text-2xl font-bold">{mounted ? fmt(stats.totalRefund) : '-'}</p></div></div></Card>
          <Card className="p-4"><div className="flex items-center space-x-3"><div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center"><HugeiconsIcon icon={Calendar01Icon} className="h-5 w-5 text-foreground" /></div><div><p className="text-sm font-medium text-muted-foreground">This Month</p><p className="text-2xl font-bold">{stats.thisMonth}</p></div></div></Card>
          <Card className="p-4"><div className="flex items-center space-x-3"><div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center"><HugeiconsIcon icon={File01Icon} className="h-5 w-5 text-foreground" /></div><div><p className="text-sm font-medium text-muted-foreground">Unique Invoices</p><p className="text-2xl font-bold">{stats.uniqueInvoices}</p></div></div></Card>
        </div>
        <div className="relative w-80">
          <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search returns..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 bg-white text-sm" style={{ fontSize: '14px' }} />
        </div>
        <TanStackDataTable data={filtered} columns={columns} loading={loading} showColumnToggle={false} />
      </div>
    </TwoLevelLayout>
  )
}

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
import { Search01Icon, MoreHorizontalIcon, PlusSignIcon, File01Icon, Dollar01Icon, ChartIncreaseIcon, Calendar01Icon } from '@hugeicons/core-free-icons'
import { salesInvoiceService, type SalesInvoice } from '@/services/sales'
import Link from 'next/link'

export default function QuotationsPage() {
  const [data, setData] = useState<SalesInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { salesInvoiceService.getAll().then(setData).finally(() => setLoading(false)) }, [])

  const filtered = useMemo(() => {
    if (!searchTerm) return data
    const q = searchTerm.toLowerCase()
    return data.filter(item =>
      item.sales_order_id?.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    )
  }, [data, searchTerm])

  const stats = useMemo(() => ({
    total: data.length,
    totalSubtotal: data.reduce((s, i) => s + (i.total_amount || 0), 0),
    totalTax: data.reduce((s, i) => s + (i.tax_amount || 0), 0),
    totalGrand: data.reduce((s, i) => s + (i.grand_total || 0), 0),
  }), [data])

  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`
  const fmtDate = (d: string) => mounted && d ? new Date(d).toLocaleDateString('id-ID') : '-'

  const columns: TanStackColumn<SalesInvoice>[] = [
    { id: 'id', header: 'Invoice ID', accessorKey: 'id', cell: ({ row }) => <Link href={`/sales/quotations/${row.original.id}`} className="font-medium text-blue-600 hover:underline">{row.original.id.slice(0, 8)}...</Link> },
    { id: 'sales_order_id', header: 'Sales Order', accessorKey: 'sales_order_id', cell: ({ row }) => <span>{row.original.sales_order_id.slice(0, 8)}...</span> },
    { id: 'invoice_date', header: 'Invoice Date', accessorKey: 'invoice_date', cell: ({ row }) => <span>{fmtDate(row.original.invoice_date)}</span> },
    { id: 'total_amount', header: 'Subtotal', accessorKey: 'total_amount', cell: ({ row }) => <span>{fmt(row.original.total_amount)}</span> },
    { id: 'tax_amount', header: 'Tax', accessorKey: 'tax_amount', cell: ({ row }) => <span>{fmt(row.original.tax_amount)}</span> },
    { id: 'grand_total', header: 'Grand Total', accessorKey: 'grand_total', cell: ({ row }) => <span className="font-medium">{fmt(row.original.grand_total)}</span> },
    { id: 'created_at', header: 'Created', accessorKey: 'created_at', cell: ({ row }) => <span>{fmtDate(row.original.created_at)}</span> },
    { id: 'actions', header: '', enableSorting: false, cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="h-8 w-8 p-0"><HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild><Link href={`/sales/quotations/${row.original.id}`}>View Details</Link></DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.id)}>Copy ID</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(row.original.id)}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )},
  ]

  const handleDelete = async (id: string) => { try { await salesInvoiceService.delete(id); setData(prev => prev.filter(i => i.id !== id)) } catch (err) { console.error('Delete failed:', err) } }

  return (
    <TwoLevelLayout>
      <Header title="Quotations / Invoices" breadcrumbs={[{ label: 'Sales', href: '/sales' }, { label: 'Quotations' }]} actions={<Button><HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />New Invoice</Button>} />
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4"><div className="flex items-center space-x-3"><div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center"><HugeiconsIcon icon={File01Icon} className="h-5 w-5 text-foreground" /></div><div><p className="text-sm font-medium text-muted-foreground">Total Invoices</p><p className="text-2xl font-bold">{stats.total}</p></div></div></Card>
          <Card className="p-4"><div className="flex items-center space-x-3"><div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center"><HugeiconsIcon icon={Dollar01Icon} className="h-5 w-5 text-foreground" /></div><div><p className="text-sm font-medium text-muted-foreground">Total Subtotal</p><p className="text-2xl font-bold">{mounted ? fmt(stats.totalSubtotal) : '-'}</p></div></div></Card>
          <Card className="p-4"><div className="flex items-center space-x-3"><div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center"><HugeiconsIcon icon={Calendar01Icon} className="h-5 w-5 text-foreground" /></div><div><p className="text-sm font-medium text-muted-foreground">Total Tax</p><p className="text-2xl font-bold">{mounted ? fmt(stats.totalTax) : '-'}</p></div></div></Card>
          <Card className="p-4"><div className="flex items-center space-x-3"><div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center"><HugeiconsIcon icon={ChartIncreaseIcon} className="h-5 w-5 text-foreground" /></div><div><p className="text-sm font-medium text-muted-foreground">Grand Total</p><p className="text-2xl font-bold">{mounted ? fmt(stats.totalGrand) : '-'}</p></div></div></Card>
        </div>
        <div className="relative w-80">
          <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search invoices..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 bg-white text-sm" style={{ fontSize: '14px' }} />
        </div>
        <TanStackDataTable data={filtered} columns={columns} loading={loading} showColumnToggle={false} />
      </div>
    </TwoLevelLayout>
  )
}

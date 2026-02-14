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
import { Search01Icon, MoreHorizontalIcon, PlusSignIcon, StarIcon, CheckmarkCircle01Icon, Dollar01Icon, Calendar01Icon } from '@hugeicons/core-free-icons'
import { promotionService, type Promotion } from '@/services/sales'
import Link from 'next/link'

export default function PromotionsPage() {
  const [data, setData] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { promotionService.getAll().then(setData).finally(() => setLoading(false)) }, [])

  const filtered = useMemo(() => {
    if (!searchTerm) return data
    const q = searchTerm.toLowerCase()
    return data.filter(item =>
      item.name?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    )
  }, [data, searchTerm])

  const stats = useMemo(() => {
    const now = new Date()
    const active = data.filter(i => new Date(i.start_date) <= now && new Date(i.end_date) >= now)
    const avgDiscount = data.length > 0 ? data.reduce((s, i) => s + (i.discount_rate || 0), 0) / data.length : 0
    return {
      total: data.length,
      active: active.length,
      avgDiscount: (avgDiscount * 100).toFixed(1),
      totalMinPurchase: data.reduce((s, i) => s + (i.min_purchase || 0), 0),
    }
  }, [data])

  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`
  const fmtDate = (d: string) => mounted && d ? new Date(d).toLocaleDateString('id-ID') : '-'

  const columns: TanStackColumn<Promotion>[] = [
    { id: 'name', header: 'Name', accessorKey: 'name', cell: ({ row }) => <Link href={`/sales/promotions/${row.original.id}`} className="font-medium text-blue-600 hover:underline">{row.original.name}</Link> },
    { id: 'description', header: 'Description', accessorKey: 'description', cell: ({ row }) => <span className="truncate max-w-[200px] block">{row.original.description || '-'}</span> },
    { id: 'start_date', header: 'Start Date', accessorKey: 'start_date', cell: ({ row }) => <span>{fmtDate(row.original.start_date)}</span> },
    { id: 'end_date', header: 'End Date', accessorKey: 'end_date', cell: ({ row }) => <span>{fmtDate(row.original.end_date)}</span> },
    { id: 'discount_rate', header: 'Discount', accessorKey: 'discount_rate', cell: ({ row }) => <span>{(row.original.discount_rate * 100).toFixed(1)}%</span> },
    { id: 'min_purchase', header: 'Min Purchase', accessorKey: 'min_purchase', cell: ({ row }) => <span>{fmt(row.original.min_purchase)}</span> },
    { id: 'actions', header: '', enableSorting: false, cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="h-8 w-8 p-0"><HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild><Link href={`/sales/promotions/${row.original.id}`}>View Details</Link></DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.id)}>Copy ID</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(row.original.id)}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )},
  ]

  const handleDelete = async (id: string) => { try { await promotionService.delete(id); setData(prev => prev.filter(i => i.id !== id)) } catch (err) { console.error('Delete failed:', err) } }

  return (
    <TwoLevelLayout>
      <Header title="Promotions" breadcrumbs={[{ label: 'Sales', href: '/sales' }, { label: 'Promotions' }]} actions={<Button><HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />New Promotion</Button>} />
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4"><div className="flex items-center space-x-3"><div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center"><HugeiconsIcon icon={StarIcon} className="h-5 w-5 text-foreground" /></div><div><p className="text-sm font-medium text-muted-foreground">Total Promotions</p><p className="text-2xl font-bold">{stats.total}</p></div></div></Card>
          <Card className="p-4"><div className="flex items-center space-x-3"><div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center"><HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-foreground" /></div><div><p className="text-sm font-medium text-muted-foreground">Active Now</p><p className="text-2xl font-bold">{stats.active}</p></div></div></Card>
          <Card className="p-4"><div className="flex items-center space-x-3"><div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center"><HugeiconsIcon icon={Calendar01Icon} className="h-5 w-5 text-foreground" /></div><div><p className="text-sm font-medium text-muted-foreground">Avg Discount</p><p className="text-2xl font-bold">{stats.avgDiscount}%</p></div></div></Card>
          <Card className="p-4"><div className="flex items-center space-x-3"><div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center"><HugeiconsIcon icon={Dollar01Icon} className="h-5 w-5 text-foreground" /></div><div><p className="text-sm font-medium text-muted-foreground">Total Min Purchase</p><p className="text-2xl font-bold">{mounted ? fmt(stats.totalMinPurchase) : '-'}</p></div></div></Card>
        </div>
        <div className="relative w-80">
          <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search promotions..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 bg-white text-sm" style={{ fontSize: '14px' }} />
        </div>
        <TanStackDataTable data={filtered} columns={columns} loading={loading} showColumnToggle={false} />
      </div>
    </TwoLevelLayout>
  )
}

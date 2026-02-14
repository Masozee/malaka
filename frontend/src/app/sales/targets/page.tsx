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
import { Search01Icon, MoreHorizontalIcon, PlusSignIcon, UserGroupIcon, Dollar01Icon, CheckmarkCircle01Icon, ChartIncreaseIcon } from '@hugeicons/core-free-icons'
import { salesTargetService, type SalesTarget } from '@/services/sales'
import Link from 'next/link'

export default function TargetsPage() {
  const [data, setData] = useState<SalesTarget[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { salesTargetService.getAll().then(setData).finally(() => setLoading(false)) }, [])

  const filtered = useMemo(() => {
    if (!searchTerm) return data
    const q = searchTerm.toLowerCase()
    return data.filter(item =>
      item.user_id?.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    )
  }, [data, searchTerm])

  const stats = useMemo(() => {
    const totalTarget = data.reduce((s, i) => s + (i.target_amount || 0), 0)
    const totalAchieved = data.reduce((s, i) => s + (i.achieved_amount || 0), 0)
    const avgProgress = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0
    return {
      total: data.length,
      totalTarget,
      totalAchieved,
      avgProgress,
    }
  }, [data])

  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`
  const fmtDate = (d: string) => mounted && d ? new Date(d).toLocaleDateString('id-ID') : '-'

  const columns: TanStackColumn<SalesTarget>[] = [
    { id: 'id', header: 'Target ID', accessorKey: 'id', cell: ({ row }) => <Link href={`/sales/targets/${row.original.id}`} className="font-medium text-blue-600 hover:underline">{row.original.id.slice(0, 8)}...</Link> },
    { id: 'user_id', header: 'User', accessorKey: 'user_id', cell: ({ row }) => <span>{row.original.user_id.slice(0, 8)}...</span> },
    { id: 'period_start', header: 'Period Start', accessorKey: 'period_start', cell: ({ row }) => <span>{fmtDate(row.original.period_start)}</span> },
    { id: 'period_end', header: 'Period End', accessorKey: 'period_end', cell: ({ row }) => <span>{fmtDate(row.original.period_end)}</span> },
    { id: 'target_amount', header: 'Target', accessorKey: 'target_amount', cell: ({ row }) => <span className="font-medium">{fmt(row.original.target_amount)}</span> },
    { id: 'achieved_amount', header: 'Achieved', accessorKey: 'achieved_amount', cell: ({ row }) => <span>{fmt(row.original.achieved_amount)}</span> },
    { id: 'progress', header: 'Progress', cell: ({ row }) => {
      const pct = row.original.target_amount > 0 ? Math.round((row.original.achieved_amount / row.original.target_amount) * 100) : 0
      const color = pct >= 100 ? 'bg-green-100 text-green-800' : pct >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
      return <Badge className={`${color} border-0`}>{pct}%</Badge>
    }},
    { id: 'actions', header: '', enableSorting: false, cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="h-8 w-8 p-0"><HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild><Link href={`/sales/targets/${row.original.id}`}>View Details</Link></DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.id)}>Copy ID</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(row.original.id)}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )},
  ]

  const handleDelete = async (id: string) => { try { await salesTargetService.delete(id); setData(prev => prev.filter(i => i.id !== id)) } catch (err) { console.error('Delete failed:', err) } }

  return (
    <TwoLevelLayout>
      <Header title="Sales Targets" breadcrumbs={[{ label: 'Sales', href: '/sales' }, { label: 'Targets' }]} actions={<Button><HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />New Target</Button>} />
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4"><div className="flex items-center space-x-3"><div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center"><HugeiconsIcon icon={UserGroupIcon} className="h-5 w-5 text-foreground" /></div><div><p className="text-sm font-medium text-muted-foreground">Total Targets</p><p className="text-2xl font-bold">{stats.total}</p></div></div></Card>
          <Card className="p-4"><div className="flex items-center space-x-3"><div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center"><HugeiconsIcon icon={Dollar01Icon} className="h-5 w-5 text-foreground" /></div><div><p className="text-sm font-medium text-muted-foreground">Total Target</p><p className="text-2xl font-bold">{mounted ? fmt(stats.totalTarget) : '-'}</p></div></div></Card>
          <Card className="p-4"><div className="flex items-center space-x-3"><div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center"><HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-foreground" /></div><div><p className="text-sm font-medium text-muted-foreground">Total Achieved</p><p className="text-2xl font-bold">{mounted ? fmt(stats.totalAchieved) : '-'}</p></div></div></Card>
          <Card className="p-4"><div className="flex items-center space-x-3"><div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center"><HugeiconsIcon icon={ChartIncreaseIcon} className="h-5 w-5 text-foreground" /></div><div><p className="text-sm font-medium text-muted-foreground">Avg Progress</p><p className="text-2xl font-bold">{stats.avgProgress}%</p></div></div></Card>
        </div>
        <div className="relative w-80">
          <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search targets..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 bg-white text-sm" style={{ fontSize: '14px' }} />
        </div>
        <TanStackDataTable data={filtered} columns={columns} loading={loading} showColumnToggle={false} />
      </div>
    </TwoLevelLayout>
  )
}

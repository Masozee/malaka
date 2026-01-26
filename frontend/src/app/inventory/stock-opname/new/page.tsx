'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, Calendar01Icon } from '@hugeicons/core-free-icons'
import { stockOpnameService } from '@/services/inventory'

export default function NewStockOpnamePage() {
    const router = useRouter()
    const { addToast } = useToast()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        warehouseId: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        type: 'full' // full or partial
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.warehouseId) {
            addToast({ type: 'error', title: 'Please select a warehouse' })
            return
        }

        try {
            setLoading(true)
            // In a real app, this would create the session
            // const response = await stockOpnameService.create(formData)

            // Simulating API call since backend might not support creation yet
            await new Promise(resolve => setTimeout(resolve, 1000))

            addToast({ type: 'success', title: 'Stock opname session created' })
            router.push('/inventory/stock-opname')
        } catch (error) {
            console.error('Failed to create stock opname:', error)
            addToast({ type: 'error', title: 'Failed to create session' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <TwoLevelLayout>
            <Header
                title="New Stock Opname Session"
                breadcrumbs={[
                    { label: 'Inventory', href: '/inventory' },
                    { label: 'Stock Opname', href: '/inventory/stock-opname' },
                    { label: 'New Session' }
                ]}
            />

            <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
                <Card>
                    <CardHeader>
                        <CardTitle>Session Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="warehouse">Warehouse</Label>
                                <Select
                                    value={formData.warehouseId}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, warehouseId: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select warehouse" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="WH-001">Main Warehouse Jakarta</SelectItem>
                                        <SelectItem value="WH-002">Regional Warehouse Surabaya</SelectItem>
                                        <SelectItem value="ST-001">Store Plaza Indonesia</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date">Scheduled Date</Label>
                                <div className="relative">
                                    <HugeiconsIcon icon={Calendar01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="date"
                                        id="date"
                                        className="pl-9"
                                        value={formData.date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Count Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, type: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="full">Full Count (All Items)</SelectItem>
                                        <SelectItem value="partial">Partial Count (Specific Categories)</SelectItem>
                                        <SelectItem value="blind">Blind Count</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Optional notes about this session..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                />
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <Link href="/inventory/stock-opname" className="flex-1">
                                    <Button variant="outline" className="w-full" type="button">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button className="flex-1" type="submit" disabled={loading}>
                                    {loading ? 'Creating...' : 'Start Session'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </TwoLevelLayout>
    )
}

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    PencilEdit01Icon,
    Delete01Icon,
    PrinterIcon,
    Clock01Icon,
    CheckmarkCircle01Icon,
    AlertCircleIcon,
    Loading03Icon,
    PauseIcon,
} from '@hugeicons/core-free-icons'
import { barcodeService, BarcodePrintJob } from '@/services/inventory'
import { useToast } from '@/components/ui/toast'

const statusConfig: Record<string, { label: string, color: string, icon: any }> = {
    queued: { label: 'Queued', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', icon: Clock01Icon },
    printing: { label: 'Printing', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200', icon: Loading03Icon },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200', icon: CheckmarkCircle01Icon },
    failed: { label: 'Failed', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200', icon: AlertCircleIcon },
    paused: { label: 'Paused', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200', icon: PauseIcon },
}

const barcodeTypeLabels: Record<string, string> = {
    ean13: 'EAN-13',
    code128: 'Code 128',
    qr: 'QR Code',
    datamatrix: 'Data Matrix',
    code39: 'Code 39',
}

const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
}

export default function BarcodePrintJobDetailPage() {
    const router = useRouter()
    const params = useParams()
    const { addToast } = useToast()
    const [mounted, setMounted] = useState(false)
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<BarcodePrintJob | null>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (params.id) fetchDetail()
    }, [params.id])

    const fetchDetail = async () => {
        try {
            setLoading(true)
            const result = await barcodeService.getById(params.id as string)
            setData(result)
        } catch (error) {
            console.error('Failed to fetch print job:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!data) return
        if (!confirm('Are you sure you want to delete this print job?')) return
        try {
            await barcodeService.delete(data.id)
            addToast({ type: 'success', title: 'Print job deleted' })
            router.push('/inventory/barcode-print')
        } catch (err) {
            addToast({ type: 'error', title: 'Failed to delete print job' })
        }
    }

    if (loading) {
        return (
            <TwoLevelLayout>
                <Header title="Print Job" breadcrumbs={[
                    { label: 'Inventory', href: '/inventory' },
                    { label: 'Barcode Print', href: '/inventory/barcode-print' },
                ]} />
                <div className="flex justify-center items-center h-64">
                    <div className="text-muted-foreground">Loading...</div>
                </div>
            </TwoLevelLayout>
        )
    }

    if (!data) {
        return (
            <TwoLevelLayout>
                <Header title="Job Not Found" breadcrumbs={[
                    { label: 'Inventory', href: '/inventory' },
                    { label: 'Barcode Print', href: '/inventory/barcode-print' },
                ]} />
                <div className="flex flex-col justify-center items-center h-64 p-6">
                    <p className="text-muted-foreground">Print job not found</p>
                    <Button variant="outline" className="mt-4" onClick={() => router.push('/inventory/barcode-print')}>
                        Back to List
                    </Button>
                </div>
            </TwoLevelLayout>
        )
    }

    const status = statusConfig[data.status] || statusConfig.queued
    const progressPercent = data.totalLabels > 0 ? Math.round((data.printedLabels / data.totalLabels) * 100) : 0

    return (
        <TwoLevelLayout>
            <Header
                title={data.jobNumber}
                description={data.jobName}
                breadcrumbs={[
                    { label: 'Inventory', href: '/inventory' },
                    { label: 'Barcode Print', href: '/inventory/barcode-print' },
                    { label: data.jobNumber }
                ]}
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleDelete}>
                            <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                        {data.status !== 'completed' && (
                            <Link href={`/inventory/barcode-print/${data.id}/edit`}>
                                <Button size="sm">
                                    <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </Link>
                        )}
                    </div>
                }
            />

            <div className="flex-1 overflow-auto p-6 space-y-6">
                {/* Status & Progress Card */}
                <Card>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                                <Badge className={`${status.color} mt-1 border-0 flex items-center gap-1 w-fit`}>
                                    <HugeiconsIcon icon={status.icon} className="h-3 w-3" />
                                    {status.label}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Barcode Type</p>
                                <p className="text-sm font-medium mt-1">{barcodeTypeLabels[data.barcodeType] || data.barcodeType}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Priority</p>
                                <Badge className={`${priorityColors[data.priority] || priorityColors.normal} mt-1 border-0 capitalize`}>
                                    {data.priority}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Labels</p>
                                <p className="text-2xl font-bold">{data.totalLabels}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Progress</p>
                                <p className="text-2xl font-bold">{progressPercent}%</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        {data.totalLabels > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                    <span>Printed: {data.printedLabels}</span>
                                    {data.failedLabels > 0 && <span className="text-red-600">Failed: {data.failedLabels}</span>}
                                    <span>Total: {data.totalLabels}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                    <div
                                        className="bg-blue-600 h-2.5 rounded-full transition-all"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Details Card */}
                <Card>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Printer</p>
                                    <p className="text-sm font-medium mt-1 flex items-center gap-1.5">
                                        <HugeiconsIcon icon={PrinterIcon} className="h-4 w-4 text-muted-foreground" />
                                        {data.printerName || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Requested By</p>
                                    <p className="text-sm mt-1">{data.requestedBy || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Template</p>
                                    <p className="text-sm mt-1">{data.template || '-'}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Paper Size</p>
                                    <p className="text-sm mt-1">{data.paperSize || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Label Dimensions</p>
                                    <p className="text-sm mt-1">{data.labelDimensions || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Created</p>
                                    <p className="text-sm mt-1">
                                        {mounted && data.createdDate ? new Date(data.createdDate).toLocaleString('id-ID') : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {data.notes && (
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Notes</p>
                                <p className="text-sm mt-1">{data.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </TwoLevelLayout>
    )
}

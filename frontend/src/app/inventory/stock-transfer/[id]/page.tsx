'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowLeft01Icon,
  AlertCircleIcon,
  Cancel01Icon,
  Tick01Icon,
  PrinterIcon,
  Download01Icon,
} from '@hugeicons/core-free-icons'
import { StockTransferDetail, stockTransferService } from '@/services/inventory'

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200' },
  approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' },
  in_transit: { label: 'In Transit', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' },
}

const workflowSteps = [
  { key: 'draft', label: 'Created' },
  { key: 'approved', label: 'Approved' },
  { key: 'in_transit', label: 'Shipped' },
  { key: 'completed', label: 'Received' },
]

function getStepIndex(status: string): number {
  if (status === 'cancelled') return -1
  const idx = workflowSteps.findIndex(s => s.key === status)
  return idx >= 0 ? idx : 0
}

export default function StockTransferDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [transfer, setTransfer] = useState<StockTransferDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Cancel dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  // Receive dialog
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false)
  const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>({})

  const transferId = params.id as string

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (transferId) {
      fetchDetail()
    }
  }, [transferId])

  const fetchDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await stockTransferService.getById(transferId) as StockTransferDetail
      setTransfer(data)
    } catch (err) {
      console.error('Error fetching transfer detail:', err)
      setError('Failed to load transfer details')
      setTransfer(null)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/inventory/stock-transfer')
  }

  const handleApprove = async () => {
    try {
      setActionLoading(true)
      await stockTransferService.approve(transferId)
      addToast({ type: 'success', title: 'Transfer approved successfully' })
      await fetchDetail()
    } catch (err) {
      console.error('Error approving transfer:', err)
      addToast({ type: 'error', title: 'Failed to approve transfer' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleShip = async () => {
    try {
      setActionLoading(true)
      await stockTransferService.ship(transferId)
      addToast({ type: 'success', title: 'Transfer shipped successfully. Stock deducted from origin warehouse.' })
      await fetchDetail()
    } catch (err) {
      console.error('Error shipping transfer:', err)
      addToast({ type: 'error', title: 'Failed to ship transfer' })
    } finally {
      setActionLoading(false)
    }
  }

  const openReceiveDialog = () => {
    if (transfer?.items) {
      const initial: Record<string, number> = {}
      transfer.items.forEach(item => {
        initial[item.id] = item.quantity
      })
      setReceivedQuantities(initial)
    }
    setReceiveDialogOpen(true)
  }

  const handleReceive = async () => {
    if (!transfer?.items) return
    try {
      setActionLoading(true)
      const items = transfer.items.map(item => ({
        item_id: item.id,
        received_quantity: receivedQuantities[item.id] ?? 0,
      }))
      await stockTransferService.receive(transferId, items)
      addToast({ type: 'success', title: 'Goods received successfully. Stock added to destination warehouse.' })
      setReceiveDialogOpen(false)
      await fetchDetail()
    } catch (err) {
      console.error('Error receiving transfer:', err)
      addToast({ type: 'error', title: 'Failed to receive goods' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    try {
      setActionLoading(true)
      await stockTransferService.cancel(transferId, cancelReason)
      addToast({ type: 'success', title: 'Transfer cancelled' })
      setCancelDialogOpen(false)
      setCancelReason('')
      await fetchDetail()
    } catch (err) {
      console.error('Error cancelling transfer:', err)
      addToast({ type: 'error', title: 'Failed to cancel transfer' })
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!mounted || !dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDateLong = (dateStr?: string) => {
    if (!mounted || !dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <TwoLevelLayout>
        <Header
          title="Transfer Details"
          description="Loading transfer information..."
          breadcrumbs={[
            { label: 'Inventory', href: '/inventory' },
            { label: 'Stock Transfer', href: '/inventory/stock-transfer' },
            { label: 'Details' },
          ]}
        />
        <div className="flex-1 p-6 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </TwoLevelLayout>
    )
  }

  if (error || !transfer) {
    return (
      <TwoLevelLayout>
        <Header
          title="Transfer Details"
          description="Error loading transfer information"
          breadcrumbs={[
            { label: 'Inventory', href: '/inventory' },
            { label: 'Stock Transfer', href: '/inventory/stock-transfer' },
            { label: 'Details' },
          ]}
        />
        <div className="flex-1 p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <HugeiconsIcon icon={AlertCircleIcon} className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {error || 'Transfer Order Not Found'}
              </h3>
              <p className="text-muted-foreground mb-6">
                The transfer order you are looking for could not be found or loaded.
              </p>
              <Button onClick={handleBack} variant="outline">
                <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4 mr-2" />
                Back to Stock Transfer
              </Button>
            </CardContent>
          </Card>
        </div>
      </TwoLevelLayout>
    )
  }

  const statusBadge = statusConfig[transfer.status] || statusConfig.draft
  const currentStep = getStepIndex(transfer.status)
  const isCancelled = transfer.status === 'cancelled'
  const isTerminal = transfer.status === 'completed' || transfer.status === 'cancelled'

  return (
    <TwoLevelLayout>
      <Header
        title={transfer.transferNumber}
        breadcrumbs={[
          { label: 'Inventory', href: '/inventory' },
          { label: 'Stock Transfer', href: '/inventory/stock-transfer' },
          { label: transfer.transferNumber },
        ]}
        compact
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Back link */}
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4" />
          Back to Stock Transfer
        </button>

        {/* Page title + actions */}
        <div className="flex items-start justify-between -mt-2">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{transfer.transferNumber}</h1>
              <Badge className={`${statusBadge.color} border-0`}>{statusBadge.label}</Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Stock transfer details and item tracking</p>
          </div>
          <div className="inline-flex items-center rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 w-28 py-1.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
            >
              <HugeiconsIcon icon={PrinterIcon} className="w-4 h-4" />
              Print
            </button>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
            <button
              className="inline-flex items-center justify-center gap-2 w-28 py-1.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
            >
              <HugeiconsIcon icon={Download01Icon} className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Transfer Info + Summary + Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transfer Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Transfer Information</CardTitle>
              <CardDescription>Order details, dates, and warehouse route</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Transfer Number</label>
                  <p className="mt-1 font-mono text-sm font-semibold">{transfer.transferNumber}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Order Date</label>
                  <p className="mt-1 text-sm">{formatDateLong(transfer.orderDate)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</label>
                  <p className="mt-1 text-sm">{formatDate(transfer.createdAt)}</p>
                </div>

                {transfer.notes && (
                  <div className="col-span-1 md:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</label>
                    <p className="mt-1 text-sm">{transfer.notes}</p>
                  </div>
                )}

                {isCancelled && transfer.cancelReason && (
                  <div className="col-span-1 md:col-span-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <label className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wider">Cancel Reason</label>
                    <p className="mt-1 text-sm text-red-800 dark:text-red-200">{transfer.cancelReason}</p>
                  </div>
                )}

                {/* Warehouse Route */}
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/50 rounded-lg border border-dashed">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Origin</span>
                    <p className="mt-1 text-sm font-medium">{transfer.fromWarehouse}</p>
                    <p className="text-xs text-muted-foreground">{transfer.fromCode}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Destination</span>
                    <p className="mt-1 text-sm font-medium">{transfer.toWarehouse}</p>
                    <p className="text-xs text-muted-foreground">{transfer.toCode}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar: Summary + Actions + Timeline */}
          <div className="space-y-6">
            {/* Workflow Actions */}
            {!isTerminal && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(transfer.status === 'draft' || transfer.status === 'pending') && (
                    <Button className="w-full" onClick={handleApprove} disabled={actionLoading}>
                      Approve
                    </Button>
                  )}
                  {transfer.status === 'approved' && (
                    <Button className="w-full" onClick={handleShip} disabled={actionLoading}>
                      Ship Transfer
                    </Button>
                  )}
                  {transfer.status === 'in_transit' && (
                    <Button className="w-full" onClick={openReceiveDialog} disabled={actionLoading}>
                      Receive Goods
                    </Button>
                  )}
                  {transfer.status === 'draft' && (
                    <Link href={`/inventory/stock-transfer/${transfer.id}/edit`} className="block">
                      <Button variant="outline" className="w-full">
                        Edit
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setCancelDialogOpen(true)}
                    disabled={actionLoading}
                  >
                    Cancel Transfer
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
                <CardDescription>Items and quantity overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                  <span className="text-sm font-medium text-muted-foreground">Total Items</span>
                  <span className="text-xl font-bold">{transfer.totalItems}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                  <span className="text-sm font-medium text-muted-foreground">Total Quantity</span>
                  <span className="text-xl font-bold">{transfer.totalQuantity}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                  <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatDate(transfer.updatedAt)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Workflow Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timeline</CardTitle>
                <CardDescription>Workflow progress and history</CardDescription>
              </CardHeader>
              <CardContent>
                {isCancelled ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <HugeiconsIcon icon={Cancel01Icon} className="w-3 h-3 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-600">Cancelled</p>
                        <p className="text-xs text-muted-foreground">{formatDate(transfer.cancelledDate)}</p>
                        {transfer.cancelledByName && (
                          <p className="text-xs text-muted-foreground">by {transfer.cancelledByName}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    {workflowSteps.map((step, idx) => {
                      const isCompleted = idx <= currentStep
                      const isCurrent = idx === currentStep
                      const isLast = idx === workflowSteps.length - 1
                      const nextCompleted = idx < currentStep
                      const dateMap: Record<string, string | undefined> = {
                        draft: transfer.createdAt,
                        approved: transfer.approvedDate,
                        in_transit: transfer.shippedDate,
                        completed: transfer.receivedDate,
                      }
                      const nameMap: Record<string, string | undefined> = {
                        draft: transfer.createdByName,
                        approved: transfer.approvedByName,
                        in_transit: transfer.shippedByName,
                        completed: transfer.receivedByName,
                      }
                      const date = dateMap[step.key]
                      const byName = nameMap[step.key]

                      return (
                        <div key={step.key} className="flex items-start gap-3 relative">
                          {/* Vertical connector line */}
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                              isCompleted
                                ? 'bg-green-100 dark:bg-green-900/40'
                                : 'bg-gray-100 dark:bg-gray-800'
                            }`}>
                              {isCompleted ? (
                                <HugeiconsIcon icon={Tick01Icon} className="w-3 h-3 text-green-600" />
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                              )}
                            </div>
                            {!isLast && (
                              <div className={`w-px h-8 ${
                                nextCompleted
                                  ? 'bg-green-300 dark:bg-green-700'
                                  : 'bg-gray-200 dark:bg-gray-700'
                              }`} />
                            )}
                          </div>
                          <div className="flex-1 pb-8 last:pb-0">
                            <p className={`text-sm font-medium ${
                              isCurrent ? 'text-foreground' : isCompleted ? 'text-muted-foreground' : 'text-muted-foreground/50'
                            }`}>
                              {step.label}
                            </p>
                            {isCompleted && date && (
                              <p className="text-xs text-muted-foreground">{formatDate(date)}</p>
                            )}
                            {isCompleted && byName && (
                              <p className="text-xs text-muted-foreground">by {byName}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Transfer Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transfer Items ({transfer.items?.length || 0})</CardTitle>
            <CardDescription>Articles included in this transfer order</CardDescription>
          </CardHeader>
          <CardContent>
            {transfer.items && transfer.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-[14px]">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-[15px] font-semibold text-muted-foreground">Article Code</th>
                      <th className="text-left py-3 px-4 text-[15px] font-semibold text-muted-foreground">Article Name</th>
                      <th className="text-right py-3 px-4 text-[15px] font-semibold text-muted-foreground">Shipped Qty</th>
                      {transfer.status === 'completed' && (
                        <>
                          <th className="text-right py-3 px-4 text-[15px] font-semibold text-muted-foreground">Received Qty</th>
                          <th className="text-center py-3 px-4 text-[15px] font-semibold text-muted-foreground">Status</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {transfer.items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-4 font-mono text-[13px]">{item.articleCode || '-'}</td>
                        <td className="py-3 px-4">{item.articleName || '-'}</td>
                        <td className="py-3 px-4 text-right font-semibold">{item.quantity}</td>
                        {transfer.status === 'completed' && (
                          <>
                            <td className={`py-3 px-4 text-right font-semibold ${
                              item.hasDiscrepancy ? 'text-amber-600 dark:text-amber-400' : ''
                            }`}>
                              {item.receivedQuantity}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {item.hasDiscrepancy ? (
                                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 border-0">
                                  Short ({item.quantity - item.receivedQuantity})
                                </Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 border-0">
                                  OK
                                </Badge>
                              )}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                      <td colSpan={2} className="py-3 px-4 font-semibold">Total</td>
                      <td className="py-3 px-4 text-right font-bold">{transfer.totalQuantity}</td>
                      {transfer.status === 'completed' && (
                        <>
                          <td className="py-3 px-4 text-right font-bold">
                            {transfer.items.reduce((sum, item) => sum + item.receivedQuantity, 0)}
                          </td>
                          <td />
                        </>
                      )}
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No items found for this transfer order.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Receive Dialog */}
      <Dialog open={receiveDialogOpen} onOpenChange={setReceiveDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Receive Goods</DialogTitle>
            <DialogDescription>
              Enter the actual received quantity for each item. Items with less than shipped quantity will be flagged as discrepancy.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {transfer?.items?.map((item) => {
              const received = receivedQuantities[item.id] ?? 0
              const isShort = received < item.quantity
              return (
                <div key={item.id} className={`p-4 rounded-lg border ${
                  isShort ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' : 'bg-muted/50'
                }`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.articleName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{item.articleCode}</p>
                      <p className="text-xs text-muted-foreground mt-1">Shipped: {item.quantity}</p>
                    </div>
                    <div className="w-32">
                      <Label className="text-xs text-muted-foreground">Received Qty</Label>
                      <Input
                        type="number"
                        min={0}
                        max={item.quantity}
                        value={received}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0
                          setReceivedQuantities(prev => ({ ...prev, [item.id]: val }))
                        }}
                        className={isShort ? 'border-amber-400' : ''}
                      />
                    </div>
                  </div>
                  {isShort && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                      Discrepancy: {item.quantity - received} unit(s) short
                    </p>
                  )}
                </div>
              )
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiveDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleReceive} disabled={actionLoading}>
              {actionLoading ? 'Processing...' : 'Confirm Receipt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Transfer</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this transfer?
              {transfer?.status === 'in_transit' && ' Stock that was deducted from the origin warehouse will be reversed.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Reason for cancellation</Label>
            <Textarea
              placeholder="Enter the reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCancelDialogOpen(false); setCancelReason('') }} disabled={actionLoading}>
              Keep Transfer
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={actionLoading}>
              {actionLoading ? 'Cancelling...' : 'Cancel Transfer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TwoLevelLayout>
  )
}

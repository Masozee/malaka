'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { purchaseOrderService } from '@/services/procurement'
import { useToast } from '@/components/ui/toast'
import type { PurchaseOrder } from '@/types/procurement'
// PDF functions are loaded dynamically to reduce bundle size
import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  PencilEdit01Icon,
  PrinterIcon,
  Download01Icon,
  DeleteIcon,
  SentIcon,
  CheckmarkCircle01Icon,
  LoadingIcon,
  CancelIcon,
  ShoppingCartIcon,
  Calendar01Icon,
  Dollar01Icon,
  DeliveryTruckIcon,
} from '@hugeicons/core-free-icons'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  confirmed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  received: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

const paymentStatusColors: Record<string, string> = {
  unpaid: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
}

export default function PurchaseOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToast } = useToast()
  const [order, setOrder] = useState<PurchaseOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    loadOrder()
  }, [params.id])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const data = await purchaseOrderService.getById(params.id as string)
      setOrder(data)
    } catch (error) {
      console.error('Error loading purchase order:', error)
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!order) return
    if (!window.confirm('Are you sure you want to delete this purchase order? This action cannot be undone.')) {
      return
    }

    setActionLoading('delete')
    try {
      await purchaseOrderService.delete(order.id)
      addToast({ type: 'success', title: 'Purchase order deleted successfully' })
      router.push('/procurement/purchase-orders')
    } catch (error) {
      console.error('Error deleting purchase order:', error)
      addToast({ type: 'error', title: 'Failed to delete purchase order' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleSend = async () => {
    if (!order) return
    setActionLoading('send')
    try {
      await purchaseOrderService.send(order.id)
      addToast({ type: 'success', title: 'Purchase order sent to supplier' })
      loadOrder()
    } catch (error) {
      console.error('Error sending order:', error)
      addToast({ type: 'error', title: 'Failed to send order' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleConfirm = async () => {
    if (!order) return
    setActionLoading('confirm')
    try {
      await purchaseOrderService.confirm(order.id)
      addToast({ type: 'success', title: 'Purchase order confirmed' })
      loadOrder()
    } catch (error) {
      console.error('Error confirming order:', error)
      addToast({ type: 'error', title: 'Failed to confirm order' })
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <TwoLevelLayout>
        <Header
          title="Loading..."
          breadcrumbs={[
            { label: 'Procurement', href: '/procurement' },
            { label: 'Purchase Orders', href: '/procurement/purchase-orders' },
            { label: 'Loading...' },
          ]}
        />
        <div className="flex-1 p-6 flex items-center justify-center">
          <HugeiconsIcon icon={LoadingIcon} className="h-8 w-8 animate-spin" />
        </div>
      </TwoLevelLayout>
    )
  }

  if (!order) {
    return (
      <TwoLevelLayout>
        <Header
          title="Order Not Found"
          breadcrumbs={[
            { label: 'Procurement', href: '/procurement' },
            { label: 'Purchase Orders', href: '/procurement/purchase-orders' },
            { label: 'Not Found' },
          ]}
        />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <HugeiconsIcon icon={CancelIcon} className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Purchase order not found</h3>
            <p className="text-muted-foreground mb-4">
              The purchase order you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link href="/procurement/purchase-orders">
              <Button variant="outline">Back to Purchase Orders</Button>
            </Link>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  const breadcrumbs = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'Purchase Orders', href: '/procurement/purchase-orders' },
    { label: order.po_number },
  ]

  return (
    <TwoLevelLayout>
      <Header
        title={order.po_number}
        description={order.supplier_name || 'No supplier'}
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            {order.status === 'draft' && (
              <>
                <Button
                  variant="outline"
                  onClick={handleSend}
                  disabled={actionLoading === 'send'}
                >
                  <HugeiconsIcon icon={SentIcon} className="h-4 w-4 mr-2" />
                  {actionLoading === 'send' ? 'Sending...' : 'Send to Supplier'}
                </Button>
                <Link href={`/procurement/purchase-orders/${order.id}/edit`}>
                  <Button>
                    <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 mr-2" />
                    Edit Order
                  </Button>
                </Link>
              </>
            )}
            {order.status === 'sent' && (
              <Button onClick={handleConfirm} disabled={actionLoading === 'confirm'}>
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4 mr-2" />
                {actionLoading === 'confirm' ? 'Confirming...' : 'Mark as Confirmed'}
              </Button>
            )}
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={ShoppingCartIcon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Order Status</p>
                <Badge className={statusColors[order.status]}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={Dollar01Icon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                <Badge className={paymentStatusColors[order.payment_status]}>
                  {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={Dollar01Icon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-lg font-bold">
                  {mounted ? `Rp ${order.total_amount.toLocaleString('id-ID')}` : ''}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={DeliveryTruckIcon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expected Delivery</p>
                <p className="text-lg font-bold">
                  {mounted && order.expected_delivery_date
                    ? new Date(order.expected_delivery_date).toLocaleDateString('id-ID')
                    : 'N/A'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Order Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">PO Number</p>
                  <p className="font-medium">{order.po_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Supplier</p>
                  <p className="font-medium">{order.supplier_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-medium">
                    {mounted ? new Date(order.order_date).toLocaleDateString('id-ID') : ''}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Terms</p>
                  <p className="font-medium">{order.payment_terms}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Delivery Address</p>
                  <p className="font-medium">{order.delivery_address}</p>
                </div>
              </div>
            </Card>

            {/* Items */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{item.item_name}</h4>
                        {item.description && (
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {mounted ? `Rp ${item.line_total.toLocaleString('id-ID')}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Quantity:</span> {item.quantity} {item.unit}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Unit Price:</span>{' '}
                        {mounted ? `Rp ${item.unit_price.toLocaleString('id-ID')}` : ''}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Discount:</span> {item.discount_percentage}%
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tax:</span> {item.tax_percentage}%
                      </div>
                      {order.status === 'received' && (
                        <div>
                          <span className="text-muted-foreground">Received:</span> {item.received_quantity} {item.unit}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="max-w-md ml-auto space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{mounted ? `Rp ${order.subtotal.toLocaleString('id-ID')}` : ''}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>-{mounted ? `Rp ${order.discount_amount.toLocaleString('id-ID')}` : ''}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax:</span>
                    <span>{mounted ? `Rp ${order.tax_amount.toLocaleString('id-ID')}` : ''}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping:</span>
                    <span>{mounted ? `Rp ${order.shipping_cost.toLocaleString('id-ID')}` : ''}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>{mounted ? `Rp ${order.total_amount.toLocaleString('id-ID')}` : ''}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Notes */}
            {order.notes && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Notes</h3>
                <p className="text-muted-foreground">{order.notes}</p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {order.status === 'draft' && (
                  <Link href={`/procurement/purchase-orders/${order.id}/edit`} className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 mr-2" />
                      Edit Order
                    </Button>
                  </Link>
                )}

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={async () => {
                    setActionLoading('print')
                    try {
                      const { printPurchaseOrderPDF } = await import('@/components/procurement/purchase-order-pdf')
                      await printPurchaseOrderPDF(order)
                      addToast({ type: 'success', title: 'PDF opened for printing' })
                    } catch (error) {
                      console.error('Error printing PDF:', error)
                      addToast({ type: 'error', title: 'Failed to generate PDF' })
                    } finally {
                      setActionLoading(null)
                    }
                  }}
                  disabled={actionLoading === 'print'}
                >
                  <HugeiconsIcon icon={PrinterIcon} className="h-4 w-4 mr-2" />
                  {actionLoading === 'print' ? 'Generating...' : 'Print Order'}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={async () => {
                    setActionLoading('download')
                    try {
                      const { downloadPurchaseOrderPDF } = await import('@/components/procurement/purchase-order-pdf')
                      await downloadPurchaseOrderPDF(order)
                      addToast({ type: 'success', title: 'PDF downloaded successfully' })
                    } catch (error) {
                      console.error('Error downloading PDF:', error)
                      addToast({ type: 'error', title: 'Failed to download PDF' })
                    } finally {
                      setActionLoading(null)
                    }
                  }}
                  disabled={actionLoading === 'download'}
                >
                  <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
                  {actionLoading === 'download' ? 'Downloading...' : 'Export PDF'}
                </Button>

                <Separator className="my-3" />

                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                  onClick={handleDelete}
                  disabled={order.status !== 'draft' || actionLoading === 'delete'}
                >
                  <HugeiconsIcon icon={DeleteIcon} className="h-4 w-4 mr-2" />
                  {actionLoading === 'delete' ? 'Deleting...' : 'Delete Order'}
                </Button>
              </div>
            </Card>

            {/* Timeline */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Order Timeline</h3>
              <div className="space-y-4">
                {order.status === 'received' && (
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Received</p>
                      <p className="text-xs text-muted-foreground">Order completed</p>
                    </div>
                  </div>
                )}
                {['shipped', 'received'].includes(order.status) && (
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-purple-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Shipped</p>
                      <p className="text-xs text-muted-foreground">In transit</p>
                    </div>
                  </div>
                )}
                {['confirmed', 'shipped', 'received'].includes(order.status) && (
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-indigo-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Confirmed</p>
                      <p className="text-xs text-muted-foreground">Supplier confirmed</p>
                    </div>
                  </div>
                )}
                {['sent', 'confirmed', 'shipped', 'received'].includes(order.status) && (
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Sent</p>
                      <p className="text-xs text-muted-foreground">Sent to supplier</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-gray-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-xs text-muted-foreground">
                      {mounted ? new Date(order.created_at).toLocaleDateString('id-ID') : ''}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </TwoLevelLayout>
  )
}

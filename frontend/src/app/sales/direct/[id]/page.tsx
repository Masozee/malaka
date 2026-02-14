'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowLeft01Icon,
  PencilEdit01Icon,
  Calendar01Icon,
  Dollar01Icon,
  UserIcon,
  DeleteIcon,
  Clock01Icon,
  TruckIcon,
  CreditCardIcon,
  StoreIcon,
  PercentCircleIcon,
} from '@hugeicons/core-free-icons'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { posTransactionService, type PosTransactionDetail } from '@/services/sales'
import Link from 'next/link'

const paymentStatusColors: Record<string, string> = {
  paid: 'bg-green-100 text-green-800',
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  partial: 'bg-blue-100 text-blue-800',
  failed: 'bg-red-100 text-red-800',
}

const deliveryStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function DirectSaleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<PosTransactionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    confirmLabel: string
    variant: 'default' | 'destructive'
    onConfirm: () => Promise<void>
  }>({ open: false, title: '', description: '', confirmLabel: 'Confirm', variant: 'default', onConfirm: async () => {} })

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!params.id) return
    setLoading(true)
    posTransactionService.getById(params.id as string)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [params.id])

  const fmt = (n: number) => {
    if (!mounted) return `Rp ${n}`
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
  }

  const fmtDate = (d: string) => {
    if (!mounted || !d) return '-'
    return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const fmtDateTime = (d: string) => {
    if (!mounted || !d) return '-'
    return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const handleDelete = () => {
    if (!data) return
    setConfirmDialog({
      open: true,
      title: 'Delete Transaction',
      description: `Are you sure you want to delete this direct sale transaction? This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
      onConfirm: async () => {
        await posTransactionService.delete(data.id)
        setConfirmDialog(prev => ({ ...prev, open: false }))
        router.push('/sales/direct')
      },
    })
  }

  if (loading) {
    return (
      <TwoLevelLayout>
        <Header
          title="Loading..."
          breadcrumbs={[{ label: 'Sales', href: '/sales' }, { label: 'Direct Sales', href: '/sales/direct' }, { label: 'Loading...' }]}
        />
        <div className="flex-1 p-6 space-y-6">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  if (!data) {
    return (
      <TwoLevelLayout>
        <Header
          title="Transaction Not Found"
          breadcrumbs={[{ label: 'Sales', href: '/sales' }, { label: 'Direct Sales', href: '/sales/direct' }, { label: 'Not Found' }]}
        />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Transaction not found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">The transaction you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
            <Link href="/sales/direct">
              <Button variant="outline">
                <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
                Back to Direct Sales
              </Button>
            </Link>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  const items = data.items || []
  const paymentStatus = data.payment_status || 'completed'
  const shortId = data.id.slice(0, 8)

  return (
    <TwoLevelLayout>
      <Header
        title={`Direct Sale: ${shortId}...`}
        breadcrumbs={[
          { label: 'Sales', href: '/sales' },
          { label: 'Direct Sales', href: '/sales/direct' },
          { label: `${shortId}...` },
        ]}
        actions={
          <div className="flex items-center space-x-2">
            <Link href="/sales/direct">
              <Button variant="outline" size="sm">
                <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={Dollar01Icon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">{mounted ? fmt(data.total_amount) : '-'}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={CreditCardIcon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment</p>
                <p className="text-2xl font-bold">{data.payment_method || '-'}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={StoreIcon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Items</p>
                <p className="text-2xl font-bold">{items.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={Clock01Icon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge className={`${paymentStatusColors[paymentStatus] || 'bg-gray-100 text-gray-800'} border-0 text-base`}>
                  {paymentStatus}
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Transaction Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <HugeiconsIcon icon={Calendar01Icon} className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Transaction Date</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{fmtDate(data.transaction_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <HugeiconsIcon icon={CreditCardIcon} className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Payment Method</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{data.payment_method}</p>
                    </div>
                  </div>

                  {data.visit_type && (
                    <div className="flex items-center space-x-3">
                      <HugeiconsIcon icon={StoreIcon} className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Visit Type</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{data.visit_type}</p>
                      </div>
                    </div>
                  )}

                  {data.location && (
                    <div className="flex items-center space-x-3">
                      <HugeiconsIcon icon={StoreIcon} className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Location</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{data.location}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <HugeiconsIcon icon={Dollar01Icon} className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Amount</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{fmt(data.total_amount)}</p>
                    </div>
                  </div>

                  {(data.subtotal !== undefined && data.subtotal > 0) && (
                    <div className="flex items-center space-x-3">
                      <HugeiconsIcon icon={Dollar01Icon} className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Subtotal</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{fmt(data.subtotal)}</p>
                      </div>
                    </div>
                  )}

                  {(data.tax_amount !== undefined && data.tax_amount > 0) && (
                    <div className="flex items-center space-x-3">
                      <HugeiconsIcon icon={PercentCircleIcon} className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Tax</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{fmt(data.tax_amount)}</p>
                      </div>
                    </div>
                  )}

                  {(data.discount_amount !== undefined && data.discount_amount > 0) && (
                    <div className="flex items-center space-x-3">
                      <HugeiconsIcon icon={PercentCircleIcon} className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Discount</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">-{fmt(data.discount_amount)}</p>
                      </div>
                    </div>
                  )}

                  {data.delivery_status && (
                    <div className="flex items-center space-x-3">
                      <HugeiconsIcon icon={TruckIcon} className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Delivery</p>
                        <Badge className={`${deliveryStatusColors[data.delivery_status] || 'bg-gray-100 text-gray-800'} border-0`}>
                          {data.delivery_status}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Line Items */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Items ({items.length})
              </h3>

              {items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">No.</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Article ID</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Qty</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Unit Price</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {items.map((item, idx) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{idx + 1}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-medium">{item.article_id.slice(0, 8)}...</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 text-right">{fmt(item.unit_price)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 text-right font-medium">{fmt(item.total_price)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-gray-100">Total:</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-gray-100">{fmt(data.total_amount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p className="text-sm">No line items recorded for this transaction.</p>
                </div>
              )}
            </Card>

            {/* Notes */}
            {data.notes && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Notes</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{data.notes}</p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Customer</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <HugeiconsIcon icon={UserIcon} className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Name</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{data.customer_name || 'Walk-in Customer'}</p>
                  </div>
                </div>

                {data.customer_phone && (
                  <div className="flex items-start space-x-3">
                    <div className="h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Phone</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{data.customer_phone}</p>
                    </div>
                  </div>
                )}

                {data.customer_address && (
                  <div className="flex items-start space-x-3">
                    <div className="h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Address</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{data.customer_address}</p>
                    </div>
                  </div>
                )}

                {data.sales_person && (
                  <>
                    <Separator />
                    <div className="flex items-center space-x-3">
                      <HugeiconsIcon icon={UserIcon} className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Sales Person</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{data.sales_person}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Commission */}
            {(data.commission_rate !== undefined && data.commission_rate > 0) && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Commission</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Rate</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{(data.commission_rate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{fmt(data.commission_amount || 0)}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 mr-2" />
                  Edit Transaction
                </Button>
                <Separator />
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                  onClick={handleDelete}
                >
                  <HugeiconsIcon icon={DeleteIcon} className="h-4 w-4 mr-2" />
                  Delete Transaction
                </Button>
              </div>
            </Card>

            {/* Timeline */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Last Updated</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{fmtDateTime(data.updated_at)}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-gray-300 dark:bg-gray-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Created</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{fmtDateTime(data.created_at)}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
      />
    </TwoLevelLayout>
  )
}

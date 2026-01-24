'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { HugeiconsIcon } from "@hugeicons/react"
import { PencilEdit01Icon, SendToMobileIcon, CheckmarkCircle01Icon, AlertCircleIcon, FileIcon, ArrowLeft01Icon, PrinterIcon, Download01Icon } from "@hugeicons/core-free-icons"
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'

import Link from 'next/link'
import { invoiceService } from '@/services/accounting'

// Invoice interfaces
interface InvoiceItem {
  id: string
  product_code: string
  product_name: string
  description: string
  quantity: number
  unit_price: number
  discount_percentage: number
  tax_percentage: number
  line_total: number
}

interface Invoice {
  id: string
  invoice_number: string
  customer_id: string
  customer_name: string
  customer_email?: string
  invoice_date: string
  due_date: string
  payment_date?: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  payment_status: 'unpaid' | 'partial' | 'paid' | 'refunded'
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  paid_amount: number
  balance_due: number
  currency: string
  payment_terms: string
  notes?: string
  items: InvoiceItem[]
  created_by: string
  created_at: string
  updated_at: string
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const invoiceId = params.id as string
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [invoice, setInvoice] = useState<Invoice | null>(null)

  useEffect(() => {
    setMounted(true)
    fetchInvoice()
  }, [invoiceId])

  const fetchInvoice = async () => {
    try {
      setLoading(true)
      const response = await invoiceService.getAll()
      // Find the specific invoice by ID
      const foundInvoice = response.data?.find((inv: Invoice) => inv.id === invoiceId)
      setInvoice(foundInvoice || null)
    } catch (error) {
      console.error('Error fetching invoice:', error)
      setInvoice(null)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount?: number): string => {
    if (!mounted || typeof amount !== 'number' || isNaN(amount)) return ''
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const formatDate = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { variant: 'secondary' as const, label: 'Draft', icon: PencilEdit01Icon },
      sent: { variant: 'default' as const, label: 'Sent', icon: SendToMobileIcon },
      paid: { variant: 'default' as const, label: 'Paid', icon: CheckmarkCircle01Icon },
      overdue: { variant: 'destructive' as const, label: 'Overdue', icon: AlertCircleIcon },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled', icon: AlertCircleIcon }
    }
    return config[status as keyof typeof config] || { variant: 'secondary' as const, label: status, icon: FileIcon }
  }

  const getPaymentStatusBadge = (status: string) => {
    const config = {
      unpaid: { variant: 'destructive' as const, label: 'Unpaid' },
      partial: { variant: 'secondary' as const, label: 'Partial' },
      paid: { variant: 'default' as const, label: 'Paid' },
      refunded: { variant: 'outline' as const, label: 'Refunded' }
    }
    return config[status as keyof typeof config] || { variant: 'secondary' as const, label: status }
  }

  const breadcrumbs = [
    { label: 'Accounting', href: '/accounting' },
    { label: 'Invoices', href: '/accounting/invoices' },
    { label: invoice?.invoice_number || 'Invoice Detail', href: `/accounting/invoices/${invoiceId}` }
  ]

  if (loading) {
    return (
      <TwoLevelLayout>
        <Header 
          title="Loading..."
          description="Loading invoice details"
          breadcrumbs={breadcrumbs}
        />
        <div className="flex-1 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  if (!invoice) {
    return (
      <TwoLevelLayout>
        <Header 
          title="Invoice Not Found"
          description="The requested invoice could not be found"
          breadcrumbs={breadcrumbs}
        />
        <div className="flex-1 p-6">
          <Card className="p-6 text-center">
            <HugeiconsIcon icon={AlertCircleIcon} className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Invoice Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The invoice with ID "{invoiceId}" could not be found.
            </p>
            <Button asChild>
              <Link href="/accounting/invoices">
                <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
                Back to Invoices
              </Link>
            </Button>
          </Card>
        </div>
      </TwoLevelLayout>
    )
  }

  const { variant: statusVariant, label: statusLabel, icon: StatusIcon } = getStatusBadge(invoice.status)
  const { variant: paymentVariant, label: paymentLabel } = getPaymentStatusBadge(invoice.payment_status)

  return (
    <TwoLevelLayout>
      <Header 
        title={invoice.invoice_number}
        description={`Invoice for ${invoice.customer_name}`}
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            {invoice.status === 'draft' && (
              <Button variant="outline" size="sm">
                <HugeiconsIcon icon={SendToMobileIcon} className="h-4 w-4 mr-2" />
                Send Invoice
              </Button>
            )}
            {invoice.status === 'draft' && (
              <Button size="sm" asChild>
                <Link href={`/accounting/invoices/${invoiceId}/edit`}>
                  <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/accounting/invoices">
                <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>
        }
      />
      
      <div className="flex-1 p-6 space-y-6">
        
        {/* Invoice Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-4 lg:col-span-2">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{invoice.invoice_number}</h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant={statusVariant}>{statusLabel}</Badge>
                  </div>
                  <Badge variant={paymentVariant}>{paymentLabel}</Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">{formatCurrency(invoice.total_amount)}</p>
                <p className="text-sm text-muted-foreground">{invoice.currency}</p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="border-t pt-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium">Bill To</span>
              </div>
              <div className="pl-6">
                <p className="font-medium">{invoice.customer_name}</p>
                {invoice.customer_email && (
                  <p className="text-sm text-muted-foreground">{invoice.customer_email}</p>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-4">Invoice Details</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div>
                  <p className="text-sm font-medium">Invoice Date</p>
                  <p className="text-sm text-muted-foreground">{formatDate(invoice.invoice_date)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div>
                  <p className="text-sm font-medium">Due Date</p>
                  <p className="text-sm text-muted-foreground">{formatDate(invoice.due_date)}</p>
                </div>
              </div>

              {invoice.payment_date && (
                <div className="flex items-center space-x-2">
                  <div>
                    <p className="text-sm font-medium">Payment Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(invoice.payment_date)}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <div>
                  <p className="text-sm font-medium">Payment Terms</p>
                  <p className="text-sm text-muted-foreground">{invoice.payment_terms}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div>
                  <p className="text-sm font-medium">Created By</p>
                  <p className="text-sm text-muted-foreground">{invoice.created_by}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Invoice Items */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Invoice Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2 font-medium">Item</th>
                  <th className="text-right py-2 font-medium">Qty</th>
                  <th className="text-right py-2 font-medium">Unit Price</th>
                  <th className="text-right py-2 font-medium">Discount</th>
                  <th className="text-right py-2 font-medium">Tax</th>
                  <th className="text-right py-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-3">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">{item.product_code}</p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="text-right py-3">{item.quantity}</td>
                    <td className="text-right py-3">{formatCurrency(item.unit_price)}</td>
                    <td className="text-right py-3">{item.discount_percentage}%</td>
                    <td className="text-right py-3">{item.tax_percentage}%</td>
                    <td className="text-right py-3 font-medium">{formatCurrency(item.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Payment Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(invoice.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                <span>Total Amount</span>
                <span>{formatCurrency(invoice.total_amount)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Amount Paid</span>
                <span>{formatCurrency(invoice.paid_amount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-red-600">
                <span>Balance Due</span>
                <span>{formatCurrency(invoice.balance_due)}</span>
              </div>
            </div>
          </Card>

          {invoice.notes && (
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Notes</h3>
              <p className="text-sm">{invoice.notes}</p>
            </Card>
          )}
        </div>

      </div>
    </TwoLevelLayout>
  )
}
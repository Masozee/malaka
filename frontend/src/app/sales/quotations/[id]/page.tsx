"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Separator } from '@/components/ui/separator'

import Link from 'next/link'
import { ConversionModal } from '@/components/quotation-conversion-modal'
import { ConversionResult } from '@/services/quotation-conversion'

// Mock data - same types as main page
interface QuotationItem {
  id: string
  product_code: string
  product_name: string
  size: string
  color: string
  quantity: number
  unit_price: number
  discount_percentage: number
  line_total: number
}

interface Quotation {
  id: string
  quotation_number: string
  quotation_date: string
  customer_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  sales_person: string
  quotation_type: 'standard' | 'custom' | 'bulk' | 'export'
  delivery_address: string
  items: QuotationItem[]
  subtotal: number
  tax_amount: number
  discount_amount: number
  shipping_cost: number
  total_amount: number
  status: 'draft' | 'sent' | 'reviewed' | 'approved' | 'rejected' | 'expired' | 'converted'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  payment_terms: string
  valid_until: string
  notes?: string
  created_at: string
  updated_at: string
}

// Mock data for demo
const mockQuotation: Quotation = {
  id: '1',
  quotation_number: 'QT-2024-001',
  quotation_date: '2024-07-25',
  customer_id: '1',
  customer_name: 'Toko Sepatu Merdeka',
  customer_email: 'merdeka@tokosepatu.com',
  customer_phone: '08123456789',
  sales_person: 'Ahmad Sales',
  quotation_type: 'bulk',
  delivery_address: 'Jl. Merdeka No. 123, Jakarta Pusat, DKI Jakarta 10110',
  items: [
    {
      id: '1',
      product_code: 'SHOE-001',
      product_name: 'Classic Oxford Brown',
      size: '42',
      color: 'Brown',
      quantity: 50,
      unit_price: 300000,
      discount_percentage: 10,
      line_total: 13500000
    },
    {
      id: '2',
      product_code: 'SHOE-002',
      product_name: 'Sports Sneaker White',
      size: '40',
      color: 'White',
      quantity: 30,
      unit_price: 280000,
      discount_percentage: 10,
      line_total: 7560000
    }
  ],
  subtotal: 21060000,
  tax_amount: 2106000,
  discount_amount: 2340000,
  shipping_cost: 150000,
  total_amount: 20976000,
  status: 'sent',
  priority: 'high',
  payment_terms: 'Net 30',
  valid_until: '2024-08-25',
  notes: 'Bulk quotation for grand opening',
  created_at: '2024-07-25T09:00:00Z',
  updated_at: '2024-07-25T14:30:00Z'
}

export default function QuotationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConversionModal, setShowConversionModal] = useState(false)
  const [conversionType, setConversionType] = useState<'sales-order' | 'invoice'>('sales-order')

  useEffect(() => {
    setMounted(true)
    // Simulate API call
    setTimeout(() => {
      setQuotation(mockQuotation)
      setLoading(false)
    }, 500)
  }, [])

  const formatCurrency = (amount: number): string => {
    if (!mounted) return ''
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const formatDate = (dateString: string): string => {
    if (!mounted) return ''
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { variant: 'outline' as const, label: 'Draft' },
      sent: { variant: 'default' as const, label: 'Sent' },
      reviewed: { variant: 'secondary' as const, label: 'Reviewed' },
      approved: { variant: 'default' as const, label: 'Approved' },
      rejected: { variant: 'outline' as const, label: 'Rejected' },
      expired: { variant: 'outline' as const, label: 'Expired' },
      converted: { variant: 'default' as const, label: 'Converted' }
    }
    return config[status as keyof typeof config] || { variant: 'secondary' as const, label: status }
  }

  const getPriorityBadge = (priority: string) => {
    const config = {
      low: { variant: 'outline' as const, label: 'Low' },
      normal: { variant: 'secondary' as const, label: 'Normal' },
      high: { variant: 'default' as const, label: 'High' },
      urgent: { variant: 'destructive' as const, label: 'Urgent' }
    }
    return config[priority as keyof typeof config] || { variant: 'secondary' as const, label: priority }
  }

  const getTypeBadge = (type: string) => {
    const config = {
      standard: { variant: 'default' as const, label: 'Standard' },
      custom: { variant: 'secondary' as const, label: 'Custom' },
      bulk: { variant: 'outline' as const, label: 'Bulk' },
      export: { variant: 'secondary' as const, label: 'Export' }
    }
    return config[type as keyof typeof config] || { variant: 'secondary' as const, label: type }
  }

  const isExpired = (validUntil: string): boolean => {
    if (!mounted) return false
    return new Date(validUntil) < new Date()
  }

  const handleConversionSuccess = (result: ConversionResult) => {
    // Update quotation status to converted if successful
    if (result.success && quotation) {
      setQuotation(prev => prev ? { ...prev, status: 'converted' as const } : null)
    }
    setShowConversionModal(false)
  }

  const openConversionModal = (type: 'sales-order' | 'invoice') => {
    setConversionType(type)
    setShowConversionModal(true)
  }

  const breadcrumbs = [
    { label: 'Sales', href: '/sales' },
    { label: 'Quotations', href: '/sales/quotations' },
    { label: quotation?.quotation_number || 'Loading...' }
  ]

  if (loading) {
    return (
      <TwoLevelLayout>
        <Header 
          title="Loading..."
          breadcrumbs={breadcrumbs}
        />
        <div className="flex-1 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded-lg"></div>
            <div className="h-48 bg-muted rounded-lg"></div>
            <div className="h-32 bg-muted rounded-lg"></div>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  if (!quotation) {
    return (
      <TwoLevelLayout>
        <Header 
          title="Quotation Not Found"
          breadcrumbs={breadcrumbs}
        />
        <div className="flex-1 p-6">
          <Card className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Quotation Not Found</h2>
            <p className="text-muted-foreground mb-4">The quotation you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/sales/quotations">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Quotations
              </Link>
            </Button>
          </Card>
        </div>
      </TwoLevelLayout>
    )
  }

  const { variant: statusVariant, label: statusLabel } = getStatusBadge(quotation.status)
  const { variant: priorityVariant, label: priorityLabel } = getPriorityBadge(quotation.priority)
  const { variant: typeVariant, label: typeLabel } = getTypeBadge(quotation.quotation_type)
  const expired = isExpired(quotation.valid_until)

  return (
    <TwoLevelLayout>
      <Header 
        title={quotation.quotation_number}
        description="Quotation details and management"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <DownloadSimple className="h-4 w-4 mr-2" />
              Export
            </Button>
            {(quotation.status === 'approved' || quotation.status === 'sent') && !isExpired(quotation.valid_until) && (
              <>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => openConversionModal('invoice')}
                  className="bg-green-50 hover:bg-green-100 border-green-200 text-green-800"
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Convert to Invoice
                </Button>
                <Button 
                  size="sm"
                  onClick={() => openConversionModal('sales-order')}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Convert to Order
                </Button>
              </>
            )}
            {(quotation.status === 'draft' || quotation.status === 'sent') && (
              <Button size="sm" asChild>
                <Link href={`/sales/quotations/${quotation.id}/edit`}>
                  <PencilSimple className="h-4 w-4 mr-2" />
                  Edit Quotation
                </Link>
              </Button>
            )}
          </div>
        }
      />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Expiry Warning */}
        {expired && (
          <Card className="p-4 border-red-200 bg-red-50">
            <div className="flex items-center space-x-3">
              <WarningCircle className="h-5 w-5 text-red-600" />
              <div>
                <h4 className="font-medium text-red-800">Quotation Expired</h4>
                <p className="text-sm text-red-700">This quotation expired on {formatDate(quotation.valid_until)}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Quotation Status and Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Quotation Summary</h2>
              <div className="flex items-center gap-2">
                <Badge variant={statusVariant}>{statusLabel}</Badge>
                <Badge variant={priorityVariant}>{priorityLabel}</Badge>
                <Badge variant={typeVariant}>{typeLabel}</Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Quotation Date:</span>
                  <span className="font-medium">{formatDate(quotation.quotation_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Valid Until:</span>
                  <span className={`font-medium ${expired ? 'text-red-600' : ''}`}>
                    {formatDate(quotation.valid_until)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Sales Person:</span>
                  <span className="font-medium">{quotation.sales_person}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Payment Terms:</span>
                  <span className="font-medium">{quotation.payment_terms}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total Items:</span>
                  <span className="font-medium">{quotation.items.length} items</span>
                </div>
                <div className="flex items-center gap-2">
                  <CurrencyDollar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Quotation Value:</span>
                  <span className="font-medium">{formatCurrency(quotation.total_amount)}</span>
                </div>
              </div>
            </div>
            
            {quotation.notes && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-1">Notes</h4>
                <p className="text-sm text-muted-foreground">{quotation.notes}</p>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">{quotation.customer_name}</h4>
              </div>
              <div className="flex items-center gap-2">
                <Envelope className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{quotation.customer_email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{quotation.customer_phone}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium mb-1">Delivery Address</div>
                  <div className="text-muted-foreground">{quotation.delivery_address}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quotation Items */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quotation Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Product Code</th>
                  <th className="text-left py-2">Product Name</th>
                  <th className="text-left py-2">Size</th>
                  <th className="text-left py-2">Color</th>
                  <th className="text-right py-2">Quantity</th>
                  <th className="text-right py-2">Unit Price</th>
                  <th className="text-right py-2">Discount</th>
                  <th className="text-right py-2">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {quotation.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-3 font-mono text-sm">{item.product_code}</td>
                    <td className="py-3 font-medium">{item.product_name}</td>
                    <td className="py-3">{item.size}</td>
                    <td className="py-3">{item.color}</td>
                    <td className="py-3 text-right">{item.quantity}</td>
                    <td className="py-3 text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="py-3 text-right">{item.discount_percentage}%</td>
                    <td className="py-3 text-right font-medium">{formatCurrency(item.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quotation Totals */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quotation Totals</h3>
          <div className="space-y-2 max-w-md ml-auto">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(quotation.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount:</span>
              <span className="text-green-600">-{formatCurrency(quotation.discount_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (10%):</span>
              <span>{formatCurrency(quotation.tax_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>{formatCurrency(quotation.shipping_cost)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>{formatCurrency(quotation.total_amount)}</span>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Actions</h3>
          <div className="flex flex-wrap gap-2">
            {quotation.status === 'draft' && (
              <Button>
                <PaperPlaneTilt className="mr-2 h-4 w-4" />
                Send to Customer
              </Button>
            )}
            {quotation.status === 'sent' && (
              <Button>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Reviewed
              </Button>
            )}
            {(quotation.status === 'approved' || quotation.status === 'sent') && !expired && (
              <>
                <Button onClick={() => openConversionModal('sales-order')}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Convert to Sales Order
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => openConversionModal('invoice')}
                  className="bg-green-50 hover:bg-green-100 border-green-200 text-green-800"
                >
                  <Receipt className="mr-2 h-4 w-4" />
                  Convert to Invoice
                </Button>
              </>
            )}
            <Button variant="outline">
              <Copy className="mr-2 h-4 w-4" />
              Duplicate Quotation
            </Button>
            <Button variant="outline">
              <Archive className="mr-2 h-4 w-4" />
              Archive Quotation
            </Button>
            {quotation.status === 'draft' && (
              <Button variant="destructive">
                <Trash className="mr-2 h-4 w-4" />
                Delete Quotation
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Conversion Modal */}
      <ConversionModal
        isOpen={showConversionModal}
        onClose={() => setShowConversionModal(false)}
        quotation={quotation}
        type={conversionType}
        onSuccess={handleConversionSuccess}
      />
    </TwoLevelLayout>
  )
}
"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
// Temporarily removing dialog dependency due to build issues
// import { 
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog'
import { 
  ShoppingCart,
  Receipt,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  X
} from 'lucide-react'
import { QuotationConversionService, ConversionOptions, ConversionResult } from '@/services/quotation-conversion'

interface ConversionModalProps {
  isOpen: boolean
  onClose: () => void
  quotation: any
  type: 'sales-order' | 'invoice'
  onSuccess?: (result: ConversionResult) => void
}

export function ConversionModal({ 
  isOpen, 
  onClose, 
  quotation, 
  type, 
  onSuccess 
}: ConversionModalProps) {
  const [converting, setConverting] = useState(false)
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [options, setOptions] = useState<ConversionOptions>({
    includeDiscount: true,
    adjustPricing: false,
    notes: '',
    deliveryDate: '',
    paymentTerms: quotation?.payment_terms || 'Net 30'
  })

  const formatCurrency = (amount: number): string => {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const handleConvert = async () => {
    if (!quotation) return

    // Validate quotation
    const validation = QuotationConversionService.validateForConversion(quotation)
    if (!validation.valid) {
      setResult({
        success: false,
        message: `Conversion failed: ${validation.errors.join(', ')}`
      })
      return
    }

    setConverting(true)
    setResult(null)

    try {
      let conversionResult: ConversionResult

      if (type === 'sales-order') {
        conversionResult = await QuotationConversionService.convertToSalesOrder(quotation.id, options)
      } else {
        conversionResult = await QuotationConversionService.convertToInvoice(quotation.id, options)
      }

      setResult(conversionResult)

      if (conversionResult.success && onSuccess) {
        onSuccess(conversionResult)
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'An unexpected error occurred. Please try again.'
      })
    } finally {
      setConverting(false)
    }
  }

  const handleClose = () => {
    setResult(null)
    setOptions({
      includeDiscount: true,
      adjustPricing: false,
      notes: '',
      deliveryDate: '',
      paymentTerms: quotation?.payment_terms || 'Net 30'
    })
    onClose()
  }

  if (!quotation) return null

  const isExpired = new Date(quotation.valid_until) < new Date()
  const canConvert = ['approved', 'sent'].includes(quotation.status) && !isExpired

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto m-4 ">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {type === 'sales-order' ? (
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              ) : (
                <Receipt className="h-5 w-5 text-green-600" />
              )}
              <h2 className="text-xl font-semibold">
                Convert to {type === 'sales-order' ? 'Sales Order' : 'Invoice'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-gray-600 mb-6">
            Convert quotation {quotation.quotation_number} to {type === 'sales-order' ? 'a sales order' : 'an invoice'}.
          </p>

        <div className="space-y-6">
          {/* Validation Warnings */}
          {!canConvert && (
            <Card className="p-4 border-amber-200 bg-amber-50">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div>
                  <h4 className="font-medium text-amber-800">Conversion Not Available</h4>
                  <p className="text-sm text-amber-700">
                    {isExpired 
                      ? `This quotation expired on ${new Date(quotation.valid_until).toLocaleDateString('id-ID')}`
                      : `Quotation must be approved or sent to be converted (current status: ${quotation.status})`
                    }
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Success/Error Result */}
          {result && (
            <Card className={`p-4 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-center space-x-3">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <h4 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                    {result.success ? 'Conversion Successful' : 'Conversion Failed'}
                  </h4>
                  <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                    {result.message}
                  </p>
                  {result.success && (result.orderId || result.invoiceId) && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      {type === 'sales-order' ? 'Order' : 'Invoice'} ID: {result.orderId || result.invoiceId}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Quotation Summary */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Quotation Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Customer:</span>
                <p className="font-medium">{quotation.customer_name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Total Amount:</span>
                <p className="font-medium">{formatCurrency(quotation.total_amount)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Items:</span>
                <p className="font-medium">{quotation.items.length} items</p>
              </div>
              <div>
                <span className="text-muted-foreground">Valid Until:</span>
                <p className={`font-medium ${isExpired ? 'text-red-600' : ''}`}>
                  {new Date(quotation.valid_until).toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
          </Card>

          {/* Conversion Options */}
          {canConvert && !result?.success && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Conversion Options</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeDiscount"
                    checked={options.includeDiscount}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, includeDiscount: checked as boolean }))
                    }
                  />
                  <Label htmlFor="includeDiscount" className="text-sm">
                    Include all discounts from quotation
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="adjustPricing"
                    checked={options.adjustPricing}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, adjustPricing: checked as boolean }))
                    }
                  />
                  <Label htmlFor="adjustPricing" className="text-sm">
                    Allow pricing adjustments during conversion
                  </Label>
                </div>

                {type === 'sales-order' && (
                  <div className="space-y-2">
                    <Label htmlFor="deliveryDate" className="text-sm">Delivery Date</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={options.deliveryDate}
                      onChange={(e) => setOptions(prev => ({ ...prev, deliveryDate: e.target.value }))}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="paymentTerms" className="text-sm">Payment Terms</Label>
                  <Input
                    id="paymentTerms"
                    value={options.paymentTerms}
                    onChange={(e) => setOptions(prev => ({ ...prev, paymentTerms: e.target.value }))}
                    placeholder="Net 30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={options.notes}
                    onChange={(e) => setOptions(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any special instructions or notes..."
                    rows={3}
                  />
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={converting}>
            {result?.success ? 'Close' : 'Cancel'}
          </Button>
          {canConvert && !result?.success && (
            <Button 
              onClick={handleConvert} 
              disabled={converting}
              className={type === 'sales-order' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {converting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  {type === 'sales-order' ? (
                    <ShoppingCart className="mr-2 h-4 w-4" />
                  ) : (
                    <Receipt className="mr-2 h-4 w-4" />
                  )}
                  Convert to {type === 'sales-order' ? 'Sales Order' : 'Invoice'}
                </>
              )}
            </Button>
          )}
          {result?.success && (
            <Button 
              onClick={() => {
                if (type === 'sales-order' && result.orderId) {
                  window.open(`/sales/orders/${result.orderId}`, '_blank')
                } else if (type === 'invoice' && result.invoiceId) {
                  window.open(`/accounting/invoices/${result.invoiceId}`, '_blank')
                }
              }}
              className={type === 'sales-order' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}
            >
              View {type === 'sales-order' ? 'Sales Order' : 'Invoice'}
            </Button>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}
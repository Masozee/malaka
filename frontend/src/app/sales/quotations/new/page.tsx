"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Separator } from '@/components/ui/separator'

import Link from 'next/link'

// Types
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

interface NewQuotation {
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
  status: 'draft' | 'sent'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  payment_terms: string
  valid_until: string
  notes?: string
}

export default function NewQuotationPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState<Partial<NewQuotation>>({
    quotation_number: `QT-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
    quotation_date: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    status: 'draft',
    priority: 'normal',
    quotation_type: 'standard',
    payment_terms: 'Net 30',
    shipping_cost: 0,
    items: [],
    subtotal: 0,
    tax_amount: 0,
    discount_amount: 0,
    total_amount: 0
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatCurrency = (amount: number): string => {
    if (!mounted) return ''
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const breadcrumbs = [
    { label: 'Sales', href: '/sales' },
    { label: 'Quotations', href: '/sales/quotations' },
    { label: 'New Quotation' }
  ]

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addItem = () => {
    const newItem: QuotationItem = {
      id: Date.now().toString(),
      product_code: '',
      product_name: '',
      size: '',
      color: '',
      quantity: 1,
      unit_price: 0,
      discount_percentage: 0,
      line_total: 0
    }
    
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }))
  }

  const removeItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: (prev.items || []).filter(item => item.id !== itemId)
    }))
  }

  const updateItem = (itemId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: (prev.items || []).map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value }
          
          // Recalculate line total when quantity, unit_price, or discount changes
          if (field === 'quantity' || field === 'unit_price' || field === 'discount_percentage') {
            const quantity = field === 'quantity' ? value : updatedItem.quantity
            const unitPrice = field === 'unit_price' ? value : updatedItem.unit_price
            const discount = field === 'discount_percentage' ? value : updatedItem.discount_percentage
            
            const subtotal = quantity * unitPrice
            const discountAmount = subtotal * (discount / 100)
            updatedItem.line_total = subtotal - discountAmount
          }
          
          return updatedItem
        }
        return item
      })
    }))
  }

  // Calculate totals whenever items change
  useEffect(() => {
    if (formData.items) {
      const subtotal = formData.items.reduce((sum, item) => sum + item.line_total, 0)
      const discountAmount = formData.items.reduce((sum, item) => {
        const itemSubtotal = item.quantity * item.unit_price
        return sum + (itemSubtotal * (item.discount_percentage / 100))
      }, 0)
      const taxAmount = subtotal * 0.1 // 10% tax
      const shippingCost = formData.shipping_cost || 0
      const totalAmount = subtotal + taxAmount + shippingCost

      setFormData(prev => ({
        ...prev,
        subtotal,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount
      }))
    }
  }, [formData.items, formData.shipping_cost])

  const handleSave = async (status: 'draft' | 'sent') => {
    setSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const quotationData = {
        ...formData,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('Creating quotation:', quotationData)
      // TODO: Implement actual save logic
      
      // Redirect to quotations list
      router.push('/sales/quotations')
    } catch (error) {
      console.error('Error creating quotation:', error)
    } finally {
      setSaving(false)
    }
  }

  const isFormValid = () => {
    return formData.customer_name && 
           formData.customer_email && 
           formData.sales_person && 
           formData.items && 
           formData.items.length > 0 &&
           formData.items.every(item => item.product_code && item.product_name && item.quantity > 0 && item.unit_price > 0)
  }

  return (
    <TwoLevelLayout>
      <Header 
        title="New Quotation"
        description="Create a new customer quotation"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/sales/quotations">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleSave('draft')} 
              disabled={saving || !isFormValid()}
            >
              <FileText className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save as Draft'}
            </Button>
            <Button 
              onClick={() => handleSave('sent')} 
              disabled={saving || !isFormValid()}
            >
              <FloppyDisk className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save & Send'}
            </Button>
          </div>
        }
      />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quotation_number">Quotation Number</Label>
              <Input
                id="quotation_number"
                value={formData.quotation_number || ''}
                onChange={(e) => updateFormData('quotation_number', e.target.value)}
                placeholder="QT-2024-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quotation_date">Quotation Date</Label>
              <Input
                id="quotation_date"
                type="date"
                value={formData.quotation_date || ''}
                onChange={(e) => updateFormData('quotation_date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valid_until">Valid Until</Label>
              <Input
                id="valid_until"
                type="date"
                value={formData.valid_until || ''}
                onChange={(e) => updateFormData('valid_until', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quotation_type">Quotation Type</Label>
              <Select value={formData.quotation_type || ''} onValueChange={(value) => updateFormData('quotation_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select quotation type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                  <SelectItem value="bulk">Bulk</SelectItem>
                  <SelectItem value="export">Export</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority || ''} onValueChange={(value) => updateFormData('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sales_person">Sales Person *</Label>
              <Input
                id="sales_person"
                value={formData.sales_person || ''}
                onChange={(e) => updateFormData('sales_person', e.target.value)}
                placeholder="Sales person name"
                required
              />
            </div>
          </div>
        </Card>

        {/* Customer Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer Name *</Label>
              <Input
                id="customer_name"
                value={formData.customer_name || ''}
                onChange={(e) => updateFormData('customer_name', e.target.value)}
                placeholder="Customer name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_email">Customer Email *</Label>
              <Input
                id="customer_email"
                type="email"
                value={formData.customer_email || ''}
                onChange={(e) => updateFormData('customer_email', e.target.value)}
                placeholder="customer@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_phone">Customer Phone</Label>
              <Input
                id="customer_phone"
                value={formData.customer_phone || ''}
                onChange={(e) => updateFormData('customer_phone', e.target.value)}
                placeholder="08123456789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_terms">Payment Terms</Label>
              <Input
                id="payment_terms"
                value={formData.payment_terms || ''}
                onChange={(e) => updateFormData('payment_terms', e.target.value)}
                placeholder="Net 30"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="delivery_address">Delivery Address</Label>
              <Textarea
                id="delivery_address"
                value={formData.delivery_address || ''}
                onChange={(e) => updateFormData('delivery_address', e.target.value)}
                placeholder="Complete delivery address"
                rows={3}
              />
            </div>
          </div>
        </Card>

        {/* Quotation Items */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Quotation Items *</h3>
            <Button onClick={addItem} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          {(!formData.items || formData.items.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No items added yet. Click "Add Item" to get started.</p>
            </div>
          )}

          <div className="space-y-4">
            {formData.items?.map((item, index) => (
              <div key={item.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Product Code *</Label>
                    <Input
                      value={item.product_code}
                      onChange={(e) => updateItem(item.id, 'product_code', e.target.value)}
                      placeholder="SHOE-001"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Product Name *</Label>
                    <Input
                      value={item.product_name}
                      onChange={(e) => updateItem(item.id, 'product_name', e.target.value)}
                      placeholder="Product name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Size</Label>
                    <Input
                      value={item.size}
                      onChange={(e) => updateItem(item.id, 'size', e.target.value)}
                      placeholder="42"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Input
                      value={item.color}
                      onChange={(e) => updateItem(item.id, 'color', e.target.value)}
                      placeholder="Black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Unit Price *</Label>
                    <Input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                      min="0"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Discount (%)</Label>
                    <Input
                      type="number"
                      value={item.discount_percentage}
                      onChange={(e) => updateItem(item.id, 'discount_percentage', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Line Total</Label>
                    <Input
                      value={formatCurrency(item.line_total)}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Additional Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shipping_cost">Shipping Cost</Label>
              <Input
                id="shipping_cost"
                type="number"
                value={formData.shipping_cost || 0}
                onChange={(e) => updateFormData('shipping_cost', parseFloat(e.target.value) || 0)}
                min="0"
              />
            </div>

            <div></div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => updateFormData('notes', e.target.value)}
                placeholder="Additional notes or comments"
                rows={3}
              />
            </div>
          </div>
        </Card>

        {/* Totals Summary */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quotation Summary</h3>
          <div className="space-y-2 max-w-md ml-auto">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(formData.subtotal || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount:</span>
              <span className="text-green-600">-{formatCurrency(formData.discount_amount || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (10%):</span>
              <span>{formatCurrency(formData.tax_amount || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>{formatCurrency(formData.shipping_cost || 0)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>{formatCurrency(formData.total_amount || 0)}</span>
            </div>
          </div>
        </Card>

        {/* Form Validation Message */}
        {!isFormValid() && (
          <Card className="p-4 border-amber-200 bg-amber-50">
            <div className="flex items-center space-x-3">
              <WarningCircle className="h-5 w-5 text-amber-600" />
              <div>
                <h4 className="font-medium text-amber-800">Form Incomplete</h4>
                <p className="text-sm text-amber-700">Please fill in all required fields (*) and add at least one item.</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </TwoLevelLayout>
  )
}
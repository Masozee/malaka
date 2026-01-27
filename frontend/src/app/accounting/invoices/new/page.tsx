'use client'

import React, { useState, useEffect, useRef } from 'react'
import { HugeiconsIcon } from "@hugeicons/react"
import { ViewIcon, FloppyDiskIcon, SendToMobileIcon, FileIcon, UserGroupIcon, PlusSignIcon, Package01Icon, DeleteIcon, CalculatorIcon, Download01Icon, PencilEdit01Icon } from "@hugeicons/core-free-icons"
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

import Link from 'next/link'
// jsPDF is loaded dynamically to reduce bundle size
import html2canvas from 'html2canvas'

// Invoice data types
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

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  postal_code: string
  country: string
}

interface InvoiceData {
  id?: string
  invoice_number: string
  customer: Customer | null
  invoice_date: string
  due_date: string
  payment_terms: string
  currency: string
  notes: string
  terms_conditions: string
  items: InvoiceItem[]
  subtotal: number
  discount_percentage: number
  discount_amount: number
  tax_percentage: number
  tax_amount: number
  total_amount: number
  status: 'draft' | 'sent' | 'paid'
}

// Mock customers data
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Toko Sepatu Mandiri',
    email: 'mandiri@example.com',
    phone: '+62 21 1234-5678',
    address: 'Jl. Sudirman No. 123',
    city: 'Jakarta',
    postal_code: '10220',
    country: 'Indonesia'
  },
  {
    id: '2',
    name: 'CV. Footwear Indonesia',
    email: 'footwear@example.com',
    phone: '+62 21 8765-4321',
    address: 'Jl. Thamrin No. 456',
    city: 'Jakarta',
    postal_code: '10230',
    country: 'Indonesia'
  },
  {
    id: '3',
    name: 'PT. Sepatu Nusantara',
    email: 'nusantara@example.com',
    phone: '+62 21 5555-6666',
    address: 'Jl. Gatot Subroto No. 789',
    city: 'Jakarta',
    postal_code: '12930',
    country: 'Indonesia'
  }
]

// Mock products data
const mockProducts = [
  { id: '1', code: 'SPT001', name: 'Sepatu Formal Hitam', price: 250000 },
  { id: '2', code: 'SPT002', name: 'Sepatu Casual Coklat', price: 180000 },
  { id: '3', code: 'SPT003', name: 'Sepatu Olahraga Putih', price: 320000 },
  { id: '4', code: 'SPT004', name: 'Sepatu Boot Kulit', price: 450000 },
  { id: '5', code: 'SPT005', name: 'Sandal Casual', price: 120000 }
]

export default function InvoiceDesignerPage() {
  const [mounted, setMounted] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const invoiceRef = useRef<HTMLDivElement>(null)
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoice_number: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    customer: null,
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    payment_terms: '30 days',
    currency: 'IDR',
    notes: '',
    terms_conditions: 'Payment is due within 30 days of invoice date. Late payments may incur additional charges.',
    items: [],
    subtotal: 0,
    discount_percentage: 0,
    discount_amount: 0,
    tax_percentage: 11,
    tax_amount: 0,
    total_amount: 0,
    status: 'draft'
  })

  const [selectedTemplate, setSelectedTemplate] = useState('modern')
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const calculateTotals = () => {
      const subtotal = invoiceData.items.reduce((sum, item) => sum + item.line_total, 0)
      const discountAmount = (subtotal * invoiceData.discount_percentage) / 100
      const taxableAmount = subtotal - discountAmount
      const taxAmount = (taxableAmount * invoiceData.tax_percentage) / 100
      const totalAmount = taxableAmount + taxAmount

      setInvoiceData(prev => ({
        ...prev,
        subtotal,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount
      }))
    }

    calculateTotals()
  }, [invoiceData.items, invoiceData.discount_percentage, invoiceData.tax_percentage])

  const addInvoiceItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      product_code: '',
      product_name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      discount_percentage: 0,
      tax_percentage: 11,
      line_total: 0
    }
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  const updateInvoiceItem = (itemId: string, field: keyof InvoiceItem, value: any) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value }

          // Recalculate line total
          const quantity = updatedItem.quantity
          const unitPrice = updatedItem.unit_price
          const discountAmount = (quantity * unitPrice * updatedItem.discount_percentage) / 100
          const lineTotal = (quantity * unitPrice) - discountAmount

          return { ...updatedItem, line_total: lineTotal }
        }
        return item
      })
    }))
  }

  const removeInvoiceItem = (itemId: string) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }))
  }

  const selectProduct = (itemId: string, productId: string) => {
    const product = mockProducts.find(p => p.id === productId)
    if (product) {
      updateInvoiceItem(itemId, 'product_code', product.code)
      updateInvoiceItem(itemId, 'product_name', product.name)
      updateInvoiceItem(itemId, 'unit_price', product.price)
    }
  }

  const formatCurrency = (amount: number): string => {
    if (!mounted) return ''
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const generatePDF = async () => {
    if (isGeneratingPDF) return

    try {
      setIsGeneratingPDF(true)
      console.log('Starting PDF generation...')

      // Create completely clean HTML for PDF without any Tailwind classes
      const cleanInvoiceHTML = `
        <div style="
          width: 750px; 
          background: white; 
          color: black; 
          font-family: Arial, sans-serif; 
          font-size: 14px; 
          line-height: 1.4;
          padding: 40px;
        ">
          <!-- Invoice Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px;">
            <div style="display: flex; align-items: center;">
              <div style="
                width: 64px; 
                height: 64px; 
                background: #2563eb; 
                border-radius: 8px; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                margin-right: 16px;
              ">
                <span style="font-size: 24px; font-weight: bold; color: white;">M</span>
              </div>
              <div>
                <h1 style="font-size: 24px; font-weight: bold; color: black; margin: 0;">Malaka ERP</h1>
                <p style="color: #666; margin: 0;">Footwear Manufacturing</p>
              </div>
            </div>
            <div style="text-align: right;">
              <h2 style="font-size: 32px; font-weight: bold; color: black; margin: 0 0 8px 0;">INVOICE</h2>
              <p style="font-size: 18px; font-weight: 600; color: #2563eb; margin: 0;">${invoiceData.invoice_number}</p>
            </div>
          </div>

          <!-- Company & Customer Information -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-bottom: 32px;">
            <div>
              <h3 style="font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">From</h3>
              <div style="color: black;">
                <p style="font-weight: 600; margin: 0;">PT Malaka Footwear Indonesia</p>
                <p style="margin: 0;">Jl. Raya Industri No. 45</p>
                <p style="margin: 0;">Tangerang, Banten 15134</p>
                <p style="margin: 0;">Indonesia</p>
                <p style="margin: 8px 0 0 0;">Phone: +62 21 555-0123</p>
                <p style="margin: 0;">Email: invoice@malaka.co.id</p>
                <p style="margin: 0;">Tax ID: 01.234.567.8-901.000</p>
              </div>
            </div>
            <div>
              <h3 style="font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Bill To</h3>
              ${invoiceData.customer ? `
                <div style="color: black;">
                  <p style="font-weight: 600; margin: 0;">${invoiceData.customer.name}</p>
                  <p style="margin: 0;">${invoiceData.customer.address}</p>
                  <p style="margin: 0;">${invoiceData.customer.city}, ${invoiceData.customer.postal_code}</p>
                  <p style="margin: 0;">${invoiceData.customer.country}</p>
                  <p style="margin: 8px 0 0 0;">Phone: ${invoiceData.customer.phone}</p>
                  <p style="margin: 0;">Email: ${invoiceData.customer.email}</p>
                </div>
              ` : `
                <div style="color: #999; font-style: italic;">
                  <p style="margin: 0;">No customer selected</p>
                  <p style="margin: 0;">Please select a customer from the form</p>
                </div>
              `}
            </div>
          </div>

          <!-- Invoice Details -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 32px; margin-bottom: 32px;">
            <div>
              <p style="font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">Invoice Date</p>
              <p style="font-size: 16px; font-weight: 600; color: black; margin: 0;">${mounted && invoiceData.invoice_date ? new Date(invoiceData.invoice_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p>
            </div>
            <div>
              <p style="font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">Due Date</p>
              <p style="font-size: 16px; font-weight: 600; color: black; margin: 0;">${mounted && invoiceData.due_date ? new Date(invoiceData.due_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p>
            </div>
            <div>
              <p style="font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">Payment Terms</p>
              <p style="font-size: 16px; font-weight: 600; color: black; margin: 0;">${invoiceData.payment_terms}</p>
            </div>
          </div>

          <!-- Invoice Items Table -->
          <div style="margin-bottom: 32px;">
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
              <div style="background: #f9fafb; padding: 24px; border-bottom: 1px solid #e5e7eb;">
                <div style="display: grid; grid-template-columns: 5fr 2fr 2fr 1fr 2fr; gap: 16px; font-size: 12px; font-weight: 600; color: black; text-transform: uppercase; letter-spacing: 0.05em;">
                  <div>Description</div>
                  <div style="text-align: center;">Quantity</div>
                  <div style="text-align: right;">Unit Price</div>
                  <div style="text-align: center;">Disc%</div>
                  <div style="text-align: right;">Total</div>
                </div>
              </div>
              <div>
                ${invoiceData.items.length > 0 ? invoiceData.items.map((item, index) => `
                  <div style="padding: 24px; ${index > 0 ? 'border-top: 1px solid #e5e7eb;' : ''}">
                    <div style="display: grid; grid-template-columns: 5fr 2fr 2fr 1fr 2fr; gap: 16px; align-items: center;">
                      <div>
                        <p style="font-weight: 600; color: black; margin: 0;">${item.product_name || 'Unnamed Item'}</p>
                        <p style="font-size: 12px; color: #666; margin: 0;">${item.product_code}</p>
                        ${item.description ? `<p style="font-size: 12px; color: #999; margin: 4px 0 0 0;">${item.description}</p>` : ''}
                      </div>
                      <div style="text-align: center;">
                        <span style="color: black; font-weight: 500;">${item.quantity}</span>
                      </div>
                      <div style="text-align: right;">
                        <span style="color: black; font-weight: 500;">${formatCurrency(item.unit_price)}</span>
                      </div>
                      <div style="text-align: center;">
                        <span style="color: black; font-weight: 500;">${item.discount_percentage}%</span>
                      </div>
                      <div style="text-align: right;">
                        <span style="color: black; font-weight: bold;">${formatCurrency(item.line_total)}</span>
                      </div>
                    </div>
                  </div>
                `).join('') : `
                  <div style="padding: 48px; text-align: center;">
                    <p style="color: #999; margin: 0;">No items added to this invoice</p>
                    <p style="font-size: 12px; color: #ccc; margin: 0;">Add items using the form on the left</p>
                  </div>
                `}
              </div>
            </div>
          </div>

          <!-- Invoice Summary -->
          <div style="display: flex; justify-content: flex-end; margin-bottom: 32px;">
            <div style="width: 320px;">
              <div style="space-y: 12px;">
                <div style="display: flex; justify-content: space-between; color: #374151; margin-bottom: 8px;">
                  <span>Subtotal:</span>
                  <span style="font-weight: 500;">${formatCurrency(invoiceData.subtotal)}</span>
                </div>
                
                ${invoiceData.discount_amount > 0 ? `
                  <div style="display: flex; justify-content: space-between; color: #16a34a; margin-bottom: 8px;">
                    <span>Discount (${invoiceData.discount_percentage}%):</span>
                    <span style="font-weight: 500;">-${formatCurrency(invoiceData.discount_amount)}</span>
                  </div>
                ` : ''}
                
                <div style="display: flex; justify-content: space-between; color: #374151; margin-bottom: 12px;">
                  <span>Tax (${invoiceData.tax_percentage}%):</span>
                  <span style="font-weight: 500;">${formatCurrency(invoiceData.tax_amount)}</span>
                </div>
                
                <div style="border-top: 1px solid #d1d5db; padding-top: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 20px; font-weight: bold; color: black;">Total:</span>
                    <span style="font-size: 24px; font-weight: bold; color: #2563eb;">${formatCurrency(invoiceData.total_amount)}</span>
                  </div>
                  <p style="text-align: right; font-size: 12px; color: #999; margin: 4px 0 0 0;">${invoiceData.currency}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 32px; margin-top: 32px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <p style="font-size: 12px; color: #999; margin: 0;">Thank you for your business!</p>
                <p style="font-size: 12px; color: #ccc; margin: 0;">Generated on ${mounted ? new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p>
              </div>
              <div style="text-align: right;">
                <div style="background: #f3f4f6; padding: 8px 16px; border-radius: 8px;">
                  <p style="font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">Status</p>
                  <span style="
                    display: inline-block; 
                    padding: 2px 8px; 
                    font-size: 12px; 
                    font-weight: 500; 
                    border-radius: 4px; 
                    background: ${invoiceData.status === 'draft' ? '#f3f4f6' : invoiceData.status === 'sent' ? '#2563eb' : '#e5e7eb'}; 
                    color: ${invoiceData.status === 'draft' ? '#374151' : invoiceData.status === 'sent' ? 'white' : '#374151'};
                  ">
                    ${invoiceData.status.charAt(0).toUpperCase() + invoiceData.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `

      // Create temporary container with clean HTML
      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'absolute'
      tempContainer.style.left = '-9999px'
      tempContainer.style.top = '0'
      tempContainer.innerHTML = cleanInvoiceHTML

      document.body.appendChild(tempContainer)

      console.log('Rendering canvas with clean HTML...')

      // Generate canvas
      const canvas = await html2canvas(tempContainer, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794,
        height: Math.max(1123, tempContainer.scrollHeight + 80)
      })

      console.log('Canvas created:', canvas.width, 'x', canvas.height)

      // Remove temporary container
      document.body.removeChild(tempContainer)

      // Create PDF (dynamically loaded)
      const jsPDF = (await import('jspdf')).default
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgData = canvas.toDataURL('image/png', 0.95)

      // Calculate dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgAspectRatio = canvas.height / canvas.width
      const pdfAspectRatio = pdfHeight / pdfWidth

      let imgWidth, imgHeight, imgX, imgY

      if (imgAspectRatio > pdfAspectRatio) {
        imgHeight = pdfHeight - 20
        imgWidth = imgHeight / imgAspectRatio
        imgX = (pdfWidth - imgWidth) / 2
        imgY = 10
      } else {
        imgWidth = pdfWidth - 20
        imgHeight = imgWidth * imgAspectRatio
        imgX = 10
        imgY = (pdfHeight - imgHeight) / 2
      }

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth, imgHeight)

      // Generate filename
      const fileName = `${invoiceData.invoice_number.replace(/[^a-zA-Z0-9]/g, '_') || 'invoice'}_${new Date().toISOString().split('T')[0]}.pdf`

      console.log('Saving PDF as:', fileName)
      pdf.save(fileName)

      console.log('PDF generation completed successfully')

    } catch (error) {
      console.error('Detailed PDF generation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to generate PDF: ${errorMessage}. Please check the console for details and try again.`)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const breadcrumbs = [
    { label: 'Accounting', href: '/accounting' },
    { label: 'Invoices', href: '/accounting/invoices' },
    { label: 'New Invoice', href: '/accounting/invoices/new' }
  ]

  return (
    <TwoLevelLayout>
      <Header
        title="Invoice Designer"
        description="Create and customize professional invoices"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
              <HugeiconsIcon icon={ViewIcon} className="h-4 w-4 mr-2" />
              {showPreview ? 'Edit Mode' : 'Preview Only'}
            </Button>
            <Button variant="outline" size="sm">
              <HugeiconsIcon icon={FloppyDiskIcon} className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button size="sm">
              <HugeiconsIcon icon={SendToMobileIcon} className="h-4 w-4 mr-2" />
              Send Invoice
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-0">
        <div className={`grid h-full ${showPreview ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>

          {/* Left Panel - Invoice Form */}
          {!showPreview && (
            <div className="bg-background border-r p-6 overflow-y-auto space-y-6">

              {/* Invoice Header */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold flex items-center">
                    <HugeiconsIcon icon={FileIcon} className="h-5 w-5 mr-2" />
                    Invoice Details
                  </h3>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="invoice_number">Invoice Number</Label>
                      <Input
                        id="invoice_number"
                        value={invoiceData.invoice_number}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, invoice_number: e.target.value }))}
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="invoice_date">Invoice Date</Label>
                      <Input
                        id="invoice_date"
                        type="date"
                        value={invoiceData.invoice_date}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, invoice_date: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payment_terms">Payment Terms</Label>
                      <Select
                        value={invoiceData.payment_terms}
                        onValueChange={(value) => setInvoiceData(prev => ({ ...prev, payment_terms: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select terms" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Due Immediately</SelectItem>
                          <SelectItem value="15 days">Net 15</SelectItem>
                          <SelectItem value="30 days">Net 30</SelectItem>
                          <SelectItem value="45 days">Net 45</SelectItem>
                          <SelectItem value="60 days">Net 60</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="due_date">Due Date</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={invoiceData.due_date}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, due_date: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={invoiceData.currency}
                        onValueChange={(value) => setInvoiceData(prev => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IDR">Indonesian Rupiah (IDR)</SelectItem>
                          <SelectItem value="USD">US Dollar (USD)</SelectItem>
                          <SelectItem value="EUR">Euro (EUR)</SelectItem>
                          <SelectItem value="SGD">Singapore Dollar (SGD)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{invoiceData.status}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Customer Selection */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold flex items-center">
                    <HugeiconsIcon icon={UserGroupIcon} className="h-5 w-5 mr-2" />
                    Customer Information
                  </h3>
                  <Button variant="outline" size="sm">
                    <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                    New Customer
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Select Customer</Label>
                    <Select
                      value={invoiceData.customer?.id || ''}
                      onValueChange={(value) => {
                        const customer = mockCustomers.find(c => c.id === value)
                        setInvoiceData(prev => ({ ...prev, customer: customer || null }))
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCustomers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            <div>
                              <div className="font-medium">{customer.name}</div>
                              <div className="text-sm text-muted-foreground">{customer.email}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {invoiceData.customer && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">{invoiceData.customer.name}</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>{invoiceData.customer.email}</p>
                        <p>{invoiceData.customer.phone}</p>
                        <p>{invoiceData.customer.address}</p>
                        <p>{invoiceData.customer.city}, {invoiceData.customer.postal_code}</p>
                        <p>{invoiceData.customer.country}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Invoice Items */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold flex items-center">
                    <HugeiconsIcon icon={Package01Icon} className="h-5 w-5 mr-2" />
                    Invoice Items
                  </h3>
                  <Button onClick={addInvoiceItem} size="sm">
                    <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {invoiceData.items.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Item #{index + 1}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeInvoiceItem(item.id)}
                          aria-label="Remove item"
                        >
                          <HugeiconsIcon icon={DeleteIcon} className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Product</Label>
                          <Select
                            value={item.product_code}
                            onValueChange={(value) => {
                              const product = mockProducts.find(p => p.code === value)
                              if (product) selectProduct(item.id, product.id)
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockProducts.map((product) => (
                                <SelectItem key={product.id} value={product.code}>
                                  <div>
                                    <div className="font-medium">{product.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {product.code} - {formatCurrency(product.price)}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            value={item.description}
                            onChange={(e) => updateInvoiceItem(item.id, 'description', e.target.value)}
                            placeholder="Item description"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateInvoiceItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            min="0"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Unit Price</Label>
                          <Input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => updateInvoiceItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                            min="0"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Discount %</Label>
                          <Input
                            type="number"
                            value={item.discount_percentage}
                            onChange={(e) => updateInvoiceItem(item.id, 'discount_percentage', parseFloat(e.target.value) || 0)}
                            min="0"
                            max="100"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Line Total</Label>
                          <div className="h-10 px-3 py-2 bg-muted rounded-md text-sm font-medium">
                            {formatCurrency(item.line_total)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {invoiceData.items.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <HugeiconsIcon icon={Package01Icon} className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No items added yet</p>
                      <p className="text-sm">Click "Add Item" to start building your invoice</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Calculation Controls */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center">
                  <HugeiconsIcon icon={CalculatorIcon} className="h-5 w-5 mr-2" />
                  Calculations
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label>Global Discount %</Label>
                    <Input
                      type="number"
                      value={invoiceData.discount_percentage}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, discount_percentage: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      max="100"
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tax %</Label>
                    <Input
                      type="number"
                      value={invoiceData.tax_percentage}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, tax_percentage: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      max="100"
                      placeholder="11"
                    />
                  </div>
                </div>

                {/* Totals Summary */}
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-medium">{formatCurrency(invoiceData.subtotal)}</span>
                  </div>

                  {invoiceData.discount_amount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({invoiceData.discount_percentage}%):</span>
                      <span>-{formatCurrency(invoiceData.discount_amount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span>Tax ({invoiceData.tax_percentage}%):</span>
                    <span className="font-medium">{formatCurrency(invoiceData.tax_amount)}</span>
                  </div>

                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount:</span>
                      <span className="text-primary">{formatCurrency(invoiceData.total_amount)}</span>
                    </div>
                    <p className="text-right text-sm text-muted-foreground">{invoiceData.currency}</p>
                  </div>
                </div>
              </Card>

              {/* Notes and Terms */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-6">Additional Information</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={invoiceData.notes}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add any notes or special instructions"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="terms">Terms & Conditions</Label>
                    <Textarea
                      id="terms"
                      value={invoiceData.terms_conditions}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, terms_conditions: e.target.value }))}
                      placeholder="Enter terms and conditions"
                      rows={4}
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Right Panel - Real Invoice Design */}
          <div className={`bg-white p-8 overflow-y-auto ${showPreview ? 'col-span-1' : ''} relative`}>
            {/* Preview Mode Floating Toolbar */}
            {showPreview && (
              <div className="fixed top-20 right-6 z-50 bg-white  border rounded-lg p-3 flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generatePDF}
                  disabled={isGeneratingPDF}
                >
                  <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
                  {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
                </Button>
                <Button variant="outline" size="sm">
                  <HugeiconsIcon icon={SendToMobileIcon} className="h-4 w-4 mr-2" />
                  Send Invoice
                </Button>
                <Button variant="outline" size="sm">
                  <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            )}

            <div ref={invoiceRef} className={`mx-auto ${showPreview ? 'max-w-4xl' : 'max-w-2xl'}`}>
              {/* Invoice Header with Logo */}
              <div className="flex justify-between items-start mb-12">
                <div className="flex items-center space-x-4">
                  {/* Company Logo */}
                  <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">M</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Malaka ERP</h1>
                    <p className="text-gray-600">Footwear Manufacturing</p>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h2>
                  <p className="text-lg font-semibold text-primary">{invoiceData.invoice_number}</p>
                </div>
              </div>

              {/* Company & Customer Information */}
              <div className="grid grid-cols-2 gap-12 mb-8">
                {/* From */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">From</h3>
                  <div className="text-gray-900">
                    <p className="font-semibold">PT Malaka Footwear Indonesia</p>
                    <p>Jl. Raya Industri No. 45</p>
                    <p>Tangerang, Banten 15134</p>
                    <p>Indonesia</p>
                    <p className="mt-2">Phone: +62 21 555-0123</p>
                    <p>Email: invoice@malaka.co.id</p>
                    <p>Tax ID: 01.234.567.8-901.000</p>
                  </div>
                </div>

                {/* To */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Bill To</h3>
                  {invoiceData.customer ? (
                    <div className="text-gray-900">
                      <p className="font-semibold">{invoiceData.customer.name}</p>
                      <p>{invoiceData.customer.address}</p>
                      <p>{invoiceData.customer.city}, {invoiceData.customer.postal_code}</p>
                      <p>{invoiceData.customer.country}</p>
                      <p className="mt-2">Phone: {invoiceData.customer.phone}</p>
                      <p>Email: {invoiceData.customer.email}</p>
                    </div>
                  ) : (
                    <div className="text-gray-400 italic">
                      <p>No customer selected</p>
                      <p>Please select a customer from the form</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-3 gap-8 mb-8">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Invoice Date</p>
                  <p className="text-lg font-semibold text-gray-900">{mounted && invoiceData.invoice_date ? new Date(invoiceData.invoice_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Due Date</p>
                  <p className="text-lg font-semibold text-gray-900">{mounted && invoiceData.due_date ? new Date(invoiceData.due_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Payment Terms</p>
                  <p className="text-lg font-semibold text-gray-900">{invoiceData.payment_terms}</p>
                </div>
              </div>

              {/* Invoice Items Table */}
              <div className="mb-8">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Table Header */}
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      <div className="col-span-5">Description</div>
                      <div className="col-span-2 text-center">Quantity</div>
                      <div className="col-span-2 text-right">Unit Price</div>
                      <div className="col-span-1 text-center">Disc%</div>
                      <div className="col-span-2 text-right">Total</div>
                    </div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-gray-200">
                    {invoiceData.items.length > 0 ? (
                      invoiceData.items.map((item, index) => (
                        <div key={index} className="px-6 py-4">
                          <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-5">
                              <p className="font-semibold text-gray-900">{item.product_name || 'Unnamed Item'}</p>
                              <p className="text-sm text-gray-600">{item.product_code}</p>
                              {item.description && (
                                <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                              )}
                            </div>
                            <div className="col-span-2 text-center">
                              <span className="text-gray-900 font-medium">{item.quantity}</span>
                            </div>
                            <div className="col-span-2 text-right">
                              <span className="text-gray-900 font-medium">{formatCurrency(item.unit_price)}</span>
                            </div>
                            <div className="col-span-1 text-center">
                              <span className="text-gray-900 font-medium">{item.discount_percentage}%</span>
                            </div>
                            <div className="col-span-2 text-right">
                              <span className="text-gray-900 font-bold">{formatCurrency(item.line_total)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-6 py-12 text-center">
                        <HugeiconsIcon icon={Package01Icon} className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No items added to this invoice</p>
                        <p className="text-sm text-gray-400">Add items using the form on the left</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Invoice Summary */}
              <div className="flex justify-end mb-8">
                <div className="w-80">
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal:</span>
                      <span className="font-medium">{formatCurrency(invoiceData.subtotal)}</span>
                    </div>

                    {invoiceData.discount_amount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({invoiceData.discount_percentage}%):</span>
                        <span className="font-medium">-{formatCurrency(invoiceData.discount_amount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-700">
                      <span>Tax ({invoiceData.tax_percentage}%):</span>
                      <span className="font-medium">{formatCurrency(invoiceData.tax_amount)}</span>
                    </div>

                    <div className="border-t border-gray-300 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-900">Total:</span>
                        <span className="text-2xl font-bold text-primary">{formatCurrency(invoiceData.total_amount)}</span>
                      </div>
                      <p className="text-right text-sm text-gray-500 mt-1">{invoiceData.currency}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes and Terms */}
              {(invoiceData.notes || invoiceData.terms_conditions) && (
                <div className="border-t border-gray-200 pt-8">
                  {invoiceData.notes && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{invoiceData.notes}</p>
                    </div>
                  )}

                  {invoiceData.terms_conditions && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Terms & Conditions</h4>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{invoiceData.terms_conditions}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="border-t border-gray-200 pt-8 mt-8">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Thank you for your business!</p>
                    <p className="text-sm text-gray-400">Generated on {mounted ? new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-gray-100 px-4 py-2 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                      <Badge variant={invoiceData.status === 'draft' ? 'secondary' : invoiceData.status === 'sent' ? 'default' : 'outline'}>
                        {invoiceData.status.charAt(0).toUpperCase() + invoiceData.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions for Print */}
              {!showPreview && (
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-center gap-4 print:hidden">
                  <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowPreview(true)}>
                    <HugeiconsIcon icon={ViewIcon} className="h-4 w-4" />
                    Preview PDF
                  </Button>
                  <Button
                    className="flex items-center gap-2"
                    onClick={generatePDF}
                    disabled={isGeneratingPDF}
                  >
                    <HugeiconsIcon icon={Download01Icon} className="h-4 w-4" />
                    {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <HugeiconsIcon icon={SendToMobileIcon} className="h-4 w-4" />
                    Send Invoice
                  </Button>
                </div>
              )}

              {/* Preview Mode Print Instructions */}
              {showPreview && (
                <div className="mt-8 pt-6 border-t border-gray-200 text-center print:hidden">
                  <p className="text-sm text-gray-500 mb-4">
                    This is a preview of how your invoice will appear when printed or exported to PDF.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button
                      onClick={generatePDF}
                      disabled={isGeneratingPDF}
                      className="flex items-center gap-2"
                    >
                      <HugeiconsIcon icon={Download01Icon} className="h-4 w-4" />
                      {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
                    </Button>
                    <Button onClick={() => window.print()} variant="outline" className="flex items-center gap-2">
                      <HugeiconsIcon icon={Download01Icon} className="h-4 w-4" />
                      Print Invoice
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TwoLevelLayout>
  )
}
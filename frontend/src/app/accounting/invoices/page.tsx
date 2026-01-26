'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'

import Link from 'next/link'
import { invoiceService } from '@/services/accounting'

// Invoice types and interfaces
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

export default function InvoicesPage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])

  useEffect(() => {
    setMounted(true)
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await invoiceService.getAll()
      const invoiceData = response.data || []
      setInvoices(invoiceData)
      setFilteredInvoices(invoiceData)
    } catch (error) {
      console.error('Error fetching invoices:', error)
      setInvoices([])
      setFilteredInvoices([])
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

  const breadcrumbs = [
    { label: 'Accounting', href: '/accounting' },
    { label: 'Invoices', href: '/accounting/invoices' }
  ]

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { variant: 'secondary' as const, label: 'Draft' },
      sent: { variant: 'default' as const, label: 'Sent' },
      paid: { variant: 'default' as const, label: 'Paid' },
      overdue: { variant: 'destructive' as const, label: 'Overdue' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled' }
    }
    return config[status as keyof typeof config] || { variant: 'secondary' as const, label: status }
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

  const columns = [
    {
      key: 'invoice_number' as keyof Invoice,
      title: 'Invoice Number',
      render: (value: unknown, invoice: Invoice) => (
        <Link 
          href={`/accounting/invoices/${invoice.id}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          {invoice.invoice_number}
        </Link>
      )
    },
    {
      key: 'customer_name' as keyof Invoice,
      title: 'Customer',
      render: (value: unknown, invoice: Invoice) => (
        <div>
          <div className="font-medium">{invoice.customer_name}</div>
          <div className="text-xs text-muted-foreground">{invoice.customer_email}</div>
        </div>
      )
    },
    {
      key: 'invoice_date' as keyof Invoice,
      title: 'Invoice Date',
      render: (value: unknown, invoice: Invoice) => (
        <div className="flex items-center space-x-2">
          <div>
            <div className="text-xs">{formatDate(invoice.invoice_date)}</div>
            <div className="text-xs text-muted-foreground">Due: {formatDate(invoice.due_date)}</div>
          </div>
        </div>
      )
    },
    {
      key: 'total_amount' as keyof Invoice,
      title: 'Amount',
      render: (value: unknown, invoice: Invoice) => (
        <div className="text-right">
          <div className="font-medium">{formatCurrency(invoice.total_amount)}</div>
          <div className="text-xs text-muted-foreground">{invoice.currency}</div>
        </div>
      )
    },
    {
      key: 'paid_amount' as keyof Invoice,
      title: 'Payment',
      render: (value: unknown, invoice: Invoice) => (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Paid:</span>
            <span className="font-medium text-green-600">{formatCurrency(invoice.paid_amount)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Due:</span>
            <span className={`font-medium ${invoice.balance_due > 0 ? 'text-red-600' : 'text-gray-500'}`}>
              {formatCurrency(invoice.balance_due)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${invoice.total_amount > 0 ? (invoice.paid_amount / invoice.total_amount) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      )
    },
    {
      key: 'status' as keyof Invoice,
      title: 'Status',
      render: (value: unknown, invoice: Invoice) => {
        const { variant, label } = getStatusBadge(invoice.status)
        return (
          <div className="flex items-center space-x-2">
            <Badge variant={variant}>{label}</Badge>
          </div>
        )
      }
    },
    {
      key: 'payment_status' as keyof Invoice,
      title: 'Payment Status',
      render: (value: unknown, invoice: Invoice) => {
        const { variant, label } = getPaymentStatusBadge(invoice.payment_status)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'id' as keyof Invoice,
      title: 'Actions',
      render: (value: unknown, invoice: Invoice) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              ...
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/accounting/invoices/${invoice.id}`} className="flex items-center">
                View Details
              </Link>
            </DropdownMenuItem>
            {invoice.status === 'draft' && (
              <DropdownMenuItem asChild>
                <Link href={`/accounting/invoices/${invoice.id}/edit`} className="flex items-center">
                  Edit Invoice
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              Download PDF
            </DropdownMenuItem>
            {(invoice.status === 'draft' || invoice.status === 'cancelled') && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  Delete Invoice
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  return (
    <TwoLevelLayout>
      <Header 
        title="Invoices"
        description="Manage customer invoices and track payments"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              Export
            </Button>
            <Button size="sm" asChild>
              <Link href="/accounting/invoices/new">
                New Invoice
              </Link>
            </Button>
          </div>
        }
      />
      
      <div className="flex-1 p-6 space-y-6">

        {/* Invoices Table */}
        <AdvancedDataTable
          data={filteredInvoices}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search invoices..."
          exportEnabled={true}
          pagination={{
            current: 1,
            pageSize: 10,
            total: filteredInvoices.length,
            onChange: () => {}
          }}
          onSearch={(filters) => {
            const filtered = invoices.filter(invoice => {
              if (filters.search) {
                const searchLower = filters.search.toLowerCase()
                return invoice.invoice_number.toLowerCase().includes(searchLower) ||
                       invoice.customer_name.toLowerCase().includes(searchLower)
              }
              return true
            })
            setFilteredInvoices(filtered)
          }}
        />

      </div>
    </TwoLevelLayout>
  )
}
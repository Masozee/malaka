'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { useToast } from '@/components/ui/toast'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowLeft01Icon,
  Search01Icon,
  PackageIcon,
  PlusSignIcon,
  Delete02Icon,
  MinusSignIcon,
  CreditCardIcon,
  Money01Icon,
  SmartPhone01Icon,
  Invoice01Icon,
  Loading01Icon
} from '@hugeicons/core-free-icons'

import Link from 'next/link'
import { articleService } from '@/services/masterdata'

// Helper to get full image URL
const getImageUrl = (objectKey: string | undefined): string => {
  if (!objectKey) return ''
  if (objectKey.startsWith('http://') || objectKey.startsWith('https://')) {
    return objectKey
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  return `${baseUrl}/api/v1/media/${objectKey}`
}
import { posTransactionService } from '@/services/sales'
import type { Article } from '@/types/masterdata'

// Cart item interface
interface CartItem {
  id: string
  article: Article
  quantity: number
  unit_price: number
  discount_percentage: number
  line_total: number
}

// Customer interface
interface Customer {
  id?: string
  name: string
  phone: string
  email?: string
  member_discount: number
}

// Default cashier ID (should come from auth context in production)
const DEFAULT_CASHIER_ID = '44444444-4444-4444-4444-444444444444'

export default function NewPOSTransactionPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [articles, setArticles] = useState<Article[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [barcodeInput, setBarcodeInput] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | 'mixed'>('cash')
  const [cashReceived, setCashReceived] = useState<number>(0)
  const [notes, setNotes] = useState('')
  const [taxRate] = useState(0.1) // 10% tax

  // Customer form states
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [showCustomerForm, setShowCustomerForm] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const response = await articleService.getAll({ limit: 100 })
      setArticles(response.data || [])
    } catch (error) {
      console.error('Error fetching articles:', error)
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load products'
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number): string => {
    if (!mounted) return ''
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const breadcrumbs = [
    { label: 'Sales', href: '/sales' },
    { label: 'Point of Sale', href: '/sales/pos' },
    { label: 'New Transaction', href: '/sales/pos/new' }
  ]

  // Filter articles based on search
  const filteredArticles = articles.filter(article =>
    article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Add article to cart
  const addToCart = (article: Article) => {
    const existingItem = cart.find(item => item.article.id === article.id)
    const price = article.price || 0

    if (existingItem) {
      updateQuantity(article.id, existingItem.quantity + 1)
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${article.id}`,
        article,
        quantity: 1,
        unit_price: price,
        discount_percentage: customer?.member_discount || 0,
        line_total: price * (1 - (customer?.member_discount || 0) / 100)
      }
      setCart([...cart, newItem])
    }
  }

  // Update quantity of item in cart
  const updateQuantity = (articleId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(articleId)
      return
    }

    setCart(cart.map(item => {
      if (item.article.id === articleId) {
        const line_total = item.unit_price * newQuantity * (1 - item.discount_percentage / 100)
        return { ...item, quantity: newQuantity, line_total }
      }
      return item
    }))
  }

  // Remove item from cart
  const removeFromCart = (articleId: string) => {
    setCart(cart.filter(item => item.article.id !== articleId))
  }

  // Apply discount to item
  const applyDiscount = (articleId: string, discountPercentage: number) => {
    setCart(cart.map(item => {
      if (item.article.id === articleId) {
        const line_total = item.unit_price * item.quantity * (1 - discountPercentage / 100)
        return { ...item, discount_percentage: discountPercentage, line_total }
      }
      return item
    }))
  }

  // Add customer
  const addCustomer = () => {
    if (customerName && customerPhone) {
      const newCustomer: Customer = {
        name: customerName,
        phone: customerPhone,
        member_discount: 5 // Default member discount
      }
      setCustomer(newCustomer)
      setShowCustomerForm(false)

      // Apply member discount to all cart items
      setCart(cart.map(item => ({
        ...item,
        discount_percentage: Math.max(item.discount_percentage, 5),
        line_total: item.unit_price * item.quantity * (1 - Math.max(item.discount_percentage, 5) / 100)
      })))
    }
  }

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
  const totalDiscount = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity * item.discount_percentage / 100), 0)
  const subtotalAfterDiscount = subtotal - totalDiscount
  const taxAmount = subtotalAfterDiscount * taxRate
  const totalAmount = subtotalAfterDiscount + taxAmount
  const changeAmount = paymentMethod === 'cash' ? Math.max(0, cashReceived - totalAmount) : 0

  // Handle barcode scan
  const handleBarcodeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const article = articles.find(a => a.barcode === barcodeInput || a.code === barcodeInput)
      if (article) {
        addToCart(article)
        setBarcodeInput('')
      } else {
        addToast({
          type: 'error',
          title: 'Product Not Found',
          description: `No product found with code: ${barcodeInput}`
        })
      }
    }
  }

  // Process payment
  const processPayment = async () => {
    if (cart.length === 0) return

    if (paymentMethod === 'cash' && cashReceived < totalAmount) {
      addToast({
        type: 'error',
        title: 'Insufficient Cash',
        description: 'The cash received is less than the total amount'
      })
      return
    }

    setSubmitting(true)

    try {
      // Create POS transaction request
      const request = {
        total_amount: totalAmount,
        payment_method: paymentMethod,
        cashier_id: DEFAULT_CASHIER_ID,
        items: cart.map(item => ({
          article_id: item.article.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.line_total
        }))
      }

      const result = await posTransactionService.create(request as unknown as Record<string, unknown>)

      addToast({
        type: 'success',
        title: 'Transaction Completed',
        description: `Transaction ${result.id.slice(0, 8)}... completed successfully`
      })

      // Reset form
      setCart([])
      setCustomer(null)
      setCustomerName('')
      setCustomerPhone('')
      setCashReceived(0)
      setNotes('')

      // Redirect to POS list
      router.push('/sales/pos')
    } catch (error) {
      console.error('Error creating transaction:', error)
      addToast({
        type: 'error',
        title: 'Transaction Failed',
        description: 'Failed to process transaction. Please try again.'
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <TwoLevelLayout>
      <div className="flex-1 space-y-6">
        <Header
          title="New POS Transaction"
          description="Process a new point of sale transaction"
          breadcrumbs={breadcrumbs}
          actions={
            <Button variant="outline" asChild>
              <Link href="/sales/pos">
                <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
                Back to POS
              </Link>
            </Button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          {/* Left Column - Product Selection (8/12) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Search Form - Outside Card */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search products by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-800"
                />
              </div>
              <div className="w-64">
                <Input
                  id="barcode"
                  placeholder="Scan barcode..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={handleBarcodeInput}
                  className="bg-white dark:bg-gray-800"
                />
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <HugeiconsIcon icon={Loading01Icon} className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading products...</span>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No products found
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto">
                {filteredArticles.map((article) => (
                  <Card
                    key={article.id}
                    role="button"
                    tabIndex={0}
                    className="overflow-hidden hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                    onClick={() => addToCart(article)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        addToCart(article)
                      }
                    }}
                    aria-label={`Add ${article.name} to cart`}
                  >
                    {/* Product Image */}
                    <div className="w-full aspect-square bg-gray-100 relative">
                      {/* Fallback icon - always rendered behind */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <HugeiconsIcon icon={PackageIcon} className="h-12 w-12 text-gray-400" />
                      </div>
                      {/* Image - rendered on top, hides fallback when loaded */}
                      {article.image_url && (
                        <img
                          src={getImageUrl(article.image_url)}
                          alt={article.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      )}
                    </div>
                    {/* Product Info */}
                    <div className="p-3">
                      <div className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">{article.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{article.code}</div>
                      <div className="text-sm font-semibold text-green-600 mt-2">
                        {formatCurrency(article.price || 0)}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Cart and Checkout (4/12) */}
          <div className="lg:col-span-4">
            <div className="space-y-4">
              {/* Customer Info */}
              <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Customer</Label>
                  {!customer && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCustomerForm(!showCustomerForm)}
                    >
                      <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  )}
                </div>

                {customer ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Name:</span>
                      <span className="text-sm font-medium">{customer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Phone:</span>
                      <span className="text-sm font-medium">{customer.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Member Discount:</span>
                      <Badge variant="secondary">{customer.member_discount}%</Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setCustomer(null)}
                      className="w-full"
                    >
                      Remove Customer
                    </Button>
                  </div>
                ) : showCustomerForm ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="customerName">Name</Label>
                      <Input
                        id="customerName"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Customer name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerPhone">Phone</Label>
                      <Input
                        id="customerPhone"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Customer phone"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={addCustomer}>Add Customer</Button>
                      <Button size="sm" variant="outline" onClick={() => setShowCustomerForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground text-sm">
                    Walk-in Customer
                  </div>
                )}
              </div>
            </Card>

            {/* Shopping Cart */}
            <Card className="p-4">
              <div className="space-y-4">
                <Label>Shopping Cart ({cart.length} items)</Label>

                {cart.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No items in cart
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{item.article.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.article.code}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.article.id)}
                            aria-label="Remove item from cart"
                          >
                            <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.article.id, item.quantity - 1)}
                              aria-label="Decrease quantity"
                            >
                              <HugeiconsIcon icon={MinusSignIcon} className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.article.id, item.quantity + 1)}
                              aria-label="Increase quantity"
                            >
                              <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">
                              {formatCurrency(item.line_total)}
                            </div>
                            {item.discount_percentage > 0 && (
                              <div className="text-xs text-red-600">
                                -{item.discount_percentage}% discount
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Discount Input */}
                        <div className="mt-2 flex items-center space-x-2">
                          <Label htmlFor={`discount-${item.id}`} className="text-xs">Discount %:</Label>
                          <Input
                            id={`discount-${item.id}`}
                            type="number"
                            value={item.discount_percentage}
                            onChange={(e) => applyDiscount(item.article.id, parseFloat(e.target.value) || 0)}
                            className="w-16 h-7 text-xs"
                            min="0"
                            max="100"
                            aria-label="Discount percentage"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Order Summary */}
            {cart.length > 0 && (
              <Card className="p-4">
                <div className="space-y-4">
                  <Label>Order Summary</Label>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Discount:</span>
                      <span>-{formatCurrency(totalDiscount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>After Discount:</span>
                      <span>{formatCurrency(subtotalAfterDiscount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (10%):</span>
                      <span>{formatCurrency(taxAmount)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span className="text-green-600">{formatCurrency(totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Payment Method */}
            {cart.length > 0 && (
              <Card className="p-4">
                <div className="space-y-4">
                  <Label>Payment Method</Label>

                  <Select value={paymentMethod} onValueChange={(value: 'cash' | 'card' | 'transfer' | 'mixed') => setPaymentMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">
                        <div className="flex items-center space-x-2">
                          <HugeiconsIcon icon={Money01Icon} className="h-4 w-4" />
                          <span>Cash</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="card">
                        <div className="flex items-center space-x-2">
                          <HugeiconsIcon icon={CreditCardIcon} className="h-4 w-4" />
                          <span>Credit/Debit Card</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="transfer">
                        <div className="flex items-center space-x-2">
                          <HugeiconsIcon icon={SmartPhone01Icon} className="h-4 w-4" />
                          <span>Bank Transfer</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="mixed">
                        <div className="flex items-center space-x-2">
                          <HugeiconsIcon icon={CreditCardIcon} className="h-4 w-4" />
                          <span>Mixed Payment</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {paymentMethod === 'cash' && (
                    <div className="space-y-2">
                      <Label htmlFor="cashReceived">Cash Received</Label>
                      <Input
                        id="cashReceived"
                        type="number"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                        placeholder="Enter cash amount"
                      />
                      {cashReceived > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Change:</span>
                          <span className="font-semibold">
                            {formatCurrency(changeAmount)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Transaction notes..."
                      rows={2}
                    />
                  </div>

                  <Button
                    onClick={processPayment}
                    className="w-full"
                    size="lg"
                    disabled={cart.length === 0 || (paymentMethod === 'cash' && cashReceived < totalAmount) || submitting}
                  >
                    {submitting ? (
                      <>
                        <HugeiconsIcon icon={Loading01Icon} className="h-5 w-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <HugeiconsIcon icon={Invoice01Icon} className="h-5 w-5 mr-2" />
                        Complete Transaction
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            )}
            </div>
          </div>
        </div>
      </div>
    </TwoLevelLayout>
  )
}

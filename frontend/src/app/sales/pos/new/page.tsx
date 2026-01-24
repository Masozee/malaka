'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'

import Link from 'next/link'

// Product interface for selection
interface Product {
  id: string
  code: string
  name: string
  size: string
  color: string
  price: number
  stock_quantity: number
  image_url?: string
}

// Cart item interface
interface CartItem {
  id: string
  product: Product
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

// Mock products data
const mockProducts: Product[] = [
  {
    id: '1',
    code: 'SHOE-001',
    name: 'Classic Oxford Brown',
    size: '42',
    color: 'Brown',
    price: 350000,
    stock_quantity: 15,
    image_url: '/images/products/oxford-brown.jpg'
  },
  {
    id: '2',
    code: 'SHOE-002',
    name: 'Sports Sneaker White',
    size: '40',
    color: 'White',
    price: 280000,
    stock_quantity: 23
  },
  {
    id: '3',
    code: 'BOOT-001',
    name: 'Work Boot Black',
    size: '38',
    color: 'Black',
    price: 450000,
    stock_quantity: 8
  },
  {
    id: '4',
    code: 'SANDAL-001',
    name: 'Summer Sandal Brown',
    size: '41',
    color: 'Brown',
    price: 180000,
    stock_quantity: 32
  },
  {
    id: '5',
    code: 'SHOE-003',
    name: 'Formal Loafer Black',
    size: '43',
    color: 'Black',
    price: 400000,
    stock_quantity: 12
  }
]

export default function NewPOSTransactionPage() {
  const [mounted, setMounted] = useState(false)
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
  }, [])

  const formatCurrency = (amount: number): string => {
    if (!mounted) return ''
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const breadcrumbs = [
    { label: 'Sales', href: '/sales' },
    { label: 'Point of Sale', href: '/sales/pos' },
    { label: 'New Transaction', href: '/sales/pos/new' }
  ]

  // Filter products based on search
  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.color.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Add product to cart
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id)
    
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1)
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${product.id}`,
        product,
        quantity: 1,
        unit_price: product.price,
        discount_percentage: customer?.member_discount || 0,
        line_total: product.price * (1 - (customer?.member_discount || 0) / 100)
      }
      setCart([...cart, newItem])
    }
  }

  // Update quantity of item in cart
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const line_total = item.unit_price * newQuantity * (1 - item.discount_percentage / 100)
        return { ...item, quantity: newQuantity, line_total }
      }
      return item
    }))
  }

  // Remove item from cart
  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId))
  }

  // Apply discount to item
  const applyDiscount = (productId: string, discountPercentage: number) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
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
      const product = mockProducts.find(p => p.code === barcodeInput)
      if (product) {
        addToCart(product)
        setBarcodeInput('')
      }
    }
  }

  // Process payment
  const processPayment = () => {
    if (cart.length === 0) return

    if (paymentMethod === 'cash' && cashReceived < totalAmount) {
      alert('Insufficient cash received')
      return
    }

    // Create transaction object
    const transaction = {
      transaction_number: `POS-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      cashier_name: 'Current User', // Should be from auth context
      customer: customer,
      items: cart,
      subtotal,
      tax_amount: taxAmount,
      discount_amount: totalDiscount,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      cash_received: paymentMethod === 'cash' ? cashReceived : undefined,
      change_amount: changeAmount,
      notes,
      status: 'completed'
    }

    console.log('Processing transaction:', transaction)
    
    // TODO: Send to API
    alert('Transaction completed successfully!')
    
    // Reset form
    setCart([])
    setCustomer(null)
    setCustomerName('')
    setCustomerPhone('')
    setCashReceived(0)
    setNotes('')
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
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to POS
              </Link>
            </Button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Product Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Barcode Scanner */}
            <Card className="p-4">
              <div className="flex items-center space-x-4">
                <ScanLine className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <Label htmlFor="barcode">Scan Barcode or Enter Product Code</Label>
                  <Input
                    id="barcode"
                    placeholder="Scan or type product barcode..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyDown={handleBarcodeInput}
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>

            {/* Product Search */}
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <MagnifyingGlass className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <Label htmlFor="search">Search Products</Label>
                    <Input
                      id="search"
                      placeholder="Search by name, code, or color..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => addToCart(product)}
                    >
                      <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{product.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {product.code} • {product.size} • {product.color}
                        </div>
                        <div className="text-sm font-semibold text-green-600">
                          {formatCurrency(product.price)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Stock: {product.stock_quantity}
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Cart and Checkout */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <Label>Customer</Label>
                  </div>
                  {!customer && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCustomerForm(!showCustomerForm)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
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
                      <Button size="sm" onClick={addCustomer}>Add</Button>
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
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                  <Label>Shopping Cart ({cart.length} items)</Label>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No items in cart
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{item.product.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.product.code} • {item.product.size} • {item.product.color}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
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
                          <Label className="text-xs">Discount %:</Label>
                          <Input
                            type="number"
                            value={item.discount_percentage}
                            onChange={(e) => applyDiscount(item.product.id, parseFloat(e.target.value) || 0)}
                            className="w-16 h-7 text-xs"
                            min="0"
                            max="100"
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
                  <div className="flex items-center space-x-2">
                    <Calculator className="h-5 w-5 text-muted-foreground" />
                    <Label>Order Summary</Label>
                  </div>

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
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <Label>Payment Method</Label>
                  </div>

                  <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">
                        <div className="flex items-center space-x-2">
                          <CurrencyDollar className="h-4 w-4" />
                          <span>Cash</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="card">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4" />
                          <span>Credit/Debit Card</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="transfer">
                        <div className="flex items-center space-x-2">
                          <Smartphone className="h-4 w-4" />
                          <span>Bank Transfer</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="mixed">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4" />
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
                    disabled={cart.length === 0 || (paymentMethod === 'cash' && cashReceived < totalAmount)}
                  >
                    <Receipt className="h-5 w-5 mr-2" />
                    Complete Transaction
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </TwoLevelLayout>
  )
}
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { salesService, Article, CreatePosTransactionRequest, DashboardStats, getImageUrl } from '../services/sales'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card } from '../components/ui/card'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Search01Icon,
  PackageIcon,
  PlusSignIcon,
  Delete02Icon,
  MinusSignIcon,
  Money01Icon,
  CreditCardIcon,
  SmartPhone01Icon,
  Loading01Icon,
  Invoice01Icon
} from '@hugeicons/core-free-icons'

interface CartItem {
  id: string
  article: Article
  quantity: number
  unit_price: number
  discount_percentage: number
  line_total: number
}

export default function POS() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [articles, setArticles] = useState<Article[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [barcodeInput, setBarcodeInput] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash')
  const [cashReceived, setCashReceived] = useState<number>(0)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [stats, setStats] = useState<DashboardStats>({
    total_transactions: 0,
    available_items: 0,
    cash_in_drawer: 0
  })

  const taxRate = 0.1 // 10% tax

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [articlesResponse, dashboardStats] = await Promise.all([
        salesService.getArticles({ limit: 100 }),
        salesService.getDashboardStats()
      ])
      setArticles(articlesResponse.data || [])
      setStats(dashboardStats)
    } catch (error) {
      console.error('Error fetching data:', error)
      setErrorMessage('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number): string => {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  // Filter articles based on search
  const filteredArticles = articles.filter(
    (article) =>
      article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Add article to cart
  const addToCart = (article: Article) => {
    const existingItem = cart.find((item) => item.article.id === article.id)
    const price = article.price || 0

    if (existingItem) {
      updateQuantity(article.id, existingItem.quantity + 1)
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${article.id}`,
        article,
        quantity: 1,
        unit_price: price,
        discount_percentage: 0,
        line_total: price
      }
      setCart([...cart, newItem])
    }
  }

  // Update quantity
  const updateQuantity = (articleId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(articleId)
      return
    }

    setCart(
      cart.map((item) => {
        if (item.article.id === articleId) {
          const line_total = item.unit_price * newQuantity * (1 - item.discount_percentage / 100)
          return { ...item, quantity: newQuantity, line_total }
        }
        return item
      })
    )
  }

  // Remove from cart
  const removeFromCart = (articleId: string) => {
    setCart(cart.filter((item) => item.article.id !== articleId))
  }

  // Handle barcode scan
  const handleBarcodeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const article = articles.find((a) => a.barcode === barcodeInput || a.code === barcodeInput)
      if (article) {
        addToCart(article)
        setBarcodeInput('')
      } else {
        setErrorMessage(`Product not found: ${barcodeInput}`)
        setTimeout(() => setErrorMessage(''), 3000)
      }
    }
  }

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  const totalDiscount = cart.reduce(
    (sum, item) => sum + (item.unit_price * item.quantity * item.discount_percentage) / 100,
    0
  )
  const subtotalAfterDiscount = subtotal - totalDiscount
  const taxAmount = subtotalAfterDiscount * taxRate
  const totalAmount = subtotalAfterDiscount + taxAmount
  const changeAmount = paymentMethod === 'cash' ? Math.max(0, cashReceived - totalAmount) : 0

  // Process payment
  const processPayment = async () => {
    if (cart.length === 0) return

    if (paymentMethod === 'cash' && cashReceived < totalAmount) {
      setErrorMessage('Insufficient cash received')
      setTimeout(() => setErrorMessage(''), 3000)
      return
    }

    setSubmitting(true)
    setErrorMessage('')

    try {
      const request: CreatePosTransactionRequest = {
        total_amount: totalAmount,
        payment_method: paymentMethod,
        cashier_id: user?.id || '',
        items: cart.map((item) => ({
          article_id: item.article.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.line_total
        }))
      }

      await salesService.createPosTransaction(request)

      setSuccessMessage('Transaction completed successfully!')
      setCart([])
      setCashReceived(0)

      // Refresh stats
      const newStats = await salesService.getDashboardStats()
      setStats(newStats)

      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error processing transaction:', error)
      setErrorMessage('Transaction failed. Please try again.')
      setTimeout(() => setErrorMessage(''), 3000)
    } finally {
      setSubmitting(false)
    }
  }

  // Clear cart
  const clearCart = () => {
    setCart([])
    setCashReceived(0)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      {(successMessage || errorMessage) && (
        <div className="px-6 pt-4">
          {successMessage && (
            <div className="p-3 text-sm bg-gray-100 rounded-lg">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="p-3 text-sm bg-gray-100 rounded-lg">
              {errorMessage}
            </div>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="px-6 pt-6">
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={CreditCardIcon} className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Transactions Today</p>
                <p className="text-xl font-bold">{stats.total_transactions}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={PackageIcon} className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Available Items</p>
                <p className="text-xl font-bold">{stats.available_items}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={Money01Icon} className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cash in Drawer</p>
                <p className="text-lg font-bold">{formatCurrency(stats.cash_in_drawer)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="grid grid-cols-12 gap-6 h-full">
          {/* Left Column - Products (8/12) */}
          <div className="col-span-8 flex flex-col space-y-4 h-full">
            {/* Search Bar */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <HugeiconsIcon
                  icon={Search01Icon}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                />
                <Input
                  placeholder="Search products by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
              <div className="w-64">
                <Input
                  placeholder="Scan barcode..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={handleBarcodeInput}
                  className="bg-white"
                />
              </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <HugeiconsIcon
                    icon={Loading01Icon}
                    className="h-8 w-8 animate-spin text-muted-foreground"
                  />
                  <span className="ml-2 text-muted-foreground">Loading products...</span>
                </div>
              ) : filteredArticles.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No products found
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  {filteredArticles.map((article) => (
                    <Card
                      key={article.id}
                      className="overflow-hidden hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => addToCart(article)}
                    >
                      <div className="w-full aspect-square bg-gray-100 relative">
                        {/* Fallback icon - always rendered behind */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <HugeiconsIcon icon={PackageIcon} className="h-12 w-12 text-gray-300" />
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
                      <div className="p-3">
                        <div className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">
                          {article.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{article.code}</div>
                        <div className="text-sm font-semibold mt-2">
                          {formatCurrency(article.price || 0)}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Cart (4/12) */}
          <div className="col-span-4 flex flex-col h-full">
            <Card className="flex-1 flex flex-col overflow-hidden">
              {/* Cart Header */}
              <div className="p-4 flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Shopping Cart ({cart.length} items)
                </Label>
                {cart.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearCart}>
                    Clear
                  </Button>
                )}
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-auto p-4 pt-0">
                {cart.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No items in cart
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{item.article.name}</div>
                            <div className="text-xs text-muted-foreground">{item.article.code}</div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.article.id)}
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
                            >
                              <HugeiconsIcon icon={MinusSignIcon} className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.article.id, item.quantity + 1)}
                            >
                              <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">
                              {formatCurrency(item.line_total)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Summary & Payment */}
              {cart.length > 0 && (
                <div className="p-4 space-y-4">
                  {/* Summary */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {totalDiscount > 0 && (
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>-{formatCurrency(totalDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Tax (10%):</span>
                      <span>{formatCurrency(taxAmount)}</span>
                    </div>
                    <div className="pt-2">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span>{formatCurrency(totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaymentMethod('cash')}
                      >
                        <HugeiconsIcon icon={Money01Icon} className="h-4 w-4 mr-1" />
                        Cash
                      </Button>
                      <Button
                        variant={paymentMethod === 'card' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaymentMethod('card')}
                      >
                        <HugeiconsIcon icon={CreditCardIcon} className="h-4 w-4 mr-1" />
                        Card
                      </Button>
                      <Button
                        variant={paymentMethod === 'transfer' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaymentMethod('transfer')}
                      >
                        <HugeiconsIcon icon={SmartPhone01Icon} className="h-4 w-4 mr-1" />
                        Transfer
                      </Button>
                    </div>
                  </div>

                  {/* Cash Input */}
                  {paymentMethod === 'cash' && (
                    <div className="space-y-2">
                      <Label htmlFor="cashReceived">Cash Received</Label>
                      <Input
                        id="cashReceived"
                        type="number"
                        value={cashReceived || ''}
                        onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                        placeholder="Enter cash amount"
                      />
                      {cashReceived > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Change:</span>
                          <span className="font-semibold">{formatCurrency(changeAmount)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Complete Button */}
                  <Button
                    onClick={processPayment}
                    className="w-full"
                    size="lg"
                    disabled={
                      cart.length === 0 ||
                      (paymentMethod === 'cash' && cashReceived < totalAmount) ||
                      submitting
                    }
                  >
                    {submitting ? (
                      <>
                        <HugeiconsIcon
                          icon={Loading01Icon}
                          className="h-5 w-5 mr-2 animate-spin"
                        />
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
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

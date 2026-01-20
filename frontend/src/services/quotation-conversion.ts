export interface ConversionOptions {
  includeDiscount?: boolean
  adjustPricing?: boolean
  notes?: string
  deliveryDate?: string
  paymentTerms?: string
}

export interface ConversionResult {
  success: boolean
  orderId?: string
  invoiceId?: string
  message: string
}

export class QuotationConversionService {
  /**
   * Convert quotation to sales order
   */
  static async convertToSalesOrder(
    quotationId: string, 
    options: ConversionOptions = {}
  ): Promise<ConversionResult> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Generate order number
      const orderNumber = `SO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`
      
      console.log('Converting quotation to sales order:', {
        quotationId,
        orderNumber,
        options
      })
      
      // TODO: Implement actual API call
      const response = {
        success: true,
        orderId: orderNumber,
        message: `Quotation successfully converted to Sales Order ${orderNumber}`
      }
      
      return response
    } catch (error) {
      console.error('Error converting quotation to sales order:', error)
      return {
        success: false,
        message: 'Failed to convert quotation to sales order. Please try again.'
      }
    }
  }

  /**
   * Convert quotation to invoice
   */
  static async convertToInvoice(
    quotationId: string, 
    options: ConversionOptions = {}
  ): Promise<ConversionResult> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Generate invoice number
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`
      
      console.log('Converting quotation to invoice:', {
        quotationId,
        invoiceNumber,
        options
      })
      
      // TODO: Implement actual API call
      const response = {
        success: true,
        invoiceId: invoiceNumber,
        message: `Quotation successfully converted to Invoice ${invoiceNumber}`
      }
      
      return response
    } catch (error) {
      console.error('Error converting quotation to invoice:', error)
      return {
        success: false,
        message: 'Failed to convert quotation to invoice. Please try again.'
      }
    }
  }

  /**
   * Bulk convert multiple quotations to sales orders
   */
  static async bulkConvertToSalesOrders(
    quotationIds: string[], 
    options: ConversionOptions = {}
  ): Promise<ConversionResult[]> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const results: ConversionResult[] = []
      
      for (const quotationId of quotationIds) {
        const orderNumber = `SO-${new Date().getFullYear()}-${String(Date.now() + Math.random() * 1000).slice(-4)}`
        
        results.push({
          success: true,
          orderId: orderNumber,
          message: `Quotation ${quotationId} converted to Sales Order ${orderNumber}`
        })
      }
      
      console.log('Bulk converting quotations to sales orders:', {
        quotationIds,
        results,
        options
      })
      
      return results
    } catch (error) {
      console.error('Error bulk converting quotations:', error)
      return quotationIds.map(id => ({
        success: false,
        message: `Failed to convert quotation ${id}`
      }))
    }
  }

  /**
   * Validate quotation for conversion
   */
  static validateForConversion(quotation: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Check quotation status
    if (!['approved', 'sent'].includes(quotation.status)) {
      errors.push('Quotation must be approved or sent to be converted')
    }
    
    // Check if quotation is expired
    if (new Date(quotation.valid_until) < new Date()) {
      errors.push('Cannot convert expired quotation')
    }
    
    // Check if quotation has items
    if (!quotation.items || quotation.items.length === 0) {
      errors.push('Quotation must have at least one item')
    }
    
    // Check customer information
    if (!quotation.customer_name || !quotation.customer_email) {
      errors.push('Customer information is incomplete')
    }
    
    // Check item details
    const invalidItems = quotation.items?.filter((item: any) => 
      !item.product_code || !item.product_name || item.quantity <= 0 || item.unit_price <= 0
    )
    
    if (invalidItems && invalidItems.length > 0) {
      errors.push('Some items have incomplete or invalid information')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}
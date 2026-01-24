'use client'

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  pdf,
  Font,
} from '@react-pdf/renderer'
import type { PurchaseOrder } from '@/types/procurement'

// Register fonts
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica.ttf' },
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica-Bold.ttf', fontWeight: 'bold' },
  ],
})

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    color: '#1a1a1a',
  },
  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000000',
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  metaLabel: {
    width: 100,
    fontSize: 10,
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    color: '#000000',
  },
  metaValue: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
  },
  logo: {
    width: 120, 
    height: 40,
    objectFit: 'contain',
    marginLeft: 20,
  },
  
  // Addresses
  addressContainer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  addressCol: {
    width: '50%',
    paddingRight: 20,
  },
  addressTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000000',
  },
  addressLine: {
    fontSize: 10,
    lineHeight: 1.4,
    color: '#333333',
  },

  // Hero Amount
  heroSection: {
    marginBottom: 30,
  },
  heroText: {
    fontSize: 16,
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    color: '#000000',
  },

  // Table
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontFamily: 'Helvetica', // Regular, not bold per reference image style which is quite clean
    color: '#666666',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableCell: {
    fontSize: 10,
    color: '#000000',
  },
  // Columns
  colDesc: { flex: 1 },
  colQty: { width: 50, textAlign: 'right' },
  colPrice: { width: 100, textAlign: 'right' },
  colTotal: { width: 100, textAlign: 'right' },

  // Totals
  totalsSection: {
    marginTop: 10,
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 20,
    marginBottom: 30,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 6,
    width: '50%',
  },
  totalLabel: {
    fontSize: 10,
    color: '#1a1a1a',
    marginRight: 20,
    width: 100,
    textAlign: 'left',
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
    width: 80,
    textAlign: 'right',
  },

  // Footer / Payment History Section
  footerSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000000',
  },
  paymentRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#000000',
    paddingTop: 8,
    marginTop: 8,
  },
  paymentHeader: {
    fontSize: 9,
    color: '#666666',
    flex: 1,
    paddingBottom: 4,
  },
  paymentCell: {
    fontSize: 10,
    color: '#000000',
    flex: 1,
  },
})

// Company info constant
const COMPANY_INFO = {
  name: 'Buffer, Inc', // Using Buffer as in reference for now, or Malaka default? User said "add OUR logo". I will stick to COMPANY_INFO from original code but mapped to reference style.
  // Actually, let's mix: Malaka content but reference layout.
  // Wait, the user said "design to be like this", not "content to be like this".
  // So I will use the ORIGINAL company info but strictly formatted like the image.
  addressLines: [
    '2443 Fillmore St #380-7163',
    'San Francisco, California 94115',
    'United States',
    'hello@buffer.com'
  ]
}

// Helper to format currency
const currency = (amount: number, curr: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: curr,
  }).format(amount)
}

// Helper for date
const dateStr = (d: string) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

interface Props {
  order: PurchaseOrder
}

export const PurchaseOrderDocument = ({ order }: Props) => {
  // Use a fallback or absolute URL for logo. 
  // In a real app, this should be an absolute URL or base64.
  // Assuming the app runs on localhost:3000 during dev.
  // For production, this would need a proper environment variable.
  const logoUrl = typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : '/logo.png'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Purchase Order</Text>
            
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Order number</Text>
              <Text style={styles.metaValue}>{order.po_number}</Text>
            </View>
             {/* Creating a receipt number equivalent if needed, else omit or reuse ID */}
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Reference ID</Text>
              <Text style={styles.metaValue}>{order.id.slice(0, 8).toUpperCase()}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Date</Text>
              <Text style={styles.metaValue}>{dateStr(order.order_date)}</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
             {/* Logo */}
             {/* Note: React-pdf Image src requires absolute path or base64 in some envs */}
             {/* We use the logoUrl derived above */}
             <Image src={logoUrl} style={styles.logo} />
          </View>
        </View>

        {/* Addresses */}
        <View style={styles.addressContainer}>
          <View style={styles.addressCol}>
            <Text style={styles.addressTitle}>Issuer</Text>
            <Text style={styles.addressLine}>PT Sepatu Nusantara</Text>
            <Text style={styles.addressLine}>Jl. Raya Industri No. 100</Text>
            <Text style={styles.addressLine}>Jakarta Timur 13920</Text>
            <Text style={styles.addressLine}>Indonesia</Text>
            <Text style={styles.addressLine}>procurement@malaka-erp.com</Text>
          </View>
          
          <View style={styles.addressCol}>
            <Text style={styles.addressTitle}>Bill to</Text>
            <Text style={styles.addressLine}>{order.supplier_name}</Text>
            {/* Split address string if possible or just display */}
            <Text style={styles.addressLine}>{order.delivery_address}</Text>
          </View>
        </View>

        {/* Hero Amount Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroText}>
            {currency(order.total_amount, order.currency)} due by {dateStr(order.expected_delivery_date || order.order_date)}
          </Text>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>Unit price</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Amount</Text>
          </View>

          {(order.items || []).map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <View style={styles.colDesc}>
                <Text style={styles.tableCell}>{item.item_name}</Text>
                {item.description && (
                  <Text style={[styles.tableCell, { fontSize: 9, color: '#666' }]}>{item.description}</Text>
                )}
              </View>
              <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.colPrice]}>
                {currency(item.unit_price, order.currency)}
              </Text>
              <Text style={[styles.tableCell, styles.colTotal]}>
                {currency(item.line_total, order.currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>
              {currency(order.subtotal, order.currency)}
            </Text>
          </View>
          
          {order.discount_amount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount</Text>
              <Text style={styles.totalValue}>
                -{currency(order.discount_amount, order.currency)}
              </Text>
            </View>
          )}

          {order.tax_amount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax</Text>
              <Text style={styles.totalValue}>
                {currency(order.tax_amount, order.currency)}
              </Text>
            </View>
          )}

          {order.shipping_cost > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Shipping</Text>
              <Text style={styles.totalValue}>
                {currency(order.shipping_cost, order.currency)}
              </Text>
            </View>
          )}

          <View style={[styles.totalRow, { marginTop: 4 }]}>
             {/* Using a bold/larger text for final total if desired, but reference keeps it clean */}
            <Text style={[styles.totalLabel, { fontWeight: 'bold', color: '#000' }]}>Total</Text>
            <Text style={[styles.totalValue, { fontWeight: 'bold' }]}>
              {currency(order.total_amount, order.currency)}
            </Text>
          </View>
          
          <View style={[styles.totalRow, { marginTop: 2 }]}>
            <Text style={[styles.totalLabel, { fontWeight: 'bold', color: '#000' }]}>Amount due</Text>
            <Text style={[styles.totalValue, { fontWeight: 'bold' }]}>
              {currency(order.total_amount, order.currency)}
            </Text>
          </View>
        </View>

        {/* Status / History (Pseudo "Payment history" section) */}
        <View style={styles.footerSection}>
          <Text style={styles.sectionTitle}>Order History</Text>
          
          <View style={[styles.paymentRow, { borderTopWidth: 1, borderBottomWidth: 0 }]}>
            <Text style={styles.paymentHeader}>Event</Text>
            <Text style={styles.paymentHeader}>Date</Text>
            <Text style={[styles.paymentHeader, { textAlign: 'right' }]}>Status</Text>
          </View>
          
          <View style={[styles.paymentRow, { borderTopWidth: 1, borderColor: '#eee' }]}>
             {/* Showing current status as the history entry for now since we don't have a full audit log in the prop */}
            <Text style={styles.paymentCell}>Order Created</Text>
             <Text style={styles.paymentCell}>{dateStr(order.created_at)}</Text>
             <Text style={[styles.paymentCell, { textAlign: 'right', textTransform: 'capitalize' }]}>{order.status}</Text>
          </View>
        </View>

      </Page>
    </Document>
  )
}

export const downloadPurchaseOrderPDF = async (order: PurchaseOrder) => {
  const blob = await pdf(<PurchaseOrderDocument order={order} />).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `PO-${order.po_number}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const printPurchaseOrderPDF = async (order: PurchaseOrder) => {
  const blob = await pdf(<PurchaseOrderDocument order={order} />).toBlob()
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
}

export default PurchaseOrderDocument


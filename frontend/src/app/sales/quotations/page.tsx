import QuotationsList, { Quotation } from './QuotationsList'

// Mock Data
const mockQuotations: Quotation[] = [
  {
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
  },
  {
    id: '2',
    quotation_number: 'QT-2024-002',
    quotation_date: '2024-07-25',
    customer_id: '2',
    customer_name: 'Fashion Store Bandung',
    customer_email: 'bandung@fashionstore.com',
    customer_phone: '08123456788',
    sales_person: 'Sari Sales',
    quotation_type: 'standard',
    delivery_address: 'Jl. Braga No. 456, Bandung, Jawa Barat 40111',
    items: [
      {
        id: '3',
        product_code: 'BOOT-001',
        product_name: 'Work Boot Black',
        size: '43',
        color: 'Black',
        quantity: 25,
        unit_price: 450000,
        discount_percentage: 5,
        line_total: 10687500
      }
    ],
    subtotal: 10687500,
    tax_amount: 1068750,
    discount_amount: 562500,
    shipping_cost: 100000,
    total_amount: 11293750,
    status: 'approved',
    priority: 'normal',
    payment_terms: 'Net 14',
    valid_until: '2024-08-08',
    notes: 'Special collection quotation',
    created_at: '2024-07-25T10:15:00Z',
    updated_at: '2024-07-25T11:00:00Z'
  },
  {
    id: '3',
    quotation_number: 'QT-2024-003',
    quotation_date: '2024-07-24',
    customer_id: '3',
    customer_name: 'Distributor Surabaya',
    customer_email: 'surabaya@distributor.com',
    customer_phone: '08123456787',
    sales_person: 'Budi Sales',
    quotation_type: 'bulk',
    delivery_address: 'Jl. Tunjungan No. 789, Surabaya, Jawa Timur 60261',
    items: [
      {
        id: '4',
        product_code: 'SANDAL-001',
        product_name: 'Summer Sandal Brown',
        size: 'Mixed',
        color: 'Brown',
        quantity: 100,
        unit_price: 150000,
        discount_percentage: 15,
        line_total: 12750000
      },
      {
        id: '5',
        product_code: 'SHOE-003',
        product_name: 'Formal Loafer Black',
        size: 'Mixed',
        color: 'Black',
        quantity: 40,
        unit_price: 400000,
        discount_percentage: 15,
        line_total: 13600000
      }
    ],
    subtotal: 26350000,
    tax_amount: 2635000,
    discount_amount: 4650000,
    shipping_cost: 200000,
    total_amount: 24535000,
    status: 'converted',
    priority: 'normal',
    payment_terms: 'Net 45',
    valid_until: '2024-08-28',
    created_at: '2024-07-24T13:20:00Z',
    updated_at: '2024-07-25T09:45:00Z'
  },
  {
    id: '4',
    quotation_number: 'QT-2024-004',
    quotation_date: '2024-07-24',
    customer_id: '4',
    customer_name: 'Export Partner Singapore',
    customer_email: 'singapore@exportpartner.com',
    customer_phone: '+65987654321',
    sales_person: 'Rina Sales',
    quotation_type: 'export',
    delivery_address: '123 Orchard Road, Singapore 238857',
    items: [
      {
        id: '6',
        product_code: 'SHOE-004',
        product_name: 'High Heel Red',
        size: 'Mixed',
        color: 'Red',
        quantity: 200,
        unit_price: 320000,
        discount_percentage: 20,
        line_total: 51200000
      }
    ],
    subtotal: 51200000,
    tax_amount: 0,
    discount_amount: 12800000,
    shipping_cost: 500000,
    total_amount: 38900000,
    status: 'reviewed',
    priority: 'urgent',
    payment_terms: 'Prepaid',
    valid_until: '2024-07-30',
    notes: 'Export quotation - tax free, include all export documents',
    created_at: '2024-07-24T08:00:00Z',
    updated_at: '2024-07-24T16:30:00Z'
  },
  {
    id: '5',
    quotation_number: 'QT-2024-005',
    quotation_date: '2024-07-23',
    customer_id: '5',
    customer_name: 'Mall Department Store',
    customer_email: 'mall@department.com',
    customer_phone: '08123456785',
    sales_person: 'Dedi Sales',
    quotation_type: 'bulk',
    delivery_address: 'Mall Central, Lt. 2, Jakarta Selatan, DKI Jakarta 12560',
    items: [
      {
        id: '7',
        product_code: 'SHOE-MIX',
        product_name: 'Mixed Shoe Collection',
        size: 'Mixed',
        color: 'Mixed',
        quantity: 150,
        unit_price: 250000,
        discount_percentage: 12,
        line_total: 33000000
      }
    ],
    subtotal: 33000000,
    tax_amount: 3300000,
    discount_amount: 4500000,
    shipping_cost: 250000,
    total_amount: 32050000,
    status: 'expired',
    priority: 'normal',
    payment_terms: 'Net 21',
    valid_until: '2024-07-20',
    created_at: '2024-07-23T11:30:00Z',
    updated_at: '2024-07-25T10:00:00Z'
  },
  {
    id: '6',
    quotation_number: 'QT-2024-006',
    quotation_date: '2024-07-23',
    customer_id: '6',
    customer_name: 'Startup Fashion Co',
    customer_email: 'startup@fashion.com',
    customer_phone: '08123456784',
    sales_person: 'Lisa Sales',
    quotation_type: 'custom',
    delivery_address: 'Jl. Startup No. 111, Yogyakarta, DI Yogyakarta 55141',
    items: [
      {
        id: '8',
        product_code: 'SHOE-005',
        product_name: 'Casual Sneaker Blue',
        size: 'Mixed',
        color: 'Blue',
        quantity: 15,
        unit_price: 300000,
        discount_percentage: 0,
        line_total: 4500000
      }
    ],
    subtotal: 4500000,
    tax_amount: 450000,
    discount_amount: 0,
    shipping_cost: 75000,
    total_amount: 5025000,
    status: 'rejected',
    priority: 'low',
    payment_terms: 'Net 7',
    valid_until: '2024-07-30',
    notes: 'Rejected due to pricing concerns',
    created_at: '2024-07-23T15:45:00Z',
    updated_at: '2024-July-23T16:00:00Z'
  }
]

export default function QuotationsPage() {
  return <QuotationsList initialData={mockQuotations} />
}
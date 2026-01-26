import DirectSalesList, { DirectSale } from './DirectSalesList'

// Mock Data (based on previous file content but simplified)
const mockDirectSales: DirectSale[] = [
  {
    id: '1',
    sale_number: 'DS-2024-001',
    sale_date: '2024-07-25',
    sales_person: 'Ahmad Direct',
    customer_name: 'Budi Wijaya',
    customer_phone: '08123456789',
    visit_type: 'home_visit',
    location: 'Jakarta Pusat',
    items: [
      {
        id: '1',
        product_name: 'Classic Oxford Brown',
        quantity: 1,
        line_total: 315000
      },
      {
        id: '2',
        product_name: 'Leather Belt Brown',
        quantity: 1,
        line_total: 108000
      }
    ],
    total_amount: 418300,
    commission_amount: 20915,
    commission_rate: 5,
    payment_status: 'paid',
    delivery_status: 'delivered',
    created_at: '2024-07-25T10:30:00Z',
  },
  {
    id: '2',
    sale_number: 'DS-2024-002',
    sale_date: '2024-07-25',
    sales_person: 'Sari Direct',
    customer_name: 'Rina Sari',
    customer_phone: '08123456788',
    visit_type: 'showroom',
    location: 'Showroom Jakarta',
    items: [
      {
        id: '3',
        product_name: 'Sports Sneaker White',
        quantity: 2,
        line_total: 476000
      }
    ],
    total_amount: 439600,
    commission_amount: 30772,
    commission_rate: 7,
    payment_status: 'paid',
    delivery_status: 'delivered',
    created_at: '2024-07-25T14:15:00Z',
  },
  {
    id: '3',
    sale_number: 'DS-2024-003',
    sale_date: '2024-07-25',
    sales_person: 'Budi Direct',
    customer_name: 'Dedi Santoso',
    customer_phone: '08123456787',
    visit_type: 'office_visit',
    location: 'Office Building Jakarta Selatan',
    items: [
      {
        id: '4',
        product_name: 'Work Boot Black',
        quantity: 3,
        line_total: 1282500
      }
    ],
    total_amount: 1343250,
    commission_amount: 80595,
    commission_rate: 6,
    payment_status: 'pending',
    delivery_status: 'pending',
    created_at: '2024-07-25T11:00:00Z',
  },
  {
    id: '4',
    sale_number: 'DS-2024-004',
    sale_date: '2024-07-24',
    sales_person: 'Rina Direct',
    customer_name: 'Lisa Dewi',
    customer_phone: '08123456786',
    visit_type: 'exhibition',
    location: 'Fashion Expo Jakarta',
    items: [
      {
        id: '5',
        product_name: 'Formal Loafer Black',
        quantity: 1,
        line_total: 320000
      },
      {
        id: '6',
        product_name: 'High Heel Red',
        quantity: 1,
        line_total: 256000
      }
    ],
    total_amount: 489600,
    commission_amount: 39168,
    commission_rate: 8,
    payment_status: 'partial',
    delivery_status: 'delivered',
    created_at: '2024-07-24T13:20:00Z',
  },
  {
    id: '5',
    sale_number: 'DS-2024-005',
    sale_date: '2024-07-24',
    sales_person: 'Dedi Direct',
    customer_name: 'Ahmad Putra',
    customer_phone: '08123456785',
    visit_type: 'home_visit',
    location: 'Bekasi',
    items: [
      {
        id: '7',
        product_name: 'Summer Sandal Brown',
        quantity: 2,
        line_total: 360000
      }
    ],
    total_amount: 396000,
    commission_amount: 19800,
    commission_rate: 5,
    payment_status: 'paid',
    delivery_status: 'delivered',
    created_at: '2024-07-24T16:10:00Z',
  },
  {
    id: '6',
    sale_number: 'DS-2024-006',
    sale_date: '2024-07-23',
    sales_person: 'Lisa Direct',
    customer_name: 'Santi Wulandari',
    customer_phone: '08123456784',
    visit_type: 'home_visit',
    location: 'Depok',
    items: [
      {
        id: '8',
        product_name: 'Casual Sneaker Blue',
        quantity: 1,
        line_total: 300000
      }
    ],
    total_amount: 330000,
    commission_amount: 0,
    commission_rate: 5,
    payment_status: 'failed',
    delivery_status: 'cancelled',
    created_at: '2024-07-23T15:45:00Z',
  }
]

export default function DirectSalesPage() {
  return <DirectSalesList initialData={mockDirectSales} />
}
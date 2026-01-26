import OnlineSalesList, { OnlineSale } from './OnlineSalesList'

// Mock Data
const mockOnlineSales: OnlineSale[] = [
  {
    id: '1',
    order_number: 'ON-2024-001',
    order_date: '2024-07-25',
    platform: 'website',
    platform_name: 'Official Website',
    customer_name: 'Ahmad Rizki',
    customer_email: 'ahmad.rizki@email.com',
    items_count: 2,
    total_amount: 544500,
    payment_status: 'paid',
    order_status: 'shipped',
    created_at: '2024-07-25T08:30:00Z',
  },
  {
    id: '2',
    order_number: 'ON-2024-002',
    order_date: '2024-07-25',
    platform: 'marketplace',
    platform_name: 'Tokopedia',
    customer_name: 'Siti Nurhaliza',
    customer_email: 'siti.nur@email.com',
    items_count: 1,
    total_amount: 518200,
    payment_status: 'paid',
    order_status: 'processing',
    created_at: '2024-07-25T09:15:00Z',
  },
  {
    id: '3',
    order_number: 'ON-2024-003',
    order_date: '2024-07-25',
    platform: 'marketplace',
    platform_name: 'Shopee',
    customer_name: 'Budi Santoso',
    customer_email: 'budi.santoso@email.com',
    items_count: 1,
    total_amount: 519200,
    payment_status: 'pending',
    order_status: 'confirmed',
    created_at: '2024-07-25T11:00:00Z',
  },
  {
    id: '4',
    order_number: 'ON-2024-004',
    order_date: '2024-07-24',
    platform: 'social_media',
    platform_name: 'Instagram',
    customer_name: 'Rina Dewi',
    customer_email: 'rina.dewi@email.com',
    items_count: 2,
    total_amount: 619800,
    payment_status: 'paid',
    order_status: 'delivered',
    created_at: '2024-07-24T13:20:00Z',
  },
  {
    id: '5',
    order_number: 'ON-2024-005',
    order_date: '2024-07-24',
    platform: 'mobile_app',
    platform_name: 'Mobile App',
    customer_name: 'Dedi Susanto',
    customer_email: 'dedi.susanto@email.com',
    items_count: 1,
    total_amount: 374000,
    payment_status: 'failed',
    order_status: 'cancelled',
    created_at: '2024-07-24T16:10:00Z',
  }
]

export default function OnlineSalesPage() {
  return <OnlineSalesList initialData={mockOnlineSales} />
}
import ReturnsList, { Return } from './ReturnsList'

// Mock Data
const mockReturns: Return[] = [
  {
    id: '1',
    return_number: 'RET-2024-001',
    return_date: '2024-07-25',
    original_transaction: 'POS-2024-001',
    customer_name: 'Budi Santoso',
    customer_phone: '08123456789',
    customer_email: 'budi@email.com',
    return_type: 'wrong_size',
    return_reason: 'Ukuran terlalu kecil, ingin tukar dengan ukuran 43',
    processed_by: 'Sari Admin',
    items: [
      {
        id: '1',
        product_code: 'SHOE-001',
        product_name: 'Classic Oxford Brown',
        size: '42',
        color: 'Brown',
        quantity: 1,
        unit_price: 350000,
        line_total: 350000,
        condition: 'good'
      }
    ],
    subtotal: 350000,
    refund_amount: 0,
    refund_method: 'exchange',
    status: 'approved',
    approval_date: '2024-07-25',
    notes: 'Exchange dengan ukuran 43, selisih harga dibayar customer',
    created_at: '2024-07-25T09:30:00Z',
    updated_at: '2024-07-25T10:15:00Z'
  },
  {
    id: '2',
    return_number: 'RET-2024-002',
    return_date: '2024-07-25',
    original_transaction: 'ON-2024-001',
    customer_name: 'Rina Dewi',
    customer_phone: '08123456788',
    customer_email: 'rina@email.com',
    return_type: 'defective',
    return_reason: 'Sol sepatu lepas setelah dipakai 2 hari',
    processed_by: 'Ahmad Admin',
    items: [
      {
        id: '2',
        product_code: 'SHOE-002',
        product_name: 'Sports Sneaker White',
        size: '38',
        color: 'White',
        quantity: 1,
        unit_price: 280000,
        line_total: 280000,
        condition: 'defective'
      }
    ],
    subtotal: 280000,
    refund_amount: 280000,
    refund_method: 'transfer',
    status: 'completed',
    approval_date: '2024-07-25',
    refund_date: '2024-07-25',
    notes: 'Produk defect, full refund disetujui',
    created_at: '2024-07-25T11:20:00Z',
    updated_at: '2024-07-25T14:30:00Z'
  },
  {
    id: '3',
    return_number: 'RET-2024-003',
    return_date: '2024-07-24',
    original_transaction: 'DS-2024-001',
    customer_name: 'Dedi Susanto',
    customer_phone: '08123456787',
    return_type: 'customer_change',
    return_reason: 'Berubah pikiran, tidak jadi beli',
    processed_by: 'Lisa Admin',
    items: [
      {
        id: '3',
        product_code: 'BOOT-001',
        product_name: 'Work Boot Black',
        size: '43',
        color: 'Black',
        quantity: 1,
        unit_price: 450000,
        line_total: 450000,
        condition: 'good'
      }
    ],
    subtotal: 450000,
    refund_amount: 427500,
    refund_method: 'cash',
    status: 'pending',
    notes: 'Dikurangi biaya restocking 5% = Rp 22,500',
    created_at: '2024-07-24T15:45:00Z',
    updated_at: '2024-07-24T15:45:00Z'
  },
  {
    id: '4',
    return_number: 'RET-2024-004',
    return_date: '2024-07-24',
    original_transaction: 'SO-2024-001',
    customer_name: 'Siti Nurhaliza',
    customer_phone: '08123456786',
    customer_email: 'siti@email.com',
    return_type: 'damaged',
    return_reason: 'Barang rusak saat pengiriman, kardus basah',
    processed_by: 'Budi Admin',
    items: [
      {
        id: '4',
        product_code: 'SHOE-003',
        product_name: 'Formal Loafer Black',
        size: '37',
        color: 'Black',
        quantity: 2,
        unit_price: 400000,
        line_total: 800000,
        condition: 'damaged'
      }
    ],
    subtotal: 800000,
    refund_amount: 800000,
    refund_method: 'store_credit',
    status: 'approved',
    approval_date: '2024-07-24',
    notes: 'Rusak saat pengiriman, customer pilih store credit',
    created_at: '2024-07-24T13:10:00Z',
    updated_at: '2024-07-24T16:20:00Z'
  },
  {
    id: '5',
    return_number: 'RET-2024-005',
    return_date: '2024-07-23',
    original_transaction: 'POS-2024-005',
    customer_name: 'Ahmad Putra',
    customer_phone: '08123456785',
    return_type: 'wrong_color',
    return_reason: 'Salah ambil warna, ingin yang coklat',
    processed_by: 'Rina Admin',
    items: [
      {
        id: '5',
        product_code: 'SANDAL-001',
        product_name: 'Summer Sandal Brown',
        size: '41',
        color: 'Black',
        quantity: 1,
        unit_price: 180000,
        line_total: 180000,
        condition: 'good'
      }
    ],
    subtotal: 180000,
    refund_amount: 0,
    refund_method: 'exchange',
    status: 'completed',
    approval_date: '2024-07-23',
    refund_date: '2024-07-23',
    notes: 'Exchange dengan warna coklat, no charge',
    created_at: '2024-07-23T10:30:00Z',
    updated_at: '2024-07-23T11:00:00Z'
  },
  {
    id: '6',
    return_number: 'RET-2024-006',
    return_date: '2024-07-23',
    original_transaction: 'ON-2024-003',
    customer_name: 'Lisa Wati',
    customer_phone: '08123456784',
    customer_email: 'lisa@email.com',
    return_type: 'other',
    return_reason: 'Tidak sesuai ekspektasi dari foto online',
    processed_by: 'Dedi Admin',
    items: [
      {
        id: '6',
        product_code: 'SHOE-004',
        product_name: 'High Heel Red',
        size: '38',
        color: 'Red',
        quantity: 1,
        unit_price: 320000,
        line_total: 320000,
        condition: 'good'
      }
    ],
    subtotal: 320000,
    refund_amount: 288000,
    refund_method: 'card',
    status: 'rejected',
    notes: 'Sudah lebih dari 7 hari, return ditolak',
    created_at: '2024-07-23T08:15:00Z',
    updated_at: '2024-07-23T09:00:00Z'
  }
]

export default function ReturnsPage() {
  return <ReturnsList initialData={mockReturns} />
}
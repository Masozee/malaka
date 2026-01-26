'use client'

import GoodsReceiptList from './GoodsReceiptList'
import { GoodsReceipt } from '@/services/inventory'

const mockReceiptData: GoodsReceipt[] = [
  {
    id: '1',
    purchase_order_id: 'PO-2024-001',
    receiptNumber: 'GR-2024-001',
    receipt_date: '2024-07-20',
    warehouse_id: 'WH-01',
    warehouse: 'Main Warehouse',
    supplierName: 'PT Sepatu Nusantara',
    poNumber: 'PO-2024-001',
    status: 'completed',
    totalItems: 50,
    totalAmount: 22500000,
    receivedBy: 'John Doe',
    created_at: '2024-07-20T10:00:00Z'
  },
  {
    id: '2',
    purchase_order_id: 'PO-2024-005',
    receiptNumber: 'GR-2024-002',
    receipt_date: '2024-07-21',
    warehouse_id: 'WH-02',
    warehouse: 'East Branch',
    supplierName: 'CV Kulit Berkualitas',
    poNumber: 'PO-2024-005',
    status: 'pending',
    totalItems: 200,
    totalAmount: 15400000,
    receivedBy: '-',
    created_at: '2024-07-21T09:30:00Z'
  },
  {
    id: '3',
    purchase_order_id: 'PO-2024-008',
    receiptNumber: 'GR-2024-003',
    receipt_date: '2024-07-22',
    warehouse_id: 'WH-01',
    warehouse: 'Main Warehouse',
    supplierName: 'UD Bahan Jaya',
    poNumber: 'PO-2024-008',
    status: 'approved',
    totalItems: 15,
    totalAmount: 4500000,
    receivedBy: 'Jane Smith',
    created_at: '2024-07-22T08:45:00Z'
  }
]

export default function GoodsReceiptPage() {
  return <GoodsReceiptList initialData={mockReceiptData} />
}
'use client'

import GoodsIssueList from './GoodsIssueList'
import { GoodsIssue } from '@/services/inventory'

// Mimicking the display interface
interface GoodsIssueDisplay extends GoodsIssue {
  customerName?: string
  orderNumber?: string
  requestedDate?: string
  issuedBy?: string
  warehouse?: string
  issueType?: 'sales_order' | 'transfer' | 'return' | 'adjustment'
  notes?: string
}

const mockIssues: GoodsIssueDisplay[] = [
  {
    id: '1',
    issueNumber: 'GI-2024-001',
    customerName: 'PT Sukses Makmur',
    orderNumber: 'SO-2024-101',
    requestedDate: '2024-07-25',
    issuedBy: 'John Doe',
    warehouse: 'Main Warehouse',
    issueType: 'sales_order',
    status: 'completed',
    totalItems: 150,
    issueDate: '2024-07-25',
    items: []
  },
  {
    id: '2',
    issueNumber: 'GI-2024-002',
    customerName: 'CV Maju Jaya',
    orderNumber: 'SO-2024-102',
    requestedDate: '2024-07-26',
    issuedBy: 'Jane Smith',
    warehouse: 'East Branch',
    issueType: 'sales_order',
    status: 'pending',
    totalItems: 80,
    issueDate: '',
    items: []
  },
  {
    id: '3',
    issueNumber: 'GI-2024-003',
    customerName: 'Internal Transfer',
    orderNumber: 'TR-2024-005',
    requestedDate: '2024-07-26',
    issuedBy: 'Mike Johnson',
    warehouse: 'Main Warehouse',
    issueType: 'transfer',
    status: 'approved',
    totalItems: 200,
    issueDate: '',
    items: []
  }
]

export default function GoodsIssuePage() {
  return <GoodsIssueList initialData={mockIssues} />
}
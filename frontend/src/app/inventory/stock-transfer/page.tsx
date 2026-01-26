'use client'

import React, { useEffect, useState } from 'react'
import StockTransferList from './StockTransferList'
import { StockTransfer, stockTransferService } from '@/services/inventory'

// Mimicking the display interface
interface StockTransferDisplay extends StockTransfer {
  transfer_number?: string
  transfer_type?: 'warehouse_to_warehouse' | 'warehouse_to_store' | 'store_to_store' | 'return_to_warehouse'
  from_location?: string
  to_location?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  total_quantity?: number
  estimated_value?: number
}

export default function StockTransferPage() {
  const [data, setData] = useState<StockTransferDisplay[]>([])
  const [loading, setLoading] = useState(true) // You might want to pass this to StockTransferList if it supported it

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await stockTransferService.getAll()

        // Transform data
        const transformedData: StockTransferDisplay[] = response.data.map(item => ({
          ...item,
          transfer_number: item.transferNumber,
          from_location: item.fromWarehouse,
          to_location: item.toWarehouse,
          transfer_type: 'warehouse_to_warehouse', // Default or derive
          priority: 'medium', // Default or derive
          total_quantity: item.items?.reduce((sum, i) => sum + i.quantity, 0) || 0,
          estimated_value: 0 // Backend might not provide this
        }))

        setData(transformedData)
      } catch (error) {
        console.error('Failed to fetch transfers:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="p-6">Loading transfers...</div>
  }

  return <StockTransferList initialData={data} />
}
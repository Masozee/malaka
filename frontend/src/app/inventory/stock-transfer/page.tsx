'use client'

import React, { useEffect, useState } from 'react'
import StockTransferList from './StockTransferList'
import { StockTransfer, stockTransferService } from '@/services/inventory'

export default function StockTransferPage() {
  const [data, setData] = useState<StockTransfer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await stockTransferService.getAll()
        setData(response.data)
      } catch (error) {
        console.error('Failed to fetch transfers:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return <StockTransferList data={data} loading={loading} />
}

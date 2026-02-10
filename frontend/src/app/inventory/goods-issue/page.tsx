'use client'

import React, { useEffect, useState } from 'react'
import GoodsIssueList from './GoodsIssueList'
import { GoodsIssue, goodsIssueService } from '@/services/inventory'

export default function GoodsIssuePage() {
  const [data, setData] = useState<GoodsIssue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await goodsIssueService.getAll()
        setData(response.data)
      } catch (error) {
        console.error('Failed to fetch goods issues:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return <GoodsIssueList data={data} loading={loading} />
}

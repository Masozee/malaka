import { useState, useCallback } from 'react'

export interface PaginationState {
  current: number
  pageSize: number
  total: number
}

export function usePagination(initialPageSize = 10) {
  const [pagination, setPagination] = useState<PaginationState>({
    current: 1,
    pageSize: initialPageSize,
    total: 0
  })

  const setTotal = useCallback((total: number) => {
    setPagination(prev => ({ ...prev, total }))
  }, [])

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, current: page }))
  }, [])

  const setPageSize = useCallback((pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, current: 1 }))
  }, [])

  const handlePageChange = useCallback((page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }))
  }, [])

  const reset = useCallback(() => {
    setPagination(prev => ({ ...prev, current: 1 }))
  }, [])

  return {
    pagination,
    setTotal,
    setPage,
    setPageSize,
    handlePageChange,
    reset
  }
}
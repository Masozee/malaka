"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { sizeService } from "@/services/masterdata"
import { queryKeys } from "@/lib/query-client"
import type { Size, MasterDataFilters, SizeListResponse } from "@/types/masterdata"

interface UseSizesOptions {
  page?: number
  limit?: number
  search?: string
  enabled?: boolean
}

export function useSizes(options: UseSizesOptions = {}) {
  const { page = 1, limit = 10, search, enabled = true } = options

  return useQuery({
    queryKey: queryKeys.masterData.sizes.list({ page, limit, search }),
    queryFn: async (): Promise<SizeListResponse> => {
      const filters: MasterDataFilters = { page, limit, search }
      return sizeService.getAll(filters)
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useSize(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.masterData.sizes.detail(id || ""),
    queryFn: async (): Promise<Size> => {
      if (!id) throw new Error("Size ID is required")
      return sizeService.getById(id)
    },
    enabled: Boolean(id),
  })
}

export function useCreateSize() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Size>) => {
      return sizeService.create({ data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.masterData.sizes.all })
    },
  })
}

export function useUpdateSize() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Size> }) => {
      return sizeService.update(id, { data })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.masterData.sizes.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.masterData.sizes.all })
    },
  })
}

export function useDeleteSize() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return sizeService.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.masterData.sizes.all })
    },
  })
}

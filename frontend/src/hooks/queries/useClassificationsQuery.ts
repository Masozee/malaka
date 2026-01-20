"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { classificationService } from "@/services/masterdata"
import { queryKeys } from "@/lib/query-client"
import type { Classification, MasterDataFilters, ClassificationListResponse } from "@/types/masterdata"

interface UseClassificationsOptions {
  page?: number
  limit?: number
  search?: string
  enabled?: boolean
}

export function useClassifications(options: UseClassificationsOptions = {}) {
  const { page = 1, limit = 10, search, enabled = true } = options

  return useQuery({
    queryKey: queryKeys.masterData.classifications.list({ page, limit, search }),
    queryFn: async (): Promise<ClassificationListResponse> => {
      const filters: MasterDataFilters = { page, limit, search }
      return classificationService.getAll(filters)
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useClassification(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.masterData.classifications.detail(id || ""),
    queryFn: async (): Promise<Classification> => {
      if (!id) throw new Error("Classification ID is required")
      return classificationService.getById(id)
    },
    enabled: Boolean(id),
  })
}

export function useCreateClassification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Classification>) => {
      return classificationService.create({ data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.masterData.classifications.all })
    },
  })
}

export function useUpdateClassification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Classification> }) => {
      return classificationService.update(id, { data })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.masterData.classifications.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.masterData.classifications.all })
    },
  })
}

export function useDeleteClassification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return classificationService.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.masterData.classifications.all })
    },
  })
}

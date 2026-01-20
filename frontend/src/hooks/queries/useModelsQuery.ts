"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { modelService } from "@/services/masterdata"
import { queryKeys } from "@/lib/query-client"
import type { Model, MasterDataFilters, ModelListResponse } from "@/types/masterdata"

interface UseModelsOptions {
  page?: number
  limit?: number
  search?: string
  enabled?: boolean
}

export function useModels(options: UseModelsOptions = {}) {
  const { page = 1, limit = 10, search, enabled = true } = options

  return useQuery({
    queryKey: queryKeys.masterData.models.list({ page, limit, search }),
    queryFn: async (): Promise<ModelListResponse> => {
      const filters: MasterDataFilters = { page, limit, search }
      return modelService.getAll(filters)
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useModel(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.masterData.models.detail(id || ""),
    queryFn: async (): Promise<Model> => {
      if (!id) throw new Error("Model ID is required")
      return modelService.getById(id)
    },
    enabled: Boolean(id),
  })
}

export function useCreateModel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Model>) => {
      return modelService.create({ data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.masterData.models.all })
    },
  })
}

export function useUpdateModel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Model> }) => {
      return modelService.update(id, { data })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.masterData.models.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.masterData.models.all })
    },
  })
}

export function useDeleteModel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return modelService.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.masterData.models.all })
    },
  })
}

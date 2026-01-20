"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { colorService } from "@/services/masterdata"
import { queryKeys } from "@/lib/query-client"
import type { Color, MasterDataFilters, ColorListResponse } from "@/types/masterdata"

/**
 * TanStack Query Hooks for Colors
 *
 * Provides:
 * - useColors() - Fetch paginated list of colors
 * - useColor(id) - Fetch single color by ID
 * - useCreateColor() - Mutation for creating a new color
 * - useUpdateColor() - Mutation for updating an existing color
 * - useDeleteColor() - Mutation for deleting a color
 */

interface UseColorsOptions {
  page?: number
  limit?: number
  search?: string
  enabled?: boolean
}

/**
 * Fetch paginated list of colors
 */
export function useColors(options: UseColorsOptions = {}) {
  const { page = 1, limit = 10, search, enabled = true } = options

  return useQuery({
    queryKey: queryKeys.masterData.colors.list({ page, limit, search }),
    queryFn: async (): Promise<ColorListResponse> => {
      const filters: MasterDataFilters = {
        page,
        limit,
        search,
      }
      return colorService.getAll(filters)
    },
    enabled,
    // Colors don't change often - use longer stale time
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch single color by ID
 */
export function useColor(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.masterData.colors.detail(id || ""),
    queryFn: async (): Promise<Color> => {
      if (!id) throw new Error("Color ID is required")
      return colorService.getById(id)
    },
    enabled: Boolean(id),
  })
}

/**
 * Create a new color
 */
export function useCreateColor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Color>) => {
      return colorService.create({ data })
    },
    onSuccess: () => {
      // Invalidate all color queries to refetch data
      queryClient.invalidateQueries({
        queryKey: queryKeys.masterData.colors.all,
      })
    },
  })
}

/**
 * Update an existing color
 */
export function useUpdateColor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Color> }) => {
      return colorService.update(id, { data })
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific color detail query
      queryClient.invalidateQueries({
        queryKey: queryKeys.masterData.colors.detail(variables.id),
      })
      // Invalidate list queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.masterData.colors.all,
      })
    },
  })
}

/**
 * Delete a color
 */
export function useDeleteColor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return colorService.delete(id)
    },
    onSuccess: () => {
      // Invalidate all color queries to refetch data
      queryClient.invalidateQueries({
        queryKey: queryKeys.masterData.colors.all,
      })
    },
  })
}

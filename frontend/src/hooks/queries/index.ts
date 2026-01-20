/**
 * TanStack Query Hooks
 *
 * Export all query hooks for easy importing.
 * Usage: import { useColors, useCreateColor } from "@/hooks/queries"
 */

// Colors
export {
  useColors,
  useColor,
  useCreateColor,
  useUpdateColor,
  useDeleteColor,
} from "./useColorsQuery"

// Models
export {
  useModels,
  useModel,
  useCreateModel,
  useUpdateModel,
  useDeleteModel,
} from "./useModelsQuery"

// Sizes
export {
  useSizes,
  useSize,
  useCreateSize,
  useUpdateSize,
  useDeleteSize,
} from "./useSizesQuery"

// Classifications
export {
  useClassifications,
  useClassification,
  useCreateClassification,
  useUpdateClassification,
  useDeleteClassification,
} from "./useClassificationsQuery"

// Query Keys (re-export for convenience)
export { queryKeys } from "@/lib/query-client"

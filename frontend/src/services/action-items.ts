import { apiClient, type ApiResponse } from '@/lib/api'

export type ActionItemsData = Record<string, Record<string, number>>

export async function getActionItems(): Promise<ActionItemsData> {
  const response = await apiClient.get<ApiResponse<ActionItemsData>>('/api/v1/action-items', undefined, { cache: false })
  return response.data
}

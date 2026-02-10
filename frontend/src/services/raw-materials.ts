import { apiClient } from '@/lib/api'
import type { RawMaterial, RawMaterialFilters, RawMaterialFormData } from '@/types/raw-materials'

export interface RawMaterialListResponse {
  data: RawMaterial[]
  total: number
  page: number
  limit: number
}

class RawMaterialService {
  private baseUrl = '/api/v1/inventory/raw-materials'

  async getAll(filters?: RawMaterialFilters): Promise<RawMaterialListResponse> {
    try {
      const response = await apiClient.get<{
        success: boolean
        data: RawMaterial[]
      }>(this.baseUrl, filters as Record<string, unknown>)

      const data = response.data || []
      return {
        data,
        total: data.length,
        page: 1,
        limit: data.length,
      }
    } catch (error) {
      console.error('Error fetching raw materials:', error)
      return { data: [], total: 0, page: 1, limit: 0 }
    }
  }

  async getById(id: string): Promise<RawMaterial> {
    const response = await apiClient.get<{ success: boolean; data: RawMaterial }>(
      `${this.baseUrl}/${id}`
    )
    return response.data
  }

  async create(data: RawMaterialFormData): Promise<RawMaterial> {
    const response = await apiClient.post<{ success: boolean; data: RawMaterial }>(
      this.baseUrl,
      data
    )
    return response.data
  }

  async update(id: string, data: Partial<RawMaterialFormData>): Promise<RawMaterial> {
    const response = await apiClient.put<{ success: boolean; data: RawMaterial }>(
      `${this.baseUrl}/${id}`,
      data
    )
    return response.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete<{ success: boolean }>(`${this.baseUrl}/${id}`)
  }
}

export const rawMaterialService = new RawMaterialService()
export type { RawMaterial, RawMaterialFilters, RawMaterialFormData }

import { BaseMasterDataService } from './masterdata';
import { apiClient } from '@/lib/api';
import type { RawMaterial, RawMaterialFilters, RawMaterialFormData, RawMaterialMovement } from '@/types/raw-materials';

// Response type for raw materials list
export interface RawMaterialListResponse {
  data: RawMaterial[];
  total: number;
  page: number;
  limit: number;
}

class RawMaterialService extends BaseMasterDataService<RawMaterial, RawMaterialListResponse> {
  constructor() {
    super('raw-materials');
  }

  async getMovements(materialId: string): Promise<RawMaterialMovement[]> {
    try {
      const response = await apiClient.get<{success: boolean, message: string, data: RawMaterialMovement[]}>(`/api/v1/inventory/raw-materials/${materialId}/movements/`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching material movements:', error);
      throw error;
    }
  }

  async addStock(materialId: string, data: {
    quantity: number;
    unitCost?: number;
    location: string;
    batchNumber?: string;
    expiryDate?: string;
    notes?: string;
  }): Promise<RawMaterial> {
    try {
      const response = await apiClient.post<{success: boolean, message: string, data: RawMaterial}>(`/api/v1/inventory/raw-materials/${materialId}/add-stock/`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error adding stock:', error);
      throw error;
    }
  }

  async adjustStock(materialId: string, data: {
    quantity: number;
    adjustmentType: 'increase' | 'decrease';
    reason: string;
    location: string;
    notes?: string;
  }): Promise<RawMaterial> {
    try {
      const response = await apiClient.post<{success: boolean, message: string, data: RawMaterial}>(`/api/v1/inventory/raw-materials/${materialId}/adjust-stock/`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error adjusting stock:', error);
      throw error;
    }
  }

  async transferStock(materialId: string, data: {
    quantity: number;
    fromLocation: string;
    toLocation: string;
    notes?: string;
  }): Promise<RawMaterial> {
    try {
      const response = await apiClient.post<{success: boolean, message: string, data: RawMaterial}>(`/api/v1/inventory/raw-materials/${materialId}/transfer-stock/`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error transferring stock:', error);
      throw error;
    }
  }

  async getLowStockMaterials(): Promise<RawMaterial[]> {
    try {
      const response = await apiClient.get<{success: boolean, message: string, data: RawMaterial[]}>(`/api/v1/inventory/raw-materials/low-stock/`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching low stock materials:', error);
      throw error;
    }
  }

  async getExpiringMaterials(days: number = 30): Promise<RawMaterial[]> {
    try {
      const response = await apiClient.get<{success: boolean, message: string, data: RawMaterial[]}>(`/api/v1/inventory/raw-materials/expiring/`, { days });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching expiring materials:', error);
      throw error;
    }
  }

  // Mock data for development
  private getMockData(): RawMaterial[] {
    return [
      {
        id: '1',
        materialCode: 'LEATHER-001',
        materialName: 'Premium Cowhide Leather Black',
        description: 'High-quality full-grain cowhide leather for premium shoe uppers',
        category: 'leather',
        unit: 'sq ft',
        currentStock: 245,
        minStock: 50,
        maxStock: 500,
        unitCost: 85000,
        totalValue: 20825000,
        supplier: 'PT Kulit Berkualitas',
        supplierCode: 'SUP-001',
        leadTime: 14,
        status: 'in_stock',
        location: 'WH-A-01',
        batchNumber: 'BTH-2024-001',
        expiryDate: '2026-12-31',
        lastUpdated: '2024-01-28T10:30:00Z',
        createdAt: '2024-01-15T08:00:00Z',
        updatedAt: '2024-01-28T10:30:00Z'
      },
      {
        id: '2',
        materialCode: 'SOLE-001',
        materialName: 'Rubber Sole Unit White',
        description: 'Durable rubber sole units for athletic footwear',
        category: 'sole',
        unit: 'pairs',
        currentStock: 1850,
        minStock: 200,
        maxStock: 3000,
        unitCost: 45000,
        totalValue: 83250000,
        supplier: 'CV Sole Indonesia',
        supplierCode: 'SUP-007',
        leadTime: 7,
        status: 'in_stock',
        location: 'WH-B-02',
        batchNumber: 'SOL-2024-003',
        lastUpdated: '2024-01-27T14:15:00Z',
        createdAt: '2024-01-10T09:30:00Z',
        updatedAt: '2024-01-27T14:15:00Z'
      },
      {
        id: '3',
        materialCode: 'THREAD-001',
        materialName: 'Polyester Thread Brown 40/2',
        description: 'High-strength polyester sewing thread for shoe construction',
        category: 'thread',
        unit: 'cone',
        currentStock: 25,
        minStock: 50,
        maxStock: 200,
        unitCost: 35000,
        totalValue: 875000,
        supplier: 'PT Benang Kuat',
        supplierCode: 'SUP-012',
        leadTime: 5,
        status: 'low_stock',
        location: 'WH-C-01',
        batchNumber: 'THR-2024-002',
        lastUpdated: '2024-01-26T09:45:00Z',
        createdAt: '2024-01-08T11:20:00Z',
        updatedAt: '2024-01-26T09:45:00Z'
      },
      {
        id: '4',
        materialCode: 'ADH-001',
        materialName: 'Shoe Adhesive PU-Based',
        description: 'Polyurethane-based adhesive for sole attachment',
        category: 'adhesive',
        unit: 'kg',
        currentStock: 0,
        minStock: 10,
        maxStock: 50,
        unitCost: 125000,
        totalValue: 0,
        supplier: 'Adhesive Solutions Ltd',
        supplierCode: 'SUP-015',
        leadTime: 10,
        status: 'out_of_stock',
        location: 'WH-D-01',
        batchNumber: 'ADH-2024-001',
        expiryDate: '2025-06-30',
        lastUpdated: '2024-01-25T16:20:00Z',
        createdAt: '2024-01-05T10:00:00Z',
        updatedAt: '2024-01-25T16:20:00Z'
      },
      {
        id: '5',
        materialCode: 'HW-001',
        materialName: 'Metal Eyelets Silver 6mm',
        description: 'Stainless steel eyelets for shoe lacing systems',
        category: 'hardware',
        unit: 'pcs',
        currentStock: 5000,
        minStock: 1000,
        maxStock: 10000,
        unitCost: 750,
        totalValue: 3750000,
        supplier: 'Hardware Supply Co',
        supplierCode: 'SUP-003',
        leadTime: 3,
        status: 'in_stock',
        location: 'WH-E-01',
        batchNumber: 'HW-2024-005',
        lastUpdated: '2024-01-24T12:00:00Z',
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-24T12:00:00Z'
      },
      {
        id: '6',
        materialCode: 'FAB-001',
        materialName: 'Canvas Fabric Navy Blue',
        description: 'Heavy-duty canvas fabric for casual shoe uppers',
        category: 'fabric',
        unit: 'meters',
        currentStock: 180,
        minStock: 100,
        maxStock: 500,
        unitCost: 65000,
        totalValue: 11700000,
        supplier: 'Textile Mills Indonesia',
        supplierCode: 'SUP-009',
        leadTime: 12,
        status: 'in_stock',
        location: 'WH-F-01',
        batchNumber: 'FAB-2024-002',
        lastUpdated: '2024-01-23T08:30:00Z',
        createdAt: '2023-12-20T14:00:00Z',
        updatedAt: '2024-01-23T08:30:00Z'
      }
    ];
  }

  // Override getAll to use mock data for now
  async getAll(filters?: RawMaterialFilters): Promise<RawMaterialListResponse> {
    try {
      // For now, return mock data
      const mockData = this.getMockData();
      let filteredData = mockData;

      // Apply filters
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        filteredData = filteredData.filter(item =>
          item.materialName.toLowerCase().includes(search) ||
          item.materialCode.toLowerCase().includes(search) ||
          item.supplier.toLowerCase().includes(search)
        );
      }

      if (filters?.category && filters.category !== 'all') {
        filteredData = filteredData.filter(item => item.category === filters.category);
      }

      if (filters?.status && filters.status !== 'all') {
        filteredData = filteredData.filter(item => item.status === filters.status);
      }

      if (filters?.supplier) {
        filteredData = filteredData.filter(item => 
          item.supplier.toLowerCase().includes(filters.supplier!.toLowerCase())
        );
      }

      if (filters?.location) {
        filteredData = filteredData.filter(item => 
          item.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }

      return {
        data: filteredData,
        total: filteredData.length,
        page: 1,
        limit: filteredData.length
      };
    } catch (error) {
      console.error('Error fetching raw materials:', error);
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 0
      };
    }
  }
}

export const rawMaterialService = new RawMaterialService();
export type { RawMaterial, RawMaterialFilters, RawMaterialFormData };
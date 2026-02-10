export interface RawMaterial {
  id: string;
  materialCode: string;
  materialName: string;
  description?: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitCost: number;
  totalValue: number;
  supplier: string;
  supplierId?: string;
  leadTime: number;
  status: RawMaterialStatus;
  location: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RawMaterialCategory = string;

export type RawMaterialStatus = 
  | 'in_stock'
  | 'low_stock'
  | 'out_of_stock'
  | 'on_order'
  | 'expired'
  | 'quality_hold';

export interface RawMaterialFilters {
  search?: string;
  category?: RawMaterialCategory | 'all';
  status?: RawMaterialStatus | 'all';
  supplier?: string;
  location?: string;
  page?: number;
  limit?: number;
}

export interface RawMaterialFormData {
  materialCode: string;
  materialName: string;
  description?: string;
  category: string;
  unit: string;
  minStock: number;
  maxStock: number;
  unitCost: number;
  supplierId?: string;
  leadTime: number;
  location: string;
}

export interface RawMaterialMovement {
  id: string;
  materialId: string;
  movementType: 'receipt' | 'issue' | 'transfer' | 'adjustment';
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  fromLocation?: string;
  toLocation?: string;
  referenceNumber?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface RawMaterialStock {
  materialId: string;
  location: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lastMovement: string;
}
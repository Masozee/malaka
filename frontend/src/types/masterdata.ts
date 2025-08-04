/**
 * Master Data TypeScript Interfaces
 * Generated from backend Go entities for type safety
 */

export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

// Company
export interface Company extends BaseEntity {
  name: string
  address?: string
  phone?: string
  email?: string
  website?: string
  tax_id?: string
  description?: string
  logo_url?: string
  status: 'active' | 'inactive'
}

// User
export interface User extends BaseEntity {
  username: string
  email: string
  full_name: string
  phone?: string
  role: 'admin' | 'manager' | 'user'
  company_id: string
  status: 'active' | 'inactive'
  last_login?: string
}

// Classification
export interface Classification extends BaseEntity {
  code: string
  name: string
  description?: string
  parent_id?: string
  status: 'active' | 'inactive'
}

// Color
export interface Color extends BaseEntity {
  name: string
  code: string
  hex_code?: string
  description?: string
  status: 'active' | 'inactive'
}

// Article (Main product entity)
export interface Article extends BaseEntity {
  name: string
  description?: string
  classification_id: string
  color_id: string
  model_id: string
  size_id: string
  supplier_id: string
  barcode?: string
  price: number
  image_url?: string
  image_urls?: string[]
  thumbnail_url?: string
  
  // Relations
  classification?: Classification
  colors?: Color[]
  models?: Model[]
  sizes?: Size[]
  prices?: Price[]
  gallery_images?: GalleryImage[]
}

// Model
export interface Model extends BaseEntity {
  code: string
  name: string
  description?: string
  article_id?: string
  status: 'active' | 'inactive'
}

// Size
export interface Size extends BaseEntity {
  code: string
  name: string
  description?: string
  size_category?: 'shoe' | 'clothing' | 'accessory'
  sort_order?: number
  status: 'active' | 'inactive'
}

// Barcode
export interface Barcode extends BaseEntity {
  barcode: string
  article_id: string
  color_id?: string
  size_id?: string
  model_id?: string
  status: 'active' | 'inactive'
  
  // Relations
  article?: Article
  color?: Color
  size?: Size
  model?: Model
}

// Price
export interface Price extends BaseEntity {
  article_id: string
  price_type: 'retail' | 'wholesale' | 'cost' | 'special'
  amount: number
  currency: string
  effective_date: string
  end_date?: string
  status: 'active' | 'inactive'
  
  // Relations
  article?: Article
}

// Gallery Image
export interface GalleryImage extends BaseEntity {
  article_id: string
  image_url: string
  image_path: string
  alt_text?: string
  is_primary: boolean
  sort_order?: number
  status: 'active' | 'inactive'
  
  // Relations
  article?: Article
}

// Supplier
export interface Supplier extends BaseEntity {
  code: string
  name: string
  contact_person?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  tax_id?: string
  payment_terms?: string
  credit_limit?: number
  status: 'active' | 'inactive'
}

// Customer
export interface Customer extends BaseEntity {
  name: string
  contact_person?: string
  email?: string
  phone?: string
  company_id: string
  status: 'active' | 'inactive'
}

// Warehouse
export interface Warehouse extends BaseEntity {
  code: string
  name: string
  address?: string
  phone?: string
  manager_name?: string
  warehouse_type: 'main' | 'branch' | 'transit'
  capacity?: number
  status: 'active' | 'inactive'
}

// Courier (for shipping)
export interface Courier extends BaseEntity {
  code: string
  name: string
  contact_person?: string
  phone?: string
  email?: string
  website?: string
  service_type: 'standard' | 'express' | 'overnight'
  status: 'active' | 'inactive'
}

// Courier Rate
export interface CourierRate extends BaseEntity {
  courier_id: string
  origin: string
  destination: string
  service_type: string
  weight_min: number
  weight_max: number
  rate_per_kg: number
  base_rate: number
  currency: string
  effective_date: string
  end_date?: string
  status: 'active' | 'inactive'
  
  // Relations
  courier?: Courier
}

// Department Store
export interface Depstore extends BaseEntity {
  code: string
  name: string
  address?: string
  city?: string
  phone?: string
  contact_person?: string
  commission_rate?: number
  payment_terms?: string
  status: 'active' | 'inactive'
}

// Division
export interface Division extends BaseEntity {
  code: string
  name: string
  description?: string
  parent_id?: string
  level: number
  sort_order?: number
  status: 'active' | 'inactive'
  
  // Relations
  parent?: Division
  children?: Division[]
}

// Common interfaces for forms and API responses
export interface CreateRequest<T> {
  data: Omit<T, keyof BaseEntity>
}

export interface UpdateRequest<T> {
  data: Partial<Omit<T, keyof BaseEntity>>
}

export interface ListResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

// Search and filter types
export interface MasterDataFilters {
  search?: string
  status?: 'active' | 'inactive' | 'all'
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  [key: string]: unknown
}

// API Response types for each entity
export type CompanyListResponse = ListResponse<Company>
export type UserListResponse = ListResponse<User>
export type ClassificationListResponse = ListResponse<Classification>
export type ColorListResponse = ListResponse<Color>
export type ArticleListResponse = ListResponse<Article>
export type ModelListResponse = ListResponse<Model>
export type SizeListResponse = ListResponse<Size>
export type BarcodeListResponse = ListResponse<Barcode>
export type PriceListResponse = ListResponse<Price>
export type GalleryImageListResponse = ListResponse<GalleryImage>
export type SupplierListResponse = ListResponse<Supplier>
export type CustomerListResponse = ListResponse<Customer>
export type WarehouseListResponse = ListResponse<Warehouse>
export type CourierListResponse = ListResponse<Courier>
export type CourierRateListResponse = ListResponse<CourierRate>
export type DepstoreListResponse = ListResponse<Depstore>
export type DivisionListResponse = ListResponse<Division>
/**
 * Master Data API Services
 * Type-safe API calls for all Master Data endpoints
 */

import { apiClient } from '@/lib/api'
import type {
  Company, User, Classification, Color, Article, Model, Size, Barcode,
  Price, GalleryImage, Supplier, Customer, Warehouse, Courier,
  CourierRate, Depstore, Division,
  MasterDataFilters, CreateRequest, UpdateRequest,
  CompanyListResponse, UserListResponse, ClassificationListResponse,
  ColorListResponse, ArticleListResponse, ModelListResponse,
  SizeListResponse, BarcodeListResponse, PriceListResponse,
  GalleryImageListResponse, SupplierListResponse, CustomerListResponse,
  WarehouseListResponse, CourierListResponse, CourierRateListResponse,
  DepstoreListResponse, DivisionListResponse
} from '@/types/masterdata'

// Base CRUD service class
export abstract class BaseMasterDataService<T, ListResponseType> {
  protected endpoint: string

  constructor(endpoint: string) {
    this.endpoint = endpoint
  }

  async getAll(filters?: MasterDataFilters, token?: string): Promise<ListResponseType> {
    const response = await apiClient.get<{
      success: boolean,
      message: string,
      data: T[] | {
        data: T[],
        pagination: {
          page: number,
          limit: number,
          total_rows: number,
          total_pages: number
        }
      }
    }>(`/api/v1/masterdata/${this.endpoint}/`, filters, { token })

    // Handle both old format (direct array) and new paginated format
    if (Array.isArray(response.data)) {
      // Old format - direct array
      return {
        data: response.data || [],
        total: response.data?.length || 0,
        page: 1,
        limit: response.data?.length || 0
      } as ListResponseType
    } else {
      // New paginated format
      const paginatedData = response.data as {
        data: T[],
        pagination: {
          page: number,
          limit: number,
          total_rows: number,
          total_pages: number
        }
      }
      return {
        data: paginatedData.data || [],
        total: paginatedData.pagination.total_rows || 0,
        page: paginatedData.pagination.page || 1,
        limit: paginatedData.pagination.limit || 10
      } as ListResponseType
    }
  }

  async getById(id: string): Promise<T> {
    const response = await apiClient.get<{ success: boolean, message: string, data: T }>(`/api/v1/masterdata/${this.endpoint}/${id}`)
    return response.data
  }

  async create(request: CreateRequest<T>): Promise<T> {
    const response = await apiClient.post<{ success: boolean, message: string, data: T }>(`/api/v1/masterdata/${this.endpoint}/`, request.data)
    return response.data
  }

  async update(id: string, request: UpdateRequest<T>): Promise<T> {
    const response = await apiClient.put<{ success: boolean, message: string, data: T }>(`/api/v1/masterdata/${this.endpoint}/${id}`, request.data)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete<{ success: boolean, message: string }>(`/api/v1/masterdata/${this.endpoint}/${id}`)
  }
}

// Company Service
class CompanyService extends BaseMasterDataService<Company, CompanyListResponse> {
  constructor() {
    super('companies')
  }
}

// User Service
class UserService extends BaseMasterDataService<User, UserListResponse> {
  constructor() {
    super('users')
  }

  async login(credentials: { username: string; password: string }) {
    return apiClient.post<{ token: string; user: User }>('/api/v1/masterdata/users/login', credentials)
  }
}

// Classification Service
class ClassificationService extends BaseMasterDataService<Classification, ClassificationListResponse> {
  constructor() {
    super('classifications')
  }
}

// Color Service
class ColorService extends BaseMasterDataService<Color, ColorListResponse> {
  constructor() {
    super('colors')
  }
}

// Article Service
class ArticleService extends BaseMasterDataService<Article, ArticleListResponse> {
  constructor() {
    super('articles')
  }

  async search(query: string): Promise<ArticleListResponse> {
    const response = await apiClient.get<{ success: boolean, message: string, data: Article[] }>(`/api/v1/masterdata/${this.endpoint}/search/`, { q: query })
    return {
      data: response.data || [],
      total: response.data?.length || 0,
      page: 1,
      limit: response.data?.length || 0
    }
  }

  async uploadImages(articleId: string, files: FileList): Promise<{
    success: boolean
    message: string
    data: {
      uploaded_images: string[]
      success_count: number
      total_files: number
      article: Article
      errors?: string[]
      error_count?: number
    }
  }> {
    const formData = new FormData()

    // Add each file to the form data
    Array.from(files).forEach((file, index) => {
      formData.append('images', file)
    })

    const response = await apiClient.post(
      `/api/v1/masterdata/${this.endpoint}/${articleId}/images/`,
      formData
      // Note: Don't set Content-Type header for FormData - let browser set it automatically with boundary
    )

    return response
  }

  async deleteImage(articleId: string, imageUrl: string): Promise<{
    success: boolean
    message: string
    data: {
      deleted_image: string
      article: Article
    }
  }> {
    const response = await apiClient.delete(
      `/api/v1/masterdata/${this.endpoint}/${articleId}/images/?image_url=${encodeURIComponent(imageUrl)}`
    )

    return response
  }

  getImageUrl(objectKey: string): string {
    // Return the download URL for an image
    return `http://localhost:8084/api/v1/storage/download/${objectKey}`
  }
}

// Model Service
class ModelService extends BaseMasterDataService<Model, ModelListResponse> {
  constructor() {
    super('models')
  }
}

// Size Service
class SizeService extends BaseMasterDataService<Size, SizeListResponse> {
  constructor() {
    super('sizes')
  }
}

// Barcode Service
class BarcodeService extends BaseMasterDataService<Barcode, BarcodeListResponse> {
  constructor() {
    super('barcodes')
  }
}

// Price Service
class PriceService extends BaseMasterDataService<Price, PriceListResponse> {
  constructor() {
    super('prices')
  }

  async getPricesByArticle(articleId: string): Promise<PriceListResponse> {
    return apiClient.get<PriceListResponse>(`/api/v1/masterdata/${this.endpoint}/article/${articleId}`)
  }
}

// Gallery Image Service
class GalleryImageService extends BaseMasterDataService<GalleryImage, GalleryImageListResponse> {
  constructor() {
    super('gallery-images')
  }

  async getImagesByArticle(articleId: string): Promise<GalleryImageListResponse> {
    return apiClient.get<GalleryImageListResponse>(`/api/v1/masterdata/${this.endpoint}/article/${articleId}`)
  }

  async uploadImage(file: File, articleId: string): Promise<GalleryImage> {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('article_id', articleId)

    const response = await fetch(`${apiClient['baseURL']}/api/v1/masterdata/${this.endpoint}`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }
}

// Supplier Service
class SupplierService extends BaseMasterDataService<Supplier, SupplierListResponse> {
  constructor() {
    super('suppliers')
  }
}

// Customer Service
class CustomerService extends BaseMasterDataService<Customer, CustomerListResponse> {
  constructor() {
    super('customers')
  }
}

// Warehouse Service
class WarehouseService extends BaseMasterDataService<Warehouse, WarehouseListResponse> {
  constructor() {
    super('warehouses')
  }
}

// Courier Service
class CourierService extends BaseMasterDataService<Courier, CourierListResponse> {
  constructor() {
    super('couriers')
  }
}

// Courier Rate Service
class CourierRateService extends BaseMasterDataService<CourierRate, CourierRateListResponse> {
  constructor() {
    super('courier-rates')
  }

  async calculateShippingCost(params: {
    origin: string
    destination: string
    weight: number
    service_type?: string
  }): Promise<{ cost: number; currency: string }> {
    return apiClient.get<{ cost: number; currency: string }>(`/api/v1/masterdata/${this.endpoint}/calculate`, params)
  }
}

// Department Store Service
class DepstoreService extends BaseMasterDataService<Depstore, DepstoreListResponse> {
  constructor() {
    super('depstores')
  }

  async getByCode(code: string): Promise<Depstore> {
    return apiClient.get<Depstore>(`/api/v1/masterdata/${this.endpoint}/code/${code}`)
  }
}

// Division Service
class DivisionService extends BaseMasterDataService<Division, DivisionListResponse> {
  constructor() {
    super('divisions')
  }

  async getByCode(code: string): Promise<Division> {
    return apiClient.get<Division>(`/api/v1/masterdata/${this.endpoint}/code/${code}`)
  }

  async getByParent(parentId: string): Promise<DivisionListResponse> {
    return apiClient.get<DivisionListResponse>(`/api/v1/masterdata/${this.endpoint}/parent/${parentId}`)
  }

  async getRootDivisions(): Promise<DivisionListResponse> {
    return apiClient.get<DivisionListResponse>(`/api/v1/masterdata/${this.endpoint}/root`)
  }
}

// Export service instances
export const companyService = new CompanyService()
export const userService = new UserService()
export const classificationService = new ClassificationService()
export const colorService = new ColorService()
export const articleService = new ArticleService()
export const modelService = new ModelService()
export const sizeService = new SizeService()
export const barcodeService = new BarcodeService()
export const priceService = new PriceService()
export const galleryImageService = new GalleryImageService()
export const supplierService = new SupplierService()
export const customerService = new CustomerService()
export const warehouseService = new WarehouseService()
export const courierService = new CourierService()
export const courierRateService = new CourierRateService()
export const depstoreService = new DepstoreService()
export const divisionService = new DivisionService()

// Export all services as a single object
export const masterDataServices = {
  company: companyService,
  user: userService,
  classification: classificationService,
  color: colorService,
  article: articleService,
  model: modelService,
  size: sizeService,
  barcode: barcodeService,
  price: priceService,
  galleryImage: galleryImageService,
  supplier: supplierService,
  customer: customerService,
  warehouse: warehouseService,
  courier: courierService,
  courierRate: courierRateService,
  depstore: depstoreService,
  division: divisionService,
}
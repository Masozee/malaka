/**
 * MinIO Storage Service
 * Handles file uploads to MinIO object storage with employee folder structure
 */

import { apiClient } from '@/lib/api'

export interface FileUploadResponse {
  success: boolean
  message: string
  data: {
    fileName: string
    filePath: string
    fileUrl: string
    fileSize: number
    fileType: string
  }
}

export interface FileUploadOptions {
  employeeCode: string
  category: 'profile' | 'attendance' | 'documents' | 'others'
  file: File
}

export class MinIOService {
  private static readonly BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8084'}/api/v1/storage`

  /**
   * Upload file to MinIO with employee folder structure
   * Structure: employee_code/{category}/filename
   */
  static async uploadFile(options: FileUploadOptions): Promise<FileUploadResponse> {
    try {
      const { employeeCode, category, file } = options
      
      // Validate file
      if (!file) {
        throw new Error('No file provided')
      }

      // Validate employee code
      if (!employeeCode || typeof employeeCode !== 'string') {
        throw new Error('Valid employee code is required')
      }

      // Validate category
      const validCategories = ['profile', 'attendance', 'documents', 'others']
      if (!validCategories.includes(category)) {
        throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`)
      }

      // Create FormData
      const formData = new FormData()
      formData.append('file', file)
      formData.append('employeeCode', employeeCode)
      formData.append('category', category)
      
      // Generate folder path: employee_code/category/
      const folderPath = `${employeeCode}/${category}/`
      formData.append('folderPath', folderPath)

      try {
        // Try backend upload first
        const response = await fetch(`${this.BASE_URL}/upload`, {
          method: 'POST',
          body: formData,
          headers: {
            // Don't set Content-Type, let browser set it with boundary for FormData
            // Add authorization header if needed
            ...(typeof window !== 'undefined' && localStorage.getItem('auth_token') ? {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            } : {})
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result: FileUploadResponse = await response.json()

        if (!result.success) {
          throw new Error(result.message || 'Upload failed')
        }

        return result
      } catch (backendError) {
        console.warn('Backend upload failed, using mock implementation:', backendError)
        
        // Fallback to mock implementation for development
        return this.mockUploadFile(options)
      }
    } catch (error) {
      console.error('Error uploading file to MinIO:', error)
      throw error
    }
  }

  /**
   * Mock implementation for development when backend is not available
   */
  private static async mockUploadFile(options: FileUploadOptions): Promise<FileUploadResponse> {
    const { employeeCode, category, file } = options
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Generate mock file URL using Data URL for immediate preview
    const fileUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.readAsDataURL(file)
    })
    
    // Generate mock response
    const fileName = `${Date.now()}_${file.name}`
    const filePath = `${employeeCode}/${category}/${fileName}`
    
    return {
      success: true,
      message: 'File uploaded successfully (mock)',
      data: {
        fileName,
        filePath,
        fileUrl,
        fileSize: file.size,
        fileType: file.type
      }
    }
  }

  /**
   * Upload profile image specifically
   */
  static async uploadProfileImage(employeeCode: string, file: File): Promise<FileUploadResponse> {
    // Validate image file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.')
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB.')
    }

    return this.uploadFile({
      employeeCode,
      category: 'profile',
      file
    })
  }

  /**
   * Delete file from MinIO
   */
  static async deleteFile(filePath: string): Promise<{ success: boolean, message: string }> {
    try {
      const response = await fetch(`${this.BASE_URL}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(typeof window !== 'undefined' && localStorage.getItem('auth_token') ? {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          } : {})
        },
        body: JSON.stringify({ filePath })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.warn('Backend delete failed, using mock implementation:', error)
      
      // Mock implementation for development
      return {
        success: true,
        message: 'File deleted successfully (mock)'
      }
    }
  }

  /**
   * Get file URL from MinIO
   */
  static async getFileUrl(filePath: string): Promise<string> {
    try {
      const response = await apiClient.get<{ success: boolean, data: { url: string } }>(
        `${this.BASE_URL}/url`,
        { filePath }
      )

      if (!response.success || !response.data) {
        throw new Error('Failed to get file URL')
      }

      return response.data.url
    } catch (error) {
      console.error('Error getting file URL from MinIO:', error)
      throw error
    }
  }

  /**
   * List files in employee folder
   */
  static async listEmployeeFiles(
    employeeCode: string, 
    category?: 'profile' | 'attendance' | 'documents' | 'others'
  ): Promise<{
    success: boolean
    data: {
      fileName: string
      filePath: string
      fileUrl: string
      fileSize: number
      lastModified: string
    }[]
  }> {
    try {
      const folderPath = category ? `${employeeCode}/${category}/` : `${employeeCode}/`
      
      const response = await apiClient.get<{
        success: boolean
        data: {
          fileName: string
          filePath: string
          fileUrl: string
          fileSize: number
          lastModified: string
        }[]
      }>(`${this.BASE_URL}/list`, { folderPath })

      return response
    } catch (error) {
      console.error('Error listing employee files:', error)
      throw error
    }
  }

  /**
   * Helper method to create all required employee folders
   */
  static async createEmployeeFolders(employeeCode: string): Promise<{ success: boolean, message: string }> {
    try {
      const response = await apiClient.post<{ success: boolean, message: string }>(
        `${this.BASE_URL}/create-folders`,
        { employeeCode }
      )

      return response
    } catch (error) {
      console.error('Error creating employee folders:', error)
      throw error
    }
  }

  /**
   * Generate file URL for display
   */
  static generateFileUrl(filePath: string): string {
    // This assumes MinIO is accessible via a public URL
    // Adjust the base URL according to your MinIO setup
    const minioBaseUrl = process.env.NEXT_PUBLIC_MINIO_URL || 'http://localhost:9000'
    const bucketName = process.env.NEXT_PUBLIC_MINIO_BUCKET || 'malaka-employees'
    
    return `${minioBaseUrl}/${bucketName}/${filePath}`
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File, maxSizeMB: number = 5, allowedTypes: string[] = []): { isValid: boolean, error?: string } {
    // Check file size
    const maxSize = maxSizeMB * 1024 * 1024
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size too large. Maximum size is ${maxSizeMB}MB.`
      }
    }

    // Check file type if specified
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      }
    }

    return { isValid: true }
  }
}

export default MinIOService
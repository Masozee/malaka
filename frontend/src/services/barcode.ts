import { api } from '@/lib/api'

export type BarcodeFormat = 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'QRCODE'

export interface BarcodeRequest {
  id: string
  data: string
  format: BarcodeFormat
  width?: number
  height?: number
}

export interface BarcodeResult {
  id: string
  data: string
  format: string
  image_base64?: string
  image_url?: string
  error?: string
}

export interface BatchBarcodeResult {
  results: BarcodeResult[]
  success_count: number
  error_count: number
  total_count: number
}

export interface GenerateArticleBarcodesRequest {
  article_ids: string[]
  format: BarcodeFormat
  width?: number
  height?: number
}

class BarcodeService {
  private baseUrl = '/api/v1/masterdata/barcodes'

  /**
   * Generate a single barcode
   */
  async generateBarcode(request: BarcodeRequest): Promise<BarcodeResult> {
    const response = await api.post(`${this.baseUrl}/generate`, request)
    return response.data
  }

  /**
   * Generate multiple barcodes in batch (up to 100)
   */
  async generateBatch(requests: BarcodeRequest[]): Promise<BatchBarcodeResult> {
    if (requests.length > 100) {
      throw new Error('Maximum 100 barcodes can be generated at once')
    }

    console.log('Sending barcode batch request:', { requests })
    const response = await api.post(`${this.baseUrl}/generate/batch`, {
      requests
    })
    console.log('Raw API response:', response)
    console.log('Response data:', response.data)

    return response.data
  }

  /**
   * Generate barcodes for specific articles (up to 100)
   */
  async generateArticleBarcodes(request: GenerateArticleBarcodesRequest): Promise<BatchBarcodeResult> {
    if (request.article_ids.length > 100) {
      throw new Error('Maximum 100 articles can be processed at once')
    }

    console.log('Sending article barcode request:', request)
    const response = await api.post(`${this.baseUrl}/generate/articles`, request)
    console.log('Raw article API response:', response)
    console.log('Article response data:', response.data)

    return response.data
  }

  /**
   * Generate barcodes for selected articles with progress tracking
   */
  async generateSelectedArticleBarcodes(
    articleIds: string[],
    format: BarcodeFormat = 'CODE128',
    options?: { width?: number; height?: number }
  ): Promise<BatchBarcodeResult> {
    return this.generateArticleBarcodes({
      article_ids: articleIds,
      format,
      width: options?.width || 300,
      height: options?.height || 100
    })
  }

  /**
   * Download barcode as PNG file
   */
  async downloadBarcode(result: BarcodeResult, filename?: string) {
    if (!result) {
      throw new Error('No barcode result provided')
    }
    
    if (result.error) {
      throw new Error(`Barcode generation failed: ${result.error}`)
    }
    
    // Check if we have either image_url or image_base64
    if (!result.image_url && !result.image_base64) {
      throw new Error(`No barcode image data available for ${result.id || 'unknown'}`)
    }

    const link = document.createElement('a')
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

    if (result.image_url) {
      // Convert relative URL to absolute URL with backend base
      if (result.image_url.startsWith('/')) {
        link.href = `${baseUrl}${result.image_url}`
      } else if (result.image_url.startsWith('http')) {
        link.href = result.image_url
      } else {
        link.href = `${baseUrl}/api/v1/media/${result.image_url}`
      }
    } else if (result.image_base64) {
      // Fallback to base64 data
      link.href = `data:image/png;base64,${result.image_base64}`
    }
    
    link.download = filename || `barcode-${result.id}.png`
    // Set target to _blank to handle CORS issues with MinIO URLs
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /**
   * Download multiple barcodes as ZIP (simplified - downloads individually)
   */
  async downloadBatchBarcodes(results: BarcodeResult[], filenamePrefix: string = 'barcode') {
    console.log('downloadBatchBarcodes called with:', {
      resultCount: results.length,
      results: results.map(r => ({
        id: r?.id,
        hasImageUrl: !!(r?.image_url),
        hasImageBase64: !!(r?.image_base64),
        hasError: !!(r?.error),
        errorMessage: r?.error
      }))
    })

    let downloadCount = 0
    
    // Process downloads sequentially to avoid overwhelming the browser
    for (const [index, result] of results.entries()) {
      console.log(`Processing result ${index}:`, {
        hasResult: !!result,
        id: result?.id,
        hasImageUrl: !!(result && result.image_url),
        hasImageBase64: !!(result && result.image_base64),
        hasError: !!(result && result.error),
        errorMessage: result?.error
      })

      if (result && (result.image_url || result.image_base64) && !result.error) {
        try {
          await this.downloadBarcode(result, `${filenamePrefix}-${index + 1}-${result.id}.png`)
          downloadCount++
          console.log(`Successfully downloaded barcode for ${result.id}`)
          
          // Small delay between downloads to prevent browser overload
          if (index < results.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        } catch (error) {
          console.warn(`Failed to download barcode for ${result.id}:`, error)
        }
      } else {
        console.warn(`Skipping download for result ${index}:`, {
          hasResult: !!result,
          hasImageUrl: !!(result && result.image_url),
          hasImageBase64: !!(result && result.image_base64),
          hasError: !!(result && result.error),
          errorMessage: result?.error
        })
      }
    }
    
    if (downloadCount === 0) {
      throw new Error('No valid barcode images available for download')
    }
    
    console.log(`Successfully downloaded ${downloadCount} barcodes`)
  }

  /**
   * Create barcode data URL for display
   */
  createBarcodeDataUrl(result: BarcodeResult): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

    if (result.image_url) {
      // Convert relative URL to absolute URL with backend base
      if (result.image_url.startsWith('/')) {
        return `${baseUrl}${result.image_url}`
      } else if (result.image_url.startsWith('http')) {
        return result.image_url
      } else {
        return `${baseUrl}/api/v1/media/${result.image_url}`
      }
    } else if (result.image_base64) {
      // Fallback to base64 data URL
      return `data:image/png;base64,${result.image_base64}`
    } else {
      throw new Error('No barcode image data available')
    }
  }

  /**
   * Test function to debug API calls
   */
  async testBarcodeGeneration() {
    try {
      console.log('=== TESTING BARCODE API DIRECTLY ===')
      
      // Test simple batch generation
      const testRequest = [{
        id: "test1",
        data: "Test Product 1",
        format: 'QRCODE' as BarcodeFormat,
        width: 300,
        height: 300
      }]
      
      console.log('Making test API call...')
      const result = await this.generateBatch(testRequest)
      console.log('Test API call result:', result)
      
      if (result.results && result.results[0]) {
        console.log('First result:', {
          id: result.results[0].id,
          hasImage: !!result.results[0].image_base64,
          imageLength: result.results[0].image_base64?.length,
          error: result.results[0].error
        })
        
        // Try to download it
        try {
          this.downloadBarcode(result.results[0], 'test-barcode.png')
          console.log('✅ Test download successful!')
          return { success: true, message: 'Test successful!' }
        } catch (downloadError) {
          console.error('❌ Test download failed:', downloadError)
          return { success: false, message: `Download failed: ${downloadError.message}` }
        }
      }
      
    } catch (error) {
      console.error('❌ Test API call failed:', error)
      return { success: false, message: `API call failed: ${error.message}` }
    }
  }
}

export const barcodeService = new BarcodeService()
export default barcodeService
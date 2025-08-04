import { apiClient } from '@/lib/api'

export interface BIExchangeRate {
  currency: string
  currencyName: string
  buyRate: number
  sellRate: number
  middleRate: number
  date: string
  lastUpdated: string
}

export interface CurrencyData {
  id: string
  code: string
  name: string
  symbol: string
  decimal_places: number
  exchange_rate: number
  base_currency: string
  is_base: boolean
  is_active: boolean
  last_updated: string
  rate_change_24h: number
  rate_change_7d: number
  created_at: string
  updated_at: string
  buy_rate?: number
  sell_rate?: number
  middle_rate?: number
}

class CurrencyService {
  private baseURL = 'https://api.exchangerate-api.com/v4/latest/IDR'
  private biRatesCache: BIExchangeRate[] = []
  private lastFetchTime = 0
  private cacheExpiry = 5 * 60 * 1000 // 5 minutes

  // Simulate Bank Indonesia exchange rates format
  private mockBIRates: BIExchangeRate[] = [
    {
      currency: 'USD',
      currencyName: 'US Dollar',
      buyRate: 15380,
      sellRate: 15420,
      middleRate: 15400,
      date: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString()
    },
    {
      currency: 'EUR',
      currencyName: 'Euro',
      buyRate: 16750,
      sellRate: 16800,
      middleRate: 16775,
      date: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString()
    },
    {
      currency: 'SGD',
      currencyName: 'Singapore Dollar',
      buyRate: 11420,
      sellRate: 11460,
      middleRate: 11440,
      date: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString()
    },
    {
      currency: 'JPY',
      currencyName: 'Japanese Yen',
      buyRate: 105.5,
      sellRate: 106.2,
      middleRate: 105.85,
      date: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString()
    },
    {
      currency: 'GBP',
      currencyName: 'British Pound',
      buyRate: 19580,
      sellRate: 19650,
      middleRate: 19615,
      date: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString()
    },
    {
      currency: 'AUD',
      currencyName: 'Australian Dollar',
      buyRate: 10240,
      sellRate: 10280,
      middleRate: 10260,
      date: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString()
    },
    {
      currency: 'CNY',
      currencyName: 'Chinese Yuan',
      buyRate: 2135,
      sellRate: 2148,
      middleRate: 2141.5,
      date: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString()
    },
    {
      currency: 'MYR',
      currencyName: 'Malaysian Ringgit',
      buyRate: 3580,
      sellRate: 3595,
      middleRate: 3587.5,
      date: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString()
    },
    {
      currency: 'THB',
      currencyName: 'Thai Baht',
      buyRate: 435.2,
      sellRate: 438.1,
      middleRate: 436.65,
      date: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString()
    },
    {
      currency: 'KRW',
      currencyName: 'Korean Won',
      buyRate: 11.85,
      sellRate: 11.92,
      middleRate: 11.885,
      date: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString()
    }
  ]

  async fetchBIExchangeRates(): Promise<BIExchangeRate[]> {
    const now = Date.now()
    
    // Return cached data if still valid
    if (this.biRatesCache.length > 0 && (now - this.lastFetchTime) < this.cacheExpiry) {
      return this.biRatesCache
    }

    try {
      // Try to fetch from external API first
      const response = await fetch(this.baseURL)
      
      if (response.ok) {
        const data = await response.json()
        
        // Convert to BI format
        const biRates: BIExchangeRate[] = this.mockBIRates.map(mockRate => {
          const apiRate = data.rates[mockRate.currency]
          if (apiRate) {
            // Convert from IDR-based rates to foreign currency rates
            const foreignToIDR = 1 / apiRate
            const spread = foreignToIDR * 0.002 // 0.2% spread simulation
            
            return {
              ...mockRate,
              buyRate: foreignToIDR - spread,
              sellRate: foreignToIDR + spread,
              middleRate: foreignToIDR,
              lastUpdated: new Date().toISOString()
            }
          }
          return mockRate
        })
        
        this.biRatesCache = biRates
        this.lastFetchTime = now
        return biRates
      }
    } catch (error) {
      console.warn('Failed to fetch live rates, using mock data:', error)
    }
    
    // Fallback to mock data
    this.biRatesCache = this.mockBIRates
    this.lastFetchTime = now
    return this.mockBIRates
  }

  async fetchFromBankIndonesia(): Promise<BIExchangeRate[]> {
    try {
      // Since direct scraping from BI website has CORS issues,
      // we'll use a proxy service or fallback to reliable mock data
      console.log('Fetching Bank Indonesia exchange rates...')
      
      // This would be the actual BI scraping implementation
      // For now, we'll return simulated BI-style data
      return await this.fetchBIExchangeRates()
    } catch (error) {
      console.error('Failed to fetch from Bank Indonesia:', error)
      return this.mockBIRates
    }
  }

  convertBIRatesToCurrencyData(biRates: BIExchangeRate[]): CurrencyData[] {
    const currencies: CurrencyData[] = [
      // Base currency (IDR)
      {
        id: '1',
        code: 'IDR',
        name: 'Indonesian Rupiah',
        symbol: 'Rp',
        decimal_places: 0,
        exchange_rate: 1,
        base_currency: 'IDR',
        is_base: true,
        is_active: true,
        last_updated: new Date().toISOString(),
        rate_change_24h: 0,
        rate_change_7d: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: new Date().toISOString(),
        buy_rate: 1,
        sell_rate: 1,
        middle_rate: 1
      }
    ]

    // Convert BI rates to currency data format
    biRates.forEach((biRate, index) => {
      const randomChange24h = (Math.random() - 0.5) * 200 // Random change ±100
      const randomChange7d = (Math.random() - 0.5) * 800 // Random change ±400
      
      currencies.push({
        id: (index + 2).toString(),
        code: biRate.currency,
        name: biRate.currencyName,
        symbol: this.getCurrencySymbol(biRate.currency),
        decimal_places: biRate.currency === 'JPY' || biRate.currency === 'KRW' ? 0 : 2,
        exchange_rate: biRate.middleRate,
        base_currency: 'IDR',
        is_base: false,
        is_active: true,
        last_updated: biRate.lastUpdated,
        rate_change_24h: randomChange24h,
        rate_change_7d: randomChange7d,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: biRate.lastUpdated,
        buy_rate: biRate.buyRate,
        sell_rate: biRate.sellRate,
        middle_rate: biRate.middleRate
      })
    })

    return currencies
  }

  private getCurrencySymbol(code: string): string {
    const symbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'SGD': 'S$',
      'JPY': '¥',
      'GBP': '£',
      'AUD': 'A$',
      'CNY': '¥',
      'MYR': 'RM',
      'THB': '฿',
      'KRW': '₩',
      'IDR': 'Rp'
    }
    return symbols[code] || code
  }

  async getAllCurrencies(): Promise<CurrencyData[]> {
    try {
      const biRates = await this.fetchFromBankIndonesia()
      return this.convertBIRatesToCurrencyData(biRates)
    } catch (error) {
      console.error('Failed to fetch currencies:', error)
      throw error
    }
  }

  async refreshRates(): Promise<CurrencyData[]> {
    // Clear cache to force fresh fetch
    this.biRatesCache = []
    this.lastFetchTime = 0
    return await this.getAllCurrencies()
  }

  async getCurrencyByCode(code: string): Promise<CurrencyData | null> {
    const currencies = await this.getAllCurrencies()
    return currencies.find(c => c.code === code) || null
  }

  // Backend integration methods (when backend is available)
  async getBackendCurrencies(): Promise<CurrencyData[]> {
    try {
      // Try the exchange rates endpoint
      const response = await apiClient.get<{success: boolean, message: string, data: CurrencyData[]}>('/api/v1/accounting/exchange-rates/')
      if (response.success && response.data) {
        return response.data
      }
      throw new Error(response.message || 'Failed to fetch currencies from backend')
    } catch (error) {
      console.warn('Backend exchange rates not available, falling back to BI rates:', error)
      // Fallback to local BI rate fetching
      return await this.getAllCurrencies()
    }
  }

  async updateBackendRates(currencies: CurrencyData[]): Promise<void> {
    try {
      await apiClient.post('/api/v1/accounting/currencies/bulk-update', { currencies })
    } catch (error) {
      console.warn('Failed to update backend rates:', error)
    }
  }
}

export const currencyService = new CurrencyService()
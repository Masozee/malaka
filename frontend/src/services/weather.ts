/**
 * Weather API Service
 * Integration with OpenWeatherMap API for weather data
 */

const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY
const WEATHER_API_URL = process.env.NEXT_PUBLIC_WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5'

export interface WeatherData {
  location: string
  temperature: number
  description: string
  icon: string
  humidity: number
  windSpeed: number
  feelsLike: number
  visibility: number
  uvIndex?: number
  sunrise?: string
  sunset?: string
}

export interface WeatherForecast {
  date: string
  temperature: {
    min: number
    max: number
  }
  description: string
  icon: string
  humidity: number
  windSpeed: number
}

class WeatherService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    if (!WEATHER_API_KEY) {
      console.warn('Weather API key not found. Weather features will be disabled.')
    }
    this.apiKey = WEATHER_API_KEY || ''
    this.baseUrl = WEATHER_API_URL
  }

  private async request<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    if (!this.apiKey) {
      throw new Error('Weather API key not configured')
    }

    const urlParams = new URLSearchParams({
      ...params,
      appid: this.apiKey,
      units: 'metric' // Celsius
    })

    const url = `${this.baseUrl}/${endpoint}?${urlParams.toString()}`

    try {
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Weather API Error: ${response.status} ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.error('Weather API request failed:', error)
      throw error
    }
  }

  async getCurrentWeather(city: string = 'Jakarta'): Promise<WeatherData> {
    // If no API key or in development mode, return mock data
    if (!this.apiKey || process.env.NODE_ENV === 'development') {
      return this.getMockWeatherData(city)
    }

    try {
      const data = await this.request<any>('weather', { q: city })
      
      return {
        location: `${data.name}, ${data.sys.country}`,
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        feelsLike: Math.round(data.main.feels_like),
        visibility: data.visibility ? Math.round(data.visibility / 1000) : 0, // Convert to km
        sunrise: data.sys.sunrise ? new Date(data.sys.sunrise * 1000).toLocaleTimeString('id-ID', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : undefined,
        sunset: data.sys.sunset ? new Date(data.sys.sunset * 1000).toLocaleTimeString('id-ID', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : undefined
      }
    } catch (error) {
      // Fallback to mock data if API fails
      console.warn('Weather API failed, using mock data:', error)
      return this.getMockWeatherData(city)
    }
  }

  private getMockWeatherData(city: string): WeatherData {
    const mockData = {
      'Jakarta': {
        location: 'Jakarta, ID',
        temperature: 28,
        description: 'partly cloudy',
        icon: '02d',
        humidity: 75,
        windSpeed: 3.2,
        feelsLike: 32,
        visibility: 8,
        sunrise: '06:15',
        sunset: '18:30'
      },
      'Bandung': {
        location: 'Bandung, ID',
        temperature: 24,
        description: 'light rain',
        icon: '10d',
        humidity: 85,
        windSpeed: 2.1,
        feelsLike: 26,
        visibility: 6,
        sunrise: '06:20',
        sunset: '18:25'
      },
      'Surabaya': {
        location: 'Surabaya, ID',
        temperature: 30,
        description: 'clear sky',
        icon: '01d',
        humidity: 68,
        windSpeed: 4.5,
        feelsLike: 34,
        visibility: 10,
        sunrise: '05:45',
        sunset: '18:10'
      }
    }

    return mockData[city as keyof typeof mockData] || mockData.Jakarta
  }

  async getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData> {
    const data = await this.request<any>('weather', { 
      lat: lat.toString(), 
      lon: lon.toString() 
    })
    
    return {
      location: `${data.name}, ${data.sys.country}`,
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      feelsLike: Math.round(data.main.feels_like),
      visibility: data.visibility ? Math.round(data.visibility / 1000) : 0,
      sunrise: data.sys.sunrise ? new Date(data.sys.sunrise * 1000).toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }) : undefined,
      sunset: data.sys.sunset ? new Date(data.sys.sunset * 1000).toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }) : undefined
    }
  }

  async get5DayForecast(city: string = 'Jakarta'): Promise<WeatherForecast[]> {
    const data = await this.request<any>('forecast', { q: city })
    
    // Group by date and get daily forecasts
    const dailyForecasts: { [key: string]: any[] } = {}
    
    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toDateString()
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = []
      }
      dailyForecasts[date].push(item)
    })

    // Convert to forecast format
    const forecasts: WeatherForecast[] = Object.entries(dailyForecasts)
      .slice(0, 5) // Limit to 5 days
      .map(([date, items]) => {
        const temps = items.map(item => item.main.temp)
        const midDayItem = items[Math.floor(items.length / 2)] // Get middle item for general conditions
        
        return {
          date: new Date(date).toLocaleDateString('id-ID', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          }),
          temperature: {
            min: Math.round(Math.min(...temps)),
            max: Math.round(Math.max(...temps))
          },
          description: midDayItem.weather[0].description,
          icon: midDayItem.weather[0].icon,
          humidity: midDayItem.main.humidity,
          windSpeed: midDayItem.wind.speed
        }
      })

    return forecasts
  }

  getWeatherIconUrl(icon: string): string {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`
  }

  async getCurrentLocation(): Promise<{ lat: number; lon: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
        },
        () => {
          resolve(null)
        },
        { timeout: 5000 }
      )
    })
  }
}

export const weatherService = new WeatherService()
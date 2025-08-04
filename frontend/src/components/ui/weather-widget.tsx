'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { weatherService, WeatherData } from '@/services/weather'
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  Zap, 
  Eye, 
  Wind, 
  Droplets,
  Thermometer,
  Sunrise,
  Sunset,
  MapPin,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WeatherWidgetProps {
  city?: string
  compact?: boolean
  className?: string
}

const getWeatherIcon = (iconCode: string, size = 'h-8 w-8') => {
  // Map OpenWeatherMap icon codes to Lucide icons
  const iconMap: { [key: string]: any } = {
    '01d': Sun, // clear sky day
    '01n': Sun, // clear sky night
    '02d': Cloud, // few clouds day
    '02n': Cloud, // few clouds night
    '03d': Cloud, // scattered clouds
    '03n': Cloud,
    '04d': Cloud, // broken clouds
    '04n': Cloud,
    '09d': CloudRain, // shower rain
    '09n': CloudRain,
    '10d': CloudRain, // rain
    '10n': CloudRain,
    '11d': Zap, // thunderstorm
    '11n': Zap,
    '13d': CloudSnow, // snow
    '13n': CloudSnow,
    '50d': Cloud, // mist
    '50n': Cloud
  }

  const IconComponent = iconMap[iconCode] || Cloud
  return <IconComponent className={size} />
}

export function WeatherWidget({ city = 'Jakarta', compact = false, className = '' }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchWeather = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Try to get user's location first, fallback to specified city
      const location = await weatherService.getCurrentLocation()
      const weatherData = location 
        ? await weatherService.getWeatherByCoordinates(location.lat, location.lon)
        : await weatherService.getCurrentWeather(city)
      
      setWeather(weatherData)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to fetch weather:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeather()
    
    // Refresh weather every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [city])

  if (loading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center justify-center h-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    )
  }

  if (error || !weather) {
    const isApiKeyError = error?.includes('Invalid API key') || error?.includes('401')
    
    return (
      <Card className={`p-4 ${className}`}>
        <div className="text-center">
          <Cloud className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {isApiKeyError ? 'Weather API needs setup' : 'Weather unavailable'}
          </p>
          {!isApiKeyError && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchWeather}
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </Card>
    )
  }

  if (compact) {
    return (
      <Card className={`p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getWeatherIcon(weather.icon, 'h-6 w-6')}
            <div>
              <div className="font-semibold text-lg">{weather.temperature}°C</div>
              <div className="text-xs text-muted-foreground capitalize">
                {weather.description}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {weather.location.split(',')[0]}
            </div>
            <div className="text-xs text-muted-foreground flex items-center mt-1">
              <Wind className="h-3 w-3 mr-1" />
              {weather.windSpeed} m/s
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{weather.location}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchWeather}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Main Weather Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {getWeatherIcon(weather.icon, 'h-12 w-12')}
            <div>
              <div className="text-3xl font-bold">{weather.temperature}°C</div>
              <div className="text-sm text-muted-foreground capitalize">
                {weather.description}
              </div>
              <div className="text-xs text-muted-foreground">
                Feels like {weather.feelsLike}°C
              </div>
            </div>
          </div>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span className="text-muted-foreground">Humidity:</span>
            <span className="font-medium">{weather.humidity}%</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Wind className="h-4 w-4 text-gray-500" />
            <span className="text-muted-foreground">Wind:</span>
            <span className="font-medium">{weather.windSpeed} m/s</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4 text-green-500" />
            <span className="text-muted-foreground">Visibility:</span>
            <span className="font-medium">{weather.visibility} km</span>
          </div>
          
          {weather.sunrise && (
            <div className="flex items-center space-x-2">
              <Sunrise className="h-4 w-4 text-yellow-500" />
              <span className="text-muted-foreground">Sunrise:</span>
              <span className="font-medium">{weather.sunrise}</span>
            </div>
          )}
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <div className="text-xs text-muted-foreground text-center border-t pt-2">
            Last updated: {lastUpdated.toLocaleTimeString('id-ID')}
          </div>
        )}
      </div>
    </Card>
  )
}
"use client"

import * as React from "react"
import { ChevronRight, Command, MapPin, Sun, Cloud, CloudRain, Snowflake } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { CommandPalette } from "@/components/ui/command"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface WeatherData {
  location: string
  temperature: number
  condition: string
  humidity: number
}

interface HeaderProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
}

export function Header({ title, description, breadcrumbs, actions }: HeaderProps) {
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [weather, setWeather] = React.useState<WeatherData | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    fetchLocationAndWeather()
  }, [])

  const fetchLocationAndWeather = async () => {
    try {
      setLoading(true)
      
      // Check if we have a weather API key, if not, use mock data
      const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY
      if (!API_KEY || API_KEY === 'demo_key') {
        // Use mock data for Jakarta
        setWeather({
          location: 'Jakarta',
          temperature: 28,
          condition: 'Clear',
          humidity: 65
        })
        return
      }

      // Check if geolocation is available
      if (!navigator.geolocation) {
        setWeather({
          location: 'Jakarta',
          temperature: 28,
          condition: 'Clear',
          humidity: 65
        })
        return
      }
      
      // Get user's location with timeout
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          enableHighAccuracy: false,
          maximumAge: 600000 // 10 minutes cache
        })
      })

      const { latitude, longitude } = position.coords
      
      // Fetch weather data from OpenWeatherMap API with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`,
        { 
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal
        }
      )
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        setWeather({
          location: data.name,
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].main,
          humidity: data.main.humidity
        })
      } else {
        // Fallback to mock data if API fails
        setWeather({
          location: 'Jakarta',
          temperature: 28,
          condition: 'Clear',
          humidity: 65
        })
      }
    } catch (error) {
      // Silently fall back to mock data - don't log errors in production
      if (process.env.NODE_ENV === 'development') {
        console.warn('Weather fetch failed, using mock data:', error)
      }
      setWeather({
        location: 'Jakarta',
        temperature: 28,
        condition: 'Clear',
        humidity: 65
      })
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
      case 'sunny':
        return <Sun className="h-4 w-4 text-yellow-500" />
      case 'clouds':
      case 'cloudy':
        return <Cloud className="h-4 w-4 text-gray-500" />
      case 'rain':
      case 'drizzle':
        return <CloudRain className="h-4 w-4 text-blue-500" />
      case 'snow':
        return <Snowflake className="h-4 w-4 text-blue-200" />
      default:
        return <Sun className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <div>
      {/* Combined Navbar with Breadcrumb, Command, and Theme Toggle */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left Side - Breadcrumbs */}
          <div className="flex-1">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                {breadcrumbs.map((item, index) => (
                  <div key={index} className="flex items-center">
                    {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
                    {item.href ? (
                      <Link 
                        href={item.href} 
                        className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{item.label}</span>
                    )}
                  </div>
                ))}
              </nav>
            )}
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center space-x-2 ml-4">
            {/* Weather Display */}
            {mounted && (
              <div className="flex items-center space-x-2 px-3 py-1 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                {loading ? (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4 animate-pulse" />
                    <span>Loading...</span>
                  </div>
                ) : weather ? (
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {weather.location}
                    </span>
                    {getWeatherIcon(weather.condition)}
                    <span className="text-gray-900 dark:text-gray-100 font-semibold">
                      {weather.temperature}°C
                    </span>
                    <span className="text-gray-500 text-xs">
                      {weather.condition}
                    </span>
                  </div>
                ) : null}
              </div>
            )}

            {/* Command Palette Trigger - Wider */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommandOpen(true)}
              className="relative h-8 w-8 p-0 xl:h-8 xl:w-64 xl:px-3 xl:py-2"
            >
              <Command className="h-4 w-4 xl:mr-2" />
              <span className="hidden xl:inline-flex">Search</span>
              <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
                ⌘K
              </kbd>
            </Button>

          </div>
        </div>
      </div>

      {/* Page Title Section with More Gap */}
      <header className="bg-white dark:bg-gray-900 px-6 py-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
            {description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      </header>

      {/* Command Palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  )
}
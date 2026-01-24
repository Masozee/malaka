"use client"

import * as React from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowRightIcon,
  Search01Icon,
  LocationIcon,
  Sun01Icon,
  CloudIcon,
  RainIcon,
  SnowIcon,
  SidebarLeftIcon
} from '@hugeicons/core-free-icons'
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { CommandPalette } from "@/components/ui/command"
import { useSidebar } from "@/contexts/sidebar-context"

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
  const sidebar = useSidebar()
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
        return <HugeiconsIcon icon={Sun01Icon} className="h-4 w-4 text-yellow-500" />
      case 'clouds':
      case 'cloudy':
        return <HugeiconsIcon icon={CloudIcon} className="h-4 w-4 text-gray-500" />
      case 'rain':
      case 'drizzle':
        return <HugeiconsIcon icon={RainIcon} className="h-4 w-4 text-blue-500" />
      case 'snow':
        return <HugeiconsIcon icon={SnowIcon} className="h-4 w-4 text-blue-200" />
      default:
        return <HugeiconsIcon icon={Sun01Icon} className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <div>
      {/* Combined Navbar with Breadcrumb, Command, and Theme Toggle */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left Side - Toggle Button and Breadcrumbs */}
          <div className="flex-1 flex items-center space-x-3">
            {/* Sidebar Toggle Button */}
            {sidebar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={sidebar.toggleSecondSidebar}
                className="h-8 w-8 p-0"
                aria-label="Toggle sidebar"
              >
                <HugeiconsIcon icon={SidebarLeftIcon} className="h-4 w-4" />
              </Button>
            )}

            {/* Separator */}
            {sidebar && breadcrumbs && breadcrumbs.length > 0 && (
              <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" aria-hidden="true" />
            )}

            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-1">
                  {breadcrumbs.map((item, index) => (
                    <li key={index} className="flex items-center">
                      {index > 0 && <HugeiconsIcon icon={ArrowRightIcon} className="h-4 w-4 mx-1" aria-hidden="true" />}
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span className="text-gray-900 dark:text-gray-100 font-medium" aria-current="page">{item.label}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center space-x-3 ml-4">
            {/* Command Palette Trigger - Wider */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommandOpen(true)}
              className="relative h-8 w-8 p-0 xl:h-8 xl:w-64 xl:px-3 xl:py-2"
              aria-label="Open search (⌘K)"
            >
              <HugeiconsIcon icon={Search01Icon} className="h-4 w-4 xl:mr-2" aria-hidden="true" />
              <span className="hidden xl:inline-flex">Search</span>
              <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex" aria-hidden="true">
                ⌘K
              </kbd>
            </Button>

            {/* Separator */}
            {mounted && weather && (
              <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" aria-hidden="true" />
            )}

            {/* Weather Display - Icon and Temperature only */}
            {mounted && weather && (
              <div
                className="flex items-center space-x-2"
                aria-label={`Weather: ${weather.temperature}°C ${weather.condition}`}
              >
                <span aria-hidden="true">{getWeatherIcon(weather.condition)}</span>
                <span className="text-sm text-gray-900 dark:text-gray-100 font-semibold">
                  {weather.temperature}°C
                </span>
              </div>
            )}

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
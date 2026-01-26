'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth'
import { apiClient } from '@/lib/api'

interface User {
  id: string
  username: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<boolean>
  refreshSession: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user

  const checkAuth = async (): Promise<boolean> => {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        return false
      }

      const token = authService.getToken()
      if (!token || !authService.isAuthenticated()) {
        setUser(null)
        apiClient.setToken('')
        return false
      }

      // Set token in API client
      apiClient.setToken(token)

      // Token exists and is valid
      // Decode the JWT to get user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        console.log('Token payload:', payload) // Debug log
        
        const userData = {
          id: payload.sub || payload.user_id || payload.id || 'unknown',
          username: payload.username || payload.name || payload.preferred_username || payload.sub || 'testuser',
          email: payload.email || 'testuser@malaka.com',
          role: payload.role || payload.roles?.[0] || 'user'
        }
        
        console.log('Setting user data:', userData) // Debug log
        setUser(userData)
        return true
      } catch (tokenError) {
        console.error('Token parsing error:', tokenError)
        // Invalid token format, clear it
        authService.logout()
        setUser(null)
        apiClient.setToken('')
        return false
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
      apiClient.setToken('')
      return false
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await authService.login({ email, password })

      // Set user immediately after successful login without additional API call
      const token = authService.getToken()
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          console.log('Login token payload:', payload) // Debug log

          const userData = {
            id: payload.sub || payload.user_id || payload.id || 'unknown',
            username: payload.username || payload.name || payload.preferred_username || email.split('@')[0],
            email: payload.email || email,
            role: payload.role || payload.roles?.[0] || 'user'
          }

          console.log('Setting user data after login:', userData) // Debug log
          setUser(userData)

          // Clear auth attempt cookie on successful login
          if (typeof window !== 'undefined') {
            document.cookie = 'auth_attempted=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
          }
        } catch (tokenError) {
          // Fallback to checkAuth if token parsing fails
          await checkAuth()
        }
      }

      return response
    } catch (error) {
      setUser(null)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const refreshSession = async (): Promise<boolean> => {
    try {
      const token = authService.getToken()
      if (!token || !authService.isAuthenticated()) {
        return false
      }

      // Refresh token cookie to extend session
      if (typeof window !== 'undefined') {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const expirationTime = payload.exp * 1000 // Convert to milliseconds
        const currentTime = Date.now()
        const timeUntilExpiry = expirationTime - currentTime
        
        // Refresh if token expires within 5 minutes
        if (timeUntilExpiry < 5 * 60 * 1000) {
          console.log('Token expiring soon, refreshing session...')
          // In a real app, you would call a refresh endpoint here
          // For now, we'll just update the cookie timestamp
          authService.initializeAuth()
        }
      }
      
      return true
    } catch (error) {
      console.error('Session refresh failed:', error)
      return false
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    apiClient.setToken('')
    
    // Clear auth attempt cookie on logout
    if (typeof window !== 'undefined') {
      document.cookie = 'auth_attempted=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
    
    router.push('/login')
  }

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true)
      try {
        // Fast synchronous check first
        const token = authService.getToken()
        if (token && authService.isAuthenticated()) {
          // Parse token immediately without API call
          try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            console.log('Init token payload:', payload) // Debug log
            
            const userData = {
              id: payload.sub || payload.user_id || payload.id || 'unknown',
              username: payload.username || payload.name || payload.preferred_username || payload.sub || 'testuser',
              email: payload.email || 'testuser@malaka.com',
              role: payload.role || payload.roles?.[0] || 'user'
            }
            
            console.log('Setting user data on init:', userData) // Debug log
            setUser(userData)
            apiClient.setToken(token)
            authService.initializeAuth() // Set cookie
          } catch (tokenError) {
            // Fallback to full checkAuth if parsing fails
            await checkAuth()
          }
        } else {
          // No valid token found - user must login manually
          console.log('No valid token found, user needs to login')
          setUser(null)
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
    refreshSession
  }

  // Set up automatic session refresh for authenticated users
  useEffect(() => {
    if (!isAuthenticated) return

    const refreshInterval = setInterval(async () => {
      await refreshSession()
    }, 5 * 60 * 1000) // Check every 5 minutes

    return () => clearInterval(refreshInterval)
  }, [isAuthenticated])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
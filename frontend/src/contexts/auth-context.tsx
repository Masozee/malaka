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
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<boolean>
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
      const token = authService.getToken()
      if (!token || !authService.isAuthenticated()) {
        setUser(null)
        apiClient.setToken('')
        return false
      }

      // Set token in API client
      apiClient.setToken(token)

      // Token exists and is valid
      // You could decode the JWT to get user info, or make an API call
      // For now, we'll create a mock user from the token
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUser({
        id: payload.sub || 'unknown',
        username: 'testuser', // In real app, get from API
        email: 'testuser@example.com',
        role: payload.role || 'user'
      })
      return true
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
      apiClient.setToken('')
      return false
    }
  }

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await authService.login({ username, password })
      
      // Set user after successful login
      await checkAuth()
      
      return response
    } catch (error) {
      setUser(null)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    apiClient.setToken('')
    router.push('/login')
  }

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true)
      try {
        await checkAuth()
      } catch (error) {
        console.error('Failed to initialize auth:', error)
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
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
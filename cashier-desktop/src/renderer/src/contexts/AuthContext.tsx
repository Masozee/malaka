import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService, User } from '../services/auth'
import { apiClient } from '../services/api'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = useCallback(() => {
    const token = authService.getToken()
    if (token && authService.isAuthenticated()) {
      const userData = authService.getUser()
      if (userData) {
        setUser(userData)
        apiClient.setToken(token)
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (email: string, password: string): Promise<void> => {
    const response = await authService.login(email, password)
    if (response.token) {
      const userData = authService.decodeToken(response.token)
      setUser(userData)
    }
  }

  const logout = (): void => {
    authService.logout()
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isLoading, isAuthenticated } = useAuth()
  
  // Check if user is already authenticated and redirect
  useEffect(() => {
    if (isAuthenticated) {
      const redirectUrl = searchParams.get('redirect') || '/dashboard'
      router.replace(redirectUrl)
    }
  }, [isAuthenticated, router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await login(username, password)
      // Immediate redirect without waiting
      const redirectUrl = searchParams.get('redirect') || '/dashboard'
      window.location.href = redirectUrl // Use window.location for instant redirect
    } catch (err) {
      setError('Invalid username or password')
      console.error('Login failed:', err)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white dark:bg-gray-900">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          <div>
            <div className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Malaka ERP" 
                className="h-8 w-8 object-contain"
              />
              <h1 className="ml-3 text-2xl font-bold text-gray-900 dark:text-white">
                Malaka ERP
              </h1>
            </div>
            <h2 className="mt-8 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Sign in to your account to continue
            </p>
          </div>

          <div className="mt-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                  Username
                </label>
                <div className="mt-2">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    autoComplete="username"
                    className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 dark:text-white  ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 bg-white dark:bg-gray-800 sm:text-sm sm:leading-6"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                  Password
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 dark:text-white  ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 bg-white dark:bg-gray-800 sm:text-sm sm:leading-6"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                  <div className="text-sm text-red-700 dark:text-red-400">
                    {error}
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white  hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>

              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center font-medium mb-2">
                  Demo Credentials
                </p>
                <div className="space-y-1">
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Username:</span> <code className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">testuser</code>
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Password:</span> <code className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">testpass</code>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side - Hero Image */}
      <div className="hidden lg:flex lg:flex-1 lg:relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800"></div>
        <div className="relative flex items-center justify-center w-full">
          <div className="text-center text-white px-8">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-3xl font-bold mb-4">
                Enterprise Resource Planning
              </h3>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Streamline your business operations with our comprehensive ERP solution designed for shoe manufacturing and retail.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
              <div className="flex items-center space-x-3 text-left">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">Inventory Management</p>
                  <p className="text-sm text-blue-200">Track stock levels and movements</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-left">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">Sales & Orders</p>
                  <p className="text-sm text-blue-200">Manage sales processes efficiently</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-left">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">Financial Reporting</p>
                  <p className="text-sm text-blue-200">Real-time business insights</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full"></div>
          <div className="absolute top-1/4 -left-12 w-24 h-24 bg-white/5 rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-white/5 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}
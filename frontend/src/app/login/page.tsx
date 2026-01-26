'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import Image from 'next/image'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
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
      await login(email, password)
      // Immediate redirect without waiting
      const redirectUrl = searchParams.get('redirect') || '/dashboard'
      window.location.href = redirectUrl // Use window.location for instant redirect
    } catch (err) {
      setError('Invalid email or password')
      console.error('Login failed:', err)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/towfiqu-barbhuiya-HNPrWOH2Z8U-unsplash.jpg"
          alt="Malaka ERP"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <h3 className="text-3xl font-bold text-white mb-4">
            Enterprise Resource Planning
          </h3>
          <p className="text-lg text-white/80 leading-relaxed max-w-md">
            Streamline your business operations with our comprehensive ERP solution designed for shoe manufacturing and retail.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 lg:px-16 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-md">
          {/* Logo */}
          <div className="mb-12">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Malaka ERP"
                width={48}
                height={48}
                className="object-contain"
              />
              <div>
                <h1 className="text-3xl font-bold text-black">
                  Malaka<span className="text-[#09f]">ERP</span>
                </h1>
                <p className="text-sm text-gray-500">Enterprise Resource Planning</p>
              </div>
            </Link>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-black">
              Welcome back
            </h2>
            <p className="mt-2 text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-4 py-3 border border-gray-200 focus:border-[#09f] focus:outline-none transition-colors"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 border border-gray-200 focus:border-[#09f] focus:outline-none transition-colors"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-5 py-3 bg-[#09f] text-white font-medium hover:bg-[#0088e6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <Link href="/" className="text-gray-500 hover:text-[#09f] transition-colors">
                Back to Home
              </Link>
              <Link href="/contact" className="text-gray-500 hover:text-[#09f] transition-colors">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

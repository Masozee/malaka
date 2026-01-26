'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { invitationService, ValidateInvitationResponse } from '@/services/invitations'

function SignupContent() {
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [invitation, setInvitation] = useState<ValidateInvitationResponse | null>(null)
  const [success, setSuccess] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setInvitation({ valid: false, error: 'No invitation token provided' })
        setIsValidating(false)
        return
      }

      try {
        const result = await invitationService.validateToken(token)
        setInvitation(result)
      } catch {
        setInvitation({ valid: false, error: 'Failed to validate invitation' })
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate form
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (!fullName.trim()) {
      setError('Full name is required')
      return
    }

    setIsLoading(true)

    try {
      await invitationService.acceptInvitation({
        token: token!,
        full_name: fullName.trim(),
        password,
        phone: phone.trim() || undefined
      })

      setSuccess(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string }
      setError(error.response?.data?.message || error.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state while validating token
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#09f] mx-auto mb-4"></div>
          <p className="text-gray-600">Validating invitation...</p>
        </div>
      </div>
    )
  }

  // Invalid or expired invitation
  if (!invitation?.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center max-w-md">
          <div className="mb-6">
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
              </div>
            </Link>
          </div>

          <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Invalid Invitation</h2>
            <p className="text-red-700 mb-6">{invitation?.error || 'This invitation link is invalid or has expired.'}</p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-[#09f] text-white font-medium hover:bg-[#0088e6] transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center max-w-md">
          <div className="mb-6">
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
              </div>
            </Link>
          </div>

          <div className="p-8 bg-green-50 border border-green-200 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-green-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-green-800 mb-2">Account Created!</h2>
            <p className="text-green-700 mb-6">Your account has been created successfully. Redirecting to login...</p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-[#09f] text-white font-medium hover:bg-[#0088e6] transition-colors"
            >
              Go to Login Now
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Signup form
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
            Welcome to Malaka ERP
          </h3>
          <p className="text-lg text-white/80 leading-relaxed max-w-md">
            You&apos;ve been invited to join our platform. Complete your registration to get started.
          </p>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 lg:px-16 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
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
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-black">
              Create Your Account
            </h2>
            <p className="mt-2 text-gray-600">
              You&apos;ve been invited to join as <span className="font-medium text-[#09f]">{invitation.role}</span>
            </p>
          </div>

          {/* Invitation Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div className="text-sm">
                <p className="text-gray-700">
                  <span className="font-medium">{invitation.inviter_name}</span> invited you to join{' '}
                  <span className="font-medium">{invitation.company_name || 'Malaka ERP'}</span>
                </p>
                <p className="text-gray-500 mt-1">Email: {invitation.email}</p>
              </div>
            </div>
          </div>

          {/* Signup Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                autoComplete="name"
                className="w-full px-4 py-3 border border-gray-200 focus:border-[#09f] focus:outline-none transition-colors"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                className="w-full px-4 py-3 border border-gray-200 focus:border-[#09f] focus:outline-none transition-colors"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
                autoComplete="new-password"
                className="w-full px-4 py-3 border border-gray-200 focus:border-[#09f] focus:outline-none transition-colors"
                placeholder="Create a password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 border border-gray-200 focus:border-[#09f] focus:outline-none transition-colors"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-[#09f] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#09f] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  )
}

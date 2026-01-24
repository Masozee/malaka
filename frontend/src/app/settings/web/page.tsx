'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface WebGear {
  general: {
    siteName: string
    siteDescription: string
    siteUrl: string
    adminEmail: string
    timezone: string
    language: string
    dateFormat: string
    timeFormat: string
    maintenanceMode: boolean
    allowRegistration: boolean
    requireEmailVerification: boolean
  }
  appearance: {
    theme: 'light' | 'dark' | 'auto'
    primaryColor: string
    secondaryColor: string
    fontFamily: string
    logoUrl: string
    faviconUrl: string
    customCSS: string
    compactMode: boolean
    showBreadcrumbs: boolean
    showSidebar: boolean
    sidebarCollapsed: boolean
  }
  performance: {
    cacheEnabled: boolean
    cacheDuration: number
    compressionEnabled: boolean
    minifyAssets: boolean
    lazyLoading: boolean
    imageOptimization: boolean
    cdnEnabled: boolean
    cdnUrl: string
  }
  security: {
    httpsRedirect: boolean
    corsEnabled: boolean
    allowedOrigins: string[]
    csrfProtection: boolean
    rateLimitEnabled: boolean
    rateLimitRequests: number
    rateLimitWindow: number
    sessionTimeout: number
    passwordMinLength: number
    requireStrongPasswords: boolean
  }
  seo: {
    metaTitle: string
    metaDescription: string
    metaKeywords: string
    robotsTxt: string
    sitemapEnabled: boolean
    googleAnalyticsId: string
    googleTagManagerId: string
    facebookPixelId: string
    openGraphEnabled: boolean
    twitterCardEnabled: boolean
  }
  email: {
    smtpHost: string
    smtpPort: number
    smtpUsername: string
    smtpPassword: string
    smtpEncryption: 'none' | 'tls' | 'ssl'
    fromEmail: string
    fromName: string
    testEmail: string
  }
  backup: {
    autoBackup: boolean
    backupFrequency: 'daily' | 'weekly' | 'monthly'
    backupRetention: number
    backupLocation: 'local' | 'cloud'
    cloudProvider: string
    lastBackup: string
    nextBackup: string
  }
}

export default function WebGearPage() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [hasChanges, setHasChanges] = useState(false)
  const [settings, setGear] = useState<WebGear>({
    general: {
      siteName: 'Malaka ERP System',
      siteDescription: 'Comprehensive Enterprise Resource Planning System for Manufacturing and Retail',
      siteUrl: 'https://erp.malaka.com',
      adminEmail: 'admin@malaka.com',
      timezone: 'Asia/Jakarta',
      language: 'en',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      maintenanceMode: false,
      allowRegistration: false,
      requireEmailVerification: true
    },
    appearance: {
      theme: 'light',
      primaryColor: '#3B82F6',
      secondaryColor: '#6B7280',
      fontFamily: 'Inter',
      logoUrl: '/logo.png',
      faviconUrl: '/favicon.ico',
      customCSS: '',
      compactMode: false,
      showBreadcrumbs: true,
      showSidebar: true,
      sidebarCollapsed: false
    },
    performance: {
      cacheEnabled: true,
      cacheDuration: 3600,
      compressionEnabled: true,
      minifyAssets: true,
      lazyLoading: true,
      imageOptimization: true,
      cdnEnabled: false,
      cdnUrl: ''
    },
    security: {
      httpsRedirect: true,
      corsEnabled: true,
      allowedOrigins: ['https://malaka.com', 'https://app.malaka.com'],
      csrfProtection: true,
      rateLimitEnabled: true,
      rateLimitRequests: 100,
      rateLimitWindow: 15,
      sessionTimeout: 30,
      passwordMinLength: 8,
      requireStrongPasswords: true
    },
    seo: {
      metaTitle: 'Malaka ERP - Enterprise Resource Planning System',
      metaDescription: 'Modern ERP solution for manufacturing and retail businesses with integrated HR, inventory, and financial management.',
      metaKeywords: 'ERP, enterprise resource planning, manufacturing, retail, inventory management',
      robotsTxt: 'User-agent: *\nDisallow: /admin\nDisallow: /api',
      sitemapEnabled: true,
      googleAnalyticsId: '',
      googleTagManagerId: '',
      facebookPixelId: '',
      openGraphEnabled: true,
      twitterCardEnabled: true
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUsername: 'noreply@malaka.com',
      smtpPassword: '',
      smtpEncryption: 'tls',
      fromEmail: 'noreply@malaka.com',
      fromName: 'Malaka ERP System',
      testEmail: 'admin@malaka.com'
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      backupRetention: 30,
      backupLocation: 'local',
      cloudProvider: 'aws',
      lastBackup: '2024-07-25 02:00:00',
      nextBackup: '2024-07-26 02:00:00'
    }
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Gear', href: '/settings' },
    { label: 'Web Gear' }
  ]

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'performance', label: 'Performance' },
    { id: 'security', label: 'Security' },
    { id: 'seo', label: 'SEO & Analytics' },
    { id: 'email', label: 'Email Gear' },
    { id: 'backup', label: 'Backup & Recovery' }
  ]

  const handleSave = () => {
    // Save settings logic here
    setHasChanges(false)
    // Show success message
  }

  const handleTestEmail = () => {
    // Test email configuration
    console.log('Testing email configuration...')
  }

  const handleBackupNow = () => {
    // Trigger immediate backup
    console.log('Starting backup...')
  }

  const GeneralTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Site Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
            <input
              type="text"
              value={settings.general.siteName}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  general: { ...prev.general, siteName: e.target.value }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site URL</label>
            <input
              type="url"
              value={settings.general.siteUrl}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  general: { ...prev.general, siteUrl: e.target.value }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
            <textarea
              value={settings.general.siteDescription}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  general: { ...prev.general, siteDescription: e.target.value }
                }))
                setHasChanges(true)
              }}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
            <input
              type="email"
              value={settings.general.adminEmail}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  general: { ...prev.general, adminEmail: e.target.value }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={settings.general.timezone}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  general: { ...prev.general, timezone: e.target.value }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Asia/Jakarta">Asia/Jakarta (UTC+7)</option>
              <option value="America/New_York">America/New_York (UTC-5)</option>
              <option value="Europe/London">Europe/London (UTC+0)</option>
              <option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Language</label>
            <select
              value={settings.general.language}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  general: { ...prev.general, language: e.target.value }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="id">Bahasa Indonesia</option>
              <option value="zh">中文</option>
              <option value="ja">日本語</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
            <select
              value={settings.general.dateFormat}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  general: { ...prev.general, dateFormat: e.target.value }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">System Gear</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Maintenance Mode</h4>
              <p className="text-sm text-gray-500">Temporarily disable site access for maintenance</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.general.maintenanceMode}
                onChange={(e) => {
                  setGear(prev => ({
                    ...prev,
                    general: { ...prev.general, maintenanceMode: e.target.checked }
                  }))
                  setHasChanges(true)
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Allow User Registration</h4>
              <p className="text-sm text-gray-500">Allow new users to register accounts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.general.allowRegistration}
                onChange={(e) => {
                  setGear(prev => ({
                    ...prev,
                    general: { ...prev.general, allowRegistration: e.target.checked }
                  }))
                  setHasChanges(true)
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Require Email Verification</h4>
              <p className="text-sm text-gray-500">New users must verify their email address</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.general.requireEmailVerification}
                onChange={(e) => {
                  setGear(prev => ({
                    ...prev,
                    general: { ...prev.general, requireEmailVerification: e.target.checked }
                  }))
                  setHasChanges(true)
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </Card>
    </div>
  )

  const AppearanceTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Theme Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Default Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'auto', label: 'Auto' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => {
                    setGear(prev => ({
                      ...prev,
                      appearance: { ...prev.appearance, theme: value as any }
                    }))
                    setHasChanges(true)
                  }}
                  className={`p-3 border-2 rounded-lg transition-colors ${
                    settings.appearance.theme === value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
            <select
              value={settings.appearance.fontFamily}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  appearance: { ...prev.appearance, fontFamily: e.target.value }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Poppins">Poppins</option>
              <option value="Lato">Lato</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
            <div className="flex space-x-2">
              <input
                type="color"
                value={settings.appearance.primaryColor}
                onChange={(e) => {
                  setGear(prev => ({
                    ...prev,
                    appearance: { ...prev.appearance, primaryColor: e.target.value }
                  }))
                  setHasChanges(true)
                }}
                className="w-16 h-10 border border-gray-300 rounded-md cursor-pointer"
              />
              <input
                type="text"
                value={settings.appearance.primaryColor}
                onChange={(e) => {
                  setGear(prev => ({
                    ...prev,
                    appearance: { ...prev.appearance, primaryColor: e.target.value }
                  }))
                  setHasChanges(true)
                }}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#3B82F6"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
            <div className="flex space-x-2">
              <input
                type="color"
                value={settings.appearance.secondaryColor}
                onChange={(e) => {
                  setGear(prev => ({
                    ...prev,
                    appearance: { ...prev.appearance, secondaryColor: e.target.value }
                  }))
                  setHasChanges(true)
                }}
                className="w-16 h-10 border border-gray-300 rounded-md cursor-pointer"
              />
              <input
                type="text"
                value={settings.appearance.secondaryColor}
                onChange={(e) => {
                  setGear(prev => ({
                    ...prev,
                    appearance: { ...prev.appearance, secondaryColor: e.target.value }
                  }))
                  setHasChanges(true)
                }}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#6B7280"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
            <input
              type="url"
              value={settings.appearance.logoUrl}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  appearance: { ...prev.appearance, logoUrl: e.target.value }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="/logo.png"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Favicon URL</label>
            <input
              type="url"
              value={settings.appearance.faviconUrl}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  appearance: { ...prev.appearance, faviconUrl: e.target.value }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="/favicon.ico"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Layout Options</h3>
        
        <div className="space-y-4">
          {[
            { key: 'compactMode', label: 'Compact Mode', description: 'Reduce spacing and padding' },
            { key: 'showBreadcrumbs', label: 'Show Breadcrumbs', description: 'Display navigation breadcrumbs' },
            { key: 'showSidebar', label: 'Show Sidebar', description: 'Display navigation sidebar' },
            { key: 'sidebarCollapsed', label: 'Sidebar Collapsed', description: 'Start with collapsed sidebar' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{label}</h4>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.appearance[key as keyof typeof settings.appearance] as boolean}
                  onChange={(e) => {
                    setGear(prev => ({
                      ...prev,
                      appearance: { ...prev.appearance, [key]: e.target.checked }
                    }))
                    setHasChanges(true)
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Custom CSS</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Additional CSS</label>
          <textarea
            value={settings.appearance.customCSS}
            onChange={(e) => {
              setGear(prev => ({
                ...prev,
                appearance: { ...prev.appearance, customCSS: e.target.value }
              }))
              setHasChanges(true)
            }}
            rows={10}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="/* Add your custom CSS here */"
          />
          <p className="text-xs text-gray-500 mt-2">Custom CSS will be applied to all pages. Use with caution.</p>
        </div>
      </Card>
    </div>
  )

  const PerformanceTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Caching & Optimization</h3>
        
        <div className="space-y-4">
          {[
            { key: 'cacheEnabled', label: 'Enable Caching', description: 'Cache pages and API responses for better performance' },
            { key: 'compressionEnabled', label: 'Enable Compression', description: 'Compress responses to reduce bandwidth usage' },
            { key: 'minifyAssets', label: 'Minify Assets', description: 'Minify CSS and JavaScript files' },
            { key: 'lazyLoading', label: 'Lazy Loading', description: 'Load images and content when needed' },
            { key: 'imageOptimization', label: 'Image Optimization', description: 'Automatically optimize image sizes and formats' },
            { key: 'cdnEnabled', label: 'CDN Enabled', description: 'Use Content Delivery Network for static assets' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{label}</h4>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.performance[key as keyof typeof settings.performance] as boolean}
                  onChange={(e) => {
                    setGear(prev => ({
                      ...prev,
                      performance: { ...prev.performance, [key]: e.target.checked }
                    }))
                    setHasChanges(true)
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Gear</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cache Duration (seconds)</label>
            <input
              type="number"
              value={settings.performance.cacheDuration}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  performance: { ...prev.performance, cacheDuration: parseInt(e.target.value) }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CDN URL</label>
            <input
              type="url"
              value={settings.performance.cdnUrl}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  performance: { ...prev.performance, cdnUrl: e.target.value }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://cdn.example.com"
            />
          </div>
        </div>
      </Card>
    </div>
  )

  const SecurityTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Features</h3>
        
        <div className="space-y-4">
          {[
            { key: 'httpsRedirect', label: 'HTTPS Redirect', description: 'Automatically redirect HTTP traffic to HTTPS' },
            { key: 'corsEnabled', label: 'CORS Protection', description: 'Enable Cross-Origin Resource Sharing protection' },
            { key: 'csrfProtection', label: 'CSRF Protection', description: 'Protect against Cross-Site Request Forgery attacks' },
            { key: 'rateLimitEnabled', label: 'Rate Limiting', description: 'Limit the number of requests per time window' },
            { key: 'requireStrongPasswords', label: 'Strong Passwords', description: 'Require complex passwords with special characters' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{label}</h4>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.security[key as keyof typeof settings.security] as boolean}
                  onChange={(e) => {
                    setGear(prev => ({
                      ...prev,
                      security: { ...prev.security, [key]: e.target.checked }
                    }))
                    setHasChanges(true)
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rate Limit (requests per window)</label>
            <input
              type="number"
              value={settings.security.rateLimitRequests}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  security: { ...prev.security, rateLimitRequests: parseInt(e.target.value) }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rate Limit Window (minutes)</label>
            <input
              type="number"
              value={settings.security.rateLimitWindow}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  security: { ...prev.security, rateLimitWindow: parseInt(e.target.value) }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              value={settings.security.sessionTimeout}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Password Length</label>
            <input
              type="number"
              value={settings.security.passwordMinLength}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  security: { ...prev.security, passwordMinLength: parseInt(e.target.value) }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Allowed Origins</h3>
        
        <div className="space-y-2">
          {settings.security.allowedOrigins.map((origin, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="url"
                value={origin}
                onChange={(e) => {
                  const newOrigins = [...settings.security.allowedOrigins]
                  newOrigins[index] = e.target.value
                  setGear(prev => ({
                    ...prev,
                    security: { ...prev.security, allowedOrigins: newOrigins }
                  }))
                  setHasChanges(true)
                }}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newOrigins = settings.security.allowedOrigins.filter((_, i) => i !== index)
                  setGear(prev => ({
                    ...prev,
                    security: { ...prev.security, allowedOrigins: newOrigins }
                  }))
                  setHasChanges(true)
                }}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setGear(prev => ({
                ...prev,
                security: { ...prev.security, allowedOrigins: [...prev.security.allowedOrigins, ''] }
              }))
              setHasChanges(true)
            }}
          >
            Add Origin
          </Button>
        </div>
      </Card>
    </div>
  )

  const SEOTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">SEO Gear</h3>
        
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
            <input
              type="text"
              value={settings.seo.metaTitle}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  seo: { ...prev.seo, metaTitle: e.target.value }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
            <textarea
              value={settings.seo.metaDescription}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  seo: { ...prev.seo, metaDescription: e.target.value }
                }))
                setHasChanges(true)
              }}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meta Keywords</label>
            <input
              type="text"
              value={settings.seo.metaKeywords}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  seo: { ...prev.seo, metaKeywords: e.target.value }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Robots.txt</label>
            <textarea
              value={settings.seo.robotsTxt}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  seo: { ...prev.seo, robotsTxt: e.target.value }
                }))
                setHasChanges(true)
              }}
              rows={6}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Analytics & Tracking</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Google Analytics ID</label>
            <input
              type="text"
              value={settings.seo.googleAnalyticsId}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  seo: { ...prev.seo, googleAnalyticsId: e.target.value }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="G-XXXXXXXXXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Google Tag Manager ID</label>
            <input
              type="text"
              value={settings.seo.googleTagManagerId}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  seo: { ...prev.seo, googleTagManagerId: e.target.value }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="GTM-XXXXXXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Facebook Pixel ID</label>
            <input
              type="text"
              value={settings.seo.facebookPixelId}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  seo: { ...prev.seo, facebookPixelId: e.target.value }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123456789012345"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Social Media</h3>
        
        <div className="space-y-4">
          {[
            { key: 'sitemapEnabled', label: 'Enable Sitemap', description: 'Generate XML sitemap for search engines' },
            { key: 'openGraphEnabled', label: 'Open Graph Tags', description: 'Enable Facebook and social media sharing tags' },
            { key: 'twitterCardEnabled', label: 'Twitter Cards', description: 'Enable Twitter card meta tags' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{label}</h4>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.seo[key as keyof typeof settings.seo] as boolean}
                  onChange={(e) => {
                    setGear(prev => ({
                      ...prev,
                      seo: { ...prev.seo, [key]: e.target.checked }
                    }))
                    setHasChanges(true)
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )

  const EmailTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">SMTP Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
            <input
              type="text"
              value={settings.email.smtpHost}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  email: { ...prev.email, smtpHost: e.target.value }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
            <input
              type="number"
              value={settings.email.smtpPort}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  email: { ...prev.email, smtpPort: parseInt(e.target.value) }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
            <input
              type="text"
              value={settings.email.smtpUsername}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  email: { ...prev.email, smtpUsername: e.target.value }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
            <input
              type="password"
              value={settings.email.smtpPassword}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  email: { ...prev.email, smtpPassword: e.target.value }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Encryption</label>
            <select
              value={settings.email.smtpEncryption}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  email: { ...prev.email, smtpEncryption: e.target.value as any }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">None</option>
              <option value="tls">TLS</option>
              <option value="ssl">SSL</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
            <input
              type="email"
              value={settings.email.fromEmail}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  email: { ...prev.email, fromEmail: e.target.value }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
            <input
              type="text"
              value={settings.email.fromName}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  email: { ...prev.email, fromName: e.target.value }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Test Email</label>
            <div className="flex space-x-2">
              <input
                type="email"
                value={settings.email.testEmail}
                onChange={(e) => {
                  setGear(prev => ({
                    ...prev,
                    email: { ...prev.email, testEmail: e.target.value }
                  }))
                  setHasChanges(true)
                }}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={handleTestEmail} className="whitespace-nowrap">
                Send Test
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )

  const BackupTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Backup Configuration</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Auto Backup</h4>
              <p className="text-sm text-gray-500">Automatically backup data at scheduled intervals</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.backup.autoBackup}
                onChange={(e) => {
                  setGear(prev => ({
                    ...prev,
                    backup: { ...prev.backup, autoBackup: e.target.checked }
                  }))
                  setHasChanges(true)
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Backup Gear</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
            <select
              value={settings.backup.backupFrequency}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  backup: { ...prev.backup, backupFrequency: e.target.value as any }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Retention Period (days)</label>
            <input
              type="number"
              value={settings.backup.backupRetention}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  backup: { ...prev.backup, backupRetention: parseInt(e.target.value) }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Backup Location</label>
            <select
              value={settings.backup.backupLocation}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  backup: { ...prev.backup, backupLocation: e.target.value as any }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="local">Local Storage</option>
              <option value="cloud">Cloud Storage</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cloud Provider</label>
            <select
              value={settings.backup.cloudProvider}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  backup: { ...prev.backup, cloudProvider: e.target.value }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={settings.backup.backupLocation === 'local'}
            >
              <option value="aws">Amazon S3</option>
              <option value="gcp">Google Cloud Storage</option>
              <option value="azure">Azure Blob Storage</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Backup Status</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Last Backup</p>
            <p className="text-lg font-semibold text-gray-900">
              {mounted ? new Date(settings.backup.lastBackup).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-500">Next Backup</p>
            <p className="text-lg font-semibold text-gray-900">
              {mounted ? new Date(settings.backup.nextBackup).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
            </p>
          </div>
          
          <div className="text-center">
            <Button onClick={handleBackupNow} className="w-full">
              Backup Now
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralTab />
      case 'appearance':
        return <AppearanceTab />
      case 'performance':
        return <PerformanceTab />
      case 'security':
        return <SecurityTab />
      case 'seo':
        return <SEOTab />
      case 'email':
        return <EmailTab />
      case 'backup':
        return <BackupTab />
      default:
        return <GeneralTab />
    }
  }

  return (
    <TwoLevelLayout>
      <Header 
        title="Web Gear"
        description="Configure website appearance, performance, and functionality"
        breadcrumbs={breadcrumbs}
      />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Changes Alert */}
        {hasChanges && (
          <Card className="p-4 border-orange-200 bg-orange-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 bg-orange-600/20 rounded" />
                <span className="text-sm font-medium text-orange-800">You have unsaved changes</span>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => setHasChanges(false)}>
                  Discard
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <div className="h-5 w-5 bg-green-600/20 rounded" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">System Status</p>
                <p className="text-lg font-bold text-green-600">Online</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <div className="h-5 w-5 bg-blue-600/20 rounded" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-lg font-bold text-blue-600">99.9%</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <div className="h-5 w-5 bg-purple-600/20 rounded" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-lg font-bold text-purple-600">156</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <div className="h-5 w-5 bg-orange-600/20 rounded" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Version</p>
                <p className="text-lg font-bold text-orange-600">v2.1.0</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <Card className="p-1">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </TwoLevelLayout>
  )
}
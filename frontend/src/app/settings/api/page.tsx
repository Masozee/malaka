'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface APIKey {
  id: string
  name: string
  key: string
  type: 'read' | 'write' | 'admin'
  status: 'active' | 'inactive' | 'expired'
  lastUsed: string
  requests: number
  rateLimit: number
  expiresAt?: string
  permissions: string[]
}

interface APIGear {
  general: {
    baseUrl: string
    version: string
    timeout: number
    retryAttempts: number
    enableCors: boolean
    allowedOrigins: string[]
    enableCompression: boolean
    enableCaching: boolean
    cacheTtl: number
  }
  security: {
    enableApiKeys: boolean
    requireAuthentication: boolean
    enableRateLimit: boolean
    defaultRateLimit: number
    rateLimitWindow: number
    enableRequestLogging: boolean
    logRetentionDays: number
    enableIpWhitelist: boolean
    whitelistedIps: string[]
  }
  database: {
    host: string
    port: number
    database: string
    username: string
    password: string
    connectionPool: number
    connectionTimeout: number
    enableSsl: boolean
    sslMode: 'require' | 'prefer' | 'disable'
  }
  monitoring: {
    enableHealthCheck: boolean
    healthCheckInterval: number
    enableMetrics: boolean
    metricsEndpoint: string
    enableAlerts: boolean
    alertThresholds: {
      responseTime: number
      errorRate: number
      requestsPerSecond: number
    }
  }
}

export default function APIGearPage() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [hasChanges, setHasChanges] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)
  const [settings, setGear] = useState<APIGear>({
    general: {
      baseUrl: 'https://api.malaka.com',
      version: 'v1',
      timeout: 30000,
      retryAttempts: 3,
      enableCors: true,
      allowedOrigins: ['https://malaka.com', 'https://app.malaka.com'],
      enableCompression: true,
      enableCaching: true,
      cacheTtl: 3600
    },
    security: {
      enableApiKeys: true,
      requireAuthentication: true,
      enableRateLimit: true,
      defaultRateLimit: 1000,
      rateLimitWindow: 3600,
      enableRequestLogging: true,
      logRetentionDays: 90,
      enableIpWhitelist: false,
      whitelistedIps: []
    },
    database: {
      host: 'localhost',
      port: 5432,
      database: 'malaka_erp',
      username: 'malaka_user',
      password: '',
      connectionPool: 10,
      connectionTimeout: 5000,
      enableSsl: true,
      sslMode: 'require'
    },
    monitoring: {
      enableHealthCheck: true,
      healthCheckInterval: 30,
      enableMetrics: true,
      metricsEndpoint: '/api/metrics',
      enableAlerts: true,
      alertThresholds: {
        responseTime: 1000,
        errorRate: 5,
        requestsPerSecond: 100
      }
    }
  })

  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Frontend Application',
      key: 'mk_live_1234567890abcdef',
      type: 'read',
      status: 'active',
      lastUsed: '2024-07-25T10:30:00Z',
      requests: 156432,
      rateLimit: 1000,
      permissions: ['read:users', 'read:products', 'read:orders']
    },
    {
      id: '2',
      name: 'Mobile App',
      key: 'mk_live_abcdef1234567890',
      type: 'write',
      status: 'active',
      lastUsed: '2024-07-25T09:15:00Z',
      requests: 89456,
      rateLimit: 500,
      permissions: ['read:users', 'write:orders', 'read:products']
    },
    {
      id: '3',
      name: 'Analytics Service',
      key: 'mk_live_fedcba0987654321',
      type: 'read',
      status: 'inactive',
      lastUsed: '2024-07-20T14:22:00Z',
      requests: 234567,
      rateLimit: 2000,
      expiresAt: '2024-12-31T23:59:59Z',
      permissions: ['read:analytics', 'read:reports']
    }
  ])

  useEffect(() => {
    setMounted(true)
  }, [])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Gear', href: '/settings' },
    { label: 'API Gear' }
  ]

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'general', label: 'General' },
    { id: 'security', label: 'Security' },
    { id: 'database', label: 'Database' },
    { id: 'monitoring', label: 'Monitoring' },
    { id: 'api-keys', label: 'API Keys' }
  ]

  const handleSave = () => {
    setHasChanges(false)
  }

  const handleTestConnection = () => {
    console.log('Testing database connection...')
  }

  const handleRegenerateKey = (keyId: string) => {
    console.log('Regenerating API key:', keyId)
  }

  const handleDeleteKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* API Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
              <div className="h-5 w-5 bg-green-600/20 rounded" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">API Status</p>
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
              <p className="text-sm font-medium text-gray-600">Response Time</p>
              <p className="text-lg font-bold text-blue-600">245ms</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
              <div className="h-5 w-5 bg-purple-600/20 rounded" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Requests/min</p>
              <p className="text-lg font-bold text-purple-600">1,247</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
              <div className="h-5 w-5 bg-orange-600/20 rounded" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Uptime</p>
              <p className="text-lg font-bold text-orange-600">99.9%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">API Endpoints</h3>
          <div className="space-y-3">
            {[
              { endpoint: '/api/v1/users', method: 'GET', status: 'healthy', responseTime: '120ms' },
              { endpoint: '/api/v1/products', method: 'GET', status: 'healthy', responseTime: '89ms' },
              { endpoint: '/api/v1/orders', method: 'POST', status: 'healthy', responseTime: '245ms' },
              { endpoint: '/api/v1/auth/login', method: 'POST', status: 'healthy', responseTime: '156ms' }
            ].map((endpoint, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant={endpoint.method === 'GET' ? 'secondary' : 'default'} className="text-xs">
                    {endpoint.method}
                  </Badge>
                  <span className="font-mono text-sm">{endpoint.endpoint}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{endpoint.responseTime}</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active API Keys</h3>
          <div className="space-y-3">
            {apiKeys.filter(key => key.status === 'active').map((key) => (
              <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{key.name}</p>
                  <p className="text-sm text-gray-500">
                    {mounted ? `${key.requests.toLocaleString()} requests` : ''}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="text-xs">
                    {key.type}
                  </Badge>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )

  const GeneralTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">API Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Base URL</label>
            <input
              type="url"
              value={settings.general.baseUrl}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  general: { ...prev.general, baseUrl: e.target.value }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Version</label>
            <input
              type="text"
              value={settings.general.version}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  general: { ...prev.general, version: e.target.value }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Request Timeout (ms)</label>
            <input
              type="number"
              value={settings.general.timeout}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  general: { ...prev.general, timeout: parseInt(e.target.value) }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Retry Attempts</label>
            <input
              type="number"
              value={settings.general.retryAttempts}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  general: { ...prev.general, retryAttempts: parseInt(e.target.value) }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cache TTL (seconds)</label>
            <input
              type="number"
              value={settings.general.cacheTtl}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  general: { ...prev.general, cacheTtl: parseInt(e.target.value) }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">API Features</h3>
        
        <div className="space-y-4">
          {[
            { key: 'enableCors', label: 'Enable CORS', description: 'Allow cross-origin resource sharing' },
            { key: 'enableCompression', label: 'Enable Compression', description: 'Compress API responses to reduce bandwidth' },
            { key: 'enableCaching', label: 'Enable Caching', description: 'Cache API responses for better performance' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{label}</h4>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.general[key as keyof typeof settings.general] as boolean}
                  onChange={(e) => {
                    setGear(prev => ({
                      ...prev,
                      general: { ...prev.general, [key]: e.target.checked }
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

  const SecurityTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Features</h3>
        
        <div className="space-y-4">
          {[
            { key: 'enableApiKeys', label: 'API Key Authentication', description: 'Require API keys for all requests' },
            { key: 'requireAuthentication', label: 'User Authentication', description: 'Require user authentication for protected endpoints' },
            { key: 'enableRateLimit', label: 'Rate Limiting', description: 'Limit the number of requests per time window' },
            { key: 'enableRequestLogging', label: 'Request Logging', description: 'Log all API requests for security monitoring' },
            { key: 'enableIpWhitelist', label: 'IP Whitelist', description: 'Only allow requests from whitelisted IP addresses' }
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Rate Limit (requests/hour)</label>
            <input
              type="number"
              value={settings.security.defaultRateLimit}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  security: { ...prev.security, defaultRateLimit: parseInt(e.target.value) }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rate Limit Window (seconds)</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Log Retention (days)</label>
            <input
              type="number"
              value={settings.security.logRetentionDays}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  security: { ...prev.security, logRetentionDays: parseInt(e.target.value) }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Card>
    </div>
  )

  const DatabaseTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Database Connection</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Host</label>
            <input
              type="text"
              value={settings.database.host}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  database: { ...prev.database, host: e.target.value }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Port</label>
            <input
              type="number"
              value={settings.database.port}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  database: { ...prev.database, port: parseInt(e.target.value) }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Database</label>
            <input
              type="text"
              value={settings.database.database}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  database: { ...prev.database, database: e.target.value }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={settings.database.username}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  database: { ...prev.database, username: e.target.value }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="flex space-x-2">
              <input
                type={showPasswords ? "text" : "password"}
                value={settings.database.password}
                onChange={(e) => {
                  setGear(prev => ({
                    ...prev,
                    database: { ...prev.database, password: e.target.value }
                  }))
                  setHasChanges(true)
                }}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswords(!showPasswords)}
              >
                {showPasswords ? 'Hide' : 'Show'}
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Connection Pool Size</label>
            <input
              type="number"
              value={settings.database.connectionPool}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  database: { ...prev.database, connectionPool: parseInt(e.target.value) }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Connection Timeout (ms)</label>
            <input
              type="number"
              value={settings.database.connectionTimeout}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  database: { ...prev.database, connectionTimeout: parseInt(e.target.value) }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SSL Mode</label>
            <select
              value={settings.database.sslMode}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  database: { ...prev.database, sslMode: e.target.value as any }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="require">Require</option>
              <option value="prefer">Prefer</option>
              <option value="disable">Disable</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex space-x-2">
          <Button onClick={handleTestConnection}>
            Test Connection
          </Button>
        </div>
      </Card>
    </div>
  )

  const MonitoringTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Monitoring Features</h3>
        
        <div className="space-y-4">
          {[
            { key: 'enableHealthCheck', label: 'Health Check', description: 'Regular health check endpoint monitoring' },
            { key: 'enableMetrics', label: 'Metrics Collection', description: 'Collect and expose API metrics' },
            { key: 'enableAlerts', label: 'Alert System', description: 'Send alerts when thresholds are exceeded' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{label}</h4>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.monitoring[key as keyof typeof settings.monitoring] as boolean}
                  onChange={(e) => {
                    setGear(prev => ({
                      ...prev,
                      monitoring: { ...prev.monitoring, [key]: e.target.checked }
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
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Alert Thresholds</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Response Time (ms)</label>
            <input
              type="number"
              value={settings.monitoring.alertThresholds.responseTime}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  monitoring: { 
                    ...prev.monitoring, 
                    alertThresholds: { 
                      ...prev.monitoring.alertThresholds, 
                      responseTime: parseInt(e.target.value) 
                    }
                  }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Error Rate (%)</label>
            <input
              type="number"
              value={settings.monitoring.alertThresholds.errorRate}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  monitoring: { 
                    ...prev.monitoring, 
                    alertThresholds: { 
                      ...prev.monitoring.alertThresholds, 
                      errorRate: parseInt(e.target.value) 
                    }
                  }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Requests/Second</label>
            <input
              type="number"
              value={settings.monitoring.alertThresholds.requestsPerSecond}
              onChange={(e) => {
                setGear(prev => ({
                  ...prev,
                  monitoring: { 
                    ...prev.monitoring, 
                    alertThresholds: { 
                      ...prev.monitoring.alertThresholds, 
                      requestsPerSecond: parseInt(e.target.value) 
                    }
                  }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Card>
    </div>
  )

  const APIKeysTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">API Keys</h3>
          <Button>
            Create API Key
          </Button>
        </div>
        
        <div className="space-y-4">
          {apiKeys.map((key) => (
            <div key={key.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">{key.name}</h4>
                    <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                      {key.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {key.type}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                      {key.key.slice(0, 20)}...
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(key.key)}
                    >
                      Copy
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Last Used</p>
                      <p className="font-medium">
                        {mounted ? new Date(key.lastUsed).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Requests</p>
                      <p className="font-medium">
                        {mounted ? key.requests.toLocaleString() : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Rate Limit</p>
                      <p className="font-medium">{key.rateLimit}/hour</p>
                    </div>
                    {key.expiresAt && (
                      <div>
                        <p className="text-gray-500">Expires</p>
                        <p className="font-medium">
                          {mounted ? new Date(key.expiresAt).toLocaleDateString() : ''}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm text-gray-500 mb-1">Permissions:</p>
                    <div className="flex flex-wrap gap-1">
                      {key.permissions.map((permission, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRegenerateKey(key.id)}
                  >
                    Regenerate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteKey(key.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />
      case 'general':
        return <GeneralTab />
      case 'security':
        return <SecurityTab />
      case 'database':
        return <DatabaseTab />
      case 'monitoring':
        return <MonitoringTab />
      case 'api-keys':
        return <APIKeysTab />
      default:
        return <OverviewTab />
    }
  }

  return (
    <TwoLevelLayout>
      <Header 
        title="API Gear"
        description="Configure API endpoints, security, and monitoring"
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
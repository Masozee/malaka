'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Wrench,
  Database,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Settings,
  Calendar,
  Mail,
  Printer,
  Camera,
  QrCode,
  BarChart3,
  Users,
  Package,
  Truck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Server,
  Play,
  Pause,
  StopCircle,
  Edit,
  Save,
  X,
  Plus,
  Zap,
  Shield,
  Search,
  ExternalLink,
  Settings as Tool
} from 'lucide-react'

interface SystemTool {
  id: string
  name: string
  description: string
  category: 'maintenance' | 'backup' | 'import' | 'export' | 'sync' | 'utility'
  status: 'idle' | 'running' | 'completed' | 'failed'
  lastRun?: string
  nextRun?: string
  duration?: number
  enabled: boolean
  schedule?: string
  config: Record<string, any>
}

interface ToolsSettings {
  maintenance: {
    autoCleanup: boolean
    cleanupFrequency: 'daily' | 'weekly' | 'monthly'
    retentionDays: number
    vacuumDatabase: boolean
    optimizeImages: boolean
    clearCache: boolean
    cleanLogs: boolean
  }
  backup: {
    autoBackup: boolean
    backupSchedule: string
    backupRetention: number
    includeUploads: boolean
    compressBackups: boolean
    encryptBackups: boolean
    backupLocation: 'local' | 'cloud'
    cloudProvider: string
  }
  sync: {
    enableSync: boolean
    syncInterval: number
    syncEndpoints: string[]
    conflictResolution: 'merge' | 'overwrite' | 'manual'
    enableWebhooks: boolean
    webhookUrls: string[]
  }
  notifications: {
    enableEmail: boolean
    enableSlack: boolean
    enableWebhooks: boolean
    emailRecipients: string[]
    slackChannel: string
    webhookUrl: string
  }
}

export default function ToolsSettingsPage() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('tools')
  const [hasChanges, setHasChanges] = useState(false)
  const [settings, setSettings] = useState<ToolsSettings>({
    maintenance: {
      autoCleanup: true,
      cleanupFrequency: 'weekly',
      retentionDays: 90,
      vacuumDatabase: true,
      optimizeImages: true,
      clearCache: true,
      cleanLogs: true
    },
    backup: {
      autoBackup: true,
      backupSchedule: '0 2 * * *',
      backupRetention: 30,
      includeUploads: true,
      compressBackups: true,
      encryptBackups: true,
      backupLocation: 'cloud',
      cloudProvider: 'aws'
    },
    sync: {
      enableSync: false,
      syncInterval: 60,
      syncEndpoints: [],
      conflictResolution: 'merge',
      enableWebhooks: true,
      webhookUrls: []
    },
    notifications: {
      enableEmail: true,
      enableSlack: false,
      enableWebhooks: false,
      emailRecipients: ['admin@malaka.com'],
      slackChannel: '#system-alerts',
      webhookUrl: ''
    }
  })

  const [tools, setTools] = useState<SystemTool[]>([
    {
      id: '1',
      name: 'Database Cleanup',
      description: 'Clean up temporary data and optimize database performance',
      category: 'maintenance',
      status: 'completed',
      lastRun: '2024-07-25T02:00:00Z',
      nextRun: '2024-08-01T02:00:00Z',
      duration: 45000,
      enabled: true,
      schedule: '0 2 * * 0',
      config: { tables: ['temp_data', 'logs'], vacuum: true }
    },
    {
      id: '2',
      name: 'Data Export',
      description: 'Export system data to external formats (CSV, JSON, XML)',
      category: 'export',
      status: 'idle',
      enabled: true,
      config: { format: 'csv', includeDeleted: false }
    },
    {
      id: '3',
      name: 'Inventory Sync',
      description: 'Synchronize inventory data with external systems',
      category: 'sync',
      status: 'running',
      lastRun: '2024-07-25T10:00:00Z',
      duration: 120000,
      enabled: true,
      schedule: '0 */4 * * *',
      config: { endpoint: 'https://api.warehouse.com', timeout: 30000 }
    },
    {
      id: '4',
      name: 'System Backup',
      description: 'Create complete system backup including database and files',
      category: 'backup',
      status: 'completed',
      lastRun: '2024-07-25T02:30:00Z',
      nextRun: '2024-07-26T02:30:00Z',
      duration: 180000,
      enabled: true,
      schedule: '30 2 * * *',
      config: { compress: true, encrypt: true, location: 'cloud' }
    },
    {
      id: '5',
      name: 'Report Generator',
      description: 'Generate automated reports for business intelligence',
      category: 'utility',
      status: 'idle',
      enabled: true,
      config: { reports: ['sales', 'inventory', 'financial'], format: 'pdf' }
    },
    {
      id: '6',
      name: 'User Import',
      description: 'Import user data from CSV or external systems',
      category: 'import',
      status: 'failed',
      lastRun: '2024-07-24T14:30:00Z',
      duration: 15000,
      enabled: false,
      config: { source: 'csv', validateEmails: true, sendWelcome: false }
    },
    {
      id: '7',
      name: 'Cache Warmup',
      description: 'Pre-load frequently accessed data into cache',
      category: 'utility',
      status: 'completed',
      lastRun: '2024-07-25T06:00:00Z',
      nextRun: '2024-07-25T18:00:00Z',
      duration: 30000,
      enabled: true,
      schedule: '0 6,18 * * *',
      config: { pages: ['dashboard', 'products'], ttl: 3600 }
    },
    {
      id: '8',
      name: 'Image Optimization',
      description: 'Optimize and compress product images for better performance',
      category: 'maintenance',
      status: 'idle',
      enabled: true,
      config: { quality: 85, formats: ['webp', 'jpg'], maxWidth: 1200 }
    }
  ])

  useEffect(() => {
    setMounted(true)
  }, [])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings', href: '/settings' },
    { label: 'Tools Settings' }
  ]

  const tabs = [
    { id: 'tools', label: 'System Tools', icon: Wrench },
    { id: 'maintenance', label: 'Maintenance', icon: Settings },
    { id: 'backup', label: 'Backup', icon: Download },
    { id: 'sync', label: 'Sync & Integration', icon: RefreshCw },
    { id: 'notifications', label: 'Notifications', icon: Mail }
  ]

  const handleSave = () => {
    setHasChanges(false)
  }

  const handleRunTool = (toolId: string) => {
    setTools(prev => prev.map(tool => 
      tool.id === toolId 
        ? { ...tool, status: 'running' as const }
        : tool
    ))
    
    setTimeout(() => {
      setTools(prev => prev.map(tool => 
        tool.id === toolId 
          ? { 
              ...tool, 
              status: 'completed' as const, 
              lastRun: new Date().toISOString(),
              duration: Math.floor(Math.random() * 60000) + 10000
            }
          : tool
      ))
    }, 3000)
  }

  const handleStopTool = (toolId: string) => {
    setTools(prev => prev.map(tool => 
      tool.id === toolId 
        ? { ...tool, status: 'idle' as const }
        : tool
    ))
  }

  const handleToggleTool = (toolId: string) => {
    setTools(prev => prev.map(tool => 
      tool.id === toolId 
        ? { ...tool, enabled: !tool.enabled }
        : tool
    ))
  }

  const getStatusIcon = (status: SystemTool['status']) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: SystemTool['status']) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: SystemTool['category']) => {
    switch (category) {
      case 'maintenance':
        return <Wrench className="h-4 w-4" />
      case 'backup':
        return <Download className="h-4 w-4" />
      case 'import':
        return <Upload className="h-4 w-4" />
      case 'export':
        return <FileText className="h-4 w-4" />
      case 'sync':
        return <RefreshCw className="h-4 w-4" />
      case 'utility':
        return <Tool className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  const ToolsTab = () => (
    <div className="space-y-6">
      {/* Tools Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Running Tools</p>
              <p className="text-lg font-bold text-blue-600">
                {tools.filter(t => t.status === 'running').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-lg font-bold text-green-600">
                {tools.filter(t => t.status === 'completed').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-lg font-bold text-red-600">
                {tools.filter(t => t.status === 'failed').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Settings className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Enabled</p>
              <p className="text-lg font-bold text-purple-600">
                {tools.filter(t => t.enabled).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tools List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Available Tools</h3>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Tool
          </Button>
        </div>
        
        <div className="space-y-4">
          {tools.map((tool) => (
            <div key={tool.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-1.5 bg-gray-100 rounded">
                      {getCategoryIcon(tool.category)}
                    </div>
                    <h4 className="font-medium text-gray-900">{tool.name}</h4>
                    <Badge className={`text-xs ${getStatusColor(tool.status)}`}>
                      {tool.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">
                      {tool.category}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {tool.lastRun && (
                      <div>
                        <p className="text-gray-500">Last Run</p>
                        <p className="font-medium">
                          {mounted ? new Date(tool.lastRun).toLocaleDateString() : ''}
                        </p>
                      </div>
                    )}
                    {tool.nextRun && (
                      <div>
                        <p className="text-gray-500">Next Run</p>
                        <p className="font-medium">
                          {mounted ? new Date(tool.nextRun).toLocaleDateString() : ''}
                        </p>
                      </div>
                    )}
                    {tool.duration && (
                      <div>
                        <p className="text-gray-500">Duration</p>
                        <p className="font-medium">
                          {mounted ? `${Math.round(tool.duration / 1000)}s` : ''}
                        </p>
                      </div>
                    )}
                    {tool.schedule && (
                      <div>
                        <p className="text-gray-500">Schedule</p>
                        <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                          {tool.schedule}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={tool.enabled}
                      onChange={() => handleToggleTool(tool.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  
                  {tool.status === 'running' ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStopTool(tool.id)}
                    >
                      <StopCircle className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRunTool(tool.id)}
                      disabled={!tool.enabled}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )

  const MaintenanceTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Automatic Maintenance</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Auto Cleanup</h4>
              <p className="text-sm text-gray-500">Automatically clean up temporary files and optimize system</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.maintenance.autoCleanup}
                onChange={(e) => {
                  setSettings(prev => ({
                    ...prev,
                    maintenance: { ...prev.maintenance, autoCleanup: e.target.checked }
                  }))
                  setHasChanges(true)
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {[
            { key: 'vacuumDatabase', label: 'Vacuum Database', description: 'Optimize database storage and performance' },
            { key: 'optimizeImages', label: 'Optimize Images', description: 'Compress and optimize uploaded images' },
            { key: 'clearCache', label: 'Clear Cache', description: 'Clear expired cache entries' },
            { key: 'cleanLogs', label: 'Clean Logs', description: 'Remove old log files' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{label}</h4>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.maintenance[key as keyof typeof settings.maintenance] as boolean}
                  onChange={(e) => {
                    setSettings(prev => ({
                      ...prev,
                      maintenance: { ...prev.maintenance, [key]: e.target.checked }
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
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Maintenance Schedule</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cleanup Frequency</label>
            <select
              value={settings.maintenance.cleanupFrequency}
              onChange={(e) => {
                setSettings(prev => ({
                  ...prev,
                  maintenance: { ...prev.maintenance, cleanupFrequency: e.target.value as any }
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Data Retention (days)</label>
            <input
              type="number"
              value={settings.maintenance.retentionDays}
              onChange={(e) => {
                setSettings(prev => ({
                  ...prev,
                  maintenance: { ...prev.maintenance, retentionDays: parseInt(e.target.value) }
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

  const BackupTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Backup Configuration</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Auto Backup</h4>
              <p className="text-sm text-gray-500">Automatically backup system data on schedule</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.backup.autoBackup}
                onChange={(e) => {
                  setSettings(prev => ({
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

          {[
            { key: 'includeUploads', label: 'Include Uploads', description: 'Include uploaded files in backups' },
            { key: 'compressBackups', label: 'Compress Backups', description: 'Compress backup files to save space' },
            { key: 'encryptBackups', label: 'Encrypt Backups', description: 'Encrypt backup files for security' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{label}</h4>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.backup[key as keyof typeof settings.backup] as boolean}
                  onChange={(e) => {
                    setSettings(prev => ({
                      ...prev,
                      backup: { ...prev.backup, [key]: e.target.checked }
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
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Backup Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Backup Schedule (Cron)</label>
            <input
              type="text"
              value={settings.backup.backupSchedule}
              onChange={(e) => {
                setSettings(prev => ({
                  ...prev,
                  backup: { ...prev.backup, backupSchedule: e.target.value }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0 2 * * *"
            />
            <p className="text-xs text-gray-500 mt-1">Daily at 2:00 AM</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Retention Period (days)</label>
            <input
              type="number"
              value={settings.backup.backupRetention}
              onChange={(e) => {
                setSettings(prev => ({
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
                setSettings(prev => ({
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
                setSettings(prev => ({
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
    </div>
  )

  const SyncTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Sync Configuration</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Enable Sync</h4>
              <p className="text-sm text-gray-500">Synchronize data with external systems</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.sync.enableSync}
                onChange={(e) => {
                  setSettings(prev => ({
                    ...prev,
                    sync: { ...prev.sync, enableSync: e.target.checked }
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
              <h4 className="font-medium text-gray-900">Enable Webhooks</h4>
              <p className="text-sm text-gray-500">Send real-time notifications via webhooks</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.sync.enableWebhooks}
                onChange={(e) => {
                  setSettings(prev => ({
                    ...prev,
                    sync: { ...prev.sync, enableWebhooks: e.target.checked }
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
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Sync Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sync Interval (minutes)</label>
            <input
              type="number"
              value={settings.sync.syncInterval}
              onChange={(e) => {
                setSettings(prev => ({
                  ...prev,
                  sync: { ...prev.sync, syncInterval: parseInt(e.target.value) }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Conflict Resolution</label>
            <select
              value={settings.sync.conflictResolution}
              onChange={(e) => {
                setSettings(prev => ({
                  ...prev,
                  sync: { ...prev.sync, conflictResolution: e.target.value as any }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="merge">Merge Changes</option>
              <option value="overwrite">Overwrite Local</option>
              <option value="manual">Manual Resolution</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  )

  const NotificationsTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Channels</h3>
        
        <div className="space-y-4">
          {[
            { key: 'enableEmail', label: 'Email Notifications', description: 'Send notifications via email' },
            { key: 'enableSlack', label: 'Slack Notifications', description: 'Send notifications to Slack channels' },
            { key: 'enableWebhooks', label: 'Webhook Notifications', description: 'Send notifications via HTTP webhooks' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{label}</h4>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.notifications[key as keyof typeof settings.notifications] as boolean}
                  onChange={(e) => {
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, [key]: e.target.checked }
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
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Recipients</label>
            <div className="space-y-2">
              {settings.notifications.emailRecipients.map((email, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const newRecipients = [...settings.notifications.emailRecipients]
                      newRecipients[index] = e.target.value
                      setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, emailRecipients: newRecipients }
                      }))
                      setHasChanges(true)
                    }}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="admin@example.com"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newRecipients = settings.notifications.emailRecipients.filter((_, i) => i !== index)
                      setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, emailRecipients: newRecipients }
                      }))
                      setHasChanges(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSettings(prev => ({
                    ...prev,
                    notifications: { 
                      ...prev.notifications, 
                      emailRecipients: [...prev.notifications.emailRecipients, '']
                    }
                  }))
                  setHasChanges(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Email
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Slack Channel</label>
            <input
              type="text"
              value={settings.notifications.slackChannel}
              onChange={(e) => {
                setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, slackChannel: e.target.value }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="#system-alerts"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
            <input
              type="url"
              value={settings.notifications.webhookUrl}
              onChange={(e) => {
                setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, webhookUrl: e.target.value }
                }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://hooks.slack.com/services/..."
            />
          </div>
        </div>
      </Card>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tools':
        return <ToolsTab />
      case 'maintenance':
        return <MaintenanceTab />
      case 'backup':
        return <BackupTab />
      case 'sync':
        return <SyncTab />
      case 'notifications':
        return <NotificationsTab />
      default:
        return <ToolsTab />
    }
  }

  return (
    <TwoLevelLayout>
      <Header 
        title="Tools Settings"
        description="Configure system tools, maintenance, and automation"
        breadcrumbs={breadcrumbs}
      />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Changes Alert */}
        {hasChanges && (
          <Card className="p-4 border-orange-200 bg-orange-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">You have unsaved changes</span>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => setHasChanges(false)}>
                  <X className="h-4 w-4 mr-1" />
                  Discard
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Tab Navigation */}
        <Card className="p-1">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </Card>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </TwoLevelLayout>
  )
}
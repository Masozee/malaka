'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Settings,
  Bell,
  Shield,
  Palette,
  Globe,
  User,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Monitor,
  Sun,
  Moon,
  Laptop,
  Check,
  X,
  AlertTriangle,
  Save,
  RefreshCw
} from 'lucide-react'

interface NotificationSettings {
  email: {
    enabled: boolean
    types: {
      taskAssignments: boolean
      deadlineReminders: boolean
      performanceReviews: boolean
      leaveApprovals: boolean
      payrollNotifications: boolean
      systemUpdates: boolean
      securityAlerts: boolean
      marketingUpdates: boolean
    }
  }
  push: {
    enabled: boolean
    types: {
      urgentMessages: boolean
      meetingReminders: boolean
      deadlineAlerts: boolean
      approvalRequests: boolean
      systemNotifications: boolean
    }
  }
  sms: {
    enabled: boolean
    types: {
      securityAlerts: boolean
      emergencyNotifications: boolean
      leaveApprovals: boolean
    }
  }
  desktop: {
    enabled: boolean
    types: {
      taskUpdates: boolean
      chatMessages: boolean
      calendarEvents: boolean
      systemAlerts: boolean
    }
  }
}

interface PrivacySettings {
  profileVisibility: 'public' | 'colleagues' | 'managers' | 'private'
  showContactInfo: boolean
  showSalaryInfo: boolean
  showPerformanceData: boolean
  showAttendanceData: boolean
  showEducationInfo: boolean
  showSkillsInfo: boolean
  allowDirectMessages: boolean
  allowMentions: boolean
  searchableProfile: boolean
  dataSharing: {
    analytics: boolean
    performance: boolean
    usage: boolean
  }
}

interface SecuritySettings {
  twoFactorAuth: {
    enabled: boolean
    method: 'sms' | 'email' | 'authenticator'
    backupCodes: string[]
  }
  loginSessions: Array<{
    id: string
    device: string
    location: string
    lastActive: string
    current: boolean
  }>
  passwordSettings: {
    lastChanged: string
    requireChange: boolean
    strength: 'weak' | 'medium' | 'strong'
  }
  accountActivity: Array<{
    id: string
    action: string
    timestamp: string
    location: string
    device: string
  }>
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system'
  colorScheme: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  compactMode: boolean
  fontSize: 'small' | 'medium' | 'large'
  sidebarCollapsed: boolean
  animations: boolean
  highContrast: boolean
}

interface LanguageSettings {
  language: string
  region: string
  timezone: string
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  timeFormat: '12h' | '24h'
  currency: string
  numberFormat: 'US' | 'EU' | 'IN'
  firstDayOfWeek: 'monday' | 'sunday'
}

export default function ProfileSettingsPage() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('notifications')
  const [hasChanges, setHasChanges] = useState(false)

  // Mock settings states
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: {
      enabled: true,
      types: {
        taskAssignments: true,
        deadlineReminders: true,
        performanceReviews: true,
        leaveApprovals: true,
        payrollNotifications: true,
        systemUpdates: false,
        securityAlerts: true,
        marketingUpdates: false
      }
    },
    push: {
      enabled: true,
      types: {
        urgentMessages: true,
        meetingReminders: true,
        deadlineAlerts: true,
        approvalRequests: true,
        systemNotifications: false
      }
    },
    sms: {
      enabled: false,
      types: {
        securityAlerts: true,
        emergencyNotifications: true,
        leaveApprovals: false
      }
    },
    desktop: {
      enabled: true,
      types: {
        taskUpdates: true,
        chatMessages: true,
        calendarEvents: true,
        systemAlerts: false
      }
    }
  })

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'colleagues',
    showContactInfo: true,
    showSalaryInfo: false,
    showPerformanceData: true,
    showAttendanceData: true,
    showEducationInfo: true,
    showSkillsInfo: true,
    allowDirectMessages: true,
    allowMentions: true,
    searchableProfile: true,
    dataSharing: {
      analytics: true,
      performance: false,
      usage: true
    }
  })

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorAuth: {
      enabled: true,
      method: 'authenticator',
      backupCodes: ['ABC123', 'DEF456', 'GHI789']
    },
    loginSessions: [
      {
        id: '1',
        device: 'Chrome on Windows',
        location: 'Jakarta, Indonesia',
        lastActive: '2024-07-25 14:30',
        current: true
      },
      {
        id: '2',
        device: 'Safari on iPhone',
        location: 'Jakarta, Indonesia',
        lastActive: '2024-07-25 08:15',
        current: false
      }
    ],
    passwordSettings: {
      lastChanged: '2024-05-15',
      requireChange: false,
      strength: 'strong'
    },
    accountActivity: [
      {
        id: '1',
        action: 'Login successful',
        timestamp: '2024-07-25 14:30',
        location: 'Jakarta, Indonesia',
        device: 'Chrome on Windows'
      },
      {
        id: '2',
        action: 'Password changed',
        timestamp: '2024-05-15 10:20',
        location: 'Jakarta, Indonesia',
        device: 'Chrome on Windows'
      }
    ]
  })

  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: 'light',
    colorScheme: 'blue',
    compactMode: false,
    fontSize: 'medium',
    sidebarCollapsed: false,
    animations: true,
    highContrast: false
  })

  const [language, setLanguage] = useState<LanguageSettings>({
    language: 'en',
    region: 'ID',
    timezone: 'Asia/Jakarta',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'IDR',
    numberFormat: 'US',
    firstDayOfWeek: 'monday'
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Profile', href: '/profile' },
    { label: 'Settings' }
  ]

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'language', label: 'Language & Region', icon: Globe }
  ]

  const handleSave = () => {
    // Save settings logic here
    setHasChanges(false)
    // Show success message
  }

  const NotificationsTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Email Notifications</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Enable Email Notifications</h4>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={notifications.email.enabled}
                onChange={(e) => {
                  setNotifications(prev => ({
                    ...prev,
                    email: { ...prev.email, enabled: e.target.checked }
                  }))
                  setHasChanges(true)
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {notifications.email.enabled && (
            <div className="ml-4 space-y-3 border-l-2 border-gray-200 pl-4">
              {Object.entries(notifications.email.types).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <input 
                    type="checkbox" 
                    checked={value}
                    onChange={(e) => {
                      setNotifications(prev => ({
                        ...prev,
                        email: {
                          ...prev.email,
                          types: { ...prev.email.types, [key]: e.target.checked }
                        }
                      }))
                      setHasChanges(true)
                    }}
                    className="rounded"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Push Notifications</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Enable Push Notifications</h4>
              <p className="text-sm text-gray-500">Receive push notifications on your devices</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={notifications.push.enabled}
                onChange={(e) => {
                  setNotifications(prev => ({
                    ...prev,
                    push: { ...prev.push, enabled: e.target.checked }
                  }))
                  setHasChanges(true)
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {notifications.push.enabled && (
            <div className="ml-4 space-y-3 border-l-2 border-gray-200 pl-4">
              {Object.entries(notifications.push.types).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <input 
                    type="checkbox" 
                    checked={value}
                    onChange={(e) => {
                      setNotifications(prev => ({
                        ...prev,
                        push: {
                          ...prev.push,
                          types: { ...prev.push.types, [key]: e.target.checked }
                        }
                      }))
                      setHasChanges(true)
                    }}
                    className="rounded"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">SMS Notifications</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Enable SMS Notifications</h4>
              <p className="text-sm text-gray-500">Receive important notifications via SMS</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={notifications.sms.enabled}
                onChange={(e) => {
                  setNotifications(prev => ({
                    ...prev,
                    sms: { ...prev.sms, enabled: e.target.checked }
                  }))
                  setHasChanges(true)
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {notifications.sms.enabled && (
            <div className="ml-4 space-y-3 border-l-2 border-gray-200 pl-4">
              {Object.entries(notifications.sms.types).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <input 
                    type="checkbox" 
                    checked={value}
                    onChange={(e) => {
                      setNotifications(prev => ({
                        ...prev,
                        sms: {
                          ...prev.sms,
                          types: { ...prev.sms.types, [key]: e.target.checked }
                        }
                      }))
                      setHasChanges(true)
                    }}
                    className="rounded"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )

  const PrivacyTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Visibility</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Who can see your profile?</label>
            <select 
              value={privacy.profileVisibility}
              onChange={(e) => {
                setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value as any }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="public">Everyone</option>
              <option value="colleagues">Colleagues Only</option>
              <option value="managers">Managers Only</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="space-y-3">
            {[
              { key: 'showContactInfo', label: 'Show Contact Information' },
              { key: 'showSalaryInfo', label: 'Show Salary Information' },
              { key: 'showPerformanceData', label: 'Show Performance Data' },
              { key: 'showAttendanceData', label: 'Show Attendance Data' },
              { key: 'showEducationInfo', label: 'Show Education Information' },
              { key: 'showSkillsInfo', label: 'Show Skills Information' }
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{label}</span>
                <input 
                  type="checkbox" 
                  checked={privacy[key as keyof PrivacySettings] as boolean}
                  onChange={(e) => {
                    setPrivacy(prev => ({ ...prev, [key]: e.target.checked }))
                    setHasChanges(true)
                  }}
                  className="rounded"
                />
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Communication Settings</h3>
        
        <div className="space-y-3">
          {[
            { key: 'allowDirectMessages', label: 'Allow Direct Messages' },
            { key: 'allowMentions', label: 'Allow Mentions' },
            { key: 'searchableProfile', label: 'Make Profile Searchable' }
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{label}</span>
              <input 
                type="checkbox" 
                checked={privacy[key as keyof PrivacySettings] as boolean}
                onChange={(e) => {
                  setPrivacy(prev => ({ ...prev, [key]: e.target.checked }))
                  setHasChanges(true)
                }}
                className="rounded"
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Data Sharing</h3>
        
        <div className="space-y-3">
          {Object.entries(privacy.dataSharing).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()} Data
                </span>
                <p className="text-xs text-gray-500">
                  Share anonymized {key} data for system improvement
                </p>
              </div>
              <input 
                type="checkbox" 
                checked={value}
                onChange={(e) => {
                  setPrivacy(prev => ({
                    ...prev,
                    dataSharing: { ...prev.dataSharing, [key]: e.target.checked }
                  }))
                  setHasChanges(true)
                }}
                className="rounded"
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )

  const SecurityTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Two-Factor Authentication</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Enable 2FA</h4>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <Badge className={security.twoFactorAuth.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {security.twoFactorAuth.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>

          {security.twoFactorAuth.enabled && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Authentication Method</label>
                <select 
                  value={security.twoFactorAuth.method}
                  onChange={(e) => {
                    setSecurity(prev => ({
                      ...prev,
                      twoFactorAuth: { ...prev.twoFactorAuth, method: e.target.value as any }
                    }))
                    setHasChanges(true)
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                  <option value="authenticator">Authenticator App</option>
                </select>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Backup Codes</h4>
                <p className="text-sm text-gray-500 mb-3">Save these codes in a safe place. You can use them to access your account if you lose your device.</p>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="grid grid-cols-3 gap-2 text-sm font-mono">
                    {security.twoFactorAuth.backupCodes.map((code, index) => (
                      <span key={index} className="bg-white p-2 rounded border text-center">{code}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Password Security</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Password Strength</h4>
              <p className="text-sm text-gray-500">Last changed: {mounted ? new Date(security.passwordSettings.lastChanged).toLocaleDateString() : ''}</p>
            </div>
            <Badge className={
              security.passwordSettings.strength === 'strong' ? 'bg-green-100 text-green-800' :
              security.passwordSettings.strength === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }>
              {security.passwordSettings.strength.charAt(0).toUpperCase() + security.passwordSettings.strength.slice(1)}
            </Badge>
          </div>

          <Button variant="outline" className="w-full">
            <Lock className="h-4 w-4 mr-2" />
            Change Password
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Active Sessions</h3>
        
        <div className="space-y-3">
          {security.loginSessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Monitor className="h-5 w-5 text-gray-400" />
                <div>
                  <h4 className="font-medium text-gray-900">{session.device}</h4>
                  <p className="text-sm text-gray-500">{session.location}</p>
                  <p className="text-xs text-gray-400">Last active: {session.lastActive}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {session.current ? (
                  <Badge className="bg-green-100 text-green-800">Current</Badge>
                ) : (
                  <Button variant="outline" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )

  const AppearanceTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Theme</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Color Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'light', label: 'Light', icon: Sun },
                { value: 'dark', label: 'Dark', icon: Moon },
                { value: 'system', label: 'System', icon: Laptop }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => {
                    setAppearance(prev => ({ ...prev, theme: value as any }))
                    setHasChanges(true)
                  }}
                  className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${
                    appearance.theme === value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Color Scheme</label>
            <div className="flex space-x-2">
              {[
                { value: 'blue', color: 'bg-blue-500' },
                { value: 'green', color: 'bg-green-500' },
                { value: 'purple', color: 'bg-purple-500' },
                { value: 'orange', color: 'bg-orange-500' },
                { value: 'red', color: 'bg-red-500' }
              ].map(({ value, color }) => (
                <button
                  key={value}
                  onClick={() => {
                    setAppearance(prev => ({ ...prev, colorScheme: value as any }))
                    setHasChanges(true)
                  }}
                  className={`w-8 h-8 rounded-full ${color} ${
                    appearance.colorScheme === value ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Display Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
            <select 
              value={appearance.fontSize}
              onChange={(e) => {
                setAppearance(prev => ({ ...prev, fontSize: e.target.value as any }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div className="space-y-3">
            {[
              { key: 'compactMode', label: 'Compact Mode', description: 'Reduce spacing and padding' },
              { key: 'sidebarCollapsed', label: 'Collapsed Sidebar', description: 'Keep sidebar collapsed by default' },
              { key: 'animations', label: 'Enable Animations', description: 'Show smooth transitions and animations' },
              { key: 'highContrast', label: 'High Contrast', description: 'Increase contrast for better readability' }
            ].map(({ key, label, description }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  <p className="text-xs text-gray-500">{description}</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={appearance[key as keyof AppearanceSettings] as boolean}
                  onChange={(e) => {
                    setAppearance(prev => ({ ...prev, [key]: e.target.checked }))
                    setHasChanges(true)
                  }}
                  className="rounded"
                />
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )

  const LanguageTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Language & Region</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select 
              value={language.language}
              onChange={(e) => {
                setLanguage(prev => ({ ...prev, language: e.target.value }))
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
            <select 
              value={language.region}
              onChange={(e) => {
                setLanguage(prev => ({ ...prev, region: e.target.value }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ID">Indonesia</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="CN">China</option>
              <option value="JP">Japan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select 
              value={language.timezone}
              onChange={(e) => {
                setLanguage(prev => ({ ...prev, timezone: e.target.value }))
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select 
              value={language.currency}
              onChange={(e) => {
                setLanguage(prev => ({ ...prev, currency: e.target.value }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="IDR">Indonesian Rupiah (IDR)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="GBP">British Pound (GBP)</option>
              <option value="JPY">Japanese Yen (JPY)</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Format Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
            <select 
              value={language.dateFormat}
              onChange={(e) => {
                setLanguage(prev => ({ ...prev, dateFormat: e.target.value as any }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
            <select 
              value={language.timeFormat}
              onChange={(e) => {
                setLanguage(prev => ({ ...prev, timeFormat: e.target.value as any }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="12h">12 Hour (AM/PM)</option>
              <option value="24h">24 Hour</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number Format</label>
            <select 
              value={language.numberFormat}
              onChange={(e) => {
                setLanguage(prev => ({ ...prev, numberFormat: e.target.value as any }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="US">1,234.56 (US)</option>
              <option value="EU">1.234,56 (EU)</option>
              <option value="IN">1,23,456.78 (IN)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Day of Week</label>
            <select 
              value={language.firstDayOfWeek}
              onChange={(e) => {
                setLanguage(prev => ({ ...prev, firstDayOfWeek: e.target.value as any }))
                setHasChanges(true)
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="monday">Monday</option>
              <option value="sunday">Sunday</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notifications':
        return <NotificationsTab />
      case 'privacy':
        return <PrivacyTab />
      case 'security':
        return <SecurityTab />
      case 'appearance':
        return <AppearanceTab />
      case 'language':
        return <LanguageTab />
      default:
        return <NotificationsTab />
    }
  }

  return (
    <TwoLevelLayout>
      <Header 
        title="Profile Settings"
        description="Configure your account preferences and security settings"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setHasChanges(false)}
              disabled={!hasChanges}
            >
              <X className="w-4 h-4 mr-2" />
              Discard
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={!hasChanges}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        }
      />
      
      <div className="flex-1 p-6">
        {/* Changes Alert */}
        {hasChanges && (
          <div className="mb-6 p-4 border border-orange-200 bg-orange-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">You have unsaved changes</span>
            </div>
          </div>
        )}

        {/* Compact Tab Navigation */}
        <div className="flex flex-wrap gap-1 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all
                  ${activeTab === tab.id 
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {renderTabContent()}
        </div>
      </div>
    </TwoLevelLayout>
  )
}
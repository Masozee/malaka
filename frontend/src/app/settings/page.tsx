'use client';

import React, { useState, useEffect } from 'react';
import { TwoLevelLayout } from '@/components/ui/two-level-layout';
import { Header } from '@/components/ui/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Settings,
  Coins,
  Calculator,
  Plug,
  Mail,
  Shield,
  Database,
  Bell,
  Palette,
  Globe,
  Save,
  RefreshCw,
  Store,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Link as LinkIcon
} from 'lucide-react';
import { settingsService, SETTING_CATEGORIES, SettingCategory } from '@/services/settings';

type TabType = 'general' | 'currency' | 'tax' | 'api' | 'email' | 'security' | 'database' | 'notifications' | 'appearance' | 'localization';

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}

const tabs: TabConfig[] = [
  { id: 'general', label: 'General', icon: <Settings className="w-4 h-4" /> },
  { id: 'currency', label: 'Currency', icon: <Coins className="w-4 h-4" /> },
  { id: 'tax', label: 'Tax', icon: <Calculator className="w-4 h-4" /> },
  { id: 'api', label: 'API', icon: <Plug className="w-4 h-4" /> },
  { id: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
  { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
  { id: 'database', label: 'Database', icon: <Database className="w-4 h-4" /> },
  { id: 'notifications', label: 'Alerts', icon: <Bell className="w-4 h-4" /> },
  { id: 'appearance', label: 'Theme', icon: <Palette className="w-4 h-4" /> },
  { id: 'localization', label: 'Locale', icon: <Globe className="w-4 h-4" /> }
];

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    // General Settings
    companyName: 'PT Malaka Sepatu Indonesia',
    companyAddress: 'Jl. Sudirman No. 123, Jakarta Pusat 10270',
    companyPhone: '021-5555-1234',
    companyEmail: 'info@malaka.co.id',
    companyWebsite: 'https://malaka.co.id',
    timezone: 'Asia/Jakarta',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24',
    
    // Currency Settings
    baseCurrency: 'IDR',
    currencySymbol: 'Rp',
    currencyPosition: 'before',
    thousandSeparator: '.',
    decimalSeparator: ',',
    decimalPlaces: 2,
    
    // Tax Settings
    defaultTaxRate: 11,
    taxName: 'PPN',
    taxNumber: '12.345.678.9-123.000',
    enableTaxInclusive: false,
    
    // API Settings
    apiUrl: 'http://localhost:8084',
    apiTimeout: 30,
    enableApiLogging: true,
    apiRateLimit: 1000,
    
    // Retail Application APIs
    ramayana: {
      enabled: true,
      name: 'APLIKASI RAMAYANA (HIERARKI)',
      apiUrl: 'https://api.ramayana.co.id/hierarki',
      apiKey: '',
      timeout: 30,
      retryAttempts: 3,
      enableSync: true,
      syncInterval: 60, // minutes
      lastSync: null
    },
    matahari: {
      enabled: true,
      name: 'APLIKASI MATAHARI (MCP)',
      apiUrl: 'https://api.matahari.co.id/mcp',
      apiKey: '',
      timeout: 30,
      retryAttempts: 3,
      enableSync: true,
      syncInterval: 45, // minutes
      lastSync: null
    },
    yogya: {
      enabled: false,
      name: 'APLIKASI YOGYA (YOBON)',
      apiUrl: 'https://api.yogya.co.id/yobon',
      apiKey: '',
      timeout: 30,
      retryAttempts: 3,
      enableSync: false,
      syncInterval: 30, // minutes
      lastSync: null
    },
    star: {
      enabled: false,
      name: 'APLIKASI STAR (RAMBLA)',
      apiUrl: 'https://api.star.co.id/rambla',
      apiKey: '',
      timeout: 30,
      retryAttempts: 3,
      enableSync: false,
      syncInterval: 90, // minutes
      lastSync: null
    },
    
    // Email Settings
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    smtpSecurity: 'tls',
    fromEmail: 'noreply@malaka.co.id',
    fromName: 'Malaka ERP System',
    
    // Security Settings
    sessionTimeout: 480,
    passwordMinLength: 8,
    requirePasswordNumbers: true,
    requirePasswordSymbols: true,
    enableTwoFactor: false,
    maxLoginAttempts: 5,
    
    // Database Settings
    dbHost: 'localhost',
    dbPort: 5432,
    dbName: 'malaka',
    dbBackupInterval: 'daily',
    enableAutoBackup: true,
    
    // Notification Settings
    enableEmailNotifications: true,
    enableStockAlerts: true,
    enableOrderNotifications: true,
    lowStockThreshold: 10,
    
    // Appearance Settings
    theme: 'system',
    primaryColor: 'blue',
    sidebarCollapsed: false,
    
    // Localization Settings
    language: 'id-ID',
    currency: 'IDR',
    numberFormat: 'id-ID'
  });

  useEffect(() => {
    setMounted(true);
    loadSettings();
  }, []);

  // Load settings data from backend
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load public settings for initial display
      const publicSettings = await settingsService.getPublicSettings();
      
      // Try to load user-specific settings if authenticated
      try {
        const userSettings = await settingsService.getUserSettings();
        // Merge user settings with public settings
        const mergedSettings = { ...publicSettings };
        
        userSettings.forEach((setting: any) => {
          const key = setting.sub_category 
            ? `${setting.sub_category}_${setting.setting_key}`
            : setting.setting_key;
          
          if (setting.setting_value !== null) {
            mergedSettings[key] = setting.setting_value;
          }
        });
        
        setSettings(prev => ({ ...prev, ...mergedSettings }));
      } catch (userError) {
        // User not authenticated or no permissions, use public settings only
        setSettings(prev => ({ ...prev, ...publicSettings }));
      }
      
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare settings for bulk update
      const settingsToUpdate: Record<string, string> = {};
      
      // Convert settings object to flat key-value pairs
      Object.entries(settings).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          // Handle nested objects (like retail app settings)
          Object.entries(value).forEach(([subKey, subValue]) => {
            settingsToUpdate[`${key}_${subKey}`] = String(subValue);
          });
        } else {
          settingsToUpdate[key] = String(value);
        }
      });
      
      await settingsService.updateBulkSettings({
        settings: settingsToUpdate,
        change_reason: 'Settings page bulk update'
      });
      
      // Show success message (you could add a toast notification here)
      console.log('Settings saved successfully');
      
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setError(err.message || 'Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Reload settings from backend to reset to current saved values
      await loadSettings();
      
      console.log('Settings reset to saved values');
      
    } catch (err) {
      console.error('Failed to reset settings:', err);
      setError('Failed to reset settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => handleSettingsChange('companyName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyEmail">Email</Label>
              <Input
                id="companyEmail"
                type="email"
                value={settings.companyEmail}
                onChange={(e) => handleSettingsChange('companyEmail', e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="companyAddress">Address</Label>
            <Textarea
              id="companyAddress"
              value={settings.companyAddress}
              onChange={(e) => handleSettingsChange('companyAddress', e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyPhone">Phone</Label>
              <Input
                id="companyPhone"
                value={settings.companyPhone}
                onChange={(e) => handleSettingsChange('companyPhone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyWebsite">Website</Label>
              <Input
                id="companyWebsite"
                value={settings.companyWebsite}
                onChange={(e) => handleSettingsChange('companyWebsite', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={settings.timezone} onValueChange={(value) => handleSettingsChange('timezone', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Jakarta">Asia/Jakarta (WIB)</SelectItem>
                  <SelectItem value="Asia/Makassar">Asia/Makassar (WITA)</SelectItem>
                  <SelectItem value="Asia/Jayapura">Asia/Jayapura (WIT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select value={settings.dateFormat} onValueChange={(value) => handleSettingsChange('dateFormat', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeFormat">Time Format</Label>
              <Select value={settings.timeFormat} onValueChange={(value) => handleSettingsChange('timeFormat', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24 Hour</SelectItem>
                  <SelectItem value="12">12 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCurrencySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Currency Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseCurrency">Base Currency</Label>
              <Select value={settings.baseCurrency} onValueChange={(value) => handleSettingsChange('baseCurrency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IDR">Indonesian Rupiah (IDR)</SelectItem>
                  <SelectItem value="USD">US Dollar (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currencySymbol">Currency Symbol</Label>
              <Input
                id="currencySymbol"
                value={settings.currencySymbol}
                onChange={(e) => handleSettingsChange('currencySymbol', e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currencyPosition">Symbol Position</Label>
              <Select value={settings.currencyPosition} onValueChange={(value) => handleSettingsChange('currencyPosition', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="before">Before Amount</SelectItem>
                  <SelectItem value="after">After Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="thousandSeparator">Thousand Separator</Label>
              <Select value={settings.thousandSeparator} onValueChange={(value) => handleSettingsChange('thousandSeparator', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=".">Period (.)</SelectItem>
                  <SelectItem value=",">Comma (,)</SelectItem>
                  <SelectItem value=" ">Space ( )</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="decimalSeparator">Decimal Separator</Label>
              <Select value={settings.decimalSeparator} onValueChange={(value) => handleSettingsChange('decimalSeparator', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=",">Comma (,)</SelectItem>
                  <SelectItem value=".">Period (.)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="decimalPlaces">Decimal Places</Label>
            <Input
              id="decimalPlaces"
              type="number"
              min="0"
              max="4"
              value={settings.decimalPlaces}
              onChange={(e) => handleSettingsChange('decimalPlaces', parseInt(e.target.value))}
            />
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Label className="text-sm font-medium">Preview</Label>
            <div className="mt-2 text-lg font-semibold">
              {mounted ? (
                settings.currencyPosition === 'before' 
                  ? `${settings.currencySymbol} 1${settings.thousandSeparator}234${settings.decimalSeparator}56`
                  : `1${settings.thousandSeparator}234${settings.decimalSeparator}56 ${settings.currencySymbol}`
              ) : ''}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTaxSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tax Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxName">Tax Name</Label>
              <Input
                id="taxName"
                value={settings.taxName}
                onChange={(e) => handleSettingsChange('taxName', e.target.value)}
                placeholder="e.g., PPN, VAT, GST"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
              <Input
                id="defaultTaxRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={settings.defaultTaxRate}
                onChange={(e) => handleSettingsChange('defaultTaxRate', parseFloat(e.target.value))}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="taxNumber">Tax Registration Number</Label>
            <Input
              id="taxNumber"
              value={settings.taxNumber}
              onChange={(e) => handleSettingsChange('taxNumber', e.target.value)}
              placeholder="e.g., NPWP Number"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enableTaxInclusive"
              checked={settings.enableTaxInclusive}
              onChange={(e) => handleSettingsChange('enableTaxInclusive', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="enableTaxInclusive">Enable Tax Inclusive Pricing</Label>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Label className="text-sm font-medium">Tax Calculation Preview</Label>
            <div className="mt-2 space-y-1 text-sm">
              <div>Base Amount: Rp 100.000,00</div>
              <div>{settings.taxName} ({settings.defaultTaxRate}%): Rp {mounted ? (100000 * settings.defaultTaxRate / 100).toLocaleString('id-ID', { minimumFractionDigits: 2 }) : ''}</div>
              <div className="font-semibold border-t pt-1">
                Total: Rp {mounted ? (100000 * (1 + settings.defaultTaxRate / 100)).toLocaleString('id-ID', { minimumFractionDigits: 2 }) : ''}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderApiSettings = () => (
    <div className="space-y-6">
      {/* Main API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Main API Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="apiUrl">API Base URL</Label>
              <Input
                id="apiUrl"
                value={settings.apiUrl}
                onChange={(e) => handleSettingsChange('apiUrl', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiTimeout">Request Timeout (seconds)</Label>
              <Input
                id="apiTimeout"
                type="number"
                min="5"
                max="300"
                value={settings.apiTimeout}
                onChange={(e) => handleSettingsChange('apiTimeout', parseInt(e.target.value))}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="apiRateLimit">Rate Limit (requests per hour)</Label>
            <Input
              id="apiRateLimit"
              type="number"
              min="100"
              max="10000"
              value={settings.apiRateLimit}
              onChange={(e) => handleSettingsChange('apiRateLimit', parseInt(e.target.value))}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enableApiLogging"
              checked={settings.enableApiLogging}
              onChange={(e) => handleSettingsChange('enableApiLogging', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="enableApiLogging">Enable API Request Logging</Label>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">Connection Status</Badge>
              <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Last health check: {mounted ? new Date().toLocaleString('id-ID') : ''}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Retail Applications Integration */}
      {[
        { key: 'ramayana', icon: Building2, color: 'text-red-600' },
        { key: 'matahari', icon: Store, color: 'text-blue-600' },
        { key: 'yogya', icon: Building2, color: 'text-green-600' },
        { key: 'star', icon: Store, color: 'text-purple-600' }
      ].map((app) => {
        const appSettings = settings[app.key as keyof typeof settings] as any;
        const Icon = app.icon;
        
        return (
          <Card key={app.key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${app.color}`} />
                <span>{appSettings.name}</span>
                <div className="flex items-center gap-2">
                  {appSettings.enabled ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Enabled
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                      <XCircle className="h-3 w-3 mr-1" />
                      Disabled
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Enable/Disable Toggle */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`${app.key}-enabled`}
                  checked={appSettings.enabled}
                  onChange={(e) => handleSettingsChange(app.key, { ...appSettings, enabled: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor={`${app.key}-enabled`}>Enable {appSettings.name.split(' ')[1]} Integration</Label>
              </div>

              {appSettings.enabled && (
                <>
                  {/* API Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${app.key}-url`}>API Endpoint URL</Label>
                      <Input
                        id={`${app.key}-url`}
                        value={appSettings.apiUrl}
                        onChange={(e) => handleSettingsChange(app.key, { ...appSettings, apiUrl: e.target.value })}
                        placeholder="https://api.example.com/endpoint"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`${app.key}-key`}>API Key</Label>
                      <Input
                        id={`${app.key}-key`}
                        type="password"
                        value={appSettings.apiKey}
                        onChange={(e) => handleSettingsChange(app.key, { ...appSettings, apiKey: e.target.value })}
                        placeholder="Enter API key"
                      />
                    </div>
                  </div>

                  {/* Connection Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${app.key}-timeout`}>Timeout (seconds)</Label>
                      <Input
                        id={`${app.key}-timeout`}
                        type="number"
                        min="5"
                        max="300"
                        value={appSettings.timeout}
                        onChange={(e) => handleSettingsChange(app.key, { ...appSettings, timeout: parseInt(e.target.value) })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`${app.key}-retry`}>Retry Attempts</Label>
                      <Input
                        id={`${app.key}-retry`}
                        type="number"
                        min="1"
                        max="10"
                        value={appSettings.retryAttempts}
                        onChange={(e) => handleSettingsChange(app.key, { ...appSettings, retryAttempts: parseInt(e.target.value) })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`${app.key}-interval`}>Sync Interval (minutes)</Label>
                      <Input
                        id={`${app.key}-interval`}
                        type="number"
                        min="5"
                        max="1440"
                        value={appSettings.syncInterval}
                        onChange={(e) => handleSettingsChange(app.key, { ...appSettings, syncInterval: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  {/* Sync Settings */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`${app.key}-sync`}
                      checked={appSettings.enableSync}
                      onChange={(e) => handleSettingsChange(app.key, { ...appSettings, enableSync: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor={`${app.key}-sync`}>Enable Automatic Data Synchronization</Label>
                  </div>

                  {/* Status and Actions */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Connection Status</Badge>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Not Tested
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Last sync: {appSettings.lastSync ? new Date(appSettings.lastSync).toLocaleString('id-ID') : 'Never'}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Test Connection
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" disabled={!appSettings.enableSync}>
                        <Zap className="w-4 h-4 mr-2" />
                        Sync Now
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SMTP Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">SMTP Host</Label>
              <Input
                id="smtpHost"
                value={settings.smtpHost}
                onChange={(e) => handleSettingsChange('smtpHost', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input
                id="smtpPort"
                type="number"
                value={settings.smtpPort}
                onChange={(e) => handleSettingsChange('smtpPort', parseInt(e.target.value))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpUsername">Username</Label>
              <Input
                id="smtpUsername"
                value={settings.smtpUsername}
                onChange={(e) => handleSettingsChange('smtpUsername', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="smtpPassword">Password</Label>
              <Input
                id="smtpPassword"
                type="password"
                value={settings.smtpPassword}
                onChange={(e) => handleSettingsChange('smtpPassword', e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="smtpSecurity">Security</Label>
            <Select value={settings.smtpSecurity} onValueChange={(value) => handleSettingsChange('smtpSecurity', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="tls">TLS</SelectItem>
                <SelectItem value="ssl">SSL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromEmail">From Email</Label>
              <Input
                id="fromEmail"
                type="email"
                value={settings.fromEmail}
                onChange={(e) => handleSettingsChange('fromEmail', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fromName">From Name</Label>
              <Input
                id="fromName"
                value={settings.fromName}
                onChange={(e) => handleSettingsChange('fromName', e.target.value)}
              />
            </div>
          </div>
          
          <Button variant="outline" className="w-full">
            <Mail className="w-4 h-4 mr-2" />
            Test Email Configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication & Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                min="15"
                max="1440"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingsChange('sessionTimeout', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                min="3"
                max="10"
                value={settings.maxLoginAttempts}
                onChange={(e) => handleSettingsChange('maxLoginAttempts', parseInt(e.target.value))}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
            <Input
              id="passwordMinLength"
              type="number"
              min="6"
              max="32"
              value={settings.passwordMinLength}
              onChange={(e) => handleSettingsChange('passwordMinLength', parseInt(e.target.value))}
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="requirePasswordNumbers"
                checked={settings.requirePasswordNumbers}
                onChange={(e) => handleSettingsChange('requirePasswordNumbers', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="requirePasswordNumbers">Require numbers in passwords</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="requirePasswordSymbols"
                checked={settings.requirePasswordSymbols}
                onChange={(e) => handleSettingsChange('requirePasswordSymbols', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="requirePasswordSymbols">Require symbols in passwords</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableTwoFactor"
                checked={settings.enableTwoFactor}
                onChange={(e) => handleSettingsChange('enableTwoFactor', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="enableTwoFactor">Enable Two-Factor Authentication</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDatabaseSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Database Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dbHost">Database Host</Label>
              <Input
                id="dbHost"
                value={settings.dbHost}
                onChange={(e) => handleSettingsChange('dbHost', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dbPort">Database Port</Label>
              <Input
                id="dbPort"
                type="number"
                value={settings.dbPort}
                onChange={(e) => handleSettingsChange('dbPort', parseInt(e.target.value))}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dbName">Database Name</Label>
            <Input
              id="dbName"
              value={settings.dbName}
              onChange={(e) => handleSettingsChange('dbName', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dbBackupInterval">Backup Interval</Label>
            <Select value={settings.dbBackupInterval} onValueChange={(value) => handleSettingsChange('dbBackupInterval', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Every Hour</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enableAutoBackup"
              checked={settings.enableAutoBackup}
              onChange={(e) => handleSettingsChange('enableAutoBackup', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="enableAutoBackup">Enable Automatic Backups</Label>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Database className="w-4 h-4 mr-2" />
              Test Connection
            </Button>
            <Button variant="outline" className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Backup Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableEmailNotifications"
                checked={settings.enableEmailNotifications}
                onChange={(e) => handleSettingsChange('enableEmailNotifications', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="enableEmailNotifications">Enable Email Notifications</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableStockAlerts"
                checked={settings.enableStockAlerts}
                onChange={(e) => handleSettingsChange('enableStockAlerts', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="enableStockAlerts">Low Stock Alerts</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableOrderNotifications"
                checked={settings.enableOrderNotifications}
                onChange={(e) => handleSettingsChange('enableOrderNotifications', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="enableOrderNotifications">Order Notifications</Label>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
            <Input
              id="lowStockThreshold"
              type="number"
              min="1"
              max="100"
              value={settings.lowStockThreshold}
              onChange={(e) => handleSettingsChange('lowStockThreshold', parseInt(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme & Display</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme Preference</Label>
            <Select value={settings.theme} onValueChange={(value) => handleSettingsChange('theme', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">Follow System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <Select value={settings.primaryColor} onValueChange={(value) => handleSettingsChange('primaryColor', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="purple">Purple</SelectItem>
                <SelectItem value="orange">Orange</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="sidebarCollapsed"
              checked={settings.sidebarCollapsed}
              onChange={(e) => handleSettingsChange('sidebarCollapsed', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="sidebarCollapsed">Collapse Sidebar by Default</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLocalizationSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Regional Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={settings.language} onValueChange={(value) => handleSettingsChange('language', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id-ID">Bahasa Indonesia</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-GB">English (UK)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="numberFormat">Number Format</Label>
              <Select value={settings.numberFormat} onValueChange={(value) => handleSettingsChange('numberFormat', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id-ID">Indonesian (1.234,56)</SelectItem>
                  <SelectItem value="en-US">US (1,234.56)</SelectItem>
                  <SelectItem value="en-GB">UK (1,234.56)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Label className="text-sm font-medium">Format Preview</Label>
            <div className="mt-2 space-y-1 text-sm">
              <div>Number: {mounted ? (1234.56).toLocaleString(settings.numberFormat) : ''}</div>
              <div>Currency: {mounted ? (1234.56).toLocaleString(settings.numberFormat, { style: 'currency', currency: settings.currency }) : ''}</div>
              <div>Date: {mounted ? new Date().toLocaleDateString(settings.language) : ''}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'currency':
        return renderCurrencySettings();
      case 'tax':
        return renderTaxSettings();
      case 'api':
        return renderApiSettings();
      case 'email':
        return renderEmailSettings();
      case 'security':
        return renderSecuritySettings();
      case 'database':
        return renderDatabaseSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'localization':
        return renderLocalizationSettings();
      default:
        return (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-4">🚧</div>
                <h3 className="text-lg font-medium mb-2">Under Development</h3>
                <p>This settings section is coming soon.</p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <TwoLevelLayout>
      <Header 
        title="System Settings"
        description="Configure and manage all system settings and preferences"
        breadcrumbs={[
          { label: "Settings" }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleResetSettings}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Reset
            </Button>
            <Button 
              size="sm" 
              onClick={handleSaveSettings}
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        }
      />
      
      <div className="flex-1 p-6">
        {/* Short Tab Navigation */}
        <div className="flex flex-wrap gap-1 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
          {tabs.map((tab) => (
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
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {renderContent()}
        </div>
      </div>
    </TwoLevelLayout>
  );
}
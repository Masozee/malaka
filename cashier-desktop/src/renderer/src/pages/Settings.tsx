import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Settings01Icon,
  UserCircleIcon,
  Wifi01Icon,
  PrinterIcon
} from '@hugeicons/core-free-icons'

export default function Settings() {
  const { user } = useAuth()
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('api_url') || 'http://localhost:8080')
  const [saved, setSaved] = useState(false)

  const handleSaveApiUrl = () => {
    localStorage.setItem('api_url', apiUrl)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your POS application</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Profile Section */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <HugeiconsIcon icon={UserCircleIcon} className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Profile Information</h2>
              <p className="text-sm text-muted-foreground">Your account details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Username</Label>
                <p className="font-medium">{user?.username || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium">{user?.email || 'N/A'}</p>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">User ID</Label>
              <p className="font-mono text-sm">{user?.id || 'N/A'}</p>
            </div>
          </div>
        </Card>

        {/* Connection Settings */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <HugeiconsIcon icon={Wifi01Icon} className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Connection Settings</h2>
              <p className="text-sm text-muted-foreground">Configure server connection</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="apiUrl">API Server URL</Label>
              <Input
                id="apiUrl"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:8080"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                The URL of the Malaka ERP backend server
              </p>
            </div>
            <Button onClick={handleSaveApiUrl}>
              {saved ? 'Saved!' : 'Save Connection'}
            </Button>
          </div>
        </Card>

        {/* Printer Settings (Placeholder) */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <HugeiconsIcon icon={PrinterIcon} className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Printer Settings</h2>
              <p className="text-sm text-muted-foreground">Configure receipt printer</p>
            </div>
          </div>

          <div className="text-center py-8 text-muted-foreground">
            <HugeiconsIcon icon={PrinterIcon} className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Printer configuration coming soon</p>
          </div>
        </Card>

        {/* App Info */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <HugeiconsIcon icon={Settings01Icon} className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Application Info</h2>
              <p className="text-sm text-muted-foreground">About this application</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">App Name</span>
              <span className="font-medium">Malaka Cashier</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform</span>
              <span className="font-medium">Electron Desktop</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

"use client";

import { useState, useEffect } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  Clock,
  Bell,
  Camera,
  Package
} from 'lucide-react';

const quickActions = [
  { name: 'Clock In/Out', icon: Clock, href: '/attendance', color: 'bg-blue-50 text-blue-600' },
  { name: 'Check Inventory', icon: Package, href: '/inventory', color: 'bg-green-50 text-green-600' },
  { name: 'Scan Barcode', icon: Camera, href: '/barcode', color: 'bg-purple-50 text-purple-600' },
  { name: 'Notifications', icon: Bell, href: '/notifications', color: 'bg-red-50 text-red-600' },
];

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Update time every second
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);

    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            {currentTime} • {isOnline ? '🟢 Online' : '🔴 Offline'}
          </p>
        </div>

        {/* Offline Notice */}
        {!isOnline && (
          <Card className="bg-yellow-50 border-yellow-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  You&apos;re currently offline. Some features may be limited.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Card 
                key={action.name} 
                className="p-4 text-center"
                onClick={() => window.location.href = action.href}
              >
                <div className={`inline-flex p-3 rounded-full ${action.color} mb-2`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-gray-900">{action.name}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Activity</h2>
          <Card>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                <p className="ml-3 text-sm text-gray-600">John Doe clocked in at 08:30 AM</p>
              </div>
              <div className="flex items-center">
                <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                <p className="ml-3 text-sm text-gray-600">Inventory updated: 25 items</p>
              </div>
              <div className="flex items-center">
                <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
                <p className="ml-3 text-sm text-gray-600">New leave request submitted</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Install PWA Prompt */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="text-center">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Install Malaka ERP Mobile
            </h3>
            <p className="text-xs text-blue-700 mb-3">
              Add to your home screen for quick access and offline use
            </p>
            <Button size="sm" variant="primary">
              Install App
            </Button>
          </div>
        </Card>
      </div>
    </MobileLayout>
  );
}

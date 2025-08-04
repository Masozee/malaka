"use client";

import MobileLayout from '@/components/layout/MobileLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  User, 
  Calendar, 
  FileText,
  Clock,
  Banknote,
  ChevronRight
} from 'lucide-react';

const hrFeatures = [
  {
    name: 'My Profile',
    icon: User,
    href: '/hr/profile',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    name: 'Attendance',
    icon: Clock,
    href: '/attendance',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    name: 'Leave Request',
    icon: Calendar,
    href: '/hr/leave',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    name: 'Payroll',
    icon: Banknote,
    href: '/hr/payroll',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    name: 'Documents',
    icon: FileText,
    href: '/hr/documents',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
];

export default function HRPage() {
  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">HR Services</h1>
          <p className="text-sm text-gray-600 mt-1">
            Employee self-service portal
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="text-2xl font-bold text-blue-600 mb-1">12</div>
            <div className="text-xs text-blue-600 font-medium">Leave Days</div>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="text-2xl font-bold text-green-600 mb-1">98%</div>
            <div className="text-xs text-green-600 font-medium">Attendance</div>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="text-2xl font-bold text-purple-600 mb-1">4.5</div>
            <div className="text-xs text-purple-600 font-medium">Rating</div>
          </Card>
        </div>

        {/* HR Features Grid */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Services</h2>
          <div className="grid grid-cols-1 gap-3">
            {hrFeatures.map((feature) => (
              <Card 
                key={feature.name}
                className="p-4 hover:shadow-md transition-shadow"
                onClick={() => window.location.href = feature.href}
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${feature.bgColor} mr-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-base">{feature.name}</h3>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              fullWidth 
              variant="primary" 
              className="py-4"
              onClick={() => window.location.href = '/attendance'}
            >
              <Clock className="h-5 w-5 mr-2" />
              Clock In/Out
            </Button>
            <Button 
              fullWidth 
              variant="outline" 
              className="py-4"
              onClick={() => window.location.href = '/hr/leave'}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Request Leave
            </Button>
          </div>
        </div>

        {/* Recent Updates */}
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Recent Updates</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="h-2 w-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                <div className="flex-1 text-sm">
                  <p className="text-gray-900 font-medium">Leave request approved</p>
                  <p className="text-gray-500 text-xs">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="h-2 w-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                <div className="flex-1 text-sm">
                  <p className="text-gray-900 font-medium">New salary slip available</p>
                  <p className="text-gray-500 text-xs">1 day ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="h-2 w-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                <div className="flex-1 text-sm">
                  <p className="text-gray-900 font-medium">Performance review due</p>
                  <p className="text-gray-500 text-xs">3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </MobileLayout>
  );
}
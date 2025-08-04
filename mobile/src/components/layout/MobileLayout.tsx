"use client";

import { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  Package, 
  Clock,
  Menu,
  X,
  Bell
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

interface MobileLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'HR', href: '/hr', icon: Users },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Attendance', href: '/attendance', icon: Clock },
];

export default function MobileLayout({ children }: MobileLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Malaka ERP</h2>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="mt-4 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  "group flex items-center px-3 py-3 text-sm font-medium rounded-md mb-1 transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" 
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <item.icon className={clsx(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                )} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile header */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <h1 className="text-lg font-semibold text-gray-900">
              Malaka ERP
            </h1>
            
            <button
              onClick={() => window.location.href = '/notifications'}
              className="relative p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
              <Bell className="h-5 w-5" />
              {/* Notification badge */}
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

        {/* Bottom navigation for mobile */}
        <nav className="bg-white border-t border-gray-200 lg:hidden">
          <div className="grid grid-cols-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    "flex flex-col items-center py-2 px-1 text-xs font-medium transition-colors",
                    isActive 
                      ? "text-blue-600 bg-blue-50" 
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <item.icon className={clsx(
                    "h-6 w-6 mb-1",
                    isActive ? "text-blue-600" : "text-gray-400"
                  )} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
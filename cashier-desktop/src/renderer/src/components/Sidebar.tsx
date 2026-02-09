import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  DashboardSquare01Icon,
  CreditCardIcon,
  Analytics02Icon,
  Settings01Icon,
  Logout01Icon,
  UserCircleIcon
} from '@hugeicons/core-free-icons'
import logo from '/logo.png'

interface MenuItem {
  label: string
  path: string
  icon: typeof DashboardSquare01Icon
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: DashboardSquare01Icon },
  { label: 'Transactions', path: '/pos', icon: CreditCardIcon },
  { label: 'Report', path: '/report', icon: Analytics02Icon },
  { label: 'Settings', path: '/settings', icon: Settings01Icon }
]

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <div className="w-64 bg-white flex flex-col h-full">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Malaka" className="h-10 w-auto" />
          <div>
            <h1 className="font-semibold text-lg">Malaka POS</h1>
            <p className="text-xs text-muted-foreground">Cashier System</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all w-full ${
                    isActive
                      ? 'bg-gray-100 font-medium'
                      : 'text-muted-foreground hover:bg-gray-50'
                  }`
                }
              >
                <HugeiconsIcon icon={item.icon} className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Profile Footer */}
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-3 px-2">
          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
            <HugeiconsIcon icon={UserCircleIcon} className="h-6 w-6 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{user?.username || 'Cashier'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-gray-50 rounded-lg transition-colors"
        >
          <HugeiconsIcon icon={Logout01Icon} className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

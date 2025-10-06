'use client'

import { useMemo } from 'react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { 
  User, 
  LogOut, 
  Bell,
  MessageCircle,
  Home,
  BarChart3,
  Building2,
  Users,
  TrendingUp,
  Shield
} from 'lucide-react'
import GlobalSearch from './global-search'

interface DashboardLayoutProps {
  children: React.ReactNode
  activeView: string
  onViewChange: (view: string) => void
  onToggleAssistant: () => void
}

export default function DashboardLayout({ children, activeView, onViewChange, onToggleAssistant }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const navItems = useMemo(() => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'intelligence', label: 'Intelligence', icon: BarChart3 },
      { id: 'opportunities', label: 'Opportunities', icon: TrendingUp },
      { id: 'projects', label: 'Projects', icon: Building2 },
      { id: 'ministries', label: 'Ministries', icon: Users },
    ]

    if (user?.role === 'ENTREPRENEUR' || user?.role === 'INVESTOR') {
      return baseItems.filter(item => ['dashboard', 'opportunities', 'intelligence'].includes(item.id))
    }

    return baseItems
  }, [user?.role])

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center h-10 w-10 rounded bg-blue-700 text-white">
                <Shield size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-900">
                  Rwanda Government Intelligence
                </h1>
                <p className="text-sm text-gray-600">
                  Decision Intelligence Platform
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <GlobalSearch />
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell size={20} />
              </Button>
              
              <div className="flex items-center space-x-2 border-l pl-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role} • {user?.ministry}</p>
                </div>
                <Button variant="ghost" size="icon">
                  <User size={20} />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut size={20} />
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="mt-4 flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeView === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* AI Assistant Launcher */}
      <button
        onClick={onToggleAssistant}
        className="fixed bottom-6 right-6 bg-blue-700 hover:bg-blue-800 text-white p-4 rounded-full shadow-lg transition-colors z-40"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  )
}
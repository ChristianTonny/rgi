'use client'

import { useState, useMemo } from 'react'
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
  Shield,
  Search,
  MoreVertical,
  UserCircle
} from 'lucide-react'
import GlobalSearch from './global-search'

interface DashboardLayoutProps {
  children: React.ReactNode
  activeView: string
  onViewChange: (view: string) => void
  onToggleAssistant: () => void
}

export default function DashboardLayout({
  children,
  activeView,
  onViewChange,
  onToggleAssistant
}: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const navItems = useMemo(() => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'intelligence', label: 'Intelligence', icon: BarChart3 },
      { id: 'opportunities', label: 'Opportunities', icon: TrendingUp },
      { id: 'projects', label: 'Projects', icon: Building2 },
      { id: 'ministries', label: 'Ministries', icon: Users }
    ]

    if (user?.role === 'ENTREPRENEUR' || user?.role === 'INVESTOR') {
      return baseItems.filter(item =>
        ['dashboard', 'opportunities', 'intelligence'].includes(item.id)
      )
    }

    return baseItems
  }, [user?.role])

  const handleLogout = () => {
    logout()
    setIsUserMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 md:px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center h-10 w-10 rounded bg-blue-700 text-white">
                <Shield size={24} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-xl font-bold text-blue-900">
                  Rwanda Government Intelligence
                </h1>
                <p className="text-xs md:text-sm text-gray-600">
                  Decision Intelligence Platform
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex flex-wrap gap-2 md:space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`flex items-center space-x-1 px-2 py-1 md:px-3 md:py-2 text-sm font-medium rounded-sm transition-colors ${
                      activeView === item.id
                        ? 'text-blue-700 border-b-2 border-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                )
              })}
            </nav>

            {/* Right section: search + user menu */}
            <div className="flex items-center space-x-2 md:space-x-4 ">
              {/* Search button */}
              <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                <Search size={20} />
              </Button>
 <div className="px-4 py-2 text-sm text-gray-700 hidden sm:block">
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-xs text-gray-500">
                        {user?.role} • {user?.ministry}
                      </p>
                    </div>
              {/* User Menu Trigger */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <UserCircle size={20} />
                </Button>

                {/* Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-xs text-gray-500">
                        {user?.role} • {user?.ministry}
                      </p>
                    </div>
                    <button
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Bell size={16} />
                      <span>Notifications</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* AI Assistant Launcher */}
      <button
        onClick={onToggleAssistant}
        className="fixed bottom-6 right-6 bg-blue-700 hover:bg-blue-800 text-white p-4 rounded-full shadow-lg transition-colors z-40"
      >
        <MessageCircle size={24} />
      </button>

      {/* Global Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex  justify-center">
          <div
            className="absolute inset-0 backdrop-blur-sm bg-black/20"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="relative  rounded-lg p-6 w-full h-full max-w-[50%]">
            <GlobalSearch />
          </div>
        </div>
      )}
    </div>
  )
}

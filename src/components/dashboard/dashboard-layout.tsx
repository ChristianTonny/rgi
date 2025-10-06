'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
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
  Menu
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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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
        <div className="px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center justify-between gap-3 flex-wrap md:flex-nowrap">
            {/* Logo and Title */}
            <Link href="/" className="flex items-center gap-3 group" title="Go to Dashboard">
              <div className="flex items-center justify-center h-9 w-9 md:h-10 md:w-10 rounded bg-blue-700 text-white shrink-0">
                <Shield size={22} className="md:hidden" />
                <Shield size={24} className="hidden md:block" />
              </div>
              <div className="min-w-0 cursor-pointer">
                <h1 className="text-base md:text-xl font-bold text-blue-900 truncate group-hover:underline">
                  Rwanda Government Intelligence
                </h1>
                <p className="hidden sm:block text-xs md:text-sm text-gray-600 truncate">
                  Decision Intelligence Platform
                </p>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="order-3 w-full md:order-none md:flex-1 md:max-w-2xl md:mx-8">
              <GlobalSearch />
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="outline"
                size="icon"
                className="sm:hidden"
                onClick={() => setIsMenuOpen((open) => !open)}
                aria-label="Open menu"
                aria-expanded={isMenuOpen}
              >
                <Menu size={18} />
              </Button>
              <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                <Bell size={20} />
              </Button>
              
              <div className="flex items-center gap-2 border-l pl-3 md:pl-4">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[10rem]">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[10rem]">{user?.role} • {user?.ministry}</p>
                </div>
                <a
                  href="/settings"
                  className="hidden sm:inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-gray-100"
                  title="Settings"
                >
                  <User size={20} />
                </a>
                <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
                  <LogOut size={20} />
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="mt-3 md:mt-4 hidden sm:flex gap-2 md:gap-6 overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center gap-2 px-2 py-1.5 md:px-3 md:py-2 text-sm font-medium rounded-md md:rounded-lg whitespace-nowrap transition-colors ${
                    activeView === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} className="shrink-0" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
          {isMenuOpen && (
            <div className="sm:hidden mt-2 border border-gray-200 rounded-md overflow-hidden">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeView === item.id
                return (
                  <button
                    key={`mobile-${item.id}`}
                    onClick={() => { onViewChange(item.id); setIsMenuOpen(false) }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* AI Assistant Launcher */}
      <button
        onClick={onToggleAssistant}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 bg-blue-700 hover:bg-blue-800 text-white p-3 md:p-4 rounded-full shadow-lg transition-colors z-40"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  )
}
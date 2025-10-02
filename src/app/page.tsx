'use client'

import { useAuth } from '@/lib/auth'
import LoginForm from '@/components/auth/login-form'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import IntelligenceModules from '@/components/dashboard/intelligence-modules'
import InstitutionalMemory from '@/components/institutional/institutional-memory'
import EntrepreneurPortal from '@/components/entrepreneur/entrepreneur-portal'
import ProjectsOverview from '@/components/projects/projects-overview'
import MinistriesOverview from '@/components/ministries/ministries-overview'
import AIAssistant from '@/components/ai/ai-assistant'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [activeView, setActiveView] = useState('dashboard')

  const availableViews = useMemo(() => {
    if (!user) return {}

    const baseViews = {
      dashboard: <IntelligenceModules />,
      intelligence: <InstitutionalMemory />,
      opportunities: <EntrepreneurPortal />,
      projects: <ProjectsOverview />,
      ministries: <MinistriesOverview />
    }

    if (user.role === 'ENTREPRENEUR' || user.role === 'INVESTOR') {
      return {
        dashboard: <EntrepreneurPortal />,
        opportunities: <EntrepreneurPortal />,
        intelligence: <IntelligenceModules />
      }
    }

    if (user.role === 'POLICY_DIRECTOR' || user.role === 'ADMIN' || user.role === 'PERMANENT_SECRETARY') {
      return {
        dashboard: <IntelligenceModules />,
        intelligence: <InstitutionalMemory />,
        projects: <ProjectsOverview />,
        ministries: <MinistriesOverview />,
        opportunities: <EntrepreneurPortal />
      }
    }

    return baseViews
  }, [user])

  // Ensure active view remains valid for the current role
  useEffect(() => {
    if (!user) return

    const keys = Object.keys(availableViews)
    if (!keys.length) return

    if (!keys.includes(activeView)) {
      setActiveView(keys[0])
    }
  }, [availableViews, activeView, user])

  // Sync active view with view query param on navigation changes
  useEffect(() => {
    if (!user) return

    const keys = Object.keys(availableViews)
    if (!keys.length) return

    const viewParam = searchParams?.get('view') ?? undefined
    if (viewParam && keys.includes(viewParam) && viewParam !== activeView) {
      setActiveView(viewParam)
    }
  }, [availableViews, searchParams, user])

  // Keep URL in sync when active view changes via UI interactions
  useEffect(() => {
    if (!user) return

    const currentView = searchParams?.get('view') ?? undefined
    if (currentView === activeView) return

    const params = new URLSearchParams(searchParams?.toString() ?? '')
    if (activeView) {
      params.set('view', activeView)
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [activeView, pathname, router, searchParams, user])

  const activeContent = availableViews[activeView as keyof typeof availableViews] ?? <IntelligenceModules />

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Rwanda Government Intelligence...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <DashboardLayout
      activeView={activeView}
      onViewChange={setActiveView}
      onToggleAssistant={() => setIsAIAssistantOpen((prev) => !prev)}
    >
      <div className="p-6 space-y-6">
        {activeContent}
        {user.role !== 'ENTREPRENEUR' && user.role !== 'INVESTOR' && (
          <InstitutionalMemory />
        )}
      </div>

      <AIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
      />
    </DashboardLayout>
  )
}

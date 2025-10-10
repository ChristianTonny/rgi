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
import { useCallback, useMemo, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

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
        intelligence: <InstitutionalMemory />
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

  // Derive activeView from URL (URL is single source of truth)
  const activeView = useMemo(() => {
    const viewParam = searchParams?.get('view')
    const availableKeys = Object.keys(availableViews)
    
    if (viewParam && availableKeys.includes(viewParam)) {
      return viewParam
    }
    
    return availableKeys[0] || 'dashboard'
  }, [searchParams, availableViews])

  // Update URL when view changes via user interaction (onViewChange callback)
  const handleViewChange = useCallback((newView: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    params.set('view', newView)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [pathname, router, searchParams])

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
      onViewChange={handleViewChange}
      onToggleAssistant={() => setIsAIAssistantOpen((prev) => !prev)}
    >
      <div className="p-6 space-y-6">
        {activeContent}
      </div>

      <AIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
      />
    </DashboardLayout>
  )
}

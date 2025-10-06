 'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth'
import LoginForm from '@/components/auth/login-form'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import AIAssistant from '@/components/ai/ai-assistant'

type UsageSnapshot = {
  totalInput: number
  totalOutput: number
  total: number
  requests: number
  byDay: Record<string, { input: number; output: number; total: number; requests: number }>
}

export default function SettingsPage() {
  const { user, isLoading } = useAuth()
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)
  const [usage, setUsage] = useState<UsageSnapshot | null>(null)
  const [activeTab, setActiveTab] = useState<'general' | 'ai-usage'>('ai-usage')

  useEffect(() => {
    try {
      const raw = localStorage.getItem('ai-usage')
      if (raw) setUsage(JSON.parse(raw))
    } catch {}
  }, [])

  const daily = useMemo(() => {
    if (!usage) return []
    return Object.entries(usage.byDay)
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .slice(0, 14)
  }, [usage])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Settings...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <DashboardLayout
      activeView={'dashboard'}
      onViewChange={(view) => { window.location.href = `/?view=${view}` }}
      onToggleAssistant={() => setIsAIAssistantOpen((prev) => !prev)}
    >
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="flex gap-2 border-b">
        <button
          className={`px-3 py-2 text-sm ${activeTab === 'general' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-600'}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`px-3 py-2 text-sm ${activeTab === 'ai-usage' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-600'}`}
          onClick={() => setActiveTab('ai-usage')}
        >
          AI Usage
        </button>
      </div>

      {activeTab === 'general' && (
        <Card>
          <CardHeader>
            <CardTitle>General Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Coming soon.</p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'ai-usage' && (
        <Card>
          <CardHeader>
            <CardTitle>AI Token Usage</CardTitle>
          </CardHeader>
          <CardContent>
            {!usage ? (
              <p className="text-sm text-gray-600">No usage recorded yet.</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Stat label="Requests" value={usage.requests} />
                  <Stat label="Input tokens" value={usage.totalInput} />
                  <Stat label="Output tokens" value={usage.totalOutput} />
                  <Stat label="Total tokens" value={usage.total} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2">Last 14 days</h3>
                  <div className="space-y-2">
                    {daily.map(([day, d]) => (
                      <div key={day} className="flex justify-between text-sm border-b py-1">
                        <span className="text-gray-600">{day}</span>
                        <span className="text-gray-900">{d.total} tokens ({d.input} in / {d.output} out, {d.requests} reqs)</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  className="text-xs text-red-600 underline"
                  onClick={() => { localStorage.removeItem('ai-usage'); setUsage(null) }}
                >
                  Clear usage data
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      <AIAssistant isOpen={isAIAssistantOpen} onClose={() => setIsAIAssistantOpen(false)} />
    </div>
    </DashboardLayout>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-3 rounded bg-gray-50 border">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-base font-semibold">{value.toLocaleString()}</div>
    </div>
  )
}



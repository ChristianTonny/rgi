 'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth'
import LoginForm from '@/components/auth/login-form'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import AIAssistant from '@/components/ai/ai-assistant'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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

  const chartData = useMemo(() => {
    if (!usage) return []
    return Object.entries(usage.byDay)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .slice(-14)
      .map(([day, d]) => ({
        date: day,
        input: d.input,
        output: d.output,
        total: d.total
      }))
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
        <div className="space-y-6">
          {/* User Profile */}
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Full Name</label>
                    <p className="text-base text-gray-900 mt-1">{user?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                    <p className="text-base text-gray-900 mt-1">{user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Role</label>
                    <p className="text-base text-gray-900 mt-1">{user?.role?.replace(/_/g, ' ') || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Ministry</label>
                    <p className="text-base text-gray-900 mt-1">{user?.ministry || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                    <p className="text-xs text-gray-500">Receive updates about projects and opportunities</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-900">AI Insights Alerts</p>
                    <p className="text-xs text-gray-500">Get notified when new AI insights are generated</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Ministry Updates</p>
                    <p className="text-xs text-gray-500">Receive briefings and performance reports</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Weekly Reports</p>
                    <p className="text-xs text-gray-500">Receive weekly performance summaries</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Display Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Display Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-2 block">Language</label>
                  <select className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="en">English</option>
                    <option value="rw">Kinyarwanda</option>
                    <option value="fr">French</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-900 mb-2 block">Theme</label>
                  <select className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="light">Light</option>
                    <option value="dark">Dark (Coming Soon)</option>
                    <option value="auto">Auto (Coming Soon)</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-900 mb-2 block">Currency Format</label>
                  <select className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="rwf">RWF (Rwandan Franc)</option>
                    <option value="usd">USD ($)</option>
                    <option value="eur">EUR (€)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Account Created</span>
                  <span className="text-sm font-medium text-gray-900">{new Date(2024, 8, 15).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Last Login</span>
                  <span className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Account Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Two-Factor Authentication</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Not Enabled
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Stat label="Requests" value={usage.requests} />
                  <Stat label="Input tokens" value={usage.totalInput} />
                  <Stat label="Output tokens" value={usage.totalOutput} />
                  <Stat label="Total tokens" value={usage.total} />
                </div>

                {chartData.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Token Usage Trend (Last 14 Days)</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorInput" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            stroke="#9ca3af"
                          />
                          <YAxis 
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            stroke="#9ca3af"
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: '#ffffff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '12px'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="input" 
                            stroke="#3b82f6" 
                            fillOpacity={1} 
                            fill="url(#colorInput)"
                            name="Input Tokens"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="output" 
                            stroke="#10b981" 
                            fillOpacity={1} 
                            fill="url(#colorOutput)"
                            name="Output Tokens"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold mb-2">Daily Breakdown</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {daily.map(([day, d]) => (
                      <div key={day} className="flex justify-between text-sm border-b py-1">
                        <span className="text-gray-600">{day}</span>
                        <span className="text-gray-900">{d.total.toLocaleString()} tokens ({d.input.toLocaleString()} in / {d.output.toLocaleString()} out, {d.requests} reqs)</span>
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



'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Check, Database, Zap, Shield, TrendingUp, Users, BarChart3, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function LandingPage() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans">
      {/* Dot Matrix Background */}
      <div className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
        <div className={`max-w-7xl w-full transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Competition Badge */}
          <div className="mb-8 inline-block">
            <div className="px-4 py-2 border-2 border-current rounded-full text-xs font-mono tracking-wider uppercase">
              NISR 2025 BIG DATA HACKATHON · TRACK 5
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] mb-8 max-w-5xl">
            Rwanda's leaders wait{' '}
            <span className="relative inline-block">
              <span className="relative z-10">weeks</span>
              <span className="absolute inset-0 bg-red-500/20 dark:bg-red-500/30 -rotate-2"></span>
            </span>
            {' '}for data.
            <br />
            We deliver it in{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-blue-600 dark:text-blue-400">5 seconds</span>
              <span className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 rotate-1"></span>
            </span>
            .
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-12 max-w-3xl leading-relaxed">
            We help Rwanda's leaders, entrepreneurs, and analysts make instant, evidence-based decisions using NISR enterprise data + AI.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Button
              size="lg"
              onClick={() => router.push('/?view=intelligence')}
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-14 px-10 text-base font-semibold rounded-none border-2 border-black dark:border-white transition-all hover:translate-x-1 hover:translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
            >
              TRY LIVE DEMO <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection('demo-video')}
              className="h-14 px-10 text-base font-semibold rounded-none border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
            >
              WATCH VIDEO (3 MIN)
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap gap-6 text-sm font-mono text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>4 NISR ENTERPRISE DATASETS</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>NST2 ALIGNED</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>PRODUCTION-READY</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="border-t-2 border-black dark:border-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 text-xs font-mono tracking-wider text-gray-600 dark:text-gray-400">
            THE BOTTLENECK
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-12 max-w-3xl">
            Today's reality: scattered spreadsheets, endless email threads, weeks of waiting
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="border-2 border-black dark:border-white p-8 bg-gray-50 dark:bg-gray-900">
              <div className="text-6xl font-bold text-red-500 mb-4">2 weeks</div>
              <div className="text-lg font-semibold mb-2">Current Process</div>
              <p className="text-gray-600 dark:text-gray-400">
                Leaders search through dozens of spreadsheets, call NISR for data, wait for analyst reports
              </p>
            </div>

            <div className="border-2 border-black dark:border-white p-8 bg-gray-50 dark:bg-gray-900">
              <div className="text-6xl font-bold text-yellow-500 mb-4">Hours</div>
              <div className="text-lg font-semibold mb-2">Decision Delays</div>
              <p className="text-gray-600 dark:text-gray-400">
                Strategic meetings postponed, resource allocation decisions stalled, opportunities missed
              </p>
            </div>

            <div className="border-2 border-black dark:border-white p-8 bg-gray-50 dark:bg-gray-900">
              <div className="text-6xl font-bold text-orange-500 mb-4">$500</div>
              <div className="text-lg font-semibold mb-2">Per Analysis</div>
              <p className="text-gray-600 dark:text-gray-400">
                Analyst hours spent manually compiling insights from scattered enterprise data sources
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution Section */}
      <section className="border-t-2 border-black dark:border-white py-20 px-6 bg-blue-50 dark:bg-blue-950/20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 text-xs font-mono tracking-wider text-blue-600 dark:text-blue-400">
            THE TRANSFORMATION
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-12 max-w-3xl">
            Instant access to NISR enterprise intelligence with AI-powered analysis
          </h2>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Real-Time Enterprise Dashboard</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      4 enterprise datasets integrated: Financial Data (revenues, expenses, profits), Employment Dataset (workforce distribution), Sector Classification, Regional Distribution
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">AI Analysis with NISR Citations</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Ask questions about enterprise performance, sector trends, and regional patterns—get instant answers with exact NISR source citations
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">One-Click Business Intelligence</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Generate production-ready sector analysis and regional reports in 5 seconds instead of 2 weeks of manual work
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-2 border-black dark:border-white p-8 bg-white dark:bg-black">
              <div className="mb-4 text-xs font-mono tracking-wider text-gray-600 dark:text-gray-400">
                LIVE METRICS
              </div>
              <div className="space-y-6">
                <div>
                  <div className="text-5xl font-bold text-green-600 dark:text-green-400 mb-2">100x</div>
                  <div className="text-sm font-semibold">Faster Decisions</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">2 weeks → 5 seconds</div>
                </div>
                <div>
                  <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">4</div>
                  <div className="text-sm font-semibold">Enterprise Datasets</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Financial, Employment, Sector, Regional</div>
                </div>
                <div>
                  <div className="text-5xl font-bold text-purple-600 dark:text-purple-400 mb-2">13M</div>
                  <div className="text-sm font-semibold">Rwandans Served</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Scalable to 450M Africans</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="border-t-2 border-black dark:border-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 text-xs font-mono tracking-wider text-gray-600 dark:text-gray-400">
            COMPARE
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-12">
            Before vs. After
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-2 border-black dark:border-white">
              <thead>
                <tr className="border-b-2 border-black dark:border-white bg-gray-100 dark:bg-gray-900">
                  <th className="text-left p-6 font-mono text-sm">CAPABILITY</th>
                  <th className="text-left p-6 font-mono text-sm border-l-2 border-black dark:border-white">CURRENT PROCESS</th>
                  <th className="text-left p-6 font-mono text-sm border-l-2 border-black dark:border-white bg-blue-50 dark:bg-blue-950/20">OUR PLATFORM</th>
                  <th className="text-left p-6 font-mono text-sm border-l-2 border-black dark:border-white">IMPACT</th>
                </tr>
              </thead>
              <tbody className="font-mono text-sm">
                <tr className="border-b-2 border-black dark:border-white">
                  <td className="p-6 font-semibold">Data Access</td>
                  <td className="p-6 border-l-2 border-black dark:border-white text-gray-600 dark:text-gray-400">Search spreadsheets manually</td>
                  <td className="p-6 border-l-2 border-black dark:border-white bg-blue-50 dark:bg-blue-950/20">Real-time dashboard</td>
                  <td className="p-6 border-l-2 border-black dark:border-white text-green-600 dark:text-green-400 font-bold">Instant</td>
                </tr>
                <tr className="border-b-2 border-black dark:border-white">
                  <td className="p-6 font-semibold">Enterprise Analysis</td>
                  <td className="p-6 border-l-2 border-black dark:border-white text-gray-600 dark:text-gray-400">Call NISR, wait days</td>
                  <td className="p-6 border-l-2 border-black dark:border-white bg-blue-50 dark:bg-blue-950/20">AI chat with citations</td>
                  <td className="p-6 border-l-2 border-black dark:border-white text-green-600 dark:text-green-400 font-bold">2 seconds</td>
                </tr>
                <tr className="border-b-2 border-black dark:border-white">
                  <td className="p-6 font-semibold">Sector Reports</td>
                  <td className="p-6 border-l-2 border-black dark:border-white text-gray-600 dark:text-gray-400">2 weeks analyst work</td>
                  <td className="p-6 border-l-2 border-black dark:border-white bg-blue-50 dark:bg-blue-950/20">One-click generation</td>
                  <td className="p-6 border-l-2 border-black dark:border-white text-green-600 dark:text-green-400 font-bold">5 seconds</td>
                </tr>
                <tr className="border-b-2 border-black dark:border-white">
                  <td className="p-6 font-semibold">Source Verification</td>
                  <td className="p-6 border-l-2 border-black dark:border-white text-gray-600 dark:text-gray-400">Manual citation</td>
                  <td className="p-6 border-l-2 border-black dark:border-white bg-blue-50 dark:bg-blue-950/20">Auto NISR citations</td>
                  <td className="p-6 border-l-2 border-black dark:border-white text-green-600 dark:text-green-400 font-bold">Verified</td>
                </tr>
                <tr>
                  <td className="p-6 font-semibold">Cost per Analysis</td>
                  <td className="p-6 border-l-2 border-black dark:border-white text-gray-600 dark:text-gray-400">$500 (analyst hours)</td>
                  <td className="p-6 border-l-2 border-black dark:border-white bg-blue-50 dark:bg-blue-950/20">$0 (automated)</td>
                  <td className="p-6 border-l-2 border-black dark:border-white text-green-600 dark:text-green-400 font-bold">100% savings</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="border-t-2 border-black dark:border-white py-20 px-6 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 text-xs font-mono tracking-wider text-gray-600 dark:text-gray-400">
            WHO IT'S FOR
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-12">
            Built for Rwanda's decision-makers
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="border-2 border-black dark:border-white p-8 bg-white dark:bg-black hover:translate-x-1 hover:translate-y-1 transition-transform">
              <Users className="h-12 w-12 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Government Leaders</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                National and regional leaders get instant NISR enterprise intelligence for evidence-based economic policy and resource allocation decisions.
              </p>
              <div className="text-sm font-mono text-blue-600 dark:text-blue-400">
                MULTI-SECTOR INSIGHTS
              </div>
            </div>

            <div className="border-2 border-black dark:border-white p-8 bg-white dark:bg-black hover:translate-x-1 hover:translate-y-1 transition-transform">
              <BarChart3 className="h-12 w-12 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Policy Analysts</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Research teams analyze enterprise performance trends, employment patterns, and sector growth with AI-assisted NISR data exploration.
              </p>
              <div className="text-sm font-mono text-blue-600 dark:text-blue-400">
                DATA-DRIVEN INSIGHTS
              </div>
            </div>

            <div className="border-2 border-black dark:border-white p-8 bg-white dark:bg-black hover:translate-x-1 hover:translate-y-1 transition-transform">
              <TrendingUp className="h-12 w-12 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Entrepreneurs</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Investors and business leaders identify growth sectors, understand regional markets, and make informed decisions using enterprise financial and employment data.
              </p>
              <div className="text-sm font-mono text-blue-600 dark:text-blue-400">
                MARKET INTELLIGENCE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* By The Numbers */}
      <section className="border-t-2 border-black dark:border-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 text-xs font-mono tracking-wider text-gray-600 dark:text-gray-400">
            BY THE NUMBERS
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-12">
            Production-ready platform with real NISR enterprise data
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-6xl md:text-7xl font-bold mb-4">4</div>
              <div className="text-sm font-mono">ENTERPRISE DATASETS</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">Financial, Employment, Sector, Regional</div>
            </div>
            <div className="text-center">
              <div className="text-6xl md:text-7xl font-bold mb-4 text-green-600 dark:text-green-400">100x</div>
              <div className="text-sm font-mono">FASTER</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">Decision speed improvement</div>
            </div>
            <div className="text-center">
              <div className="text-6xl md:text-7xl font-bold mb-4 text-blue-600 dark:text-blue-400">5s</div>
              <div className="text-sm font-mono">ANALYSIS</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">AI-powered insights</div>
            </div>
            <div className="text-center">
              <div className="text-6xl md:text-7xl font-bold mb-4 text-purple-600 dark:text-purple-400">72</div>
              <div className="text-sm font-mono">NISR SOURCES</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">Microdata catalog access</div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section id="demo-video" className="border-t-2 border-black dark:border-white py-20 px-6 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-4 text-xs font-mono tracking-wider text-gray-600 dark:text-gray-400">
            SEE IT IN ACTION
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            3-minute demo walkthrough
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Watch how leaders transform from scattered spreadsheets to instant enterprise intelligence in real-time.
          </p>

          {/* YouTube Video Embed */}
          <div className="aspect-video border-2 border-black dark:border-white bg-black overflow-hidden mb-8">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/GDLFTOr-2iw"
              title="Rwanda Government Intelligence Platform - NISR 2025 Hackathon Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
          
          {/* Video Link */}
          <div className="mb-8">
            <a
              href="https://youtu.be/GDLFTOr-2iw"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all font-mono text-sm"
            >
              🔗 WATCH ON YOUTUBE <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <Button
            size="lg"
            onClick={() => router.push('/?view=intelligence')}
            className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-14 px-10 text-base font-semibold rounded-none border-2 border-black dark:border-white transition-all hover:translate-x-1 hover:translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
          >
            TRY LIVE DEMO NOW <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Technical Specs */}
      <section className="border-t-2 border-black dark:border-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 text-xs font-mono tracking-wider text-gray-600 dark:text-gray-400">
            TECHNICAL SPECIFICATIONS
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-12">
            Built for scale, security, and speed
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Database className="h-6 w-6" />
                Data & Integration
              </h3>
              <div className="space-y-4 font-mono text-sm">
                <div className="flex justify-between border-b border-gray-300 dark:border-gray-700 pb-2">
                  <span>Enterprise Datasets</span>
                  <span className="font-bold">4 integrated (72 catalogs)</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 dark:border-gray-700 pb-2">
                  <span>Data Source</span>
                  <span className="font-bold">NISR Microdata Portal</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 dark:border-gray-700 pb-2">
                  <span>Query Speed</span>
                  <span className="font-bold text-green-600 dark:text-green-400">&lt; 500ms</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 dark:border-gray-700 pb-2">
                  <span>Data Coverage</span>
                  <span className="font-bold">Financial, Employment, Sector, Regional</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Zap className="h-6 w-6" />
                Performance & Scale
              </h3>
              <div className="space-y-4 font-mono text-sm">
                <div className="flex justify-between border-b border-gray-300 dark:border-gray-700 pb-2">
                  <span>Platform</span>
                  <span className="font-bold">Next.js 15 + Express</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 dark:border-gray-700 pb-2">
                  <span>AI Engine</span>
                  <span className="font-bold">Google Gemini</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 dark:border-gray-700 pb-2">
                  <span>Deployment</span>
                  <span className="font-bold text-green-600 dark:text-green-400">Production-ready</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 dark:border-gray-700 pb-2">
                  <span>Mobile Support</span>
                  <span className="font-bold">Responsive (iOS/Android)</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Shield className="h-6 w-6" />
                Security & Compliance
              </h3>
              <div className="space-y-4 font-mono text-sm">
                <div className="flex justify-between border-b border-gray-300 dark:border-gray-700 pb-2">
                  <span>Authentication</span>
                  <span className="font-bold">JWT tokens</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 dark:border-gray-700 pb-2">
                  <span>Data Privacy</span>
                  <span className="font-bold">Government-grade</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 dark:border-gray-700 pb-2">
                  <span>Audit Trail</span>
                  <span className="font-bold">Full logging</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 dark:border-gray-700 pb-2">
                  <span>NST2 Alignment</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">Certified</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <TrendingUp className="h-6 w-6" />
                Scalability Roadmap
              </h3>
              <div className="space-y-4 font-mono text-sm">
                <div className="flex justify-between border-b border-gray-300 dark:border-gray-700 pb-2">
                  <span>Phase 1 (Now)</span>
                  <span className="font-bold">4 enterprise datasets, AI analysis</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 dark:border-gray-700 pb-2">
                  <span>Phase 2 (3 mo)</span>
                  <span className="font-bold">72 catalog integration, mobile app</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 dark:border-gray-700 pb-2">
                  <span>Phase 3 (6 mo)</span>
                  <span className="font-bold">Real-time NISR API feeds</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 dark:border-gray-700 pb-2">
                  <span>Phase 4 (2 yr)</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">EAC regional rollout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NST2 Alignment */}
      <section className="border-t-2 border-black dark:border-white py-20 px-6 bg-blue-50 dark:bg-blue-950/20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 text-xs font-mono tracking-wider text-blue-600 dark:text-blue-400">
            NST2 ALIGNMENT
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-12">
            Supporting Rwanda's National Strategy for Transformation
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="border-2 border-black dark:border-white p-8 bg-white dark:bg-black">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">Pillar 1</div>
              <h3 className="text-xl font-bold mb-3">Knowledge-Based Economy</h3>
              <p className="text-gray-700 dark:text-gray-300">
                AI-powered enterprise intelligence transforms Rwanda's business ecosystem into a data-driven, innovation-focused economy
              </p>
            </div>

            <div className="border-2 border-black dark:border-white p-8 bg-white dark:bg-black">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">Pillar 2</div>
              <h3 className="text-xl font-bold mb-3">Quality of Life</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Better enterprise data means smarter job creation policies, improved economic opportunities, and enhanced livelihoods for all Rwandans
              </p>
            </div>

            <div className="border-2 border-black dark:border-white p-8 bg-white dark:bg-black">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">Pillar 3</div>
              <h3 className="text-xl font-bold mb-3">Private Sector Growth</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Enterprise analytics identify high-growth sectors, guide investment decisions, and accelerate business development across Rwanda
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t-2 border-black dark:border-white py-32 px-6 bg-black dark:bg-white text-white dark:text-black">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            Transform enterprise data into instant strategic intelligence
          </h2>
          <p className="text-xl md:text-2xl mb-12 opacity-80">
            Production-ready platform. Official NISR enterprise data. Deploy across sectors tomorrow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push('/?view=intelligence')}
              className="bg-white dark:bg-black text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 h-16 px-12 text-lg font-semibold rounded-none border-2 border-white dark:border-black transition-all hover:translate-x-1 hover:translate-y-1 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              GET STARTED — IT'S FREE <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection('demo-video')}
              className="h-16 px-12 text-lg font-semibold rounded-none border-2 border-white dark:border-black text-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-all"
            >
              WATCH 3-MIN DEMO
            </Button>
          </div>

          <div className="mt-12 text-sm font-mono opacity-60">
            NISR 2025 BIG DATA HACKATHON · TRACK 5 · BUILT FOR RWANDA 🇷🇼
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-black dark:border-white py-12 px-6 text-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="font-bold text-lg mb-4">Platform</div>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <div className="cursor-pointer hover:text-black dark:hover:text-white" onClick={() => router.push('/?view=intelligence')}>Dashboard</div>
                <div className="cursor-pointer hover:text-black dark:hover:text-white" onClick={() => router.push('/?view=opportunities')}>Opportunities</div>
                <div className="cursor-pointer hover:text-black dark:hover:text-white" onClick={() => router.push('/?view=projects')}>Projects</div>
                <div className="cursor-pointer hover:text-black dark:hover:text-white" onClick={() => router.push('/?view=ministries')}>Ministries</div>
              </div>
            </div>

            <div>
              <div className="font-bold text-lg mb-4">NISR Datasets</div>
              <div className="space-y-2 text-gray-600 dark:text-gray-400 font-mono text-xs">
                <div>Enterprise Financial Data</div>
                <div>Employment Dataset</div>
                <div>Sector Classification</div>
                <div>Regional Distribution</div>
              </div>
            </div>

            <div>
              <div className="font-bold text-lg mb-4">Competition</div>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <div>NISR 2025 Hackathon</div>
                <div>Track 5: Open Innovation</div>
                <div>October 2025</div>
              </div>
            </div>

            <div>
              <div className="font-bold text-lg mb-4">Contact</div>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <div>competition@statistics.gov.rw</div>
                <div className="text-xs mt-4">
                  Data Source: National Institute of Statistics of Rwanda
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-300 dark:border-gray-700 text-center text-gray-600 dark:text-gray-400 font-mono text-xs">
            © 2025 Rwanda Government Intelligence Platform. Built for NISR Big Data Hackathon. All NISR data sources properly cited.
          </div>
        </div>
      </footer>
    </div>
  )
}

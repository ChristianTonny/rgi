// User and Authentication Types
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  ministry?: string
  department?: string
  permissions: Permission[]
  createdAt: Date
  lastLogin?: Date
  isActive: boolean
}

export type UserRole = 
  | "MINISTER" 
  | "PERMANENT_SECRETARY" 
  | "POLICY_DIRECTOR" 
  | "DEVELOPMENT_COORDINATOR"
  | "ENTREPRENEUR" 
  | "INVESTOR"
  | "ADMIN"

export interface Permission {
  resource: string
  action: "CREATE" | "READ" | "UPDATE" | "DELETE"
}

// Dashboard and Intelligence Types
export interface IntelligenceModule {
  id: string
  title: string
  type: "resource-allocation" | "opportunity-radar" | "performance-monitor"
  priority: "HIGH" | "MEDIUM" | "LOW"
  data: any
  lastUpdated: Date
  insights: Insight[]
}

export interface Insight {
  id: string
  type: "ALERT" | "RECOMMENDATION" | "TREND" | "OPPORTUNITY"
  title: string
  description: string
  confidence: number // 0-100
  impact: "HIGH" | "MEDIUM" | "LOW"
  actionRequired: boolean
  relatedData: string[]
  createdAt: Date
}

// Government Data Types
export interface Ministry {
  id: string
  name: string
  code: string
  budget: number
  currentSpending: number
  projects: Project[]
  performance: PerformanceMetric[]
}

export interface Project {
  id: string
  name: string
  description: string
  ministry: string
  budget: number
  spent: number
  startDate: Date
  endDate: Date
  status: "PLANNING" | "ACTIVE" | "DELAYED" | "COMPLETED" | "CANCELLED"
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  beneficiaries: number
  location: string[]
  outcomes: ProjectOutcome[]
}

export interface ProjectOutcome {
  indicator: string
  target: number
  achieved: number
  unit: string
  lastMeasured: Date
}

export interface PerformanceMetric {
  id: string
  name: string
  value: number
  target: number
  unit: string
  trend: "IMPROVING" | "DECLINING" | "STABLE"
  category: string
  lastUpdated: Date
}

// Economic and Market Intelligence Types
export interface EconomicIndicator {
  id: string
  name: string
  value: number
  previousValue: number
  change: number
  unit: string
  category: "GDP" | "INFLATION" | "EMPLOYMENT" | "TRADE" | "FISCAL"
  source: string
  lastUpdated: Date
}

export interface InvestmentOpportunity {
  id: string
  title: string
  sector: string
  location: string
  investmentRange: {
    min: number
    max: number
  }
  roi: {
    estimated: number
    timeframe: string
  }
  marketSize: number
  competitionLevel: "LOW" | "MEDIUM" | "HIGH"
  regulatoryComplexity: "LOW" | "MEDIUM" | "HIGH"
  riskAssessment: RiskAssessment
  requirements: string[]
  incentives: string[]
  createdAt: Date
  updatedAt: Date
}

export interface RiskAssessment {
  overall: "LOW" | "MEDIUM" | "HIGH"
  factors: {
    regulatory: "LOW" | "MEDIUM" | "HIGH"
    market: "LOW" | "MEDIUM" | "HIGH"
    financial: "LOW" | "MEDIUM" | "HIGH"
    operational: "LOW" | "MEDIUM" | "HIGH"
  }
  mitigationStrategies: string[]
}

// AI Assistant Types
export interface AIConversation {
  id: string
  userId: string
  messages: AIMessage[]
  context: ConversationContext
  createdAt: Date
  lastActivity: Date
}

export interface AIMessage {
  id: string
  role: "USER" | "ASSISTANT"
  content: string
  timestamp: Date
  sources?: DataSource[]
  insights?: Insight[]
}

export interface ConversationContext {
  userRole: UserRole
  ministry?: string
  currentProject?: string
  dataScope: string[]
}

export interface DataSource {
  id: string
  name: string
  type: "MINISTRY" | "STATISTICS" | "ECONOMIC" | "PROJECT" | "EXTERNAL"
  url?: string
  lastUpdated: Date
  reliability: number // 0-100
}

// Search and Discovery Types
export interface SearchResult {
  id: string
  title: string
  type: "PROJECT" | "POLICY" | "DATA" | "OPPORTUNITY" | "INSIGHT"
  relevance: number
  content: string
  source: DataSource
  metadata: Record<string, any>
  createdAt: Date
}

export interface SearchQuery {
  query: string
  filters: {
    type?: string[]
    dateRange?: {
      start: Date
      end: Date
    }
    ministry?: string[]
    source?: string[]
  }
  userId: string
  timestamp: Date
}

// Analytics and Reporting Types
export interface AnalyticsData {
  id: string
  metric: string
  value: number
  dimensions: Record<string, string>
  timestamp: Date
}

export interface Report {
  id: string
  title: string
  type: "EXECUTIVE" | "OPERATIONAL" | "FINANCIAL" | "PERFORMANCE"
  generatedFor: UserRole[]
  data: any
  insights: Insight[]
  recommendations: string[]
  generatedAt: Date
  generatedBy: string
}
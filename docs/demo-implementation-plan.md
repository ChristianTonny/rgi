# Functional Demo Implementation Plan

**Goal**: Create a working prototype demo, skipping complex backend work.

**Status**: Ready to implement

---

## Phase 1: Data Verification & Mock Data (30 mins)

### Task 1.1: Verify Current Express API Endpoints
**Objective**: Check which endpoints return data vs empty/error responses

**Steps**:
1. Start Express server: `npm run server:dev`
2. Test each endpoint with curl/Postman:
   - `GET http://localhost:3001/api/intelligence/modules` (with auth token)
   - `GET http://localhost:3001/api/search?q=test` (with auth token)
   - `POST http://localhost:3001/api/ai/chat` (with auth token)
   - `GET http://localhost:3001/api/projects` (if exists)
   - `GET http://localhost:3001/api/opportunities` (if exists)
   - `GET http://localhost:3001/api/ministries` (if exists)

**Expected Output**: List of which endpoints need mock data

**Files to Check**:
- `server/routes/intelligence.js`
- `server/routes/search.js`
- `server/routes/ai.js`
- `server/routes/projects.js`
- `server/routes/opportunities.js`
- `server/routes/ministries.js`

---

### Task 1.2: Add Mock Data to Intelligence Modules Endpoint
**Objective**: Ensure dashboard cards show data

**File**: `server/routes/intelligence.js`

**Implementation**:
```javascript
const express = require('express');
const { authenticateToken } = require('./auth');
const router = express.Router();

// GET /api/intelligence/modules
router.get('/modules', authenticateToken, (req, res) => {
  const modules = [
    {
      id: 'resource-allocation-1',
      type: 'resource-allocation',
      title: 'Resource Allocation',
      lastUpdated: new Date().toISOString(),
      data: {
        totalBudget: 5000000000, // 5B RWF
        available: 1200000000,   // 1.2B RWF
        spent: 3800000000,       // 3.8B RWF
        efficiency: 87.5
      }
    },
    {
      id: 'opportunity-radar-1',
      type: 'opportunity-radar',
      title: 'Opportunity Radar',
      lastUpdated: new Date().toISOString(),
      data: {
        totalOpportunities: 45,
        highPriorityOpportunities: 12,
        estimatedValue: 2500000000 // 2.5B RWF
      }
    },
    {
      id: 'performance-monitor-1',
      type: 'performance-monitor',
      title: 'Performance Monitor',
      lastUpdated: new Date().toISOString(),
      data: {
        projectsAtRisk: 8,
        totalProjects: 42,
        onTimeDelivery: 78.5,
        qualityScore: 85.2
      }
    }
  ];

  res.json({
    success: true,
    data: modules,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
```

**Create file if it doesn't exist**: `server/routes/intelligence.js`
**Register in**: `server/index.js` (likely already done, verify line ~1283)

---

### Task 1.3: Add Mock Data to Search Endpoint
**Objective**: Make search return relevant results

**File**: `server/routes/search.js`

**Implementation**:
```javascript
const express = require('express');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Mock searchable data
const mockData = [
  // Projects
  {
    id: 'proj-1',
    type: 'PROJECT',
    title: 'National Infrastructure Upgrade',
    content: 'Modernizing road and bridge infrastructure across all provinces',
    source: { name: 'Ministry of Infrastructure' },
    metadata: { budget: 1500000000, status: 'IN_PROGRESS' }
  },
  {
    id: 'proj-2',
    type: 'PROJECT',
    title: 'ICT Digital Transformation Initiative',
    content: 'Implementing e-governance platforms and digital services for citizens',
    source: { name: 'Ministry of ICT' },
    metadata: { budget: 800000000, status: 'IN_PROGRESS' }
  },
  {
    id: 'proj-3',
    type: 'PROJECT',
    title: 'Healthcare System Modernization',
    content: 'Upgrading healthcare facilities and implementing electronic health records',
    source: { name: 'Ministry of Health' },
    metadata: { budget: 1200000000, status: 'PLANNING' }
  },
  // Opportunities
  {
    id: 'opp-1',
    type: 'OPPORTUNITY',
    title: 'Renewable Energy Investment - Solar Parks',
    content: 'Investment opportunity in 50MW solar park development in Eastern Province',
    source: { name: 'Rwanda Development Board' },
    metadata: { investmentRange: '500M-1B RWF', sector: 'Energy', riskLevel: 'MEDIUM' }
  },
  {
    id: 'opp-2',
    type: 'OPPORTUNITY',
    title: 'Agricultural Processing Plant',
    content: 'Coffee and tea processing facility expansion opportunity',
    source: { name: 'Ministry of Agriculture' },
    metadata: { investmentRange: '200M-500M RWF', sector: 'Agriculture', riskLevel: 'LOW' }
  },
  {
    id: 'opp-3',
    type: 'OPPORTUNITY',
    title: 'Tourism Infrastructure Development',
    content: 'Eco-tourism lodges and visitor centers in national parks',
    source: { name: 'Rwanda Development Board' },
    metadata: { investmentRange: '1B-2B RWF', sector: 'Tourism', riskLevel: 'MEDIUM' }
  },
  // Insights
  {
    id: 'insight-1',
    type: 'INSIGHT',
    title: 'Budget Efficiency Analysis Q4 2024',
    content: 'Analysis shows 12% improvement in budget utilization across ministries',
    source: { name: 'National Intelligence Dashboard' },
    metadata: { category: 'BUDGET', confidence: 0.92 }
  },
  {
    id: 'insight-2',
    type: 'INSIGHT',
    title: 'Project Risk Assessment - Infrastructure',
    content: 'Three infrastructure projects require immediate attention due to timeline delays',
    source: { name: 'National Intelligence Dashboard' },
    metadata: { category: 'RISK', confidence: 0.88 }
  },
  // Policies
  {
    id: 'policy-1',
    type: 'POLICY',
    title: 'Digital Economy Policy Framework 2024',
    content: 'New framework for digital economy growth and innovation support',
    source: { name: 'Ministry of ICT' },
    metadata: { status: 'ACTIVE', effectiveDate: '2024-01-01' }
  },
  {
    id: 'policy-2',
    type: 'POLICY',
    title: 'Green Growth Strategy',
    content: 'National strategy for sustainable development and environmental protection',
    source: { name: 'Ministry of Environment' },
    metadata: { status: 'ACTIVE', effectiveDate: '2024-03-01' }
  }
];

// GET /api/search
router.get('/', authenticateToken, (req, res) => {
  const { q, limit = 10 } = req.query;

  if (!q || q.trim().length < 2) {
    return res.json({
      success: true,
      data: [],
      message: 'Query too short'
    });
  }

  const query = q.toLowerCase().trim();

  // Filter results based on query
  const results = mockData.filter(item => {
    const titleMatch = item.title.toLowerCase().includes(query);
    const contentMatch = item.content.toLowerCase().includes(query);
    return titleMatch || contentMatch;
  });

  // Limit results
  const limitedResults = results.slice(0, parseInt(limit));

  res.json({
    success: true,
    data: limitedResults,
    total: results.length,
    query: q
  });
});

module.exports = router;
```

**Create file if it doesn't exist**: `server/routes/search.js`
**Register in**: `server/index.js` (likely already done at line ~1289)

---

### Task 1.4: Enhance AI Chat Responses
**Objective**: Make AI assistant give contextual, helpful responses

**File**: `server/routes/ai.js`

**Implementation**:
```javascript
const express = require('express');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Contextual response templates
const responseTemplates = {
  budget: {
    keywords: ['budget', 'spending', 'allocation', 'funds', 'money'],
    responses: [
      "Based on current allocations, you have 1.2B RWF available across all ministries. The ICT Ministry is utilizing funds most efficiently at 92%, while Infrastructure has 15% unallocated budget.",
      "Budget analysis shows 87.5% efficiency rate. Top performers: ICT (92%), Health (89%), Education (85%). Infrastructure Ministry has room for optimization.",
      "Q4 spending is on track. 3.8B RWF spent of 5B RWF total budget. Projected year-end efficiency: 88%."
    ]
  },
  projects: {
    keywords: ['project', 'initiative', 'program'],
    responses: [
      "You have 42 active projects. 8 are flagged as at-risk due to timeline or budget concerns. Priority attention needed: Infrastructure Upgrade Project, Healthcare System Modernization.",
      "Project portfolio health: 78.5% on-time delivery rate, 85.2% quality score. Best performing: ICT Digital Transformation (98% on schedule).",
      "3 projects require immediate review: National Infrastructure Upgrade (timeline delay), Healthcare Modernization (budget variance), Rural Connectivity (resource constraints)."
    ]
  },
  opportunities: {
    keywords: ['opportunity', 'investment', 'investor'],
    responses: [
      "45 investment opportunities available, 12 marked high-priority. Top sectors: Renewable Energy (2.5B RWF), Tourism Infrastructure (1.8B RWF), Agricultural Processing (900M RWF).",
      "New opportunities this week: Solar Parks (Eastern Province, 500M-1B RWF), Eco-Tourism Lodges (1B-2B RWF). Both rated medium risk with strong ROI potential.",
      "Opportunity pipeline value: 2.5B RWF estimated. Energy sector leads with 35% of opportunities, followed by Agriculture (25%) and Tourism (20%)."
    ]
  },
  risk: {
    keywords: ['risk', 'issue', 'problem', 'concern', 'alert'],
    responses: [
      "8 projects currently at risk. Primary concerns: 5 timeline delays, 2 budget overruns, 1 resource shortage. Immediate attention needed for Infrastructure Upgrade Project.",
      "Risk assessment summary: High risk (2 projects), Medium risk (6 projects), Low risk (34 projects). No critical risks detected.",
      "Recent risk escalation: Healthcare System Modernization moved to medium risk due to supplier delays. Mitigation plan in progress."
    ]
  },
  ministry: {
    keywords: ['ministry', 'ministries', 'department'],
    responses: [
      "Ministry performance rankings: 1) ICT (92% efficiency), 2) Health (89%), 3) Education (85%), 4) Finance (83%), 5) Infrastructure (78%).",
      "ICT Ministry leading in efficiency with 92% budget utilization and 95% project on-time delivery. Infrastructure Ministry has improvement opportunities.",
      "Cross-ministry collaboration opportunities identified: ICT + Health (digital health records), Infrastructure + Environment (green construction standards)."
    ]
  },
  help: {
    keywords: ['help', 'what can', 'how do', 'show me'],
    responses: [
      "I can help you with: Budget analysis, Project status updates, Risk assessments, Investment opportunities, Ministry performance reviews, and Strategic recommendations. What would you like to know?",
      "Try asking me about: 'Show projects at risk', 'Budget efficiency report', 'Top investment opportunities', 'Ministry performance comparison'.",
      "I provide real-time insights on budgets, projects, opportunities, and ministry performance. I can also help you identify risks and generate reports."
    ]
  }
};

// Generic fallback responses
const fallbackResponses = [
  "I'm analyzing the data across all government systems. Could you be more specific about what you'd like to know?",
  "I have access to budget, project, opportunity, and ministry data. What aspect would you like me to analyze?",
  "I can provide insights on government intelligence data. Try asking about budgets, projects, risks, or opportunities.",
  "Let me check the latest data. Would you like information about a specific ministry, project, or investment opportunity?"
];

// Helper to find matching category
function findCategory(message) {
  const lowerMessage = message.toLowerCase();

  for (const [category, config] of Object.entries(responseTemplates)) {
    if (config.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return category;
    }
  }

  return null;
}

// Helper to get random response from array
function getRandomResponse(responses) {
  return responses[Math.floor(Math.random() * responses.length)];
}

// POST /api/ai/chat
router.post('/chat', authenticateToken, (req, res) => {
  const { message, conversationId } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Message is required'
    });
  }

  // Find matching category
  const category = findCategory(message);

  let response;
  if (category) {
    response = getRandomResponse(responseTemplates[category].responses);
  } else {
    response = getRandomResponse(fallbackResponses);
  }

  // Return response
  res.json({
    success: true,
    data: {
      message: response,
      conversationId: conversationId || `conv-${Date.now()}`,
      timestamp: new Date().toISOString(),
      confidence: category ? 0.85 : 0.5
    }
  });
});

// GET /api/ai/suggestions (for initial load)
router.get('/suggestions', authenticateToken, (req, res) => {
  const suggestions = [
    "Show me projects at risk",
    "What's our budget efficiency?",
    "Top investment opportunities",
    "Ministry performance comparison",
    "Recent risk alerts"
  ];

  res.json({
    success: true,
    data: suggestions
  });
});

module.exports = router;
```

**Update file**: `server/routes/ai.js` (or create if doesn't exist)
**Register in**: `server/index.js` (verify line ~1288)

---

## Phase 2: Interactive Cards & Modals (1 hour)

### Task 2.1: Create Reusable Modal Component
**Objective**: Build a modal component for showing details

**File**: Create `src/components/ui/detail-modal.tsx`

**Implementation**:
```tsx
'use client'

import { X } from 'lucide-react'
import { useEffect } from 'react'

interface DetailModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}

export function DetailModal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'lg'
}: DetailModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative bg-white rounded-lg shadow-xl ${maxWidthClasses[maxWidth]} w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
```

---

### Task 2.2: Add Project Detail Modal
**Objective**: Show project details when clicking a project card

**File**: Update `src/components/projects/projects-overview.tsx`

**Changes**:
1. Add state for selected project:
```tsx
const [selectedProject, setSelectedProject] = useState<any>(null)
```

2. Add modal component import:
```tsx
import { DetailModal } from '@/components/ui/detail-modal'
```

3. Make project rows clickable (around line 285-336):
```tsx
<tr
  key={project.id}
  className="hover:bg-gray-50 cursor-pointer transition-colors"
  onClick={() => setSelectedProject(project)}
>
```

4. Add modal at end of component (before closing `</div>`):
```tsx
{/* Project Detail Modal */}
<DetailModal
  isOpen={!!selectedProject}
  onClose={() => setSelectedProject(null)}
  title={selectedProject?.name || 'Project Details'}
  maxWidth="xl"
>
  {selectedProject && (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Ministry</label>
          <p className="text-base text-gray-900">{selectedProject.ministry}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Status</label>
          <p className="text-base">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              selectedProject.status === 'On Track' ? 'bg-green-100 text-green-800' :
              selectedProject.status === 'At Risk' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {selectedProject.status}
            </span>
          </p>
        </div>
      </div>

      {/* Budget & Progress */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="text-sm font-medium text-gray-500">Budget</label>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(selectedProject.budget)}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Progress</label>
          <p className="text-lg font-semibold text-gray-900">
            {selectedProject.progress}%
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Beneficiaries</label>
          <p className="text-lg font-semibold text-gray-900">
            {formatNumber(selectedProject.beneficiaries)}
          </p>
        </div>
      </div>

      {/* Risk Level */}
      <div>
        <label className="text-sm font-medium text-gray-500">Risk Level</label>
        <p className="text-base text-gray-900 mt-1">{selectedProject.risk}</p>
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-medium text-gray-500">Description</label>
        <p className="text-base text-gray-700 mt-1">
          {selectedProject.description || `${selectedProject.name} is a strategic government initiative aimed at improving infrastructure and services across Rwanda. This project involves multiple stakeholders and is designed to deliver measurable impact for citizens.`}
        </p>
      </div>

      {/* Timeline */}
      <div>
        <label className="text-sm font-medium text-gray-500">Timeline</label>
        <div className="mt-2 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Start Date:</span>
            <span className="text-gray-900 font-medium">Jan 2024</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Expected Completion:</span>
            <span className="text-gray-900 font-medium">Dec 2025</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Current Phase:</span>
            <span className="text-gray-900 font-medium">Implementation</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          View Full Report
        </button>
        <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          Export Details
        </button>
      </div>
    </div>
  )}
</DetailModal>
```

---

### Task 2.3: Add Opportunity Detail Modal
**Objective**: Show opportunity details when clicking opportunity card

**File**: Update `src/components/entrepreneur/entrepreneur-portal.tsx`

**Changes**:
1. Add state:
```tsx
const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null)
```

2. Import modal:
```tsx
import { DetailModal } from '@/components/ui/detail-modal'
```

3. Update "View Details" button (around line 536):
```tsx
<Button
  variant="outline"
  className="flex-1"
  onClick={() => setSelectedOpportunity(opportunity)}
>
  View Details
</Button>
```

4. Add modal before closing `</div>`:
```tsx
{/* Opportunity Detail Modal */}
<DetailModal
  isOpen={!!selectedOpportunity}
  onClose={() => setSelectedOpportunity(null)}
  title={selectedOpportunity?.title || 'Opportunity Details'}
  maxWidth="xl"
>
  {selectedOpportunity && (
    <div className="space-y-6">
      {/* Key Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Sector</label>
          <p className="text-base text-gray-900">{selectedOpportunity.sector}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Location</label>
          <p className="text-base text-gray-900">{selectedOpportunity.location}</p>
        </div>
      </div>

      {/* Investment Range */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <label className="text-sm font-medium text-blue-900">Investment Range</label>
        <p className="text-2xl font-bold text-blue-700 mt-1">
          {selectedOpportunity.investmentRange}
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-medium text-gray-500">Description</label>
        <p className="text-base text-gray-700 mt-1">{selectedOpportunity.description}</p>
      </div>

      {/* Risk Assessment */}
      <div>
        <label className="text-sm font-medium text-gray-500">Risk Level</label>
        <div className="mt-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            selectedOpportunity.riskLevel === 'LOW' ? 'bg-green-100 text-green-800' :
            selectedOpportunity.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {selectedOpportunity.riskLevel}
          </span>
          <p className="text-sm text-gray-600 mt-2">
            Risk assessment based on market analysis, regulatory environment, and execution complexity.
          </p>
        </div>
      </div>

      {/* Expected Returns */}
      <div>
        <label className="text-sm font-medium text-gray-500">Expected Returns</label>
        <div className="mt-2 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">ROI Timeline:</span>
            <span className="text-gray-900 font-medium">3-5 years</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Projected IRR:</span>
            <span className="text-gray-900 font-medium">12-18%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Job Creation:</span>
            <span className="text-gray-900 font-medium">500+ jobs</span>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <label className="text-sm font-medium text-gray-700">Ministry Contact</label>
        <p className="text-sm text-gray-600 mt-1">
          For more information and application procedures, contact the Rwanda Development Board.
        </p>
        <p className="text-sm text-blue-600 mt-1">partnerships@rdb.rw</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Express Interest
        </button>
        <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          Download Prospectus
        </button>
      </div>
    </div>
  )}
</DetailModal>
```

---

### Task 2.4: Add Ministry Detail View
**Objective**: Show ministry performance details when clicking a ministry row

**File**: Update `src/components/ministries/ministries-overview.tsx`

**Changes**: Similar pattern to projects - add state, make rows clickable, add modal with ministry details.

---

## Phase 3: Quick Actions & Feedback (1 hour)

### Task 3.1: Install Toast Notification Library
**Objective**: Add user feedback for actions

**Command**:
```bash
npm install sonner
```

---

### Task 3.2: Add Toast Provider to Layout
**Objective**: Enable toast notifications app-wide

**File**: `src/app/layout.tsx`

**Add import**:
```tsx
import { Toaster } from 'sonner'
```

**Add in body** (after AuthProvider):
```tsx
<AuthProvider>
  <Toaster position="top-right" richColors />
  {children}
</AuthProvider>
```

---

### Task 3.3: Wire Quick Actions Buttons
**Objective**: Make Quick Actions buttons do something

**File**: `src/components/dashboard/intelligence-modules.tsx`

**Add import**:
```tsx
import { toast } from 'sonner'
```

**Update Quick Actions buttons** (around lines 508-520):
```tsx
<Button
  variant="outline"
  className="w-full justify-start"
  onClick={() => {
    toast.success('Budget report generation started', {
      description: 'You will receive an email when the report is ready (typically 2-3 minutes)'
    })
  }}
>
  <Zap size={16} className="mr-2" />
  Generate Budget Report
</Button>

<Button
  variant="outline"
  className="w-full justify-start"
  onClick={() => {
    toast.success('Ministry performance review initiated', {
      description: 'Analyzing data across all ministries...'
    })
    // Simulate processing
    setTimeout(() => {
      toast.info('Performance review ready', {
        description: 'Click here to view the detailed analysis',
        action: {
          label: 'View',
          onClick: () => console.log('Open performance review')
        }
      })
    }, 3000)
  }}
>
  <Users size={16} className="mr-2" />
  Ministry Performance Review
</Button>

<Button
  variant="outline"
  className="w-full justify-start"
  onClick={() => {
    toast.info('Project status update form opened', {
      description: 'Select a project to update its status'
    })
  }}
>
  <CheckCircle size={16} className="mr-2" />
  Project Status Update
</Button>
```

---

### Task 3.4: Add Export Functionality
**Objective**: Enable users to export data as CSV

**File**: Create `src/lib/export-utils.ts`

**Implementation**:
```typescript
export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    console.warn('No data to export')
    return
  }

  // Get headers from first object
  const headers = Object.keys(data[0])

  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row =>
      headers.map(header => {
        const value = row[header]
        // Handle values with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportToJSON(data: any[], filename: string) {
  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
```

---

### Task 3.5: Add Export to Projects Overview
**Objective**: Enable export of project data

**File**: `src/components/projects/projects-overview.tsx`

**Add imports**:
```tsx
import { exportToCSV } from '@/lib/export-utils'
import { toast } from 'sonner'
```

**Update "Export Data" button** (around line 281):
```tsx
<Button
  variant="outline"
  onClick={() => {
    // Prepare data for export
    const exportData = projects.map(p => ({
      Name: p.name,
      Ministry: p.ministry,
      Budget: p.budget,
      Progress: p.progress,
      Status: p.status,
      Risk: p.risk,
      Beneficiaries: p.beneficiaries
    }))

    exportToCSV(exportData, 'projects_overview')
    toast.success('Projects exported successfully', {
      description: `Exported ${projects.length} projects to CSV`
    })
  }}
>
  Export Data
</Button>
```

---

### Task 3.6: Add Export to Other Components
**Objective**: Repeat export functionality for opportunities, ministries

**Files**:
- `src/components/entrepreneur/entrepreneur-portal.tsx`
- `src/components/ministries/ministries-overview.tsx`

**Pattern**: Same as projects - add export button with CSV download.

---

## Phase 4: Polish & Testing (30 mins)

### Task 4.1: Add Loading States
**Objective**: Show loading feedback during async operations

**Files to Update**:
- Components already have loading states (skeleton UI)
- Verify they show when data is loading
- Add spinners to buttons during actions

**Example for button loading**:
```tsx
const [isLoading, setIsLoading] = useState(false)

<Button
  onClick={async () => {
    setIsLoading(true)
    await someAsyncAction()
    setIsLoading(false)
  }}
  disabled={isLoading}
>
  {isLoading ? 'Processing...' : 'Generate Report'}
</Button>
```

---

### Task 4.2: Test Full Demo Flow
**Objective**: Verify all interactions work

**Test Checklist**:
- [ ] Login with minister@gov.rw / password123
- [ ] Dashboard shows budget/project/opportunity stats
- [ ] Click a project → Detail modal opens
- [ ] Click "Generate Budget Report" → Toast notification
- [ ] Search "infrastructure" → See results
- [ ] Click "Export Data" → CSV downloads
- [ ] Ask AI "Show projects at risk" → Get contextual response
- [ ] Navigate between tabs
- [ ] Logout

**Fix any issues found during testing**

---

### Task 4.3: Add Express Interest Button Handler
**Objective**: Make "Express Interest" button in opportunities work

**File**: `src/components/entrepreneur/entrepreneur-portal.tsx`

**Update button** (around line 539):
```tsx
<Button
  variant="outline"
  className="flex-1"
  onClick={() => {
    toast.success('Interest registered successfully', {
      description: `We'll contact you about ${opportunity.title} within 2 business days`
    })
  }}
>
  <span className="mr-2">💼</span>
  Express Interest
</Button>
```

---

## Phase 5: Optional Enhancements (If Time Allows)

### Task 5.1: Add Mock Projects/Opportunities Data to Express
**File**: Create `server/routes/projects.js` and `server/routes/opportunities.js`

**Purpose**: Provide detailed data for each tab, not just dashboard summary.

---

### Task 5.2: Add Filtering to Search Results
**Objective**: Let users filter search by type (PROJECT, OPPORTUNITY, etc.)

**File**: `src/components/dashboard/global-search.tsx`

---

### Task 5.3: Add Charts to Dashboard
**Objective**: Visual data representation

**Library**: `recharts` (already common in React projects)

**File**: Add simple bar/line charts to `intelligence-modules.tsx`

---

## Testing & Validation

### Pre-Demo Checklist

**Backend**:
- [ ] Express server starts without errors
- [ ] `/api/intelligence/modules` returns 3 module objects
- [ ] `/api/search?q=test` returns search results
- [ ] `/api/ai/chat` returns contextual responses
- [ ] All endpoints require authentication

**Frontend**:
- [ ] Login page loads
- [ ] Can login with test credentials
- [ ] Dashboard shows data (not empty cards)
- [ ] All 5 tabs are accessible
- [ ] No console errors on page load

**Interactions**:
- [ ] Clicking project opens modal
- [ ] Clicking opportunity opens modal
- [ ] Quick Action buttons show toasts
- [ ] Export buttons download CSV
- [ ] Search returns results
- [ ] AI chat responds contextually

---

## Time Breakdown

| Phase | Task | Time |
|-------|------|------|
| 1.1 | Verify endpoints | 10 min |
| 1.2 | Add intelligence mock data | 10 min |
| 1.3 | Add search mock data | 15 min |
| 1.4 | Enhance AI responses | 15 min |
| 2.1 | Create modal component | 15 min |
| 2.2 | Add project modal | 15 min |
| 2.3 | Add opportunity modal | 15 min |
| 2.4 | Add ministry modal | 15 min |
| 3.1 | Install toast library | 2 min |
| 3.2 | Add toast provider | 3 min |
| 3.3 | Wire quick actions | 10 min |
| 3.4 | Create export utils | 10 min |
| 3.5 | Add project export | 5 min |
| 3.6 | Add other exports | 10 min |
| 4.1 | Add loading states | 10 min |
| 4.2 | Test full flow | 15 min |
| 4.3 | Final polish | 10 min |
| **TOTAL** | | **2h 45min** |

---

## Success Criteria

✅ **Demo is successful if**:
1. Dashboard loads with visible data
2. At least 2 types of detail modals work (project + opportunity)
3. Quick Actions show toast notifications
4. At least 1 export function works
5. Search returns relevant results
6. AI assistant gives contextual responses
7. No runtime errors during 5-minute demo

---

## Notes

- **Skip Convex entirely** for this demo - Express is sufficient
- **Mock data is acceptable** - focus on UX, not real data pipelines
- **Simulate async operations** with setTimeout for realism
- **Keep it simple** - better to have fewer features working perfectly than many half-working

---

## Quick Start Commands

```bash
# Terminal 1 - Start Express server
cd server
npm install
npm run dev

# Terminal 2 - Start Next.js
npm run dev

# Terminal 3 - Run implementation tasks
# Follow tasks in order from Phase 1
```

---

**Ready to implement? Start with Phase 1, Task 1.1!**

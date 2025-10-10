# Rwanda Government Intelligence Platform - Codebase Architecture Guide

**For AI Coding Agents:** This document maps the entire codebase structure, shows you where everything lives, and helps you avoid breaking what works.

**Last Updated:** October 10, 2025

---

## 🗺️ PROJECT STRUCTURE OVERVIEW

```
rwanda-gov-intelligence/
├── src/                          # Frontend (Next.js 15.5 + React 19)
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx           # Root layout with providers
│   │   ├── page.tsx             # Main app entry (routing logic)
│   │   ├── globals.css          # Global styles
│   │   ├── favicon.ico          # App icon
│   │   └── settings/            # Settings page
│   │       └── page.tsx         # AI usage tracking (✅ IMPLEMENTED)
│   ├── components/              # React components
│   │   ├── ai/
│   │   │   └── ai-assistant.tsx # AI chat modal (Gemini integration)
│   │   ├── auth/
│   │   │   └── login-form.tsx   # Login page with JWT
│   │   ├── dashboard/
│   │   │   ├── dashboard-layout.tsx      # Main navigation & header
│   │   │   ├── intelligence-modules.tsx  # Dashboard cards (3 modules)
│   │   │   └── global-search.tsx        # Search bar in header
│   │   ├── entrepreneur/
│   │   │   └── entrepreneur-portal.tsx  # Opportunities tab
│   │   ├── institutional/
│   │   │   └── institutional-memory.tsx # Intelligence tab content
│   │   ├── ministries/
│   │   │   └── ministries-overview.tsx  # Ministries tab
│   │   ├── projects/
│   │   │   └── projects-overview.tsx    # Projects tab
│   │   └── ui/                  # Reusable UI components (Radix)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── detail-modal.tsx
│   │       └── alert.tsx
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   └── lib/
│       ├── auth.tsx             # AuthContext & useAuth hook
│       ├── utils.ts             # Utility functions (formatCurrency, etc.)
│       └── export-utils.ts      # CSV export utilities
├── server/                      # Backend (Express.js)
│   ├── index.js                # Main server entry point
│   ├── routes/                 # API route handlers
│   │   ├── auth.js            # JWT authentication (✅ WORKING)
│   │   ├── intelligence.js    # Dashboard modules API (✅ WORKING)
│   │   ├── ai.js              # AI chat API (✅ WORKING)
│   │   ├── catalog.js         # NISR catalog API (✅ WORKING)
│   │   ├── search.js          # Search API (⚠️ MOCK DATA)
│   │   ├── projects.js        # Projects API (❌ PLACEHOLDER)
│   │   ├── ministries.js      # Ministries API (❌ PLACEHOLDER)
│   │   ├── opportunities.js   # Opportunities API (❌ PLACEHOLDER)
│   │   └── analytics.js       # Analytics API (❌ PLACEHOLDER)
│   ├── utils/
│   │   ├── nisr-loader.js     # CSV data loader (✅ WORKING)
│   │   └── catalog-loader.js  # NISR catalog loader (✅ WORKING)
│   ├── middleware/
│   │   └── security.js        # Security middleware (Helmet, etc.)
│   └── database/
│       ├── schema.sql         # PostgreSQL schema (❌ NOT CONNECTED)
│       └── connection.js      # DB connection setup (❌ NOT USED)
├── convex/                     # Convex backend (⚠️ DEFINED BUT NOT DEPLOYED)
│   ├── schema.ts              # Convex schema definition
│   ├── getDashboardModules.ts # Dashboard query (defined, not used)
│   ├── searchFederated.ts     # Federated search (defined, not used)
│   └── _generated/            # Auto-generated Convex files
├── data/
│   └── nisr-datasets/         # NISR CSV files
│       ├── poverty.csv        # Poverty data (31 rows)
│       ├── labor.csv          # Labor force data (22 rows)
│       ├── gdp.csv            # GDP data (17 rows)
│       ├── demographics.csv   # Demographics (31 rows)
│       └── nisr-catalog.csv   # Dataset catalog (72 datasets)
├── public/                     # Static assets
├── .env.local                  # Frontend environment variables
├── server/.env                 # Backend environment variables
├── package.json                # Dependencies
└── docs/                       # Documentation (THIS FILE!)
    ├── DEMO-IMPLEMENTATION-PROMPT.md  # Your implementation guide
    ├── CODEBASE-ARCHITECTURE.md       # This file
    └── product-brief.md               # Product vision
```

---

## 🎯 CRITICAL FILES TO UNDERSTAND

### 1. Frontend Entry Point: `src/app/page.tsx`
**What it does:** Main application routing logic

```typescript
// Key responsibilities:
- Checks user authentication (useAuth hook)
- Shows LoginForm if not authenticated
- Renders DashboardLayout with role-based views
- Maps roles to available views (MINISTER vs ENTREPRENEUR)
- Handles view switching via URL params (?view=intelligence)
- Renders AIAssistant modal
```

**Available views:**
- `intelligence` → InstitutionalMemory component
- `opportunities` → EntrepreneurPortal component
- `projects` → ProjectsOverview component
- `ministries` → MinistriesOverview component
- **Settings page** → Accessible at `/settings` (no navigation link in header yet)

**Role-based access:**
- ENTREPRENEUR/INVESTOR: Only see `intelligence` + `opportunities`
- All others: See all 4 tabs

### 2. Navigation & Layout: `src/components/dashboard/dashboard-layout.tsx`
**What it does:** Main app shell (header, nav, AI button)

```typescript
// Structure:
<header>
  - Logo & title
  - GlobalSearch component
  - Notification bell
  - User menu with logout
  - Navigation tabs (Intelligence, Opportunities, Projects, Ministries)
</header>
<main>{children}</main>
<button onClick={onToggleAssistant}>AI Assistant</button>
```

**Navigation tabs:**
- Dynamically filtered by user role
- Active tab highlighted with blue background
- Click handler calls `onViewChange(tabId)`

### 3. Dashboard Cards: `src/components/dashboard/intelligence-modules.tsx`
**What it does:** 3 main intelligence cards on dashboard

**Module types:**
1. **Resource Allocation** - Budget stats with NISR poverty data
2. **Opportunity Radar** - Investment opportunities with NISR GDP data
3. **Performance Monitor** - Project risks with NISR labor data

**Data flow:**
```typescript
// Tries Convex first (won't work if not deployed)
const convexModules = useQuery(api.getDashboardModules.getDashboardModules, {})

// Falls back to demo data if Convex unavailable
if (!convexModules || convexModules.length === 0) {
  setModules(DEMO_MODULES)
}
```

**Quick Actions section:**
- 4 export buttons with 5 second simulated processing (`toast.loading` → `toast.success`)
- Each export writes a rich CSV dataset (budget allocation ledger, ministry KPI dossier, project delivery dashboard, combined snapshot)
- Buttons include descriptive helper text so presenters can narrate what each report contains
- "Generate Insights" now seeds an intelligence chat conversation and deep-links to the tab for storytelling continuity
- Uses `exportToCSV()` from `lib/export-utils`
- Buttons include descriptive helper text so presenters can narrate what each report contains

**Recent Activity section:**
- Initializes with an expanded curated set of mock events (budget, risk, delivery, investment, alerts, briefings) and rotates one into view every 30 seconds
- Filter chips (All, Budget, Risk, Delivery, Investment, Alert, Briefings) refine the feed without reloading
- "View all updates" opens a modal with the full activity backlog for storytelling
- Designed for demo mode (no backend); data lives in `DEMO_ACTIVITIES`

**Analytics sub-section (Charts):**
- Renders four Recharts visuals (budget execution line, funding share donut, project status bar, opportunity pipeline area)
- Charts live-update every 45 seconds with subtle variance to mimic streaming analytics
- All charts are mock-driven and responsive

### 4. AI Chat: `src/components/ai/ai-assistant.tsx`
**What it does:** Chat modal with scripted demo intelligence responses (offline)

**Flow:**
```typescript
1. User types message
2. Adds to local messages state
3. Simulates a 0.9s AI generation delay
4. Returns a canned but context-rich response with mock provenance
5. Displays with chat bubbles
```

**Features:**
- Auto-scroll to bottom on new messages
- Loading spinner while AI “thinks”
- Suggestion list seeded locally when chat opens
- Clear conversation button
- No network calls; everything runs in-browser for reliability during demos

### 5. Settings Page: `src/app/settings/page.tsx` (✅ IMPLEMENTED)
**What it does:** User settings with AI usage tracking (Requirement #4)

**Features:**
- **Two tabs:**
  1. General - Placeholder for future settings
  2. AI Usage - Fully implemented token tracking

**AI Usage Tracking:**
```typescript
// Tracked metrics (localStorage-based):
- Total input tokens
- Total output tokens
- Total tokens combined
- Request count
- Daily breakdown (last 14 days)
- Timestamps for each day's usage

// Storage:
localStorage.setItem('ai-usage', JSON.stringify(usageSnapshot))

// Clear usage data button included
```

**Display:**
- 4 stat cards: Requests, Input tokens, Output tokens, Total tokens
- Last 14 days list with daily breakdowns
- Day format: "in / out tokens, requests"
- Clear usage data button (red text)

**Navigation:**
- Uses DashboardLayout wrapper
- Accessible via `/settings` URL
- No navigation link in header yet (needs to be added)
- Includes AI Assistant button

**Authentication:**
- Protected route (requires login)
- Shows login form if not authenticated
- Loading state with spinner

### 6. Authentication: `src/lib/auth.tsx`
**What it does:** Lightweight demo AuthContext (no backend)

```typescript
// Context provides:
- user: { id, email, name, role, ministry, permissions }
- isLoading: boolean
- login(email, password)
- logout()
- hasPermission()

// Storage:
- Saves selected demo user to localStorage under `demo-user`
- Restores user on page load for persistent sessions
```

**Login flow:**
```typescript
1. User submits credentials
2. Matches against in-memory demo users (`minister@gov.rw`, `ps@gov.rw`) with password `password123`
3. Adds a small delay for realism
4. Persists user to localStorage and resolves login promise
5. Dashboard renders immediately (no token handling)
```

### 7. Institutional Memory: `src/components/institutional/institutional-memory.tsx`
**What it does:** Tab content for the Intelligence module, housing the AI chat workspace and policy cards.

**Institutional Memory layout:**
- AI intelligence chat workspace renders at the top of the view, with policy tabs (Decisions, Patterns, Analytics) positioned beneath for faster storytelling hand-offs
- Policy cards retain export/share/Apply Lessons workflows (localStorage + navigation)

**Role-based access:**
- ENTREPRENEUR/INVESTOR: Only see `intelligence` + `opportunities`
- All others: See all 4 tabs

### 8. Opportunities Tab (`src/components/entrepreneur/entrepreneur-portal.tsx`):
**What it does:** Advanced investment opportunities management with filters, watchlist, and express interest functionality.

**Features:**
- Advanced filters modal with sector/location/risk multi-selects, investment sliders, and ROI thresholds (persisted via localStorage & URL params)
- Watchlist toggle with localStorage persistence, plus optional watchlist-only view
- Express Interest modal captures investor details with simulated submission delay + localStorage logging
- Analyze action hands context to the Intelligence workspace; prospectus download generates mock brief

**Role-based access:**
- ENTREPRENEUR/INVESTOR: Only see `intelligence` + `opportunities`
- All others: See all 4 tabs

### 9. Projects Tab (`src/components/projects/projects-overview.tsx`):
**What it does:** Strategic project portfolio management with advanced filtering, planning, and AI-powered analysis.

**Features:**
- **Advanced Filters Modal:** Interactive chip-based selectors for status (PLANNING/ACTIVE/DELAYED/COMPLETED), risk levels (LOW/MEDIUM/HIGH/CRITICAL), ministries, and progress range sliders (0-100%). All filters persist to localStorage and sync with URL parameters for shareable views.
- **Focus Watchlist:** Star/unstar projects to build a personalized watchlist. Toggle button switches between "all projects" and "watchlist-only" views, with state persisted to localStorage.
- **Implementation Plan Modal:** For each project, view or generate a structured delivery plan including:
  - Executive summary with risk context and beneficiary reach
  - Next milestones (3-5 key deliverables)
  - Support needed (cabinet facilitation, taskforce deployment, etc.)
  - Immediate next steps (war-room scheduling, analytics deployment)
  - Plan history: Recent plan records are cached and accessible for quick review
  - Refresh functionality: Re-generate plans with latest project data (1.2s simulated delay)
  - Export to text brief: Download plan as formatted .txt file
- **Analyze with AI:** Table rows and detail modals include "Analyze" buttons that seed the Intelligence workspace with contextual project insights (budget utilization, risk profile, beneficiary impact), allowing seamless handoff to AI assistant
- **Contextual Metrics:** Top-level KPI cards (Active Budget, Delivery Progress, Projects At Risk, Beneficiaries Reached) automatically scope to filtered/watchlist view, showing "X of Y projects in view" when filters are active
- **Export Capabilities:**
  - Export all projects to CSV from Portfolio Tracker card
  - Export individual project briefs (with or without implementation plan) from detail modal
- **URL Parameter Sync:** Filter state, watchlist toggle, and open plan modals sync to URL for bookmarkable/shareable views

**Data Structure:**
- Mock data includes 5 diverse projects (Rural Electrification, Digital ID, Healthcare, Smart Irrigation, STEM Centers)
- Each project tracks: budget, spent, status, risk level, beneficiaries, location, milestone progress, timeline
- Projects are filterable, sortable, and watchlistable with instant client-side updates

**localStorage Keys:**
- `projects:filters` - Persisted filter selections
- `projects:watchlist` - Array of watched project IDs
- `projects:plans` - Recently generated implementation plans (up to 8 cached)

---

## 🔌 BACKEND API REFERENCE

### Base URL: `http://localhost:3001`

### Authentication Endpoints (✅ WORKING)

#### POST `/api/auth/login`
```json
Request:
{
  "email": "minister@gov.rw",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "1",
    "email": "minister@gov.rw",
    "name": "Hon. Minister of ICT",
    "role": "MINISTER",
    "ministry": "ICT",
    "permissions": ["READ", "UPDATE"]
  }
}
```

**Test users:**
1. `minister@gov.rw` / `password123` (MINISTER role)
2. `ps@gov.rw` / `password123` (PERMANENT_SECRETARY role)

#### GET `/api/auth/profile`
Requires: `Authorization: Bearer <token>` header
Returns current user data

#### POST `/api/auth/refresh`
Requires: Valid token
Returns new token (8-hour expiration)

### Dashboard Endpoints (✅ WORKING)

#### GET `/api/intelligence/modules`
Requires: Auth token

```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "resource-allocation-1",
      "type": "resource-allocation",
      "title": "Resource Allocation Intelligence",
      "priority": "HIGH",
      "lastUpdated": "2025-01-10T12:00:00Z",
      "data": {
        "totalBudget": 5000000000,
        "available": 1200000000,
        "spent": 3800000000,
        "efficiency": 87.5,
        "nisrData": {
          "povertyRate": 38.2,
          "source": "EICV5",
          "year": 2024
        }
      }
    }
    // ... 2 more modules
  ],
  "dataSource": "NISR" // or "MOCK"
}
```

**NISR data integration:**
- If CSV files exist in `data/nisr-datasets/`, uses real data
- Otherwise falls back to mock data
- Check `dataSource` field to know which is being used

### AI Chat Endpoints (✅ WORKING, BUT NOT USED BY FRONTEND)

#### POST `/api/ai/chat`
Requires: Auth token

```json
Request:
{
  "message": "What is the poverty rate?",
  "conversationHistory": []  // Optional array of previous messages
}

Response:
{
  "success": true,
  "data": {
    "id": "msg-1234567890",
    "role": "ASSISTANT",
    "content": "According to NISR EICV5 (2024), national poverty rate is 38.2%...",
    "timestamp": "2025-01-10T12:00:00Z",
    "sources": [
      {
        "id": "nisr-1",
        "name": "EICV5 (2024)",
        "type": "STATISTICS",
        "url": "https://www.statistics.gov.rw/",
        "reliability": 95
      }
    ],
    "dataSource": "NISR",
    "usage": {
      "inputTokens": 150,
      "outputTokens": 200,
      "totalTokens": 350
    }
  }
}
```

**How it works:**
1. Uses Google Gemini API (`@google/genai` SDK)
2. Model: `gemini-2.5-flash` (configurable via `GEMINI_MODEL` env var)
3. Injects NISR context from loaded CSV data
4. System instruction defines role and constraints
5. Returns AI response with NISR sources (when relevant)
6. Returns token usage metrics for tracking

**NISR Data Integration:**
- Automatically injects NISR stats when relevant keywords detected
- Keywords: poverty, gdp, growth, unemployment, labor, rlfs, eicv, nisr
- Attaches source citations with reliability scores
- Falls back gracefully if no NISR data available

**⚠️ IMPORTANT:** The frontend AI assistant (`src/components/ai/ai-assistant.tsx`) currently calls an external RAG API at `http://192.168.56.1:5000/api/query` instead of this Express endpoint. This Express endpoint is fully functional but unused.

#### GET `/api/ai/suggestions`
Returns array of suggested questions based on available data

**Response:**
```json
{
  "success": true,
  "data": [
    "What's the current poverty rate in Rwanda?",
    "How is youth unemployment trending?",
    "Show me GDP growth by sector",
    "Which provinces have the highest poverty rates?",
    "What are the top investment opportunities?"
  ]
}
```

**Dynamic suggestions:**
- If NISR data loaded: Returns NISR-focused questions
- If no NISR data: Returns general project/budget questions

### Search Endpoints (⚠️ MOCK DATA)

#### GET `/api/search?q=infrastructure&limit=10`
Returns 10 hardcoded search results (projects, opportunities, insights, policies)

**Mock results include:**
- 3 projects (Infrastructure Upgrade, ICT Transformation, Healthcare Modernization)
- 3 opportunities (Solar Parks, Agricultural Processing, Tourism Infrastructure)
- 2 insights (Budget Efficiency Analysis, Project Risk Assessment)
- 2 policies (Digital Economy Framework, Green Growth Strategy)

### NISR Catalog Endpoints (✅ WORKING)

#### GET `/api/catalog`
Returns list of 72 NISR datasets from `nisr-catalog.csv`

#### GET `/api/catalog/:id`
Returns single dataset by ID

### Placeholder Endpoints (❌ NOT IMPLEMENTED)

These return empty arrays or placeholder messages:
- `/api/projects` - Projects management
- `/api/ministries` - Ministry data
- `/api/opportunities` - Investment opportunities
- `/api/analytics` - Analytics data

---

## 📊 DATA LAYER

### NISR Data Loading (`server/utils/nisr-loader.js`)

**CSV Files Expected:**
Located in `data/nisr-datasets/`

1. **poverty.csv** (31 rows currently)
```csv
Province,District,PovertyRate,ExtremePovertyRate,Year,Source
Kigali,Gasabo,12.5,3.2,2024,EICV5
Eastern,Bugesera,45.3,18.7,2024,EICV5
...
```

2. **labor.csv** (22 rows currently)
```csv
Province,EmploymentRate,UnemploymentRate,YouthUnemployment,Sector,Year,Source
Kigali,78.3,16.7,23.4,Urban,2024,LFS Q2 2024
...
```

3. **gdp.csv** (17 rows currently)
```csv
Sector,GDPContribution,GrowthRate,Year,Quarter,Source
Agriculture,24.5,5.2,2024,Q2,National Accounts
Services,52.1,9.8,2024,Q2,National Accounts
...
```

4. **demographics.csv** (31 rows currently)
```csv
Province,District,Population,Year,Source
Kigali,Gasabo,530000,2024,Population Projections
...
```

**Loading process:**
1. Server starts → Calls `loadAllNISRData()`
2. Reads all 4 CSV files from `data/nisr-datasets/`
3. Parses with `csv-parser`
4. Caches in memory (`dataCache` object)
5. Calculates dashboard stats (averages, sums, groupings)
6. Makes available to API endpoints

**Dashboard stats calculation:**
```javascript
getDashboardStats() {
  return {
    poverty: {
      nationalRate: 38.2,  // Average of all districts
      byProvince: { Kigali: 16.3, Eastern: 42.1, ... },
      source: 'NISR EICV5',
      year: 2024
    },
    labor: { ... },
    gdp: { ... },
    demographics: { ... }
  }
}
```

**Check if data loaded:**
```javascript
hasNISRData() // Returns true if any CSV files loaded
```

### Database Schemas (❌ NOT CONNECTED)

**PostgreSQL Schema** (`server/database/schema.sql`):
- 20+ tables defined (users, ministries, projects, opportunities, etc.)
- Complete with indexes, views, sample data
- **Not connected to application**
- Schema is ready to use when needed

**Convex Schema** (`convex/schema.ts`):
- 9 collections defined (users, ministries, projects, opportunities, etc.)
- Proper indexes configured
- **Status: DEFINED BUT NOT DEPLOYED**

**Convex Queries** (`convex/*.ts`):
- `getDashboardModules.ts` - Aggregates dashboard data from Convex tables (defined, not deployed)
- `searchFederated.ts` - Searches across projects, opportunities, insights (defined, not deployed)
- Frontend tries to use these with `useQuery(api.getDashboardModules...)` but falls back to Express API gracefully

**Current state:** Application runs without any database. All data is in-memory or hardcoded. Convex files exist and are referenced by frontend but not deployed/active.

---

## 🔐 AUTHENTICATION FLOW

### Current Implementation (JWT)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User enters credentials in LoginForm                     │
│    (minister@gov.rw / password123)                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. POST /api/auth/login                                      │
│    - Server checks mock users array                          │
│    - bcrypt.compare(password, user.password_hash)            │
│    - Generates JWT token (8-hour expiration)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Frontend receives token + user data                       │
│    - Saves token to localStorage                             │
│    - Sets user in AuthContext                                │
│    - Redirects to dashboard                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. All API requests include token                            │
│    Authorization: Bearer <token>                             │
│    - authenticateToken middleware validates                  │
│    - Decodes user info from token                            │
│    - Attaches to req.user                                    │
└─────────────────────────────────────────────────────────────┘
```

**Security notes:**
- Passwords: bcrypt hashed in mock users
- JWT Secret: `process.env.JWT_SECRET` (fallback to hardcoded)
- Token expiration: 8 hours
- No refresh token rotation (demo only)
- No password reset (demo only)

---

## 🧩 COMPONENT ARCHITECTURE

### Component Hierarchy

```
App (page.tsx)
├── LoginForm (if !user)
└── DashboardLayout (if user)
    ├── Header
    │   ├── Logo
    │   ├── GlobalSearch
    │   ├── Notifications
    │   ├── UserMenu
    │   └── NavigationTabs
    │       ├── Intelligence
    │       ├── Opportunities
    │       ├── Projects
    │       └── Ministries
    │       └── (Settings - not in nav yet, accessible via /settings)
    ├── Main Content (activeView)
    │   ├── IntelligenceModules (if activeView === 'intelligence')
    │   │   ├── ResourceAllocationCard
    │   │   ├── OpportunityRadarCard
    │   │   ├── PerformanceMonitorCard
    │   │   ├── QuickActionsCard
    │   │   │   ├── Generate Budget Report (CSV export)
    │   │   │   ├── Ministry Performance Review (CSV export)
    │   │   │   ├── Project Status Update (CSV export)
    │   │   │   └── Export Dashboard Snapshot (CSV export)
    │   │   └── RecentActivityCard
    │   ├── InstitutionalMemory (if activeView === 'intelligence')
    │   ├── EntrepreneurPortal (if activeView === 'opportunities') — PHASE 3 COMPLETE ✅
    │   │   ├── Advanced filter modal (sectors, locations, risk, investment/ROI ranges) with active count badge
    │   │   ├── My Watchlist toggle with localStorage persistence and filtered view
    │   │   ├── Export Pipeline (CSV export of filtered opportunities)
    │   │   ├── Opportunity cards with watchlist badges and "Analyze with AI" integration
    │   │   ├── Express Interest form modal with validation and localStorage storage
    │   │   ├── Download Prospectus functionality for each opportunity
    │   │   ├── Clickable filter chips with hover-to-remove UI and "Clear all" button
    │   │   └── URL parameter sync for all filters (shareable filtered views)
    │   ├── ProjectsOverview (if activeView === 'projects') — PHASE 2 COMPLETE ✅
    │   │   ├── Portfolio summary metrics (budget, delivery, risk, beneficiaries)
    │   │   ├── Advanced filter modal (status, risk, ministry, progress range) with URL/localStorage sync
    │   │   ├── Watchlist toggle + toast feedback
    │   │   ├── Portfolio table with AI hand-off and CSV export
    │   │   └── Implementation plan modal (structured milestones/support/next steps, exportable)
    │   ├── MinistriesOverview (if activeView === 'ministries') — ALL FEATURES COMPLETE ✅
    │   │   ├── Ministry performance leaderboard with utilisation/efficiency metrics
    │   │   ├── Generate Cabinet Briefing with progressive loading (5 steps, ~4.5s)
    │   │   ├── Briefing preview modal with executive summary and recommendations
    │   │   ├── Download full cabinet briefing (comprehensive text document)
    │   │   ├── Ministry detail modal with performance overview
    │   │   ├── Open Ministry Brief button → detailed briefing modal with downloadable brief
    │   │   ├── Export KPI Snapshot → ministry-specific CSV with all metrics
    │   │   └── Export all ministry metrics to CSV
    │   └── AIAssistant (modal, toggleable)
        ├── MessageList
        ├── InputArea
        └── Suggestions (when empty)

**Settings Page** (`/settings`) — AI USAGE TRACKING COMPLETE ✅
    ├── General tab (placeholder for future preferences)
    └── AI Usage tab
        ├── Summary cards (Total Requests, Input Tokens, Output Tokens, Total Tokens)
        ├── Recharts Area Chart (14-day token usage trend with input/output visualization)
        ├── Daily breakdown table (scrollable, last 14 days)
        └── Clear usage data functionality

Settings Page (settings/page.tsx) - Separate route
├── DashboardLayout wrapper
├── Tab Navigation (General | AI Usage)
├── General Tab (placeholder)
└── AI Usage Tab (✅ IMPLEMENTED)
    ├── Stats Grid (4 cards)
    │   ├── Requests count
    │   ├── Input tokens
    │   ├── Output tokens
    │   └── Total tokens
    ├── Last 14 Days Breakdown
    │   └── Daily usage list
    └── Clear Usage Data Button
```

### Key Component Props

**DashboardLayout:**
```typescript
{
  children: React.ReactNode,
  activeView: string,                    // Current tab
  onViewChange: (view: string) => void,  // Tab switch handler
  onToggleAssistant: () => void          // Open AI modal
}
```

**AIAssistant:**
```typescript
{
  isOpen: boolean,
  onClose: () => void
}
```

**IntelligenceModules:**
```typescript
{
  className?: string  // Optional styling
}
```

### Type Definitions (`src/types/index.ts`)

**Core types defined:**
- `User`, `UserRole`, `Permission` - Authentication types
- `IntelligenceModule`, `Insight` - Dashboard intelligence types
- `Ministry`, `Project`, `ProjectOutcome`, `PerformanceMetric` - Government data types
- `EconomicIndicator`, `InvestmentOpportunity`, `RiskAssessment` - Economic intelligence types
- `AIConversation`, `AIMessage`, `ConversationContext`, `DataSource` - AI assistant types
- `SearchResult`, `SearchQuery` - Search functionality types
- `AnalyticsData`, `Report` - Analytics and reporting types

**Usage:** Import types throughout the application for type safety
```typescript
import { User, AIMessage, IntelligenceModule } from '@/types'
```

### Reusable UI Components (`src/components/ui/`)

**Button** - Radix-based button with variants:
- `default` (blue)
- `outline` (white with border)
- `ghost` (transparent)
- `government` (Rwanda theme)

**Card** - Container with header/content:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

**DetailModal** - Modal for detailed views:
```tsx
<DetailModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
>
  {/* Modal content */}
</DetailModal>
```

---

## 🎨 STYLING SYSTEM

### Tailwind Configuration

**Colors:**
```javascript
// tailwind.config.js
colors: {
  primary: '#1e3a8a',      // Rwanda blue
  secondary: '#059669',     // Green
  warning: '#f59e0b',       // Yellow
  danger: '#dc2626',        // Red
}
```

**Typography:**
- Font: System fonts stack
- Sizes: Tailwind defaults (text-sm, text-base, text-lg, etc.)
- Weights: font-normal, font-medium, font-bold

**Spacing:**
- Standard Tailwind spacing (p-4, m-6, space-x-2, etc.)
- Grid layouts: `grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6`

**Responsive breakpoints:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Common Patterns

**Loading skeleton:**
```tsx
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>
```

**Card with colored border:**
```tsx
<Card className="border-l-4 border-l-green-500">
```

**Progress bar:**
```tsx
<div className="flex-1 bg-gray-200 rounded-full h-2">
  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
</div>
```

---

## 🚀 RUNNING THE APPLICATION

### Prerequisites
- Node.js 20+
- npm or yarn

### Environment Variables

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CONVEX_URL=https://your-convex-url  # Optional, not used if not deployed
```

**Backend** (`server/.env`):
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=rwanda-gov-intelligence-secret-key
GOOGLE_AI_API_KEY=your_gemini_api_key  # For AI chat
DB_HOST=localhost                       # Not used yet
DB_PORT=5432                           # Not used yet
DB_NAME=rwanda_gov_intelligence        # Not used yet
DB_USER=postgres                       # Not used yet
DB_PASSWORD=your_password              # Not used yet
```

### Start Development

**Terminal 1 - Backend:**
```bash
cd server
npm install
node index.js
# OR
npm run server:dev
```

Expected output:
```
🚀 Rwanda Government Intelligence API server running on port 3001
📊 Health check: http://localhost:3001/health
🌍 Environment: development
✅ Loaded 101 total rows from NISR datasets
   - Poverty: 31 rows
   - Labor: 22 rows
   - GDP: 17 rows
   - Demographics: 31 rows
```

**Terminal 2 - Frontend:**
```bash
npm install
npm run dev
```

Expected output:
```
▲ Next.js 15.5.4
- Local:        http://localhost:3000
```

### Test Login
1. Navigate to http://localhost:3000
2. Login with:
   - Email: `minister@gov.rw`
   - Password: `password123`
3. Should redirect to dashboard with 3 intelligence cards

### Test API Endpoints
```bash
# Health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"minister@gov.rw","password":"password123"}'

# Get dashboard modules (requires token)
curl http://localhost:3001/api/intelligence/modules \
  -H "Authorization: Bearer <your-token>"

# AI chat (requires token)
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{"message":"What is the poverty rate?"}'
```

---

## 🔍 DEBUGGING TIPS

### Check What's Running
```bash
# Check if backend is running
curl http://localhost:3001/health

# Check if frontend is running
curl http://localhost:3000

# Check processes
netstat -ano | findstr :3000
netstat -ano | findstr :3001
```

### Common Issues

**1. Port already in use**
```bash
# Kill process on port 3000 or 3001
npx kill-port 3000
npx kill-port 3001
```

**2. NISR data not loading**
- Check if CSV files exist in `data/nisr-datasets/`
- Verify CSV format matches expected columns
- Check server console for loading errors
- Dashboard will show "Demo data mode active" banner if no data

**3. Convex errors in console**
- Convex is not deployed/used, ignore these errors
- Frontend tries to connect but falls back gracefully
- Comment out Convex imports if annoying

**4. AI chat not working**
- Frontend AI assistant calls external RAG API at `http://192.168.56.1:5000/api/query`
- Check if that external service is running and accessible
- Express server has `/api/ai/chat` endpoint with Gemini integration (unused)
- To use Express endpoint instead: Update `src/components/ai/ai-assistant.tsx` sendMessage function
- Check server console for API connection errors

**5. Login not working**
- Check if backend is running on port 3001
- Verify credentials: `minister@gov.rw` / `password123`
- Check browser console for API errors
- Check Network tab for 401/500 errors

### Browser Console Checks

**Expected console output (working):**
```
AuthContext initialized
User logged in: Hon. Minister of ICT
Dashboard modules loaded: 3
NISR data source: NISR
```

**Problem indicators:**
```
Failed to fetch /api/intelligence/modules  → Backend not running
401 Unauthorized                           → Token invalid/expired
Module data is empty                       → NISR data not loaded
ConvexProvider error                       → Convex not set up (ignore)
```

---

## 📦 DEPENDENCIES REFERENCE

### Frontend Dependencies

**Core:**
- `next@15.5.4` - React framework
- `react@19.1.0` - UI library
- `typescript@5` - Type safety

**UI Components:**
- `@radix-ui/*` - Unstyled accessible components
- `lucide-react` - Icons
- `tailwindcss@4` - Styling

**State & Data:**
- `convex` - Backend SDK (not actively used)

**Utilities:**
- `sonner` - Toast notifications
- `csv-parser` - CSV file parsing

### Backend Dependencies

**Core:**
- `express@5.1.0` - Web server
- `cors` - Cross-origin requests
- `dotenv` - Environment variables

**Security:**
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT tokens

**Data:**
- `csv-parser` - Parse CSV files
- `pg` - PostgreSQL client (not connected)

**AI:**
- `@google/generative-ai` - Gemini API
- Alternative: `openai` (not installed)

---

## 🎯 WHAT TO BUILD NEXT

Based on DEMO-IMPLEMENTATION-PROMPT.md, focus on:

### High Priority (Real Implementation)
1. ✅ Intelligence tab chat with conversations sidebar
2. ✅ Global search with real results navigation
3. ✅ Dashboard charts (4 types: line, donut, bar, area)
4. ✅ Settings page with AI usage tracking (localStorage-based)
5. ✅ Opportunities filters (client-side)
6. ✅ Express Interest form with localStorage
7. ✅ Context-aware chat for each tab

### Medium Priority (Smart Mocks)
8. 🎭 Generate Briefing with progressive loading
9. 🎭 Recent Activity with dynamic updates
10. 🎭 Ministry action buttons (brief, KPI export)
11. ⚠️ Add Settings link to header navigation
12. ⚠️ Connect frontend AI assistant to Express /api/ai/chat (currently uses external RAG API)

### Quick Wins (UI Polish)
13. ✅ Loading states everywhere (500ms-2s)
14. ✅ Empty states with helpful messages
15. ✅ Success/error toasts on all actions
16. ✅ Smooth transitions and animations
17. ✅ Consistent styling across all tabs

---

## 🚨 CRITICAL RULES

### DO:
✅ Check this document before building anything
✅ Reuse existing components (`Button`, `Card`, `Modal`)
✅ Follow existing patterns (see code examples above)
✅ Add loading states to everything
✅ Use TypeScript types properly
✅ Test in browser after each change
✅ Keep mock data realistic and varied
✅ Add toasts for user feedback
✅ Style consistently with Tailwind

### DON'T:
❌ Rebuild components that already work
❌ Change working API endpoints
❌ Remove NISR data integration
❌ Break authentication flow
❌ Connect to database (use mocks)
❌ Deploy Convex (not needed for demo)
❌ Change core routing logic
❌ Modify `server/index.js` unless necessary

---

## 📚 CODE EXAMPLES TO COPY

### Loading State Pattern
```tsx
const [isLoading, setIsLoading] = useState(false)

async function handleAction() {
  setIsLoading(true)
  await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate delay
  // Do work
  setIsLoading(false)
  toast.success('Action completed!')
}

return (
  <Button onClick={handleAction} disabled={isLoading}>
    {isLoading ? <Loader2 className="animate-spin" /> : 'Click Me'}
  </Button>
)
```

### Modal Pattern
```tsx
const [isOpen, setIsOpen] = useState(false)

return (
  <>
    <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

    <DetailModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Title">
      <div className="space-y-4">
        {/* Modal content */}
      </div>
    </DetailModal>
  </>
)
```

### API Call Pattern
```tsx
async function fetchData() {
  try {
    const response = await fetch('/api/endpoint', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) throw new Error('API error')

    const data = await response.json()
    setData(data)
  } catch (error) {
    console.error('Failed to fetch:', error)
    toast.error('Failed to load data')
  }
}
```

### CSV Export Pattern
```tsx
import { exportToCSV } from '@/lib/export-utils'

const data = [
  { Name: 'Project 1', Status: 'Active', Budget: '1M RWF' },
  { Name: 'Project 2', Status: 'Completed', Budget: '500K RWF' }
]

exportToCSV(data, 'projects-export')
toast.success('Export successful!')
```

---

## 🎉 YOU'RE READY TO BUILD!

This document gives you everything you need to:
1. ✅ Understand the current codebase
2. ✅ Know what works and what doesn't
3. ✅ Find any file or component quickly
4. ✅ Follow existing patterns
5. ✅ Avoid breaking what works
6. ✅ Build demo-ready features fast

**Next steps:**
1. Read `DEMO-IMPLEMENTATION-PROMPT.md`
2. Start with requirement #3 (biggest feature)
3. Test frequently in browser
4. Refer back to this doc when confused
5. Ship something amazing! 🚀🇷🇼

---

**Questions? Confused? Stuck?**
Search this document (Ctrl+F) - all answers are here!

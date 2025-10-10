# 🚀 START HERE - First Prompt for AI Agent

**Copy and paste this entire prompt to your AI coding assistant (Cursor, Claude, etc.)**

---

## 📋 YOUR MISSION

You are going to implement all 22 requirements for the Rwanda Government Intelligence Platform in **demo-ready** style. You have **1 day** to complete this.

---

## 📖 STEP 1: READ THESE DOCUMENTS IN ORDER

**CRITICAL:** Read these 3 documents IN THIS EXACT ORDER before writing any code:

### 1️⃣ First: `docs/CODEBASE-ARCHITECTURE.md`
**Purpose:** Learn the current codebase structure
**What to look for:**
- Where every file lives
- What's already implemented (✅) vs placeholder (❌)
- How authentication works
- How API endpoints are structured
- What components already exist
- Database status (PostgreSQL schema defined but NOT connected)
- Convex status (defined but NOT deployed/used)

**Key Sections to Focus On:**
- 🗺️ PROJECT STRUCTURE OVERVIEW
- 🎯 CRITICAL FILES TO UNDERSTAND
- 🔌 BACKEND API REFERENCE
- 🧩 COMPONENT ARCHITECTURE
- 🚨 CRITICAL RULES (DO/DON'T)

### 2️⃣ Second: `docs/product-brief.md`
**Purpose:** Understand the product vision
**What to look for:**
- Target users (Ministers, Policy Directors, Entrepreneurs)
- Core features for each tab
- Product vision (Palantir × Bloomberg for Rwanda)
- Data strategy (NISR integration)

### 3️⃣ Third: `docs/DEMO-IMPLEMENTATION-PROMPT.md`
**Purpose:** Get implementation instructions
**What to look for:**
- All 22 requirements with detailed specs
- Mock vs Real implementation strategy
- Loading state patterns
- Demo flow optimization
- Time allocation (1-day plan)

---

## ✅ STEP 2: CONFIRM YOU UNDERSTAND

After reading all 3 documents, respond with:

```
✅ I have read all 3 documents and understand:

1. Current State:
   - What's working: [list 5-7 working features]
   - What's not working: [list 3-5 broken/placeholder features]
   - Database status: [PostgreSQL/Convex status]

2. Tech Stack:
   - Frontend: [Next.js version, React version, styling]
   - Backend: [Express vs Convex, which is being used]
   - AI Integration: [What's currently working]
   - Authentication: [How it works, test credentials]

3. Implementation Plan:
   - I will build [X] requirements using real implementation
   - I will build [Y] requirements using smart mocks
   - I will start with requirement #[number] because [reason]

4. Critical Rules I Will Follow:
   - ✅ Check CODEBASE-ARCHITECTURE.md before building anything
   - ✅ Don't rebuild what already works
   - ✅ Add loading states everywhere (500ms-2s)
   - ✅ Use believable mock data
   - ✅ Test in browser frequently

Ready to proceed: YES/NO
```

**DO NOT START CODING YET.** Wait for me to confirm your understanding is correct.

---

## 🎯 STEP 3: IMPLEMENTATION APPROACH

Once I confirm your understanding, you will:

### Phase 1: Quick Wins (2 hours)
Start with these because they're mostly UI work:
- [x] Requirement #10: Move Intelligence content to Institutional Memory tab (dashboard now hosts intelligence cards only)
- [x] Requirement #11: Fix "View Details" button (rich modal with export/share actions)
- [x] Requirement #9: Add charts to Dashboard (Recharts analytics suite with live mock data)
- [x] Requirement #13, #18, #20: Remove Institutional Memory from tabs (routing cleaned up)

### Phase 2: Core Features (4 hours)
Build the most important functionality:
- [ ] Requirement #3: Intelligence tab chat app with conversations
- [ ] Requirement #2: Functional global search
- [ ] Requirement #5: Dashboard data from database (enhance NISR)
- [ ] Requirement #7: Functional recent activity
- [ ] Requirement #6: Quick Actions buttons

### Phase 3: Opportunities Tab (2 hours)
Complete all opportunities features:
- [ ] Requirement #14: Advanced Filters, Watchlist, Export
- [ ] Requirement #15: Search with Intelligence integration
- [ ] Requirement #16: Express Interest & Download Prospectus
- [ ] Requirement #17: Functional filters

### Phase 4: Smart Mocks (2 hours)
Use believable fake data for complex features:
- [ ] Requirement #4: AI Usage Tracking (enhance existing Settings page)
- [ ] Requirement #12: Apply Lessons button
- [ ] Requirement #19: Strategic Recommendations
- [ ] Requirement #21: Ministry action buttons
- [ ] Requirement #22: Generate Briefing (SHOWPIECE FEATURE)

### Phase 5: Polish (1 hour)
Final touches:
- [ ] Requirement #8: Navigation from Generate Insights
- [ ] Add loading states everywhere
- [ ] Test complete demo flow
- [ ] Fix any broken interactions

---

## 🚨 CRITICAL RULES - READ CAREFULLY

### ✅ DO:
1. **Check before building:** Always search codebase first
   ```bash
   # Before building a component:
   grep -r "component-name" src/

   # Before building an API endpoint:
   grep -r "endpoint-name" server/
   ```

2. **Follow existing patterns:** Copy working code
   - Login form pattern → Use for other forms
   - Intelligence modules → Use for other dashboard cards
   - AI assistant → Use for tab chat apps

3. **Add loading states everywhere:**
   ```typescript
   const [isLoading, setIsLoading] = useState(false)

   async function handleAction() {
     setIsLoading(true)
     await new Promise(r => setTimeout(r, 1000)) // Simulate delay
     // Do work
     setIsLoading(false)
     toast.success('Done!')
   }
   ```

4. **Use realistic mock data:**
   ```typescript
   // ✅ GOOD
   const mockProjects = [
     { name: 'Rural Electrification Phase 3', ministry: 'Infrastructure', budget: 2100000000 },
     { name: 'ICT Digital Transformation', ministry: 'ICT', budget: 800000000 },
     // ... 8 more varied examples
   ]

   // ❌ BAD
   const mockProjects = [
     { name: 'Project 1', budget: 100 },
     { name: 'Project 2', budget: 200 }
   ]
   ```

5. **Test frequently:** Open browser after each feature
   ```bash
   # Terminal 1: Backend
   cd server && node index.js

   # Terminal 2: Frontend
   npm run dev

   # Browser: http://localhost:3000
   # Login: minister@gov.rw / password123
   ```

### ❌ DON'T:
1. **Don't rebuild working features**
   - Check CODEBASE-ARCHITECTURE.md first
   - Search codebase before building

2. **Don't connect database**
   - PostgreSQL schema exists but DON'T connect it
   - Use localStorage or in-memory data for demo

3. **Don't deploy Convex**
   - Convex files exist but DON'T deploy
   - Frontend tries to use it but falls back to Express (this is OK)

4. **Don't change core files unless necessary**
   - `server/index.js` - Leave alone
   - `src/app/page.tsx` - Only modify if adding new views
   - `src/lib/auth.tsx` - Don't touch
   - `server/routes/auth.js` - Don't touch

5. **Don't spend time on:**
   - Production-grade error handling
   - Edge case handling
   - Database setup
   - Real email sending
   - Complex validation

---

## 📝 REFERENCE INFORMATION

### Test Credentials:
```
Email: minister@gov.rw
Password: password123

OR

Email: ps@gov.rw
Password: password123
```

### Backend Server:
```
URL: http://localhost:3001
Status: Already running (Express.js)
```

### Frontend:
```
URL: http://localhost:3000
Framework: Next.js 15.5 + React 19
```

### Working API Endpoints:
```bash
# Authentication
POST http://localhost:3001/api/auth/login

# Dashboard
GET http://localhost:3001/api/intelligence/modules

# AI Chat (Express - has Gemini integration but NOT used by frontend)
POST http://localhost:3001/api/ai/chat

# Search (mock data)
GET http://localhost:3001/api/search?q=project

# NISR Catalog
GET http://localhost:3001/api/catalog
```

### Current AI Assistant Status:
- Frontend calls external RAG API at `http://192.168.56.1:5000/api/query`
- Express has `/api/ai/chat` with Gemini integration (working but unused)
- You can optionally switch frontend to use Express endpoint (bonus points!)

### Key Components to Reuse:
```typescript
// UI Components (already exist)
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { DetailModal } from '@/components/ui/detail-modal'

// Utilities
import { exportToCSV } from '@/lib/export-utils'
import { useAuth } from '@/lib/auth'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'

// Toasts
import { toast } from 'sonner'
toast.success('Action completed!')
toast.error('Something went wrong')
```

---

## 🎨 STYLING REFERENCE

**Colors:**
```css
Blue (Primary): bg-blue-600, text-blue-700, border-blue-500
Green (Success): bg-green-600, text-green-700
Yellow (Warning): bg-yellow-500, text-yellow-700
Red (Danger): bg-red-600, text-red-700
Gray: bg-gray-50, bg-gray-100, text-gray-600, text-gray-900
```

**Common Classes:**
```typescript
// Cards
className="border-l-4 border-l-blue-500"  // Colored left border

// Loading skeleton
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
</div>

// Progress bar
<div className="flex-1 bg-gray-200 rounded-full h-2">
  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percent}%` }}></div>
</div>

// Grid layout
className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
```

---

## 🎯 DEMO FLOW TO OPTIMIZE

This is the path a presenter will take during demo:

1. **Login** → Should be smooth and instant
2. **Dashboard** → Show 3 intelligence cards with NISR data
3. **Click "Generate Insights"** → Loading → Navigate to Intelligence tab → Show AI analysis
4. **Use AI Chat** → Type question → Get response with sources
5. **Search** → Type "infrastructure" → See results → Click → Navigate correctly
6. **Opportunities Tab** → Use filters → Click "Express Interest" → Fill form → Success
7. **Generate Briefing** → Progressive loading (impressive!) → PDF preview
8. **Navigate All Tabs** → Everything looks complete, no broken parts

**Every step should work smoothly. No errors. No broken buttons.**

---

## ⏰ TIME MANAGEMENT

You have **~8 hours** of coding time:

- **Hours 0-1:** Read docs, understand codebase, confirm understanding
- **Hours 1-3:** Quick wins (move components, add charts, simple modals)
- **Hours 3-5:** Core features (chat app, search, dashboard enhancements)
- **Hours 5-6:** Opportunities tab (all features)
- **Hours 6-7:** Smart mocks (briefing, usage tracking, recommendations)
- **Hour 7-8:** Polish, test demo flow, fix issues

**Stay on schedule.** If stuck for >15 minutes, use a smart mock instead.

---

## 🎉 SUCCESS CRITERIA

You're done when:

✅ All 22 requirements are visually complete
✅ Demo flow works end-to-end with no errors
✅ Every button does something (even if mocked)
✅ Loading states feel natural (1-2 second delays)
✅ No console errors in browser
✅ Navigation works smoothly between all tabs
✅ AI chat responds (even if basic)
✅ Forms can be submitted and show success
✅ Exports download files
✅ It looks production-ready in screenshots

---

## 🚀 READY TO START?

1. Read `docs/CODEBASE-ARCHITECTURE.md` thoroughly
2. Read `docs/product-brief.md` for context
3. Read `docs/DEMO-IMPLEMENTATION-PROMPT.md` for detailed requirements
4. Respond with the confirmation template above
5. Wait for my approval
6. Start coding!

---

## 💬 QUESTIONS?

If confused about anything:
1. Search `docs/CODEBASE-ARCHITECTURE.md` (Ctrl+F)
2. Look at existing code for patterns
3. Ask me specific questions

**Remember:** This is a DEMO, not production. Make it look amazing and work smoothly for the demo. Perfect is the enemy of done!

**Let's ship something incredible! 🇷🇼✨**

# Dashboard Functional Review

This document captures the current behaviour of every element on the dashboard landing experience and the recommended implementation steps to align with the product vision. All data-backed features should be migrated to Convex for persistence, streaming updates, and server-side logic.

---

## Global Layout & Shell

### Header Bar (Logo, Title, Subtitle)
- **Current:** Purely static branding; no runtime dependencies.
- **Recommendation:** Keep static but load ministry context from Convex (e.g., active user’s ministry name) to personalise the subtitle.

### Global Search Field (“Search Rwanda's data…”)
- **Current:** Uncontrolled input with no handlers or results.
- **Recommendation:** Wire to Convex functions that perform federated search. Reuse AI-backed search logic so keystrokes debounce, call Convex action that queries indexes (projects, opportunities, intelligence) and returns contextual suggestions/results.

### Notifications Icon (Bell)
- **Current:** Static button without state.
- **Recommendation:** Connect to Convex subscription for user-specific alerts (new insights, risk escalations). Display badge count and open a panel with recent notifications.

### User Menu (Name, Role, Ministry, Profile, Logout)
- **Current:** Displays information from mock auth context; profile and settings buttons are inactive.
- **Recommendation:** Pull user profile from Convex `users` table, allow quick switching of ministry context. Profile button should open settings modal fed by Convex mutation endpoints (e.g., update contact info, role preferences). Logout should revoke Convex-issued session tokens.

### Navigation Tabs (Dashboard, Intelligence, Opportunities, Projects, Ministries)
- **Current:** Client-side state toggle with no deep-linking. Tabs show/hide static React components.
- **Recommendation:** Move to Next.js route segments backed by Convex queries. Preserve tab state in URL (`/dashboard/opportunities`). Fetch per-tab data via Convex loader hooks to enable SSR and shareable links.

### AI Assistant Launcher (Floating Button) & Panel
- **Current:** Launcher toggles assistant visibility, but assistant content is mock data from Express API.
- **Recommendation:** Replace backend with Convex actions that orchestrate Gemini prompts plus Convex-stored conversation history. Assistant should surface live metrics pulled from Convex tables (e.g., top projects at risk) and allow quick actions that trigger Convex mutations (e.g., follow-up with project owner).

---

## Dashboard Content Area (`IntelligenceModules`)

### Top-Level Data Fetch
- **Current:** Fetches from Express endpoint returning hardcoded JSON.
- **Recommendation:** Create Convex query `getDashboardModules` that joins actual budget, project, and opportunity data. Module metadata should include freshness timestamps, confidence scores, and link targets for drill-down.

### Resource Allocation Widget
- **Current:** Displays mock aggregated numbers and efficiency bar; “Efficiency improved by 3.2% this quarter” is hardcoded copy. No interactivity.
- **Recommendation:** Back the card with Convex query aggregating spend by ministry/project from real ledger transactions. Include click-through to open a modal with breakdown (e.g., by programme, quarter). Replace hardcoded improvement copy with computed delta (e.g., compare current vs previous quarter). Expose export action that triggers Convex mutation to queue CSV/PowerPoint build.

### Opportunity Radar
- **Current:** Shows mock counts, sectors, regions, and static “18 new opportunities this week.”
- **Recommendation:** Feed from Convex query that aggregates live opportunity records (imported from ingestion pipeline). “18 new opportunities” should be computed relative to last 7 days in Convex. Add CTA linking to Opportunities tab filtered via query params. When clicking, fetch AI-surfaced insights from Convex action that summarises new opportunities and ties into Gemini responses.

### Performance Monitor
- **Current:** Mock metrics for projects at risk, on-time delivery, quality score. Static alert copy.
- **Recommendation:** Derive metrics from Convex tables storing project milestones, risk logs, and quality audits. Highlight top risks by reading from `project_risks` collection. Provide interactions: “View risk register” button opens Convex-driven detail view; allow marking risks as acknowledged via mutation.

### Quick Actions Card
- **Current:** Three buttons (Budget Report, Ministry Performance Review, Project Status Update) that do nothing.
- **Recommendation:** Wire each button to trigger Convex actions:
  - **Generate Budget Report:** Start background job in Convex to compile latest spend report and notify user when ready.
  - **Ministry Performance Review:** Navigate to analytics page with filters pre-applied, data fetched via Convex query.
  - **Project Status Update:** Launch modal that lists projects awaiting updates sourced from Convex `project_updates` collection, with inline mutation to submit update.

### Recent Activity Card
- **Current:** Static list of three events with placeholder timestamps.
- **Recommendation:** Replace with Convex subscription on `activity_log` collection. Show real-time updates (e.g., “Finance Ministry reallocated 50M RWF at 14:32”). Provide “View all” link to audit timeline screen backed by Convex pagination.

---

## Supplemental Sections Rendered on Dashboard Page

### Institutional Memory Component (Policy Decisions & Patterns)
- **Current:** Entirely mock data arrays, static analytics, no interaction.
- **Recommendation:** Persist policy decisions, outcomes, and patterns in Convex collections. Build queries to filter by ministry, decision category, time range. Allow bookmarking lessons, attaching files, and exporting briefs via Convex mutations. Incorporate AI summarisation using Convex actions that pass stored evidence to Gemini.

### Entrepreneur Opportunity Portal (Shown for Entrepreneurs/Investors)
- **Current:** Client-side mock dataset with filter UI; no server integration.
- **Recommendation:** Replace with Convex query sourcing opportunities, investment ranges, and risk assessments. Filters should call Convex parameterised queries (sector, location, investment range). “Express Interest” should call mutation to create lead record and notify ministry relationship managers.

### Projects Overview
- **Current:** Uses static dataset, summary stats computed client-side.
- **Recommendation:** Implement Convex queries to aggregate budgets, progress, risk, beneficiaries. Replace static recommendations with AI-inferred actions generated via Convex action that analyses real metrics. Enable row click to open project detail view populated from Convex.

### Ministries Overview
- **Current:** Static metrics covering budget, efficiency, initiatives.
- **Recommendation:** Build Convex pipeline to ingest ministry KPIs. Leaderboard should auto-sort based on live efficiency scores. “View implementation plan” should navigate to ministry profile page where content is fetched from Convex collections (plans, contacts, dependencies).

---

## Data & Backend Recommendations

1. **Adopt Convex for Persistence:** Migrate all Express route logic to Convex query/mutation/actions. Replace REST fetches with Convex client hooks to ensure real-time updates and simplified server state management.
2. **Data Ingestion Pipelines:** Use Convex scheduled functions to ingest budgets, opportunities, and project data from external sources (e.g., government datasets, spreadsheets). Normalise and store in schema-aligned collections.
3. **AI Integration:** Create Convex actions that orchestrate Gemini prompts using persisted context (budget snapshots, risk logs). Ensure AI outputs cite Convex record IDs for traceability.
4. **Access Control:** Implement role-based access in Convex using user session context. Ensure ministers see own ministry data by default; admins can toggle ministry filters.
5. **Audit & Activity Logging:** Store all user interactions (report generation, risk acknowledgement) in Convex `activity_log` collection to feed the “Recent Activity” stream and compliance reports.

---

## Next Steps

1. Define Convex schema for budgets, projects, opportunities, ministry KPIs, insights, and activity logs.
2. Replace `IntelligenceModules` fetch with `useQuery` calls to Convex, gradually migrating each widget.
3. Build modular detail views (e.g., Resource Allocation modal) that consume enriched data from Convex queries.
4. Integrate AI assistant with Convex-stored conversation history and data-driven prompts.
5. Remove Express server once Convex endpoints cover all current routes.

This review provides a roadmap to transform the dashboard from a mock-driven prototype into a live decision intelligence workspace powered by Convex.



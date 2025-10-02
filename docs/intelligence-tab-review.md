# Intelligence Tab Functional Review

This document assesses the current intelligence experience (Intelligence tab & Institutional Memory views) and outlines the required upgrades to deliver live, Convex-powered insights aligned with the platform vision.

---

## Intelligence Tab Modules (`IntelligenceModules`)

### Data Retrieval Layer
- **Current:** Fetches from `/api/intelligence/modules` (Express) returning hardcoded mock data.
- **Recommendation:** Replace with Convex query `getIntelligenceModules` that aggregates real metrics across ministries, projects, and opportunities. Ensure data includes freshness timestamps, confidence scores, and data lineage metadata.

### Resource Allocation Intelligence Card
- **Current:** Static numbers for total budget, available funds, efficiency gauge, and generic improvement note.
- **Recommendation:** Source budget allocations from Convex collections (e.g., `budgets`, `expenditures`). Calculate efficiency and trend deltas server-side. Add interactions:
  - Click to open Convex-backed modal showing breakdown by programme, quarter, and ministry.
  - Provide “Reallocate funds” CTA triggering Convex mutation to initiate budget change workflow.
  - Surface AI-generated recommendation using Convex action that analyses historical execution and suggests optimisations.

### Opportunity Radar Card
- **Current:** Displays mock totals, sectors, regional breakdowns, and static “18 new opportunities.”
- **Recommendation:** Populate from Convex `opportunities` collection, including sentiment from AI scoring. “New opportunities this week” must be computed via Convex query comparing created timestamps. Link to Opportunities page with filters applied and include “Ask AI for summary” button that calls Convex action orchestrating Gemini analysis on new records.

### Performance & Risk Monitor Card
- **Current:** Mock counts for projects at risk, on-time delivery, and top risks. Static alert text.
- **Recommendation:** Feed from Convex `project_risks`, `project_milestones`, and `project_quality` tables. Provide interactive controls:
  - “Investigate risks” opens detail sheet with risk heatmap and ability to assign owners (Convex mutation).
  - Display sparkline trends of on-time delivery pulled from Convex time-series view.
  - Highlight AI-detected pattern anomalies generated via Convex action leveraging historical risk data.

### Quick Actions Panel
- **Current:** Buttons with no functionality.
- **Recommendation:** Wire to Convex actions:
  - **Generate Budget Report:** Compose on-demand report by querying Convex; deliver via notification.
  - **Ministry Performance Review:** Prefetch data for ministry dashboard (Convex query) and navigate.
  - **Project Status Update:** Launch modal pulling outstanding update requests from Convex `project_updates` and allowing inline submission.

### Recent Activity Feed
- **Current:** Static placeholder events.
- **Recommendation:** Subscribe to Convex `activity_log` collection filtered for intelligence events (new insights, risk escalations). Show real timestamps, usernames, and provide link to full audit trail.

---

## Institutional Memory (Rendered within Intelligence Context)

### Policy Decisions List
- **Current:** Hardcoded array of policy decisions with success status, outcomes, and lessons.
- **Recommendation:** Persist decisions in Convex (`policy_decisions`, `decision_outcomes`). Implement filtering by ministry, category, and time range. Each entry should link to a detail drawer that shows supporting documents stored in Convex storage and AI-generated briefs anchored to real evidence.

### Historical Patterns Section
- **Current:** Static pattern entries with context, outcomes, and confidence scores.
- **Recommendation:** Build Convex analytics pipeline that mines stored decisions/projects for recurring patterns. Store computed patterns in `historical_patterns` collection. Confidence score must be derived from real success/failure ratios. Provide “Apply pattern” action that triggers AI guidance from Convex action referencing relevant cases.

### Analytics Sub-tab
- **Current:** Mock aggregates for success rates and timelines using hardcoded arrays.
- **Recommendation:** Generate charts using data pulled from Convex views (e.g., success rate by policy type, implementation duration). Use real numbers, expose export/download functionality, and allow cross-filtering with policy decisions.

### Search & Filtering
- **Current:** Search input does not filter; view toggle purely client-side.
- **Recommendation:** Connect search and filters to Convex queries so searching “health” restricts decisions/patterns to that domain. Implement server-side pagination for large datasets.

### Actions (Export, Generate Insights)
- **Current:** Buttons without handlers.
- **Recommendation:**
  - **Export Report:** Invoke Convex action to compile PDF/CSV briefing and store result in Convex storage, notifying user when ready.
  - **Generate Insights:** Kick off AI workflow via Convex action, summarising latest lessons and pattern recommendations tailored to the user’s ministry.

---

## AI Assistant Integration
- **Current:** Assistant fetches mock suggestions and conversations from Express backend.
- **Recommendation:** Move to Convex actions that:
  1. Retrieve latest intelligence metrics from Convex collections.
  2. Construct Gemini prompts contextualised with policy decisions, risks, and opportunities.
  3. Persist conversation threads in Convex to allow continuity across sessions and compliance auditing.

---

## Convex Architecture Priorities for Intelligence
1. **Schema Design:** Define collections for budgets, expenditures, opportunities, projects, policy decisions, historical patterns, and activity logs.
2. **Real-time Queries:** Use Convex `useQuery` hooks for cards requiring live updates (e.g., Risk Monitor, Recent Activity).
3. **AI Orchestration:** Centralise AI calls in Convex actions so modules can request insights with consistent governance.
4. **Access Control:** Enforce role-based visibility in Convex functions (ministers see scoped data; admins see cross-government data).
5. **Audit Trail:** Log all intelligence and institutional memory interactions in Convex to power the activity feed and compliance reporting.

---

This review sets the blueprint for transforming the Intelligence tab from a mock-driven showcase into a live intelligence command center powered by Convex.



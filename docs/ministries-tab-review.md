# Ministries Tab Functional Review

Evaluation of the ministries performance workspace, highlighting current limitations and required Convex-powered enhancements with interoperability across the platform.

---

## Overall State
- **Current:** Static React component showing mock ministry metrics (budget, efficiency, initiatives) with no data connectivity or role-based controls.
- **Recommendation:** Make the Ministries tab the authoritative insight hub for ministry-level KPIs, sourced from Convex collections shared with dashboard intelligence, projects, and opportunities modules. Enforce RBAC so each user sees permitted ministries while admins can view cross-government dashboards.

---

## Header & Controls

### Title, Description, and Action Buttons
- **Current:** Static copy with Export Report / Generate Insights buttons that do nothing.
- **Recommendation:**
  - Personalise header with Convex query returning user’s assigned ministry or oversight responsibilities.
  - Export action triggers Convex workflow to compile ministry briefing (PDF/CSV) with recent KPIs and insights, stored in Convex storage and logged to activity feed.
  - Generate Insights button invokes Convex action that leverages Gemini to summarise top wins, risks, and recommended interventions, referencing live data.

### Filters & Search
- **Current:** Search input doesn’t affect data; no filters for ministry attributes.
- **Recommendation:** Wire search and potential filters (region, thematic priority, performance tier) to Convex queries enabling dynamic slicing. Persist saved filter sets to share across dashboard/analytics tabs.

---

## Key Metrics Cards

### Total Portfolio Budget, Average Efficiency, Flagship Initiatives, Top Impact Ministry
- **Current:** Derived from mock dataset.
- **Recommendation:** Compute these metrics using Convex aggregate queries to ensure consistency with dashboard resource allocation and intelligence highlights. Include deltas vs previous periods and allow drill-down into underlying data via Convex detail queries.

---

## Performance Leaderboard Table
- **Current:** Hardcoded table with columns for minister, budget, utilisation, efficiency, flagship projects, and impact score.
- **Recommendation:**
  - Populate using Convex query combining `ministries`, `ministry_budgets`, `performance_metrics`, and `flagship_projects` collections.
  - Support server-side sorting (e.g., impact score, efficiency) and pagination via Convex.
  - Clicking a row navigates to ministry detail page (`/ministries/[id]`) where all associated projects, opportunities, and policy decisions are fetched from shared Convex collections.
  - Allow editing of leadership contacts or priorities through Convex mutations gated by role permissions.

### Utilisation Visuals & Efficiency Stats
- **Current:** Static bars and percentages.
- **Recommendation:** Render progress bars based on real execution data from Convex, with tooltips showing spend vs allocation on monthly basis. Efficiency percentage should link to underlying calculations (e.g., outcome index) stored in Convex for transparency.

---

## Priority Initiatives Grid
- **Current:** Lists mock initiatives per ministry with static “View implementation plan” button.
- **Recommendation:**
  - Fetch initiatives from Convex `ministry_initiatives`, including owners, timelines, dependencies, and status.
  - Provide quick actions: mark milestone complete, escalate issue, allocate budget support—each triggering Convex mutations.
  - Ensure initiatives are cross-referenced with Projects and Opportunities modules so updates propagate (e.g., initiative tied to a project automatically updates project detail view).

---

## Interoperability Considerations
1. **Shared KPI Definitions:** Store KPI formulas and cached results in Convex so Dashboard, Intelligence, and Ministries tabs show identical values.
2. **Cross-Linking:** Ministries should expose linked projects, opportunities, policy decisions, and AI insights, enabling users to navigate seamlessly across modules via shared Convex IDs.
3. **Notifications:** Changes in ministry performance (e.g., efficiency drop) should emit Convex events consumed by dashboard recent activity and AI assistant suggestions.
4. **Role-Based Data:** Ministers see their own ministry plus any delegated ones; central agencies see aggregated metrics. Access control must be enforced in Convex queries/mutations.
5. **Audit & Compliance:** All updates to ministry data should log to Convex `activity_log` ensuring traceability across the platform.

---

Implementing these upgrades will make the Ministries tab the executive cockpit for ministry oversight, tightly aligned with the rest of the intelligence ecosystem.



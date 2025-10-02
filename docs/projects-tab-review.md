# Projects Tab Functional Review

Evaluation of the strategic projects experience with focus on interoperability across modules and Convex-first architecture.

---

## Overall Tab Structure
- **Current:** Standalone React component renders mock data (portfolio stats, tables, recommendations).
- **Recommendation:** Replace with Convex-driven data model shared with Dashboard, Intelligence, and AI assistant. Projects tab should act as the authoritative source for project metadata, risks, milestones, budgets, and beneficiaries.

---

## Header & Actions

### Heading & Context Copy
- **Current:** Static text describing monitoring focus.
- **Recommendation:** Enrich with Convex query that surfaces user’s ministry or portfolio scope (e.g., “showing Infrastructure projects”). Provide quick filter pills referencing saved views in Convex.

### Advanced Filters Button
- **Current:** No functionality.
- **Recommendation:** Open filter drawer powered by Convex query parameters (status, ministry, SDG, funding source). Persist user-defined filters in Convex so they are reusable in dashboard quick actions and AI prompts.

### New Project Brief Button
- **Current:** Inactive.
- **Recommendation:** Launch workflow to create project concept note. Mutation should write to Convex `project_briefs` and notify oversight committee. Ensure new briefs automatically appear in Opportunities/Intelligence modules if relevant.

---

## Portfolio Summary Cards

### Active Budget, Delivery Progress, Projects At Risk, Beneficiaries Reached
- **Current:** Calculated client-side from mock dataset.
- **Recommendation:** Use Convex aggregate queries to compute totals, spend-to-budget ratios, risk counts, beneficiary totals. Ensure metrics align with dashboard resource allocation and intelligence risk monitor by sourcing from the same Convex collections. Add trend indicators from historical snapshots stored in Convex.

---

## Portfolio Tracker Table

### Data Columns (Project, Ministry, Budget, Status, Risk, Progress)
- **Current:** Hardcoded dataset; progress bars based on static numbers.
- **Recommendation:** Populate via Convex query joining `projects`, `project_finance`, `project_risks`, and `milestones`. Support server-side pagination, sorting, and export (Convex action). Clicking a row should navigate to `/projects/[id]` with data pre-fetched through Convex loader for SSR.

### Risk & Status Badges
- **Current:** Static styling; no behaviour.
- **Recommendation:** Bind to Convex risk register. Clicking a badge opens detail sheet showing risk history and allowing risk owner updates through Convex mutation. Share risk changes across Intelligence tab and AI assistant (same collection).

### Progress Indicators
- **Current:** Derived from mock milestoneProgress field.
- **Recommendation:** Calculate milestone completion in Convex using actual milestone records and latest updates. Provide tooltip with next milestone deadline and responsible officer, pulled from shared `milestone_assignments` collection.

---

## High-Impact Projects Panel
- **Current:** Displays top three mock projects with progress and beneficiary stats.
- **Recommendation:** Query Convex for projects with highest impact scores (e.g., progress > 60% plus beneficiary weighting). Ensure scoring logic is shared with dashboard highlights and AI assistant recommendations. Allow “Flag for briefing” action that writes to Convex `executive_brief_queue`.

---

## Delivery Outlook Panel
- **Current:** Static percentages for project status categories and generic guidance.
- **Recommendation:** Compute future delivery forecast in Convex using project schedules and risk probability. Visual segments should reflect real counts, and recommendations should be AI-generated via Convex action referencing forecast data. Sync insights with Intelligence tab to avoid duplicate messaging.

---

## Strategic Recommendations
- **Current:** Three hardcoded cards describing actions.
- **Recommendation:** Generate dynamically using Convex action that analyses real-time metrics (risk exposure, budget slippage, beneficiary reach). When user accepts an action, create follow-up task in Convex `action_items` shared with task management tools and activity feeds.

---

## Interoperability Considerations
1. **Unified Project Schema:** Define Convex collections for projects, finance, milestones, risks, beneficiaries, and action items. All tabs (Dashboard, Intelligence, Opportunities) should reference these collections to ensure consistency.
2. **Event-Driven Updates:** When project status changes in Projects tab, emit Convex events to update dashboard recent activity, adjust resource allocation summaries, and notify AI assistant.
3. **Cross-Linking:** Projects associated with investment opportunities should reference shared IDs so Opportunities tab can highlight related infrastructure, and ministers can trace implications in Intelligence insights.
4. **Access Control:** Enforce role-based access via Convex functions (e.g., project leads can edit milestones, ministers can approve budget reallocations).
5. **Audit Trail:** Log all project mutations in Convex `activity_log` to feed compliance reporting and maintain alignment with dashboard “Recent Activity”.

---

Implementing these upgrades with Convex will turn the Projects tab into the operational heartbeat of the platform, seamlessly feeding intelligence analytics, AI recommendations, and investor-facing opportunities.



# Opportunities Tab Functional Review

Assessment of the Entrepreneur / Opportunities experience with emphasis on interoperability across modules and Convex-backed data services.

---

## Global Context & Role-Based Access
- **Current:** Component renders for all authenticated users when selected; data and permissions are mock-driven.
- **Recommendation:** Gate the tab based on Convex role data (Entrepreneur, Investor, Minister). Share opportunity metadata with intelligence modules so ministers can view the same leads from the dashboard. Maintain a shared Convex collection for opportunities to ensure consistent data in dashboards, search, and AI assistant conversations.

---

## Header Actions

### Title & Description
- **Current:** Static text describing discovery purpose.
- **Recommendation:** Personalise using Convex query that fetches user sector interests, highlighting curated focus areas. Surface badges for watchlisted sectors retrieved from Convex.

### Advanced Filter Button
- **Current:** No-op button.
- **Recommendation:** Open a Convex-backed modal with additional filters (minimum ROI, incentive types, ministry sponsor). Filters should generate persisted views used by other modules (e.g., AI assistant, dashboard quick actions).

### My Watchlist Button
- **Current:** No functionality.
- **Recommendation:** Navigate to saved opportunities stored in Convex `watchlists`. Ensure the watchlist feeds intelligence notifications (e.g., dashboard recent activity) to keep ministers aware of investor interests.

---

## Search & Filter Bar

### Search Input
- **Current:** Filters client-side mock data only.
- **Recommendation:** Debounce user input and call Convex query to perform full-text search across opportunities, policy incentives, and related projects. Return AI-curated suggestions when no exact matches; AI output should reference Convex record IDs for interoperability.

### Dropdown Filters (Sector, Location, Investment Range, Risk Level)
- **Current:** Filter in-memory array; preset options are static strings.
- **Recommendation:** Populate option lists dynamically from Convex (sectors sourced from taxonomy collection, locations from geo registry). Filtering should be server-side to support pagination. Share filter state with other views via URL params so Projects or Intelligence modules can load the same subset.

---

## Summary Metrics Cards

### Total Opportunities, Market Size, Average ROI, Low Risk Count
- **Current:** Calculated on client using mock dataset.
- **Recommendation:** Compute metrics via Convex aggregate queries, enabling real-time updates and consistent values across dashboard and AI assistant. Include trend comparisons (week-over-week) so dashboard quick insights align with Opportunities tab data.

---

## Opportunity Grid Cards

### Card Header (Title, Sector, Risk/Competition Badges)
- **Current:** Uses mock values; badges are purely visual.
- **Recommendation:** Source data from Convex `opportunities` including risk assessments produced by AI or analysts. Badges should link to supporting evidence in Institutional Memory. Provide tooltip with Convex-sourced rationale for risk level to ensure transparency across teams.

### Location & Investment Details
- **Current:** Static text from mock object.
- **Recommendation:** Format using Convex data with currency localisation. Provide “View incentives” link to open modal referencing Convex incentive records shared with Projects module (for public-private partnership alignment).

### Call-to-Action Buttons (View Details, Express Interest)
- **Current:** No handlers.
- **Recommendation:**
  - **View Details:** Navigate to opportunity detail route (`/opportunities/[id]`) loading full dossier from Convex, including related projects and supporting policies.
  - **Express Interest:** Trigger Convex mutation creating investor lead entry, notifying relevant ministry via Convex notification service and logging activity for dashboard feed.

### Watchlist & Collaboration
- **Current:** No integration.
- **Recommendation:** Add “Add to Watchlist” toggle that writes to Convex. Sync with AI assistant so conversations can reference watchlisted deals. Enable sharing to ministry counterparts through Convex-based collaboration (e.g., assign to Investment Promotion team, track follow-ups).

---

## Empty State & Clear Filters
- **Current:** Empty state resets local filters.
- **Recommendation:** Persist filter presets in Convex so users can store preferred searches. Empty state should offer AI suggestions (Convex action) that propose alternative sectors or incentives based on supply-demand gaps across ministries.

---

## Interoperability Considerations
1. **Shared Collections:** Opportunities, incentives, investor leads, and watchlists must live in Convex collections consumable by dashboard intelligence, AI assistant, and search services.
2. **Cross-Module Links:** When an opportunity influences resource allocation or project planning, Convex should emit events consumed by Projects and Intelligence tabs, keeping insights consistent.
3. **AI Feedback Loop:** AI-generated opportunity summaries should write back to Convex so other modules (e.g., Ministers reviewing budgets) can see the same recommendations.

---

By grounding the Opportunities tab in Convex data and sharing state across modules, the platform can deliver a cohesive experience for investors, entrepreneurs, and government decision-makers.



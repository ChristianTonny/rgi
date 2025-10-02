# Additional Tabs & Modules – Functional Review

This document covers remaining or future tabs beyond Dashboard, Intelligence, Opportunities, and Projects, ensuring holistic platform coverage and interoperability.

---

## Authentication & User Settings
- **Current:** Login flow uses mock users; no user settings tab.
- **Recommendation:** Introduce a **Profile & Settings** tab/page sourced from Convex `users` collection. Allow users to update contact info, notification preferences, and ministry assignments via Convex mutations. Integrate session management (token refresh, revoke) through Convex auth infrastructure. Ensure settings feed into AI assistant context and notification routing.

---

## Analytics / Reports Tab
- **Current:** `src/components/dashboard/analytics` route returns placeholder message.
- **Recommendation:** Build an **Analytics** tab that synthesises cross-ministry KPIs, trends, and predictive models. Use Convex queries to power charts (e.g., spend vs outcomes, sectoral performance). Provide templated reports users can schedule; scheduling should rely on Convex cron jobs to generate outputs and deliver notifications.

---

## Search & Discovery Tab
- **Current:** No dedicated tab; dashboard search field is non-functional.
- **Recommendation:** Add a **Search** tab for advanced discovery. Hook into Convex search indices (flex/AI-backed). Provide filters across projects, policies, opportunities, and intelligence insights. Share search state with AI assistant so follow-up questions pull from the same result set. Persist search history in Convex for auditing and personalisation.

---

## Institutional Memory Dedicated Tab
- **Current:** Institutional Memory content exists only as component on dashboard view.
- **Recommendation:** Create a standalone **Institutional Memory** tab for deep exploration of policy decisions, lessons, and historical patterns. Integrate with Convex to support document attachments, cross-ministry collaboration, and AI summarisation. Ensure direct links from Projects and Ministries tabs to relevant institutional knowledge.

---

## Tasking / Action Items Tab
- **Current:** No task management surface.
- **Recommendation:** Add **Action Center** tab that aggregates to-dos arising from AI recommendations, project risks, budget reallocations, and investor follow-ups. Store tasks in Convex `action_items` collection; allow assignment, due dates, and status updates. Ensure tasks connect to originating context (project, opportunity, ministry) for full traceability.

---

## Notifications & Activity Log Tab
- **Current:** Recent activity card is limited; no full history view.
- **Recommendation:** Provide **Activity & Notifications** tab presenting chronological events from Convex `activity_log`. Support filtering by module, severity, or user. Include bulk actions (mark as read, export) and tie into audit requirements. This tab underpins transparency across all other modules.

---

## Data Management / Admin Tab
- **Current:** No interface for managing reference data (ministries, sectors, incentives).
- **Recommendation:** Create **Admin** tab restricted to system admins, allowing management of taxonomies, user roles, and data ingestion pipelines. Use Convex mutations to update configuration documents and trigger reindexing or data refresh jobs.

---

## Mobile / Tablet Considerations
- **Current:** Components are responsive but not validated for field use.
- **Recommendation:** Evaluate need for dedicated **Field Operations** tab featuring offline-capable checklists and data capture. Convex offline support (when available) or queueing mechanisms should be leveraged to sync updates once connectivity resumes.

---

## Integration Touchpoints
1. **AI Assistant:** All new tabs should expose shortcut actions the assistant can trigger via Convex actions (e.g., “Show me outstanding tasks”).
2. **Shared Collections:** Ensure new modules read/write to central Convex collections so data remains consistent across Dashboard and existing tabs.
3. **Notification Bus:** Any tab that generates user-facing events must emit structured entries to Convex `activity_log` to maintain unified audit trail.

---

These additional tabs round out the governance operating system, delivering end-to-end visibility and actionability across ministries, projects, opportunities, and institutional knowledge.



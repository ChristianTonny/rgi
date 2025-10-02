# Rwanda Government Intelligence Platform – Product Brief

## 1. Executive Summary
A government-grade intelligence platform that unifies Rwanda’s public-sector data, AI guidance, and institutional knowledge. The product equips ministers, policy leaders, and partners with real-time insights and guided workflows to accelerate national development.

## 2. Vision & Mission
- **Vision:** Deliver a Palantir Foundry × Bloomberg Terminal experience tailored to Rwanda, transforming governance into a data-driven, AI-augmented discipline.
- **Mission:** Provide decision makers with a single source of truth, actionable insights, and collaborative tools to plan, execute, and monitor development initiatives.

## 3. Target Personas
| Persona | Needs | Platform Value |
| --- | --- | --- |
| Ministers & Cabinet Members | Macro view of budgets, risks, and opportunities | Executive dashboards, AI briefings, cross-ministry coordination |
| Policy Directors & Analysts | Deep dives into institutional memory and analytics | Searchable knowledge base, trend analysis, evidence-backed recommendations |
| Programme & Project Managers | Operational visibility and task execution | Project tracking, risk mitigation workflows, beneficiary metrics |
| Entrepreneurs & Investors | Trusted view of government-backed opportunities | Filterable opportunities, incentives, express-interest flows |

## 4. Core Problems Solved
- Fragmented data across ministries delaying decisions.
- Limited institutional memory leading to repeated mistakes.
- Slow project execution due to siloed updates and lack of AI support.
- Poor visibility into investment opportunities for external partners.

## 5. Product Pillars & Feature Highlights
### 5.1 Dashboard – Executive Intel Center
- Resource allocation intelligence (budgets, efficiency trends).
- Opportunity radar (new opportunities, regional/sector breakdowns).
- Performance & risk monitor (projects at risk, on-time delivery, alerts).
- Quick actions (generate budget report, ministry review, project status update).
- Real-time activity feed sourced from Convex `activity_log`.

### 5.2 Intelligence Tab – Deep Analysis & Institutional Memory
- Policy decision repository with outcomes, lessons, and AI summaries.
- Historical pattern detection displaying recurring success/failure factors.
- Analytics view for cross-ministry metrics and timeline insights.
- AI assistant (Vercel AI SDK + Convex) for contextual Q&A with citations.

### 5.3 Opportunities Tab – Investor & Entrepreneur Portal
- Filterable catalog (sector, location, investment range, risk level).
- Detailed cards highlighting incentives, ROI, risk assessments.
- Watchlists, express-interest flows, and AI-generated opportunity summaries.
- Shared Convex collections enable ministers to track investor engagement.

### 5.4 Projects Tab – Delivery Command Center
- Portfolio tracker with budget utilisation, progress, and risk tagging.
- High-impact project highlights and delivery outlook forecasts.
- Strategic recommendations generated via AI actions referencing Convex data.
- Drill-down pages for milestones, risk registers, beneficiaries.

### 5.5 Ministries Tab – Performance Oversight
- Ministry KPIs (budget, efficiency, flagship initiatives, impact scores).
- Performance leaderboard with drill-down detail pages.
- Priority initiatives board tied to projects and opportunities.

### 5.6 Additional Modules (Roadmap)
- Analytics & Reports (cross-cutting dashboards, scheduled exports).
- Search & Discovery (federated search across all collections).
- Action Center (task assignments derived from AI recommendations).
- Admin & Data Management (taxonomies, ingestion pipelines, role management).

## 6. Data Strategy
- **Primary sources:** NISR Microdata portal downloads, ministry budget APIs (future), manual project updates.
- **Storage:** Convex collections for budgets, projects, opportunities, ministries, institutional memory, conversations, activity logs.
- **Ingestion:** Manual uploads initially, automated Convex cron jobs scheduled once APIs are available.
- **Data directory:** `data/raw-source-files/` stores original downloads for reproducibility.
- **Governance:** Clerk roles + Convex filters enforce ministry-scoped visibility and audit trails.

## 7. Technology Stack Overview
| Layer | Technologies |
| --- | --- |
| Frontend | Next.js 15+, TypeScript, Tailwind CSS, Radix UI |
| Backend | Convex (query/mutation framework, realtime database, cron jobs) |
| AI | Vercel AI SDK (`useChat`) with Gemini/OpenAI; conversations persisted in Convex |
| Auth | Clerk (role metadata: minister, policy director, programme manager, entrepreneur) |
| Hosting | Vercel (Next.js) + Convex Cloud (backend) |
| Tooling | Convex CLI, ESLint, TypeScript, Playwright/Jest (planned) |

## 8. Implementation Roadmap (High-Level)
1. **Phase 1 – Convex Foundation (0-3 months):**
   - Build Convex schema mirroring mock data; migrate dashboard/intelligence/ projects to live queries.
   - Implement Clerk auth and role-based data filtering.
   - Launch AI assistant MVP with Convex-persisted conversations.
2. **Phase 2 – Data Enrichment & Modules (3-6 months):**
   - Ingest NISR datasets, populate budgets, projects, opportunities collections.
   - Ship Ministries tab, Opportunities enhancements, and institutional memory search.
   - Add responsive UI polish, notifications, and Action Center MVP.
3. **Phase 3 – Scale & Governance (6-12 months):**
   - Integrate ministry budget API, automate project update ingestion.
   - Introduce advanced analytics, RAG workflows, compliance dashboards.
   - Onboard additional ministries and external stakeholders; optimise for production.

## 9. Success Metrics
- Adoption: DAUs/WAUs across ministerial personas, retention rates.
- Operational: Reduction in decision cycle time, number of risks mitigated, speed of budget reallocation.
- Engagement: Opportunity leads created, project updates submitted, AI interactions per user.
- Data readiness: Percentage of modules running on real data vs mock, ingestion coverage of critical datasets.

## 10. Collaboration & Documentation
- Architecture blueprint – `docs/ARCHITECTURE.md`
- Module reviews – `docs/*-review.md`
- User journeys – `docs/user-journey-alignment.md`
- Task backlog – `docs/task-backlog.md`
- This product brief provides a reference for pitch decks, stakeholder alignment, and developer onboarding.

---
With Convex, Next.js, and AI at its core, the Rwanda Government Intelligence Platform empowers leadership to act on trusted data, institutional knowledge, and real-time insights.




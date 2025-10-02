# Rwanda Government Intelligence Platform – Implementation Plan

## Current State Summary

### What’s Built
- Frontend scaffold with Next.js App Router, global auth provider, and role-aware dashboard layout.
- Authentication flow using mock users (JWT issuance, login/logout, basic profile fetch).
- Dashboard intelligence modules rendering mocked intelligence data with loading states and UI polish.
- AI assistant slide-over UI with Gemini API integration, role-aware prompts, and suggestion fetching.
- Express server with core middleware (Helmet CSP, rate limiting, CORS, JSON parsing) and routing structure.
- Search service using FlexSearch indexes populated with mock datasets plus query logging via database helper.
- Database layer utilities: connection pooling, schema bootstrapper, CRUD helpers, and domain-specific query stubs.
- Project documentation: architecture overview, quick start, deployment guidance, and WARP instructions.

### What’s Still Pending
- Persisted authentication: migrate mock users/permissions to PostgreSQL tables and align JWT issuance with stored hashes.
- Real intelligence data pipeline: replace hardcoded module data with queries aggregating metrics from the database.
- CRUD APIs for ministries, projects, opportunities, and analytics; current routes return placeholders only.
- Database seeding and migration workflow to populate schema with representative development data.
- Wired security middleware (audit logging, sanitisation, encryption helpers) across API routes.
- Redis-backed caching/rate limiting as outlined in architecture (currently only planned in docker-compose).
- Frontend experiences beyond the minister dashboard (entrepreneur portal, institutional memory) lack live data.
- Automated testing (backend integration, frontend components) and CI configuration are not yet in place.
- Observability: structured logging, metrics, and alerting not implemented beyond console output.

## Build Backlog

### 1. Authentication & Authorisation
1. Persist users and permissions in PostgreSQL (`users`, `user_permissions`, `ministries`).
2. Update `/api/auth/login` to query the database, verify bcrypt hashes, and issue tokens with DB-backed claims.
3. Implement refresh token rotation or session revocation strategy (blacklist table or token versioning).
4. Extend `AuthProvider` to consume refreshed tokens and surface permission-aware helpers to the UI.

### 2. Intelligence Modules & Analytics
1. Seed performance, budget, and project datasets aligning with schema views (e.g., `ministry_performance`).
2. Replace mocked intelligence payloads with service layer that joins the requisite tables and returns typed responses.
3. Implement insight lifecycle endpoints (create, update status, audit trail) storing data in `insights` and related tables.
4. Add frontend polling/error states and highlight ministry-specific deltas sourced from live data.

### 3. Project & Opportunity Management APIs
1. Implement `/api/projects` CRUD with pagination, filtering by ministry, and risk scoring derived from DB metrics.
2. Implement `/api/opportunities` endpoints returning investment opportunities, incentives, and user actions (express interest).
3. Flesh out `/api/ministries` to deliver ministry metadata, leadership contacts, and KPIs.
4. Build `/api/analytics` to expose aggregate dashboards (trend lines, comparative analytics) leveraging database views.

### 4. Search & Discovery Enhancements
1. Ingest real records into FlexSearch indexes from database on startup and maintain freshness via change events.
2. Implement semantic enrichment pipeline (e.g., embeddings via Vertex/Gemini) and fallback to keyword when unavailable.
3. Build advanced filters in both API and frontend (date ranges, sectors, risk levels) wired to real metadata.
4. Expose search history endpoint and UI, leveraging the logged queries for personalised suggestions.

### 5. Security & Compliance
1. Integrate `middleware/security.js` (sanitisation, audit logging, encryption) into Express routes.
2. Implement per-user rate limiting and suspicious activity detection rules with Redis.
3. Encrypt sensitive records at rest (projects with personal data, audit logs) using provided helpers.
4. Add structured security logging and centralise alerts for failed logins, privilege escalations, and data exports.

### 6. Frontend Experience Expansion
1. Connect entrepreneur and institutional memory components to live APIs; replace static placeholders with fetched data.
2. Implement tab-based routing (Next.js nested routes) for opportunities, projects, ministries, and analytics pages.
3. Add reusable data visualisations (Recharts) for modules such as budget execution, project timelines, and ROI curves.
4. Improve AI assistant integration (context chips, citations linking to data views, conversation persistence).

### 7. Data Operations & Tooling
1. Establish migration strategy (Prisma, Knex, or plain SQL) and scripts for applying schema changes.
2. Create seed scripts aligning with demo narratives (ministries, projects, opportunities, economic indicators).
3. Implement background jobs for data refresh (economic indicators, project updates) and schedule via worker process.
4. Document data onboarding workflow and add validation scripts for incoming CSV/API feeds.

### 8. Quality, Testing & Observability
1. Introduce Jest (backend) and Playwright/React Testing Library (frontend) with baseline coverage.
2. Configure lint/type-check gating in CI along with automated test execution.
3. Add health, readiness, and metrics endpoints; integrate with logging framework (e.g., pino) for structured logs.
4. Set up monitoring dashboards (Grafana or alternative) and alerting thresholds for API latency/errors.

### 9. Deployment & Ops Readiness
1. Finalise Docker workflow (multi-stage builds, production-ready commands) and validate docker-compose stack.
2. Provision production-ready environment variables management and secret rotation strategy.
3. Define deployment pipelines (GitHub Actions/Azure DevOps) covering build, test, deploy, and smoke tests.
4. Create runbooks for incident response, backup/restore procedures, and access control audits.

---

This plan captures the current gaps and the tasks required to move from the mock-driven prototype to a production-ready Rwanda Government Intelligence Platform. Update and reprioritise as implementation progresses.
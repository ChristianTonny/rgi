# Rwanda Government Intelligence Platform – Architecture Blueprint

## Vision & Objectives
- Deliver a secure, real-time decision intelligence workspace for Rwanda’s government leadership and partners.
- Replace mock data with live datasets quickly so ministers can validate workflows using authentic insights.
- Provide tightly coupled modules (dashboard, intelligence, opportunities, projects, ministries) that share a single source of truth and AI guidance.

## Personas & Access Model
- **Ministers** – see government-wide metrics plus deep dives for their ministry.
- **Policy directors & analysts** – investigate institutional memory, analytics, and policy impacts.
- **Programme managers** – update project progress, risks, and beneficiary reach.
- **Entrepreneurs & investors** – discover opportunities and express interest.
- Authentication and role management run through **Clerk**, while Convex functions enforce ministry-scoped visibility and RBAC checks.

## Data Sources & Acquisition Strategy
- **NISR Microdata Portal (primary)** – manual download; requires login and research description. Store raw files under `data/raw-source-files/` for ingestion.
- **Ministry budget data (planned API)** – future integration for near real-time fiscal updates.
- **Project status updates (manual input initially)** – captured via project management workflows and persisted in Convex.
- Additional sources can be appended as they are approved; keep the raw data directory tidy for reproducibility.

## Platform Architecture Overview
```text
                         ┌────────────────────────────┐
                         │        Vercel Hosting       │
                         │ (Next.js + Edge Functions)  │
                         └──────────────▲──────────────┘
                                        │ client hooks (useQuery, useMutation)
┌──────────────────────┐    real-time   │
│  Next.js App Router  │◀───────────────┤
│  Tailwind + Radix UI │───────────────▶│
│  Clerk Auth Widgets  │                │
└──────────┬───────────┘                │
           │ useChat (Vercel AI SDK)    │
           ▼                            │
┌──────────────────────┐         ┌──────┴──────────────────────┐
│  Vercel AI SDK       │────────▶│   Convex Backend Platform   │
│  (Gemini/OpenAI)     │ citations│   Realtime DB + Functions  │
└──────────┬───────────┘         └──────┬──────────────┬───────┘
           │                             │ scheduled    │ ingestion jobs / cron
           │                             │ functions    │
           │                             ▼              ▼
           │                     ┌────────────────────────────────┐
           │                     │  NISR Downloads (CSV/Excel)    │
           │                     │  Ministry Budget API (future)  │
           │                     │  Manual Project Updates        │
           │                     └────────────────────────────────┘
           ▼                             ▲              ▲
  Conversation storage           Normalised Convex collections power dashboards,
  in Convex `conversations`       intelligence modules, AI prompts, and audits.
```

## Core Components
### Next.js Frontend
- App Router structure with module-specific layouts and responsive Tailwind/Radix UI components.
- **95%** of data interactions use Convex `useQuery`/`useMutation` hooks for instant updates; **5%** apply `preloadQuery` for faster first paint.
- Client-side focus preserves Convex’s reactive model; server actions are reserved for bulk imports, file processing, or heavy analytics jobs.

### Convex Backend
- Central source of truth for budgets, projects, opportunities, ministries, institutional memory, conversations, and activity logs.
- Provides realtime queries, durable mutations, scheduled jobs, and ingestion pipelines.
- Enforces role-based access by checking Clerk session metadata (role + ministry) on each call and filtering records accordingly.

### Vercel AI SDK Integration
- `useChat` powers the AI assistant with conversation history persisted in Convex.
- Responses cite Convex record IDs so users can trace insights back to data sources.
- Future roadmap includes RAG pipelines and inline AI suggestions across modules.

### Authentication & Authorization
- Clerk manages sign-in, session tokens, and role metadata (minister, policy director, programme manager, entrepreneur).
- Convex validates roles/scopes before returning data, guaranteeing ministry-level isolation and ensuring entrepreneurs only see public opportunity data.

### Hosting & Deployment
- Next.js app deployed on Vercel (edge-friendly, integrates with Vercel AI SDK).
- Convex cloud hosts backend functions and realtime database.
- Local development uses `npx convex dev` alongside `npm run dev`.

## Data Flow & Real-time Strategy
1. User authenticates via Clerk; role/ministry metadata is attached to Convex requests.
2. Frontend components issue `useQuery` calls for live budgets, projects, opportunities, and institutional insights.
3. Convex functions hydrate responses, pulling from collections populated by manual uploads or future APIs.
4. AI assistant composes prompts with Convex data and returns citations; conversations are stored for auditing.
5. Mutations (e.g., project updates) instantly propagate to all subscribers, keeping every tab in sync.

## Mock-to-Real Data Transition (Priority)
1. Stand up Convex schema mirroring current mock structures and migrate UI hooks to use Convex queries/mutations.
2. Build light ingestion tools to load NISR downloads (manual CSV upload) and seed ministry budgets/projects.
3. Replace all mock arrays with Convex-backed calls module-by-module, validating each flow with real stakeholders.
4. Establish admin workflows for manual project status entry until APIs are available.

## Security & Observability
- Role-based data filtering, ministry scoping, and audit logging handled inside Convex.
- Sensitive source files stored offline; only curated metrics ingested.
- Logging/metrics roadmap: Convex function logs + Vercel analytics, expanding to central observability in later phases.

## Development Workflow
1. Install dependencies and Convex CLI (`npm install`, `npx convex dev`).
2. Create `data/raw-source-files/` and store downloaded NISR datasets for ingestion.
3. Run Next.js dev server (`npm run dev`) and iterate on modules with live Convex data.
4. Deploy frontend to Vercel and backend to Convex for preview environments and stakeholder demos.
5. Track outstanding technical work in `docs/task-backlog.md` and module-specific review docs.

## Reference Docs
- UI/module reviews: `docs/*-review.md` (dashboard, intelligence, opportunities, projects, ministries, additional tabs).
- Strategic alignment & user journeys: `docs/user-journey-alignment.md`.
- Task backlog & tech stack to-do: `docs/task-backlog.md`.

This blueprint anchors the platform on Convex + Next.js + Vercel AI SDK with Clerk auth, emphasising real data adoption and cross-module interoperability.

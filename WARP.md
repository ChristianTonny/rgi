# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Quick Start Commands

### Development Environment
```powershell
# Initial setup (Windows)
.\setup.ps1

# Install dependencies
npm install

# Start both frontend and backend
npm run dev:full

# Start services individually  
npm run dev          # Frontend only (Next.js)
npm run server:dev   # Backend only (Express.js)

# Database with Docker
docker-compose up -d

# Type checking
npm run type-check
```

### Build and Deploy
```powershell
# Production build
npm run build

# Start production server
npm start

# Database operations
createdb rwanda_gov_intelligence  # Create database manually

# Docker deployment
docker build -t rwanda-gov-intelligence .
docker run -d -p 3000:3000 -p 3001:3001 --env-file .env rwanda-gov-intelligence
```

### Testing and Quality
```powershell
# Linting
npm run lint

# Server health check
curl http://localhost:3001/health
```

## Architecture Overview

This is a **government intelligence platform** combining Next.js frontend with Express.js backend and PostgreSQL database:

```
Frontend (Next.js 15) ←→ Backend (Express.js) ←→ PostgreSQL Database
        ↓                        ↓
   React Components     JWT Auth + RBAC + Gemini AI
```

### Key Architectural Patterns

**Frontend Architecture:**
- Next.js 15 with App Router (`src/app/`)
- TypeScript with strict configuration
- Auth context provider wrapping the entire app
- Role-based component rendering (Ministers vs Entrepreneurs vs Policy Directors)
- Radix UI components with Tailwind CSS styling

**Backend Architecture:**
- Express.js server with modular route structure (`server/routes/`)
- JWT-based authentication with role-based access control (RBAC)
- Database connection pooling with automatic schema initialization
- AI integration using Google's Gemini AI with role-specific prompts
- Comprehensive security middleware (Helmet, rate limiting, CORS)

**Database Design:**
- Complex relational schema for government data (`server/database/schema.sql`)
- Comprehensive audit logging for all user actions
- Performance views for common government queries (`ministry_performance`, `project_risk_summary`)
- Full-text search capabilities with FlexSearch integration

## Core System Components

### Authentication & Authorization
- **JWT tokens** with 8-hour expiration
- **Role hierarchy:** MINISTER > PERMANENT_SECRETARY > POLICY_DIRECTOR > DEVELOPMENT_COORDINATOR
- **Ministry-level data isolation** - users only see their ministry's data unless they have cross-ministry permissions
- **Demo users:** minister@gov.rw / password123, ps@gov.rw / password123

### Intelligence Modules System
Located in `server/routes/intelligence.js`:
- **Resource Allocation Intelligence** - Budget efficiency and spending analysis
- **Opportunity Radar** - Investment opportunities and market intelligence  
- **Performance Monitor** - Project risk assessment and timeline tracking

Each module provides:
- Real-time data aggregation
- AI-generated insights with confidence scores
- Role-specific data filtering
- Actionable recommendations

### AI Assistant Integration
The Gemini AI assistant (`server/routes/ai.js`):
- **Role-aware prompting** - Different conversation styles for Ministers vs Entrepreneurs
- **Government context injection** - Pre-loaded with Rwanda-specific data context
- **Ministry-specific responses** - Tailored answers based on user's ministry
- **Conversation history tracking** - Maintains context across sessions
- **Fallback responses** when AI is unavailable

### Data Architecture
The system manages multiple interconnected data domains:
- **Government structure** (ministries, departments, users)
- **Project management** (projects, outcomes, updates, risk tracking)
- **Economic intelligence** (indicators, performance metrics)
- **Investment opportunities** (sector analysis, risk assessment)
- **Institutional memory** (policy decisions, historical patterns)
- **AI conversations** and **search queries** with full audit trails

## Development Patterns

### Database Operations
Use the `db` helper from `server/database/connection.js`:
```javascript
// CRUD operations
const project = await db.findById('projects', projectId);
const projects = await db.findAll('projects', 'WHERE ministry_id = $1', [ministryId]);
const newProject = await db.create('projects', projectData);

// Government-specific operations
const performance = await db.getMinistryPerformance();
const risks = await db.getProjectRiskSummary();
const indicators = await db.getEconomicIndicators('GDP');
```

### Authentication in Routes
```javascript
const { authenticateToken } = require('./auth');

router.get('/protected-route', authenticateToken, (req, res) => {
  const user = req.user; // { userId, email, role, ministry }
  // Role-based logic here
});
```

### Frontend Type Safety
Types are centralized in `src/types/index.ts`:
- `User`, `UserRole`, `Permission` for authentication
- `IntelligenceModule`, `Insight` for dashboard data
- `Project`, `Ministry`, `PerformanceMetric` for government data
- `AIConversation`, `AIMessage` for AI interactions

### Role-Based UI Patterns
```typescript
// Component example
const { user } = useAuth();

if (user?.role === 'MINISTER') {
  // Show high-level strategic dashboard
} else if (user?.role === 'ENTREPRENEUR') {
  // Show investment opportunities
}
```

## Environment Configuration

Required environment variables:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/rwanda_gov_intelligence

# Authentication
JWT_SECRET=your-secure-jwt-secret-minimum-32-characters

# AI Integration  
GOOGLE_AI_API_KEY=your-google-gemini-api-key

# Server
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## Common Development Workflows

### Adding New Intelligence Module
1. Add module data structure to `server/routes/intelligence.js`
2. Create corresponding TypeScript types in `src/types/index.ts`
3. Build UI components with role-based filtering
4. Add AI context for the new data domain

### Adding New User Role
1. Update `UserRole` type in `src/types/index.ts`
2. Add role to database schema `users` table check constraint
3. Update authentication middleware for role-specific permissions
4. Add role-specific AI prompts in `server/routes/ai.js`
5. Implement UI components for the new role

### Database Schema Changes
1. Modify `server/database/schema.sql`
2. Database will auto-initialize on server restart
3. For production: create migration scripts and run manually

### Security Considerations
- All API endpoints require JWT authentication
- Rate limiting on authentication (5 attempts per 15 minutes)
- Input sanitization and SQL injection protection via parameterized queries
- Comprehensive audit logging for all user actions
- Ministry-level data isolation enforced at database query level

## Services Integration

### Docker Services
The `docker-compose.yml` includes:
- **App container** - Runs both Next.js and Express.js
- **PostgreSQL 16** - Primary database
- **Redis** - Caching and rate limiting
- **pgAdmin** - Database administration at localhost:8080

### External APIs
- **Google Gemini AI** - For intelligent analysis and chat responses
- **FlexSearch** - Full-text search across government documents
- Future integrations planned for Rwanda statistical data sources

## Troubleshooting

### Common Issues
- **Database connection errors:** Ensure PostgreSQL is running and `.env` credentials are correct
- **AI responses failing:** Check `GOOGLE_AI_API_KEY` is valid and has sufficient quota
- **Build errors:** Run `npm run type-check` to identify TypeScript issues
- **Authentication issues:** Verify JWT secret consistency between sessions

### Development Tools
- **Health check:** `GET /health` endpoint shows server status
- **Database logs:** Connection pool logs slow queries (>100ms)
- **AI fallback:** System provides helpful fallback when Gemini is unavailable
- **Audit trail:** All user actions logged to `audit_logs` table
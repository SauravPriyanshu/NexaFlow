# NexaFlow

> AI-Powered Collaborative Project Management Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-nexaflow.vercel.app-06b6d4?style=flat-square)](https://nexaflow.vercel.app)
[![API Docs](https://img.shields.io/badge/API%20Docs-Swagger-85ea2d?style=flat-square)](https://nexaflow-api.onrender.com/api/docs)
[![Tests](https://img.shields.io/github/actions/workflow/status/SauravPriyanshu/NexaFlow/ci.yml?label=tests&style=flat-square)](https://github.com/SauravPriyanshu/NexaFlow/actions)
[![Node](https://img.shields.io/badge/Node-20-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)

NexaFlow is a full-stack SaaS platform combining task management, real-time collaboration,
AI-assisted documentation, and analytics into a single unified workspace.
Built to demonstrate production-grade SDE skills for placement interviews.

---

## Live URLs

| Service | URL |
|---------|-----|
| Frontend | https://nexaflow.vercel.app |
| Backend API | https://nexaflow-api.onrender.com |
| API Documentation | https://nexaflow-api.onrender.com/api/docs |
| Health Check | https://nexaflow-api.onrender.com/api/health |

**Demo credentials:**

- Email: `demo@nexaflow.dev`
- Password: `Demo123!`

---

## Features

**Core modules**
- 🔐 **Auth** — JWT + refresh token rotation, email verification, Google OAuth
- 🏢 **Organizations** — multi-org support, 5-tier RBAC
- 📋 **Kanban** — drag-and-drop with optimistic updates + real-time multi-user sync
- 💬 **Chat** — Socket.io rooms, typing indicators, read receipts, DMs
- 📁 **Files** — Cloudinary streaming upload, image preview, task attachments
- 💬 **Comments** — nested replies, @mentions, real-time sync
- 🔔 **Notifications** — 8 event types, real-time delivery, email notifications
- 🔍 **Search** — global full-text search across 4 collections in parallel

**Intelligence + Performance**
- 🤖 **AI Assistant** — 6 strategies (summarize, generate docs, explain code, convert to tasks)
- 📊 **Analytics** — 5 Chart.js visualizations backed by MongoDB aggregation pipelines
- ⚡ **Redis caching** — cache-aside pattern, TTL-based, explicit invalidation
- 🔄 **Rate limiting** — Redis INCR atomic, per-user AI quota

**Production**
- 🐳 **Docker** — multi-stage build, nginx for frontend
- ✅ **Tests** — Jest unit + Supertest integration, 85%+ coverage
- 📖 **Swagger** — full OpenAPI 3.0 docs at /api/docs
- 🚀 **CI/CD** — GitHub Actions → Render + Vercel

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Chart.js, Socket.io-client |
| Backend | Node.js 20, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Cache | Redis (ioredis), @socket.io/redis-adapter |
| Auth | JWT (access 15min + refresh 7d httpOnly cookie) |
| Real-time | Socket.io with room-based isolation |
| Storage | Cloudinary (streaming, no disk) |
| AI | Groq API, Strategy pattern |
| Testing | Jest, Supertest, mongodb-memory-server |
| Deployment | Vercel (frontend), Render (backend), GitHub Actions |

---

## Architecture

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for:
- High-level system diagram
- Database schema (9 collections)
- Socket.io room strategy
- Redis caching strategy
- Auth flow (JWT refresh rotation)

---

## Local Setup

**Prerequisites:** Node 20+, MongoDB (local or Atlas), Redis

```bash
# 1. Clone
git clone https://github.com/SauravPriyanshu/NexaFlow.git
cd NexaFlow

# 2. Backend
cd backend
cp .env.example .env
# Fill in MONGODB_URI, JWT secrets, Cloudinary, Groq, SMTP
npm install
npm run dev

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api
# VITE_SOCKET_URL=http://localhost:5000
npm install
npm run dev
```

App runs at: http://localhost:5173
API runs at: http://localhost:5000
API docs at: http://localhost:5000/api/docs

**Docker (alternative):**
```bash
cp .env.example .env  # fill in values
docker-compose up --build
```

---

## Design Decisions

**Why JWT + refresh token rotation instead of sessions?**  
Stateless tokens work across multiple server instances without shared session storage.  
Refresh token rotation means stolen tokens are detected on next legitimate use.

**Why Redis for caching and rate limiting?**  
Redis INCR is atomic — no race conditions for rate limiting. Cache-aside pattern  
means Redis down = app falls back to MongoDB gracefully.

**Why Strategy pattern for AI?**  
Adding a new AI feature = one new class, one map entry. Zero changes to existing code.  
Directly demonstrates Open/Closed Principle.

**Why MongoDB $text indexes with weights?**  
Title matches rank 10x higher than description matches. One compound index per  
collection covers all searchable fields (MongoDB limit: one text index per collection).

---

## API Documentation

Full Swagger docs at `/api/docs`. Quick reference:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register + email verification |
| POST | /api/auth/login | Login → accessToken + httpOnly cookie |
| POST | /api/auth/refresh | Rotate refresh token |
| GET | /api/orgs | Get my organizations |
| GET | /api/projects/org/:orgId | Get org's projects |
| GET | /api/tasks/project/:projectId | Get tasks grouped by status |
| POST | /api/tasks | Create task |
| PATCH | /api/tasks/:id/status | Update task status (Kanban drop) |
| POST | /api/chat/messages | Send message |
| POST | /api/ai | Run AI operation |
| GET | /api/search/:orgId?q= | Global search |
| GET | /api/analytics/org/:orgId/overview | Dashboard stats |

---

## Testing

```bash
cd backend
npm test              # all tests
npm run test:unit     # unit tests only
npm run test:integration  # integration tests only
```

Coverage report generated in `backend/coverage/`.

---

## Project Structure

```text
nexaflow/
├── backend/
│   ├── src/
│   │   ├── modules/          # feature-based (auth, task, chat, ai...)
│   │   ├── shared/
│   │   │   ├── middleware/   # authenticate, checkPermission, errorHandler
│   │   │   ├── utils/        # ApiError, ApiResponse, cache, eventBus
│   │   │   └── socket/       # Socket.io room management
│   │   ├── config/           # db, redis, cloudinary, groq, swagger
│   │   └── app.js / server.js
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/          # Auth, Socket, Notification, Search, AI...
│   │   ├── hooks/
│   │   ├── services/         # all API calls
│   │   └── utils/
│   └── Dockerfile
├── docs/
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
├── .github/workflows/
│   └── ci.yml
└── docker-compose.yml
```

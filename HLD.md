# High-Level Design (HLD) — Daily Scheduler

## 1. Architecture Overview

The application follows a client-server architecture with polyglot persistence
(two databases, each used for what it's best at).

```
┌─────────────┐        HTTPS/JSON        ┌──────────────────┐
│   React     │ ───────────────────────► │   Express API     │
│  (Vercel)   │ ◄─────────────────────── │   (Render)         │
└─────────────┘                          └───────┬───────────┘
                                                  │
                        ┌─────────────────────────┼─────────────────────┐
                        ▼                         ▼                     ▼
                ┌───────────────┐        ┌────────────────┐   ┌──────────────────┐
                │  MongoDB Atlas │        │ PostgreSQL(Neon)│   │  Anthropic API    │
                │ users, tasks   │        │ categories,     │   │  (AI suggestions) │
                │                │        │ task_categories │   │                    │
                └───────────────┘        └────────────────┘   └──────────────────┘
```

## 2. Components

### 2.1 Frontend (React, Vite)
- `AuthContext` — holds current logged-in user, exposes login/logout.
- `PrivateRoute` — route guard, redirects to `/login` if not authenticated.
- `api/axios.js` — centralized HTTP client; attaches JWT to every request via
  an interceptor.
- Pages: `Login`, `Signup`, `Dashboard`.

### 2.2 Backend (Express)
- `authRoutes` — signup/login, issues JWTs.
- `taskRoutes` — CRUD for tasks, all routes protected by `authMiddleware`.
- `categoryRoutes` — CRUD/JOIN queries against PostgreSQL.
- `aiRoutes` — builds a prompt from the user's tasks, calls the Anthropic API,
  returns structured JSON.
- `authMiddleware` — verifies JWT on protected routes, attaches `req.user`.

### 2.3 Data Layer
- **MongoDB** — flexible document store for `users` and `tasks`. Chosen
  because task shape is simple and user-scoped, no complex joins needed here.
- **PostgreSQL** — relational store for `categories` and the
  `task_categories` join table, chosen specifically because category
  assignment is a many-to-many relationship best modeled relationally with
  foreign key constraints.

### 2.4 External Service
- **Anthropic Claude API** — receives the user's open tasks, returns a
  prioritized, structured suggestion list.

## 3. Request Flow (example: fetching tasks)
1. Browser calls `GET /api/tasks` with `Authorization: Bearer <token>`.
2. `authMiddleware` verifies the token, extracts `user` id.
3. `taskRoutes` queries MongoDB filtered by `{ user: req.user }`.
4. Response returned as JSON, rendered by the `Dashboard` component.

## 4. Security
- Passwords hashed with bcrypt before storage.
- JWT-based stateless authentication; tokens expire after 7 days.
- All task/category queries scoped to the authenticated user's ID —
  authorization enforced at the query level, not just route level.
- Environment variables (DB URIs, JWT secret, API keys) never committed to
  source control.
- Parameterized SQL queries used throughout to prevent SQL injection.

## 5. Deployment
- Frontend deployed on Vercel, built with `vite build`, SPA routing handled
  via a rewrite rule to `index.html`.
- Backend deployed on Render as a Node web service.
- MongoDB hosted on Atlas; PostgreSQL hosted on Neon — both cloud-managed,
  no self-hosted database infrastructure.

## 6. Scalability Considerations (future)
- Add caching (e.g. Redis) for category lookups if traffic grows.
- Move to a session/token refresh strategy for longer-lived sessions.
- Add rate limiting on auth and AI endpoints to control cost/abuse.
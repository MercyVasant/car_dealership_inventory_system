# Car Dealership Inventory System — Implementation Plan

**goal:** version 1 | **date_created:** 2026-07-21 | **last_updated:** 2026-07-21  
**owner:** Candidate (job-assignment submission) | **status:** Planned  
**tags:** architecture · full-stack · node · express · postgresql · react · security · tdd · deployment

---

## Introduction

This plan describes how to deliver the Car Dealership Inventory System kata to a senior-engineer standard. It is a full-stack, single-page application backed by a RESTful API with token-based auth, role-based access control, inventory concurrency safety, high test coverage driven by TDD (Red → Green → Refactor), transparent AI co-authorship, and a live deployment.

> [!CAUTION]
> **TDD Violation & Restart Required**
> A strict review of the commit history has revealed that the TDD process was heavily violated starting from Phase 2:
> 1. **Fake TDD Commits:** Early RED/GREEN commits (e.g., `7ac8b75` to `71ffbb8`) simply created empty files to fake the TDD history.
> 2. **Mocking the Database:** In commit `dfabea1`, the repository tests were implemented using `jest.mock()` to mock Sequelize. This violates **TASK-008**, which explicitly requires using a real test database (like `testcontainers-node` or `pg-mem`) to test constraints, indexes, and persistence.
> 3. **Missing RED Tests:** The real models (`User`, `Vehicle`, etc.) and migrations were eventually added in `feat` commits (`b85d6af` onwards) without any preceding failing tests.
> 4. **Broken `seed.js`:** The seed script uses `sequelize.sync({ force: true })` (dropping tables and ignoring the migrations added in `7c74ef1`), and it incorrectly imports models from `src/models/` instead of `src/features/`.
> 
> **Recommendation:** To strictly adhere to TDD without problems at the end, you should delete all commits after Phase 1 and restart Phase 2 properly. 
> 
> Run: `git reset --hard 6074be9`
> 
> Commit `6074be9` (`chore: Configure ESLint, Prettier, and Jest coverage gates`) is the clean state at the end of Phase 1.

The plan is location-agnostic: it assumes the project lives in its own fresh public Git repository organized as a monorepo:


```
car-dealership/
  car-dealership-api/     # Node.js 20 + Express + PostgreSQL (Sequelize) backend
  car-dealership-web/     # React 18 + Vite frontend
  docker-compose.yml      # PostgreSQL + api + web for local dev
  .github/workflows/      # CI pipelines
  README.md               # includes mandatory "My AI Usage" section
```

**Guiding principle:** every non-trivial line of production code is preceded by a failing test. The commit history itself is a deliverable and must narrate the Red-Green-Refactor journey.

---

## 1. Requirements & Constraints

### Functional Requirements

- **REQ-001:** Auth endpoints — `POST /api/auth/register`, `POST /api/auth/login` returning a signed JWT.
- **REQ-002:** Vehicle CRUD (protected) — `POST /api/vehicles`, `GET /api/vehicles` (paginated), `PUT /api/vehicles/:id`, `DELETE /api/vehicles/:id` (Admin only).
- **REQ-003:** Search — `GET /api/vehicles/search` filtering by make, model, category, and minPrice/maxPrice range, with pagination + sorting.
- **REQ-004:** Inventory — `POST /api/vehicles/:id/purchase` (decrement quantity, block at zero), `POST /api/vehicles/:id/restock` (increment, Admin only).
- **REQ-005:** Vehicle record fields — unique `id` (UUID / serial PK), `make`, `model`, `category`, `price` (non-negative), `quantityInStock` (non-negative integer).
- **REQ-006:** Two roles — USER (browse, search, purchase) and ADMIN (all USER rights + create/update/delete/restock).
- **REQ-007:** Frontend SPA — register/login forms, dashboard listing vehicles, search & filter UI, disabled Purchase button when `quantityInStock == 0`, Admin-only add/update/delete UI.

### Security Requirements (OWASP Top 10 aligned)

- **SEC-001:** Passwords hashed with bcrypt (cost factor ≥ 10); never stored or logged in plaintext (A02 Cryptographic Failures).
- **SEC-002:** Stateless JWT auth (HS256) with short-lived access tokens (15 min) + rotating refresh tokens; signing secret injected via environment variable, never committed (A07 Identification & Auth Failures).
- **SEC-003:** Route-level authorization via an `authorize(role)` Express middleware; DELETE/restock restricted to ADMIN (A01 Broken Access Control). Verify server-side — never trust the client role.
- **SEC-004:** All inputs validated with express-validator (or Zod); reject unknown/oversized payloads (A03 Injection, A04 Insecure Design).
- **SEC-005:** SQL injection prevented via Sequelize parameterized queries and ORM-typed inputs; never building queries from raw unsanitized user input (A03).
- **SEC-006:** CORS locked to the known frontend origin(s) via the cors package; no wildcard with credentials.
- **SEC-007:** Secure HTTP headers (CSP, X-Content-Type-Options, HSTS in prod, frame-options) via helmet.
- **SEC-008:** Rate limiting / brute-force protection on `/api/auth/**` (e.g., express-rate-limit or rate-limiter-flexible).
- **SEC-009:** Standardized error responses that never leak stack traces, queries, or internal paths (A05 Security Misconfiguration).
- **SEC-010:** Dependency vulnerability scanning (npm audit, GitHub Dependabot/Snyk) in CI (A06 Vulnerable Components).
- **SEC-011:** Frontend stores the access token in memory (not localStorage) with refresh via an httpOnly cookie where feasible, to reduce XSS token theft (A03/A07).
- **SEC-012:** Secrets managed via `.env`/platform secret stores; `.env` git-ignored; `.env.example` committed.

### Performance & Reliability Requirements

- **PERF-001:** List and search endpoints paginated (default size 20, max 100) to bound payloads and DB load.
- **PERF-002:** PostgreSQL indexes on `vehicles.make`, `vehicles.model`, `vehicles.category`, `vehicles.price`, `vehicles.is_deleted`, and `users.username` (composite/partial indexes where useful for search).
- **PERF-003:** Sequelize connection pooling tuned (`pool.max`, `pool.min`, `pool.acquire`, `pool.idle`); raw queries or `.findAll({ attributes: [...] })` used on read-only queries to minimize data transfer; N+1 query patterns avoided.
- **PERF-004:** Optimistic-concurrency control on Vehicle using PostgreSQL row-level locking (`SELECT … FOR UPDATE`) or a `version` integer column checked on update to keep purchase/restock correct under concurrency without long-held locks.

### Quality & Usability Requirements

- **QUA-001:** Backend line coverage ≥ 85% (Jest coverage gate); meaningful assertions, not vanity coverage.
- **QUA-002:** Frontend coverage ≥ 80% (Vitest + React Testing Library) for components, hooks, and API layer.
- **QUA-003:** Static analysis + formatting enforced in CI (ESLint + Prettier on both backend and frontend).
- **USE-001:** Responsive, accessible UI (WCAG 2.1 AA: semantic HTML, ARIA where needed, keyboard nav, color contrast).
- **USE-002:** Clear loading, empty, error, and success states; non-blocking toast notifications.

### Constraints

- **CON-001:** Backend = Node.js 20 + Express 4/5 (JavaScript, TypeScript optional but recommended); Frontend = React 18 + Vite.
- **CON-002:** Database = PostgreSQL 16 (persistent; in-memory DB is explicitly disallowed by the brief for the running app). A transient PostgreSQL Docker container or `pg-mem` / `testcontainers-node` used only for tests.
- **CON-003:** All AI-assisted commits MUST include a `Co-authored-by:` trailer; README MUST contain a "My AI Usage" section.
- **CON-004:** No plagiarized code; all third-party usage must be license-compatible and attributed.

### Guidelines & Patterns

- **GUD-001:** Conventional Commits (`feat:`, `test:`, `fix:`, `refactor:`, `docs:`, `chore:`) narrating the TDD journey.
- **GUD-002:** SOLID-inspired structure, small cohesive modules, dependency injection via constructor/factory functions (no hidden singletons where avoidable).
- **GUD-003:** Commit at each TDD transition: a `test:` commit (Red), then a `feat:`/`fix:` commit (Green), then an optional `refactor:` commit.
- **PAT-001:** Layered architecture — Route → Controller → Service → Repository (Sequelize Model) → Row; DTOs/validation schemas at the boundary.
- **PAT-002:** Centralized Express error-handling middleware producing RFC-7807-style problem responses.
- **PAT-003:** Feature-based folder structure on both backend (`src/features/<feature>/`) and frontend (`src/features/<feature>/`).

---

## 2. Implementation Steps

### Implementation Phase 1 — Repository, Tooling & CI Foundation

**GOAL-001:** Establish the monorepo, both app skeletons, containerized PostgreSQL, quality gates, and the AI co-authorship workflow so every later phase is TDD- and CI-ready.

| Task | Description | Completed | Date |
|---|---|---|---|
| TASK-001 | Initialize public Git repo with monorepo layout (`car-dealership-api/`, `car-dealership-web/`), root `README.md`, `.gitignore`, `.editorconfig`, `LICENSE`. | | |
| TASK-002 | Scaffold Express app in `car-dealership-api/` (`npm init`, express, sequelize, pg, pg-hstore, dotenv, helmet, cors, jsonwebtoken, bcrypt). | | |
| TASK-003 | Scaffold React 18 + Vite app in `car-dealership-web/`; add React Router, Axios, Vitest, React Testing Library, MSW, ESLint, Prettier. | | |
| TASK-004 | Author `docker-compose.yml` with `postgres:16` (named volume), api, and web services; add `.env.example` and git-ignored `.env`. | | |
| TASK-005 | Configure quality tooling: ESLint + Prettier (backend and frontend), Jest + `jest --coverage` (backend), `vitest --coverage` (frontend). | | |
| TASK-006 | Add GitHub Actions workflows `.github/workflows/backend-ci.yml` and `frontend-ci.yml` (build, test, coverage, dependency scan) on PR + main. | | |
| TASK-007 | Configure Conventional Commits; document the `Co-authored-by:` trailer convention in `CONTRIBUTING.md`; add a commit-msg template. | | |

---

### Implementation Phase 2 — Domain Model & Database Schema (TDD: repository layer)

> [!IMPORTANT]
> **This phase is updated** from the original plan to use the improved 4-table database design with **PostgreSQL 16** and **Sequelize ORM**. All other phases are unchanged.

**GOAL-002:** Model the domain across four Sequelize models (`User`, `RefreshToken`, `Vehicle`, `Transaction`), prove persistence with repository tests against a dedicated test PostgreSQL instance (via `testcontainers-node` or `pg-mem`), and enforce all indexes, constraints, and validators.

#### Database Schema

**`users` table**
```sql
CREATE TABLE users (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  username      VARCHAR(50)   NOT NULL UNIQUE,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,          -- never returned in responses
  role          VARCHAR(10)   NOT NULL DEFAULT 'USER'
                              CHECK (role IN ('USER', 'ADMIN')),
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,  -- soft-disable without deletion
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
-- Indexes: username (unique), email (unique)
```

**`refresh_tokens` table**
```sql
CREATE TABLE refresh_tokens (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) NOT NULL UNIQUE,  -- SHA-256 hash of the raw token (never store raw)
  is_revoked  BOOLEAN      NOT NULL DEFAULT FALSE,
  expires_at  TIMESTAMPTZ  NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
-- Indexes: token_hash (unique), user_id, expires_at
-- Expired rows cleaned up by a scheduled job or on-read filter (no native TTL in PostgreSQL)
```

**`vehicles` table**
```sql
CREATE TABLE vehicles (
  id                UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  make              VARCHAR(100)   NOT NULL,
  model             VARCHAR(100)   NOT NULL,
  category          VARCHAR(100)   NOT NULL,
  price             NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  quantity_in_stock INTEGER        NOT NULL DEFAULT 0 CHECK (quantity_in_stock >= 0),
  image_url         TEXT,                          -- optional, display image on frontend
  is_deleted        BOOLEAN        NOT NULL DEFAULT FALSE,  -- soft delete, preserves Transaction refs
  version           INTEGER        NOT NULL DEFAULT 0,      -- optimistic concurrency
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);
-- Indexes: make, model, category, price, is_deleted
-- All list/search queries filter WHERE is_deleted = FALSE automatically
```

**`transactions` table**
```sql
CREATE TABLE transactions (
  id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id     UUID           NOT NULL REFERENCES vehicles(id),
  user_id        UUID           NOT NULL REFERENCES users(id),
  type           VARCHAR(10)    NOT NULL CHECK (type IN ('PURCHASE', 'RESTOCK')),
  quantity       INTEGER        NOT NULL CHECK (quantity >= 1),
  price_at_time  NUMERIC(12, 2) NOT NULL,   -- snapshot of vehicle price at moment of transaction
  status         VARCHAR(10)    NOT NULL CHECK (status IN ('SUCCESS', 'FAILED')),
  failure_reason TEXT,                       -- populated when status = 'FAILED'
  created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);
-- Indexes: vehicle_id, user_id, created_at
```

#### Tasks

| Task | Description | Completed | Date |
|---|---|---|---|
| TASK-008 | Write failing repository tests (`UserRepository.test.js`, `VehicleRepository.test.js`, `RefreshTokenRepository.test.js`, `TransactionRepository.test.js`) using a test PostgreSQL instance via `testcontainers-node` or `pg-mem` (persist/find/unique constraints/CHECK constraints). | | |
| TASK-009 | Create `User` Sequelize model (UUID PK, unique `username`/`email`, `password_hash`, `role` ENUM, `is_active`, timestamps) and Role enum (`USER`, `ADMIN`) in `src/features/user/`. | | |
| TASK-010 | Create `RefreshToken` Sequelize model (`user_id` FK, `token_hash`, `is_revoked`, `expires_at`) with index on `expires_at`; implement a cleanup job/middleware to purge expired rows in `src/features/auth/`. | | |
| TASK-011 | Create `Vehicle` Sequelize model (`make`, `model`, `category`, `price` CHECK>=0, `quantity_in_stock` CHECK>=0 integer, `image_url`, `is_deleted` default false, `version`, timestamps) in `src/features/vehicle/`. | | |
| TASK-012 | Create `Transaction` Sequelize model (`vehicle_id` FK, `user_id` FK, `type` ENUM, `quantity`, `price_at_time`, `status` ENUM, `failure_reason`, timestamps) in `src/features/inventory/`. | | |
| TASK-013 | Write and run Sequelize migrations for all four tables (using `sequelize-cli` or `umzug`); define all indexes (PERF-002) and CHECK constraints in migration files; add a seed script for initial data. | | |
| TASK-014 | Implement `UserRepository`, `VehicleRepository`, `RefreshTokenRepository`, `TransactionRepository` wrapping Sequelize Models; make Phase-2 tests green; refactor mappings. | | |

> [!NOTE]
> TASK numbers from 013 onwards in Phase 2 shift by +2 compared to the original plan due to the two new models (RefreshToken + Transaction) each getting their own task. All subsequent phase task numbers are renumbered accordingly below.

---

### Implementation Phase 3 — Authentication & Authorization (TDD)

**GOAL-003:** Deliver secure register/login with JWT issuance, bcrypt hashing, role-based access control, and refresh-token rotation backed by the `refresh_tokens` table — all test-first.

| Task | Description | Completed | Date |
|---|---|---|---|
| TASK-015 | Write failing unit tests for `jwtService` (generate/verify/expiry/tamper-detection) and `authService` (register hashes pw, duplicate rejected, login). | | |
| TASK-016 | Write failing integration tests (Supertest) for `POST /api/auth/register` and `POST /api/auth/login` (201/200, 400 validation, 409 duplicate). | | |
| TASK-017 | Implement `authMiddleware` (verifies JWT, attaches `req.user`), `authorize(role)` middleware, bcrypt password hashing helpers. | | |
| TASK-018 | Implement `jwtService` (HS256, env-injected secret), `authService`, `authController/routes`, request/response schemas (`registerSchema`/`loginSchema`). | | |
| TASK-019 | Add a refresh-token endpoint + rotation using the `refresh_tokens` table (`is_revoked` flag set on logout; new token issued and old one revoked on refresh); make all auth tests green. | | |
| TASK-020 | Add rate limiting on `/api/auth/**` (express-rate-limit) and secure headers/CORS config (helmet, cors); add tests proving 429 on brute force and blocked cross-origin. | | |

---

### Implementation Phase 4 — Vehicle CRUD (Protected, TDD)

**GOAL-004:** Implement create/read/update/delete with validation, DTO mapping, pagination, RBAC, soft delete, and centralized error handling.

| Task | Description | Completed | Date |
|---|---|---|---|
| TASK-021 | Write failing service + Supertest tests for `POST /api/vehicles` (201, 400 invalid, 401 unauth) and `GET /api/vehicles` (paginated, 200) — all queries filter `WHERE is_deleted = FALSE`. | | |
| TASK-022 | Write failing tests for `PUT /api/vehicles/:id` (200, 404, 400) and `DELETE /api/vehicles/:id` (204 admin, 403 non-admin, 404) — DELETE sets `is_deleted = TRUE`, does NOT hard-delete. | | |
| TASK-023 | Implement `vehicleController/routes`, `vehicleService`, validation schemas, and a mapper; apply validation middleware + `authorize('ADMIN')` where required. | | |
| TASK-024 | Implement centralized Express error-handling middleware → RFC-7807-style `ApiError`; add a `NotFoundError` class; make CRUD tests green. | | |
| TASK-025 | Refactor: extract mapping helpers, ensure DELETE is ADMIN-only and performs soft delete end-to-end; verify authorization tests for USER vs ADMIN. | | |

---

### Implementation Phase 5 — Search & Filtering (TDD)

**GOAL-005:** Provide flexible, injection-safe, paginated search across make/model/category/price-range, always scoped to non-deleted vehicles.

| Task | Description | Completed | Date |
|---|---|---|---|
| TASK-026 | Write failing tests for `GET /api/vehicles/search` covering single filters, combined filters, price range, empty results, and pagination/sorting. All results exclude `is_deleted = TRUE`. | | |
| TASK-027 | Implement a `buildVehicleFilter(query)` helper producing a sanitized Sequelize `where` clause object (always includes `{ is_deleted: false }`) + `VehicleSearchCriteria` validation schema; wire into `vehicleService.search(...)` with `offset`/`limit`. | | |
| TASK-028 | Make search tests green; add query-plan verification (`EXPLAIN ANALYZE`) and boundary tests (`minPrice > maxPrice → 400`). | | |

---

### Implementation Phase 6 — Inventory Management & Concurrency (TDD)

**GOAL-006:** Implement purchase/restock with correct, race-safe stock accounting, Transaction records written on every outcome, and clear domain errors.

| Task | Description | Completed | Date |
|---|---|---|---|
| TASK-029 | Write failing tests for `POST /api/vehicles/:id/purchase`: decrement by 1, 409/422 when `quantity_in_stock == 0`, 404 unknown id, 401 unauth. | | |
| TASK-030 | Write failing tests for `POST /api/vehicles/:id/restock`: increment (admin), 403 for USER, 400 for non-positive amount. | | |
| TASK-031 | Write a concurrency test: N parallel purchases on `quantity_in_stock = 1` → exactly one succeeds, others get out-of-stock (validates PostgreSQL `SELECT … FOR UPDATE` atomic guard). | | |
| TASK-032 | Implement `inventoryController` + `inventoryService` using a PostgreSQL transaction with `SELECT … FOR UPDATE` to atomically decrement `quantity_in_stock` only when `quantity_in_stock > 0`; write a `Transaction` row for every attempt (SUCCESS or FAILED with `failure_reason`); add `InsufficientStockError`; make tests green. | | |

> [!NOTE]
> Writing a `Transaction` record for both SUCCESS and FAILED outcomes is the key addition over the original plan. It makes stock discrepancy debugging possible.

---

### Implementation Phase 7 — API Documentation & Observability

**GOAL-007:** Make the API self-documenting and operationally observable.

| Task | Description | Completed | Date |
|---|---|---|---|
| TASK-033 | Add `swagger-jsdoc` + `swagger-ui-express`; expose Swagger UI at `/api-docs`; annotate routes/schemas; document the bearer auth scheme and the new `/api/auth/refresh` + `/api/auth/logout` endpoints. | | |
| TASK-034 | Add a `/health` endpoint; add structured JSON logging (pino or winston) + request correlation IDs; redact secrets/PII from logs. | | |
| TASK-035 | Seed dev data via a `seed.js` script (dev only) with a sample admin + vehicles for demoing and screenshots. | | |

---

### Implementation Phase 8 — Frontend Foundation (TDD-ready)

**GOAL-008:** Stand up routing, auth state, secure API client, protected routes, design system, and test harness.

| Task | Description | Completed | Date |
|---|---|---|---|
| TASK-036 | Configure MSW (`src/test/mocks/handlers.js`) and `setupTests.js`; establish RTL test conventions and a `renderWithProviders` helper. | | |
| TASK-037 | Implement `apiClient.js` (Axios) with base URL, JWT request interceptor, and 401 refresh/redirect response interceptor (SEC-011, in-memory token). | | |
| TASK-038 | Implement `AuthContext.jsx` + `useAuth` (login/logout/register, current user/role, token in memory); write tests first. | | |
| TASK-039 | Implement `AppRoutes.jsx` with `ProtectedRoute` and `AdminRoute` guards; write failing routing tests, then implement. | | |
| TASK-040 | Establish design system: Tailwind CSS, base `Button`/`Input`/`Modal`/`Toast` components with a11y baked in. | | |

---

### Implementation Phase 9 — Frontend Auth Screens (TDD)

**GOAL-009:** Deliver accessible register/login flows wired to the API with robust client-side validation.

| Task | Description | Completed | Date |
|---|---|---|---|
| TASK-041 | Write failing RTL tests for `RegisterPage` (validation errors, success → redirect, server error toast) using MSW. | | |
| TASK-042 | Write failing RTL tests for `LoginPage` (invalid creds 401 handling, success stores session, redirect to dashboard). | | |
| TASK-043 | Implement `RegisterPage`/`LoginPage` with React Hook Form + Zod/Yup schema validation; make tests green; refactor shared form components. | | |

---

### Implementation Phase 10 — Frontend Vehicle & Inventory UX (TDD)

**GOAL-010:** Build the dashboard, search/filter, purchase flow, and Admin CRUD UI, all test-first.

| Task | Description | Completed | Date |
|---|---|---|---|
| TASK-044 | Write failing tests + implement `useVehicles` hook and `vehicleApi.js` (list, search, create, update, delete, purchase, restock). | | |
| TASK-045 | Write failing tests + implement `DashboardPage` with `VehicleList`/`VehicleCard`; Purchase button disabled when `quantityInStock === 0`. | | |
| TASK-046 | Write failing tests + implement `SearchBar`/filters (make/model/category/price range) with debounced queries and empty-state handling. | | |
| TASK-047 | Write failing tests + implement an Admin-only `VehicleForm` (create/update) and delete/restock actions; hidden/guarded for non-admin users. | | |
| TASK-048 | Wire toasts for success/error, optimistic UI (or refetch) on purchase, and reflect stock changes immediately. | | |

---

### Implementation Phase 11 — Frontend Polish: Responsive, A11y, Performance

**GOAL-011:** Elevate UX quality to production standards.

| Task | Description | Completed | Date |
|---|---|---|---|
| TASK-049 | Make layouts responsive (mobile-first grid); verify at 320/768/1280 breakpoints. | | |
| TASK-050 | Accessibility pass: semantic landmarks, focus management, ARIA on interactive controls, keyboard nav, run axe checks in tests. | | |
| TASK-051 | Add an `ErrorBoundary`, route-level code splitting (`React.lazy`), and memoization for lists; verify with a Lighthouse pass. | | |

---

### Implementation Phase 12 — Quality Gates, Coverage & Test Report

**GOAL-012:** Prove correctness and produce the required test report artifact.

| Task | Description | Completed | Date |
|---|---|---|---|
| TASK-052 | Enforce coverage gates: Jest ≥ 85% (backend), Vitest ≥ 80% (frontend); fail CI below threshold. | | |
| TASK-053 | Add a happy-path E2E smoke test (Playwright or Cypress): register → login → add vehicle (admin) → search → purchase. | | |
| TASK-054 | Generate a consolidated test report (Jest HTML + Vitest report + E2E summary) and export screenshots into `docs/` for the README. | | |
| TASK-055 | Run dependency vulnerability scans (npm audit, Snyk/Dependabot) and resolve/triage findings, document residual risk. | | |

---

### Implementation Phase 13 — Documentation & Deployment (Brownie Points)

**GOAL-013:** Ship a live app and a submission-grade README.

| Task | Description | Completed | Date |
|---|---|---|---|
| TASK-056 | Write `README.md`: overview, architecture diagram, local setup (backend + frontend + docker-compose), env vars, API reference link, screenshots. | | |
| TASK-057 | Write the mandatory "My AI Usage" section: tools used, how used per phase, and honest reflection on impact/limits. | | |
| TASK-058 | Provision managed PostgreSQL (Supabase, Railway Postgres, or Render Postgres); deploy backend (Railway/Render) with secrets; configure prod env vars + run migrations on deploy. | | |
| TASK-059 | Deploy frontend (Vercel/Netlify) with prod API base URL; lock CORS to the deployed origin; add live URL + demo admin creds note to README. | | |
| TASK-060 | Final pass: verify all endpoints over HTTPS, run smoke test against prod, capture final screenshots, tag `v1.0.0`. | | |

---

## 3. Alternatives

- **ALT-001:** Session-cookie auth instead of JWT — rejected; the brief explicitly asks for token-based auth (JWT), and stateless tokens suit an SPA + separate API.
- **ALT-002:** MongoDB or SQLite instead of PostgreSQL — both are permitted by the brief. MongoDB offers schema flexibility and fast iteration with Atlas hosting; SQLite is simplest but less impressive for a hiring signal. PostgreSQL chosen here for relational integrity, CHECK constraints, native row-level locking for concurrency safety, and strong managed hosting options (Supabase, Railway, Render); MongoDB remains a valid drop-in alternative if schema flexibility is preferred.
- **ALT-003:** Redux Toolkit for global state — deferred; Context + hooks are sufficient for this scope. Revisit only if state complexity grows.
- **ALT-004:** Pessimistic (advisory-lock based) locking for inventory — not needed; PostgreSQL `SELECT … FOR UPDATE` within a transaction provides atomic row-level locking that is both safe and low-contention for the purchase/restock use case.
- **ALT-005:** Storing JWT in localStorage — rejected for security (XSS token theft); in-memory access token + httpOnly refresh cookie preferred.
- **ALT-006:** TypeScript on the backend/frontend — optional enhancement; JavaScript keeps parity with the brief while remaining acceptable to switch to TS.
- **ALT-007:** NestJS instead of plain Express — both are permitted by the brief; plain Express chosen for a leaner footprint and faster setup; NestJS remains a valid alternative if a more opinionated, Spring-like structure is preferred.
- **ALT-008:** Hard-delete vehicles — rejected; soft delete (`is_deleted = TRUE`) chosen to preserve referential integrity in the `transactions` table.

---

## 4. Dependencies

- **DEP-001:** Node.js 20 LTS, npm 10+.
- **DEP-002:** Express 4/5, sequelize, pg, pg-hstore, dotenv, helmet, cors.
- **DEP-003:** PostgreSQL 16 (runtime + prod, via Supabase/Railway/Render or self-hosted), Sequelize ORM, sequelize-cli (migrations).
- **DEP-004:** jsonwebtoken, bcrypt, express-rate-limit (rate limiting), swagger-jsdoc + swagger-ui-express for docs.
- **DEP-005:** Testing — Jest, Supertest, testcontainers-node (or pg-mem for lighter in-process PostgreSQL), coverage via `jest --coverage`, npm audit for dependency scanning.
- **DEP-006:** Node.js 20+, Vite, React 18, React Router, Axios, React Hook Form + Zod/Yup, Tailwind CSS.
- **DEP-007:** Frontend testing — Vitest, React Testing Library, MSW, @axe-core/react, Playwright/Cypress (E2E).
- **DEP-008:** Infra — Docker + docker-compose, GitHub Actions, managed PostgreSQL (Supabase/Railway/Render), backend host (Railway/Render), frontend host (Vercel/Netlify).

---

## 5. Files

- **FILE-001:** `car-dealership-api/package.json` — backend deps, scripts (lint, test, coverage, dependency audit).
- **FILE-002:** `car-dealership-api/src/middleware/auth.js` — JWT verification, `authorize(role)` RBAC middleware.
- **FILE-003:** `.../src/services/jwtService.js`, `authMiddleware.js` — JWT + auth wiring.
- **FILE-004:** `.../src/features/auth/authController.js`, `authService.js`, `routes.js` — register/login/refresh/logout.
- **FILE-005:** `.../src/features/user/User.model.js`, `Role.js`, `userRepository.js` — identity model (Sequelize).
- **FILE-006:** `.../src/features/auth/RefreshToken.model.js`, `refreshTokenRepository.js` — refresh token persistence and revocation. *(new)*
- **FILE-007:** `.../src/features/vehicle/Vehicle.model.js`, `vehicleController.js`, `vehicleService.js`, `vehicleRepository.js`, `searchFilter.js`, `vehicleSchema.js` — vehicle domain + search.
- **FILE-008:** `.../src/features/inventory/inventoryController.js`, `inventoryService.js`, `Transaction.model.js`, `transactionRepository.js` — purchase/restock + transaction ledger with PostgreSQL row-level locking. *(expanded)*
- **FILE-009:** `.../src/middleware/errorHandler.js`, `ApiError.js`, custom error classes — error contract.
- **FILE-010:** `.../src/config/db.js`, `.env.example`, `scripts/seed.js` — Sequelize instance config + connection pool + seed.
- **FILE-011:** `car-dealership-api/migrations/` — Sequelize migration files for all four tables (users, refresh_tokens, vehicles, transactions).
- **FILE-012:** `car-dealership-api/test/` — unit, integration, concurrency, and repository tests.
- **FILE-013:** `car-dealership-web/src/api/apiClient.js`, `authApi.js`, `vehicleApi.js` — typed API layer with interceptors.
- **FILE-014:** `car-dealership-web/src/context/AuthContext.jsx`, `hooks/useAuth.js`, `hooks/useVehicles.js` — state + data hooks.
- **FILE-015:** `car-dealership-web/src/routes/AppRoutes.jsx`, `components/layout/ProtectedRoute.jsx` — routing + guards.
- **FILE-016:** `car-dealership-web/src/pages/{Login,Register,Dashboard,Admin}Page.jsx`, `components/vehicles/*` — UI.
- **FILE-017:** `car-dealership-web/src/test/mocks/handlers.js`, `setupTests.js` — MSW + RTL harness.
- **FILE-018:** `docker-compose.yml`, `.env.example`, `.github/workflows/*.yml`, `CONTRIBUTING.md` — infra + CI + commit policy.
- **FILE-019:** `README.md` (incl. "My AI Usage"), `docs/` (architecture diagram, screenshots, test report).

---

## 6. Testing

- **TEST-001:** `jwtService.test.js` — token generation, expiry, signature-tamper rejection, claims/roles round-trip.
- **TEST-002:** `authService.test.js` — register hashes password (never plaintext), duplicate username/email rejected, login verifies bcrypt hash.
- **TEST-003:** `authController.test.js` (Supertest) — register 201/400/409, login 200/401, rate-limit 429 on brute force.
- **TEST-004:** `refreshToken.test.js` — refresh endpoint issues new token and revokes old one; using a revoked token returns 401; expired tokens are filtered by `expires_at < NOW()`. *(new)*
- **TEST-005:** `userRepository.test.js` / `vehicleRepository.test.js` (test PostgreSQL via testcontainers-node or pg-mem) — persistence, unique constraints, CHECK constraints, indexes.
- **TEST-006:** `vehicleController.test.js` — CRUD status codes, validation 400, unauth 401, DELETE 403 for USER vs 204 for ADMIN; DELETE soft-deletes (`is_deleted = TRUE`), record not returned in list after delete.
- **TEST-007:** `vehicleSearch.test.js` — single/combined filters, price range, `minPrice > maxPrice → 400`, pagination + sorting, empty results; deleted vehicles never appear.
- **TEST-008:** `inventoryService.test.js` / `inventoryController.test.js` — purchase decrements, out-of-stock blocked, restock admin-only, non-positive amount rejected; a `Transaction` record is created for every call (SUCCESS + FAILED). *(expanded)*
- **TEST-009:** `inventoryConcurrency.test.js` — parallel purchases on `quantity_in_stock = 1`: exactly one succeeds (PostgreSQL `SELECT … FOR UPDATE` atomic correctness); remaining calls produce FAILED Transaction rows.
- **TEST-010:** `errorHandler.test.js` — error responses are RFC-7807-shaped and leak no internals/stack traces.
- **TEST-011:** Frontend `AuthContext`/`useAuth` tests — login/logout/register state transitions, token-in-memory, 401 refresh.
- **TEST-012:** Frontend `LoginPage`/`RegisterPage` RTL tests — validation, success redirect, server-error toast (MSW).
- **TEST-013:** Frontend `DashboardPage`/`VehicleCard` tests — Purchase disabled at qty 0, purchase updates stock, admin controls gated by role.
- **TEST-014:** Frontend `SearchBar` tests — filter/debounce behavior, empty-state rendering.
- **TEST-015:** Accessibility tests (axe) on key pages; keyboard-navigation assertions.
- **TEST-016:** E2E smoke (Playwright/Cypress) — register → login → admin add vehicle → search → purchase.
- **TEST-017:** CI quality gates — Jest ≥ 85%, Vitest ≥ 80%, dependency scans pass/triaged.

---

## 7. Risks & Assumptions

- **RISK-001:** Inventory race conditions could oversell stock — mitigated by PostgreSQL `SELECT … FOR UPDATE` within a Sequelize transaction + quantity guard, proven by TEST-009.
- **RISK-002:** JWT/secret mismanagement (leaked or weak secret) — mitigated by env-injected secrets, short-lived tokens, refresh rotation backed by `refresh_tokens` table, `.env` git-ignored.
- **RISK-003:** XSS enabling token theft — mitigated by in-memory access token, httpOnly refresh cookie, output encoding, CSP headers.
- **RISK-004:** Over-permissive CORS or missing RBAC checks — mitigated by explicit origin allow-list and server-side `authorize()` middleware (never trust client role).
- **RISK-005:** Flaky/slow integration tests via testcontainers-node — mitigated by reusing a single container per test suite, tagging slow tests, parallelizing where safe; pg-mem can substitute for faster in-process tests where full SQL fidelity is not required.
- **RISK-006:** Scope creep vs. deadline — mitigated by phase ordering; Phases 1–10 are the graded core, 11–13 are polish/brownie points.
- **RISK-007:** Deployment secret/config drift between local and prod — mitigated by env-based config, `.env.example`, and platform secret stores.
- **RISK-008:** Stale refresh tokens accumulating in the DB — mitigated by filtering on `expires_at < NOW()` on read, plus a periodic cleanup job (cron or on-startup sweep) since PostgreSQL has no native TTL index unlike MongoDB.

**ASSUMPTION-001:** A single admin can be bootstrapped via a seed script (dev) or a one-time promotion endpoint/CLI (prod).  
**ASSUMPTION-002:** "Purchase" decrements stock by 1 per call unless a quantity is supplied; brief implies single-unit purchase.  
**ASSUMPTION-003:** Refresh tokens and rate limiting are in-scope enhancements beyond the literal brief but expected at a senior bar.  
**ASSUMPTION-004:** JavaScript (not TypeScript) is acceptable on the backend/frontend per the brief's framework freedom.

---

## 8. Related Specifications / Further Reading

- [Express.js Documentation](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [PostgreSQL Documentation — Indexes & Transactions](https://www.postgresql.org/docs/current/)
- [OWASP Top 10](https://owasp.org/Top10/)
- [OWASP Cheat Sheet: JWT Security](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [RFC 7807 — Problem Details for HTTP APIs](https://datatracker.ietf.org/doc/html/rfc7807)
- [testcontainers-node Documentation](https://node.testcontainers.org/)
- [pg-mem Documentation](https://github.com/oguimbal/pg-mem)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Mock Service Worker](https://mswjs.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub: Creating commits with multiple co-authors](https://docs.github.com/en/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/creating-a-commit-with-multiple-authors)

---

## Note on Brief Compliance

Your company's brief allows Node.js/TypeScript (Express/NestJS), Python (Django/FastAPI), or Ruby (Rails) for the backend, and PostgreSQL, MongoDB, or SQLite for the database. The friend's original plan used Java + Spring Boot + PostgreSQL — Java/Spring Boot is not one of the three permitted backend options, so that plan would technically miss the brief's stated tech constraint even though the architecture itself was solid. This version uses Node.js + Express + **PostgreSQL**, which is fully within the brief's allowed choices. Everything else — endpoints, entity fields, TDD process, AI co-authorship rules, README requirements, and deliverables — is preserved exactly as specified in both documents.

---

## What Changed vs the Original Plan (Database Only)

| Section | Original (MongoDB) | Updated (PostgreSQL) |
|---|---|---|
| Database Engine | MongoDB 7 (Mongoose ODM) | PostgreSQL 16 (Sequelize ORM) |
| Collections → Tables | 4 (`users`, `refreshtokens`, `vehicles`, `transactions`) | 4 (`users`, `refresh_tokens`, `vehicles`, `transactions`) |
| Phase 2 tasks | 7 (TASK-008 to TASK-014) | 7 (TASK-008 to TASK-014) — same count, migration-based |
| Schema definition | Mongoose schemas + `schema.index()` | Sequelize models + `sequelize-cli` migration files |
| Primary Keys | `ObjectId` (auto Mongo) | `UUID` via `gen_random_uuid()` |
| `User` fields | `_id, username, email, passwordHash, role, isActive, createdAt, updatedAt` | `id, username, email, password_hash, role, is_active, created_at, updated_at` (snake_case, CHECK constraint on role) |
| `Vehicle` fields | `_id, make, model, category, price, quantityInStock, imageUrl, isDeleted, __v, createdAt, updatedAt` | `id, make, model, category, price, quantity_in_stock, image_url, is_deleted, version, created_at, updated_at` (CHECK constraints on price & qty) |
| Refresh tokens | `refreshtokens` collection + TTL index | `refresh_tokens` table + `expires_at` filter + cleanup job |
| Transaction history | `transactions` collection | `transactions` table with FK constraints |
| Soft delete | `isDeleted` flag on Vehicle | `is_deleted` flag on Vehicle (SQL `WHERE is_deleted = FALSE`) |
| Concurrency guard | `findOneAndUpdate` with quantity guard | `SELECT … FOR UPDATE` inside a Sequelize transaction |
| Injection prevention | mongo-sanitize + Mongoose typing | Sequelize parameterized queries (no raw string interpolation) |
| Test DB | mongodb-memory-server | testcontainers-node (PostgreSQL container) or pg-mem |
| Deployment DB | MongoDB Atlas | Supabase / Railway Postgres / Render Postgres |
| New files | `RefreshToken.model.js`, `transactionRepository.js`, `Transaction.model.js` | + `car-dealership-api/migrations/` directory (Sequelize migration files) |
| New tests | TEST-004 (refresh token), expanded TEST-008 (Transaction records) | Same tests, updated to use PostgreSQL test infrastructure |
| Updated risks | RISK-008 (stale tokens → TTL index mitigation) | RISK-008 updated: cleanup job instead of TTL index |
| Updated alternatives | ALT-002, ALT-004, ALT-005, ALT-008 | Updated to reflect PostgreSQL as the chosen DB |
| Updated references | Mongoose docs, MongoDB manual, mongodb-memory-server | Sequelize docs, PostgreSQL docs, testcontainers-node, pg-mem |

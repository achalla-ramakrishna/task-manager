# Architecture

The stable shape of this system — how it's put together and why. Update this file whenever the
shape actually changes (a new module, a changed data flow, a new external dependency); don't let
it drift into describing a system that no longer exists.

## Repo Overview

```
task-manager/
├── spec/                  Product spec (approved, source of truth) — see spec/spec.md
│   ├── spec.md            Entities, API surface, boundary cases, NFRs, glossary
│   └── user-stories/      One file per story, with acceptance criteria and named tests
├── docs/                  This context layer
│   ├── architecture.md    This file
│   ├── conventions.md     Naming, folder structure, error/logging patterns
│   └── adr/               Architecture Decision Records — the "why" behind non-obvious choices
├── backend/               Spring Boot 3.x, Java 21, Maven, MySQL 8 (not yet scaffolded)
├── frontend/              React + TypeScript, Vite (not yet scaffolded)
├── AGENTS.md              House rules and guardrails — the entrypoint, kept lean, links here
└── .claude/               Guardrail config (settings.json, hooks) — see AGENTS.md
```

**Status as of this writing**: spec approved, toolchain verified, no application code yet.
`backend/` and `frontend/` don't exist on disk yet — this doc describes the *planned* shape
until code lands, at which point it must be corrected to match reality, not the other way
around.

## Planned Backend Architecture

Layered, package-by-feature Spring Boot app (see `docs/adr/0004-layered-package-by-feature.md`
for why):

```
backend/src/main/java/com/taskmanager/
├── auth/          Registration, login, JWT issuance/validation
├── user/          User entity, profile lookup, admin user management
├── project/       Project CRUD, membership management
├── task/          Task CRUD, status transitions, filtering
├── comment/       Comment create/list/delete
└── common/        Shared: error envelope, pagination, base exceptions, security config
```

Each feature package follows the same internal shape:

```
<feature>/
├── controller/    Thin HTTP layer — request/response mapping only, no business logic
├── service/       Business logic, authorization checks, transaction boundaries
├── repository/    Spring Data JPA interfaces — no query logic outside JPQL/derived queries
├── entity/        JPA entities — never serialized directly to/from the wire
└── dto/           Request/response DTOs — the only types that cross the HTTP boundary
```

**Request flow**: `Controller -> Service -> Repository -> MySQL`, DTOs converted to/from
entities at the service boundary. Controllers never touch repositories directly.

**Auth flow**: `POST /api/auth/login` issues a JWT (1h expiry, see
`docs/adr/0003-jwt-expiry-no-refresh-token.md`) signed server-side. A `Spring Security` filter
validates the JWT on every subsequent request and populates the security context; controllers
read the authenticated user from there, never from a client-supplied header/claim they trust
blindly.

**Data flow for a typical write** (e.g. create task): Client -> `TaskController` (validates
DTO via Bean Validation) -> `TaskService` (checks project membership, applies defaults) ->
`TaskRepository` (JPA save) -> MySQL. Response DTO mapped back and returned with the error
envelope shape from `spec/spec.md` §3 used only on failure paths.

## Planned Frontend Architecture

```
frontend/src/
├── api/           Single typed API client module (see docs/conventions.md) — no ad hoc fetch
├── pages/         Route-level components (Login, ProjectList, ProjectBoard, TaskDetail, ...)
├── components/    Reusable presentational components
├── types/         TypeScript types mirroring backend DTOs
└── auth/          JWT storage and attach-to-request logic
```

## Module Map

| Module | Owner (for questions) | Entry point once built |
|---|---|---|
| `backend/auth` | — | `AuthController` |
| `backend/user` | — | `UserController` |
| `backend/project` | — | `ProjectController`, `ProjectMemberController` |
| `backend/task` | — | `TaskController` |
| `backend/comment` | — | `CommentController` |
| `frontend/api` | — | `apiClient.ts` |

*(This table is a placeholder until code exists — fill in real entry points and, if this ever
becomes a multi-contributor repo, owners, as each module is scaffolded. An empty "Owner" column
is fine for a solo project; don't invent names to fill it.)*

## Do-Not-Touch / Handle-With-Care

- `spec/spec.md` and `spec/user-stories/` — these are the approved contract (see
  `AGENTS.md` Workflow). Don't edit silently; any change needs a call-out to the user.
- `.claude/settings.json` and `.claude/hooks/` — guardrail config; changes here affect what the
  agent itself is allowed to do. See `AGENTS.md` Guardrails Wiring before touching.
- Once Flyway migrations exist (`backend/src/main/resources/db/migration/`): never edit an
  already-applied migration file — add a new one instead (see `docs/conventions.md`).

## Commands

Not yet applicable — no build exists. Once `backend/` and `frontend/` are scaffolded, this
section must be filled in with the real build/test/run commands (`mvn spring-boot:run`,
`npm run dev`, etc.) so a new session doesn't have to guess or re-discover them.

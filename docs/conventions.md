# Conventions

Naming, structure, and pattern rules. `AGENTS.md` links here instead of carrying all of this
inline, so the house-rules file stays short enough to actually get read every session.

## Backend (Spring Boot)

**Package structure**: package-by-feature (`auth`, `user`, `project`, `task`, `comment`), each
with `controller` / `service` / `repository` / `entity` / `dto` sub-packages. See
`docs/architecture.md` for the full layout and why it's shaped this way.

**Layering rules**:
- Controllers: thin. Request/response mapping and delegation only — no business logic, no
  direct repository calls.
- Services: own business logic, authorization checks (membership/ownership), and transaction
  boundaries (`@Transactional`).
- Repositories: Spring Data JPA interfaces. Derived query methods or `@Query` with named/bind
  parameters only — never string-concatenated JPQL/SQL.
- Entities never cross the HTTP boundary directly — always map to/from a DTO at the service or
  controller layer.

**Naming**:
- Classes: `<Feature><Layer>` — `TaskController`, `TaskService`, `TaskRepository`.
- DTOs: `<Feature>Request` / `<Feature>Response`, or more specific (`CreateTaskRequest`,
  `TaskResponse`) when a feature has multiple request shapes.
- Test classes: `<ClassUnderTest>Test` (unit) or `<ClassUnderTest>IT` (integration) — matches
  the naming already used in `spec/user-stories/*.md` "Checks That Prove It" sections, so a
  story's acceptance criteria map directly to a findable test class.

**Validation & errors**:
- Bean Validation (`jakarta.validation`) annotations on every request DTO field, matching the
  constraints named in `spec/spec.md` §3/§4 exactly (max lengths, required-ness).
- A single global `@ControllerAdvice` produces the error envelope from `spec/spec.md` §3 — don't
  build a different error shape per endpoint or per exception type.

**Persistence**:
- Schema changes go through Flyway migrations (`backend/src/main/resources/db/migration/`),
  named `V<n>__<description>.sql`. Never edit an already-applied migration — add a new one.
- `hibernate.ddl-auto` must be `validate` (or `none`) once Flyway is in place — never `update`
  outside a throwaway local sandbox that isn't committed.

**Logging**:
- Structured logs (SLF4J) for unhandled exceptions and auth failures (see `spec/spec.md` §6
  Observability).
- Never log a password, JWT, or full request body that could contain PII — log identifiers
  (user id, task id) instead of the sensitive payload.

## Frontend (React + TypeScript)

- Functional components + hooks only; no class components.
- TypeScript strict mode on; no `any` without a comment explaining why it's unavoidable.
- One typed API client module (`frontend/src/api/apiClient.ts`) — components call functions
  from it, never call `fetch`/`axios` directly. This keeps auth-header attachment and error
  handling in one place.
- Types in `frontend/src/types/` mirror the backend DTOs field-for-field — if a DTO changes,
  update the matching type in the same change, not later.

## Cross-Cutting

- Match `spec/spec.md` exactly for entity fields, endpoint paths, status codes, and error
  shapes. A needed divergence means updating `spec/spec.md` first and calling it out to the
  user — never let code and spec drift silently (see `AGENTS.md` Workflow).
- Non-obvious architectural choices get an ADR in `docs/adr/`, not just a code comment — see
  `docs/adr/README.md` for the process.

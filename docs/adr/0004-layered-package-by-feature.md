# ADR-0004: Layered, package-by-feature backend structure

**Status**: Accepted — 2026-09-16

## Context

The backend needs an internal structure decided before code is scaffolded (`AGENTS.md` was
written before any code exists specifically to fix this ahead of time, per Competency 1
Toolchain Setup). The two common options for a Spring Boot app of this size are package-by-layer
(`controllers/`, `services/`, `repositories/` at the top level, feature-agnostic) or
package-by-feature (each feature owns its own controller/service/repository).

## Decision

Package-by-feature: `auth/`, `user/`, `project/`, `task/`, `comment/`, each with its own
`controller` / `service` / `repository` / `entity` / `dto` sub-packages (`docs/architecture.md`,
`docs/conventions.md`).

## Alternatives Considered

- **Package-by-layer** (`com.taskmanager.controller.*`, `com.taskmanager.service.*`, ...): puts
  all controllers together regardless of feature, which scales poorly past a handful of
  entities — finding everything related to `Task` means hunting across 4+ top-level packages
  instead of one. Rejected given `spec/spec.md` already defines 5 distinct feature areas
  (auth, user, project, task, comment).
- **Modular monolith with hard module boundaries** (separate Maven modules per feature): real
  compile-time isolation, but meaningful build-config overhead for a single-deployable app with
  no plan to split into services. Rejected as disproportionate for v1's scope.

## Consequences

- Cross-feature logic (e.g. task creation validating the assignee is a project member — a
  `task`-package concern reaching into `project`-package data) needs a clear rule: services can
  depend on another feature's repository/service, but never on another feature's controller.
  Document any such cross-feature dependency in the affected service's code, not just here.
- If a feature area grows enough to need extraction into its own deployable, this structure
  moves relatively easily to a modular-monolith or service split (feature packages are already
  self-contained) — but that's a real trigger for revisiting this ADR when it actually happens,
  not something to build support for preemptively.

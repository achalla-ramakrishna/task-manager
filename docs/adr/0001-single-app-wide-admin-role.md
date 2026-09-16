# ADR-0001: Single app-wide ADMIN role

**Status**: Accepted — 2026-09-16

## Context

`spec/spec.md` §2 defines `User.role` (`ADMIN`/`MEMBER`) and, separately,
`ProjectMember.role` (`OWNER`/`MEMBER`) per project. This raised an open question in §8: is a
single app-wide `ADMIN` role enough, or does v1 need per-project admin delegation (e.g. a
project could have multiple co-owners, or an `ADMIN`-equivalent scoped to just that project)?

## Decision

v1 ships with exactly the two roles already specced, and no more:
- App-wide `User.role`: `ADMIN` or `MEMBER` — governs user management endpoints only
  (`GET/DELETE /api/users/{id}` etc.).
- Per-project `ProjectMember.role`: `OWNER` or `MEMBER` — governs project/task/comment
  authorization within that project.

No per-project admin delegation, no co-ownership, no custom roles.

## Alternatives Considered

- **Per-project role delegation** (e.g. a project-level `ADMIN` distinct from `OWNER`): adds a
  third role dimension for no v1 use case yet — this is a small team/solo tool where one owner
  per project is sufficient. Rejected as premature complexity.
- **Co-ownership** (multiple `OWNER`s per project): would require deciding conflict-resolution
  rules (can one `OWNER` remove another?) with no current requirement driving it. Rejected.

## Consequences

- Project ownership is single-holder; transferring it is out of scope for v1 (`spec/spec.md`
  §5), which is why an `OWNER` can't remove themself from a project (§4) — there's no one to
  hand off to programmatically.
- If a future version needs delegated project admins or co-ownership, that's a breaking change
  to the `ProjectMember` role enum and its authorization checks — revisit this ADR (superseding
  it) rather than bolting a new role onto the existing one silently.

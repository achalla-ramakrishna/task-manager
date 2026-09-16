# ADR-0002: Hard cascade delete for projects

**Status**: Accepted — 2026-09-16

## Context

`spec/spec.md` §4 specifies that deleting a project hard-deletes its tasks and comments in the
same operation, with no soft-delete or undo. This was raised as an open question in §8: should
v1 use soft-delete/archive-only semantics instead, given deletion is irreversible?

## Decision

Deletion stays a hard cascade delete, gated by a required `confirm=true` query parameter as the
only safety net (`spec/spec.md` §3/§4). `PUT /api/projects/{id}` already supports moving a
project to `status: ARCHIVED` as the non-destructive alternative for "I don't need this active
anymore, but keep it."

## Alternatives Considered

- **Soft-delete** (a `deletedAt` flag, excluded from queries but retained in the DB): adds
  query-filtering complexity (every repository query needs a "not deleted" clause) and a data
  retention question ("delete for real after how long?") with no v1 requirement forcing an
  answer. The existing `ARCHIVED` status already covers the "hide but keep" use case without
  this complexity.
- **Soft-delete + scheduled hard-delete job**: same complexity as above plus a background job
  v1 doesn't otherwise need. Rejected as out of proportion for a solo/small-team tool.

## Consequences

- Project deletion is genuinely destructive and irreversible — the `confirm=true` requirement
  exists specifically to prevent an accidental/scripted call from wiping data (`spec/spec.md`
  §4, `spec/user-stories/us-07-delete-project.md`).
- If a future version needs an undo window or audit trail of deleted projects, that requires
  introducing soft-delete after the fact — a schema change, not just a behavior change. Revisit
  this ADR (superseding it) rather than adding soft-delete piecemeal to only some entities.
- `Comment` and `Task` deletion (§4) follow the same hard-delete philosophy for consistency —
  there's no soft-delete on some entities and hard-delete on others.

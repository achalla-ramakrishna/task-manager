# Architecture Decision Records

Records of non-obvious decisions and their alternatives/trade-offs — the "why" behind a choice,
which a diagram or code comment alone doesn't capture and which otherwise leaves with whoever
made the call.

## When to write one

Write an ADR when a decision:
- Has a real alternative that was considered and rejected (not a decision with only one sane
  option)
- Would be expensive to reverse later, or would confuse a future contributor if left unexplained
- Resolves an open question that was explicitly raised (e.g. in `spec/spec.md` §8)

Don't write one for routine implementation choices already covered by `docs/conventions.md`.

## Process

1. Copy the shape of an existing ADR (Context / Decision / Alternatives / Consequences).
2. Number sequentially, zero-padded: `000N-short-slug.md`.
3. Status starts `Accepted` for a decision already made; use `Proposed` if raising one for
   discussion first.
4. **Supersede, don't overwrite**: if a decision changes later, write a new ADR that supersedes
   the old one, and mark the old one's status `Superseded by 000M`. Keep the old file — the
   trail of why is as valuable as the current answer.

## Index

| ADR | Decision |
|---|---|
| [0001](./0001-single-app-wide-admin-role.md) | Single app-wide `ADMIN` role, no per-project admin delegation |
| [0002](./0002-hard-cascade-delete-for-projects.md) | Hard cascade delete for projects (no soft-delete/archive) |
| [0003](./0003-jwt-expiry-no-refresh-token.md) | JWT with 1h expiry, no refresh token |
| [0004](./0004-layered-package-by-feature.md) | Layered, package-by-feature backend structure |

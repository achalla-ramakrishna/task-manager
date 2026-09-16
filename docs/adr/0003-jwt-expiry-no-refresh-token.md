# ADR-0003: JWT with 1h expiry, no refresh token

**Status**: Accepted — 2026-09-16

## Context

`spec/spec.md` §3 specifies stateless JWT auth with ~1h expiry and no refresh-token flow —
meaning a user is logged out and must re-authenticate hourly. This was raised as an open
question in §8: is that acceptable, or does v1 need a refresh-token (or "remember me") flow to
avoid the hourly re-login?

## Decision

Keep the 1h JWT expiry with no refresh token. When a token expires, the client gets `401` and
the user logs in again (`spec/user-stories/us-02-log-in.md`, `us-03-view-profile.md`).

## Alternatives Considered

- **Refresh tokens**: requires a second token type, server-side (or rotating) refresh-token
  storage/revocation, and a token-refresh endpoint — meaningful backend surface area for a
  problem (hourly re-login) that's a minor UX inconvenience for a small internal tool, not a
  blocker. Rejected for v1; explicitly listed as out of scope (`spec/spec.md` §5).
- **Longer-lived JWT** (e.g. 24h) with no refresh token: reduces re-login frequency but widens
  the window a leaked/stolen token stays valid, with no revocation mechanism to compensate
  (JWTs are stateless — there's nothing to revoke short of an expiry). 1h was kept as the more
  conservative default given no revocation exists.

## Consequences

- No session persistence across the JWT's lifetime beyond what the client stores — closing the
  browser doesn't log the user out, but token expiry does, with no way to extend a session short
  of logging in again.
- If a future version adds refresh tokens or extends expiry, that's a new decision superseding
  this one, not a quiet parameter change — the trade-off (compromised-token exposure window vs.
  re-login friction) needs conscious re-evaluation, not just knob-turning.

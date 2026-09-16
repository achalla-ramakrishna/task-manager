# US-3: View my profile

[← Back to index](./README.md)

**Actor + Goal**: As a logged-in user, I want to see who I'm logged in as, so that the UI can
show my identity and role.

**Endpoints**: `GET /api/users/me` [§3]

**State Change**: None — pure read.

**Examples**:
- Request: `GET /api/users/me` with `Authorization: Bearer <valid-jwt>`
- Response `200`: `{"id":1,"email":"ada@example.com","name":"Ada","role":"MEMBER"}`

**Acceptance Criteria**:
- Given a valid, unexpired JWT, when I call this endpoint, then I get my own user profile with
  no `passwordHash`.

**Boundaries & Failure States** [§4]:
- Given a missing `Authorization` header, when I call this endpoint, then I get `401`.
- Given an expired JWT, when I call this endpoint, then I get `401`.
- Given a malformed/tampered JWT, when I call this endpoint, then I get `401`.

**Not in Scope**: Editing profile fields (name/email/password change) — no such endpoint exists
in v1.

**Checks That Prove It**: `UserControllerIT#me_returnsOwnProfile`,
`UserControllerIT#me_missingToken_returns401`, `UserControllerIT#me_expiredToken_returns401`.

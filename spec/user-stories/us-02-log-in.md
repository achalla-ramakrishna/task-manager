# US-2: Log in

[← Back to index](./README.md)

**Actor + Goal**: As a registered user, I want to log in with my email and password, so that I
get a token to access the app.

**Endpoints**: `POST /api/auth/login` [§3]

**State Change**: No active session -> client holds a JWT valid for ~1h; no server-side session
state is created (JWT is stateless) [§3].

**Examples**:
- Request: `{"email":"ada@example.com","password":"correcthorse1"}`
- Response `200`: `{"token":"eyJhbGci...","user":{"id":1,"email":"ada@example.com","name":"Ada"}}`

**Acceptance Criteria**:
- Given correct credentials, when I log in, then I receive a JWT and my user profile in one
  response.
- Given the returned JWT, when I call `GET /api/users/me` with it, then I get my own profile
  back.

**Boundaries & Failure States** [§4]:
- Given an incorrect password, when I log in, then I get a generic `401 Unauthorized` (not
  "wrong password" — avoids confirming the email exists).
- Given an email with no matching account, when I log in, then I get the same generic `401`
  (identical response shape to the wrong-password case).

**Not in Scope**: "Remember me," refresh tokens, multi-device session listing/revocation — v1
JWTs simply expire and the user re-logs-in [§5].

**Checks That Prove It**: `AuthControllerIT#login_success_returnsToken`,
`AuthControllerIT#login_wrongPassword_returns401`,
`AuthControllerIT#login_unknownEmail_returns401SameShapeAsWrongPassword`.

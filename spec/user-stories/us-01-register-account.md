# US-1: Register an account

[← Back to index](./README.md)

**Actor + Goal**: As a new user, I want to register with my email, name, and password, so that
I can start using the app.

**Endpoints**: `POST /api/auth/register` [§3]

**State Change**: No account for this email exists -> a `User` row exists with `role: MEMBER`,
`passwordHash` set (never the raw password), `createdAt` set.

**Examples**:
- Request: `{"email":"ada@example.com","name":"Ada","password":"correcthorse1"}`
- Response `201`: `{"id":1,"email":"ada@example.com","name":"Ada","role":"MEMBER"}` (no
  `passwordHash` field, ever)

**Acceptance Criteria**:
- Given a unique email and an 8+ character password, when I register, then I get `201` and can
  subsequently log in with those credentials.
- Given the response body, when I inspect it, then it contains no `passwordHash` field.

**Boundaries & Failure States** [§4]:
- Given an email already registered, when I try to register again, then I get `409 Conflict`
  and no duplicate row is created.
- Given a password under 8 characters, when I register, then I get `400` with a
  `validationErrors` entry for `password`.
- Given a blank `name` or malformed `email`, when I register, then I get `400` with the
  offending field named in `validationErrors`.

**Not in Scope**: Email verification, CAPTCHA, social/OAuth registration, password strength
meter beyond the length check — all out of scope for v1 [§5].

**Checks That Prove It**: `AuthControllerIT#register_success`,
`AuthControllerIT#register_duplicateEmail_returns409`,
`AuthControllerIT#register_shortPassword_returns400`.

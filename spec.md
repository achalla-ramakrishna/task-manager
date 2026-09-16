# Project & Task Manager — v1 Spec

Status: **Draft — pending approval**
Owner: achalla@codewalnut.com
Stack: Spring Boot 3 (Java 21) + MySQL 8 backend, React (TypeScript) frontend, REST/JSON over HTTPS.

## 1. Overview

A multi-user web app where users create projects, invite members to them, and track tasks within
each project through a simple status workflow. v1 targets a single team/organization per
deployment (no multi-tenancy) with email/password auth.

## 2. Entities

### User
| Field | Type | Notes |
|---|---|---|
| id | bigint (PK) | |
| email | varchar(255) | unique, required |
| passwordHash | varchar(255) | BCrypt, never returned in API responses |
| name | varchar(100) | required |
| role | enum: `ADMIN`, `MEMBER` | app-wide role; `ADMIN` can manage users |
| createdAt / updatedAt | timestamp | |

### Project
| Field | Type | Notes |
|---|---|---|
| id | bigint (PK) | |
| name | varchar(150) | required |
| description | varchar(2000) | optional |
| ownerId | FK -> User | required; creator by default |
| status | enum: `ACTIVE`, `ARCHIVED` | default `ACTIVE` |
| createdAt / updatedAt | timestamp | |

### ProjectMember (join entity)
| Field | Type | Notes |
|---|---|---|
| projectId | FK -> Project | composite PK with userId |
| userId | FK -> User | |
| role | enum: `OWNER`, `MEMBER` | one `OWNER` per project (the creator); ownership transfer is out of scope for v1 |
| joinedAt | timestamp | |

### Task
| Field | Type | Notes |
|---|---|---|
| id | bigint (PK) | |
| projectId | FK -> Project | required, immutable after creation |
| title | varchar(200) | required |
| description | varchar(4000) | optional |
| status | enum: `TODO`, `IN_PROGRESS`, `DONE` | default `TODO` |
| priority | enum: `LOW`, `MEDIUM`, `HIGH` | default `MEDIUM` |
| assigneeId | FK -> User, nullable | must be a member of the task's project |
| dueDate | date, nullable | |
| version | int | optimistic locking (see §4) |
| createdAt / updatedAt | timestamp | |

### Comment
| Field | Type | Notes |
|---|---|---|
| id | bigint (PK) | |
| taskId | FK -> Task | required |
| authorId | FK -> User | required |
| body | varchar(2000) | required, non-empty |
| createdAt | timestamp | comments are immutable in v1 — no edit, only delete by author/admin |

## 3. API Surface

All endpoints under `/api`. JSON request/response bodies, camelCase fields. Auth via JWT bearer
token (`Authorization: Bearer <token>`), issued on login, ~1h expiry, no refresh-token flow in v1.

### Auth
| Method | Path | Description |
|---|---|---|
| POST | /api/auth/register | Create a user (`MEMBER` role by default) |
| POST | /api/auth/login | Returns JWT + user profile |
| GET | /api/users/me | Current authenticated user |

### Users
| Method | Path | Description |
|---|---|---|
| GET | /api/users | List users (any authenticated user; used for member/assignee pickers) |
| GET | /api/users/{id} | Get a user's public profile |
| DELETE | /api/users/{id} | Admin only; blocked if user owns a project (see §4) |

### Projects
| Method | Path | Description |
|---|---|---|
| GET | /api/projects | List projects the current user is a member of |
| POST | /api/projects | Create project; creator becomes `OWNER` member |
| GET | /api/projects/{id} | Get project detail; requires membership |
| PUT | /api/projects/{id} | Update name/description/status; `OWNER` only |
| DELETE | /api/projects/{id} | `OWNER` only; cascades to tasks and comments |
| GET | /api/projects/{id}/members | List members |
| POST | /api/projects/{id}/members | Add a member by userId; `OWNER` only |
| DELETE | /api/projects/{id}/members/{userId} | Remove member; `OWNER` only; cannot remove self as `OWNER` |

### Tasks
| Method | Path | Description |
|---|---|---|
| GET | /api/projects/{id}/tasks | List tasks in project; filters: `status`, `assigneeId`, `priority`; paginated |
| POST | /api/projects/{id}/tasks | Create task; requires project membership |
| GET | /api/tasks/{id} | Get task detail |
| PUT | /api/tasks/{id} | Update task fields; requires `If-Match` version (see §4) |
| PATCH | /api/tasks/{id}/status | Convenience endpoint for status-only change (drag-and-drop board) |
| DELETE | /api/tasks/{id} | Project `OWNER` or task creator |

### Comments
| Method | Path | Description |
|---|---|---|
| GET | /api/tasks/{id}/comments | List comments on a task, oldest first, paginated |
| POST | /api/tasks/{id}/comments | Add comment; requires project membership |
| DELETE | /api/comments/{id} | Comment author or project `OWNER` |

### Pagination convention
List endpoints accept `page` (0-based, default 0) and `size` (default 20, max 100). Response
envelope: `{ content: [...], page, size, totalElements, totalPages }`.

### Error envelope
```json
{
  "timestamp": "2026-09-16T10:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/projects",
  "validationErrors": [{ "field": "name", "message": "must not be blank" }]
}
```

## 4. Boundary & Failure Cases

**Auth**
- Duplicate email on register -> `409 Conflict`.
- Bad credentials on login -> `401 Unauthorized` (generic message, no "email not found" leak).
- Missing/expired/malformed JWT -> `401 Unauthorized`.
- Password policy: min 8 chars; enforced server-side regardless of client validation.

**Authorization**
- Non-member reading/writing a project or its tasks/comments -> `403 Forbidden`.
- Non-`OWNER` attempting project update/delete/member management -> `403 Forbidden`.
- `OWNER` attempting to remove themself from a project -> `409 Conflict` (must delete project or
  transfer ownership — transfer is out of scope for v1, so this path is effectively blocked).
- Assigning a task to a user who isn't a project member -> `400 Bad Request`.

**Validation**
- Missing required fields, blank strings, or over-length fields -> `400` with `validationErrors`.
- Invalid enum values (e.g. `status: "WONTFIX"`) -> `400 Bad Request`.
- `dueDate` in the past is allowed (v1 does not block backdating); invalid date format -> `400`.
- `page`/`size` out of allowed range -> clamp `size` to max 100, reject negative `page` with `400`.

**Not found / referential integrity**
- Any `{id}` path referencing a missing resource -> `404 Not Found`.
- Deleting a `Project` cascades to its `Task`s and `Comment`s (hard delete, no soft-delete/undo
  in v1) — the API requires a `confirm=true` query param to guard against accidental calls.
- Deleting a `User` who owns one or more projects -> `409 Conflict`; ownership must be
  transferred or the project deleted first (manual step in v1, no bulk reassignment tool).

**Concurrency**
- Task updates use a `version` column (optimistic locking). `PUT /api/tasks/{id}` requires the
  client's known version; a stale write -> `409 Conflict` with the current server copy of the
  task so the client can re-merge.

**Payload limits**
- Request bodies capped at 1 MB by the server (framework default); oversized -> `413`.
- String field lengths enforced both in Bean Validation and DB column constraints so a
  validation bypass can't corrupt data silently.

**Out-of-band errors**
- Unhandled exceptions -> `500 Internal Server Error` via a global exception handler; no stack
  traces leaked to the client, only logged server-side.
- Database unavailable at startup -> app fails fast (no silent degraded mode).

## 5. Out of Scope for v1

- File/image attachments on tasks or comments
- Real-time updates (WebSockets/SSE); client polls or refetches on action
- Email notifications, digest emails, reminders
- Password reset / forgot-password flow (v1 assumes admin resets manually via DB or a future
  endpoint)
- OAuth / social login / SSO
- Multi-tenancy (multiple organizations per deployment)
- Subtasks, task dependencies, recurring tasks
- Time tracking / estimates / burndown or velocity reporting
- Activity feed / audit log
- Full-text search across tasks/comments
- Comment editing (delete-and-repost only) or comment threading/replies
- Project ownership transfer
- Rate limiting, CAPTCHA, account lockout after failed logins
- Refresh tokens / "remember me" (JWT simply expires and the user re-logs-in)
- Mobile app; i18n/localization
- Webhooks or third-party integrations

## 6. Open Questions for Approval

1. Is a single app-wide `ADMIN` role sufficient, or do you want per-project admin delegation
   beyond `OWNER`/`MEMBER`?
2. Should project deletion be a hard cascade delete in v1 (as specced), or do you want
   soft-delete/archive-only semantics instead?
3. JWT expiry of 1h with no refresh token means users re-login hourly — acceptable for v1?

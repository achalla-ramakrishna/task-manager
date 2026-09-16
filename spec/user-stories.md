# User Stories — v1

Companion to [`spec.md`](./spec.md). Each story maps to endpoints and boundary cases already
defined there (section references in brackets). Acceptance criteria use Given/When/Then so they
can be turned into integration tests directly — see `AGENTS.md` Testing section.

## Authentication & Account

### US-1: Register an account
As a new user, I want to register with my email, name, and password, so that I can start using
the app.
- **Endpoints**: `POST /api/auth/register` [§3]
- Given a unique email and a password of 8+ characters, when I register, then I get a `201`
  and can subsequently log in.
- Given an email already registered, when I try to register again, then I get `409 Conflict`
  and no duplicate account is created. [§4]
- Given a password under 8 characters, when I register, then I get `400` with a
  `validationErrors` entry for `password`. [§4]

### US-2: Log in
As a registered user, I want to log in with my email and password, so that I get a token to
access the app.
- **Endpoints**: `POST /api/auth/login` [§3]
- Given correct credentials, when I log in, then I receive a JWT and my user profile.
- Given an incorrect password or unknown email, when I log in, then I get a generic
  `401 Unauthorized` (no hint about which field was wrong). [§4]

### US-3: View my profile
As a logged-in user, I want to see who I'm logged in as, so that the UI can show my identity.
- **Endpoints**: `GET /api/users/me` [§3]
- Given a valid JWT, when I call this endpoint, then I get my user profile (no password hash).
- Given a missing, expired, or malformed JWT, when I call this endpoint, then I get `401`. [§4]

## Projects

### US-4: Create a project
As a logged-in user, I want to create a project, so that I can start organizing tasks under it.
- **Endpoints**: `POST /api/projects` [§3]
- Given a valid name, when I create a project, then I become its `OWNER` member automatically.
- Given a blank or over-length name, when I submit, then I get `400` with `validationErrors`. [§4]

### US-5: See my projects
As a logged-in user, I want to see a list of projects I belong to, so that I can navigate to one.
- **Endpoints**: `GET /api/projects` [§3]
- Given I am a member of 3 projects and not a member of others, when I list projects, then only
  those 3 appear, paginated per the pagination convention. [§3]

### US-6: Update or archive a project
As a project `OWNER`, I want to rename, redescribe, or archive my project, so that I can keep it
current or retire it without deleting history.
- **Endpoints**: `PUT /api/projects/{id}` [§3]
- Given I am the `OWNER`, when I update the project, then the changes save.
- Given I am a `MEMBER` (not `OWNER`), when I attempt to update, then I get `403`. [§4]

### US-7: Delete a project
As a project `OWNER`, I want to delete a project I no longer need, so that it and its tasks stop
cluttering the workspace.
- **Endpoints**: `DELETE /api/projects/{id}?confirm=true` [§3]
- Given I am the `OWNER` and pass `confirm=true`, when I delete the project, then it and all its
  tasks/comments are hard-deleted. [§4]
- Given I omit `confirm=true`, when I attempt delete, then the request is rejected (guards
  against accidental calls). [§4]
- Given I am not the `OWNER`, when I attempt delete, then I get `403`. [§4]

### US-8: Manage project membership
As a project `OWNER`, I want to add and remove members, so that I can control who can see and
work on the project.
- **Endpoints**: `GET/POST /api/projects/{id}/members`, `DELETE /api/projects/{id}/members/{userId}` [§3]
- Given I am the `OWNER`, when I add a user by id, then they appear in the member list as
  `MEMBER` and can now see the project.
- Given I am the `OWNER` and try to remove myself, when I attempt it, then I get `409` — I must
  delete the project instead (no ownership transfer in v1). [§4]
- Given I am a `MEMBER` (not `OWNER`), when I try to add/remove members, then I get `403`. [§4]

## Tasks

### US-9: Create a task
As a project member, I want to create a task in a project, so that work is tracked.
- **Endpoints**: `POST /api/projects/{id}/tasks` [§3]
- Given I am a member of the project, when I create a task with a title, then it's created with
  default `status: TODO` and `priority: MEDIUM`.
- Given I assign the task to a user who isn't a project member, when I submit, then I get `400`. [§4]
- Given I am not a member of the project, when I try to create a task in it, then I get `403`. [§4]

### US-10: View and filter tasks
As a project member, I want to list and filter tasks by status, assignee, or priority, so that I
can find what I need (e.g. a Kanban board view).
- **Endpoints**: `GET /api/projects/{id}/tasks?status=&assigneeId=&priority=` [§3]
- Given tasks with mixed statuses, when I filter by `status=DONE`, then only completed tasks
  return, paginated.

### US-11: Update a task
As a project member, I want to edit a task's fields, so that I can keep it current.
- **Endpoints**: `PUT /api/tasks/{id}` [§3]
- Given I hold the task's current `version`, when I submit an update with that version, then it
  saves and the version increments.
- Given someone else updated the task first (stale `version`), when I submit my update, then I
  get `409 Conflict` with the current server copy so I can re-merge. [§4]

### US-12: Move a task's status (board drag-and-drop)
As a project member, I want a lightweight way to change just a task's status, so that
dragging a card on a board doesn't require sending the whole task payload.
- **Endpoints**: `PATCH /api/tasks/{id}/status` [§3]
- Given a valid target status (`TODO`/`IN_PROGRESS`/`DONE`), when I patch it, then only the
  status (and `updatedAt`) changes.
- Given an invalid status value, when I patch it, then I get `400`. [§4]

### US-13: Delete a task
As a project `OWNER` or the task's creator, I want to delete a task, so that stale or duplicate
work items don't linger.
- **Endpoints**: `DELETE /api/tasks/{id}` [§3]
- Given I am the `OWNER` or the creator, when I delete the task, then it and its comments are
  removed.
- Given I am neither, when I attempt delete, then I get `403`. [§4]

## Comments

### US-14: Discuss a task
As a project member, I want to add comments to a task, so that context and decisions are
recorded alongside the work.
- **Endpoints**: `GET/POST /api/tasks/{id}/comments` [§3]
- Given a non-empty comment body, when I post it, then it appears at the end of the task's
  comment list (oldest first).
- Given an empty or over-length body, when I submit, then I get `400`. [§4]
- Given I am not a member of the task's project, when I try to comment, then I get `403`. [§4]

### US-15: Remove a comment
As a comment's author or the project `OWNER`, I want to delete a comment, so that mistakes or
stale remarks can be cleaned up (comments are not editable in v1 — see [§5]).
- **Endpoints**: `DELETE /api/comments/{id}` [§3]
- Given I authored the comment or I am the project `OWNER`, when I delete it, then it's removed.
- Given I am neither, when I attempt delete, then I get `403`. [§4]

## Not Covered Here

Anything listed under `spec.md` §5 "Out of Scope for v1" (attachments, real-time updates,
notifications, password reset, SSO, subtasks, time tracking, search, etc.) has no user story
here by design — adding one is a signal that scope is expanding and `spec.md` needs updating
first.

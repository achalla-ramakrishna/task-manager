# US-7: Delete a project

[← Back to index](./README.md)

**Actor + Goal**: As a project `OWNER`, I want to delete a project I no longer need, so that it
and its tasks stop cluttering the workspace.

**Endpoints**: `DELETE /api/projects/{id}?confirm=true` [§3]

**State Change**: `Project` row, all its `Task` rows, and all `Comment` rows on those tasks are
hard-deleted (cascade, no soft-delete/undo in v1) [§4].

**Examples**:
- Request: `DELETE /api/projects/10?confirm=true`
- Response: `204 No Content`

**Acceptance Criteria**:
- Given I am the `OWNER` and pass `confirm=true`, when I delete the project, then a subsequent
  `GET /api/projects/10` returns `404`, and all its tasks/comments are gone too.

**Boundaries & Failure States** [§4]:
- Given I omit the `confirm=true` query param, when I attempt delete, then the request is
  rejected with `400` (guards against an accidental/scripted delete).
- Given I am a `MEMBER` (not `OWNER`), when I attempt delete, then I get `403`.
- Given a project id that doesn't exist, when I attempt delete, then I get `404`.

**Not in Scope**: Soft-delete, an "undo" window, or exporting project data before deletion —
none exist in v1; this is a deliberate, irreversible action [§5].

**Checks That Prove It**: `ProjectControllerIT#delete_ownerWithConfirm_cascadesToTasks`,
`ProjectControllerIT#delete_withoutConfirm_returns400`,
`ProjectControllerIT#delete_memberForbidden_returns403`.

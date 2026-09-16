# US-13: Delete a task

[← Back to index](./README.md)

**Actor + Goal**: As a project `OWNER` or the task's creator, I want to delete a task, so that
stale or duplicate work items don't linger.

**Endpoints**: `DELETE /api/tasks/{id}` [§3]

**State Change**: `Task` row and all its `Comment` rows are hard-deleted.

**Examples**:
- Request: `DELETE /api/tasks/100`
- Response: `204 No Content`

**Acceptance Criteria**:
- Given I am the project `OWNER` or the task's creator, when I delete the task, then a
  subsequent `GET /api/tasks/100` returns `404`, and its comments are gone too.

**Boundaries & Failure States** [§4]:
- Given I am neither the `OWNER` nor the creator, when I attempt delete, then I get `403`.
- Given a task id that doesn't exist, when I attempt delete, then I get `404`.

**Not in Scope**: Soft-delete/undo, deleting multiple tasks in one call — not in v1 [§5].

**Checks That Prove It**: `TaskControllerIT#delete_ownerOrCreatorCanDelete_cascadesComments`,
`TaskControllerIT#delete_otherMemberForbidden_returns403`.

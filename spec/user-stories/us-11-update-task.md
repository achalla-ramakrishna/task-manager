# US-11: Update a task

[← Back to index](./README.md)

**Actor + Goal**: As a project member, I want to edit a task's fields, so that I can keep it
current.

**Endpoints**: `PUT /api/tasks/{id}` [§3]

**State Change**: `Task` fields update; `version` increments by 1 on every successful write
(optimistic locking) [§4].

**Examples**:
- Request: `PUT /api/tasks/100 {"title":"Set up CI pipeline","status":"IN_PROGRESS","priority":"HIGH","version":0}`
- Response `200`: updated task with `version: 1`.

**Acceptance Criteria**:
- Given I hold the task's current `version`, when I submit an update carrying that version, then
  it saves, `version` increments, and the response reflects the change.

**Boundaries & Failure States** [§4]:
- Given someone else updated the task first (my submitted `version` is stale), when I submit my
  update, then I get `409 Conflict` with the current server copy of the task in the response
  body, so I can re-merge instead of silently overwriting.
- Given I submit an invalid enum for `status` or `priority`, when I update, then I get `400`.
- Given a task id that doesn't exist, when I update, then I get `404`.

**Not in Scope**: Field-level (partial) `PATCH` for arbitrary fields — only `status` gets a
dedicated `PATCH` endpoint (see [US-12](./us-12-patch-task-status.md)); everything else goes
through the full `PUT` with version checking.

**Checks That Prove It**: `TaskControllerIT#update_success_versionIncrements`,
`TaskControllerIT#update_staleVersion_returns409WithCurrentCopy`,
`TaskControllerIT#update_invalidEnum_returns400`.

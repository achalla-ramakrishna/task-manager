# US-12: Move a task's status (board drag-and-drop)

[← Back to index](./README.md)

**Actor + Goal**: As a project member, I want a lightweight way to change just a task's status,
so that dragging a card on a board doesn't require sending the whole task payload.

**Endpoints**: `PATCH /api/tasks/{id}/status` [§3]

**State Change**: Only `Task.status` and `updatedAt` change; no other fields are touched by this
endpoint's contract.

**Examples**:
- Request: `PATCH /api/tasks/100/status {"status":"DONE"}`
- Response `200`: `{"id":100,"status":"DONE","updatedAt":"2026-09-16T..."}`

**Acceptance Criteria**:
- Given a valid target status (`TODO`/`IN_PROGRESS`/`DONE`), when I patch it, then only the
  status (and `updatedAt`) changes — no other field is affected.

**Boundaries & Failure States** [§4]:
- Given an invalid status value, when I patch it, then I get `400`.
- Given I am not a member of the task's project, when I patch it, then I get `403`.
- Given a task id that doesn't exist, when I patch it, then I get `404`.

**Not in Scope**: Status transition rules (e.g. blocking `TODO` -> `DONE` without passing
through `IN_PROGRESS`) — v1 allows any-to-any status transition, no workflow engine [§5].

**Checks That Prove It**: `TaskControllerIT#patchStatus_success_onlyStatusChanges`,
`TaskControllerIT#patchStatus_invalidValue_returns400`,
`TaskControllerIT#patchStatus_nonMemberForbidden_returns403`.

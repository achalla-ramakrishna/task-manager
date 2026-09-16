# US-10: View and filter tasks

[← Back to index](./README.md)

**Actor + Goal**: As a project member, I want to list and filter tasks by status, assignee, or
priority, so that I can find what I need (e.g. a Kanban board view).

**Endpoints**: `GET /api/projects/{id}/tasks?status=&assigneeId=&priority=` [§3]

**State Change**: None — pure read.

**Examples**:
- Request: `GET /api/projects/10/tasks?status=DONE&page=0&size=20`
- Response `200`: paginated envelope containing only `DONE` tasks in project 10.

**Acceptance Criteria**:
- Given tasks with mixed statuses in a project, when I filter by `status=DONE`, then only
  completed tasks return, in the standard paginated envelope.
- Given no filters, when I list tasks, then all tasks in the project return (paginated).

**Boundaries & Failure States** [§4]:
- Given an invalid `status` filter value (e.g. `status=WONTFIX`), when I request, then I get
  `400`.
- Given I am not a member of the project, when I try to list its tasks, then I get `403`.

**Not in Scope**: Full-text search over task titles/descriptions, saved filter views [§5].

**Checks That Prove It**: `TaskControllerIT#list_filtersByStatus`,
`TaskControllerIT#list_invalidStatusFilter_returns400`,
`TaskControllerIT#list_nonMemberForbidden_returns403`.

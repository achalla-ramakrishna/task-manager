# US-9: Create a task

[← Back to index](./README.md)

**Actor + Goal**: As a project member, I want to create a task in a project, so that work is
tracked.

**Endpoints**: `POST /api/projects/{id}/tasks` [§3]

**State Change**: No task exists -> a `Task` row exists under the project with `status: TODO`,
`priority: MEDIUM` (defaults), `version: 0`.

**Examples**:
- Request: `{"title":"Set up CI pipeline","assigneeId":7,"dueDate":"2026-10-01"}`
- Response `201`: `{"id":100,"projectId":10,"title":"Set up CI pipeline","status":"TODO","priority":"MEDIUM","version":0}`

**Acceptance Criteria**:
- Given I am a member of the project, when I create a task with just a `title`, then it's
  created with default `status: TODO` and `priority: MEDIUM`.

**Boundaries & Failure States** [§4]:
- Given I assign the task (`assigneeId`) to a user who isn't a member of this project, when I
  submit, then I get `400`.
- Given I am not a member of the project, when I try to create a task in it, then I get `403`.
- Given a blank `title` or a `title` over 200 characters, when I submit, then I get `400`.
- Given a malformed `dueDate`, when I submit, then I get `400` (a past `dueDate` is **allowed**
  — v1 does not block backdating [§4]).

**Not in Scope**: Subtasks, task templates, bulk task creation/import — all out of scope [§5].

**Checks That Prove It**: `TaskControllerIT#create_success_defaultsApplied`,
`TaskControllerIT#create_assigneeNotProjectMember_returns400`,
`TaskControllerIT#create_nonMemberForbidden_returns403`.

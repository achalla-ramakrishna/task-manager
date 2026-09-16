# US-14: Discuss a task

[← Back to index](./README.md)

**Actor + Goal**: As a project member, I want to add comments to a task, so that context and
decisions are recorded alongside the work.

**Endpoints**: `GET/POST /api/tasks/{id}/comments` [§3]

**State Change**: A `Comment` row is created, linked to the task and to me as `authorId`; it is
immutable after creation (no edit endpoint exists) [§5].

**Examples**:
- Request: `POST /api/tasks/100/comments {"body":"Blocked on infra access, pinged DevOps"}`
- Response `201`: `{"id":500,"taskId":100,"authorId":1,"body":"Blocked on infra access, pinged DevOps","createdAt":"2026-09-16T..."}`

**Acceptance Criteria**:
- Given a non-empty comment body (<=2000 chars), when I post it, then it appears at the end of
  `GET /api/tasks/100/comments` (oldest first, paginated).

**Boundaries & Failure States** [§4]:
- Given an empty/blank body, when I submit, then I get `400`.
- Given a body over 2000 characters, when I submit, then I get `400`.
- Given I am not a member of the task's project, when I try to comment, then I get `403`.

**Not in Scope**: Editing a posted comment, threaded replies, @mentions, reactions — all
deliberately excluded from v1 [§5].

**Checks That Prove It**: `CommentControllerIT#post_success_appearsOldestFirst`,
`CommentControllerIT#post_blankBody_returns400`,
`CommentControllerIT#post_nonMemberForbidden_returns403`.

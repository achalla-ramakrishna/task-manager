# US-15: Remove a comment

[← Back to index](./README.md)

**Actor + Goal**: As a comment's author or the project `OWNER`, I want to delete a comment, so
that mistakes or stale remarks can be cleaned up (comments are not editable in v1, so delete is
the only correction mechanism — see [US-14](./us-14-add-comment.md)'s Not in Scope).

**Endpoints**: `DELETE /api/comments/{id}` [§3]

**State Change**: `Comment` row is hard-deleted; the task and other comments are unaffected.

**Examples**:
- Request: `DELETE /api/comments/500`
- Response: `204 No Content`

**Acceptance Criteria**:
- Given I authored the comment, when I delete it, then it no longer appears in the task's
  comment list.
- Given I am the project `OWNER` (but not the author), when I delete someone else's comment on a
  task in my project, then it is removed.

**Boundaries & Failure States** [§4]:
- Given I am neither the author nor the project `OWNER`, when I attempt delete, then I get
  `403`.
- Given a comment id that doesn't exist, when I attempt delete, then I get `404`.

**Not in Scope**: Notifying the comment author that their comment was removed by an `OWNER` — no
notification system exists in v1 [§5].

**Checks That Prove It**: `CommentControllerIT#delete_authorCanDelete`,
`CommentControllerIT#delete_ownerCanDeleteOthersComment`,
`CommentControllerIT#delete_otherMemberForbidden_returns403`.

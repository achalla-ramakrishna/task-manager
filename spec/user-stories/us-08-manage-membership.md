# US-8: Manage project membership

[← Back to index](./README.md)

**Actor + Goal**: As a project `OWNER`, I want to add and remove members, so that I can control
who can see and work on the project.

**Endpoints**: `GET/POST /api/projects/{id}/members`, `DELETE /api/projects/{id}/members/{userId}` [§3]

**State Change**: A `ProjectMember` row is created (role `MEMBER`) or removed for the given
`userId` + `projectId` pair.

**Examples**:
- Request: `POST /api/projects/10/members {"userId":7}`
- Response `201`: `{"projectId":10,"userId":7,"role":"MEMBER","joinedAt":"2026-09-16T..."}`

**Acceptance Criteria**:
- Given I am the `OWNER`, when I add a user by id, then they appear in `GET
  /api/projects/{id}/members` as `MEMBER` and can now see the project and its tasks.
- Given I am the `OWNER`, when I remove a `MEMBER`, then they lose access — their next call to
  any endpoint under that project returns `403`.

**Boundaries & Failure States** [§4]:
- Given I (the `OWNER`) try to remove myself, when I attempt it, then I get `409` — I must
  delete the project instead, since v1 has no ownership transfer.
- Given I am a `MEMBER` (not `OWNER`), when I try to add or remove members, then I get `403`.
- Given a `userId` that doesn't exist, when I try to add them, then I get `404`.
- Given a `userId` already a member, when I try to add them again, then I get `409` (no
  duplicate membership rows).

**Not in Scope**: Ownership transfer, per-project roles beyond `OWNER`/`MEMBER`, bulk
add/remove — all out of scope for v1 [§5].

**Checks That Prove It**: `ProjectMemberControllerIT#add_ownerCanAddMember`,
`ProjectMemberControllerIT#remove_ownerCannotRemoveSelf_returns409`,
`ProjectMemberControllerIT#add_memberForbidden_returns403`,
`ProjectMemberControllerIT#add_duplicateMember_returns409`.

# US-6: Update or archive a project

[← Back to index](./README.md)

**Actor + Goal**: As a project `OWNER`, I want to rename, redescribe, or archive my project, so
that I can keep it current or retire it without deleting history.

**Endpoints**: `PUT /api/projects/{id}` [§3]

**State Change**: `Project.status` moves `ACTIVE` -> `ARCHIVED` (or fields update) while the
project and its tasks remain queryable.

**Examples**:
- Request: `{"name":"Website Revamp","description":"Done for Q1","status":"ARCHIVED"}`
- Response `200`: the updated project.

**Acceptance Criteria**:
- Given I am the project's `OWNER`, when I submit valid updated fields, then the response
  reflects the new values and `updatedAt` advances.

**Boundaries & Failure States** [§4]:
- Given I am a `MEMBER` (not `OWNER`) of the project, when I attempt to update it, then I get
  `403`.
- Given I am not a member of the project at all, when I attempt to update it, then I get `403`
  (consistent with how non-members are treated on reads too — existence isn't leaked).
- Given a project id that doesn't exist, when I attempt to update it, then I get `404`.

**Not in Scope**: Reverting `ARCHIVED` back to `ACTIVE` is allowed by this same endpoint (just
set `status: ACTIVE`) — there is no separate "unarchive" endpoint, and no restriction preventing
it, so no separate story is needed for it.

**Checks That Prove It**: `ProjectControllerIT#update_ownerCanUpdate`,
`ProjectControllerIT#update_memberForbidden_returns403`,
`ProjectControllerIT#update_unknownId_returns404`.

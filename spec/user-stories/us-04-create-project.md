# US-4: Create a project

[← Back to index](./README.md)

**Actor + Goal**: As a logged-in user, I want to create a project, so that I can start
organizing tasks under it.

**Endpoints**: `POST /api/projects` [§3]

**State Change**: No project exists -> a `Project` row exists with `status: ACTIVE`, `ownerId`
set to me, and a `ProjectMember` row links me as `OWNER`.

**Examples**:
- Request: `{"name":"Website Revamp","description":"Q1 marketing site refresh"}`
- Response `201`: `{"id":10,"name":"Website Revamp","status":"ACTIVE","ownerId":1}`

**Acceptance Criteria**:
- Given a valid `name` (<=150 chars), when I create a project, then I become its sole `OWNER`
  member automatically — no separate "add member" call needed for myself.

**Boundaries & Failure States** [§4]:
- Given a blank `name`, when I submit, then I get `400` with `validationErrors`.
- Given a `name` over 150 characters, when I submit, then I get `400`.
- Given a `description` over 2000 characters, when I submit, then I get `400`.

**Not in Scope**: Project templates, cloning an existing project, setting a custom initial
status other than `ACTIVE`.

**Checks That Prove It**: `ProjectControllerIT#create_success_creatorBecomesOwner`,
`ProjectControllerIT#create_blankName_returns400`.

# US-5: See my projects

[← Back to index](./README.md)

**Actor + Goal**: As a logged-in user, I want to see a list of projects I belong to, so that I
can navigate to one.

**Endpoints**: `GET /api/projects` [§3]

**State Change**: None — pure read.

**Examples**:
- Request: `GET /api/projects?page=0&size=20`
- Response `200`: `{"content":[{"id":10,"name":"Website Revamp","status":"ACTIVE"}],"page":0,"size":20,"totalElements":1,"totalPages":1}`

**Acceptance Criteria**:
- Given I am a member of 3 projects (as `OWNER` or `MEMBER`) and not a member of 2 others, when
  I list projects, then exactly those 3 appear, in the paginated envelope from `spec.md` §3.

**Boundaries & Failure States** [§4]:
- Given `size=500` (over the max), when I request, then `size` is clamped to 100, not rejected.
- Given `page=-1`, when I request, then I get `400`.
- Given I belong to zero projects, when I list, then I get `200` with an empty `content` array
  (not a `404`).

**Not in Scope**: Full-text search over project names, sorting options beyond the default —
neither exists in v1 [§5].

**Checks That Prove It**: `ProjectControllerIT#list_returnsOnlyMyProjects`,
`ProjectControllerIT#list_invalidPage_returns400`,
`ProjectControllerIT#list_oversizedSize_clampsTo100`.

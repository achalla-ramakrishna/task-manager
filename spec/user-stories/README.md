# User Stories — v1

Companion to [`../spec.md`](../spec.md). Every story in this folder follows the same seven-part
template so it's directly testable, not just descriptive:

| Part | Answers |
|---|---|
| **Actor + Goal** | Who wants what, and why |
| **State Change** | What moves from one state to another |
| **Examples** | Concrete sample input/output, not abstract description |
| **Acceptance Criteria** | Given/When/Then for the happy path(s) |
| **Boundaries & Failure States** | What happens at the edges and when things go wrong |
| **Not in Scope** | What this story deliberately does not cover |
| **Checks That Prove It** | The specific test(s) that must exist and pass |

Section references in each story (e.g. `[§4]`) point back to `spec.md`.

## Authentication & Account
- [US-1: Register an account](./us-01-register-account.md)
- [US-2: Log in](./us-02-log-in.md)
- [US-3: View my profile](./us-03-view-profile.md)

## Projects
- [US-4: Create a project](./us-04-create-project.md)
- [US-5: See my projects](./us-05-list-projects.md)
- [US-6: Update or archive a project](./us-06-update-project.md)
- [US-7: Delete a project](./us-07-delete-project.md)
- [US-8: Manage project membership](./us-08-manage-membership.md)

## Tasks
- [US-9: Create a task](./us-09-create-task.md)
- [US-10: View and filter tasks](./us-10-list-filter-tasks.md)
- [US-11: Update a task](./us-11-update-task.md)
- [US-12: Move a task's status (board drag-and-drop)](./us-12-patch-task-status.md)
- [US-13: Delete a task](./us-13-delete-task.md)

## Comments
- [US-14: Discuss a task](./us-14-add-comment.md)
- [US-15: Remove a comment](./us-15-delete-comment.md)

## Not Covered Here

Anything listed under `spec.md` §5 "Out of Scope for v1" (attachments, real-time updates,
notifications, password reset, SSO, subtasks, time tracking, search, etc.) has no user story
here by design — adding one is a signal that scope is expanding and `spec.md` needs updating
first.

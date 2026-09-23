# Contributing to the University Clearance System

This document explains how team members should work with Git and GitHub.

The purpose is to keep the project organized, prevent accidental changes to `main`, and make code review easier.

---

# 1. Main Rule

## Never work directly on `main`.

The `main` branch contains the reviewed and integrated version of the project.

All development must happen on a feature or fix branch.

```text
main
  ↑
  │ Pull Request
  │
feature branch
  ↑
  │
Member development
```

---

# 2. Pull Request Rule

Every change must go through a Pull Request.

The workflow is:

```text
Create branch
     ↓
Develop
     ↓
Test locally
     ↓
Commit
     ↓
Push branch
     ↓
Create Pull Request
     ↓
Technical Lead reviews
     ↓
Changes requested OR approved
     ↓
Technical Lead merges
     ↓
main
```

## Important

**Only the Technical Lead merges Pull Requests into `main`.**

Members must not merge their own Pull Requests.

---

# 3. Getting the Project

Clone the repository:

```bash
git clone <repository-url>
cd university-clearance-system
```

Check the remote:

```bash
git remote -v
```

---

# 4. Before Starting Work

Always make sure your local `main` is up to date:

```bash
git checkout main
git pull origin main
```

Then create a new branch.

Do not continue working on an old branch if the work has already been merged.

---

# 5. Creating a Branch

Branch names should describe the work.

Examples:

```text
feature/student-dashboard
feature/officer-dashboard
feature/registrar-dashboard
feature/login-page
feature/notifications
feature/issue-management
feature/clearance-form

fix/login-validation
fix/clearance-status

docs/update-readme
docs/api-documentation
```

Create a branch:

```bash
git checkout -b feature/student-dashboard
```

Newer Git syntax can also be used:

```bash
git switch -c feature/student-dashboard
```

---

# 6. Work Only on Your Assigned Task

Before coding, understand:

* What you are building
* Which role uses it
* What data it needs
* Which other modules it depends on
* What the expected behavior is

Do not make unrelated changes.

For example, if you are working on:

```text
feature/student-dashboard
```

do not also change:

```text
Registrar dashboard
Backend authentication
Database structure
```

unless the change is necessary and has been discussed.

---

# 7. Pulling New Changes

While other members are working, `main` may change.

Before opening your Pull Request, update your branch.

First commit your own work:

```bash
git add .
git commit -m "feat: add student dashboard"
```

Then update:

```bash
git checkout main
git pull origin main
```

Return to your branch:

```bash
git checkout feature/student-dashboard
```

Then update it from `main`:

```bash
git merge main
```

Resolve any conflicts carefully.

Then test your feature again.

---

# 8. Check Your Changes

Before committing:

```bash
git status
```

Review what changed:

```bash
git diff
```

Make sure you did not accidentally modify unrelated files.

Check the project locally before pushing.

---

# 9. Commit Messages

Commit messages should explain what changed.

Use this general format:

```text
type: short description
```

Examples:

```text
feat: add student dashboard
feat: add clearance progress component
feat: add issue display
feat: add registrar search

fix: correct clearance status
fix: prevent empty student ID
fix: fix notification rendering

docs: update team roles
docs: add mock data guide

test: add clearance workflow tests

refactor: simplify status component
```

Avoid messages such as:

```text
update
changes
test
final
final version
important
everything
```

---

# 10. Keep Commits Focused

A commit should represent a logical change.

Good:

```text
feat: add student clearance status component
```

Then another:

```text
feat: add student issue display
```

Avoid putting unrelated work into one commit:

```text
feat: add dashboard + fix login + change database + update docs
```

---

# 11. Push Your Branch

After committing:

```bash
git push -u origin feature/student-dashboard
```

For later pushes to the same branch:

```bash
git push
```

---

# 12. Creating a Pull Request

After pushing your branch:

1. Open the GitHub repository.
2. Open your branch.
3. Click **Compare & pull request**.
4. Set the base branch to:

```text
main
```

5. Give the Pull Request a clear title.
6. Explain what you changed.
7. Explain how you tested it.
8. Mention anything the reviewer should pay attention to.
9. Submit the Pull Request.

---

# 13. Pull Request Title

Use the same style as commit messages.

Examples:

```text
feat: add student dashboard
feat: implement officer issue workflow
feat: add registrar clearance initiation
fix: correct clearance status display
docs: add project setup guide
```

---

# 14. Pull Request Description

A useful Pull Request should answer:

### What did you change?

Example:

```text
Added the student dashboard with:
- Student profile summary
- Clearance progress
- Office status cards
- Active issues
```

### How did you test it?

Example:

```text
Tested:
- Student dashboard loads correctly
- Clearance statuses display correctly
- Open issues appear
- Empty state displays when there are no issues
```

### Anything to know?

Example:

```text
Currently uses mockData.js.
API integration will be added later.
```

---

# 15. Code Review

The Technical Lead reviews every Pull Request before merging.

The review may check:

* Correctness
* Architecture
* Security
* Business rules
* Code quality
* Naming
* Folder structure
* Reusability
* Error handling
* Testing
* Consistency with the project guide

The reviewer may:

```text
Approve
```

or:

```text
Request changes
```

---

# 16. When Changes Are Requested

Do not create a completely new Pull Request unless instructed.

Continue working on the same branch.

For example:

```bash
git checkout feature/student-dashboard
```

Make the requested changes:

```bash
git add .
git commit -m "fix: address review comments"
git push
```

The existing Pull Request will automatically update.

The Technical Lead reviews it again.

---

# 17. Merge Rule

Only the Technical Lead merges approved Pull Requests.

After approval:

```text
Pull Request
     ↓
Approved
     ↓
Technical Lead merges
     ↓
main
```

Members should not:

* Merge their own PR
* Approve their own PR
* Push directly to `main`
* Force-push `main`

---

# 18. After Your Pull Request Is Merged

Once the Technical Lead confirms the Pull Request is merged:

Delete the local branch if it is no longer needed:

```bash
git branch -d feature/student-dashboard
```

Then update your local `main`:

```bash
git checkout main
git pull origin main
```

For your next task, create a new branch from the updated `main`.

```bash
git checkout -b feature/new-task
```

---

# 19. Do Not Reuse Old Feature Branches

Avoid continuing to use a branch after it has been merged.

Bad:

```text
feature/student-dashboard
```

for:

```text
Student dashboard
Issue system
Notifications
Profile
History
```

Instead:

```text
feature/student-dashboard
feature/student-issues
feature/student-notifications
feature/student-history
```

This keeps Pull Requests small and easier to review.

---

# 20. Merge Conflicts

If Git reports a conflict:

```text
CONFLICT
```

Do not randomly delete code.

First understand:

* What your branch changed
* What `main` changed
* Why both changes exist

Resolve the conflict carefully.

After resolving:

```bash
git status
git add .
git commit
```

Then test the application again.

If you are unsure how to resolve a conflict, ask the Technical Lead before proceeding.

---

# 21. Do Not Commit Secrets

Never commit:

```text
.env
passwords
API keys
JWT secrets
database passwords
private credentials
real university credentials
```

The `.gitignore` is configured to help prevent this.

If a secret is accidentally committed, tell the Technical Lead immediately.

Do not assume deleting the file in a later commit makes the secret safe.

---

# 22. Do Not Commit Generated Dependencies

Do not commit:

```text
node_modules/
.venv/
__pycache__/
dist/
build/
```

These are already handled by `.gitignore`.

---

# 23. Working With Mock Data

During frontend development, the project uses:

```text
frontend/src/data/mockData.js
```

Before changing mock data:

* Understand the relationships
* Preserve IDs
* Check references
* Keep realistic statuses
* Do not create impossible states

See:

```text
docs/MOCK_DATA_GUIDE.md
```

for the complete rules.

---

# 24. Working Across Modules

Sometimes a feature crosses multiple modules.

For example:

```text
Student Dashboard
       ↓
Clearance API
       ↓
Backend Clearance
```

If your task requires changes outside your assigned module:

1. Explain why the change is necessary.
2. Discuss it with the affected member.
3. Discuss architectural changes with the Technical Lead.
4. Keep the changes as small as possible.

Do not silently take ownership of another member's module.

---

# 25. Branch Protection

The `main` branch should be protected on GitHub.

Recommended settings:

* Require Pull Request before merging
* Require approval
* Prevent direct pushes
* Prevent force pushes
* Require conversation resolution when appropriate
* Require status checks once CI is configured

The goal is:

```text
No Pull Request
      ↓
   No merge
      ↓
     main
```

---

# 26. Team Development Cycle

Every task should follow this cycle:

```text
1. Understand task
        ↓
2. Update from main
        ↓
3. Create branch
        ↓
4. Implement
        ↓
5. Test
        ↓
6. Commit
        ↓
7. Push
        ↓
8. Create Pull Request
        ↓
9. Code review
        ↓
10. Fix review comments
        ↓
11. Approval
        ↓
12. Technical Lead merges
        ↓
13. Update local main
        ↓
14. Start next task
```

---

# 27. Definition of a Good Pull Request

A good Pull Request is:

* Focused
* Small enough to review
* Tested
* Clearly described
* Related to one task
* Free of unrelated changes
* Consistent with the project architecture

A Pull Request should make the reviewer think:

> "I understand what changed, why it changed, and how it was tested."

---

# 28. Team Rule

The most important Git rule for this project is:

> **Everyone contributes through branches and Pull Requests. The Technical Lead reviews and merges into `main`.**

This protects the project while still allowing every member to contribute independently.

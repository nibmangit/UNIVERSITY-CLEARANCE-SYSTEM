# University Clearance System

# Team Roles and Responsibilities

## 1. Purpose of This Document

This document defines the responsibilities of all eight project members.

Every member has a specific area of ownership, but everyone is expected to understand the overall system.

The project follows a **module ownership + technical review** approach.

Each member is responsible for implementing and understanding their assigned module.

The Technical Lead coordinates the architecture and reviews all Pull Requests before merging them into `main`.

---

# 2. Team Structure

| Member   | Primary Role                                     | Main Responsibility                                                                 |
| -------- | ------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Member 1 | Technical Lead / Backend Lead                    | Architecture, backend foundation, database, authentication, core clearance workflow |
| Member 2 | Frontend Lead                                    | React architecture, routing, shared components, frontend integration                |
| Member 3 | Student Module Developer                         | Student dashboard and student clearance experience                                  |
| Member 4 | Office Module Developer                          | Office staff dashboard and office clearance processing                              |
| Member 5 | Registrar Module Developer                       | Registrar dashboard, initiation, monitoring and final approval                      |
| Member 6 | UI/UX Designer                                   | Wireframes, UI design, consistency, usability and accessibility                     |
| Member 7 | QA / Testing Engineer                            | Testing strategy, test cases, integration testing and bug verification              |
| Member 8 | Documentation / Presentation + Technical Support | Documentation, presentation, user guide and assigned technical features             |

---

# 3. Important Team Principle

The project is a team project.

Nobody should think:

> "I only need to understand my page."

Every member should understand:

```text
Existing University System
        ↓
Clearance System
        ↓
Student
        ↓
Registrar
        ↓
Six Offices
        ↓
Issues
        ↓
Final Approval
        ↓
Completed Clearance
```

A member may own one module, but they should understand how that module communicates with the others.

---

# 4. Member 1 — Technical Lead / Backend Lead

## Primary Responsibility

Member 1 is responsible for the technical direction and backend foundation of the project.

The Technical Lead is also responsible for reviewing Pull Requests before they are merged into `main`.

## Main Responsibilities

### Architecture

* Define the overall system architecture
* Maintain consistency between frontend and backend
* Decide how modules communicate
* Define API conventions
* Define important business rules
* Review major technical decisions

### Backend Foundation

Build and maintain:

* Django project
* Django REST Framework
* PostgreSQL configuration
* Environment configuration
* Backend application structure
* Base API structure

### Authentication and Authorization

Responsible for:

* Authentication architecture
* JWT/session handling as appropriate
* Role identification
* Permissions
* Protected endpoints
* Authorization rules

Roles include:

```text
STUDENT
OFFICER
REGISTRAR
ADMIN
```

The exact integration with the existing university authentication system must be considered before real deployment.

### Database

Design and implement the clearance-system database structure.

Focus on relationships such as:

```text
Student
   ↓
Clearance
   ↓
ClearanceOffice
   ↓
Issue
```

University-owned data should not automatically be duplicated into our database.

### Core Clearance Workflow

Implement:

* Clearance initiation
* Clearance submission
* Office creation for a clearance
* Office assignment
* Clearance status changes
* Completion checking
* Registrar final approval

Important backend functions may include:

```text
initiate_clearance()
submit_clearance()
clear_office()
create_issue()
resolve_issue()
check_clearance_completion()
final_approve_clearance()
```

### Issue System

Implement the backend logic for:

* Creating issues
* Opening issues
* Resolving issues
* Checking unresolved issues
* Preventing invalid clearance
* Recording who performed actions
* Recording timestamps

### Audit System

Implement important audit records such as:

```text
Who performed the action?
What happened?
Which record was affected?
When did it happen?
```

### Code Review

The Technical Lead:

* Reviews all Pull Requests
* Checks architecture
* Checks security
* Checks business rules
* Checks code quality
* Requests changes when necessary
* Merges approved Pull Requests

Members do not merge their own Pull Requests.

---

# 5. Member 2 — Frontend Lead

## Primary Responsibility

Member 2 owns the overall React frontend architecture.

## Main Responsibilities

### React Foundation

Build and maintain:

* React project structure
* React Router
* Main application structure
* Layout system
* Navigation
* Sidebar
* Navbar
* Protected routes

### Shared Components

Create reusable components such as:

```text
Button
Input
Select
Modal
Table
StatusBadge
NotificationCard
LoadingSpinner
EmptyState
ConfirmDialog
Sidebar
Navbar
```

Components should be reusable rather than duplicated.

### Authentication UI

Build:

* Login page
* Change-password page
* Authentication state handling
* Protected routes
* Role-based navigation

### API Integration

Later, Member 2 coordinates how React communicates with the backend.

For example:

```text
React
   ↓
API Service
   ↓
Django REST API
```

### Frontend Standards

Maintain consistency in:

* Folder structure
* Naming
* Component structure
* API handling
* Error handling
* Loading states
* Responsive behavior

Member 2 should coordinate with Members 3, 4 and 5 because those members will build role-specific interfaces.

---

# 6. Member 3 — Student Module Developer

## Primary Responsibility

Member 3 owns the student's experience.

## Main Pages

```text
/student/dashboard
/student/clearance/:id
/student/clearance/:id/submit
/student/history
/student/notifications
/student/profile
```

## Main Responsibilities

### Student Dashboard

Display:

* Student information
* Active clearance
* Clearance progress
* Office statuses
* Important notifications
* Issues requiring attention

Example:

```text
Advisor          ✓ Cleared
Library          ✓ Cleared
Dormitory        ⚠ Issue
Sport Office     ✓ Cleared
Café             ⏳ Pending
Faculty Store    ⏳ Pending
```

### Student Profile

Display university information such as:

* Student ID
* Full name
* Faculty
* Department
* Section
* Year

Where appropriate, information coming from the university system should be treated as read-only.

### Clearance Form

Build the student form for required clearance information.

The form should not ask the student to re-enter information already available from the university system unless there is a specific reason.

### Submit Clearance

Implement the interface for submitting the clearance.

The backend will enforce the actual submission rules.

### Issues

Students should be able to:

* See issues
* See which office created the issue
* See the reason
* See the description
* See issue status
* See resolution information when available

### History

Display previous clearances.

### Completed Clearance

Provide the interface for:

* Viewing completed clearance
* Downloading/printing the final document

---

# 7. Member 4 — Office Module Developer

## Primary Responsibility

Member 4 owns the workflow used by office staff.

The six offices are:

```text
Advisor
Library
Dormitory
Sport Office
Café
Faculty Store
```

## Main Pages

```text
/officer/dashboard
/officer/clearances
/officer/clearances/:id
```

## Main Responsibilities

### Office Dashboard

Display:

* Assigned students
* Pending clearances
* Flagged issues
* Recently processed clearances
* Office statistics where appropriate

### Student Search

Allow an authorized officer to search for a student.

Search should be based on appropriate information such as:

```text
Student ID
```

### Clearance Details

Display relevant information:

* Student information
* Clearance type
* Current status
* Office status
* Existing issues
* History

### Clear Student

Provide an action to clear a student when the office has no issue.

### Flag Issue

Provide an interface for creating an issue.

Example:

```text
Reason:
Unreturned room key

Description:
Student has not returned the assigned dormitory key.
```

### Resolve Issue

After the student resolves the real-world issue, the officer can:

* Verify the resolution
* Add a resolution note
* Mark the issue resolved
* Clear the office

### Office History

Display previously processed clearance cases.

---

# 8. Member 5 — Registrar Module Developer

## Primary Responsibility

Member 5 owns the Registrar workflow.

## Main Pages

```text
/registrar/dashboard
/registrar/students
/registrar/clearances/initiate
/registrar/clearances/:id
```

## Main Responsibilities

### Registrar Dashboard

Display:

* Active clearances
* Pending submissions
* Pending final approval
* Completed clearances
* Important issues

### Search Student

Registrar should be able to search by Student ID.

### Verify Student

Before initiating clearance, Registrar checks the student's information.

### Initiate Clearance

Registrar selects:

* Student
* Clearance type/reason

Then the backend creates:

```text
Clearance
    ↓
Six ClearanceOffice records
```

### Monitor Clearance

Registrar can see:

```text
Advisor          CLEARED
Library          CLEARED
Dormitory        FLAGGED
Sport Office     CLEARED
Café             PENDING
Faculty Store    PENDING
```

### Issues

Registrar should be able to see relevant issues and their statuses.

### Final Approval

Registrar can approve a clearance only when all required offices are cleared.

The frontend may hide/disable the action, but the backend must enforce the rule.

### Completed Records

Provide access to completed clearance records.

---

# 9. Member 6 — UI/UX Designer

## Primary Responsibility

Member 6 owns the visual and usability direction of the system.

This member works closely with Members 2, 3, 4 and 5.

## Main Responsibilities

### Wireframes

Create wireframes for:

* Login
* Student dashboard
* Student clearance
* Office dashboard
* Office clearance detail
* Registrar dashboard
* Registrar initiation
* Final approval
* Notifications

### Design System

Define consistent:

* Typography
* Spacing
* Buttons
* Forms
* Cards
* Tables
* Status indicators
* Navigation
* Modal styles

### User Experience

Check that workflows are easy to understand.

For example:

```text
Student sees issue
        ↓
Understands what is wrong
        ↓
Knows which office to visit
        ↓
Returns to resolve issue
        ↓
Sees updated status
```

### Accessibility

Consider:

* Readable text
* Keyboard accessibility
* Clear labels
* Error messages
* Status indicators that do not rely only on color
* Responsive layouts

### Design Handoff

Provide designs and clear guidance to frontend developers.

---

# 10. Member 7 — QA / Testing Engineer

## Primary Responsibility

Member 7 owns the testing strategy.

Testing should not happen only at the end.

## Main Responsibilities

### Test Cases

Create test cases for:

* Login
* Authentication
* Authorization
* Student workflow
* Office workflow
* Issue workflow
* Registrar workflow
* Notifications
* Final approval

### Permission Testing

Test that users cannot perform unauthorized actions.

Examples:

```text
Student → cannot approve clearance
Officer → cannot final approve
Registrar → can initiate clearance
Officer → can only process authorized office cases
```

### Workflow Testing

Test the complete workflow:

```text
Registrar initiates
        ↓
Student submits
        ↓
Offices process
        ↓
Issue created
        ↓
Issue resolved
        ↓
All offices cleared
        ↓
Registrar approves
        ↓
Completed
```

### API Testing

Test backend endpoints using an API testing tool.

Check:

* Successful requests
* Invalid data
* Unauthorized requests
* Forbidden requests
* Not-found cases
* Validation errors

### Regression Testing

Whenever a major feature is merged, check that existing functionality still works.

### Bug Reporting

Every bug report should contain:

```text
Title
Steps to reproduce
Expected result
Actual result
Environment
Screenshots/logs when useful
Severity
```

---

# 11. Member 8 — Documentation / Presentation + Technical Support

## Primary Responsibility

Member 8 owns project documentation and presentation materials while also contributing to a defined technical area.

Documentation alone should not be the member's only technical contribution.

## Documentation Responsibilities

Maintain:

* Project documentation
* User guide
* Setup instructions
* API documentation where appropriate
* Presentation slides
* Demo script
* Contribution records

### Presentation

Prepare material explaining:

* Problem
* Existing manual system
* Proposed system
* Architecture
* Workflow
* Technology stack
* Main features
* Demonstration
* Results
* Future improvements

### Technical Contribution

Member 8 should also own a manageable technical feature.

Possible feature:

```text
Notifications UI
```

or another feature agreed with the Technical Lead.

---

# 12. Shared Responsibilities

Although each member has an assigned role, everyone is responsible for:

* Understanding the overall system
* Writing readable code
* Testing their own work
* Following Git rules
* Communicating blockers
* Reviewing relevant code when requested
* Updating documentation when their feature changes behavior
* Respecting existing architecture

---

# 13. Module Ownership

The main ownership structure is:

```text
Member 1
Backend / Architecture
        │
        ├── Authentication
        ├── Database
        ├── Clearance Workflow
        ├── Issues
        └── API Rules

Member 2
Frontend Architecture
        │
        ├── Routing
        ├── Layout
        ├── Shared Components
        └── API Integration

Member 3
Student Module

Member 4
Office Module

Member 5
Registrar Module

Member 6
UI/UX

Member 7
Testing / QA

Member 8
Documentation / Presentation
+ Technical Feature
```

---

# 14. Dependencies Between Members

The modules are connected.

```text
Member 1
Backend
   │
   ├──────────────┐
   ↓              ↓
Member 2       Member 7
Frontend       Testing
   │
   ├──────────────┬──────────────┐
   ↓              ↓              ↓
Member 3       Member 4       Member 5
Student        Office         Registrar
   ↑              ↑              ↑
   └──────── Member 6 ──────────┘
             UI/UX

Member 8
Documentation / Presentation
        ↑
      All Members
```

---

# 15. Communication Rules

If a member encounters a problem that affects another module:

1. Identify the problem.
2. Explain it to the affected member.
3. Discuss the proposed solution.
4. If the change affects architecture, discuss it with the Technical Lead.
5. Implement the agreed solution.
6. Document important decisions.

Do not silently change another member's module.

---

# 16. Pull Request Responsibilities

Every member must:

1. Work on their assigned branch.
2. Keep commits focused.
3. Push their branch.
4. Open a Pull Request.
5. Explain what was changed.
6. Mention any important decisions.
7. Respond to review comments.
8. Make requested changes.
9. Wait for approval.

Only the Technical Lead merges approved Pull Requests into `main`.

---

# 17. Definition of Done

A feature is not considered complete simply because the code works on one person's computer.

A feature is considered complete when:

* The implementation works
* The code follows project structure
* The feature has been tested
* Error cases have been considered
* Relevant permissions are handled
* The UI works as intended
* Documentation is updated when necessary
* The Pull Request has been reviewed
* Review comments have been resolved
* The Pull Request has been merged

---

# 18. Final Team Goal

The team should be able to demonstrate one complete workflow:

```text
Registrar
   ↓
Initiates clearance
   ↓
Student
   ↓
Completes and submits
   ↓
Six Offices
   ↓
Process clearance
   ↓
Issue, if necessary
   ↓
Student resolves issue
   ↓
Office verifies
   ↓
All six offices CLEARED
   ↓
Registrar
   ↓
Final approval
   ↓
Clearance COMPLETED
   ↓
Student
   ↓
Views / Downloads clearance
```

Every team member should understand this workflow regardless of their assigned module.

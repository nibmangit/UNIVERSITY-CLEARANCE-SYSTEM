# University Clearance System — Frontend UI Guide

## 1. Purpose

This document defines what the frontend interfaces should look like and what each page should contain.

The goal is not to force every developer to copy an exact design. Instead, it defines:

* What pages are required
* What information each page displays
* What actions are available
* Which data from `mockData.js` is used
* Which role can access each page
* How users move through the clearance workflow
* What loading, empty, success, and error states should exist

The frontend uses:

* React
* Tailwind CSS
* React Router
* `mockData.js` during frontend development

The UI should be clean, simple, responsive, and consistent across all roles.

---

# 2. Main User Interfaces

The system has four main user experiences:

```text
                    LOGIN
                      │
          ┌───────────┴───────────┐
          │                       │
       STUDENT                  STAFF
          │                       │
          │              ┌────────┴────────┐
          │              │                 │
     Student UI       OFFICER          REGISTRAR
                         UI                UI
```

The UI should change according to the authenticated user's role.

Roles:

```text
STUDENT
OFFICER
REGISTRAR
ADMIN
```

Admin UI should remain limited unless a specific administrative requirement is defined.

---

# 3. Shared Design System

All modules should use the same visual language.

## 3.1 Application Layout

After login:

```text
┌──────────────────────────────────────────────────────────────┐
│ Logo / University Name              🔔 Notifications   User ▾ │
├──────────────┬───────────────────────────────────────────────┤
│              │                                               │
│ Dashboard    │                                               │
│              │                                               │
│ Clearance    │                 MAIN CONTENT                   │
│              │                                               │
│ History      │                                               │
│              │                                               │
│ Notifications│                                               │
│              │                                               │
│ Profile      │                                               │
│              │                                               │
│              │                                               │
│ Logout       │                                               │
└──────────────┴───────────────────────────────────────────────┘
```

Desktop:

* Sidebar on the left
* Top navigation/header
* Main content area

Mobile:

* Sidebar becomes a drawer/menu
* Header remains compact
* Tables can become cards or horizontally scroll

---

# 4. Shared Components

Module 2 should create reusable components so other members do not build their own versions.

Recommended shared components:

```text
Button
Input
Select
SearchInput
Modal
ConfirmModal
Badge
StatusBadge
Card
StatCard
Table
Pagination
Tabs
Dropdown
Toast
Alert
LoadingSpinner
Skeleton
EmptyState
ErrorState
Breadcrumb
PageHeader
Sidebar
Navbar
UserMenu
NotificationBell
ProgressBar
Timeline
Avatar
```

Do not create separate versions of these inside every module.

For example:

```text
❌ StudentButton
❌ OfficerButton
❌ RegistrarButton

✅ Button
```

---

# 5. Login Interface

## Page

```text
┌─────────────────────────────────────────────┐
│                                             │
│              UNIVERSITY LOGO                │
│                                             │
│          University Clearance System        │
│                                             │
│  University ID / Username                   │
│  ┌───────────────────────────────────────┐  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Password                                   │
│  ┌───────────────────────────────────────┐  │
│  │                                 👁    │  │
│  └───────────────────────────────────────┘  │
│                                             │
│              [ Login ]                      │
│                                             │
│          Change password                    │
│                                             │
└─────────────────────────────────────────────┘
```

## Data

Uses:

```text
users
```

from `mockData.js` during development.

The login interface should NOT contain:

```text
Create account
Register
Sign up
```

The system uses the existing university identity system.

## Login behavior

After successful login:

```text
STUDENT   → Student Dashboard
OFFICER   → Officer Dashboard
REGISTRAR → Registrar Dashboard
ADMIN     → Admin Dashboard
```

---

# 6. Student Interface

The student should have a simple interface focused on:

```text
My Clearance
Progress
Issues
Notifications
History
Profile
```

---

## 6.1 Student Dashboard

### Layout

```text
┌──────────────────────────────────────────────────────────────┐
│ Dashboard                                                    │
│ Welcome, Abebe                                               │
│                                                               │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │
│ │ Clearance  │ │ Progress   │ │ Issues     │ │ Status     │ │
│ │ #102       │ │ 4 / 6      │ │ 1          │ │ In Progress│ │
│ └────────────┘ └────────────┘ └────────────┘ └────────────┘ │
│                                                               │
│ Clearance Progress                                           │
│                                                               │
│ Advisor        ✓ Cleared                                     │
│ Library        ✓ Cleared                                     │
│ Dormitory      ✓ Cleared                                     │
│ Sport Office   ⚠ Issue                                       │
│ Café           ○ Pending                                     │
│ Faculty Store  ○ Pending                                     │
│                                                               │
│                  [ View Clearance ]                           │
│                                                               │
│ Recent Notifications                                         │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Sport Office reported an issue...                         │ │
│ │ 10 minutes ago                                            │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Data

Uses:

```text
students
clearances
clearanceOffices
issues
notifications
```

---

# 7. Student Clearance Details

This is one of the most important screens.

```text
┌──────────────────────────────────────────────────────────────┐
│ ← Back                                                       │
│ Clearance #102                                              │
│ Status: IN PROGRESS                                         │
│                                                              │
│ Student Information                                         │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Name: Abebe Kebede                                       │ │
│ │ Student ID: BDU12345                                     │ │
│ │ Faculty: Faculty of Computing                            │ │
│ │ Department: Software Engineering                         │ │
│ │ Section: A                                               │ │
│ │ Year: 3                                                  │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ Office Clearance                                            │
│                                                              │
│ ┌──────────────┬─────────────┬──────────────┬─────────────┐ │
│ │ Office       │ Status      │ Officer      │ Action      │ │
│ ├──────────────┼─────────────┼──────────────┼─────────────┤ │
│ │ Advisor      │ CLEARED     │ Staff A      │ View        │ │
│ │ Library      │ CLEARED     │ Staff B      │ View        │ │
│ │ Dormitory    │ CLEARED     │ Staff C      │ View        │ │
│ │ Sport Office │ FLAGGED     │ Staff D      │ View Issue  │ │
│ │ Café         │ PENDING     │ Staff E      │ —           │ │
│ │ Faculty Store│ PENDING     │ Staff F      │ —           │ │
│ └──────────────┴─────────────┴──────────────┴─────────────┘ │
│                                                              │
│ Clearance Timeline                                          │
│                                                              │
│ ● Clearance initiated                                       │
│ │                                                            │
│ ● Student submitted                                          │
│ │                                                            │
│ ● Advisor cleared                                            │
│ │                                                            │
│ ● Sport Office flagged issue                                 │
│ │                                                            │
│ ○ Waiting for resolution                                     │
└──────────────────────────────────────────────────────────────┘
```

The student should **not** see officer controls such as:

```text
Clear
Flag Issue
Assign Officer
Approve
```

Students only view their clearance and respond to issues where necessary.

---

# 8. Student Issue Interface

When an office flags an issue:

```text
┌──────────────────────────────────────────────────────────────┐
│ Issue Details                                                │
│                                                              │
│ Office: Sport Office                                         │
│ Status: OPEN                                                 │
│                                                              │
│ Reason                                                      │
│ Missing sports equipment                                     │
│                                                              │
│ Description                                                 │
│ Student has an outstanding equipment return.                 │
│                                                              │
│ Created: September 25, 2026                                  │
│                                                              │
│ Resolution                                                 │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Waiting for student to resolve the issue                 │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│                  [ View Clearance ]                           │
└──────────────────────────────────────────────────────────────┘
```

If the system requires student action, the UI should clearly explain:

```text
What is wrong?
Which office reported it?
What needs to happen?
What is the current status?
```

---

# 9. Student History

```text
┌──────────────────────────────────────────────────────────────┐
│ Clearance History                                            │
│                                                              │
│ Search: [____________________]                              │
│                                                              │
│ ┌────────┬───────────────┬─────────────┬──────────────────┐ │
│ │ ID     │ Type          │ Date        │ Status           │ │
│ ├────────┼───────────────┼─────────────┼──────────────────┤ │
│ │ #103   │ Graduation    │ Sep 20      │ COMPLETED        │ │
│ │ #102   │ Graduation    │ Sep 25      │ IN PROGRESS      │ │
│ └────────┴───────────────┴─────────────┴──────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

Clicking a record opens its details.

Completed clearance should have:

```text
[ View Document ]
[ Download ]
```

if the final document feature is implemented.

---

# 10. Student Notifications

```text
┌──────────────────────────────────────────────────────────────┐
│ Notifications                              [ Mark all read ] │
│                                                              │
│ ● Clearance initiated                                        │
│   Your clearance has been initiated by the Registrar.        │
│   2 hours ago                                                │
│                                                              │
│ ● Issue reported                                             │
│   Sport Office reported an issue with your clearance.        │
│   1 hour ago                                                 │
│                                                              │
│ ○ Clearance updated                                          │
│   Library clearance has been approved.                       │
│   Yesterday                                                  │
└──────────────────────────────────────────────────────────────┘
```

Unread notifications should be visually different from read notifications.

---

# 11. Student Profile

The profile is primarily informational.

```text
┌──────────────────────────────────────────────────────────────┐
│ My Profile                                                   │
│                                                              │
│             [ Avatar ]                                       │
│             Abebe Kebede                                     │
│             BDU12345                                         │
│                                                              │
│ Personal Information                                         │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Full Name     Abebe Kebede                               │ │
│ │ Student ID    BDU12345                                   │ │
│ │ Email         abebe@example.com                           │ │
│ │ Phone         +251...                                     │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ Academic Information                                         │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Faculty       Faculty of Computing                        │ │
│ │ Department    Software Engineering                         │ │
│ │ Section       A                                           │ │
│ │ Year          3                                           │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

The system should not allow students to edit university-owned academic information unless the real university integration explicitly supports it.

---

# 12. Officer Interface

The officer UI should focus on:

```text
My assigned clearances
Student search
Clearance details
Clear office
Flag issue
Resolve issue
History
```

---

# 13. Officer Dashboard

```text
┌──────────────────────────────────────────────────────────────┐
│ Officer Dashboard                                            │
│ Welcome, Staff Member                                        │
│                                                              │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │
│ │ Pending    │ │ Cleared    │ │ Issues     │ │ Today      │ │
│ │ 12         │ │ 34         │ │ 3          │ │ 8          │ │
│ └────────────┘ └────────────┘ └────────────┘ └────────────┘ │
│                                                              │
│ My Assigned Clearances                                       │
│                                                              │
│ Search [ Student ID / Name________________ ]                │
│                                                              │
│ Filter: [All] [Pending] [Flagged] [Cleared]                 │
│                                                              │
│ ┌──────────┬─────────────┬──────────┬─────────────┬────────┐ │
│ │ Student  │ Clearance   │ Status   │ Date        │ Action │ │
│ ├──────────┼─────────────┼──────────┼─────────────┼────────┤ │
│ │ Abebe    │ #102        │ PENDING  │ Sep 25      │ View   │ │
│ │ Hana     │ #104        │ FLAGGED  │ Sep 25      │ View   │ │
│ └──────────┴─────────────┴──────────┴─────────────┴────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

# 14. Officer Clearance Details

```text
┌──────────────────────────────────────────────────────────────┐
│ Clearance #102                                               │
│ Student: Abebe Kebede                                       │
│                                                              │
│ Student Information                                         │
│ ID: BDU12345                                                 │
│ Faculty: Faculty of Computing                                │
│ Department: Software Engineering                             │
│ Section: A                                                   │
│                                                              │
│ My Office                                                    │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Office: Sport Office                                     │ │
│ │ Assigned Officer: Staff D                                │ │
│ │ Status: PENDING                                          │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ Actions                                                      │
│                                                              │
│              [ Clear Student ]                               │
│                                                              │
│              [ Flag Issue ]                                  │
│                                                              │
│ Other Office Status                                         │
│ ┌──────────────┬─────────────┐                              │
│ │ Advisor      │ CLEARED     │                              │
│ │ Library      │ CLEARED     │                              │
│ │ Dormitory    │ CLEARED     │                              │
│ │ Sport Office │ PENDING     │                              │
│ │ Café         │ PENDING     │                              │
│ │ Store        │ PENDING     │                              │
│ └──────────────┴─────────────┘                              │
└──────────────────────────────────────────────────────────────┘
```

Important:

The officer should only have actions for their authorized office/cases.

The UI must not rely on hiding buttons alone for security. Backend permissions enforce the real rule.

---

# 15. Officer — Flag Issue Modal

Clicking:

```text
[ Flag Issue ]
```

opens:

```text
┌───────────────────────────────────────────────┐
│ Report Issue                              X   │
│                                               │
│ Reason                                        │
│ [ Select reason ▼ ]                           │
│                                               │
│ Description                                   │
│ ┌───────────────────────────────────────────┐ │
│ │ Describe the problem...                   │ │
│ │                                           │ │
│ └───────────────────────────────────────────┘ │
│                                               │
│             [Cancel] [Report Issue]           │
└───────────────────────────────────────────────┘
```

After submission:

```text
Issue created successfully.
```

The student receives a notification.

---

# 16. Officer — Resolve Issue

If an issue is assigned to the officer:

```text
┌──────────────────────────────────────────────────────────────┐
│ Issue                                                        │
│                                                              │
│ Status: OPEN                                                 │
│ Reason: Missing equipment                                    │
│                                                              │
│ Description:                                                 │
│ Student has not returned the required equipment.             │
│                                                              │
│ Resolution Note                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Enter resolution details...                              │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│                  [ Resolve Issue ]                           │
└──────────────────────────────────────────────────────────────┘
```

After resolution:

```text
OPEN → RESOLVED
```

The UI should clearly show who resolved it and when.

---

# 17. Registrar Interface

The Registrar is responsible for the beginning and end of the workflow.

Main areas:

```text
Dashboard
Student Search
Initiate Clearance
Active Clearances
Issues
Final Approval
Completed Clearances
History
```

---

# 18. Registrar Dashboard

```text
┌──────────────────────────────────────────────────────────────┐
│ Registrar Dashboard                                          │
│                                                              │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │
│ │ Active     │ │ Waiting    │ │ Issues     │ │ Completed  │ │
│ │ 42         │ │ 8          │ │ 6          │ │ 128        │ │
│ └────────────┘ └────────────┘ └────────────┘ └────────────┘ │
│                                                              │
│ Quick Actions                                                │
│                                                              │
│ [ Search Student ]   [ Initiate Clearance ]                 │
│                                                              │
│                                                              │
│ Recent Clearances                                            │
│ ┌──────────┬────────────┬──────────────┬──────────────────┐ │
│ │ Student  │ Clearance  │ Status       │ Action           │ │
│ ├──────────┼────────────┼──────────────┼──────────────────┤ │
│ │ Abebe    │ #102       │ IN_PROGRESS  │ View             │ │
│ │ Hana     │ #103       │ PENDING      │ Review           │ │
│ └──────────┴────────────┴──────────────┴──────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

# 19. Registrar — Student Search

This is the beginning of a new clearance.

```text
┌──────────────────────────────────────────────────────────────┐
│ Search Student                                               │
│                                                              │
│ Student ID                                                   │
│ [ BDU12345________________________ ] [ Search ]              │
│                                                              │
│ Student Result                                               │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Name: Abebe Kebede                                       │ │
│ │ Student ID: BDU12345                                     │ │
│ │ Faculty: Faculty of Computing                            │ │
│ │ Department: Software Engineering                         │ │
│ │ Section: A                                               │ │
│ │ Year: 3                                                  │ │
│ │                                                          │ │
│ │ Existing Clearance: None                                 │ │
│ │                                                          │ │
│ │             [ Initiate Clearance ]                       │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

The Registrar verifies the student using university data.

---

# 20. Registrar — Initiate Clearance

```text
┌──────────────────────────────────────────────────────────────┐
│ Initiate Clearance                                           │
│                                                              │
│ Student                                                      │
│ Abebe Kebede — BDU12345                                     │
│                                                              │
│ Clearance Type                                               │
│ [ Graduation ▼ ]                                             │
│                                                              │
│ Reason                                                       │
│ [ End of Year ▼ ]                                            │
│                                                              │
│ Confirm Student Information                                  │
│ Faculty: Faculty of Computing                               │
│ Department: Software Engineering                             │
│ Section: A                                                   │
│                                                              │
│             [ Cancel ] [ Initiate Clearance ]                │
└──────────────────────────────────────────────────────────────┘
```

After initiation, the system creates:

```text
Clearance
+
6 ClearanceOffice records
+
Office assignments
```

The frontend should then redirect to the clearance details page.

---

# 21. Registrar — Clearance Monitoring

```text
┌──────────────────────────────────────────────────────────────┐
│ Clearance #102                                               │
│ Student: Abebe Kebede                                       │
│                                                              │
│ Overall Status: PENDING REGISTRAR                            │
│                                                              │
│ Office Progress                                              │
│                                                              │
│ ✓ Advisor                                                    │
│ ✓ Library                                                    │
│ ✓ Dormitory                                                  │
│ ✓ Sport Office                                               │
│ ✓ Café                                                       │
│ ✓ Faculty Store                                              │
│                                                              │
│                6 / 6 Offices Cleared                         │
│                                                              │
│                    [ Final Approve ]                          │
└──────────────────────────────────────────────────────────────┘
```

If not all offices are cleared:

```text
Final Approve
```

should either be disabled or not shown.

Better UI:

```text
[ Final Approve ]

Cannot approve yet.
2 offices are still pending.
```

The backend must also enforce this rule.

---

# 22. Registrar — Final Approval

Before approval, show a confirmation modal:

```text
┌────────────────────────────────────────────────────┐
│ Final Approval                                     │
│                                                    │
│ Student: Abebe Kebede                             │
│ Clearance: #102                                   │
│                                                    │
│ All 6 offices have been cleared.                  │
│                                                    │
│ Are you sure you want to complete this clearance? │
│                                                    │
│        [ Cancel ]       [ Confirm Approval ]       │
└────────────────────────────────────────────────────┘
```

After approval:

```text
Clearance Status:
PENDING_REGISTRAR → COMPLETED
```

---

# 23. Registrar — Completed Clearance

```text
┌──────────────────────────────────────────────────────────────┐
│ Completed Clearance                                          │
│                                                              │
│ Student: Abebe Kebede                                       │
│ Student ID: BDU12345                                        │
│ Clearance ID: #103                                           │
│                                                              │
│ Status: ✓ COMPLETED                                          │
│                                                              │
│ Initiated: September 20, 2026                                │
│ Completed: September 25, 2026                                │
│ Approved By: Registrar Name                                  │
│                                                              │
│ Office Clearance                                             │
│ ✓ Advisor                                                    │
│ ✓ Library                                                    │
│ ✓ Dormitory                                                  │
│ ✓ Sport Office                                               │
│ ✓ Café                                                       │
│ ✓ Faculty Store                                              │
│                                                              │
│                 [ View Document ]                             │
│                 [ Download ]                                 │
└──────────────────────────────────────────────────────────────┘
```

---

# 24. Clearance Progress Component

This component should be reusable by:

* Student
* Officer
* Registrar

Example:

```text
Clearance Progress

6 / 6 completed

████████████████████████████ 100%

✓ Advisor
✓ Library
✓ Dormitory
✓ Sport Office
✓ Café
✓ Faculty Store
```

For partial progress:

```text
4 / 6 completed

████████████████░░░░░░░░░░ 67%

✓ Advisor
✓ Library
✓ Dormitory
⚠ Sport Office
○ Café
○ Faculty Store
```

Statuses:

```text
✓ CLEARED
⚠ FLAGGED
○ PENDING
```

Use the same component everywhere.

---

# 25. Office Assignment UI

The assignment itself is primarily backend logic.

Frontend should display the result.

For example:

```text
Office: Advisor
Assigned Officer: Dr. Hana Alemu
Department: Software Engineering
Section: A
Status: PENDING
```

The frontend should not manually decide:

```text
Which officer handles this student?
```

The backend determines the responsible officer using:

```text
Faculty
Department
Section
Office
Assignment rules
```

The UI only displays the result.

---

# 26. Notifications UI

The notification system should appear in two places.

### Navbar

```text
🔔 3
```

Click:

```text
┌───────────────────────────────────────┐
│ Notifications                         │
│                                       │
│ ● Issue reported                      │
│   Sport Office flagged your clearance │
│                                       │
│ ● Clearance updated                   │
│   Library cleared your clearance      │
│                                       │
│ [ View all notifications ]            │
└───────────────────────────────────────┘
```

### Full Notification Page

Use:

```text
All
Unread
Clearance
Issues
```

as filters if useful.

---

# 27. Status Badge Design

All modules should use consistent status badges.

Overall clearance:

```text
INITIATED
IN_PROGRESS
PENDING_REGISTRAR
COMPLETED
CANCELLED
```

Office:

```text
PENDING
CLEARED
FLAGGED
```

Issue:

```text
OPEN
RESOLVED
CANCELLED
```

Do not create random status names.

For example:

```text
❌ Almost Done
❌ Waiting
❌ Finished
```

when the actual backend status is:

```text
PENDING_REGISTRAR
COMPLETED
```

The UI can display a friendly label, but the underlying status should remain consistent.

---

# 28. Loading States

Every page that retrieves data should have a loading state.

Example:

```text
┌───────────────────────────────────────────┐
│ Student Dashboard                         │
│                                           │
│ ┌────────────┐ ┌────────────┐             │
│ │ ░░░░░░░░░░ │ │ ░░░░░░░░░░ │             │
│ │ ░░░░░░░░░░ │ │ ░░░░░░░░░░ │             │
│ └────────────┘ └────────────┘             │
│                                           │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░                │
└───────────────────────────────────────────┘
```

Use skeletons or a spinner.

Do not leave the page blank while loading.

---

# 29. Empty States

Example:

```text
┌───────────────────────────────────────────┐
│                                           │
│             No clearances yet             │
│                                           │
│     Your clearance information will       │
│     appear here when initiated.           │
│                                           │
└───────────────────────────────────────────┘
```

Officer:

```text
No assigned clearances.
```

Registrar:

```text
No students found.
```

Notifications:

```text
You're all caught up.
```

---

# 30. Error States

Example:

```text
┌───────────────────────────────────────────┐
│ Something went wrong                      │
│                                           │
│ We couldn't load the clearance details.   │
│                                           │
│              [ Try Again ]                │
└───────────────────────────────────────────┘
```

For form errors:

```text
Student ID is required.

Please select a clearance type.

Description cannot be empty.
```

Do not only use browser console errors.

---

# 31. Confirmation Dialogs

Important actions should require confirmation.

Use confirmation for:

```text
Initiate Clearance
Clear Student
Flag Issue
Resolve Issue
Final Approve
Logout
```

Example:

```text
Are you sure you want to clear this student?

This will mark your office clearance as CLEARED.

[Cancel] [Confirm]
```

---

# 32. Responsive Design

The system must work on:

```text
Desktop
Laptop
Tablet
Mobile
```

Desktop:

```text
Sidebar + Content
```

Mobile:

```text
Header
↓
Content
↓
Cards
```

Large tables should become:

```text
Scrollable table
```

or:

```text
Mobile cards
```

Do not allow important content to disappear on small screens.

---

# 33. Navigation by Role

## Student

```text
Dashboard
My Clearance
History
Notifications
Profile
Logout
```

## Officer

```text
Dashboard
My Clearances
Issues
History
Profile
Logout
```

## Registrar

```text
Dashboard
Search Student
Clearances
Issues
Completed
History
Profile
Logout
```

## Admin

Only add additional navigation when an actual administrative requirement has been defined.

---

# 34. Important UI Rules

## Rule 1 — UI follows the workflow

The interface should make the workflow obvious:

```text
Registrar Initiates
        ↓
Student Submits
        ↓
Six Offices Process
        ↓
Issues Resolved
        ↓
All Offices Cleared
        ↓
Registrar Approves
        ↓
Completed
```

---

## Rule 2 — Don't duplicate university functionality

Do not create UI for:

```text
Student Registration
Course Registration
Grade Management
Admission
Full University Profile Management
```

Those belong to the existing university system.

---

## Rule 3 — Don't let the frontend invent business rules

For example:

```text
Frontend:
"All offices are cleared, so show approval."

Backend:
"All offices are cleared, therefore approval is allowed."
```

The backend is authoritative.

Frontend reflects the state and improves user experience.

---

## Rule 4 — Use real mock relationships

Do not create fake independent data inside individual components.

Use:

```text
mockData.js
```

and follow the relationships:

```text
Student
  ↓ studentId
Clearance
  ↓ clearanceId
ClearanceOffice
  ↓ clearanceOfficeId
Issue
```

---

# 35. Module-to-UI Ownership

| Module   | Main UI                                                       |
| -------- | ------------------------------------------------------------- |
| Module 1 | Login, authentication states, user session                    |
| Module 2 | Layout, routing, shared components, navigation                |
| Module 3 | Student Dashboard, Clearance, History, Profile, Notifications |
| Module 4 | Officer Dashboard, Assigned Clearances, Issue Processing      |
| Module 5 | Registrar Dashboard, Search, Initiation, Final Approval       |
| Module 6 | Workflow/progress/assignment-related UI support               |
| Module 7 | Issues and Notifications UI                                   |
| Module 8 | UI testing, integration testing, documentation                |

---

# 36. Dependency Between Frontend Members

```text
Module 2
Frontend Foundation
       │
       ├──────────────┐
       ↓              ↓
Module 3          Module 4
Student UI        Officer UI
       │              │
       └──────┬───────┘
              ↓
          Module 5
        Registrar UI
              │
              ↓
        Module 7
 Issues + Notifications
```

Module 2 should be completed enough first so other members can reuse:

```text
Layout
Sidebar
Navbar
Button
Table
Modal
Badge
Card
Input
```

---

# 37. Recommended Page Structure

The frontend routing can eventually look like:

```text
/login

/student
/student/clearance
/student/clearance/:id
/student/history
/student/notifications
/student/profile

/officer
/officer/clearances
/officer/clearances/:id
/officer/issues
/officer/issues/:id
/officer/history
/officer/profile

/registrar
/registrar
/registrar/students
/registrar/clearances
/registrar/clearances/:id
/registrar/issues
/registrar/completed
/registrar/history
/registrar/profile
```

The exact route naming can change, but the separation of role interfaces should remain clear.

---

# 38. Development Order for the Frontend

Do not build all dashboards randomly.

Recommended order:

### Step 1 — Module 2

Build:

```text
Login UI
App Layout
Sidebar
Navbar
Routing
Protected Routes
Shared Components
```

### Step 2 — Module 3

Build:

```text
Student Dashboard
Student Clearance
Clearance Details
Student History
Notifications
Profile
```

### Step 3 — Module 4

Build:

```text
Officer Dashboard
Assigned Clearances
Clearance Details
Flag Issue
Resolve Issue
```

### Step 4 — Module 5

Build:

```text
Registrar Dashboard
Student Search
Initiate Clearance
Clearance Monitoring
Final Approval
Completed Clearance
```

### Step 5 — Module 7

Build/refine:

```text
Issues
Notifications
Unread states
Notification details
```

### Step 6 — Module 8

Test:

```text
Login
↓
Registrar initiates
↓
Student views
↓
Officer processes
↓
Issue created
↓
Student sees notification
↓
Issue resolved
↓
All offices cleared
↓
Registrar approves
↓
Completed
```

---

# 39. Most Important UI Principle

The system should feel like **one application**, not eight separate projects.

All members must use:

```text
Same sidebar
Same navbar
Same buttons
Same cards
Same status badges
Same typography
Same spacing
Same colors
Same modal style
Same table style
Same error handling
```

Module ownership means:

> "You own this part of the system."

It does NOT mean:

> "You can design your part completely differently."

---

# 40. Final UI Goal

A new user should be able to understand the system without someone explaining it.

A student should immediately understand:

```text
What is my clearance status?
Which offices cleared me?
Which office has an issue?
What do I need to do?
```

An officer should immediately understand:

```text
Which students are assigned to me?
Who is pending?
Who has an issue?
What action should I take?
```

A registrar should immediately understand:

```text
Who needs clearance?
Who is in progress?
Which clearances have issues?
Who is ready for final approval?
Which clearances are completed?
```

The UI should make the workflow visible, while the backend enforces the actual business rules.

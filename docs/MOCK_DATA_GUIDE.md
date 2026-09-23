# University Clearance System

# Mock Data Guide

## 1. Purpose

The frontend is being developed before the backend is complete.

To allow frontend development to continue, the project uses temporary mock data.

The mock data allows the team to:

* Build realistic dashboards
* Test different user roles
* Display clearance progress
* Test issues
* Test notifications
* Test different clearance states
* Develop the UI before the API is available

The mock data is **not the final database design**.

It is a temporary development representation of the data that the frontend will eventually receive from APIs.

---

# 2. Important Architecture Principle

The University Clearance System is built **around the existing university system**.

It does not replace the university's complete information system.

There are therefore two categories of data.

```text id="k0h7m8"
EXISTING UNIVERSITY SYSTEM
        │
        │ Student / university information
        ↓
CLEARANCE SYSTEM
        │
        │ Clearance-specific information
        ↓
       React
```

---

# 3. University-System Data

The existing university system is assumed to contain information such as:

```text id="bmy2zz"
Student
├── Student ID
├── Full Name
├── Faculty
├── Department
├── Section
└── Year

University Account
├── Username / Student ID
└── Authentication
```

Depending on the real university integration, staff and organizational information may also come from the university system.

Our system should not unnecessarily duplicate this information.

---

# 4. Clearance-System Data

The clearance system owns the information related specifically to clearance.

Examples:

```text id="x7ozco"
Clearance
├── Clearance type
├── Status
├── Initiated by
├── Initiated date
├── Submission date
├── Final approval
└── Completion date

ClearanceOffice
├── Clearance
├── Office
├── Assigned officer
├── Status
└── Review information

Issue
├── Office clearance
├── Reason
├── Description
├── Status
├── Created by
├── Created date
├── Resolved by
└── Resolution information

Notification
AuditLog
ClearanceType
```

---

# 5. Current Mock Data File

During frontend development, the project uses:

```text id="l6f3m8"
frontend/src/data/mockData.js
```

At the moment, the file contains data representing both categories.

Conceptually:

```text id="0i9gqa"
mockData.js
│
├── University-System Simulation
│   ├── users
│   ├── faculties
│   ├── departments
│   ├── sections
│   ├── students
│   └── staff
│
└── Clearance-System Simulation
    ├── offices
    ├── officeAssignments
    ├── clearanceTypes
    ├── clearances
    ├── clearanceOffices
    ├── issues
    ├── notifications
    └── auditLogs
```

This is a **development convenience**.

It does not mean all these entities will become tables owned by the clearance system.

---

# 6. Mock Data Ownership

Use the following classification when working with the mock data.

| Mock Data           | Conceptual Owner                             | Final Source                                      |
| ------------------- | -------------------------------------------- | ------------------------------------------------- |
| `users`             | University / identity system                 | University authentication or approved integration |
| `students`          | University system                            | University student information                    |
| `faculties`         | University system                            | University system                                 |
| `departments`       | University system                            | University system                                 |
| `sections`          | University system                            | University system                                 |
| `staff`             | University system or organization            | Depends on university integration                 |
| `offices`           | Clearance system / university configuration  | Final architecture decision                       |
| `officeAssignments` | Clearance system or university configuration | Final architecture decision                       |
| `clearanceTypes`    | Clearance system                             | Clearance backend                                 |
| `clearances`        | Clearance system                             | Clearance backend                                 |
| `clearanceOffices`  | Clearance system                             | Clearance backend                                 |
| `issues`            | Clearance system                             | Clearance backend                                 |
| `notifications`     | Clearance system                             | Clearance backend                                 |
| `auditLogs`         | Clearance system                             | Clearance backend                                 |

The exact ownership of `staff`, `offices`, and `officeAssignments` depends on what information the existing university system can provide.

Do not assume that our system must duplicate them.

---

# 7. Why We Are Using Mock Data

The backend and frontend are being developed in parallel.

Without mock data:

```text id="p8m7aa"
Backend must finish first
        ↓
Frontend waits
        ↓
Development slows down
```

With mock data:

```text id="v1h5ls"
Mock Data
    ↓
Frontend development
    ↓
Backend development in parallel
```

Later:

```text id="7s8x4d"
Mock Data
    ↓
REMOVE / REPLACE
    ↓
Real API
```

---

# 8. Mock Data Must Represent Real Relationships

The mock data should not be treated as random arrays.

The records must have relationships that resemble the final system.

The main relationship is:

```text id="f2a5st"
Student
   │
   │ student ID / reference
   ↓
Clearance
   │
   │ clearance ID
   ↓
ClearanceOffice
   │
   │ clearance office ID
   ↓
Issue
```

For example:

```text id="3xg54h"
Student
STU001
   │
   ↓
Clearance 101
   │
   ├── Advisor
   ├── Library
   ├── Dormitory
   ├── Sport
   ├── Café
   └── Faculty Store
             │
             ↓
       Possible Issue
```

---

# 9. Example Mock Relationship

Suppose:

```text id="4q5p0g"
Student ID: STU001
```

has:

```text id="up34jj"
Clearance ID: 101
```

Then the office records must refer to:

```text id="f5y6zh"
clearanceId: 101
```

For example:

```js
{
    id: 1001,
    clearanceId: 101,
    officeId: 1,
    status: "CLEARED"
}
```

Another office:

```js
{
    id: 1003,
    clearanceId: 101,
    officeId: 3,
    status: "FLAGGED"
}
```

An issue can then reference the relevant clearance-office record:

```js
{
    id: 5001,
    clearanceOfficeId: 1003,
    reason: "Unreturned room key",
    status: "OPEN"
}
```

This represents:

```text id="s7d1x8"
STU001
   ↓
Clearance 101
   ↓
Dormitory
   ↓
Issue: Unreturned room key
```

---

# 10. Mock Data Should Simulate Different States

The current mock data should contain examples of different system states.

For example:

### Clearance 101

```text id="4gy6e5"
IN_PROGRESS

Advisor          CLEARED
Library          CLEARED
Dormitory        FLAGGED
Sport Office     CLEARED
Café             PENDING
Faculty Store    PENDING
```

This is useful for testing:

* Active clearance
* Mixed office statuses
* Issues
* Student dashboard

---

### Clearance 102

```text id="ajm6s9"
PENDING_REGISTRAR

Advisor          CLEARED
Library          CLEARED
Dormitory        CLEARED
Sport Office     CLEARED
Café             CLEARED
Faculty Store    CLEARED
```

This is useful for testing:

* Registrar pending approval
* Final approval button
* All-offices-cleared state

---

### Clearance 103

```text id="h0s3lm"
COMPLETED

Advisor          CLEARED
Library          CLEARED
Dormitory        CLEARED
Sport Office     CLEARED
Café             CLEARED
Faculty Store    CLEARED
```

This is useful for testing:

* Completed clearance
* Clearance history
* Final document
* Download/print interface

---

# 11. Clearance Statuses

Overall clearance statuses:

```text id="a4xg5c"
INITIATED
IN_PROGRESS
PENDING_REGISTRAR
COMPLETED
CANCELLED
```

Meaning:

### INITIATED

Registrar has created the clearance, but the student has not completed the required submission yet.

### IN_PROGRESS

The student has submitted and the offices are processing the clearance.

### PENDING_REGISTRAR

All required offices have cleared the student and the clearance is waiting for final Registrar approval.

### COMPLETED

Registrar has approved the clearance.

### CANCELLED

The clearance has been cancelled.

---

# 12. Office Statuses

Each required office has its own status:

```text id="b17xni"
PENDING
CLEARED
FLAGGED
```

### PENDING

The office has not completed processing.

### CLEARED

The office has confirmed that there is no outstanding issue.

### FLAGGED

The office has an unresolved issue.

---

# 13. Issue Statuses

Issues use:

```text id="u8l7s3"
OPEN
RESOLVED
CANCELLED
```

Example:

```text id="d8z0hx"
OPEN
    ↓
Student resolves real-world problem
    ↓
Officer verifies
    ↓
RESOLVED
```

An office should not be considered fully cleared while a blocking issue remains unresolved.

---

# 14. Six Required Offices

Every clearance requires all six offices:

```text id="j4h8df"
1. Advisor
2. Library
3. Dormitory
4. Sport Office
5. Café
6. Faculty Store
```

This is currently a fixed project rule.

We do not need a complicated clearance-type-to-office rules engine.

Every clearance receives the same six required offices.

---

# 15. Office Assignment

Different students may have different responsible officers.

For example:

```text id="8z73xg"
Student:
Faculty = Computing
Department = Software Engineering
Section = A

Possible assignment:

Advisor
→ Software Engineering / Section A

Faculty Store
→ Computing Faculty

Library
→ Library Officer

Dormitory
→ Dormitory Officer
```

Therefore, the backend will eventually need assignment logic.

The frontend mock data can represent these assignments using:

```js
officeAssignments
```

---

# 16. Mock Data and Frontend

While building the frontend, components may temporarily import data directly:

```js
import {
    students,
    clearances,
    clearanceOffices,
    issues
} from "../data/mockData";
```

For example, a student dashboard may:

1. Find the current student
2. Find their active clearance
3. Find the six office records
4. Find issues related to those offices
5. Display the results

Conceptually:

```text id="w5j2m4"
Student
  ↓
Clearance
  ↓
ClearanceOffice[]
  ↓
Issue[]
```

---

# 17. Do Not Build a Mock API Yet

The current project intentionally does **not** use a separate mock API layer.

For now:

```text id="r2s6y1"
mockData.js
      ↓
React Components
```

This keeps frontend development simple.

We will introduce the real API/service layer when the Django backend becomes available.

Later:

```text id="c7a2h4"
React
   ↓
API Service
   ↓
Django REST API
   ↓
PostgreSQL
```

---

# 18. What Happens When the Backend Is Ready?

The frontend will gradually change from:

```text id="h9x5zv"
mockData.js
    ↓
React
```

to:

```text id="u7j8ap"
Django API
    ↓
React
```

For example, instead of:

```js
const clearance = clearances.find(
    item => item.studentId === student.id
);
```

the frontend will eventually request:

```text
GET /api/clearances/
```

or another appropriate endpoint.

The UI should not need to be completely rebuilt.

Only the data source changes.

---

# 19. University Data Integration

In the final system, university information should ideally come from an approved university integration.

Possible mechanisms include:

```text id="j5kq4n"
Existing University API
       ↓
Clearance Backend
```

or:

```text id="7t2xmw"
University SSO / Identity Provider
       ↓
Clearance Backend
```

or another approved integration mechanism.

The exact mechanism depends on what the university provides.

The project should therefore keep the integration boundary clear.

---

# 20. Important Rule About Passwords

The clearance system must not simply copy university passwords into its own database.

For a real deployment, authentication should use an approved mechanism such as:

* University API
* SSO
* LDAP
* Another official identity integration

For the graduation project, authentication can be simulated locally.

---

# 21. Mock Data Is Not the Final Database

Do not assume that every array in `mockData.js` must become a Django model.

For example:

```text id="d4o5k2"
mockData.js
   ↓
students
```

does NOT automatically mean:

```text id="7p3z9c"
Django
   ↓
Student table
```

The final architecture must first determine what the existing university system owns and what the clearance system owns.

The clearance-specific entities are the primary database responsibility of our system.

---

# 22. Rules When Editing Mock Data

When changing mock data:

### Rule 1 — Preserve relationships

If you change an ID, update all records that reference it.

### Rule 2 — Use realistic states

Do not create impossible combinations.

For example:

```text id="k3z8x4"
Clearance = COMPLETED

Office = PENDING
```

is invalid.

A completed clearance should have all required offices cleared.

### Rule 3 — Keep the six offices

Every clearance should have:

```text id="x7z4pn"
Advisor
Library
Dormitory
Sport
Café
Faculty Store
```

### Rule 4 — Use realistic issues

Issues should represent actual problems an office might identify.

Examples:

```text id="x4m5t8"
Unreturned room key
Outstanding library material
Unpaid café balance
Missing sports equipment
Unreturned faculty property
```

### Rule 5 — Keep data understandable

Use clear names and IDs so developers can trace relationships easily.

---

# 23. Current Mock Data Correction

The completed clearance example contains a Faculty Store record.

The record:

```text
id: 3006
```

must use:

```js
officeId: 6
```

because Office 6 represents the Faculty Store.

It must not use the Dormitory office ID.

Correct relationship:

```text id="4p1v5d"
Clearance 103
    ↓
ClearanceOffice 3006
    ↓
Office 6
    ↓
Faculty Store
```

---

# 24. When We Remove Mock Data

Mock data should remain available while frontend development is in progress.

It can be removed or moved into a testing/demo structure after:

* Backend APIs are working
* Frontend API integration is complete
* Main workflows have been tested
* Real/integrated university data source is available or simulated through the backend

The team should not remove mock data simply because the backend project has started.

---

# 25. Final Data Flow

The final intended architecture is:

```text id="x1n7r5"
          EXISTING UNIVERSITY SYSTEM
                    │
          Student / University Data
                    │
                    ▼
              CLEARANCE BACKEND
                    │
        ┌───────────┴───────────┐
        │                       │
University Data          Clearance Data
        │                       │
        │              ┌────────┴─────────┐
        │              │                  │
        │         Clearance          Issues
        │              │
        │       ClearanceOffice
        │              │
        │           Offices
        │
        └──────────────┬───────────────┘
                       ↓
                  REST API
                       ↓
                    React
```

---

# 26. Development Principle

The frontend team should think:

> "I am building the interface for the data and workflow that the real backend will eventually provide."

The backend team should think:

> "I am building the real data model and business rules behind the interfaces the frontend is developing."

Both sides should therefore communicate about:

* Data structures
* Field names
* Status values
* Relationships
* API responses
* Validation rules
* Error responses

The goal is to make the transition:

```text id="0i4k3d"
Mock Data
    ↓
Real API
```

as smooth as possible.

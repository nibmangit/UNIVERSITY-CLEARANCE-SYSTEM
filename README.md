# University Clearance System

A university clearance management system designed to digitize and simplify the existing university clearance process.

The system is built **around the existing university system**, not as a replacement for it.

---

## 1. Project Overview

The current university clearance process requires students to physically visit multiple offices, collect signatures, resolve issues, and return the completed clearance document to the Registrar.

This project aims to provide a centralized digital system for managing that clearance workflow.

The system will allow:

* Registrar to initiate a student's clearance
* Students to complete and submit their clearance information
* Required offices to process the clearance
* Offices to clear students or flag issues
* Students to see their clearance progress and issues
* Officers to resolve and verify issues
* Registrar to perform final verification and approval
* Students to view and download their completed clearance

---

## 2. Important Scope Principle

> **The Clearance System is based on the existing university system. It does not replace the university's complete information system.**

The existing university system is assumed to provide information such as:

* Student ID
* Student name
* Faculty
* Department
* Section
* Academic year
* University account/authentication
* Other relevant university information

Our system focuses only on the **clearance-specific workflow and data**.

We are NOT building:

* Student registration
* Admission
* Course registration
* Grade management
* A complete university portal
* A second complete student information system
* Duplicate university-wide user management

During development, mock data will temporarily simulate information coming from the existing university system.

---

## 3. Clearance Workflow

The main workflow is:

```text
Student needs clearance
        ↓
Student goes to Registrar
        ↓
Registrar verifies Student ID
        ↓
Registrar initiates clearance
        ↓
Student logs in
        ↓
Student completes required information
        ↓
Student submits clearance
        ↓
┌───────────────────────────────────────┐
│ Required Offices                      │
│                                       │
│ Advisor                               │
│ Library                               │
│ Dormitory                             │
│ Sport Office                          │
│ Café                                  │
│ Faculty Store                         │
└───────────────────────────────────────┘
        ↓
Offices clear or flag issues
        ↓
Student resolves issues when necessary
        ↓
All six offices are cleared
        ↓
Registrar performs final verification
        ↓
Registrar approves
        ↓
CLEARANCE COMPLETED
        ↓
Student views/downloads clearance
```

---

## 4. Main User Roles

### Student

Students can:

* Log in using university credentials
* View their university information
* See when a clearance has been initiated
* Complete and submit the clearance form
* View office clearance statuses
* View issues
* View notifications
* View clearance history
* View/download completed clearance

### Office Staff

Office staff can:

* View assigned clearance cases
* Search for students
* View relevant student information
* Clear a student
* Flag an issue
* View issues
* Resolve/close issues after verification
* View office history

The six required offices are:

1. Advisor
2. Library
3. Dormitory
4. Sport Office
5. Café
6. Faculty Store

### Registrar

Registrar can:

* Search students
* Verify student information
* Initiate clearance
* Select clearance type/reason
* Monitor clearance progress
* View office statuses
* View issues
* Perform final verification
* Approve completed clearance
* View completed clearance records

### System Administration

Administrative functions will be limited to what is required by the clearance system.

We will not duplicate administrative functions already handled by the existing university system.

---

## 5. Repository Structure

```text
university-clearance-system/
│
├── backend/
│   └── Django + Django REST Framework
│
├── frontend/
│   └── React + Tailwind
│
├── docs/
│   ├── MASTER_GUIDE.md
│   ├── TEAM_ROLES.md
│   └── MOCK_DATA_GUIDE.md
│
├── .gitignore
└── README.md
```

### Backend

The backend will contain:

* Django project configuration
* Django REST Framework APIs
* Authentication and authorization
* Clearance business logic
* Database models
* Permissions
* Notifications
* Audit logging
* Integration with university data

### Frontend

The frontend will contain:

* React application
* User interfaces for each role
* Routing
* Reusable components
* API integration
* Forms
* Dashboards
* Notifications
* Clearance status displays

### Docs

The documentation directory contains the detailed project information.

---

## 6. Technology Stack

### Frontend

* React
* Tailwind CSS
* React Router
* JavaScript

### Backend

* Python
* Django
* Django REST Framework

### Database

* PostgreSQL

### Authentication

The system will be designed to work with university authentication/integration.

For development, authentication may be simulated locally.

The system must not copy or store real university passwords without an approved integration mechanism.

### Development Tools

* Git
* GitHub
* VS Code
* Postman/Thunder Client or equivalent API testing tool

---

## 7. Data Architecture

The project has two major categories of data.

### Existing University Data

This information belongs to or comes from the existing university system.

Examples:

```text
Student
Faculty
Department
Section
University Account
```

### Clearance System Data

This information belongs to our system.

Examples:

```text
Clearance
ClearanceOffice
Issue
Notification
AuditLog
ClearanceType
```

Conceptually:

```text
Existing University System
          │
          │ Student Information
          ↓
   Clearance System
          │
          ↓
      Clearance
          │
          ├── Advisor
          ├── Library
          ├── Dormitory
          ├── Sport
          ├── Café
          └── Faculty Store
```

---

## 8. Mock Data

During frontend development, we will use:

```text
frontend/src/data/mockData.js
```

The mock data temporarily simulates both:

1. Information coming from the existing university system
2. Clearance information that our backend will eventually provide

Mock data is for development only.

The frontend should be designed so that mock data can later be replaced by real API responses without rebuilding the entire interface.

See:

```text
docs/MOCK_DATA_GUIDE.md
```

for the detailed explanation.

---

## 9. Development Workflow

Every member must work on their own feature branch.

Do NOT work directly on `main`.

Example:

```bash
git checkout main
git pull origin main

git checkout -b feature/student-dashboard
```

After completing the work:

```bash
git add .
git commit -m "feat: add student dashboard"

git push -u origin feature/student-dashboard
```

Then create a **Pull Request** on GitHub.

---

## 10. Pull Request Rule

### Only the Technical Lead merges Pull Requests.

The workflow is:

```text
Member
   ↓
Feature Branch
   ↓
Push to GitHub
   ↓
Pull Request
   ↓
Technical Lead Review
   ↓
┌─────────────────────┐
│                     │
│ Changes Needed      │ Approved
│       ↓             │    ↓
│ Member fixes        │  Merge
│       ↓             │    ↓
│ Review again        │  main
└─────────────────────┘
```

Members must **not merge their own Pull Requests**.

Members must also not push directly to `main`.

---

## 11. Branch Naming

Use descriptive branch names.

Examples:

```text
feature/student-dashboard
feature/officer-dashboard
feature/registrar-dashboard
feature/login-page
feature/notifications
feature/issue-management
feature/api-authentication
fix/login-validation
fix/clearance-status
docs/update-readme
```

Avoid branches such as:

```text
mybranch
test
new
changes
branch1
```

---

## 12. Commit Messages

Use clear commit messages.

Examples:

```text
feat: add student dashboard
feat: add office clearance workflow
feat: add issue creation
fix: correct clearance status display
fix: validate student ID
docs: update team roles
refactor: simplify clearance service
test: add issue resolution tests
```

Keep commits focused.

Avoid:

```text
update
changes
final
final2
everything
```

---

## 13. Development Principles

### Understand Before Coding

Before implementing a feature, understand:

* What problem it solves
* Which role uses it
* What data it needs
* Where that data comes from
* What backend operation will eventually provide it
* What rules must be enforced

### Backend Owns Business Rules

The frontend should display and validate information for usability, but important rules must be enforced by the backend.

For example:

```text
Frontend:
"Approve" button is disabled

Backend:
Registrar cannot approve unless all six offices are CLEARED
```

The backend is the final authority.

### Keep Modules Focused

Each member should primarily work within their assigned module.

If a change affects another member's module, discuss it before making the change.

### Reuse Components

Do not create five different buttons when one reusable Button component can be used.

The same principle applies to:

* Forms
* Tables
* Status badges
* Modals
* Notifications
* Loading states
* Error messages

---

## 14. Documentation

Before implementing a major feature, understand the relevant section of:

```text
docs/MASTER_GUIDE.md
```

Team responsibilities are documented in:

```text
docs/TEAM_ROLES.md
```

Mock data and its relationship to the real backend are documented in:

```text
docs/MOCK_DATA_GUIDE.md
```

---

## 15. Project Goal

The final system should demonstrate a complete end-to-end clearance workflow:

```text
Registrar Initiates
        ↓
Student Submits
        ↓
Six Offices Process
        ↓
Issues Are Resolved
        ↓
All Offices Clear
        ↓
Registrar Approves
        ↓
Clearance Completed
        ↓
Student Downloads Clearance
```

The goal is not to recreate the entire university system.

The goal is to build a focused, maintainable **University Clearance System that works around the existing university system**.

# Backend

This directory contains the backend of the University Clearance System.

## Technology

* Python
* Django
* Django REST Framework
* PostgreSQL
* JWT Authentication

## Responsibilities

The backend is responsible for:

* Authentication and authorization
* Clearance workflow
* Office assignment
* Clearance status management
* Issue/flag management
* Notifications
* Audit logging
* API endpoints
* Business rules and validation
* Database operations

## Important Architecture Principle

The University Clearance System is **not a replacement for the existing university system**.

The existing university system is expected to provide information such as:

* Student ID
* Student name
* Faculty
* Department
* Section
* Year
* University credentials

The clearance backend should only own data and functionality related to the clearance process.

## Planned Backend Structure

```text
backend/
├── config/
├── clearance/
├── notifications/
├── audit/
└── README.md
```

Additional applications should only be created when there is a clear responsibility for them.

## Development Rule

Business rules must be enforced by the backend.

Frontend validation improves user experience, but it must not be relied upon for security or workflow enforcement.

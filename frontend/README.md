# Frontend

This directory contains the React frontend of the University Clearance System.

## Technology

* React
* Tailwind CSS
* JavaScript
* REST API integration

## Responsibilities

The frontend is responsible for:

* User interface
* Navigation
* Role-based pages
* Forms
* Clearance progress display
* Office dashboards
* Registrar dashboard
* Notifications
* Issue display and resolution interfaces
* API communication
* User-friendly validation and feedback

## Planned Structure

```text
frontend/
└── src/
    ├── components/
    ├── pages/
    │   ├── auth/
    │   ├── student/
    │   ├── officer/
    │   ├── registrar/
    │   └── admin/
    ├── services/
    ├── hooks/
    ├── context/
    ├── routes/
    ├── utils/
    └── App.jsx
```

## Current Development Approach

During early frontend development, the frontend may use:

```text
src/data/mockData.js
```

The mock data simulates both existing university-system information and clearance-system information.

Once the backend APIs are ready, frontend components will gradually be connected to the real API.

## Development Rule

Components should not contain unnecessary business logic.

API communication should eventually be separated into the appropriate service layer, while reusable UI should be placed in reusable components.

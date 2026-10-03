# University Clearance System

A university graduation project for digitizing the university clearance process.

## Quick Start

Before starting, make sure your computer has these installed:

- Python
- Node.js
- npm
- Git

Check:

```bash
python --version
node --version
npm --version
git --version
```

---

## 1. Clone the Repository or Pull the latest version

```bash
git clone https://github.com/nibmangit/UNIVERSITY-CLEARANCE-SYSTEM.git

or 

git pull origin main
```

---

## 2. Start the Backend

Go to the backend:

```bash
cd backend
```

### Create and activate the virtual environment

Linux/macOS:

```bash
python -m venv venv
source venv/bin/activate
```

Windows:

```powershell
python -m venv venv
venv\Scripts\activate
```

### Install the required packages

```bash
pip install -r requirements.txt
```

### Create the database

```bash
python manage.py migrate
```

### Add the development/seed data

```bash
python manage.py seed_data
```

This creates the sample students, staff, offices, clearances, issues, and other required data.

### Run the backend

```bash
python manage.py runserver
```

The backend will run at:

```text
http://127.0.0.1:8000/
```

**Keep this terminal running.**

---

## 3. Start the Frontend

Open a **new terminal**.

Go to the frontend:

```bash
cd UNIVERSITY-CLEARANCE-SYSTEM/frontend
```

Install the frontend packages:

```bash
npm install
```

Then start the frontend:

```bash
npm run dev
```

The frontend will normally run at:

```text
http://localhost:5173/
```

Open it in your browser.

---

## 4. Login

Go to:

```text
http://localhost:5173/login
```

Use one of the development accounts created by:

```bash
python manage.py seed_data
```

### Student

```text
BDU00123
BDU00124
BDU00125
```

### Officer

```text
OFF001
OFF002
OFF003
```

### Registrar

```text
REG001
```

### Admin

```text
ADM001
```

Use the development password(works for all user) defined in the project's `seed_data` command.
```
TestPass123!
```

---

## 5. Daily Development

After the first setup, you normally only need **two terminals**.

### Terminal 1 — Backend

```bash
cd UNIVERSITY-CLEARANCE-SYSTEM/backend
source venv/bin/activate
python manage.py runserver
```

### Terminal 2 — Frontend

```bash
cd UNIVERSITY-CLEARANCE-SYSTEM/frontend
npm run dev
```

Then open:

```text
http://localhost:5173/
```

---

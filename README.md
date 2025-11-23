# Human Resources Management System (HRMS)

## Live Demo

- **Frontend:** _link_
- **Backend (API):** _link_

---

## Project Description

This application is a lightweight system designed to manage users, employees, teams, and activity logs. It includes essential features such as authentication, CRUD operations, team assignments, and action tracking. The backend uses Node.js and Express with SQLite for data storage, while the frontend is a React-based single-page application that interacts with the backend through REST APIs.

---

## Repository Setup

### Clone the Repository

```bash
git clone https://github.com/Darshanas17/Human-Resource-Management-System-HRMS-.git
cd Human-Resource-Management-System-HRMS-
```

---

## Project Structure

- **backend/** — Express API, SQLite database, seed script
- **frontend/** — React single-page application

---

## Prerequisites

- Node.js (version 16 or higher)
- npm (included with Node.js)

---

## Installation and Execution (Windows / PowerShell)

After cloning the repository, follow the steps below.

### 1. Install Backend Dependencies

```powershell
cd backend
npm install
```

---

### 2. Install Frontend Dependencies

```powershell
cd ../frontend
npm install
```

---

### 3. Seed the Backend Database

```powershell
cd ../backend
npm run seed
```

This initializes the SQLite database with sample organisations, users, employees, teams, and logs.

---

### 4. Start the Backend Server (Development Mode)

```powershell
npm run dev
```

Backend will run at:
`http://localhost:5000`

---

### 5. Start the Frontend Application (Development Server)

Open a new terminal:

```powershell
cd frontend
npm start
```

Frontend will run at:
`http://localhost:3000`

---

## Available Scripts

### Backend

- `npm run start` — Starts the backend in production mode
- `npm run dev` — Runs the backend in development mode with nodemon
- `npm run seed` — Seeds the database

### Frontend

- `npm start` — Starts the React development server
- `npm run build` — Builds the production bundle

# HR Management System - Frontend

React frontend application for the Government HR Management System.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (optional):
Create a `.env` file:
```bash
VITE_API_URL=http://localhost:3001
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3004`

## Features

### SUPER_ADMIN Features
- **Departments Management**: Create, view, and manage departments
- **Employees Management**: Create employees, assign departments, link user accounts
- **Employee Profiles**: View detailed employee information

### DEPARTMENT_HEAD Features
- **Department Employees**: View all employees in their department
- **Employee Profiles**: View employee details (read-only)

### EMPLOYEE Features
- **Own Profile**: View own employee profile (read-only)

## Authentication

The frontend expects JWT tokens from the authentication system. Tokens should be stored in localStorage and included in API requests via the Authorization header.

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable components
│   ├── contexts/       # React contexts (Auth)
│   ├── pages/          # Page components
│   ├── services/       # API services
│   └── App.jsx         # Main app component
```

## Build

```bash
npm run build
```

The build output will be in the `dist/` directory.

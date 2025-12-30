# Restaurant POS System – Frontend (React + Tailwind CSS)

## Overview
This repository contains the frontend of the Restaurant POS system built using **React** and **Tailwind CSS**.  

It communicates with the Django backend via REST APIs and provides **role-based dashboards** for:
- Manager
- Waiter
- Cashier

---

## Tech Stack
- React (CRA)  
- Tailwind CSS  
- React Router  
- Fetch API / Axios  
- JWT Authentication  

---

## Features
- Login page with role-based redirection
- Manager dashboard: tables & menu management
- Waiter dashboard: order management
- Cashier dashboard: billing management
- Responsive layout for mobile, tablet, and desktop
- Token-based API requests to backend

---

## Setup Instructions

### 1️. Clone repository
```bash
git clone <frontend-repo-url>
cd restaurant-pos-frontend
````

### 2️. Install dependencies

```bash
npm install
```

### 3️. Configure API Base URL

By default, API points to:

```js
const API_BASE_URL = "http://localhost:8000";
```

Change if your backend runs elsewhere.

### 4️. Start Frontend

```bash
npm start
```

Frontend runs at `http://localhost:3000`

---

## Login Flow

1. Users log in using credentials created by Admin (superuser)
2. JWT token stored in localStorage
3. Role-based redirection:

   * Manager → `/manager-dashboard`
   * Waiter → `/waiter-dashboard`
   * Cashier → `/cashier-dashboard`

---

## Demo Credentials

| Role    | Username | Password   |
| ------- | -------- | ---------- |
| Admin   | admin    | admin123   |
| Manager | manager1 | manager123 |
| Waiter  | waiter1  | waiter123  |
| Cashier | cashier1 | cashier123 |


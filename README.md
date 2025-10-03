# ✨ SmartBus – Login & Starter Guide

<p align="center">
  <img src="frontend/public/logo.png" alt="SmartBus" width="220" />
</p>

---

![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=white) 
![Django](https://img.shields.io/badge/Backend-Django-092E20?logo=django&logoColor=white) 
![CSS Modules](https://img.shields.io/badge/Styles-CSS%20Modules-2965f1?logo=css3&logoColor=white)

### 🌈 Overview
SmartBus is a simple two-sided app (User / Bus Operator) with a modern, responsive login page built in React + Vite, and a Django backend. The goal is to provide a clean starting point you can extend into a full bus-tracking system.

### 🚀 Key Features (current)
- Two-panel, colorful login UI with brand header and responsive layout
- Role toggle (User / Bus)
- Demo credentials helper section
- Simple Django JSON login endpoint for quick testing

### 🧩 Tech Stack
- Frontend: React (Vite), CSS Modules
- Backend: Django 5, MySQL client (demo fixed-auth endpoint)

### ⚡ Quick Start
1) Backend (Windows PowerShell)
```
cd backend/Smartbus
..\bus\Scripts\Activate.ps1
python manage.py runserver 0.0.0.0:8000
```

2) Frontend
```
cd frontend
npm install
npm run dev
```

Open the app at the URL printed by Vite (typically http://localhost:5173).



### 🧪 Demo Credentials
- User: `user@smartbus.com` / `user123`
- Bus: `bus@smartbus.com` / `bus123`

### 📝 Notes
- Frontend image path uses Vite's `import.meta.env.BASE_URL` to ensure the bus image (`frontend/public/logo.png`) works in dev and builds.
- CORS is enabled and the login endpoint is CSRF-exempt for SPA testing.

---

Made with ❤️ for faster SmartBus prototyping.

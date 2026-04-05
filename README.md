
# EducationEasy – Automated Academic Administration System 🔥

## 〰️ Problem Statement

**Teachers Are Overloaded With Administrative Work**

Educational institutions still rely heavily on manual or semi-digital systems for managing:

* Attendance
* Grading
* Reports
* Student records  
* Timetables

This results in:

* Inefficiency
* Data inconsistency
* Increased workload
* Teacher burnout

---

## 💡 Solution

**EducationEasy** is a centralized academic management platform designed to automate repetitive administrative tasks and streamline workflows.

It enables teachers to:

* Mark attendance efficiently (including voice-based updates)
* Generate reports automatically
* Track student performance with analytics
* Manage grading digitally
* Access centralized academic records

Goal: **Reduce admin work → Increase teaching efficiency**

---

## Core Features

* **Automated Attendance System**

  * Voice-based attendance marking
  * Real-time status updates (Absent → Present)

* **Digital Grading System**

  * Structured grading input
  * Automated calculations

* **Report Generation**

  * Instant report creation
  * Performance-based insights

* **Student Performance Tracking**

  * Analytics dashboard
  * Alerts for low performance

* **Timetable Management**

  * Organized scheduling
  * Workload balancing

* **Centralized Records**

  * Single source of truth for all academic data

---

## Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Context API (State Management)

### Backend

* Node.js
* Express.js

### Database

* MySQL / PostgreSQL (via Prisma ORM)

### Other Tools

* Prisma (ORM & migrations)
* REST APIs
* JWT Authentication (middleware-based)

---

## 📁 Project Structure

### Backend

```
Backend/
│
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.js
│
├── src/
│   ├── controllers/
│   │   ├── admin.controller.js
│   │   ├── alert.controller.js
│   │   ├── attendance.controller.js
│   │   ├── auth.controller.js
│   │   ├── grade.controller.js
│   │   ├── report.controller.js
│   │   ├── student.controller.js
│   │   ├── teacher.controller.js
│   │   └── timetable.controller.js
│   │
│   ├── middleware/
│   │   └── auth.middleware.js
│   │
│   ├── routes/
│   │   ├── admin.routes.js
│   │   ├── alert.routes.js
│   │   ├── attendance.routes.js
│   │   ├── auth.routes.js
│   │   ├── grade.routes.js
│   │   ├── report.routes.js
│   │   ├── student.routes.js
│   │   ├── teacher.routes.js
│   │   └── timetable.routes.js
│   │
│   ├── utils/
│   │   └── prisma.js
│   │
│   └── server.js
│
├── package.json
└── .env
```

---

### Frontend

```
frontend/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── utils/
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── package.json
└── vite.config.js
```

---

## 🔄 System Workflow (High-Level)

1. **Frontend (React)**

   * User interacts with dashboard
   * Sends API requests (Axios/Fetch)

2. **Backend (Express)**

   * Routes → Controllers → Business Logic
   * Middleware handles authentication

3. **Database (Prisma + SQL)**

   * Stores students, attendance, grades, reports

4. **Response Flow**

   * Backend processes data
   * Sends JSON response to frontend
   * UI updates dynamically

---

## Example Flow – Attendance System

1. Teacher speaks student's name
2. Frontend captures input
3. API request → `/attendance/update`
4. Backend:

   * Finds student
   * Updates attendance status
5. Database updated
6. UI reflects change instantly

---

## 📈 Future Enhancements

* AI-based performance prediction
* Smart timetable optimization
* NLP-based voice improvements
* Mobile app integration

---

## Setup Instructions

### Backend

```bash
cd Backend
npm install
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Impact

* Reduces manual work significantly
* Minimizes human errors
* Improves data accessibility
* Enhances academic decision-making

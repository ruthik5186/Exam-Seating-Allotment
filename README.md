# Exam Seating Allotment System (ExamSeat)

An automated full-stack examination hall seating allotment platform built with **React**, **Node.js/Express**, and **PostgreSQL**. It arranges students into classrooms using a strict branch-alternating column algorithm to prevent cheating and provides self-service portals for students and administrators.

---

## 🌟 Key Features

* **Anti-Cheating Seating Algorithm**: Allocates students column-by-column, alternating branches (e.g. Column 1: CSE, Column 2: IT, Column 3: CSE, etc.) to minimize examination malpractice.
* **Student Portal**: Self-service roll number lookup to find assigned room, seat code (`R1C1`, `R1C2`, etc.), subject, and exam date.
* **Admin Dashboard**: Bulk upload rooms and students rosters via CSV files and trigger automatic seating allocation in one click.
* **2D Visual Seating Map**: Visual representation of classroom arrangements color-coded by branch to inspect and verify seating patterns.
* **PostgreSQL Native**: Powered by PostgreSQL, compatible natively with Render's free managed PostgreSQL database.
* **Single Web Service Deployment**: Unified Web Service on Render serving both the React frontend and Express backend under one URL with zero CORS issues.

---

## 📁 Repository Structure

```
.
├── package.json                  # Root build and start scripts for unified deployment
├── render.yaml                   # Single Web Service + PostgreSQL Blueprint for Render
├── exam-seating-backend/         # Express & PostgreSQL API
│   ├── index.js                  # Main server entry & REST endpoints
│   ├── schema.sql                # PostgreSQL Database schema definition
│   ├── package.json              # Backend dependencies (pg, express, etc.)
│   └── .env.example              # Example backend environment variables
├── exam-seating-frontend/        # React + Vite + Tailwind CSS frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminDashboard.jsx # CSV upload & allocation trigger
│   │   │   ├── StudentPortal.jsx  # Student seat lookup
│   │   │   ├── VisualLayout.jsx   # 2D visual classroom layout map
│   │   │   └── Navbar.jsx         # Navigation bar
│   │   ├── config.js              # Configurable API base URL
│   │   └── App.jsx
│   ├── public/_redirects         # SPA rewrite rule for static hosting
│   └── .env.example              # Example frontend environment variables
├── sample_data/                  # Sample CSV files for testing
│   ├── students.csv              # Sample student roster across multiple branches
│   └── rooms.csv                 # Sample classroom dimensions
└── README.md
```

---

## ☁️ Deploying to Render (onrender.com)

Render provides a **free managed PostgreSQL database** and runs your web application smoothly.

### Option 1: Automatic Blueprint Deployment (Recommended — 1 Click)
1. Open your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** > **Blueprint**.
3. Select your repository: `ruthik5186/Exam-Seating-Allotment`.
4. Render will read `render.yaml` and automatically create:
   * A **PostgreSQL database** (`exam-seating-db`)
   * A **Web Service** (`exam-seating-allotment`)
   * Automatically connect `DATABASE_URL` between them!
5. Click **Apply**. Done!

---

### Option 2: Manual Setup on Render

#### Step 1: Create a PostgreSQL Database on Render
1. In your Render Dashboard, click **New +** > **PostgreSQL**.
2. Set a name (e.g. `exam-seating-db`).
3. Choose the **Free** instance type.
4. Click **Create Database**.
5. Once created, copy the **Internal Database URL** (or External Database URL).

#### Step 2: Create the Web Service on Render
1. Click **New +** > **Web Service**.
2. Select your repository: `ruthik5186/Exam-Seating-Allotment`.
3. Configure the settings:
   * **Name**: `exam-seating-allotment`
   * **Runtime**: `Node`
   * **Build Command**: `npm run build`
   * **Start Command**: `npm start`
4. Under **Environment Variables**, add:
   * `NODE_ENV`: `production`
   * `DATABASE_URL`: `<paste-the-postgresql-database-url-from-step-1>`
5. Click **Create Web Service**.

Your app will build the React frontend, start the Express backend, automatically initialize the PostgreSQL tables, and run under your Render URL!

---

## 💻 Local Development Setup

### 1. Database Setup
Ensure PostgreSQL is running locally, and create a database named `exam_seating`:
```sql
CREATE DATABASE exam_seating;
```
*(The backend will automatically create the required `rooms`, `students`, and `allocations` tables on first connection).*

### 2. Backend Setup
1. In `exam-seating-backend/`:
   ```bash
   cd exam-seating-backend
   npm install
   ```
2. Configure `.env`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=exam_seating
   DB_SSL=false
   ```
3. Start the server:
   ```bash
   npm start
   ```

### 3. Frontend Setup
1. In `exam-seating-frontend/`:
   ```bash
   cd exam-seating-frontend
   npm install
   npm run dev
   ```
   Open `http://localhost:5173`.

---

## 📝 Sample Data Formats

Test CSV files are provided in [`sample_data/`](./sample_data):

### Students CSV (`sample_data/students.csv`)
```csv
roll_number,full_name,branch,semester
101,Aarav Sharma,CSE,6
102,Bhavna Patel,CSE,6
201,Gauri Nair,IT,6
```

### Rooms CSV (`sample_data/rooms.csv`)
```csv
room_number,capacity,rows_count,cols_count
Room-101,12,3,4
Room-102,12,3,4
```

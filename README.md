# Exam Seating Allotment System (ExamSeat)

An automated full-stack examination hall seating allotment platform built with **React**, **Node.js/Express**, and **MySQL**. It arranges students into classrooms using a strict branch-alternating column algorithm to prevent cheating and provides self-service portals for students and administrators.

---

## 🌟 Key Features

* **Anti-Cheating Seating Algorithm**: Allocates students column-by-column, alternating branches (e.g. Column 1: CSE, Column 2: IT, Column 3: CSE, etc.) to minimize examination malpractice.
* **Student Portal**: Self-service roll number lookup to find assigned room, seat code (`R1C1`, `R1C2`, etc.), subject, and exam date.
* **Admin Dashboard**: Bulk upload rooms and students rosters via CSV files and trigger automatic seating allocation in one click.
* **2D Visual Seating Map**: Visual representation of classroom arrangements color-coded by branch to inspect and verify seating patterns.
* **Single Web Service Deployment**: Can be deployed as a single unified Web Service on Render (frontend and backend running together on one service) or as split services.

---

## 📁 Repository Structure

```
.
├── package.json                  # Root build and start scripts for unified deployment
├── render.yaml                   # Single Web Service Render Blueprint
├── exam-seating-backend/         # Express & MySQL API
│   ├── index.js                  # Main server entry & REST endpoints
│   ├── schema.sql                # MySQL Database schema definition
│   ├── package.json              # Backend dependencies & scripts
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

## 🚀 Local Development Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* [MySQL](https://www.mysql.com/) (Local MySQL, XAMPP, or cloud MySQL instance)

### 1. Database Setup
Create a database named `exam_seating` in MySQL:
```sql
CREATE DATABASE exam_seating;
```
*(The backend will automatically create the required `rooms`, `students`, and `allocations` tables upon first connection).*

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd exam-seating-backend
   ```
2. Create `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   Configure your MySQL credentials in `.env`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=exam_seating
   DB_SSL=false
   ```
3. Install dependencies and start the backend:
   ```bash
   npm install
   npm run dev    # or: npm start
   ```
   The backend API will run on `http://localhost:5000`.

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd exam-seating-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

---

## ☁️ Deploying as a Single Web Service on Render (onrender.com)

Deploying as a **single Web Service** hosts the React frontend and Express backend together under one URL and consumes only **1 free service slot**!

### Step 1: Set up a Free Cloud MySQL Database
Render does not provide managed MySQL on the free tier, so you can create a free cloud MySQL database in 1 minute using:
* [TiDB Cloud Serverless](https://tidbcloud.com/) (Free MySQL-compatible tier)
* [Aiven for MySQL](https://aiven.io/) (Free tier)
* [Clever Cloud](https://www.clever-cloud.com/) (Free MySQL add-on)

Copy your **Host**, **Port**, **User**, **Password**, and **Database Name**.

### Step 2: Deploy on Render as a Web Service

1. Open your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** > **Web Service**.
3. Select your repository: `ruthik5186/Exam-Seating-Allotment`.
4. Configure the Web Service:
   * **Name**: `exam-seating-allotment`
   * **Runtime**: `Node`
   * **Build Command**: `npm run build`
   * **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   * `NODE_ENV`: `production`
   * `DB_HOST`: `<your-cloud-mysql-host>`
   * `DB_PORT`: `3306`
   * `DB_USER`: `<your-db-user>`
   * `DB_PASSWORD`: `<your-db-password>`
   * `DB_NAME`: `<your-db-name>`
   * `DB_SSL`: `true`
6. Click **Create Web Service**.

Render will automatically build the React frontend, package the Express server, and launch the unified full-stack application!

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

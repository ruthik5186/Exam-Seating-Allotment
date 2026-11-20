# Exam Seating Allotment System (ExamSeat)

An automated full-stack examination hall seating allotment platform built with **React**, **Node.js/Express**, and **MySQL**. It arranges students into classrooms using a strict branch-alternating column algorithm to prevent cheating and provides self-service portals for students and administrators.

---

## 🌟 Key Features

* **Anti-Cheating Seating Algorithm**: Allocates students column-by-column, alternating branches (e.g. Column 1: CSE, Column 2: IT, Column 3: CSE, etc.) to minimize examination malpractice.
* **Student Portal**: Self-service roll number lookup to find assigned room, seat code (`R1C1`, `R1C2`, etc.), subject, and exam date.
* **Admin Dashboard**: Bulk upload rooms and students rosters via CSV files and trigger automatic seating allocation in one click.
* **2D Visual Seating Map**: Visual representation of classroom arrangements color-coded by branch to inspect and verify seating patterns.
* **Render & Cloud Ready**: Fully configured for deployment on [Render](https://render.com) using `render.yaml` Blueprint or separate Web Service / Static Site.

---

## 📁 Repository Structure

```
.
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
├── render.yaml                   # Infrastructure-as-Code Blueprint for Render
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

## ☁️ Deploying to Render (onrender.com)

Render supports deploying this project either automatically using the included `render.yaml` Blueprint or manually in the Render dashboard.

### Option A: Using Render Blueprints (Recommended)
1. Push this repository to your GitHub account.
2. Log into your [Render Dashboard](https://dashboard.render.com).
3. Click **New +** > **Blueprint**.
4. Connect your GitHub repository. Render will automatically detect `render.yaml` and configure both the backend service and frontend static site.
5. In the Render prompt, fill in your MySQL database credentials (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).

---

### Option B: Manual Setup on Render

#### Step 1: Set up a Free Cloud MySQL Database
Render provides PostgreSQL natively, but for MySQL you can use a free cloud MySQL database:
* [Aiven for MySQL](https://aiven.io/) (Free tier available)
* [TiDB Cloud Serverless](https://tidbcloud.com/) (Free MySQL-compatible tier)
* [Clever Cloud](https://www.clever-cloud.com/) (Free MySQL add-on)

Copy your connection details: Host, Port, User, Password, Database Name.

#### Step 2: Deploy the Backend (Web Service)
1. On Render, click **New +** > **Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   * **Name**: `exam-seating-backend`
   * **Root Directory**: `exam-seating-backend`
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `node index.js`
4. Under **Environment Variables**, add:
   * `NODE_ENV`: `production`
   * `DB_HOST`: `<your-db-host>`
   * `DB_PORT`: `3306` (or your cloud DB port)
   * `DB_USER`: `<your-db-user>`
   * `DB_PASSWORD`: `<your-db-password>`
   * `DB_NAME`: `<your-db-name>`
   * `DB_SSL`: `true` (if using cloud DB with SSL)
5. Click **Create Web Service**. Note the deployed URL (e.g. `https://exam-seating-backend.onrender.com`).

#### Step 3: Deploy the Frontend (Static Site)
1. On Render, click **New +** > **Static Site**.
2. Connect your GitHub repository.
3. Configure the site:
   * **Name**: `exam-seating-frontend`
   * **Root Directory**: `exam-seating-frontend`
   * **Build Command**: `npm install && npm run build`
   * **Publish Directory**: `dist`
4. Under **Environment Variables**, add:
   * `VITE_API_URL`: `https://exam-seating-backend.onrender.com` (your backend Render URL)
5. Under **Redirects / Rewrites**, add:
   * **Source**: `/*`
   * **Destination**: `/index.html`
   * **Action**: `Rewrite`
6. Click **Create Static Site**.

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

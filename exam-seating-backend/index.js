const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const { Readable } = require('stream');
const csv = require('csv-parser');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Set up Multer for handling CSV file uploads in memory
const upload = multer({ storage: multer.memoryStorage() });

// PostgreSQL Connection Pool
// Automatically supports Render native DATABASE_URL or individual DB_* variables
const pool = new Pool(
    process.env.DATABASE_URL
        ? {
              connectionString: process.env.DATABASE_URL,
              ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false }
          }
        : {
              host: process.env.DB_HOST || 'localhost',
              port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
              user: process.env.DB_USER || 'postgres',
              password: process.env.DB_PASSWORD,
              database: process.env.DB_NAME || 'exam_seating',
              ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
          }
);

// Auto-initialize PostgreSQL tables if they don't exist
const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS rooms (
                id SERIAL PRIMARY KEY,
                room_number VARCHAR(50) NOT NULL,
                capacity INT NOT NULL,
                rows_count INT NOT NULL,
                cols_count INT NOT NULL
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS students (
                id SERIAL PRIMARY KEY,
                roll_number VARCHAR(50) NOT NULL UNIQUE,
                full_name VARCHAR(100) NOT NULL,
                branch VARCHAR(50) NOT NULL,
                semester VARCHAR(20) NOT NULL
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS allocations (
                id SERIAL PRIMARY KEY,
                student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
                room_id INT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
                seat_code VARCHAR(20) NOT NULL,
                subject_name VARCHAR(100),
                exam_date DATE
            );
        `);
        console.log('✅ PostgreSQL database tables verified/initialized successfully');
    } catch (err) {
        console.error('⚠️ PostgreSQL database table initialization warning:', err.message);
    }
};

// Health Check API
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Exam Seating API is running...' }));

// Test Database Connection
pool.connect()
    .then((client) => {
        console.log('✅ Connected to PostgreSQL Database');
        client.release();
        initDb();
    })
    .catch((err) => {
        console.error('❌ PostgreSQL Database connection failed:', err.message);
    });

// ==========================================
// API ENDPOINTS (Routes)
// ==========================================

// 1. Upload Rooms Data (CSV)
app.post('/api/rooms/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const results = [];
    Readable.from(req.file.buffer).pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                // Clear dependent allocations first to avoid foreign key errors
                await pool.query('DELETE FROM allocations');
                await pool.query('DELETE FROM rooms');
                for (let room of results) {
                    await pool.query(
                        'INSERT INTO rooms (room_number, capacity, rows_count, cols_count) VALUES ($1, $2, $3, $4)',
                        [
                            room.room_number,
                            parseInt(room.capacity, 10),
                            parseInt(room.rows_count, 10),
                            parseInt(room.cols_count, 10)
                        ]
                    );
                }
                res.status(200).json({ message: 'Rooms uploaded and saved successfully!' });
            } catch (error) {
                res.status(500).json({ error: 'Database error', details: error.message });
            }
        });
});

// 2. Upload Students Data (CSV)
app.post('/api/students/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const results = [];
    Readable.from(req.file.buffer).pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                // Clear dependent allocations first to avoid foreign key errors
                await pool.query('DELETE FROM allocations');
                await pool.query('DELETE FROM students');
                for (let student of results) {
                    await pool.query(
                        'INSERT INTO students (roll_number, full_name, branch, semester) VALUES ($1, $2, $3, $4)',
                        [student.roll_number, student.full_name, student.branch, student.semester]
                    );
                }
                res.status(200).json({ message: 'Students uploaded and saved successfully!' });
            } catch (error) {
                res.status(500).json({ error: 'Database error', details: error.message });
            }
        });
});

// 3. Trigger Strict 2-Branch Column Seating Algorithm
app.post('/api/allocations/generate', async (req, res) => {
    const { subject_name, exam_date } = req.body;

    try {
        await pool.query('DELETE FROM allocations');
        const { rows: students } = await pool.query('SELECT * FROM students ORDER BY branch, roll_number');
        const { rows: rooms } = await pool.query('SELECT * FROM rooms ORDER BY room_number');

        if (students.length === 0 || rooms.length === 0) {
            return res.status(400).json({ error: 'Ensure students and rooms are uploaded first.' });
        }

        // Group students by branch
        let branchGroups = {};
        students.forEach(s => {
            if (!branchGroups[s.branch]) branchGroups[s.branch] = [];
            branchGroups[s.branch].push(s);
        });

        let allocations = [];
        let totalAllocated = 0;

        for (let room of rooms) {
            // Strictly pick only the top 2 remaining branches for this room
            let activeBranches = Object.keys(branchGroups)
                .filter(b => branchGroups[b].length > 0)
                .sort((a, b) => branchGroups[b].length - branchGroups[a].length)
                .slice(0, 2);

            if (activeBranches.length === 0) break;

            let branchA = branchGroups[activeBranches[0]];
            let branchB = activeBranches[1] ? branchGroups[activeBranches[1]] : [];

            // Fill Column by Column: Odd = Branch A, Even = Branch B (No same-branch fallback)
            for (let c = 1; c <= room.cols_count; c++) {
                for (let r = 1; r <= room.rows_count; r++) {
                    let studentToSeat = null;

                    if (c % 2 !== 0 && branchA.length > 0) {
                        studentToSeat = branchA.shift();
                    } else if (c % 2 === 0 && branchB.length > 0) {
                        studentToSeat = branchB.shift();
                    }

                    if (studentToSeat) {
                        allocations.push([
                            studentToSeat.id,
                            room.id,
                            `R${r}C${c}`,
                            subject_name || 'General Exam',
                            exam_date || new Date().toISOString().split('T')[0]
                        ]);
                        totalAllocated++;
                    }
                }
            }
        }

        if (allocations.length > 0) {
            const valuePlaceholders = [];
            const flatValues = [];
            allocations.forEach((item, index) => {
                const offset = index * 5;
                valuePlaceholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`);
                flatValues.push(...item);
            });

            const query = `
                INSERT INTO allocations (student_id, room_id, seat_code, subject_name, exam_date)
                VALUES ${valuePlaceholders.join(', ')}
            `;
            await pool.query(query, flatValues);
        }

        const unallocated = Object.values(branchGroups).flat().length;
        res.status(200).json({
            message: 'Seating generated successfully!',
            total_allocated: totalAllocated,
            unallocated: unallocated
        });

    } catch (error) {
        res.status(500).json({ error: 'Allocation failed', details: error.message });
    }
});

// 4. Fetch ALL allocations for the Visual Map
app.get('/api/allocations/all', async (req, res) => {
    try {
        const query = `
            SELECT 
                s.full_name, s.roll_number, s.branch, 
                r.room_number, a.seat_code, a.subject_name, a.exam_date 
            FROM allocations a
            JOIN students s ON a.student_id = s.id
            JOIN rooms r ON a.room_id = r.id
            ORDER BY r.room_number, a.seat_code
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Student Search Endpoint
app.get('/api/allocations/search', async (req, res) => {
    const { roll } = req.query;
    if (!roll) return res.status(400).json({ error: 'Roll number is required' });

    try {
        const query = `
            SELECT 
                s.full_name, s.roll_number, s.branch, 
                r.room_number, a.seat_code, a.subject_name, a.exam_date 
            FROM allocations a
            JOIN students s ON a.student_id = s.id
            JOIN rooms r ON a.room_id = r.id
            WHERE s.roll_number = $1
        `;
        const { rows } = await pool.query(query, [roll]);

        if (rows.length === 0) return res.status(404).json({ error: 'No seat allocation found.' });
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// Serve React frontend build (Single Web Service mode)
const frontendDist = path.join(__dirname, '../exam-seating-frontend/dist');
if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
}

// Wildcard route to serve React SPA for any non-API route
app.get('*', (req, res) => {
    const indexPath = path.join(frontendDist, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.json({ status: 'ok', message: 'Exam Seating API is running...' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});

module.exports = app;

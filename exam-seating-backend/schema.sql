-- PostgreSQL Database Schema for Exam Seating Allotment System

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(50) NOT NULL,
    capacity INT NOT NULL,
    rows_count INT NOT NULL,
    cols_count INT NOT NULL
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    roll_number VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    branch VARCHAR(50) NOT NULL,
    semester VARCHAR(20) NOT NULL
);

-- Seating allocations table
CREATE TABLE IF NOT EXISTS allocations (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    room_id INT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    seat_code VARCHAR(20) NOT NULL,
    subject_name VARCHAR(100),
    exam_date DATE
);

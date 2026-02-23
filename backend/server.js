const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: '127.0.0.1', 
  user: 'root',
  password: '',
  database: 'unisphere_db'
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to unisphere_db');
});

// 1. Profile Data (Fetches Name & GPA for the Dashboard)
app.get('/api/students/:id', (req, res) => {
  const sql = "SELECT first_name, last_name, gpa, total_credit FROM Students WHERE student_id = ?";
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results[0]);
  });
});

// 2. Timetable Logic
app.get('/api/timetable/:id', (req, res) => {
  const sql = `
    SELECT c.course_name, t.days, t.periods, cl.building, cl.room_number 
    FROM Time_table t
    JOIN Courses c ON t.course_id = c.course_id
    JOIN Classrooms cl ON t.classroom_id = cl.classroom_id
    JOIN Enrollments e ON c.course_id = e.course_id
    WHERE e.student_id = ?`;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// 3. Exam Schedule Logic
app.get('/api/exams/:id', (req, res) => {
  const sql = `
    SELECT c.course_name, ex.exam_type, ex.exam_date, ex.total_marks 
    FROM Exams ex
    JOIN Courses c ON ex.course_id = c.course_id
    JOIN Enrollments e ON c.course_id = e.course_id
    WHERE e.student_id = ?`;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// 4. Grades Logic (Separated)
app.get('/api/grades/:id', (req, res) => {
  const sql = "SELECT c.course_name, e.grade FROM Enrollments e JOIN Courses c ON e.course_id = c.course_id WHERE e.student_id = ?";
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// 5. Attendance Logic (Separated)
app.get('/api/attendance/:id', (req, res) => {
  const sql = `
    SELECT c.course_name, a.status FROM Attendance a
    JOIN Enrollments e ON a.enrollment_id = e.enrollment_id
    JOIN Courses c ON e.course_id = c.course_id
    WHERE e.student_id = ?`;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// 6. Transcript Request (Interacts with Admin Part)
app.post('/api/transcript-request', (req, res) => {
  const { student_id } = req.body;
  const sql = "INSERT INTO Notifications (title, message, recipient_student_id) VALUES ('Transcript Request', 'Student has requested an official transcript.', ?)";
  db.query(sql, [student_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Request submitted successfully!" });
  });
});

app.listen(5000, () => console.log('Backend running on port 5000'));
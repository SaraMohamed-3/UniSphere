const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'sis',
    password: process.env.DB_PASSWORD || '12345',
    database: process.env.DB_NAME || 'sis_db',
});

// ==================== PROFILE ====================
const getProfile = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.user_id, u.email, u.role, u.first_name, u.last_name,
                    p.professor_id, p.department_id, d.name as department_name,
                    p.office_hours
             FROM users u
             JOIN professors p ON u.user_id = p.user_id
             JOIN departments d ON p.department_id = d.department_id
             WHERE u.user_id = $1`,
            [req.user.user_id]
        );
        res.json(result.rows[0] || {});
    } catch (error) {
        console.error('Error in getProfile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ==================== CLASSES ====================
const getClasses = async (req, res) => {
    try {
        const professorResult = await pool.query(
            `SELECT professor_id FROM professors WHERE user_id = $1`,
            [req.user.user_id]
        );

        if (professorResult.rows.length === 0) {
            return res.json([]);
        }

        const professorId = professorResult.rows[0].professor_id;

        const result = await pool.query(
            `SELECT c.class_id, c.semester, c.year, c.schedule, c.room,
                    cr.course_id, cr.course_code, cr.course_name, cr.credits,
                    COUNT(DISTINCT e.student_id) as student_count
             FROM classes c
             JOIN courses cr ON c.course_id = cr.course_id
             LEFT JOIN enrollments e ON c.class_id = e.class_id AND e.status = 'active'
             WHERE c.professor_id = $1
             GROUP BY c.class_id, cr.course_id, cr.course_code, cr.course_name, cr.credits
             ORDER BY c.year DESC, c.semester`,
            [professorId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error in getClasses:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ==================== STUDENTS ====================
const getClassStudents = async (req, res) => {
    try {
        const { classId } = req.params;
        
        const professorResult = await pool.query(
            `SELECT professor_id FROM professors WHERE user_id = $1`,
            [req.user.user_id]
        );

        if (professorResult.rows.length === 0) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        const professorId = professorResult.rows[0].professor_id;

        const classCheck = await pool.query(
            'SELECT class_id FROM classes WHERE class_id = $1 AND professor_id = $2',
            [classId, professorId]
        );

        if (classCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const result = await pool.query(
            `SELECT s.student_id, u.user_id, u.email, u.first_name, u.last_name,
                    d.name as department, e.enrollment_date
             FROM enrollments e
             JOIN students s ON e.student_id = s.student_id
             JOIN users u ON s.user_id = u.user_id
             JOIN departments d ON s.department_id = d.department_id
             WHERE e.class_id = $1 AND e.status = 'active'
             ORDER BY u.last_name, u.first_name`,
            [classId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error in getClassStudents:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ==================== GRADES ====================
const getClassGrades = async (req, res) => {
    try {
        const { classId } = req.params;
        
        const professorResult = await pool.query(
            `SELECT professor_id FROM professors WHERE user_id = $1`,
            [req.user.user_id]
        );

        if (professorResult.rows.length === 0) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        const professorId = professorResult.rows[0].professor_id;

        const classCheck = await pool.query(
            'SELECT class_id FROM classes WHERE class_id = $1 AND professor_id = $2',
            [classId, professorId]
        );

        if (classCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const result = await pool.query(
            `SELECT g.grade_id, g.student_id, u.first_name, u.last_name,
                    g.grade_component, g.score, g.max_score, g.weight,
                    g.date_recorded
             FROM grades g
             JOIN students s ON g.student_id = s.student_id
             JOIN users u ON s.user_id = u.user_id
             WHERE g.class_id = $1
             ORDER BY u.last_name, u.first_name, g.grade_component`,
            [classId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error in getClassGrades:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const saveGrades = async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const { classId, grades } = req.body;
        
        const professorResult = await client.query(
            `SELECT professor_id FROM professors WHERE user_id = $1`,
            [req.user.user_id]
        );

        if (professorResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Professor not found' });
        }

        const professorId = professorResult.rows[0].professor_id;

        const classCheck = await client.query(
            'SELECT class_id FROM classes WHERE class_id = $1 AND professor_id = $2',
            [classId, professorId]
        );

        if (classCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({ message: 'Access denied' });
        }
        
        for (const grade of grades) {
            const { studentId, gradeComponent, score, maxScore, weight } = grade;
            
            const existing = await client.query(
                `SELECT grade_id FROM grades 
                 WHERE student_id = $1 AND class_id = $2 AND grade_component = $3`,
                [studentId, classId, gradeComponent]
            );
            
            if (existing.rows.length > 0) {
                await client.query(
                    `UPDATE grades 
                     SET score = $1, max_score = $2, weight = $3, 
                         date_recorded = CURRENT_DATE, recorded_by = $4
                     WHERE student_id = $5 AND class_id = $6 AND grade_component = $7`,
                    [score, maxScore, weight, professorId, studentId, classId, gradeComponent]
                );
            } else {
                await client.query(
                    `INSERT INTO grades 
                     (student_id, class_id, grade_component, score, max_score, weight, recorded_by)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [studentId, classId, gradeComponent, score, maxScore, weight, professorId]
                );
            }
        }
        
        await client.query('COMMIT');
        res.json({ message: 'Grades saved successfully', count: grades.length });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in saveGrades:', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
};

// ==================== ATTENDANCE ====================
const getAttendance = async (req, res) => {
    try {
        const { classId } = req.params;
        const { date } = req.query;
        
        const professorResult = await pool.query(
            `SELECT professor_id FROM professors WHERE user_id = $1`,
            [req.user.user_id]
        );

        if (professorResult.rows.length === 0) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        const professorId = professorResult.rows[0].professor_id;

        const classCheck = await pool.query(
            'SELECT class_id FROM classes WHERE class_id = $1 AND professor_id = $2',
            [classId, professorId]
        );

        if (classCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        const targetDate = date || new Date().toISOString().split('T')[0];
        
        const result = await pool.query(
            `SELECT s.student_id, u.first_name, u.last_name, u.email,
                    a.attendance_id, a.status, a.notes
             FROM enrollments e
             JOIN students s ON e.student_id = s.student_id
             JOIN users u ON s.user_id = u.user_id
             LEFT JOIN attendance a ON s.student_id = a.student_id 
                 AND a.class_id = $1 AND a.date = $2
             WHERE e.class_id = $1 AND e.status = 'active'
             ORDER BY u.last_name, u.first_name`,
            [classId, targetDate]
        );
        
        res.json({
            date: targetDate,
            students: result.rows
        });
    } catch (error) {
        console.error('Error in getAttendance:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const saveAttendance = async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const { classId, date, attendance } = req.body;
        
        const professorResult = await client.query(
            `SELECT professor_id FROM professors WHERE user_id = $1`,
            [req.user.user_id]
        );

        if (professorResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Professor not found' });
        }

        const professorId = professorResult.rows[0].professor_id;

        const classCheck = await client.query(
            'SELECT class_id FROM classes WHERE class_id = $1 AND professor_id = $2',
            [classId, professorId]
        );

        if (classCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({ message: 'Access denied' });
        }
        
        for (const record of attendance) {
            const { studentId, status, notes } = record;
            
            const existing = await client.query(
                `SELECT attendance_id FROM attendance 
                 WHERE student_id = $1 AND class_id = $2 AND date = $3`,
                [studentId, classId, date]
            );
            
            if (existing.rows.length > 0) {
                await client.query(
                    `UPDATE attendance 
                     SET status = $1, notes = $2, recorded_by = $3
                     WHERE student_id = $4 AND class_id = $5 AND date = $6`,
                    [status, notes, professorId, studentId, classId, date]
                );
            } else {
                await client.query(
                    `INSERT INTO attendance 
                     (student_id, class_id, date, status, notes, recorded_by)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [studentId, classId, date, status, notes, professorId]
                );
            }
        }
        
        await client.query('COMMIT');
        res.json({ message: 'Attendance saved successfully', count: attendance.length });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in saveAttendance:', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
};

const getAttendanceHistory = async (req, res) => {
    try {
        const { classId } = req.params;
        
        const professorResult = await pool.query(
            `SELECT professor_id FROM professors WHERE user_id = $1`,
            [req.user.user_id]
        );

        if (professorResult.rows.length === 0) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        const professorId = professorResult.rows[0].professor_id;

        const classCheck = await pool.query(
            'SELECT class_id FROM classes WHERE class_id = $1 AND professor_id = $2',
            [classId, professorId]
        );

        if (classCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        const result = await pool.query(
            `SELECT date,
                    COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
                    COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_count,
                    COUNT(CASE WHEN status = 'late' THEN 1 END) as late_count,
                    COUNT(CASE WHEN status = 'excused' THEN 1 END) as excused_count,
                    COUNT(*) as total
             FROM attendance
             WHERE class_id = $1
             GROUP BY date
             ORDER BY date DESC`,
            [classId]
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error in getAttendanceHistory:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ==================== ANNOUNCEMENTS ====================
const getAnnouncements = async (req, res) => {
    try {
        const { classId } = req.params;
        
        const professorResult = await pool.query(
            `SELECT professor_id FROM professors WHERE user_id = $1`,
            [req.user.user_id]
        );

        if (professorResult.rows.length === 0) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        const professorId = professorResult.rows[0].professor_id;

        const classCheck = await pool.query(
            'SELECT class_id FROM classes WHERE class_id = $1 AND professor_id = $2',
            [classId, professorId]
        );

        if (classCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        const result = await pool.query(
            `SELECT a.announcement_id, a.title, a.content, a.posted_date, a.expiry_date,
                    u.first_name, u.last_name
             FROM announcements a
             JOIN professors p ON a.professor_id = p.professor_id
             JOIN users u ON p.user_id = u.user_id
             WHERE a.class_id = $1
             ORDER BY a.posted_date DESC`,
            [classId]
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error in getAnnouncements:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const postAnnouncement = async (req, res) => {
    try {
        const { classId, title, content, expiryDate } = req.body;
        
        const professorResult = await pool.query(
            `SELECT professor_id FROM professors WHERE user_id = $1`,
            [req.user.user_id]
        );

        if (professorResult.rows.length === 0) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        const professorId = professorResult.rows[0].professor_id;

        const classCheck = await pool.query(
            'SELECT class_id FROM classes WHERE class_id = $1 AND professor_id = $2',
            [classId, professorId]
        );

        if (classCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        const result = await pool.query(
            `INSERT INTO announcements (class_id, professor_id, title, content, expiry_date)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING announcement_id`,
            [classId, professorId, title, content, expiryDate]
        );
        
        res.status(201).json({ 
            message: 'Announcement posted successfully',
            announcementId: result.rows[0].announcement_id 
        });
    } catch (error) {
        console.error('Error in postAnnouncement:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteAnnouncement = async (req, res) => {
    try {
        const { announcementId } = req.params;
        
        const professorResult = await pool.query(
            `SELECT professor_id FROM professors WHERE user_id = $1`,
            [req.user.user_id]
        );

        if (professorResult.rows.length === 0) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        const professorId = professorResult.rows[0].professor_id;
        
        const result = await pool.query(
            `DELETE FROM announcements 
             WHERE announcement_id = $1 AND professor_id = $2`,
            [announcementId, professorId]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Announcement not found' });
        }
        
        res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error('Error in deleteAnnouncement:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getProfile,
    getClasses,
    getClassStudents,
    getClassGrades,
    saveGrades,
    getAttendance,
    saveAttendance,
    getAttendanceHistory,
    getAnnouncements,
    postAnnouncement,
    deleteAnnouncement
};
const express = require('express');
const router = express.Router();
const { verifyJWT, professorOnly } = require('../middleware/auth');
const {
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
} = require('../controllers/professorController');

// All professor routes require authentication and professor role
router.use(verifyJWT);
router.use(professorOnly);

// Profile
router.get('/profile', getProfile);

// Classes
router.get('/classes', getClasses);
router.get('/classes/:classId/students', getClassStudents);

// Grades
router.get('/classes/:classId/grades', getClassGrades);
router.post('/grades', saveGrades);

// Attendance
router.get('/classes/:classId/attendance', getAttendance);
router.post('/attendance', saveAttendance);
router.get('/classes/:classId/attendance/history', getAttendanceHistory);

// Announcements
router.get('/classes/:classId/announcements', getAnnouncements);
router.post('/announcements', postAnnouncement);
router.delete('/announcements/:announcementId', deleteAnnouncement);

module.exports = router;
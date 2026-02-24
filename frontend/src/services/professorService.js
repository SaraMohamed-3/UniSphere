const API_URL = 'http://localhost:5050/api';

const getToken = () => localStorage.getItem('token');

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Request failed');
    }
    return response.json();
};

export const professorService = {
    // Profile
    getProfile: async () => {
        const response = await fetch(`${API_URL}/professor/profile`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        return handleResponse(response);
    },

    // Classes
    getClasses: async () => {
        const response = await fetch(`${API_URL}/professor/classes`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        return handleResponse(response);
    },

    // Students
    getClassStudents: async (classId) => {
        const response = await fetch(`${API_URL}/professor/classes/${classId}/students`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        return handleResponse(response);
    },

    // Grades
    getClassGrades: async (classId) => {
        const response = await fetch(`${API_URL}/professor/classes/${classId}/grades`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        return handleResponse(response);
    },

    saveGrades: async (classId, grades) => {
        const response = await fetch(`${API_URL}/professor/grades`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ classId, grades })
        });
        return handleResponse(response);
    },

    // Attendance
    getAttendance: async (classId, date) => {
        const url = date 
            ? `${API_URL}/professor/classes/${classId}/attendance?date=${date}`
            : `${API_URL}/professor/classes/${classId}/attendance`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        return handleResponse(response);
    },

    saveAttendance: async (classId, date, attendance) => {
        const response = await fetch(`${API_URL}/professor/attendance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ classId, date, attendance })
        });
        return handleResponse(response);
    },

    getAttendanceHistory: async (classId) => {
        const response = await fetch(`${API_URL}/professor/classes/${classId}/attendance/history`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        return handleResponse(response);
    },

    // Announcements
    getAnnouncements: async (classId) => {
        const response = await fetch(`${API_URL}/professor/classes/${classId}/announcements`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        return handleResponse(response);
    },

    postAnnouncement: async (classId, title, content, expiryDate) => {
        const response = await fetch(`${API_URL}/professor/announcements`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ classId, title, content, expiryDate })
        });
        return handleResponse(response);
    },

    deleteAnnouncement: async (announcementId) => {
        const response = await fetch(`${API_URL}/professor/announcements/${announcementId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        return handleResponse(response);
    }
};
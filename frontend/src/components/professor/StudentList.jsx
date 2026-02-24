import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const StudentList = () => {
    const { classId } = useParams();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Mock data for students
        setStudents([
            { 
                student_id: 1, 
                first_name: 'Ahmed', 
                last_name: 'Mohamed', 
                email: 'ahmed.mohamed@student.edu', 
                department: 'Computer Engineering',
                enrollment_date: '2023-09-01',
                attendance_rate: '95%',
                gpa: '3.75'
            },
            { 
                student_id: 2, 
                first_name: 'Fatma', 
                last_name: 'Ebrahim', 
                email: 'fatma.ebrahim@student.edu', 
                department: 'Computer Engineering',
                enrollment_date: '2023-09-01',
                attendance_rate: '88%',
                gpa: '3.42'
            },
            { 
                student_id: 3, 
                first_name: 'Omar', 
                last_name: 'Hassan', 
                email: 'omar.hassan@student.edu', 
                department: 'Computer Science',
                enrollment_date: '2023-09-01',
                attendance_rate: '92%',
                gpa: '3.60'
            },
            { 
                student_id: 4, 
                first_name: 'Nour', 
                last_name: 'Ali', 
                email: 'nour.ali@student.edu', 
                department: 'Computer Engineering',
                enrollment_date: '2023-09-01',
                attendance_rate: '78%',
                gpa: '3.15'
            },
            { 
                student_id: 5, 
                first_name: 'Youssef', 
                last_name: 'Ibrahim', 
                email: 'youssef.ibrahim@student.edu', 
                department: 'Computer Science',
                enrollment_date: '2023-09-01',
                attendance_rate: '96%',
                gpa: '3.85'
            }
        ]);
        setLoading(false);
    }, []);

    const filteredStudents = students.filter(student => 
        student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const styles = {
        container: {
            minHeight: '100vh',
            backgroundColor: '#f3f4f6',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        },
        header: {
            backgroundColor: 'white',
            borderBottom: '1px solid #e5e7eb',
            padding: '16px 24px'
        },
        headerContent: {
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        title: {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0
        },
        backButton: {
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        mainContent: {
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '32px 24px'
        },
        classHeader: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        },
        className: {
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: '0 0 8px 0'
        },
        classDetails: {
            display: 'flex',
            gap: '24px',
            color: '#6b7280',
            fontSize: '14px'
        },
        searchContainer: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        },
        searchInput: {
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none'
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '24px'
        },
        statCard: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        },
        statLabel: {
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '4px'
        },
        statValue: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1f2937'
        },
        tableContainer: {
            backgroundColor: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse'
        },
        th: {
            textAlign: 'left',
            padding: '16px',
            backgroundColor: '#f9fafb',
            color: '#6b7280',
            fontSize: '12px',
            fontWeight: '500',
            borderBottom: '1px solid #e5e7eb'
        },
        td: {
            padding: '16px',
            borderBottom: '1px solid #f3f4f6',
            color: '#1f2937',
            fontSize: '14px'
        },
        studentInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        },
        avatar: {
            width: '40px',
            height: '40px',
            backgroundColor: '#2563eb',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px'
        },
        studentName: {
            fontWeight: '500',
            color: '#1f2937'
        },
        studentEmail: {
            fontSize: '12px',
            color: '#6b7280'
        },
        badge: {
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500'
        },
        badgeSuccess: {
            backgroundColor: '#d1fae5',
            color: '#065f46'
        },
        badgeWarning: {
            backgroundColor: '#fed7aa',
            color: '#9a3412'
        },
        badgeInfo: {
            backgroundColor: '#dbeafe',
            color: '#1e40af'
        },
        actionButton: {
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            marginRight: '8px',
            padding: '4px 8px',
            borderRadius: '4px'
        },
        exportButtons: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '24px'
        },
        exportBtn: {
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#374151'
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading students...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerContent}>
                    <h1 style={styles.title}>Student Roster</h1>
                    <button 
                        style={styles.backButton}
                        onClick={() => navigate('/professor/dashboard')}
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={styles.mainContent}>
                {/* Class Info */}
                <div style={styles.classHeader}>
                    <h2 style={styles.className}>Digital Signal Processing (CS101)</h2>
                    <div style={styles.classDetails}>
                        <span>📍 Lab 301</span>
                        <span>⏰ Mon/Wed 10:00 AM - 12:00 PM</span>
                        <span>👥 {students.length} Students</span>
                    </div>
                </div>

                {/* Stats */}
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={styles.statLabel}>Total Students</div>
                        <div style={styles.statValue}>{students.length}</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statLabel}>Avg Attendance</div>
                        <div style={styles.statValue}>89.8%</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statLabel}>Avg GPA</div>
                        <div style={styles.statValue}>3.55</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statLabel}>Pass Rate</div>
                        <div style={styles.statValue}>92%</div>
                    </div>
                </div>

                {/* Search */}
                <div style={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Search students by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                </div>

                {/* Students Table */}
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Student</th>
                                <th style={styles.th}>Department</th>
                                <th style={styles.th}>Attendance</th>
                                <th style={styles.th}>GPA</th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(student => (
                                <tr key={student.student_id}>
                                    <td style={styles.td}>
                                        <div style={styles.studentInfo}>
                                            <div style={styles.avatar}>
                                                {student.first_name[0]}{student.last_name[0]}
                                            </div>
                                            <div>
                                                <div style={styles.studentName}>
                                                    {student.first_name} {student.last_name}
                                                </div>
                                                <div style={styles.studentEmail}>
                                                    {student.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{...styles.badge, ...styles.badgeInfo}}>
                                            {student.department}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.badge,
                                            ...(parseInt(student.attendance_rate) >= 90 ? styles.badgeSuccess : styles.badgeWarning)
                                        }}>
                                            {student.attendance_rate}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.badge,
                                            ...(parseFloat(student.gpa) >= 3.5 ? styles.badgeSuccess : styles.badgeWarning)
                                        }}>
                                            {student.gpa}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <button style={styles.actionButton} title="Send Email">📧</button>
                                        <button style={styles.actionButton} title="View Details">👤</button>
                                        <button style={styles.actionButton} title="Grade History">📊</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Export Buttons */}
                <div style={styles.exportButtons}>
                    <button style={styles.exportBtn}>
                        ⬇️ Export as CSV
                    </button>
                    <button style={styles.exportBtn}>
                        🖨️ Print Roster
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentList;
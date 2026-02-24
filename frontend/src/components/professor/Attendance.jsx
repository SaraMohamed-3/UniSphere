import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Attendance = () => {
    const { classId } = useParams();
    const navigate = useNavigate();
    const [view, setView] = useState('take'); // 'take' or 'history'
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendance, setAttendance] = useState([
        { id: 1, name: 'Ahmed Mohamed', status: 'present', notes: '' },
        { id: 2, name: 'Fatma Ebrahim', status: 'present', notes: '' },
        { id: 3, name: 'Omar Hassan', status: 'late', notes: 'Traffic' },
        { id: 4, name: 'Nour Ali', status: 'present', notes: '' },
        { id: 5, name: 'Youssef Ibrahim', status: 'absent', notes: 'Sick' }
    ]);

    const [history] = useState([
        { date: '2024-02-20', present: 22, absent: 3, late: 2, excused: 1, total: 28 },
        { date: '2024-02-19', present: 20, absent: 5, late: 2, excused: 1, total: 28 },
        { date: '2024-02-18', present: 25, absent: 2, late: 1, excused: 0, total: 28 },
        { date: '2024-02-15', present: 24, absent: 3, late: 1, excused: 0, total: 28 },
        { date: '2024-02-14', present: 26, absent: 1, late: 1, excused: 0, total: 28 }
    ]);

    const handleStatusChange = (id, status) => {
        setAttendance(attendance.map(s => 
            s.id === id ? { ...s, status } : s
        ));
    };

    const handleNotesChange = (id, notes) => {
        setAttendance(attendance.map(s => 
            s.id === id ? { ...s, notes } : s
        ));
    };

    const markAllPresent = () => {
        setAttendance(attendance.map(s => ({ ...s, status: 'present', notes: '' })));
    };

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
        tabContainer: {
            display: 'flex',
            gap: '16px',
            marginBottom: '24px'
        },
        tab: {
            padding: '10px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            border: 'none',
            backgroundColor: 'white'
        },
        activeTab: {
            backgroundColor: '#2563eb',
            color: 'white'
        },
        inactiveTab: {
            backgroundColor: 'white',
            color: '#6b7280',
            border: '1px solid #e5e7eb'
        },
        controlsCard: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        },
        datePicker: {
            padding: '10px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px'
        },
        markAllBtn: {
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            marginLeft: '16px'
        },
        saveBtn: {
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
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
        studentName: {
            fontWeight: '500',
            color: '#1f2937'
        },
        statusSelect: {
            padding: '8px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '14px',
            width: '120px'
        },
        notesInput: {
            padding: '8px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '14px',
            width: '200px'
        },
        statusBadge: (status) => ({
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: 
                status === 'present' ? '#d1fae5' :
                status === 'absent' ? '#fee2e2' :
                status === 'late' ? '#fed7aa' : '#dbeafe',
            color: 
                status === 'present' ? '#065f46' :
                status === 'absent' ? '#991b1b' :
                status === 'late' ? '#9a3412' : '#1e40af'
        }),
        historyGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px'
        },
        historyCard: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            cursor: 'pointer'
        },
        historyDate: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '12px'
        },
        historyStats: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px'
        },
        statRow: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '14px',
            marginBottom: '4px'
        }
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerContent}>
                    <h1 style={styles.title}>Attendance Tracking</h1>
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
                        <span>👥 {attendance.length} Students</span>
                    </div>
                </div>

                {/* Tabs */}
                <div style={styles.tabContainer}>
                    <button 
                        style={{...styles.tab, ...(view === 'take' ? styles.activeTab : styles.inactiveTab)}}
                        onClick={() => setView('take')}
                    >
                        Take Attendance
                    </button>
                    <button 
                        style={{...styles.tab, ...(view === 'history' ? styles.activeTab : styles.inactiveTab)}}
                        onClick={() => setView('history')}
                    >
                        View History
                    </button>
                </div>

                {view === 'take' ? (
                    <>
                        {/* Controls */}
                        <div style={styles.controlsCard}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        style={styles.datePicker}
                                    />
                                    <button 
                                        style={styles.markAllBtn}
                                        onClick={markAllPresent}
                                    >
                                        ✓ Mark All Present
                                    </button>
                                </div>
                                <button style={styles.saveBtn}>
                                    💾 Save Attendance
                                </button>
                            </div>
                        </div>

                        {/* Attendance Table */}
                        <div style={styles.tableContainer}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Student</th>
                                        <th style={styles.th}>Status</th>
                                        <th style={styles.th}>Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendance.map(student => (
                                        <tr key={student.id}>
                                            <td style={styles.td}>
                                                <span style={styles.studentName}>{student.name}</span>
                                            </td>
                                            <td style={styles.td}>
                                                <select
                                                    value={student.status}
                                                    onChange={(e) => handleStatusChange(student.id, e.target.value)}
                                                    style={styles.statusSelect}
                                                >
                                                    <option value="present">Present</option>
                                                    <option value="absent">Absent</option>
                                                    <option value="late">Late</option>
                                                    <option value="excused">Excused</option>
                                                </select>
                                            </td>
                                            <td style={styles.td}>
                                                <input
                                                    type="text"
                                                    value={student.notes}
                                                    onChange={(e) => handleNotesChange(student.id, e.target.value)}
                                                    placeholder="Add notes..."
                                                    style={styles.notesInput}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    // History View
                    <div style={styles.historyGrid}>
                        {history.map((day, index) => (
                            <div key={index} style={styles.historyCard}>
                                <div style={styles.historyDate}>
                                    {new Date(day.date).toLocaleDateString('en-US', { 
                                        weekday: 'long', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </div>
                                <div style={styles.historyStats}>
                                    <div>
                                        <div style={styles.statRow}>
                                            <span>✅ Present:</span>
                                            <span style={{ fontWeight: '600' }}>{day.present}</span>
                                        </div>
                                        <div style={styles.statRow}>
                                            <span>❌ Absent:</span>
                                            <span style={{ fontWeight: '600' }}>{day.absent}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={styles.statRow}>
                                            <span>⏰ Late:</span>
                                            <span style={{ fontWeight: '600' }}>{day.late}</span>
                                        </div>
                                        <div style={styles.statRow}>
                                            <span>📝 Excused:</span>
                                            <span style={{ fontWeight: '600' }}>{day.excused}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '12px', textAlign: 'right', color: '#2563eb', fontSize: '13px' }}>
                                    Total: {day.total} students
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Attendance;
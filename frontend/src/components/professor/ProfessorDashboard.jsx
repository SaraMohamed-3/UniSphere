import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfessorDashboard = () => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        // Mock data for classes
        setClasses([
            { 
                class_id: 1, 
                name: 'Digital Signal Processing', 
                code: 'CS101', 
                time: '10:00 AM', 
                room: 'Lab 301', 
                students: 28, 
                day: 'TODAY',
                schedule: '10:00 AM - 12:00 PM'
            },
            { 
                class_id: 2, 
                name: 'Control Systems', 
                code: 'CS201', 
                time: '2:00 PM', 
                room: 'Hall B-325', 
                students: 32, 
                day: 'TODAY',
                schedule: '2:00 PM - 4:00 PM'
            },
            { 
                class_id: 3, 
                name: 'Power Electronics', 
                code: 'CS301', 
                time: '11:00 AM', 
                room: 'Lab 402', 
                students: 24, 
                day: 'TOM',
                schedule: '11:00 AM - 1:00 PM'
            }
        ]);
    }, []);

    const handleNavigation = (path, classId) => {
        // If no class selected, use the first class
        const targetClassId = classId || (classes.length > 0 ? classes[0].class_id : 1);
        
        // Navigate to the appropriate route
        switch(path) {
            case 'attendance':
                navigate(`/professor/classes/${targetClassId}/attendance`);
                break;
            case 'grades':
                navigate(`/professor/classes/${targetClassId}/grades`);
                break;
            case 'announcements':
                navigate(`/professor/classes/${targetClassId}/announcements`);
                break;
            case 'students':
                navigate(`/professor/classes/${targetClassId}/students`);
                break;
            case 'dashboard':
                navigate('/professor/dashboard');
                break;
            default:
                navigate(`/professor/classes/${targetClassId}/${path}`);
        }
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
        mainContent: {
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '32px 24px'
        },
        welcomeSection: {
            marginBottom: '32px'
        },
        welcomeTitle: {
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: '0 0 8px 0'
        },
        welcomeSubtitle: {
            color: '#6b7280',
            margin: 0,
            fontSize: '16px'
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px',
            marginBottom: '32px'
        },
        statCard: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s'
        },
        statIcon: {
            width: '48px',
            height: '48px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '16px',
            fontSize: '24px'
        },
        statValue: {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: '0 0 4px 0'
        },
        statLabel: {
            color: '#6b7280',
            margin: 0,
            fontSize: '14px'
        },
        quickActionsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '32px'
        },
        quickActionBtn: {
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            color: 'white',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'opacity 0.2s, transform 0.2s',
            width: '100%'
        },
        twoColumnGrid: {
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '24px'
        },
        scheduleCard: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        },
        scheduleItem: {
            display: 'flex',
            alignItems: 'flex-start',
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            marginBottom: '12px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
        },
        timeBox: {
            width: '64px',
            height: '64px',
            backgroundColor: '#dbeafe',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '16px'
        },
        timeDay: {
            fontSize: '12px',
            fontWeight: '500',
            color: '#2563eb'
        },
        timeHour: {
            fontSize: '11px',
            color: '#6b7280'
        },
        courseInfo: {
            flex: 1
        },
        courseName: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 4px 0'
        },
        courseCode: {
            fontSize: '14px',
            color: '#6b7280',
            margin: '0 0 8px 0'
        },
        courseDetails: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '14px',
            color: '#6b7280'
        },
        studentCount: {
            marginLeft: 'auto',
            color: '#2563eb',
            fontWeight: '500'
        },
        announcementsCard: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        },
        announcementItem: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '16px 0',
            borderBottom: '1px solid #f3f4f6',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
        },
        announcementIcon: {
            width: '40px',
            height: '40px',
            backgroundColor: '#dbeafe',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
        },
        announcementTitle: {
            fontSize: '14px',
            fontWeight: '500',
            color: '#1f2937',
            margin: '0 0 4px 0'
        },
        announcementTime: {
            fontSize: '12px',
            color: '#9ca3af',
            margin: 0
        },
        newBadge: {
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '500'
        },
        viewAllBtn: {
            color: '#2563eb',
            fontSize: '14px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '6px'
        }
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerContent}>
                    <h1 style={styles.title}>Professor Dashboard</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ position: 'relative', cursor: 'pointer' }}>
                            <span style={{ fontSize: '20px' }}>🔔</span>
                            <span style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#ef4444', color: 'white', borderRadius: '10px', padding: '2px 6px', fontSize: '10px' }}>3</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                            <div style={{ width: '40px', height: '40px', backgroundColor: '#2563eb', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>P</div>
                            <div>
                                <div style={{ fontWeight: '500', fontSize: '14px' }}>Prof. Ahmed Ali</div>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>CS Department</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={styles.mainContent}>
                {/* Welcome */}
                <div style={styles.welcomeSection}>
                    <h2 style={styles.welcomeTitle}>Welcome back, Prof. Ahmed Ali</h2>
                    <p style={styles.welcomeSubtitle}>Here's your academic overview</p>
                </div>

                {/* Stats Cards - All clickable */}
                <div style={styles.statsGrid}>
                    {[
                        { icon: '👥', label: 'Total Students', value: '84', color: '#2563eb', path: 'students' },
                        { icon: '📚', label: 'Active Courses', value: '6', color: '#16a34a', path: 'dashboard' },
                        { icon: '⏰', label: 'Hours This Week', value: '18', color: '#9333ea', path: 'attendance' },
                        { icon: '✅', label: 'Attendance Rate', value: '92%', color: '#ca8a04', path: 'attendance' }
                    ].map((stat, i) => (
                        <div 
                            key={i} 
                            style={styles.statCard}
                            onClick={() => handleNavigation(stat.path)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                            }}
                        >
                            <div style={{ ...styles.statIcon, backgroundColor: stat.color, color: 'white' }}>
                                {stat.icon}
                            </div>
                            <div>
                                <div style={styles.statValue}>{stat.value}</div>
                                <div style={styles.statLabel}>{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions - All clickable */}
                <div style={styles.quickActionsGrid}>
                    {[
                        { icon: '📋', label: 'Take Attendance', color: '#2563eb', path: 'attendance' },
                        { icon: '📊', label: 'Enter Grades', color: '#16a34a', path: 'grades' },
                        { icon: '📢', label: 'Post Announcement', color: '#9333ea', path: 'announcements' },
                        { icon: '👥', label: 'View Roster', color: '#ea580c', path: 'students' }
                    ].map((action, i) => (
                        <button
                            key={i}
                            style={{ ...styles.quickActionBtn, backgroundColor: action.color }}
                            onClick={() => handleNavigation(action.path)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = '0.9';
                                e.currentTarget.style.transform = 'scale(1.02)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '1';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            <span style={{ fontSize: '20px' }}>{action.icon}</span>
                            <span>{action.label}</span>
                        </button>
                    ))}
                </div>

                {/* Two Column Layout */}
                <div style={styles.twoColumnGrid}>
                    {/* Left Column - Schedule */}
                    <div>
                        <div style={styles.scheduleCard}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 20px 0' }}>My Schedule</h3>
                            {classes.map((cls, i) => (
                                <div 
                                    key={i} 
                                    style={styles.scheduleItem}
                                    onClick={() => handleNavigation('students', cls.class_id)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f9fafb';
                                    }}
                                >
                                    <div style={styles.timeBox}>
                                        <div style={styles.timeDay}>{cls.day}</div>
                                        <div style={styles.timeHour}>{cls.time}</div>
                                    </div>
                                    <div style={styles.courseInfo}>
                                        <h4 style={styles.courseName}>{cls.name}</h4>
                                        <p style={styles.courseCode}>{cls.code}</p>
                                        <div style={styles.courseDetails}>
                                            <span>⏰ {cls.schedule}</span>
                                            <span>📍 {cls.room}</span>
                                            <span style={styles.studentCount}>{cls.students} students</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Announcements */}
                    <div>
                        <div style={styles.announcementsCard}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Recent Announcements</h3>
                                <button 
                                    style={styles.viewAllBtn}
                                    onClick={() => handleNavigation('announcements')}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#eff6ff';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    View All →
                                </button>
                            </div>
                            {[
                                { title: 'Mid-term Exam Schedule Released', time: '2 hours ago', new: true },
                                { title: 'Guest Lecture on AI in Engineering', time: '1 day ago' },
                                { title: 'Project Submission Guidelines Updated', time: '2 days ago' }
                            ].map((ann, i) => (
                                <div 
                                    key={i} 
                                    style={styles.announcementItem}
                                    onClick={() => handleNavigation('announcements')}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f9fafb';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <div style={styles.announcementIcon}>📢</div>
                                    <div style={{ flex: 1 }}>
                                        <p style={styles.announcementTitle}>{ann.title}</p>
                                        <p style={styles.announcementTime}>{ann.time}</p>
                                    </div>
                                    {ann.new && <span style={styles.newBadge}>New</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfessorDashboard;
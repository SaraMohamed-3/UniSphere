import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Announcements = () => {
    const { classId } = useParams();
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [announcements, setAnnouncements] = useState([
        {
            id: 1,
            title: 'Mid-term Exam Schedule Released',
            content: 'The mid-term exams will be held from March 15-20. Please check the detailed schedule attached.',
            date: '2024-02-23',
            time: '2 hours ago',
            author: 'Dr. Ahmed Ali',
            important: true
        },
        {
            id: 2,
            title: 'Guest Lecture on AI in Engineering',
            content: 'Prof. Sarah Johnson from MIT will give a guest lecture on "AI Applications in Modern Engineering" on March 5th.',
            date: '2024-02-22',
            time: '1 day ago',
            author: 'Dr. Ahmed Ali'
        },
        {
            id: 3,
            title: 'Project Submission Guidelines Updated',
            content: 'The final project submission guidelines have been updated. Please check the new requirements.',
            date: '2024-02-21',
            time: '2 days ago',
            author: 'Dr. Ahmed Ali'
        },
        {
            id: 4,
            title: 'Lab Schedule Change',
            content: 'This week\'s lab will be held on Thursday instead of Wednesday due to maintenance.',
            date: '2024-02-20',
            time: '3 days ago',
            author: 'Dr. Ahmed Ali'
        }
    ]);

    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        content: ''
    });

    const handleCreateAnnouncement = () => {
        if (!newAnnouncement.title || !newAnnouncement.content) return;
        
        const announcement = {
            id: announcements.length + 1,
            ...newAnnouncement,
            date: new Date().toISOString().split('T')[0],
            time: 'Just now',
            author: 'Dr. Ahmed Ali',
            important: true
        };
        
        setAnnouncements([announcement, ...announcements]);
        setNewAnnouncement({ title: '', content: '' });
        setShowForm(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            setAnnouncements(announcements.filter(a => a.id !== id));
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
        newButton: {
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '24px'
        },
        formCard: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        },
        formTitle: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '20px'
        },
        input: {
            width: '100%',
            padding: '12px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '16px',
            outline: 'none'
        },
        textarea: {
            width: '100%',
            padding: '12px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '16px',
            minHeight: '120px',
            outline: 'none',
            resize: 'vertical'
        },
        formButtons: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
        },
        cancelButton: {
            backgroundColor: '#9ca3af',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
        },
        postButton: {
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
        },
        announcementsList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        },
        announcementCard: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            position: 'relative'
        },
        importantBadge: {
            position: 'absolute',
            top: '24px',
            right: '24px',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500'
        },
        announcementTitle: {
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '8px',
            paddingRight: '100px'
        },
        announcementMeta: {
            display: 'flex',
            gap: '16px',
            color: '#6b7280',
            fontSize: '13px',
            marginBottom: '16px'
        },
        announcementContent: {
            color: '#4b5563',
            fontSize: '15px',
            lineHeight: '1.6',
            marginBottom: '20px'
        },
        announcementFooter: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #f3f4f6',
            paddingTop: '16px'
        },
        announcementStats: {
            display: 'flex',
            gap: '16px',
            color: '#6b7280',
            fontSize: '13px'
        },
        deleteButton: {
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '6px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        }
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerContent}>
                    <h1 style={styles.title}>Announcements</h1>
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
                        <span>⏰ Spring 2024</span>
                        <span>📢 {announcements.length} Announcements</span>
                    </div>
                </div>

                {/* New Announcement Button */}
                <button 
                    style={styles.newButton}
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? '✕ Cancel' : '+ New Announcement'}
                </button>

                {/* New Announcement Form */}
                {showForm && (
                    <div style={styles.formCard}>
                        <h3 style={styles.formTitle}>Create New Announcement</h3>
                        <input
                            type="text"
                            placeholder="Announcement Title"
                            value={newAnnouncement.title}
                            onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                            style={styles.input}
                        />
                        <textarea
                            placeholder="Announcement Content"
                            value={newAnnouncement.content}
                            onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                            style={styles.textarea}
                        />
                        <div style={styles.formButtons}>
                            <button 
                                style={styles.cancelButton}
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                style={styles.postButton}
                                onClick={handleCreateAnnouncement}
                            >
                                Post Announcement
                            </button>
                        </div>
                    </div>
                )}

                {/* Announcements List */}
                <div style={styles.announcementsList}>
                    {announcements.map(announcement => (
                        <div key={announcement.id} style={styles.announcementCard}>
                            {announcement.important && (
                                <span style={styles.importantBadge}>Important</span>
                            )}
                            <h3 style={styles.announcementTitle}>{announcement.title}</h3>
                            <div style={styles.announcementMeta}>
                                <span>👤 {announcement.author}</span>
                                <span>📅 {announcement.time}</span>
                            </div>
                            <p style={styles.announcementContent}>{announcement.content}</p>
                            <div style={styles.announcementFooter}>
                                <div style={styles.announcementStats}>
                                    <span>👁️ 24 views</span>
                                    <span>💬 3 comments</span>
                                </div>
                                <button 
                                    style={styles.deleteButton}
                                    onClick={() => handleDelete(announcement.id)}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Announcements;
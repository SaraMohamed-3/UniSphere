import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { professorService } from '../../services/professorService';

const ProfessorDashboard = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
        fetchClasses();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await professorService.getProfile();
            setProfile(data);
        } catch (err) {
            console.log('Using local user data');
        }
    };

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const data = await professorService.getClasses();
            setClasses(data);
        } catch (err) {
            setError(err.message);
            // Mock data
            setClasses([
                {
                    class_id: 1,
                    course_code: 'CS101',
                    course_name: 'Digital Signal Processing',
                    schedule: '10:00 AM - 12:00 PM',
                    room: 'Lab 301',
                    student_count: 28,
                    day: 'Today'
                },
                {
                    class_id: 2,
                    course_code: 'CS201',
                    course_name: 'Control Systems',
                    schedule: '2:00 PM - 4:00 PM',
                    room: 'Hall B-325',
                    student_count: 32,
                    day: 'Today'
                },
                {
                    class_id: 3,
                    course_code: 'CS301',
                    course_name: 'Power Electronics',
                    schedule: '11:00 AM - 1:00 PM',
                    room: 'Lab 402',
                    student_count: 24,
                    day: 'Tomorrow'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { 
            label: 'Total Students', 
            value: classes.reduce((acc, c) => acc + (c.student_count || 0), 0) || 84,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            color: 'bg-blue-500'
        },
        { 
            label: 'Active Courses', 
            value: classes.length || 6,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
            color: 'bg-green-500'
        },
        { 
            label: 'Hours This Week', 
            value: '18',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'bg-purple-500'
        },
        { 
            label: 'Attendance Rate', 
            value: '92%',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'bg-yellow-500'
        }
    ];

    const quickActions = [
        { label: 'Take Attendance', icon: '📋', path: 'attendance', color: 'bg-blue-600' },
        { label: 'Enter Grades', icon: '📊', path: 'grades', color: 'bg-green-600' },
        { label: 'Post Announcement', icon: '📢', path: 'announcements', color: 'bg-purple-600' },
        { label: 'View Roster', icon: '👥', path: 'students', color: 'bg-orange-600' }
    ];

    const announcements = [
        { title: 'Mid-term Exam Schedule Released', time: '2 hours ago', important: true },
        { title: 'Guest Lecture on AI in Engineering', time: '1 day ago' },
        { title: 'Project Submission Guidelines Updated', time: '2 days ago' }
    ];

    const courseProgress = [
        { name: 'Digital Signal Processing', progress: 70, color: 'bg-blue-600' },
        { name: 'Control Systems', progress: 60, color: 'bg-green-600' },
        { name: 'Power Electronics', progress: 80, color: 'bg-purple-600' }
    ];

    const deadlines = [
        { task: 'Grade Submission Deadline', course: 'All Courses', days: '2 days', urgent: true },
        { task: 'Lab Report Review', course: 'Digital Signal Processing', days: '3 days' },
        { task: 'Project Proposals', course: 'Control Systems', days: '1 week' }
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-800">Professor Dashboard</h1>
                        <div className="flex items-center space-x-4">
                            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white text-center">3</span>
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                    {profile?.first_name?.[0] || 'P'}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Prof. {profile?.first_name || 'Ahmed'} {profile?.last_name || 'Ali'}</p>
                                    <p className="text-xs text-gray-500">Computer Science Department</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Welcome back, Prof. {profile?.first_name || 'Ahmed'} {profile?.last_name || 'Ali'}</h2>
                    <p className="text-gray-600 mt-1">Here's your academic overview</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm p-6 flex items-center">
                            <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-white`}>
                                {stat.icon}
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                <p className="text-sm text-gray-500">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => navigate(`/professor/classes/1/${action.path}`)}
                                className={`${action.color} text-white rounded-xl p-4 flex items-center justify-center space-x-3 hover:opacity-90 transition-opacity`}
                            >
                                <span className="text-2xl">{action.icon}</span>
                                <span className="font-medium">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Schedule */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Today's Schedule */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">My Schedule</h3>
                            <div className="space-y-4">
                                {classes.map((cls, index) => (
                                    <div key={cls.class_id} className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-lg flex flex-col items-center justify-center">
                                            <span className="text-sm font-medium text-blue-600">{cls.day === 'Today' ? 'TODAY' : 'TOM'}</span>
                                            <span className="text-xs text-gray-500">{cls.schedule.split(' ')[0]}</span>
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <h4 className="font-semibold text-gray-800">{cls.course_name}</h4>
                                            <p className="text-sm text-gray-500 mt-1">{cls.course_code}</p>
                                            <div className="flex items-center mt-2 text-sm text-gray-500">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>{cls.schedule}</span>
                                                <svg className="w-4 h-4 ml-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span>{cls.room}</span>
                                                <span className="ml-auto text-sm font-medium text-blue-600">{cls.student_count} students</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Course Progress */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Course Progress</h3>
                            <div className="space-y-4">
                                {courseProgress.map((course, index) => (
                                    <div key={index}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">{course.name}</span>
                                            <span className="font-medium text-gray-800">{course.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className={`${course.color} h-2 rounded-full`} style={{ width: `${course.progress}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Announcements & Deadlines */}
                    <div className="space-y-6">
                        {/* Recent Announcements */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-700">Recent Announcements</h3>
                                <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
                            </div>
                            <div className="space-y-4">
                                {announcements.map((announcement, index) => (
                                    <div key={index} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-blue-600 text-xl">📢</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-800">{announcement.title}</p>
                                            <p className="text-xs text-gray-500 mt-1">{announcement.time}</p>
                                        </div>
                                        {announcement.important && (
                                            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">New</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Upcoming Deadlines */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Upcoming Deadlines</h3>
                            <div className="space-y-4">
                                {deadlines.map((deadline, index) => (
                                    <div key={index} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{deadline.task}</p>
                                            <p className="text-xs text-gray-500 mt-1">{deadline.course}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-sm font-medium ${deadline.urgent ? 'text-red-600' : 'text-gray-600'}`}>
                                                {deadline.days}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Office Hours Card */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-6 text-white">
                            <h3 className="text-lg font-semibold mb-2">Office Hours</h3>
                            <p className="text-blue-100 text-sm mb-3">Today • 2:00 PM - 4:00 PM</p>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <span className="text-sm">3 appointments booked</span>
                            </div>
                            <button className="mt-4 w-full bg-white text-blue-600 py-2 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors">
                                Schedule Meeting
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfessorDashboard;
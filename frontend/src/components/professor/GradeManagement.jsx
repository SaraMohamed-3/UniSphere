import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const GradeManagement = () => {
    const { classId } = useParams();
    const navigate = useNavigate();
    const [grades, setGrades] = useState([
        { id: 1, name: 'Ahmed Mohamed', assignments: 85, midterm: 78, final: 92, project: 88 },
        { id: 2, name: 'Fatma Ebrahim', assignments: 92, midterm: 88, final: 85, project: 90 },
        { id: 3, name: 'Omar Hassan', assignments: 78, midterm: 82, final: 88, project: 85 },
        { id: 4, name: 'Nour Ali', assignments: 95, midterm: 90, final: 94, project: 92 },
        { id: 5, name: 'Youssef Ibrahim', assignments: 88, midterm: 84, final: 86, project: 89 }
    ]);

    const calculateAverage = (student) => {
        const total = (student.assignments * 0.2) + (student.midterm * 0.3) + 
                     (student.final * 0.3) + (student.project * 0.2);
        return total.toFixed(1);
    };

    const handleGradeChange = (id, field, value) => {
        setGrades(grades.map(g => 
            g.id === id ? { ...g, [field]: parseInt(value) || 0 } : g
        ));
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
        gradeSummary: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '24px'
        },
        summaryCard: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        },
        summaryLabel: {
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '4px'
        },
        summaryValue: {
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
        studentName: {
            fontWeight: '500',
            color: '#1f2937'
        },
        input: {
            width: '70px',
            padding: '8px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '14px',
            textAlign: 'center'
        },
        gradeCell: {
            backgroundColor: '#f9fafb',
            fontWeight: '600',
            color: '#2563eb'
        },
        saveButton: {
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            marginTop: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginLeft: 'auto'
        },
        weightInfo: {
            backgroundColor: '#f9fafb',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
            color: '#6b7280',
            display: 'flex',
            gap: '24px'
        },
        weightItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        weightDot: {
            width: '10px',
            height: '10px',
            borderRadius: '10px',
            backgroundColor: '#2563eb'
        }
    };

    // Calculate class averages
    const classAvg = (grades.reduce((acc, g) => acc + parseFloat(calculateAverage(g)), 0) / grades.length).toFixed(1);
    const highestGrade = Math.max(...grades.map(g => parseFloat(calculateAverage(g)))).toFixed(1);
    const lowestGrade = Math.min(...grades.map(g => parseFloat(calculateAverage(g)))).toFixed(1);
    const passingCount = grades.filter(g => parseFloat(calculateAverage(g)) >= 60).length;

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerContent}>
                    <h1 style={styles.title}>Grade Management</h1>
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
                        <span>👥 {grades.length} Students</span>
                    </div>
                </div>

                {/* Grade Summary */}
                <div style={styles.gradeSummary}>
                    <div style={styles.summaryCard}>
                        <div style={styles.summaryLabel}>Class Average</div>
                        <div style={styles.summaryValue}>{classAvg}%</div>
                    </div>
                    <div style={styles.summaryCard}>
                        <div style={styles.summaryLabel}>Highest Grade</div>
                        <div style={styles.summaryValue}>{highestGrade}%</div>
                    </div>
                    <div style={styles.summaryCard}>
                        <div style={styles.summaryLabel}>Lowest Grade</div>
                        <div style={styles.summaryValue}>{lowestGrade}%</div>
                    </div>
                    <div style={styles.summaryCard}>
                        <div style={styles.summaryLabel}>Passing Students</div>
                        <div style={styles.summaryValue}>{passingCount}/{grades.length}</div>
                    </div>
                </div>

                {/* Weight Information */}
                <div style={styles.weightInfo}>
                    <div style={styles.weightItem}>
                        <span style={{...styles.weightDot, backgroundColor: '#2563eb'}}></span>
                        <span>Assignments: 20%</span>
                    </div>
                    <div style={styles.weightItem}>
                        <span style={{...styles.weightDot, backgroundColor: '#16a34a'}}></span>
                        <span>Midterm: 30%</span>
                    </div>
                    <div style={styles.weightItem}>
                        <span style={{...styles.weightDot, backgroundColor: '#9333ea'}}></span>
                        <span>Final: 30%</span>
                    </div>
                    <div style={styles.weightItem}>
                        <span style={{...styles.weightDot, backgroundColor: '#ea580c'}}></span>
                        <span>Project: 20%</span>
                    </div>
                </div>

                {/* Grades Table */}
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Student</th>
                                <th style={styles.th}>Assignments (20%)</th>
                                <th style={styles.th}>Midterm (30%)</th>
                                <th style={styles.th}>Final (30%)</th>
                                <th style={styles.th}>Project (20%)</th>
                                <th style={styles.th}>Final Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grades.map(student => (
                                <tr key={student.id}>
                                    <td style={styles.td}>
                                        <span style={styles.studentName}>{student.name}</span>
                                    </td>
                                    <td style={styles.td}>
                                        <input
                                            type="number"
                                            value={student.assignments}
                                            onChange={(e) => handleGradeChange(student.id, 'assignments', e.target.value)}
                                            style={styles.input}
                                            min="0"
                                            max="100"
                                        />
                                    </td>
                                    <td style={styles.td}>
                                        <input
                                            type="number"
                                            value={student.midterm}
                                            onChange={(e) => handleGradeChange(student.id, 'midterm', e.target.value)}
                                            style={styles.input}
                                            min="0"
                                            max="100"
                                        />
                                    </td>
                                    <td style={styles.td}>
                                        <input
                                            type="number"
                                            value={student.final}
                                            onChange={(e) => handleGradeChange(student.id, 'final', e.target.value)}
                                            style={styles.input}
                                            min="0"
                                            max="100"
                                        />
                                    </td>
                                    <td style={styles.td}>
                                        <input
                                            type="number"
                                            value={student.project}
                                            onChange={(e) => handleGradeChange(student.id, 'project', e.target.value)}
                                            style={styles.input}
                                            min="0"
                                            max="100"
                                        />
                                    </td>
                                    <td style={{...styles.td, ...styles.gradeCell}}>
                                        {calculateAverage(student)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Save Button */}
                <button style={styles.saveButton}>
                    💾 Save All Grades
                </button>
            </div>
        </div>
    );
};

export default GradeManagement;
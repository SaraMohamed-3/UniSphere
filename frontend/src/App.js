import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfessorDashboard from './components/professor/ProfessorDashboard';
import StudentList from './components/professor/StudentList';
import GradeManagement from './components/professor/GradeManagement';
import Attendance from './components/professor/Attendance';
import Announcements from './components/professor/Announcements';


// Temporary login component for testing
const TestLogin = () => {
    const handleLogin = () => {
        const mockUser = {
            user_id: 1,
            email: 'professor@test.com',
            role: 'professor',
            first_name: 'John',
            last_name: 'Smith'
        };
        localStorage.setItem('token', 'mock-token-123');
        localStorage.setItem('user', JSON.stringify(mockUser));
        window.location.href = '/professor/dashboard';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6 text-center">UniSphere</h1>
                <p className="text-gray-600 mb-6 text-center">Professor Test Login</p>
                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    Login as Professor
                </button>
            </div>
        </div>
    );
};


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />
                        <Route path="/" element={<TestLogin />} />
                <Route path="/professor/dashboard" element={<ProfessorDashboard />} />
                <Route path="/professor/classes/:classId/students" element={<StudentList />} />
                <Route path="/professor/classes/:classId/grades" element={<GradeManagement />} />
                <Route path="/professor/classes/:classId/attendance" element={<Attendance />} />
                <Route path="/professor/classes/:classId/announcements" element={<Announcements />} />

      </Routes>
    </Router>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import StudentDashboard from './pages/student/Dashboard';
import SubmitTopic from './pages/student/SubmitTopic';
import TopicSuggestions from './pages/student/TopicSuggestions';
import MyTopics from './pages/student/MyTopics';

import SupervisorDashboard from './pages/supervisor/Dashboard';
import ReviewTopics from './pages/supervisor/ReviewTopics';

import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import AllTopics from './pages/admin/AllTopics';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'student') return <Navigate to="/student/dashboard" />;
  if (user.role === 'supervisor') return <Navigate to="/supervisor/dashboard" />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
  return <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/student/dashboard" element={<PrivateRoute roles={['student']}><StudentDashboard /></PrivateRoute>} />
          <Route path="/student/submit-topic" element={<PrivateRoute roles={['student']}><SubmitTopic /></PrivateRoute>} />
          <Route path="/student/suggestions" element={<PrivateRoute roles={['student']}><TopicSuggestions /></PrivateRoute>} />
          <Route path="/student/my-topics" element={<PrivateRoute roles={['student']}><MyTopics /></PrivateRoute>} />

          <Route path="/supervisor/dashboard" element={<PrivateRoute roles={['supervisor']}><SupervisorDashboard /></PrivateRoute>} />
          <Route path="/supervisor/review-topics" element={<PrivateRoute roles={['supervisor']}><ReviewTopics /></PrivateRoute>} />

          <Route path="/admin/dashboard" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute roles={['admin']}><ManageUsers /></PrivateRoute>} />
          <Route path="/admin/topics" element={<PrivateRoute roles={['admin']}><AllTopics /></PrivateRoute>} />
        </Routes>
      </Router>
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';
import Dashboard from './pages/Dashboard';
import Banners from './pages/Banners';
import Layout from './components/Layout';
import Students from './pages/Students';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import Inquiries from './pages/Inquiries';
import Courses from './pages/Courses';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />

        {/* Protected Routes */}
        <Route path="/" element={
            <ProtectedRoute>
                <Layout />
            </ProtectedRoute>
        }>
            <Route index element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="banners" element={<Banners />} />
            <Route path="courses" element={<Courses />} />
            <Route path="inquiries" element={<Inquiries />} />
            <Route path="settings" element={<Settings />} />
            {/* Add more routes here as we migrate */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

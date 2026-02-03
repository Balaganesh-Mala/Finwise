import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';
import ManageTests from './pages/ManageTests';
import Dashboard from './pages/Dashboard';
import Banners from './pages/Banners';
import Layout from './components/Layout';
import Students from './pages/Students';
import AddStudent from './pages/AddStudent';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import Inquiries from './pages/Inquiries';
import Jobs from './pages/Jobs';
import Applications from './pages/Applications';
import Courses from './pages/Courses';
import ManageCourseModules from './pages/ManageCourseModules';
import Blogs from './pages/Blogs';
import QRScanner from './pages/QRScanner';
import AttendanceHistory from './pages/AttendanceHistory';
import AddTrainer from './pages/AddTrainer'; // New
import TrainerList from './pages/TrainerList'; // New
import TrainerDetails from './pages/TrainerDetails'; // New


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
          <Route path="students/add" element={<AddStudent />} />
          <Route path="students/edit/:id" element={<AddStudent />} />
          <Route path="banners" element={<Banners />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:courseId/modules" element={<ManageCourseModules />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="applications" element={<Applications />} />
          <Route path="blogs" element={<Blogs />} />
          <Route path="inquiries" element={<Inquiries />} />
          <Route path="attendance/qr-scanner" element={<QRScanner />} />
          <Route path="attendance/history" element={<AttendanceHistory />} />
          <Route path="settings" element={<Settings />} />
          <Route path="trainers" element={<TrainerList />} />
          <Route path="trainers/add" element={<AddTrainer />} />
          <Route path="trainers/:id" element={<TrainerDetails />} />
          <Route path="tests" element={<ManageTests />} />
          {/* Add more routes here as we migrate */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

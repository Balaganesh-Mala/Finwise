import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyCourses from './pages/MyCourses';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Playground from './pages/Playground';
import MyQR from './pages/MyQR';
import AttendanceHistory from './pages/AttendanceHistory';
import TypingPractice from './pages/TypingPractice';
import TypingTrainer from './pages/TypingTrainer';
import MockInterviewDashboard from './pages/MockInterviewDashboard';
import ProtectedRoute from './components/ProtectedRoute';

import ResetPassword from './pages/ResetPassword';
import CoursePlayer from './pages/CoursePlayer';
import JobPortal from './pages/JobPortal';
import Payments from './pages/Payments';
import RewardStore from './pages/RewardStore';
import NotFound from './pages/NotFound';


function App() {
  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Routes with Sidebar Layout */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<MyCourses />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/my-qr" element={<MyQR />} />
          <Route path="/my-attendance" element={<AttendanceHistory />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/typing-practice" element={<TypingPractice />} />
          <Route path="/typing-trainer" element={<TypingTrainer />} />
          <Route path="/mock-interview" element={<MockInterviewDashboard />} />
          <Route path="/jobs" element={<JobPortal />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/reward-store" element={<RewardStore />} />
        </Route>

        {/* Standalone Protected Route for Course Player (Full Width) */}
        <Route path="/course/:courseId" element={
          <ProtectedRoute>
            <CoursePlayer />
          </ProtectedRoute>
        } />


        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;

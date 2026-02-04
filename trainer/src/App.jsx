import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TrainerLayout from './layouts/TrainerLayout';
import Instructions from './pages/exam/Instructions';
import Attendance from './pages/Attendance';
import MCQTest from './pages/exam/MCQTest';
import VideoTest from './pages/exam/VideoTest'; // Planned
import AssignmentUpload from './pages/exam/AssignmentUpload'; // Planned
import ExamSuccess from './pages/exam/ExamSuccess';
import NotFound from './pages/NotFound';
import Students from './pages/Students';

import WrittenTest from './pages/exam/WrittenTest'; // Planned

import MyQR from './pages/MyQR';
import MyCourses from './pages/MyCourses';
import CourseContent from './pages/CourseContent';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  // Redirect Applicants to Exam Portal
  if (user.status === 'applicant' && !window.location.pathname.startsWith('/exam')) {
    return <Navigate to="/exam/instructions" />;
  }

  return children;
};



import { Toaster } from 'react-hot-toast';

import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Employee / Trainer Routes */}
          <Route path="/" element={<ProtectedRoute><TrainerLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="classes" element={<div>Classes Page</div>} />
            <Route path="students" element={<Students />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="materials" element={<MyCourses />} />
            <Route path="materials/:courseId" element={<CourseContent />} />
            <Route path="my-qr" element={<MyQR />} />
            <Route path="profile" element={<div>Profile Page</div>} />
            {/* Add other routes */}
          </Route>

          {/* Applicant / Exam Routes */}
          <Route path="/exam/instructions" element={
            <ProtectedRoute>
              <Instructions />
            </ProtectedRoute>
          } />
          <Route path="/exam/mcq" element={
            <ProtectedRoute>
              <MCQTest />
            </ProtectedRoute>
          } />
          <Route path="/exam/video" element={
            <ProtectedRoute>
              <VideoTest />
            </ProtectedRoute>
          } />
          <Route path="/exam/assignment" element={
            <ProtectedRoute>
              <AssignmentUpload />
            </ProtectedRoute>
          } />
          <Route path="/exam/written" element={
            <ProtectedRoute>
              <WrittenTest />
            </ProtectedRoute>
          } />
          <Route path="/exam/success" element={<ExamSuccess />} />

          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

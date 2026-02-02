import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import MockInterview from './pages/MockInterview';
import InterviewHistory from './pages/InterviewHistory';
import ProtectedRoute from './components/ProtectedRoute';

import ResetPassword from './pages/ResetPassword';
import CoursePlayer from './pages/CoursePlayer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="courses" element={<MyCourses />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="my-qr" element={<MyQR />} />
          <Route path="my-attendance" element={<AttendanceHistory />} />
          <Route path="playground" element={<Playground />} />
          <Route path="typing-practice" element={<TypingPractice />} />
          <Route path="mock-interview" element={<MockInterview />} />
          <Route path="my-interview-history" element={<InterviewHistory />} />
          <Route path="my-interview-history" element={<InterviewHistory />} />
        </Route>

        {/* Standalone Protected Route for Course Player (Full Width) */}
        <Route path="/course/:courseId" element={
          <ProtectedRoute>
            <CoursePlayer />
          </ProtectedRoute>
        } />

      </Routes>
    </Router>
  );
}

export default App;

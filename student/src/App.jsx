import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyCourses from './pages/MyCourses';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
             <Route index element={<Dashboard />} />
             <Route path="courses" element={<MyCourses />} />
             <Route path="profile" element={<Profile />} />
             <Route path="settings" element={<Settings />} />
        </Route>
        
      </Routes>
    </Router>
  );
}

export default App;

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('studentUser'));

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.status !== 'Active') {
    localStorage.removeItem('studentUser');
    return <Navigate to="/login" state={{ error: 'Your account is inactive. Please contact support.' }} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;

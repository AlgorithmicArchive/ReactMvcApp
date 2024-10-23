// ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { UserContext } from './UserContext';

const ProtectedRoute = ({ requiredRoles }) => {
  const { token, userType } = useContext(UserContext);

  if (!token) {
    // User is not authenticated
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(userType)) {
    // User does not have the required role
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

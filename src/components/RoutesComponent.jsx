// RoutesComponent.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomeScreen from '../screens/home/HomeScreen';
import LoginScreen from '../screens/home/LoginScreen';
import RegisterScreen from '../screens/home/RegisterScreen';
import Verification from '../screens/home/Verification';
import UserHome from '../screens/user/UserHome';
import Services from '../screens/user/Services';
import UserLayout from '../screens/user/UserLayout';
import Form from '../screens/user/Form';
import ProtectedRoute from '../ProtectedRoute'; // Import the ProtectedRoute component
import Unauthorized from '../screens/Unauthorized'; // Create this component

const RoutesComponent = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomeScreen />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/verification" element={<Verification />} />
      {/* <Route path="/register" element={<RegisterScreen />} /> */}

      {/* Unauthorized Route */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute requiredRoles={['Citizen']} />}>
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<UserHome />} />
          <Route path="services" element={<Services />} />
          <Route path="form" element={<Form />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default RoutesComponent;

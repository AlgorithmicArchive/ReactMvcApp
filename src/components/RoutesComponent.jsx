import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomeScreen from '../screens/home/HomeScreen';
import LoginScreen from '../screens/home/LoginScreen'
import RegisterScreen from '../screens/home/RegisterScreen'

const RoutesComponent = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/login" element={<LoginScreen />} />
      {/* <Route path="/register" element={<RegisterScreen />} /> */}
    </Routes>
  );
};

export default RoutesComponent;

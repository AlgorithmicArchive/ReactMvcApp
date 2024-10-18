import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomeScreen from '../screens/HomeScreen';
import AboutScreen from '../screens/AboutScreen';
import ContactScreen from '../screens/ContactScreen';

const RoutesComponent = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/about" element={<AboutScreen />} />
      <Route path="/contact" element={<ContactScreen />} />
    </Routes>
  );
};

export default RoutesComponent;

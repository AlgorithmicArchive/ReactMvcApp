import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomeScreen from '../screens/home/HomeScreen';
import LoginScreen from '../screens/home/LoginScreen'
import RegisterScreen from '../screens/home/RegisterScreen'
import Verification from '../screens/home/Verification';
import UserHome from '../screens/user/UserHome';
import Services from '../screens/user/Services';
import UserLayout from '../screens/user/UserLayout';
import Form from '../screens/user/Form';

const RoutesComponent = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path='/Verification' element={<Verification/>} />
      {/* <Route path="/register" element={<RegisterScreen />} /> */}

      <Route path="/user" element={<UserLayout />}>
        <Route index element={<UserHome />} /> 
        <Route path="services" element={<Services />} /> 
        <Route path="form" element={<Form />} /> 
      </Route>
    </Routes>
  );
};

export default RoutesComponent;

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container } from '@mui/material';

export default function OfficerLayout() {
  return (
    <Container >
      <Outlet />
    </Container>
  );
}

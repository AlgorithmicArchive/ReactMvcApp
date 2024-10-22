import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container } from '@mui/material';

export default function UserLayout() {
  return (
    <Container >
      <Outlet />
    </Container>
  );
}

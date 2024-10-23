import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { userType, setUserType, setToken } = useContext(UserContext);

  const handleLogout = () => {
    setToken(null);
    setUserType(null);
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        top: '185px',
        zIndex: 1100,
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'background.paper',
          boxShadow: 'none',
          color: 'primary.main',
          gap: 10,
        }}
      >
        {!userType && (
          <>
            <Button
              color="inherit"
              sx={{ fontWeight: 'bold' }}
              component={Link}
              to="/"
            >
              Home
            </Button>
            <Button
              color="inherit"
              sx={{ fontWeight: 'bold' }}
              component={Link}
              to="/login"
            >
              Login
            </Button>
            <img
              src="/assets/images/logo.png"
              alt="Logo"
              style={{ width: '80px' }}
            />
            <Button
              color="inherit"
              sx={{ fontWeight: 'bold' }}
              component={Link}
              to="/register"
            >
              Register
            </Button>
          </>
        )}

        {userType === 'Citizen' && (
          <>
            <Button
              color="inherit"
              sx={{ fontWeight: 'bold' }}
              component={Link}
              to="/user"
            >
              Home
            </Button>
            <Button
              color="inherit"
              sx={{ fontWeight: 'bold' }}
              component={Link}
              to="/user/services"
            >
              Apply for Service
            </Button>
            <Button
              color="inherit"
              sx={{ fontWeight: 'bold' }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </>
        )}

        {/* Add similar blocks for 'Officer' and 'Admin' userTypes if needed */}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

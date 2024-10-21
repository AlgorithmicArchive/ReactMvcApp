import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const handleScrollToSection3 = () => {
    const scrollEvent = new CustomEvent('scrollToSection', { detail: 'section3' });
    window.dispatchEvent(scrollEvent);
  };
  return (
    <AppBar
      position="fixed"
      sx={{
        top: '185px',  // Adjust the top position based on the height of the Header
        zIndex: 1100,  // Ensure it's below the header but above the content
      }}
    >
      <Toolbar sx={{display:'flex',justifyContent:'center',alignItems:'center',backgroundColor:'background.paper',boxShadow:'none',color:'primary.main',gap:10}}>
        <Button color="inherit" sx={{fontWeight:'bold'}} component={Link} to="/">
          Home
        </Button>
        <Button color="inherit" sx={{fontWeight:'bold'}} component={Link} to="/login">
          Login
        </Button>
        <img src="/assets/images/logo.png" alt="Logo" style={{width:'80px'}} />
        <Button color="inherit" sx={{fontWeight:'bold'}} component={Link} to="/register">
          Register
        </Button>
        <Button color="inherit" sx={{fontWeight:'bold'}} onClick={handleScrollToSection3}>
          Contact Us
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

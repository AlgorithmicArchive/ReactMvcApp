import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <AppBar
      position="fixed"
      sx={{
        top: '180px',  // Adjust the top position based on the height of the Header
        zIndex: 1100,  // Ensure it's below the header but above the content
      }}
    >
      <Toolbar sx={{display:'flex',justifyContent:'center',alignItems:'center',backgroundColor:'background.paper',boxShadow:'none',color:'primary.main',gap:10}}>
        <Button color="inherit" sx={{fontWeight:'bold'}} component={Link} to="/">
          Home
        </Button>
        <Button color="inherit" sx={{fontWeight:'bold'}} component={Link} to="/about">
          About
        </Button>
        <Button color="inherit" sx={{fontWeight:'bold'}} component={Link} to="/contact">
          Contact
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

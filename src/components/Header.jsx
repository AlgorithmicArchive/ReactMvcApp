import React from 'react';
import { Box, Typography, Button, Select, MenuItem } from '@mui/material';

const Header = () => {
  return (
    <Box
      sx={{
        padding: '0 0',
        position: 'fixed',  // Make the header fixed at the top
        top: 0,
        width: '100%',
        zIndex: 1200,  // Ensure it's above the navbar and content
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',  // Optional: Add a shadow for separation
      }}
    >
      {/* Top Bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 20px',
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: 'background.paper',
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 'bold', display: 'flex', gap: '10px', color: 'primary.main' }}
          >
            <span>जम्मू और कश्मीर सरकार</span>
            <span>GOVERNMENT OF JAMMU AND KASHMIR</span>
            <span>حکومت جموں و کشمیر</span>
          </Typography>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
          <Button variant="outlined" sx={{ fontSize: '12px' }}>SCREEN READER ACCESS</Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Typography sx={{ fontSize: '18px', fontWeight: 'bold' }}>A</Typography>
            <Typography sx={{ fontSize: '16px' }}>A</Typography>
          </Box>
          <Select defaultValue="English" size="small" sx={{ color: 'primary.main' }}>
            <MenuItem value="English">English</MenuItem>
            <MenuItem value="Hindi">हिन्दी</MenuItem>
            <MenuItem value="Urdu">اردو</MenuItem>
          </Select>
        </Box>
      </Box>

      {/* Main Header Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '100px',
          padding: '20px 20px',
          backgroundColor: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img src="/assets/images/emblem.png" alt="Gov Emblem" style={{ height: '100px' }} />
          <Typography
            variant="h6"
            sx={{ textAlign: 'center', fontWeight: 'bold', color: 'background.default' }}
          >
            समाज कल्याण विभाग
            <br />
            DEPARTMENT OF SOCIAL WELFARE
            <br />
            محکمہ سوشیل ویلفیئر
          </Typography>
        </Box>
        <Box>
          <img src="/assets/images/swach-bharat.png" alt="Swachh Bharat" style={{ height: '80px' }} />
        </Box>
      </Box>
    </Box>
  );
};

export default Header;

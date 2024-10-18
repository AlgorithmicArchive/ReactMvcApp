import React from 'react';
import { Box, Typography } from '@mui/material';

export default function CustomInputField({ label, placeholder = 'Enter text...', type = 'text' }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        mb: 2, // Margin bottom
      }}
    >
      {label && (
        <Typography
          sx={{
            fontWeight: 'bold',
            mb: 1, // Margin bottom for label
            color: 'background.default',
          }}
        >
          {label}
        </Typography>
      )}
      <input
        type={type}
        placeholder={placeholder}
        style={{
          padding: '10px',
          fontSize: '16px',
          border: '2px solid #48426D',
          borderRadius: '5px',
          outline: 'none',
          transition: 'border-color 0.3s',
          width: '100%',
          backgroundColor:'transparent',
        }}
      />
    </Box>
  );
}

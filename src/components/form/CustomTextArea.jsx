import React from 'react';
import { Box, Typography } from '@mui/material';

export default function CustomTextarea({ label, placeholder = 'Enter text...', rows = 4 }) {
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
      <textarea
        placeholder={placeholder}
        rows={rows}
        style={{
          padding: '10px',
          fontSize: '16px',
          border: '2px solid #48426D',
          borderRadius: '5px',
          outline: 'none',
          transition: 'border-color 0.3s',
          width: '100%',
          backgroundColor: 'transparent',
          resize: 'vertical', // Allow vertical resizing
        }}
        onFocus={(e) => (e.target.style.borderColor = 'blue')} // Change border color on focus
        onBlur={(e) => (e.target.style.borderColor = '#48426D')} // Revert border color on blur
      />
    </Box>
  );
}

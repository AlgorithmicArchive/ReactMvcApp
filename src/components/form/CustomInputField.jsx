import React from 'react';
import { Box, Typography } from '@mui/material';
import { Controller } from 'react-hook-form';

export default function CustomInputField({
  label,
  name,
  type = 'text',
  control,
  placeholder = 'Enter text...',
  rules = {},
  errors,
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
      {label && (
        <Typography sx={{ fontWeight: 'bold', mb: 1, color: 'background.default' }}>
          {label}
        </Typography>
      )}

      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <input
            {...field}
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
              backgroundColor: 'transparent',
              color: '#48426D',
            }}
          />
        )}
      />

      {/* Display error below the field */}
      {errors[name] && (
        <Typography variant="body2" sx={{ color: 'red', mt: 1 }}>
          {errors[name].message}
        </Typography>
      )}
    </Box>
  );
}

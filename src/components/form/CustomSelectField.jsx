import React from 'react';
import { Box, Typography } from '@mui/material';
import { Controller } from 'react-hook-form';

export default function CustomSelectField({
  label,
  name,
  control,
  options = [],
  placeholder = 'Select an option...',
  rules = {},
}) {
  if (!control) {
    console.error('CustomSelectField requires a valid control prop from react-hook-form.');
    return null; // Prevent rendering if control is not provided
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        mb: 2,
      }}
    >
      {label && (
        <Typography
          sx={{
            fontWeight: 'bold',
            mb: 1,
            color: 'background.default',
          }}
        >
          {label}
        </Typography>
      )}

      {/* Use Controller from react-hook-form */}
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState: { error } }) => (
          <Box sx={{ position: 'relative' }}>
            <select
              {...field}
              placeholder={placeholder}
              value={field.value || ''}
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
                appearance: 'none', // Remove default arrow for consistency
              }}
            >
              <option value="" disabled>
                {placeholder}
              </option>
              {options.map((option) => (
                <option key={option.value} value={option.value} style={{ color: '#000' }}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && (
              <Typography variant="body2" sx={{ color: 'red', mt: 1 }}>
                {error.message}
              </Typography>
            )}
          </Box>
        )}
      />
    </Box>
  );
}

// CustomInputField.js

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
  onChange, // Accept onChange as a prop
  maxLength, // Accept maxLength as a prop
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
        defaultValue="" // Default to empty string
        rules={rules}
        render={({ field, fieldState: { error } }) => (
          <>
            <input
              {...field}
              type={type}
              placeholder={placeholder}
              value={field.value || ''}
              onChange={(e) => {
                field.onChange(e); // Update the field value in react-hook-form
                if (onChange) onChange(e); // Apply transformation if onChange prop is provided
              }}
              onBlur={field.onBlur}
              maxLength={maxLength} // Set the maxLength here
              style={{
                padding: '10px',
                fontSize: '16px',
                border: error ? '2px solid red' : '2px solid #48426D',
                borderRadius: '5px',
                outline: 'none',
                transition: 'border-color 0.3s',
                width: '100%',
                backgroundColor: 'transparent',
                color: '#48426D',
              }}
            />
            {/* Display error message */}
            {error && (
              <Typography variant="body2" sx={{ color: 'red', mt: 1 }}>
                {error.message}
              </Typography>
            )}
          </>
        )}
      />
    </Box>
  );
}

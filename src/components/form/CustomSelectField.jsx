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
  errors,
  onChange, // Accept the onChange prop
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
          <select
            {...field}
            placeholder={placeholder}
            onChange={(e) => {
              const value = e.target.value;
              field.onChange(value); // Update react-hook-form value
              if (onChange) onChange(value); // Call custom onChange handler if provided
            }}
            style={{
              padding: '10px',
              fontSize: '16px',
              border: errors[name] ? '2px solid red' : '2px solid #48426D',
              borderRadius: '5px',
              outline: 'none',
              transition: 'border-color 0.3s',
              width: '100%',
              backgroundColor: 'transparent',
              color: '#48426D',
            }}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option, index) => (
              <option key={index} value={option.value} style={{ color: '#000' }}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      />

      {/* Display error below the field */}
      {errors?.[name] && (
        <Typography variant="body2" sx={{ color: 'red', mt: 1 }}>
          {errors[name].message}
        </Typography>
      )}
    </Box>
  );
}

import React, { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Controller } from 'react-hook-form';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function CustomInputField({
  label,
  name,
  control,
  placeholder = 'Enter text...',
  type = 'text',
  rules = {},
}) {
  const [showPassword, setShowPassword] = useState(false);

  if (!control) {
    console.error('CustomInputField requires a valid control prop from react-hook-form.');
    return null; // Prevent rendering if control is not provided
  }

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

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
            <input
              {...field}
              type={type === 'password' && !showPassword ? 'password' : 'text'}
              placeholder={placeholder}
              value={field.value || ''} // Ensure value is always defined
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
            {type === 'password' && (
              <IconButton
                onClick={handleTogglePasswordVisibility}
                sx={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#48426D',
                }}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            )}
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

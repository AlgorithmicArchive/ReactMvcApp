import React from 'react';
import { Box, Typography, Checkbox, FormControlLabel } from '@mui/material';
import { Controller } from 'react-hook-form';

export default function CustomCheckbox({
  label,
  name,
  control,
  rules = {},
}) {
  if (!control) {
    console.error('CustomCheckbox requires a valid control prop from react-hook-form.');
    return null; // Prevent rendering if control is not provided
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState: { error } }) => (
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  {...field}
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              }
              label={label}
            />
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

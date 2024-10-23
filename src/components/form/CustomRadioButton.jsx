import React from 'react';
import { Box, Typography, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import { Controller } from 'react-hook-form';

export default function CustomRadioButton({
  label,
  name,
  control,
  options = [],
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
          <RadioGroup
            {...field}
            row // Display radio buttons in a single line
            onChange={(e) => field.onChange(e.target.value)}
            sx={{ display: 'flex', flexDirection: 'row' }}
          >
            {options.map((option, index) => (
              <FormControlLabel
                key={index}
                value={option}
                control={<Radio />}
                label={option}
                sx={{
                  mr: 2,
                  color: field.value === option ? '#3f51b5' : '#888',
                  fontWeight: field.value === option ? 'bold' : 'normal',
                }}
              />
            ))}
          </RadioGroup>
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

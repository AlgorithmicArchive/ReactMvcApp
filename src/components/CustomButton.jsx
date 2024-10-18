import React from 'react';
import { Button } from '@mui/material';

export default function CustomButton({ text = 'Click Me', onPress = null,bgColor='primary.main',color='background.paper' }) {
  return (
    <Button
      variant="contained"
      onClick={onPress || undefined} // Handle optional onPress
      sx={{
        backgroundColor: bgColor,
        color: color,
        fontWeight: 'bold',
      }}
    >
      {text}
    </Button>
  );
}

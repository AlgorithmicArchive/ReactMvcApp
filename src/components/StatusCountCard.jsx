import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

// Accept an onClick prop
const StatusCountCard = ({ statusName, count, bgColor, textColor, onClick }) => {
  return (
    <Card
      sx={{
        minWidth: 300,
        minHeight:200,
        margin: '10px',
        padding: '10px',
        backgroundColor: bgColor,
        cursor: 'pointer',
      }}
      onClick={onClick} // Attach onClick handler
    >
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom color={textColor} sx={{fontSize:36}}>
          {statusName}
        </Typography>
        <Typography variant="h4" color={textColor} sx={{fontSize:80}}>
          {count}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatusCountCard;

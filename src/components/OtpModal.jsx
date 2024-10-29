import React from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';

const OtpModal = ({ open, onClose, onSubmit }) => {
  const [otp, setOtp] = React.useState('');

  const handleChange = (e) => setOtp(e.target.value);

  const handleSubmit = () => {
    onSubmit(otp); // Pass the OTP value to the parent component
    onClose(); // Close the modal
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="otp-modal-title" aria-describedby="otp-modal-description">
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography id="otp-modal-title" variant="h6" component="h2">
          Enter OTP
        </Typography>
        <Typography id="otp-modal-description" sx={{ mt: 1 }}>
          Please enter the OTP sent to your registered email.
        </Typography>
        <TextField
          label="OTP"
          variant="outlined"
          value={otp}
          onChange={handleChange}
          sx={{ mt: 2, width: '100%' }}
        />
        <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }}>
          Submit OTP
        </Button>
      </Box>
    </Modal>
  );
};

export default OtpModal;

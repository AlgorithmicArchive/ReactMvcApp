import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";

const MessageModal = ({ open, onClose, title, message, type = "info" }) => {
  const getColor = () => {
    switch (type) {
      case "error":
        return "#f44336"; // red
      case "success":
        return "#4caf50"; // green
      case "warning":
        return "#ff9800"; // orange
      case "info":
      default:
        return "#2196f3"; // blue
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ color: getColor() }}>
          {title}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {message}
        </Typography>
        <Button variant="contained" onClick={onClose} fullWidth>
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default MessageModal;

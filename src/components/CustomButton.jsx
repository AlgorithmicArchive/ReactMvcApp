import React from "react";
import { Button, CircularProgress } from "@mui/material";

export default function CustomButton({
  text = "Click Me",
  onClick = null,
  bgColor = "primary.main",
  color = "background.paper",
  type = "button",
  disabled = false,
  width = null,
  isLoading = false, // New prop for loading state
}) {
  return (
    <Button
      variant="contained"
      onClick={onClick || undefined}
      type={type}
      disabled={disabled || isLoading} // Disable if loading
      sx={{
        backgroundColor: bgColor,
        color: color,
        fontWeight: "bold",
        width: width,
        margin: "0 auto",
        "&:disabled": {
          backgroundColor: "gray",
          color: "#fff",
        },
      }}
    >
      {isLoading ? <CircularProgress size={24} color="inherit" /> : text}
    </Button>
  );
}

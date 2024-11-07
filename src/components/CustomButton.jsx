import React from "react";
import { Button } from "@mui/material";

export default function CustomButton({
  text = "Click Me",
  onClick = null,
  bgColor = "primary.main",
  color = "background.paper",
  type = "button",
  disabled = false,
  width = null,
}) {
  return (
    <Button
      variant="contained"
      onClick={onClick || undefined} // Handle optional onClick
      type={type}
      disabled={disabled}
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
      {text}
    </Button>
  );
}

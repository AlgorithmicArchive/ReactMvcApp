import React, { useContext, useEffect, useState } from "react";
import { Typography, Box } from "@mui/material";
import { UserContext } from "../UserContext";

const TokenTimer = () => {
  const { tokenExpiry } = useContext(UserContext);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (tokenExpiry) {
      const updateTimer = () => {
        const now = Date.now();
        const timeRemaining = tokenExpiry - now;

        if (timeRemaining <= 0) {
          setTimeLeft("Expired");
        } else {
          const minutes = Math.floor(timeRemaining / 1000 / 60);
          const seconds = Math.floor((timeRemaining / 1000) % 60);
          setTimeLeft(
            `${minutes.toString().padStart(2, "0")}:${seconds
              .toString()
              .padStart(2, "0")}`,
          );
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(null);
    }
  }, [tokenExpiry]);

  if (!timeLeft || !tokenExpiry) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 1300,
        px: 3,
        py: 1.5,
        bgcolor: "#ff9800",
        color: "#fff",
        borderRadius: "8px",
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.3)",
        fontWeight: "bold",
        fontSize: "1.1rem",
        textAlign: "center",
        minWidth: "220px",
      }}
    >
      Session expires in: {timeLeft}
    </Box>
  );
};

export default TokenTimer;

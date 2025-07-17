import React, { useContext, useEffect, useState } from "react";
import { Typography } from "@mui/material";
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
              .padStart(2, "0")}`
          );
        }
      };

      updateTimer(); // Initial update
      const interval = setInterval(updateTimer, 1000); // Update every second

      return () => clearInterval(interval); // Cleanup on unmount
    } else {
      setTimeLeft(null);
    }
  }, [tokenExpiry]);

  if (!timeLeft || !tokenExpiry) return null;

  return (
    <Typography
      variant="body2"
      sx={{
        color: "white",
        bgcolor: "primary.main",
        px: 2,
        py: 1,
        borderRadius: 1,
        position: "fixed",
        top: 10,
        right: 10,
        zIndex: 1000,
      }}
    >
      Session expires in: {timeLeft}
    </Typography>
  );
};

export default TokenTimer;

import { Box } from "@mui/material";
import React from "react";
import { Puff, TailSpin } from "react-loader-spinner";

const LoadingSpinner = () => {
  return (
    <Box
      sx={{
        backgroundColor: "background.default",
        position: "fixed",
        top: "30%",
        left: "0",
        zIndex: 1000,
        opacity: 0.7,
        width: "100vw",
      }}
    >
      <TailSpin color="#00BFFF" height={500} width={"100%"} visible={true} />
    </Box>
  );
};

export default LoadingSpinner;

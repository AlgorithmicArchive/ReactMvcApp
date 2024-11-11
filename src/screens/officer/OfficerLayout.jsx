import React from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";

export default function OfficerLayout() {
  return (
    <Box>
      <Outlet />
    </Box>
  );
}

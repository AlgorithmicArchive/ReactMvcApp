import { Box } from "@mui/material";
import React from "react";
import DynamicScrollableForm from "../../components/form/DynamicScrollableForm";

export default function IncompleteForm() {
  return (
    <Box
      sx={{
        minHeight: { xs: "120vh", lg: "90vh" }, // Use min-height to ensure at least full viewport height
        display: { xs: "flex" },
        justifyContent: { xs: "center" }, // Center content vertically
        alignItems: { xs: "center", lg: "start" }, // Center content horizontally
        boxSizing: "border-box",
        paddingBottom: 5,
      }}
    >
      <DynamicScrollableForm mode="incomplete" />
    </Box>
  );
}

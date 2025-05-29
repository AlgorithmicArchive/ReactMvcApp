import { Box } from "@mui/material";
import React from "react";
import DynamicStepForm from "../../components/form/DynamicStepForm";

export default function EditForm() {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <DynamicStepForm mode="edit" />
    </Box>
  );
}

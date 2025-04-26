import { Box } from "@mui/material";
import React from "react";
import DynamicStepForm from "../../components/form/DynamicStepForm";

export default function Form() {
  return (
    <Box sx={{ paddingBottom: 10 }}>
      <DynamicStepForm />
    </Box>
  );
}

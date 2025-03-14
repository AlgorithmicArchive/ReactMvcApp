import { Box } from "@mui/material";
import React from "react";
import DynamicStepForm from "../../components/form/DynamicStepForm";

export default function IncompleteForm() {
  return (
    <Box>
      <DynamicStepForm mode="incomplete" />
    </Box>
  );
}

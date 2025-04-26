import { Box } from "@mui/material";
import React from "react";
import DynamicStepForm from "../../components/form/DynamicStepForm";

export default function EditForm() {
  return (
    <Box>
      <DynamicStepForm mode="edit" />
    </Box>
  );
}

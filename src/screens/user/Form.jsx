import { Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { GetServiceContent } from "../../assets/fetch"; // Assuming you have a function for fetching
import DynamicStepForm from "../../components/form/DynamicStepForm"; // Import your dynamic step form component
import { useLocation } from "react-router-dom";

export default function Form() {
  const [serviceName, setServiceName] = useState("");
  const [formElements, setFormElements] = useState([]);
  const [serviceId, setServiceId] = useState(null);
  const location = useLocation();

  useEffect(() => {
    async function ServiceContent() {
      try {
        const { ServiceId } = location.state || {};
        setServiceId(ServiceId);
        setFormElements([]);
        const result = await GetServiceContent(ServiceId);
        if (result && result.status) {
          setServiceName(result.serviceName);
          setFormElements(JSON.parse(result.formElement)); // Parse formElements from JSON string
          setServiceId(result.serviceId);
        }
      } catch (error) {
        console.error("Error fetching service content:", error);
      }
    }
    ServiceContent();
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        width: "100vw",
        height: "auto",
        marginTop: "30vh",
      }}
    >
      <Typography
        variant="h4"
        sx={{ mb: 3, width: "80%", textAlign: "center" }}
      >
        {serviceName || "Loading..."}
      </Typography>

      {/* Render the dynamic step form if formElements are available */}
      {formElements.length > 0 && (
        <Box
          sx={{
            backgroundColor: "primary.main",
            width: { xs: "100%", md: "60%" },
            padding: 3,
            borderRadius: 3,
          }}
        >
          <DynamicStepForm formConfig={formElements} serviceId={serviceId} />
        </Box>
      )}
    </Box>
  );
}

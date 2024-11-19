import { Box } from "@mui/material";
import React, { useState } from "react";
import CustomTable from "../../components/CustomTable";
import { fetchData, SetServiceId } from "../../assets/fetch";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function Services() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleButtonAction = async (functionName, parameters) => {
    if (functionName === "OpenForm") {
      navigate("/user/form", { state: { ServiceId: parameters[0] } });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: { md: "70vh" },
      }}
    >
      <Box sx={{ width: { xs: "100%", md: "80%" } }}>
        <CustomTable
          title={"Services"}
          fetchData={fetchData}
          url="/User/GetServices"
          buttonActionHandler={handleButtonAction}
        />
      </Box>
    </Box>
  );
}

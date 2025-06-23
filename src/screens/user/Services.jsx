import { Box } from "@mui/material";
import React, { useState } from "react";
import CustomTable from "../../components/CustomTable";
import { fetchData, SetServiceId } from "../../assets/fetch";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import ServerSideTable from "../../components/ServerSideTable";

export default function Services() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const actionFunctions = {
    OpenForm: (row) => {
      const userdata = row.original;
      navigate("/user/form", { state: { ServiceId: userdata.serviceId } });
    },
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
        height: { xs: "100vh", lg: "70vh" },
      }}
    >
      <Box sx={{ width: { xs: "90%", md: "80%" } }}>
        <ServerSideTable
          url="User/GetServices"
          extraParams={{}}
          actionFunctions={actionFunctions}
        />
      </Box>
    </Box>
  );
}

import React, { useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import CustomTable from "../../components/CustomTable";
import { fetchData } from "../../assets/fetch";
import BasicModal from "../../components/BasicModal";
import { useNavigate } from "react-router-dom";

export default function Initiated() {
  const [open, setOpen] = useState(false);
  const [table, setTable] = useState(null);
  const [ApplicationId, setApplicationId] = useState(null);

  // Toggle modal state
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const navigate = useNavigate();
  const handleButtonAction = async (functionName, parameters) => {
    const applicationId = parameters[0];
    setApplicationId(applicationId);
    if (functionName == "CreateTimeLine") {
      handleOpen();
      setTable({
        url: "/User/GetApplicationHistory",
        params: { ApplicationId: applicationId },
      });
    } else if (functionName == "EditForm") {
      navigate("/user/editform", {
        state: { applicationId: applicationId },
      });
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: { xs: "100vh", md: "80vh" },
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box sx={{ width: { xs: "90%", md: "80%" } }}>
        <CustomTable
          title={"Initiated Applications"}
          fetchData={fetchData}
          url="/User/GetInitiatedApplications"
          buttonActionHandler={handleButtonAction}
        />
      </Box>
      <BasicModal
        open={open}
        handleClose={handleClose}
        Title={"Application Status"}
        pdf={null}
        table={table}
        accordion={ApplicationId}
      />
    </Box>
  );
}

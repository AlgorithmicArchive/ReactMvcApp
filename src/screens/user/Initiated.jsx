import React, { useState } from "react";
import { Container, Typography } from "@mui/material";
import CustomTable from "../../components/CustomTable";
import { fetchData } from "../../assets/fetch";
import BasicModal from "../../components/BasicModal";
import { useNavigate } from "react-router-dom";

export default function Initiated() {
  const [open, setOpen] = useState(false);
  const [table, setTable] = useState(null);

  // Toggle modal state
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const navigate = useNavigate();
  const handleButtonAction = async (functionName, parameters) => {
    const applicationId = parameters[0];
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
    <Container
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CustomTable
        title={"Initiated Applications"}
        fetchData={fetchData}
        url="/User/GetInitiatedApplications"
        buttonActionHandler={handleButtonAction}
      />
      <BasicModal
        open={open}
        handleClose={handleClose}
        Title={"Application Status"}
        pdf={null}
        table={table}
      />
    </Container>
  );
}

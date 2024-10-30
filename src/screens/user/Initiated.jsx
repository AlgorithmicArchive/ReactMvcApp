import React, { useState } from "react";
import { Container, Typography } from "@mui/material";
import CustomTable from "../../components/CustomTable";
import { fetchData } from "../../assets/fetch";
import BasicModal from "../../components/BasicModal";
import axiosInstance from "../../axiosConfig";

export default function Initiated() {
  const [open, setOpen] = useState(false);
  const [table,setTable] = useState(null)

  // Toggle modal state
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleButtonAction = async (functionName, parameters) => {
    handleOpen();
    const applicationId = parameters[0];
    setTable({url:'/User/GetApplicationHistory',params:{ApplicationId:applicationId}});
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

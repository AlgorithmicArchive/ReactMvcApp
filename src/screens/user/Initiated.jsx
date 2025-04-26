import React, { useState } from "react";
import { Box } from "@mui/material";
import BasicModal from "../../components/BasicModal";
import { useNavigate } from "react-router-dom";
import ServerSideTable from "../../components/ServerSideTable";

export default function Initiated() {
  const [open, setOpen] = useState(false);
  const [table, setTable] = useState(null);
  const [ApplicationId, setApplicationId] = useState(null);

  // Toggle modal state
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const navigate = useNavigate();

  const actionFunctions = {
    CreateTimeLine: (row) => {
      const userdata = row.original;
      handleOpen();
      setTable({
        url: "/User/GetApplicationHistory",
        params: { ApplicationId: userdata.referenceNumber },
      });
    },
    EditForm: (row) => {
      const userdata = row.original;
      navigate("/user/editform", {
        state: {
          referenceNumber: userdata.referenceNumber,
          ServiceId: userdata.serviceId,
        },
      });
    },
  };

  const handleButtonAction = async (functionName, parameters) => {
    const applicationId = parameters[0];
    setApplicationId(applicationId);
    if (functionName == "CreateTimeLine") {
    } else if (functionName == "EditForm") {
      navigate("/user/editform", {
        state: { applicationId: applicationId },
      });
    }
  };

  return (
    <Box
      sx={{
        height: { xs: "100vh", md: "70vh" },
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box sx={{ width: { xs: "100%", md: "80%" } }}>
        <ServerSideTable
          url="/User/GetInitiatedApplications"
          extraParams={{}}
          actionFunctions={actionFunctions}
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

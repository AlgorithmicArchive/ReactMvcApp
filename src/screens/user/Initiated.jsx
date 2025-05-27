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
    DownloadSanctionLetter: (row) => {
      console.log("HERE");
      const userdata = row.original;
      const applicationId = userdata.referenceNumber;

      // Build the download URL
      const fileName = applicationId.replace(/\//g, "_") + "SanctionLetter.pdf";
      const url = `/files/${fileName}`;

      // Trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
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

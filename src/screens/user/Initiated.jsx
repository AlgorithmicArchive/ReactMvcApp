import React, { useState } from "react";
import { Box, styled } from "@mui/material";
import BasicModal from "../../components/BasicModal";
import { useNavigate } from "react-router-dom";
import ServerSideTable from "../../components/ServerSideTable";

const MainContainer = styled(Box)`
  min-height: 100vh;
  background: linear-gradient(180deg, #e6f0fa 0%, #b3cde0 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const TableCard = styled(Box)`
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  width: 90%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  }
`;

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
    <MainContainer>
      <TableCard>
        <ServerSideTable
          url="/User/GetInitiatedApplications"
          extraParams={{}}
          actionFunctions={actionFunctions}
        />
      </TableCard>
      <BasicModal
        open={open}
        handleClose={handleClose}
        Title={"Application Status"}
        pdf={null}
        table={table}
        accordion={ApplicationId}
      />
    </MainContainer>
  );
}

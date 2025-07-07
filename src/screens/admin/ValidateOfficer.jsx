import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../axiosConfig";
import ServerSideTable from "../../components/ServerSideTable";
import MessageModal from "../../components/MessageModal";

export default function ValidateOfficer() {
  const [modalOpen, setModalOpen] = useState(false);
  const actionFunctions = {
    ValidateOfficer: async (row) => {
      const userdata = row.original;
      console.log("Validating officer:", userdata.username);
      const formdata = new FormData();
      formdata.append("username", userdata.username);
      try {
        const response = await axiosInstance.post(
          "/Admin/ValidateOfficer",
          formdata
        );

        if (response.data.status) {
          setModalOpen(true);
          // Optionally reload table
        } else {
          alert("Validation failed.");
        }
      } catch (error) {
        console.error("Error validating officer:", error);
        alert("An error occurred while validating officer.");
      }
    },
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        minHeight: "100vh",
        bgcolor: "#f8f9fa",
        py: 4,
      }}
    >
      <ServerSideTable
        url={"/Admin/GetOfficerToValidate"}
        extraParams={{}}
        actionFunctions={actionFunctions}
        refreshTrigger={true}
      />
      <MessageModal
        onClose={() => setModalOpen(false)}
        open={modalOpen}
        message={"Officer Validated Successfully."}
        type="success"
        title={"Officer Validation"}
        key={"Validation"}
      />
    </Box>
  );
}

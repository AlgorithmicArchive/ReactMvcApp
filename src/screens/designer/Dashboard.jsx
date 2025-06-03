import { Box } from "@mui/material";
import React, { useState } from "react";
import { CardBody, Col, Container, Row } from "react-bootstrap";
import ServerSideTable from "../../components/ServerSideTable";
import axiosInstance from "../../axiosConfig";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Dashboard() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const actionFunctions = {
    ToggleServiceActivation: async (row) => {
      const userdata = row.original;
      const serviceId = userdata.serviceId;
      const isActive = !userdata.isActive;
      try {
        const formdata = new FormData();
        formdata.append("serviceId", serviceId);
        formdata.append("active", isActive);
        const response = await axiosInstance.post(
          "/Base/ToggleServiceActive",
          formdata
        );

        if (response.data.status) {
          toast.success(
            `Service ${
              response.data.active ? "activated" : "deactivated"
            } successfully`
          );
          setRefreshTrigger((r) => r + 1);
        } else {
          toast.error(response.data.message || "Something went wrong");
        }

        return response.data;
      } catch (error) {
        toast.error("Failed to toggle service activation");
        console.error("ToggleServiceActivation error:", error);
        throw error;
      }
    },
  };
  return (
    <Box
      sx={{
        height: "70vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Container>
        <ServerSideTable
          key={refreshTrigger}
          url={"/Base/GetServicesDashboard"}
          extraParams={{}}
          actionFunctions={actionFunctions}
        />
        <ToastContainer position="top-right" autoClose={3000} />
      </Container>
    </Box>
  );
}

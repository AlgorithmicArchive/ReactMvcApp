import React, { useEffect, useState, useRef } from "react";
import { fetchServiceList } from "../../assets/fetch";
import ServiceSelectionForm from "../../components/ServiceSelectionForm";
import { Box } from "@mui/material";
import { useForm } from "react-hook-form";
import axiosInstance from "../../axiosConfig";
import { Col, Container, Row } from "react-bootstrap";
import StatusCountCard from "../../components/StatusCountCard";
import ServerSideTable from "../../components/ServerSideTable";
import { useNavigate } from "react-router-dom";

export default function OfficerHome() {
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState();
  const [countList, setCountList] = useState([]);
  const [canSanction, setCanSanction] = useState(false);
  const [canHavePool, setCanHavePool] = useState(false);
  const [type, setType] = useState("");
  const [showTable, setShowTable] = useState(false);

  // Create a ref for the container that will hold the table.
  const tableRef = useRef(null);

  const {
    control,
    formState: { errors },
    reset,
  } = useForm();

  const handleRecords = async (serviceId) => {
    try {
      setServiceId(serviceId);
      const response = await axiosInstance.get(
        "/Officer/GetApplicationsCount",
        {
          params: { ServiceId: serviceId },
        }
      );
      setCountList(response.data.countList);
      setCanSanction(response.data.canSanction);
      setCanHavePool(response.data.canHavePool);
    } catch (error) {
      console.error("Failed to fetch application counts:", error);
    }
  };

  const navigate = useNavigate();

  // When a card is clicked, update the type, show the table, and scroll to it.
  const handleCardClick = async (statusName) => {
    console.log(statusName);
    setType(statusName);
    setShowTable(true);
    // Allow the table to render then scroll
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Map function names (from API) to actual functions.
  const actionFunctions = {
    handleOpenApplication: (row) => {
      const userdata = row.original;
      navigate("/officer/userDetails", {
        state: { applicationId: userdata.referenceNumber },
      });
    },
    handleViewApplication: (row) => {
      const data = row.original;
      navigate("/officer/viewUserDetails", {
        state: { applicationId: data.referenceNumber },
      });
    },
    pullApplication: async (row) => {
      const data = row.original;
      const response = await axiosInstance.get("/Officer/PullApplication", {
        params: { applicationId: data.referenceNumber },
      });
      const result = response.data;
      if (result.status) {
        window.location.reload();
      }
    },
  };

  // extraParams are computed from serviceId and type
  const extraParams = {
    ServiceId: serviceId,
    type: type,
  };

  useEffect(() => {
    fetchServiceList(setServices);
  }, []);

  return (
    <Box
      sx={{
        height: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        marginBottom: "5vh",
        gap: 5,
      }}
    >
      <ServiceSelectionForm
        services={services}
        errors={errors}
        onServiceSelect={handleRecords}
      />
      <Container
        sx={{
          display: "flex",
          justifyContent: "space-evenly",
          marginTop: "50px",
          width: "100%",
        }}
      >
        <Row>
          {countList.map((item, index) => (
            <Col key={index} xs={12} lg={4}>
              <StatusCountCard
                statusName={item.label}
                count={item.count}
                bgColor={item.bgColor}
                textColor={item.textColor}
                onClick={() => handleCardClick(item.label)}
              />
            </Col>
          ))}
        </Row>
      </Container>
      {showTable && (
        <Container ref={tableRef}>
          <ServerSideTable
            key={`${serviceId}-${type}`}
            url="/Officer/GetApplications"
            extraParams={extraParams}
            actionFunctions={actionFunctions}
            canSanction={canSanction}
            canHavePool={canHavePool}
            pendingApplications={type == "Pending"}
            serviceId={serviceId}
          />
        </Container>
      )}
    </Box>
  );
}

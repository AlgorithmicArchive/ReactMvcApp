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
  const [type, setType] = useState("");
  const [showTable, setShowTable] = useState(false);

  // Create a ref for the container that will hold the table.
  const tableRef = useRef(null);

  const {
    control,
    formState: { errors },
    handleSubmit,
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
    } catch (error) {
      console.error("Failed to fetch application counts:", error);
    }
  };

  const navigate = useNavigate();

  // When a card is clicked, update the type, show the table, and scroll to it.
  const handleCardClick = async (statusName) => {
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
        width: "100vw",
        height: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        marginTop: "30vh",
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
            url="/Officer/GetApplications"
            extraParams={extraParams}
            actionFunctions={actionFunctions}
          />
        </Container>
      )}
    </Box>
  );
}

import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Container, Row, Col } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AssignmentIcon from "@mui/icons-material/Assignment";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../axiosConfig";
import ServerSideTable from "../../components/ServerSideTable";
import { set } from "react-hook-form";

export default function AdminHome() {
  // State for dashboard data, loading, and error
  const [dashboardData, setDashboardData] = useState({
    totalOfficers: 0,
    totalRegisteredUsers: 0,
    totalApplicationsSubmitted: 0,
    totalServices: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [url, setUrl] = useState("");
  const [listType, setListType] = useState("");

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

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          "/Admin/GetDetailsForDashboard"
        );
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
        toast.error("Failed to load dashboard data", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCardClick = async (type) => {
    console.log(type);
    if (type == "Officer") {
      setUrl("/Admin/GetOfficersList");
    } else if (type == "Citizen") {
      setUrl("/Admin/GetUsersList");
    } else if (type == "Applications") {
      setUrl("/Admin/GetApplicationsList");
    } else if (type == "Services") {
      setUrl("/Admin/GetServices");
    }
    setListType(type);
    setShowTable(true);
  };

  const cardStyles = {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    textAlign: "center",
    boxShadow: 3,
    borderRadius: 2,
    cursor: "pointer",
  };

  const iconStyles = {
    fontSize: 40,
    color: "#1976d2",
    mb: 1,
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "#f8f9fa",
        py: 4,
      }}
    >
      <Container>
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
          Admin Dashboard
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">
            {error}
          </Typography>
        ) : (
          <Row xs={1} md={2} lg={4} className="g-4">
            <Col>
              <Card sx={cardStyles} onClick={() => handleCardClick("Officer")}>
                <CardContent>
                  <PeopleIcon sx={iconStyles} />
                  <Typography variant="h6" color="text.secondary">
                    Total Registered Officers
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {dashboardData.totalOfficers}
                  </Typography>
                </CardContent>
              </Card>
            </Col>
            <Col>
              <Card sx={cardStyles} onClick={() => handleCardClick("Citizen")}>
                <CardContent>
                  <PersonAddIcon sx={iconStyles} />
                  <Typography variant="h6" color="text.secondary">
                    Total Registered Users
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {dashboardData.totalRegisteredUsers}
                  </Typography>
                </CardContent>
              </Card>
            </Col>
            <Col>
              <Card
                sx={cardStyles}
                onClick={() => handleCardClick("Applications")}
              >
                <CardContent>
                  <AssignmentIcon sx={iconStyles} />
                  <Typography variant="h6" color="text.secondary">
                    Total Applications Submitted
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {dashboardData.totalApplicationsSubmitted}
                  </Typography>
                </CardContent>
              </Card>
            </Col>
            <Col>
              <Card sx={cardStyles} onClick={() => handleCardClick("Services")}>
                <CardContent>
                  <MiscellaneousServicesIcon sx={iconStyles} />
                  <Typography variant="h6" color="text.secondary">
                    Total Services
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {dashboardData.totalServices}
                  </Typography>
                </CardContent>
              </Card>
            </Col>
          </Row>
        )}
      </Container>

      {showTable && (
        <Box sx={{ padding: 5, marginTop: 5 }}>
          <ServerSideTable
            key={listType}
            url={url}
            extraParams={{}}
            actionFunctions={{}}
          />
        </Box>
      )}

      {/* Toast Container for Error Notifications */}
      <ToastContainer />
    </Box>
  );
}

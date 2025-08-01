import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Fade,
  Container,
} from "@mui/material";
import { Row, Col } from "react-bootstrap";
import React, { useEffect, useState, useRef } from "react";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AssignmentIcon from "@mui/icons-material/Assignment";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../axiosConfig";
import ServerSideTable from "../../components/ServerSideTable";
import Chart from "chart.js/auto";

// Define card data with colors and types
const cardData = [
  {
    title: "Total Registered Officers",
    icon: <PeopleIcon />,
    color: "#1976d2",
    dataKey: "totalOfficers",
    type: "Officer",
  },
  {
    title: "Total Registered Citizens",
    icon: <PersonAddIcon />,
    color: "#dc004e",
    dataKey: "totalRegisteredUsers",
    type: "Citizen",
  },
  {
    title: "Total Applications Received",
    icon: <AssignmentIcon />,
    color: "#f57c00",
    dataKey: "totalApplicationsSubmitted",
    type: "Applications",
  },
  {
    title: "Total Services",
    icon: <MiscellaneousServicesIcon />,
    color: "#388e3c",
    dataKey: "totalServices",
    type: "Services",
  },
];

// DashboardChart component
const DashboardChart = ({ data }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      const chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Officers", "Citizens", "Applications", "Services"],
          datasets: [
            {
              label: "Total",
              data: [
                data.totalOfficers,
                data.totalRegisteredUsers,
                data.totalApplicationsSubmitted,
                data.totalServices,
              ],
              backgroundColor: ["#1976d2", "#dc004e", "#f57c00", "#388e3c"],
              borderColor: ["#1976d2", "#dc004e", "#f57c00", "#388e3c"],
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });

      return () => {
        chart.destroy();
      };
    }
  }, [data]);

  return <canvas ref={canvasRef} style={{ maxWidth: "100%" }} />;
};

export default function AdminHome() {
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
  const tableRef = useRef(null);

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

  const handleCardClick = (type) => {
    if (type === "Officer") {
      setUrl("/Admin/GetOfficersList");
    } else if (type === "Citizen") {
      setUrl("/Admin/GetUsersList");
    } else if (type === "Applications") {
      setUrl("/Admin/GetApplicationsList");
    } else if (type === "Services") {
      setUrl("/Admin/GetServices");
    }
    setListType(type);
    setShowTable(true);
    // Scroll to table
    setTimeout(() => {
      if (tableRef.current) {
        tableRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100); // Small delay to ensure table is rendered
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
    mb: 1,
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
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
          <Fade in={!loading}>
            <Box>
              <Row xs={1} md={2} lg={4} className="g-4">
                {cardData.map((card, index) => (
                  <Col key={index}>
                    <Card
                      sx={{
                        ...cardStyles,
                        transition: "transform 0.2s",
                        "&:hover": {
                          transform: "scale(1.05)",
                          boxShadow: 6,
                        },
                      }}
                      onClick={() => handleCardClick(card.type)}
                    >
                      <CardContent>
                        {React.cloneElement(card.icon, {
                          sx: { ...iconStyles, color: card.color },
                        })}
                        <Typography variant="h6" color="text.secondary">
                          {card.title}
                        </Typography>
                        <Typography variant="h4" sx={{ color: card.color }}>
                          {dashboardData[card.dataKey]}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Col>
                ))}
              </Row>
              <Box sx={{ my: 4 }}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6" align="center" gutterBottom>
                    Dashboard Overview
                  </Typography>
                  <DashboardChart data={dashboardData} />
                </Card>
              </Box>
            </Box>
          </Fade>
        )}

        {showTable && (
          <Fade in={showTable} style={{ width: "100%" }}>
            <Box
              ref={tableRef}
              sx={{ padding: 2, marginTop: 4, width: "100%" }}
            >
              <Typography variant="h5" gutterBottom>
                List of {listType}
              </Typography>
              <ServerSideTable
                key={listType}
                url={url}
                extraParams={{}}
                actionFunctions={{}}
                Title={listType}
              />
            </Box>
          </Fade>
        )}
      </Container>

      <ToastContainer />
    </Box>
  );
}

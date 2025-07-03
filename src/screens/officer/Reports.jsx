import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import { toast } from "react-toastify";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Container, Row, Col } from "react-bootstrap";
import styled from "@emotion/styled";
import ServerSideTable from "../../components/ServerSideTable";
import axiosInstance from "../../axiosConfig";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

// Styled components for modern look
const StyledCard = styled(Card)`
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
  }
`;

const StatCard = styled(Card)`
  border-radius: 12px;
  color: white;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.1));
    z-index: 0;
  }
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }
`;

const StyledButton = styled(Button)`
  background: linear-gradient(45deg, #1976d2, #2196f3);
  padding: 12px 24px;
  font-weight: 600;
  border-radius: 8px;
  text-transform: none;
  &:hover {
    background: linear-gradient(45deg, #1565c0, #1976d2);
    transform: scale(1.05);
  }
  &:disabled {
    background: #cccccc;
    color: #666666;
  }
`;

export default function Reports() {
  const [district, setDistrict] = useState("");
  const [service, setService] = useState("");
  const [districts, setDistricts] = useState([]);
  const [services, setServices] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    citizenPending: 0,
    rejected: 0,
    sanctioned: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTehsil, setIsTehsil] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [showTable, setShowTable] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  const tableRef = useRef(null);

  const API_BASE_URL = "http://127.0.0.1:5004";

  // Fetch districts and services
  useEffect(() => {
    const fetchDropdowns = async () => {
      setLoading(true);
      setError(null);
      try {
        const [districtsRes, servicesRes] = await Promise.all([
          axiosInstance.get(`${API_BASE_URL}/Base/GetAccessAreas`),
          axiosInstance.get(`${API_BASE_URL}/Base/GetServices`),
        ]);

        if (districtsRes.data.status && servicesRes.data.status) {
          if (districtsRes.data.tehsils) {
            setIsTehsil(true);
            setDistricts(
              districtsRes.data.tehsils.map((d) => ({
                value: d.tehsilId,
                label: d.tehsilName,
              }))
            );
          } else {
            setDistricts(
              districtsRes.data.districts.map((d) => ({
                value: d.districtId,
                label: d.districtName,
              }))
            );
          }
          setServices(
            servicesRes.data.services.map((s) => ({
              value: s.serviceId,
              label: s.serviceName,
            }))
          );
        } else {
          throw new Error("Failed to fetch districts or services");
        }
      } catch (err) {
        setError(err.message);
        toast.error(`Error: ${err.message}`, {
          position: "top-right",
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDropdowns();
  }, []);

  // Fetch counts for dashboard
  const fetchCounts = async () => {
    setLoading(true);
    try {
      const statusTypes = [
        "Total Applications",
        "pending",
        "returntoedit",
        "rejected",
        "sanctioned",
      ];
      const promises = statusTypes.map((status) =>
        axiosInstance.get(`${API_BASE_URL}/Officer/GetApplicationsForReports`, {
          params: {
            AccessCode: district,
            ServiceId: service,
            StatusType: status,
            pageIndex: 0,
            pageSize: 1,
          },
        })
      );

      const responses = await Promise.all(promises);
      const newCounts = {
        total: responses[0].data.totalRecords || 0,
        pending: responses[1].data.totalRecords || 0,
        citizenPending: responses[2].data.totalRecords || 0,
        rejected: responses[3].data.totalRecords || 0,
        sanctioned: responses[4].data.totalRecords || 0,
      };
      setCounts(newCounts);
    } catch (err) {
      setError(err.message);
      toast.error(`Error: ${err.message}`, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDistrictChange = (event) => {
    setDistrict(event.target.value);
    if (service) {
      setIsButtonDisabled(false);
    }
  };

  const handleServiceChange = (event) => {
    setService(event.target.value);
    if (district) {
      setIsButtonDisabled(false);
    }
  };

  const handleGetReports = () => {
    fetchCounts();
    setShowTable(false);
    setSelectedStatus("");
  };

  const handleCardClick = (statusName) => {
    setSelectedStatus(
      statusName == "Citizen Pending" ? "returntoedit" : statusName
    );
    setShowTable(true);
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Chart data
  const barData = {
    labels: ["Total", "Pending", "Citizen Pending", "Rejected", "Sanctioned"],
    datasets: [
      {
        label: "Applications",
        data: [
          counts.total,
          counts.pending,
          counts.citizenPending,
          counts.rejected,
          counts.sanctioned,
        ],
        backgroundColor: [
          "#1976d2",
          "#ff9800",
          "#9c27b0",
          "#f44336",
          "#4caf50",
        ],
        borderColor: ["#1565c0", "#f57c00", "#7b1fa2", "#d32f2f", "#388e3c"],
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: ["Pending", "Citizen Pending", "Rejected", "Sanctioned"],
    datasets: [
      {
        data: [
          counts.pending,
          counts.citizenPending,
          counts.rejected,
          counts.sanctioned,
        ],
        backgroundColor: ["#ff9800", "#9c27b0", "#f44336", "#4caf50"],
        borderColor: ["#fff", "#fff", "#fff", "#fff"],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 14,
            family: "'Inter', sans-serif",
          },
        },
      },
    },
  };

  // Extra params for ServerSideTable
  const extraParams = {
    AccessCode: district,
    ServiceId: service,
    StatusType: selectedStatus,
  };

  if (loading) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#f8f9fa",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#f8f9fa",
        }}
      >
        <Typography color="error" variant="h6" sx={{ mb: 2 }}>
          {error}
        </Typography>
        <StyledButton
          variant="contained"
          onClick={() => window.location.reload()}
        >
          Retry
        </StyledButton>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: { xs: 3, md: 5 },
        bgcolor: "#f8f9fa",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 5,
          fontWeight: 700,
          color: "#2d3748",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        Reports
      </Typography>

      <Container>
        <Row className="mb-5 justify-content-center">
          <Col xs={12} md={6} lg={4}>
            <FormControl fullWidth sx={{ mb: { xs: 2, md: 0 } }}>
              <InputLabel id="district-select-label">
                {isTehsil ? "Tehsil" : "District"}
              </InputLabel>
              <Select
                labelId="district-select-label"
                value={district}
                label={isTehsil ? "Tehsil" : "District"}
                onChange={handleDistrictChange}
                sx={{ bgcolor: "#fff", borderRadius: "8px" }}
              >
                <MenuItem value="">
                  <em>Please Select</em>
                </MenuItem>
                {districts.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Col>
          <Col xs={12} md={6} lg={4}>
            <FormControl fullWidth>
              <InputLabel id="service-select-label">Service</InputLabel>
              <Select
                labelId="service-select-label"
                value={service}
                label="Service"
                onChange={handleServiceChange}
                sx={{ bgcolor: "#fff", borderRadius: "8px" }}
              >
                <MenuItem value="">
                  <em>Please Select</em>
                </MenuItem>
                {services.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Col>
        </Row>

        <Row className="mb-5 justify-content-center">
          <Col xs="auto">
            <StyledButton
              variant="contained"
              onClick={handleGetReports}
              disabled={isButtonDisabled}
            >
              Generate Reports
            </StyledButton>
          </Col>
        </Row>

        {counts.total > 0 && (
          <Row className="mt-5 justify-content-center">
            <Col xs={12} sm={6} md={4} lg="2" className="mb-4">
              <StatCard
                sx={{ bgcolor: "#1976d2" }}
                onClick={() => handleCardClick("Total Applications")}
              >
                <CardContent sx={{ position: "relative", zIndex: 1, p: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: "0.9rem", md: "1rem" },
                    }}
                  >
                    Total Applications
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      mt: 1,
                      fontSize: { xs: "1.5rem", md: "2rem" },
                    }}
                  >
                    {counts.total}
                  </Typography>
                </CardContent>
              </StatCard>
            </Col>
            <Col xs={12} sm={6} md={4} lg="2" className="mb-4">
              <StatCard
                sx={{ bgcolor: "#ff9800" }}
                onClick={() => handleCardClick("Pending")}
              >
                <CardContent sx={{ position: "relative", zIndex: 1, p: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: "0.9rem", md: "1rem" },
                    }}
                  >
                    Pending
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      mt: 1,
                      fontSize: { xs: "1.5rem", md: "2rem" },
                    }}
                  >
                    {counts.pending}
                  </Typography>
                </CardContent>
              </StatCard>
            </Col>
            <Col xs={12} sm={6} md={4} lg="2" className="mb-4">
              <StatCard
                sx={{ bgcolor: "#9c27b0" }}
                onClick={() => handleCardClick("Citizen Pending")}
              >
                <CardContent sx={{ position: "relative", zIndex: 1, p: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: "0.9rem", md: "1rem" },
                    }}
                  >
                    Citizen Pending
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      mt: 1,
                      fontSize: { xs: "1.5rem", md: "2rem" },
                    }}
                  >
                    {counts.citizenPending}
                  </Typography>
                </CardContent>
              </StatCard>
            </Col>
            <Col xs={12} sm={6} md={4} lg="2" className="mb-4">
              <StatCard
                sx={{ bgcolor: "#f44336" }}
                onClick={() => handleCardClick("Rejected")}
              >
                <CardContent sx={{ position: "relative", zIndex: 1, p: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: "0.9rem", md: "1rem" },
                    }}
                  >
                    Rejected
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      mt: 1,
                      fontSize: { xs: "1.5rem", md: "2rem" },
                    }}
                  >
                    {counts.rejected}
                  </Typography>
                </CardContent>
              </StatCard>
            </Col>
            <Col xs={12} sm={6} md={4} lg="2" className="mb-4">
              <StatCard
                sx={{ bgcolor: "#4caf50" }}
                onClick={() => handleCardClick("Sanctioned")}
              >
                <CardContent sx={{ position: "relative", zIndex: 1, p: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: "0.9rem", md: "1rem" },
                    }}
                  >
                    Sanctioned
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      mt: 1,
                      fontSize: { xs: "1.5rem", md: "2rem" },
                    }}
                  >
                    {counts.sanctioned}
                  </Typography>
                </CardContent>
              </StatCard>
            </Col>
            <Col xs={12} lg={6} className="mb-4">
              <StyledCard>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ mb: 3, fontWeight: 600, color: "#2d3748" }}
                  >
                    Application Status Distribution
                  </Typography>
                  <Box sx={{ height: "350px" }}>
                    <Pie data={pieData} options={chartOptions} />
                  </Box>
                </CardContent>
              </StyledCard>
            </Col>
            <Col xs={12} lg={6} className="mb-4">
              <StyledCard>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ mb: 3, fontWeight: 600, color: "#2d3748" }}
                  >
                    Application Counts
                  </Typography>
                  <Box sx={{ height: "350px" }}>
                    <Bar data={barData} options={chartOptions} />
                  </Box>
                </CardContent>
              </StyledCard>
            </Col>
          </Row>
        )}

        {showTable && (
          <Row ref={tableRef} className="mt-5">
            <Col xs={12}>
              <StyledCard>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ mb: 3, fontWeight: 600, color: "#2d3748" }}
                  >
                    {selectedStatus} Applications
                  </Typography>
                  <ServerSideTable
                    key={`${district}-${service}-${selectedStatus}`}
                    url={`${API_BASE_URL}/Officer/GetApplicationsForReports`}
                    extraParams={extraParams}
                    sx={{
                      "& .MuiTable-root": {
                        background: "#ffffff",
                      },
                      "& .MuiTableCell-root": {
                        color: "#2d3748",
                        borderColor: "#e0e0e0",
                      },
                      "& .MuiButton-root": {
                        color: "#1976d2",
                      },
                    }}
                  />
                </CardContent>
              </StyledCard>
            </Col>
          </Row>
        )}
      </Container>
    </Box>
  );
}

import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  CircularProgress,
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
import axiosInstance from "../../axiosConfig";
import { Container } from "react-bootstrap";
import ServerSideTable from "../../components/ServerSideTable";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function Reports() {
  const [district, setDistrict] = useState("");
  const [service, setService] = useState("");
  const [districts, setDistricts] = useState([]);
  const [services, setServices] = useState([]);
  const [countList, setCountList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTehsil, setIsTehsil] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [statusType, setSatatusType] = useState("");
  const [showTable, setShowTable] = useState(false);

  const statustTypes = [
    { label: "In Progress", value: "pending" },
    { label: "Rejected", value: "rejected" },
    { label: "Sanctioned", value: "sanctioned" },
  ];

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

  const handleDistrictChange = (event) => {
    setDistrict(event.target.value);
    setShowTable(false); // hide table on change
    if (service && statusType) {
      setIsButtonDisabled(false);
    }
  };

  const handleServiceChange = (event) => {
    setService(event.target.value);
    setShowTable(false); // hide table on change
    if (district && statusType) {
      setIsButtonDisabled(false);
    }
  };

  const handleStatusTypeChange = (event) => {
    setSatatusType(event.target.value);
    setShowTable(false); // hide table on change
    if (district && service) {
      setIsButtonDisabled(false);
    }
  };

  const handleGetReports = async () => {
    setShowTable(true);
  };

  const extraParams = {
    AccessCode: district,
    ServiceId: service,
    StatusType: statusType,
  };

  if (loading && countList.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
          height: { xs: "100vh", lg: "70vh" },
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#f5f5f5",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error && countList.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
          height: { xs: "100vh", lg: "70vh" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#f5f5f5",
        }}
      >
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: { xs: "auto", lg: "100vh" },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: { xs: 2, md: 4 },
      }}
    >
      <Typography
        variant="h5"
        sx={{ mb: 4, fontWeight: "bold", color: "#333333" }}
      >
        Generate Reports
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          width: { xs: "100%", sm: "80%", md: "60%" },
          maxWidth: "600px",
          mb: 4,
        }}
      >
        <FormControl fullWidth>
          <InputLabel id="district-select-label">
            {isTehsil ? "Tehsil" : "District"}
          </InputLabel>
          <Select
            labelId="district-select-label"
            value={district}
            label="District"
            onChange={handleDistrictChange}
          >
            <MenuItem value="">
              <em>Please Select </em>
            </MenuItem>
            {districts.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="service-select-label">Service</InputLabel>
          <Select
            labelId="service-select-label"
            value={service}
            label="Service"
            onChange={handleServiceChange}
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

        <FormControl fullWidth>
          <InputLabel id="status-type-label">Status</InputLabel>
          <Select
            labelId="status-type-label"
            value={statusType}
            label="statusType"
            onChange={handleStatusTypeChange}
          >
            <MenuItem value="">
              <em>Please Select</em>
            </MenuItem>
            {statustTypes.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={handleGetReports}
        disabled={isButtonDisabled}
        sx={{
          mb: 4,
          px: 4,
          py: 1.5,
          fontSize: "1rem",
          fontWeight: "bold",
          borderRadius: "8px",
          textTransform: "none",
          bgcolor: isButtonDisabled ? "#cccccc" : "#1976d2",
          "&:hover": {
            bgcolor: isButtonDisabled ? "#cccccc" : "#1565c0",
          },
        }}
      >
        Get Reports
      </Button>

      {showTable && (
        <Container>
          <ServerSideTable
            key={`${service}-${statusType}-${district}`}
            url="/Officer/GetApplicationsForReports"
            extraParams={extraParams}
          />
        </Container>
      )}
    </Box>
  );
}

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

  const API_BASE_URL = "http://127.0.0.1:5004";

  // Fetch districts and services
  useEffect(() => {
    const fetchDropdowns = async () => {
      setLoading(true);
      setError(null);
      try {
        const [districtsRes, servicesRes] = await Promise.all([
          axiosInstance.get(`${API_BASE_URL}/Base/GetDistricts`),
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

  const handleGetReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (district) params.append("DistrictId", district);
      if (service) params.append("ServiceId", service);

      const response = await axiosInstance.get(
        `${API_BASE_URL}/Base/GetApplicationsCount?${params.toString()}`
      );

      if (response.data && response.data.countList) {
        setCountList(response.data.countList);
      } else {
        throw new Error("Invalid response from GetApplicationsCount");
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

  const chartData = {
    labels: countList.map((item) => item.label),
    datasets: [
      {
        label: "Application Counts",
        data: countList.map((item) => item.count),
        backgroundColor: countList.map((item) => item.bgColor),
        borderColor: countList.map((item) => item.textColor),
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Applications",
        },
      },
    },
  };

  const pieChartData = {
    labels: countList
      .filter((item) => item.label !== "Total Applications")
      .map((item) => item.label),
    datasets: [
      {
        label: "Application Counts",
        data: countList
          .filter((item) => item.label !== "Total Applications")
          .map((item) => item.count),
        backgroundColor: countList
          .filter((item) => item.label !== "Total Applications")
          .map((item) => item.bgColor),
        borderColor: countList
          .filter((item) => item.label !== "Total Applications")
          .map((item) => item.textColor),
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "right" },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw}`,
        },
      },
    },
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
        minHeight: "100vh",
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

      {countList.length > 0 && (
        <Box
          sx={{
            width: { xs: "100%", md: "50%" },
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
          }}
        >
          <Box
            sx={{
              flex: 1,
              bgcolor: "#fff",
              p: 2,
              borderRadius: "8px",
              boxShadow: 20,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
              Application Status Counts
            </Typography>
            <Bar
              data={chartData}
              options={barOptions}
              width={500}
              height={500}
            />
          </Box>

          <Box
            sx={{
              flex: 1,
              bgcolor: "#fff",
              p: 2,
              borderRadius: "8px",
              boxShadow: 20,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
              Status Distribution
            </Typography>
            <Pie
              data={pieChartData}
              options={pieOptions}
              width={500}
              height={500}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}

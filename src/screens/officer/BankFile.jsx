import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";
import { Container } from "react-bootstrap";
import ServerSideTable from "../../components/ServerSideTable";
import axiosInstance from "../../axiosConfig";
import connection, {
  startSignalRConnection,
} from "../../assets/signalRService";
import SftpModal from "../../components/SftpModal";

export default function BankFile() {
  const [district, setDistrict] = useState("");
  const [service, setService] = useState("");
  const [districts, setDistricts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTehsil, setIsTehsil] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [showTable, setShowTable] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);

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

    // SignalR setup
    startSignalRConnection();
    connection.on("ReceiveProgress", (progress) => {
      console.log("Progress update:", progress);
      setProgress(progress);
    });

    connection.onreconnecting((error) => {
      console.log("SignalR reconnecting due to error:", error);
    });

    connection.onreconnected((connectionId) => {
      console.log("SignalR reconnected. Connection ID:", connectionId);
    });

    return () => {
      connection.off("ReceiveProgress");
    };
  }, []);

  const handleDistrictChange = (event) => {
    setDistrict(event.target.value);
    setShowTable(false);
    if (service) {
      setIsButtonDisabled(false);
    }
  };

  const handleServiceChange = (event) => {
    setService(event.target.value);
    setShowTable(false);
    if (district) {
      setIsButtonDisabled(false);
    }
  };

  const handleGetTable = async () => {
    setShowTable(true);
  };

  const handleCreateBankFile = async () => {
    try {
      setProgress(0);
      await axiosInstance.post(`${API_BASE_URL}/Officer/CreateBankFile`, {
        DistrictId: district,
        ServiceId: service,
      });
      setShowTable(true);
    } catch (error) {
      console.error("Error creating bank file:", error);
      toast.error(`Error creating bank file: ${error.message}`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleCheckRecords = async () => {
    
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const extraParams = {
    ServiceId: service,
    DistrictId: district,
  };

  if (loading) {
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

  if (error) {
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
        Bank File Management
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
            label={isTehsil ? "Tehsil" : "District"}
            onChange={handleDistrictChange}
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

      <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleGetTable}
          disabled={isButtonDisabled}
          sx={{
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
          Check Records
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateBankFile}
          disabled={isButtonDisabled}
          sx={{
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
          Create Bank File
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpen}
          disabled={isButtonDisabled}
          sx={{
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
          Send Bank File
        </Button>
      </Box>

      {progress > 0 && (
        <Box sx={{ width: "60%", maxWidth: "600px", mb: 4 }}>
          <Typography>Progress: {progress}%</Typography>
          <progress value={progress} max="100" style={{ width: "100%" }} />
        </Box>
      )}

      {showTable && (
        <Container>
          <ServerSideTable
            key={`${service}-${district}`}
            url="/Officer/VerifyBankFileAndRecords"
            extraParams={extraParams}
          />
        </Container>
      )}

      <SftpModal
        open={open}
        handleClose={handleClose}
        serviceId={service}
        districtId={district}
        type={"send"}
      />
    </Box>
  );
}

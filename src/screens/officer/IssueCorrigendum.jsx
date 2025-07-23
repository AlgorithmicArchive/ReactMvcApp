import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
  MenuItem,
  Select,
  IconButton,
  FormControl,
  InputLabel,
} from "@mui/material";
import { styled } from "@mui/system";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ServiceSelectionForm from "../../components/ServiceSelectionForm";
import { fetchServiceList } from "../../assets/fetch";
import axiosInstance from "../../axiosConfig";

// Styled components for vibrant design
const StyledContainer = styled(Container)({
  background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
  padding: "32px",
  borderRadius: "16px",
  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.15)",
  maxWidth: "800px",
  marginTop: "40px",
});

const StyledButton = styled(Button)({
  background: "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
  color: "#fff",
  fontWeight: "600",
  padding: "12px 24px",
  borderRadius: "8px",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 15px rgba(25, 118, 210, 0.4)",
  },
});

const StyledFormControl = styled(FormControl)({
  minWidth: "250px",
  "& .MuiInputBase-root": {
    borderRadius: "8px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
});

export default function IssueCorrigendum() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serviceId, setServiceId] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [canIssue, setCanIssue] = useState(false);
  const [applicantDetails, setApplicantDetails] = useState([]);
  const [corrigendumFields, setCorrigendumFields] = useState([]);
  const [selectedField, setSelectedField] = useState("");

  // Fetch services on component mount
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        await fetchServiceList(setServices);
      } catch (error) {
        toast.error("Failed to load services. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Check if corrigendum can be issued
  const handleCheckIfCorrigendum = async () => {
    if (!referenceNumber || !serviceId) {
      toast.warning("Please provide both reference number and service.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get(
        "/Officer/GetApplicationForCorrigendum",
        {
          params: { referenceNumber, serviceId },
        }
      );
      const result = response.data;

      if (result.status) {
        // Filter out Applicant Image as it shouldn't be editable
        const filteredDetails = (result.applicantDetails || []).filter(
          (item) => item.name !== "ApplicantImage"
        );
        console.log(filteredDetails);
        setCanIssue(true);
        setApplicantDetails(filteredDetails);
        toast.success("Application found. You can issue a corrigendum.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      } else {
        setCanIssue(false);
        toast.error(result.message, {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    } catch (error) {
      toast.error("Error checking application. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a corrigendum field
  const handleAddCorrigendumField = () => {
    if (!selectedField) {
      toast.warning("Please select a field to add.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    const [label, name] = selectedField.split("|");
    const existing = corrigendumFields.find((f) => f.name === name);
    if (existing) {
      toast.warning("This field is already added.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    const selected = applicantDetails.find(
      (item) => item.name === name && item.label === label
    );
    if (!selected) return;

    setCorrigendumFields((prev) => [
      ...prev,
      {
        label: selected.label,
        name: selected.name,
        oldValue: selected.value,
        newValue: "",
      },
    ]);
    setSelectedField("");
  };

  // Update new value for a corrigendum field
  const handleNewValueChange = (index, value) => {
    const updated = [...corrigendumFields];
    updated[index].newValue = value;
    setCorrigendumFields(updated);
  };

  // Remove a corrigendum field
  const handleRemoveCorrigendumField = (index) => {
    const updated = [...corrigendumFields];
    updated.splice(index, 1);
    setCorrigendumFields(updated);
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
          bgcolor: "#f0f4f8",
        }}
      >
        <CircularProgress size={60} sx={{ color: "#1976d2" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        background: "linear-gradient(to bottom, #1a1a2e 0%, #16213e 100%)",
        padding: "40px",
      }}
    >
      <StyledContainer>
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            fontWeight: "700",
            color: "#1976d2",
            mb: 4,
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          Issue Corrigendum
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <ServiceSelectionForm
            services={services}
            onServiceSelect={setServiceId}
          />

          <TextField
            name="referenceNumber"
            label="Reference Number"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            sx={{
              width: "100%",
              maxWidth: "400px",
              "& .MuiInputBase-root": {
                borderRadius: "8px",
                backgroundColor: "#fff",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              },
            }}
          />

          <StyledButton onClick={handleCheckIfCorrigendum} disabled={loading}>
            Check Application
          </StyledButton>
        </Box>

        {canIssue && (
          <Box sx={{ mt: 6 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "600", color: "#333", mb: 3 }}
            >
              Corrigendum Fields
            </Typography>

            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 3 }}>
              <StyledFormControl>
                <InputLabel>Select a field to change</InputLabel>
                <Select
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value)}
                  label="Select a field to change"
                >
                  <MenuItem value="" disabled>
                    Select a field
                  </MenuItem>
                  {applicantDetails.map((item) => (
                    <MenuItem
                      key={`${item.label}|${item.name}`}
                      value={`${item.label}|${item.name}`}
                    >
                      {item.label}
                    </MenuItem>
                  ))}
                </Select>
              </StyledFormControl>
              <StyledButton
                variant="outlined"
                onClick={handleAddCorrigendumField}
              >
                Add Field
              </StyledButton>
            </Box>

            {corrigendumFields.map((field, index) => (
              <Box
                key={`${field.name}-${index}`}
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  mb: 2,
                  backgroundColor: "#f9f9f9",
                  padding: "12px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                }}
              >
                <TextField
                  label="Label"
                  value={field.label}
                  InputProps={{ readOnly: true }}
                  sx={{ minWidth: 200 }}
                />
                <TextField
                  label="Old Value"
                  value={field.oldValue}
                  InputProps={{ readOnly: true }}
                  sx={{ minWidth: 200 }}
                />
                <TextField
                  label="New Value"
                  value={field.newValue}
                  onChange={(e) => handleNewValueChange(index, e.target.value)}
                  sx={{ minWidth: 200 }}
                />
                <IconButton
                  color="error"
                  onClick={() => handleRemoveCorrigendumField(index)}
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(211, 47, 47, 0.1)",
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </StyledContainer>
      <ToastContainer />
    </Box>
  );
}

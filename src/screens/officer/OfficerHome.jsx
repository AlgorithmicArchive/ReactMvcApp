import React, { useEffect, useState, useRef } from "react";
import {
  fetchServiceList,
  fetchCertificateDetails,
  fetchCertificates,
} from "../../assets/fetch";
import ServiceSelectionForm from "../../components/ServiceSelectionForm";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  TextField,
  Typography,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import { useForm } from "react-hook-form";
import axiosInstance from "../../axiosConfig";
import { Container, Row, Col } from "react-bootstrap";
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
import ServerSideTable from "../../components/ServerSideTable";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BasicModal from "../../components/BasicModal";
import styled from "@emotion/styled";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

// Styled components for Reports-like design
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
  color: #ffffff;
  &:hover {
    background: linear-gradient(45deg, #1565c0, #1976d2);
    transform: scale(1.05);
  }
  &:disabled {
    background: #cccccc;
    color: #666666;
  }
`;

const StyledDialog = styled(Dialog)`
  & .MuiDialog-paper {
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    background: #ffffff;
    padding: 16px;
    max-width: 500px;
  }
`;

export default function OfficerHome() {
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState("");
  const [countList, setCountList] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    forwarded: 0,
    citizenPending: 0,
    rejected: 0,
    sanctioned: 0,
  });
  const [canSanction, setCanSanction] = useState(false);
  const [canHavePool, setCanHavePool] = useState(false);
  const [type, setType] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [selectedAction, setSelectedAction] = useState("Reject");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false);
  const [pendingRejectRows, setPendingRejectRows] = useState([]);
  const [pin, setPin] = useState("");
  const [storedPin, setStoredPin] = useState(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfBlob, setPdfBlob] = useState(null);
  const [isSignedPdf, setIsSignedPdf] = useState(false);
  const [currentApplicationId, setCurrentApplicationId] = useState("");
  const [pendingIds, setPendingIds] = useState([]);
  const [currentIdIndex, setCurrentIdIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [officerRole, setOfficerRole] = useState("");
  const [officerArea, setOfficerArea] = useState("");

  const tableRef = useRef(null);

  const {
    control,
    formState: { errors },
    reset,
  } = useForm();

  const navigate = useNavigate();

  const fetchCertificates = async (pin) => {
    const formData = new FormData();
    formData.append("pin", pin);
    const response = await fetch("http://localhost:8000/certificates", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  };

  // Validate PDF blob
  const isValidPdf = async (blob) => {
    try {
      if (blob.type !== "application/pdf") {
        console.error("Invalid MIME type:", blob.type);
        return false;
      }
      const arrayBuffer = await blob.slice(0, 4).arrayBuffer();
      const header = new Uint8Array(arrayBuffer);
      const pdfHeader = [37, 80, 68, 70]; // %PDF
      return header.every((byte, i) => byte === pdfHeader[i]);
    } catch (error) {
      console.error("Error validating PDF blob:", error);
      return false;
    }
  };

  // Fetch application counts
  const handleRecords = async (serviceId) => {
    setLoading(true);
    setError(null);
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

      const newCounts = {
        total:
          response.data.countList.find(
            (item) => item.label === "Total Applications"
          )?.count || 0,
        pending:
          response.data.countList.find((item) => item.label === "Pending")
            ?.count || 0,
        forwarded:
          response.data.countList.find((item) => item.label === "Forwarded")
            ?.count || 0,
        citizenPending:
          response.data.countList.find(
            (item) => item.label === "Citizen Pending"
          )?.count || 0,
        rejected:
          response.data.countList.find((item) => item.label === "Rejected")
            ?.count || 0,
        sanctioned:
          response.data.countList.find((item) => item.label === "Sanctioned")
            ?.count || 0,
      };
      setCounts(newCounts);
    } catch (error) {
      setError("Failed to fetch application counts.");
      toast.error("Failed to load application counts. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle card click
  const handleCardClick = async (statusName) => {
    setType(
      statusName === "Citizen Pending"
        ? "returntoedit"
        : statusName === "Shifted To Another Location"
        ? "shifted"
        : statusName.toLowerCase()
    );
    setShowTable(true);
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Action functions for row actions
  const actionFunctions = {
    handleOpenApplication: (row) => {
      const userdata = row.original;
      navigate("/officer/userDetails", {
        state: { applicationId: userdata.referenceNumber, notaction: false },
      });
    },
    handleViewApplication: (row) => {
      const data = row.original;
      navigate("/officer/userDetails", {
        state: { applicationId: data.referenceNumber, notaction: true },
      });
    },
    pullApplication: async (row) => {
      const data = row.original;
      try {
        const response = await axiosInstance.get("/Officer/PullApplication", {
          params: { applicationId: data.referenceNumber },
        });
        if (response.data.status) {
          toast.success("Successfully pulled application!", {
            position: "top-right",
            autoClose: 2000,
            theme: "colored",
          });
          window.location.reload();
        }
      } catch (error) {
        toast.error("Failed to pull application. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    },
  };

  // Handle Push to Pool
  const handlePushToPool = async (selectedRows) => {
    if (selectedRows.length === 0) {
      toast.error("No applications selected.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    const selectedData = selectedRows.map(
      (row) => row.original.referenceNumber
    );
    const list = JSON.stringify(selectedData);

    try {
      const response = await axiosInstance.get("/Officer/UpdatePool", {
        params: {
          serviceId: serviceId,
          list: list,
        },
      });
      toast.success("Successfully pushed to pool!", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });
      handleRecords(serviceId);
    } catch (error) {
      toast.error("Failed to push to pool. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  // Sign PDF
  async function signPdf(pdfBlob, pin) {
    const formData = new FormData();
    formData.append("pdf", pdfBlob, "document.pdf");
    formData.append("pin", pin);
    formData.append(
      "original_path",
      currentApplicationId.replace(/\//g, "_") + "SanctionLetter.pdf"
    );
    try {
      console.log("Sending PDF to sign:", {
        pdfSize: pdfBlob.size,
        pdfType: pdfBlob.type,
        original_path:
          currentApplicationId.replace(/\//g, "_") + "SanctionLetter.pdf",
      });
      const response = await fetch("http://localhost:8000/sign", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Signing failed: ${errorText}`);
      }
      return await response.blob();
    } catch (error) {
      throw new Error(
        "Error signing PDF: " +
          error.message +
          " Check if Desktop App is started."
      );
    }
  }

  // Handle modal close
  const handleModalClose = () => {
    setPdfModalOpen(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl("");
    setPdfBlob(null);
    setIsSignedPdf(false);
  };

  // Process single ID
  const processSingleId = async (id) => {
    setCurrentApplicationId(id);
    const formData = new FormData();
    formData.append("applicationId", id);
    formData.append("defaultAction", selectedAction);
    formData.append(
      "Remarks",
      selectedAction === "Sanction" ? "Sanctioned" : "Rejected"
    );

    try {
      const { data: result } = await axiosInstance.post(
        "/Officer/HandleAction",
        formData
      );
      if (!result.status) {
        throw new Error(result.response || "Something went wrong");
      }

      if (selectedAction === "Sanction") {
        // Fetch PDF from GetSanctionLetter
        const pdfResponse = await axiosInstance.get(
          "/Officer/GetSanctionLetter",
          {
            params: { applicationId: id },
          }
        );
        if (!pdfResponse.data.status || !pdfResponse.data.path) {
          throw new Error(
            pdfResponse.data.response || "Failed to fetch sanction letter"
          );
        }
        const fetchResponse = await fetch(pdfResponse.data.path, {
          headers: { Accept: "application/pdf" },
        });
        if (!fetchResponse.ok) {
          throw new Error(`Failed to fetch PDF: ${fetchResponse.statusText}`);
        }
        const contentType = fetchResponse.headers.get("content-type");
        if (!contentType.includes("application/pdf")) {
          throw new Error(`Invalid content type: ${contentType}`);
        }
        const newPdfBlob = await fetchResponse.blob();
        const isValid = await isValidPdf(newPdfBlob);
        if (!isValid) {
          throw new Error("Invalid PDF structure detected");
        }
        console.log(
          "PDF fetched:",
          pdfResponse.data.path,
          "Size:",
          newPdfBlob.size
        );
        if (pdfUrl) {
          URL.revokeObjectURL(pdfUrl);
        }
        const blobUrl = URL.createObjectURL(newPdfBlob);
        setPdfBlob(newPdfBlob);
        setPdfUrl(blobUrl);
        setIsSignedPdf(false);
        setPdfModalOpen(true);
      } else {
        try {
          await axiosInstance.get("/Officer/RemoveFromPool", {
            params: {
              ServiceId: serviceId,
              itemToRemove: id,
            },
          });
          toast.success("Application rejected and removed from pool!", {
            position: "top-right",
            autoClose: 2000,
            theme: "colored",
          });
        } catch (error) {
          toast.error("Failed to remove application from pool.", {
            position: "top-right",
            autoClose: 3000,
            theme: "colored",
          });
        }

        const nextIndex = currentIdIndex + 1;
        if (nextIndex < pendingIds.length) {
          setCurrentIdIndex(nextIndex);
          await new Promise((resolve) => setTimeout(resolve, 500));
          await processSingleId(pendingIds[nextIndex]);
        } else {
          setPendingIds([]);
          setCurrentIdIndex(0);
          setCurrentApplicationId("");
          handleRecords(serviceId);
        }
      }
    } catch (error) {
      console.error(
        `Error processing ${selectedAction.toLowerCase()} for ID ${id}:`,
        error
      );
      toast.error(
        `Error processing ${selectedAction.toLowerCase()} request: ${
          error.message
        }`,
        {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        }
      );
    }
  };

  // Sign and update PDF
  const signAndUpdatePdf = async (pinToUse) => {
    try {
      if (!pdfBlob) {
        throw new Error("No PDF blob available for signing");
      }
      const isValid = await isValidPdf(pdfBlob);
      if (!isValid) {
        throw new Error("Invalid PDF structure detected");
      }
      // Validate certificate
      const certDetails = await fetchCertificateDetails();
      if (!certDetails) {
        throw new Error("No registered DSC found");
      }
      const certificates = await fetchCertificates(pinToUse);
      if (!certificates || certificates.length === 0) {
        throw new Error("No certificates found on the USB token");
      }
      const selectedCertificate = certificates[0];
      const expiration = new Date(certDetails.expirationDate);
      const now = new Date();
      const tokenSerial = selectedCertificate.serial_number
        ?.toString()
        .replace(/\s+/g, "")
        .toUpperCase();
      const registeredSerial = certDetails.serial_number
        ?.toString()
        .replace(/\s+/g, "")
        .toUpperCase();
      if (tokenSerial !== registeredSerial) {
        throw new Error("Not the registered certificate");
      }
      if (expiration < now) {
        throw new Error("The registered certificate has expired");
      }

      const signedBlob = await signPdf(pdfBlob, pinToUse);
      const updateFormData = new FormData();
      updateFormData.append("signedPdf", signedBlob, "signed.pdf");
      updateFormData.append("applicationId", currentApplicationId);
      const updateResponse = await axiosInstance.post(
        "/Officer/UpdatePdf",
        updateFormData
      );
      if (!updateResponse.data.status) {
        throw new Error(
          "Failed to update PDF on server: " +
            (updateResponse.data.response || "Unknown error")
        );
      }

      try {
        await axiosInstance.get("/Officer/RemoveFromPool", {
          params: {
            ServiceId: serviceId,
            itemToRemove: currentApplicationId,
          },
        });
        toast.success("Application sanctioned and removed from pool!", {
          position: "top-right",
          autoClose: 2000,
          theme: "colored",
        });
      } catch (error) {
        toast.error("Failed to remove application from pool.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }

      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      const blobUrl = URL.createObjectURL(signedBlob);
      setPdfUrl(blobUrl);
      setPdfBlob(null);
      setIsSignedPdf(true);
      toast.success("PDF signed successfully!", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });

      const nextIndex = currentIdIndex + 1;
      if (nextIndex < pendingIds.length) {
        setCurrentIdIndex(nextIndex);
        await new Promise((resolve) => setTimeout(resolve, 500));
        await processSingleId(pendingIds[nextIndex]);
      } else {
        setPendingIds([]);
        setCurrentIdIndex(0);
        setCurrentApplicationId("");
        handleRecords(serviceId);
      }
    } catch (error) {
      console.error("Error in signAndUpdatePdf:", error);
      toast.error("Error signing PDF: " + error.message, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      throw error;
    }
  };

  // Handle PIN submission
  const handlePinSubmit = async () => {
    if (!pin) {
      toast.error("Please enter the USB token PIN.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }
    try {
      await signAndUpdatePdf(pin);
      setStoredPin(pin);
    } catch (error) {
      // Error handled in signAndUpdatePdf
    } finally {
      setConfirmOpen(false);
      setPin("");
    }
  };

  // Handle Sign PDF button click
  const handleSignPdf = async () => {
    if (storedPin) {
      try {
        await signAndUpdatePdf(storedPin);
      } catch (error) {
        setStoredPin(null);
        toast.error("Signing failed with stored PIN. Please enter PIN again.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
        setConfirmOpen(true);
      }
    } else {
      setConfirmOpen(true);
    }
  };

  // Handle Reject confirmation
  const handleRejectConfirm = async () => {
    setRejectConfirmOpen(false);
    await handleExecuteAction(pendingRejectRows);
  };

  // Handle bulk action execution
  const handleExecuteAction = async (selectedRows) => {
    if (!selectedRows || selectedRows.length === 0) {
      toast.error("No applications selected.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }
    const ids = selectedRows.map((item) => item.original.referenceNumber);
    if (selectedAction === "Reject" && canHavePool && type === "pool") {
      setPendingRejectRows(selectedRows);
      setRejectConfirmOpen(true);
    } else {
      setPendingIds(ids);
      setCurrentIdIndex(0);
      await processSingleId(ids[0]);
    }
  };

  // Get action options for bulk action dropdown
  const getActionOptions = () => {
    const options = [{ value: "Reject", label: "Reject" }];
    if (canSanction) {
      options.push({ value: "Sanction", label: "Sanction" });
    }
    return options;
  };

  // Chart data
  const barData = {
    labels: [
      "Total",
      "Pending",
      "Forwarded",
      "Citizen Pending",
      "Rejected",
      "Sanctioned",
    ],
    datasets: [
      {
        label: "Applications",
        data: [
          counts.total,
          counts.pending,
          counts.forwarded,
          counts.citizenPending,
          counts.rejected,
          counts.sanctioned,
        ],
        backgroundColor: [
          "#1976d2",
          "#ff9800",
          "#1976d2",
          "#9c27b0",
          "#f44336",
          "#4caf50",
        ],
        borderColor: ["#1565c0", "#f57c00", "#7b1fa2", "#d32f2f", "#388e3c"],
        borderWidth: 0,
      },
    ],
  };

  const pieData = {
    labels: [
      "Pending",
      "Forwarded",
      "Citizen Pending",
      "Rejected",
      "Sanctioned",
    ],
    datasets: [
      {
        data: [
          counts.pending,
          counts.forwarded,
          counts.citizenPending,
          counts.rejected,
          counts.sanctioned,
        ],
        backgroundColor: [
          "#ff9800",
          "#1976d2",
          "#9c27b0",
          "#f44336",
          "#4caf50",
        ],
        borderColor: ["#fff", "#fff", "#fff", "#fff", "#fff"],
        borderWidth: 0,
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
    ServiceId: serviceId,
    type: type,
  };

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchServiceList(setServices, setOfficerRole, setOfficerArea);
      } catch (error) {
        setError("Failed to load services.");
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

  // Color mapping for status cards
  const statusColors = {
    "Total Applications": "#1976d2",
    Pending: "#ff9800",
    "Citizen Pending": "#9c27b0",
    Rejected: "#f44336",
    Sanctioned: "#4caf50",
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
        {officerRole} {officerArea}
      </Typography>

      <Container>
        <Row className="mb-5 justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <StyledCard>
              <CardContent>
                <ServiceSelectionForm
                  services={services}
                  errors={errors}
                  onServiceSelect={handleRecords}
                  sx={{
                    "& .MuiFormControl-root": {
                      bgcolor: "#ffffff",
                      borderRadius: "8px",
                    },
                  }}
                />
              </CardContent>
            </StyledCard>
          </Col>
        </Row>

        {counts && (
          <Row className="mb-5 justify-content-center">
            {countList.map((item, index) => (
              <Col key={index} xs={12} sm={6} md={4} lg={2} className="mb-4">
                <StatCard
                  sx={{ bgcolor: statusColors[item.label] || "#1976d2" }}
                  onClick={() => handleCardClick(item.label)}
                >
                  <CardContent sx={{ position: "relative", zIndex: 1, p: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: "0.9rem", md: "1rem" },
                      }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        mt: 1,
                        fontSize: { xs: "1.5rem", md: "2rem" },
                      }}
                    >
                      {item.count}
                    </Typography>
                  </CardContent>
                </StatCard>
              </Col>
            ))}
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
                    {type} Applications
                  </Typography>
                  <ServerSideTable
                    key={`${serviceId}-${type}`}
                    url="/Officer/GetApplications"
                    extraParams={extraParams}
                    actionFunctions={actionFunctions}
                    canSanction={canSanction}
                    canHavePool={canHavePool}
                    pendingApplications={type === "pending"}
                    serviceId={serviceId}
                    onPushToPool={handlePushToPool}
                    onExecuteAction={handleExecuteAction}
                    actionOptions={getActionOptions()}
                    selectedAction={selectedAction}
                    setSelectedAction={setSelectedAction}
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

      <StyledDialog
        open={rejectConfirmOpen}
        onClose={() => {
          setRejectConfirmOpen(false);
          setPendingRejectRows([]);
          handleRecords(serviceId);
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            color: "#2d3748",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Confirm Reject Action
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{ mb: 2, color: "#2d3748", fontFamily: "'Inter', sans-serif" }}
          >
            Are you sure you want to reject {pendingRejectRows.length} selected
            application{pendingRejectRows.length > 1 ? "s" : ""}? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <StyledButton
            onClick={() => {
              setRejectConfirmOpen(false);
              setPendingRejectRows([]);
              handleRecords(serviceId);
            }}
            aria-label="Cancel"
          >
            Cancel
          </StyledButton>
          <StyledButton
            onClick={handleRejectConfirm}
            aria-label="Confirm Reject"
            sx={{
              background: "linear-gradient(45deg, #d32f2f, #f44336)",
              "&:hover": {
                background: "linear-gradient(45deg, #b71c1c, #d32f2f)",
              },
            }}
          >
            Confirm Reject
          </StyledButton>
        </DialogActions>
      </StyledDialog>

      <StyledDialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle
          sx={{
            fontWeight: 600,
            color: "#2d3748",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Enter USB Token PIN
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{ mb: 2, color: "#2d3748", fontFamily: "'Inter', sans-serif" }}
          >
            Please enter the PIN for your USB token to sign the document.
          </Typography>
          <TextField
            type="password"
            label="USB Token PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            fullWidth
            margin="normal"
            aria-label="USB Token PIN"
            inputProps={{ "aria-describedby": "pin-helper-text" }}
            sx={{
              bgcolor: "#ffffff",
              borderRadius: "8px",
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#e0e0e0" },
                "&:hover fieldset": { borderColor: "#1976d2" },
              },
            }}
          />
          <FormHelperText id="pin-helper-text">
            Required to sign the document.
          </FormHelperText>
        </DialogContent>
        <DialogActions>
          <StyledButton
            onClick={() => setConfirmOpen(false)}
            aria-label="Cancel"
          >
            Cancel
          </StyledButton>
          <StyledButton
            onClick={handlePinSubmit}
            disabled={!pin}
            aria-label="Submit PIN"
          >
            Submit
          </StyledButton>
        </DialogActions>
      </StyledDialog>

      <BasicModal
        open={pdfModalOpen}
        handleClose={handleModalClose}
        handleActionButton={!isSignedPdf ? handleSignPdf : null}
        buttonText={!isSignedPdf ? "Sign PDF" : null}
        Title={isSignedPdf ? "Signed Document" : "Document Preview"}
        pdf={pdfUrl}
        sx={{
          "& .MuiDialog-paper": {
            width: { xs: "90%", md: "80%" },
            maxWidth: 800,
            height: "80vh",
            borderRadius: 12,
            background: "#ffffff",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          },
        }}
      />
    </Box>
  );
}

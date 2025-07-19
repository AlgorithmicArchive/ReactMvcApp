import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { fetchServiceList, fetchCertificateDetails } from "../../assets/fetch";
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
import debounce from "lodash/debounce";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

// Styled components
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
  const [selectedAction, setSelectedAction] = useState("Sanction");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false);
  const [pullConfirmOpen, setPullConfirmOpen] = useState(false);
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
  const [lastServiceId, setLastServiceId] = useState("");
  const [tableKey, setTableKey] = useState(0); // Added to force table re-render
  const [pendingFormData, setPendingFormData] = useState(null);
  const [pullRow, setPullRow] = useState({});

  const tableRef = useRef(null);
  const tableInstanceRef = useRef(null);
  const navigate = useNavigate();
  const {
    control,
    formState: { errors },
    reset,
  } = useForm();

  // Debounced handleRecords with cleanup
  const debouncedHandleRecords = useCallback(
    debounce(async (newServiceId) => {
      if (!newServiceId || newServiceId === lastServiceId) return;
      setLoading(true);
      setError(null);
      try {
        setServiceId(newServiceId);
        setLastServiceId(newServiceId);
        const response = await axiosInstance.get(
          "/Officer/GetApplicationsCount",
          {
            params: { ServiceId: newServiceId },
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
    }, 500),
    [lastServiceId]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedHandleRecords.cancel();
    };
  }, [debouncedHandleRecords]);

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

  const isValidPdf = async (blob) => {
    try {
      if (blob.type !== "application/pdf") return false;
      const arrayBuffer = await blob.slice(0, 4).arrayBuffer();
      const header = new Uint8Array(arrayBuffer);
      const pdfHeader = [37, 80, 68, 70]; // %PDF
      return header.every((byte, i) => byte === pdfHeader[i]);
    } catch (error) {
      console.error("Error validating PDF blob:", error);
      return false;
    }
  };

  const handleCardClick = useCallback((statusName) => {
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
  }, []);

  const refreshTable = useCallback(() => {
    if (
      tableInstanceRef.current &&
      typeof tableInstanceRef.current.refetch === "function"
    ) {
      tableInstanceRef.current.refetch();
    }
    setTableKey((prev) => prev + 1); // Force table re-render
  }, []);

  const actionFunctions = useMemo(
    () => ({
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
        setPullRow(row.original);
        setPullConfirmOpen(true);
      },
    }),
    [navigate, serviceId, debouncedHandleRecords, refreshTable]
  );

  const handlePushToPool = useCallback(
    async (selectedRows) => {
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
          params: { serviceId: serviceId, list: list },
        });
        toast.success("Successfully pushed to pool!", {
          position: "top-right",
          autoClose: 2000,
          theme: "colored",
        });
        refreshTable();
        if (serviceId) debouncedHandleRecords(serviceId);
      } catch (error) {
        toast.error("Failed to push to pool. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    },
    [serviceId, debouncedHandleRecords, refreshTable]
  );

  const signPdf = async (pdfBlob, pin) => {
    const formData = new FormData();
    formData.append("pdf", pdfBlob, "document.pdf");
    formData.append("pin", pin);
    formData.append(
      "original_path",
      currentApplicationId.replace(/\//g, "_") + "SanctionLetter.pdf"
    );
    try {
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
  };

  const handleModalClose = useCallback(() => {
    setPdfModalOpen(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl("");
    setPdfBlob(null);
    setIsSignedPdf(false);
  }, [pdfUrl]);

  const processSingleId = useCallback(
    async (id, index, totalIds) => {
      setCurrentApplicationId(id);
      const formData = new FormData();
      formData.append("applicationId", id);
      formData.append("defaultAction", selectedAction);
      formData.append(
        "Remarks",
        selectedAction === "Sanction"
          ? "Sanctioned"
          : selectedAction === "Reject"
          ? "Rejected"
          : "Returned to Inbox"
      );

      let hasError = false;

      try {
        if (selectedAction === "toInbox") {
          const response = await axiosInstance.get("/Officer/RemoveFromPool", {
            params: { ServiceId: serviceId, itemToRemove: id },
          });
          if (!response.data.status) {
            throw new Error(
              response.data.message || "Failed to remove from pool."
            );
          }
        } else if (selectedAction === "Sanction") {
          // Fetch sanction letter first
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
          const fetchResponse = await fetch(`${pdfResponse.data.path}`, {
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
          if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
          }
          const blobUrl = URL.createObjectURL(newPdfBlob);
          setPdfBlob(newPdfBlob);
          setPdfUrl(blobUrl);
          setIsSignedPdf(false);
          setPdfModalOpen(true);
          // Store formData for use after signing
          setPendingFormData(formData);
          return false; // Pause processing for Sanction
        } else {
          const { data: result } = await axiosInstance.post(
            "/Officer/HandleAction",
            formData
          );
          if (!result.status) {
            throw new Error(result.response || "Something went wrong");
          }
          try {
            await axiosInstance.get("/Officer/RemoveFromPool", {
              params: { ServiceId: serviceId, itemToRemove: id },
            });
          } catch (error) {
            toast.error(
              `Failed to remove application ${id} from pool: ${error.message}`,
              {
                position: "top-right",
                autoClose: 3000,
                theme: "colored",
              }
            );
            hasError = true;
          }
        }
      } catch (error) {
        toast.error(
          `Error processing ${selectedAction.toLowerCase()} for ID ${id}: ${
            error.message
          }`,
          {
            position: "top-right",
            autoClose: 3000,
            theme: "colored",
          }
        );
        hasError = true;
      }

      return !hasError;
    },
    [selectedAction, serviceId, pdfUrl, setPendingFormData]
  );

  const processAllIds = useCallback(
    async (ids) => {
      setPendingIds(ids);
      setCurrentIdIndex(0);
      let successCount = 0;

      for (let i = 0; i < ids.length; i++) {
        setCurrentIdIndex(i);
        const success = await processSingleId(ids[i], i, ids.length);
        if (selectedAction === "Sanction" && !success) {
          return;
        }
        if (success) {
          successCount++;
        }
      }

      setPendingIds([]);
      setCurrentIdIndex(0);
      setCurrentApplicationId("");
      toast.success(
        `${
          selectedAction === "toInbox"
            ? "Returned to Inbox"
            : selectedAction === "Sanction"
            ? "Sanctioned"
            : "Rejected"
        } ${successCount} of ${ids.length} application${
          ids.length > 1 ? "s" : ""
        }!`,
        { position: "top-right", autoClose: 2000, theme: "colored" }
      );
      refreshTable();
      if (serviceId) debouncedHandleRecords(serviceId);
    },
    [
      selectedAction,
      serviceId,
      processSingleId,
      debouncedHandleRecords,
      refreshTable,
    ]
  );

  const handlePinSubmit = useCallback(async () => {
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
      setConfirmOpen(false);
      setPin("");
    } catch (error) {
      setConfirmOpen(false);
      setPin("");
    }
  }, [pin, signAndUpdatePdf]);

  const handleSignPdf = useCallback(async () => {
    if (storedPin) {
      try {
        await signAndUpdatePdf(storedPin);
      } catch (error) {
        if (
          error.message.includes("No certificates found") ||
          error.message.includes("Not the registered certificate") ||
          error.message.includes("The registered certificate has expired")
        ) {
          setStoredPin(null);
          setConfirmOpen(true);
        } else {
          const nextIndex = currentIdIndex + 1;
          if (nextIndex < pendingIds.length) {
            setCurrentIdIndex(nextIndex);
            setCurrentApplicationId(pendingIds[nextIndex]);
            await new Promise((resolve) => setTimeout(resolve, 500));
            await processSingleId(
              pendingIds[nextIndex],
              nextIndex,
              pendingIds.length
            );
          } else {
            setPendingIds([]);
            setCurrentIdIndex(0);
            setCurrentApplicationId("");
            toast.success(
              `Sanctioned ${pendingIds.length} application${
                pendingIds.length > 1 ? "s" : ""
              }!`,
              {
                position: "top-right",
                autoClose: 2000,
                theme: "colored",
              }
            );
            refreshTable();
            if (serviceId) debouncedHandleRecords(serviceId);
          }
        }
      }
    } else {
      setConfirmOpen(true);
    }
  }, [
    storedPin,
    currentIdIndex,
    pendingIds,
    serviceId,
    processSingleId,
    debouncedHandleRecords,
    refreshTable,
  ]);

  const signAndUpdatePdf = useCallback(
    async (pinToUse) => {
      try {
        if (!pdfBlob) {
          throw new Error("No PDF blob available for signing");
        }
        const isValid = await isValidPdf(pdfBlob);
        if (!isValid) {
          throw new Error("Invalid PDF structure detected");
        }
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

        // Perform HandleAction after successful signing
        if (pendingFormData) {
          const { data: result } = await axiosInstance.post(
            "/Officer/HandleAction",
            pendingFormData
          );
          if (!result.status) {
            throw new Error(
              result.response || "Failed to sanction application"
            );
          }
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
        setPendingFormData(null); // Clear pending form data
        toast.success("PDF signed successfully!", {
          position: "top-right",
          autoClose: 2000,
          theme: "colored",
        });

        // Update cards by fetching new counts
        if (serviceId) {
          await debouncedHandleRecords(serviceId); // Ensure counts are updated
        }

        const nextIndex = currentIdIndex + 1;
        if (nextIndex < pendingIds.length) {
          setCurrentIdIndex(nextIndex);
          setCurrentApplicationId(pendingIds[nextIndex]);
          await new Promise((resolve) => setTimeout(resolve, 500));
          await processSingleId(
            pendingIds[nextIndex],
            nextIndex,
            pendingIds.length
          );
        } else {
          setPendingIds([]);
          setCurrentIdIndex(0);
          setCurrentApplicationId("");
          setConfirmOpen(false);
          toast.success(
            `Sanctioned ${pendingIds.length} application${
              pendingIds.length > 1 ? "s" : ""
            }!`,
            {
              position: "top-right",
              autoClose: 2000,
              theme: "colored",
            }
          );
          // Update cards for final batch
          if (serviceId) {
            await debouncedHandleRecords(serviceId); // Ensure counts are updated
          }
          refreshTable();
        }
      } catch (error) {
        toast.error("Error signing PDF: " + error.message, {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
        setPendingFormData(null); // Clear pending form data on error
        throw error;
      }
    },
    [
      pdfBlob,
      currentApplicationId,
      pdfUrl,
      pendingIds,
      currentIdIndex,
      serviceId,
      processSingleId,
      debouncedHandleRecords,
      refreshTable,
      pendingFormData,
    ]
  );

  const handleRejectConfirm = useCallback(async () => {
    setLoading(true);
    setRejectConfirmOpen(false);
    await processAllIds(
      pendingRejectRows.map((row) => row.original.referenceNumber)
    );
    setLoading(false);
  }, [pendingRejectRows, processAllIds]);

  const handlePullApplication = async () => {
    const data = pullRow;
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
        refreshTable();
        if (serviceId) debouncedHandleRecords(serviceId);
      }
    } catch (error) {
      toast.error("Failed to pull application. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  const handleExecuteAction = useCallback(
    async (selectedRows) => {
      if (!selectedRows || selectedRows.length === 0) {
        toast.error("No applications selected.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
        return;
      }
      const ids = selectedRows.map((item) => item.original.referenceNumber);
      if (selectedAction === "Reject") {
        setPendingRejectRows(selectedRows);
        setRejectConfirmOpen(true);
      } else {
        await processAllIds(ids);
      }
    },
    [selectedAction, processAllIds]
  );

  const getActionOptions = useMemo(() => {
    const options = [
      { value: "Reject", label: "Reject" },
      { value: "toInbox", label: "Return to Inbox" },
    ];
    if (canSanction) {
      options.push({ value: "Sanction", label: "Sanction" });
    }
    return options;
  }, [canSanction]);

  const barData = useMemo(
    () => ({
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
    }),
    [counts]
  );

  const pieData = useMemo(
    () => ({
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
    }),
    [counts]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: { font: { size: 14, family: "'Inter', sans-serif" } },
        },
      },
    }),
    []
  );

  const extraParams = useMemo(
    () => ({
      ServiceId: serviceId,
      type: type,
    }),
    [serviceId, type]
  );

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

  const statusColors = useMemo(
    () => ({
      "Total Applications": "#1976d2",
      Pending: "#ff9800",
      "Citizen Pending": "#9c27b0",
      Rejected: "#f44336",
      Sanctioned: "#4caf50",
    }),
    []
  );

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
        background: "linear-gradient(180deg, #e6f0fa 0%, #b3cde0 100%)",
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
            <ServiceSelectionForm
              services={services}
              errors={errors}
              onServiceSelect={debouncedHandleRecords}
              sx={{
                "& .MuiFormControl-root": {
                  bgcolor: "#ffffff",
                  borderRadius: "8px",
                },
              }}
            />
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
                    {type.toUpperCase()} Applications
                  </Typography>
                  <ServerSideTable
                    ref={tableInstanceRef}
                    key={`table-${tableKey}-${serviceId}-${type}`}
                    url="/Officer/GetApplications"
                    extraParams={extraParams}
                    actionFunctions={actionFunctions}
                    canSanction={canSanction}
                    canHavePool={canHavePool}
                    pendingApplications={type === "pending"}
                    serviceId={serviceId}
                    onPushToPool={handlePushToPool}
                    onExecuteAction={handleExecuteAction}
                    actionOptions={getActionOptions}
                    selectedAction={selectedAction}
                    setSelectedAction={setSelectedAction}
                    sx={{
                      "& .MuiTable-root": { background: "#ffffff" },
                      "& .MuiTableCell-root": {
                        color: "#2d3748",
                        borderColor: "#e0e0e0",
                      },
                      "& .MuiButton-root": { color: "#1976d2" },
                    }}
                  />
                </CardContent>
              </StyledCard>
            </Col>
          </Row>
        )}
      </Container>

      {/* Rejection Dialog */}
      <StyledDialog
        open={rejectConfirmOpen}
        onClose={() => {
          setRejectConfirmOpen(false);
          setPendingRejectRows([]);
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

      {/* Pull Application Dialog */}
      <StyledDialog
        open={pullConfirmOpen}
        onClose={() => {
          setRejectConfirmOpen(false);
          setPendingRejectRows([]);
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            color: "#2d3748",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Confirm Pull Action
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{ mb: 2, color: "#2d3748", fontFamily: "'Inter', sans-serif" }}
          >
            Are you sure you want to pull {pullRow.referenceNumber} application?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <StyledButton
            onClick={() => {
              setPullConfirmOpen(false);
            }}
            aria-label="Cancel"
          >
            Cancel
          </StyledButton>
          <StyledButton
            onClick={handlePullApplication}
            aria-label="Confirm Pull"
            sx={{
              background: "linear-gradient(45deg, #d32f2f, #f44336)",
              "&:hover": {
                background: "linear-gradient(45deg, #b71c1c, #d32f2f)",
              },
            }}
          >
            Confirm Pull
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

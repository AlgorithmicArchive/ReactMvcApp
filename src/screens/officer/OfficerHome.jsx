import React, { useEffect, useState, useRef } from "react";
import { fetchServiceList } from "../../assets/fetch";
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
} from "@mui/material";
import { useForm } from "react-hook-form";
import axiosInstance from "../../axiosConfig";
import { Col, Container, Row } from "react-bootstrap";
import StatusCountCard from "../../components/StatusCountCard";
import ServerSideTable from "../../components/ServerSideTable";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BasicModal from "../../components/BasicModal";

export default function OfficerHome() {
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState();
  const [countList, setCountList] = useState([]);
  const [canSanction, setCanSanction] = useState(false);
  const [canHavePool, setCanHavePool] = useState(false);
  const [type, setType] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [selectedAction, setSelectedAction] = useState("Reject");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [storedPin, setStoredPin] = useState(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfBlob, setPdfBlob] = useState(null);
  const [isSignedPdf, setIsSignedPdf] = useState(false);
  const [currentApplicationId, setCurrentApplicationId] = useState("");
  const [pendingIds, setPendingIds] = useState([]);
  const [currentIdIndex, setCurrentIdIndex] = useState(0);

  const tableRef = useRef(null);

  const {
    control,
    formState: { errors },
    reset,
  } = useForm();

  const navigate = useNavigate();

  // Fetch application counts
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
      setCanHavePool(response.data.canHavePool);
    } catch (error) {
      console.error("Failed to fetch application counts:", error);
      toast.error("Failed to load application counts. Please try again.", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  // Handle card click
  const handleCardClick = async (statusName) => {
    console.log(statusName);
    setType(statusName);
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
        state: { applicationId: userdata.referenceNumber },
      });
    },
    handleViewApplication: (row) => {
      const data = row.original;
      navigate("/officer/viewUserDetails", {
        state: { applicationId: data.referenceNumber },
      });
    },
    pullApplication: async (row) => {
      const data = row.original;
      try {
        const response = await axiosInstance.get("/Officer/PullApplication", {
          params: { applicationId: data.referenceNumber },
        });
        const result = response.data;
        if (result.status) {
          toast.success("Successfully pulled application!", {
            position: "top-center",
            autoClose: 2000,
            theme: "colored",
          });
          window.location.reload();
        }
      } catch (error) {
        console.error("Error pulling application:", error);
        toast.error("Failed to pull application. Please try again.", {
          position: "top-center",
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
        position: "top-center",
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
        position: "top-center",
        autoClose: 2000,
        theme: "colored",
      });
      handleRecords(serviceId);
    } catch (error) {
      console.error("Error pushing to pool:", error);
      toast.error("Failed to push to pool. Please try again.", {
        position: "top-center",
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
          " Check If Desktop App is started."
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
        // Handle Sanction: Fetch PDF and open modal
        const pdfResponse = await fetch(result.path);
        if (!pdfResponse.ok) {
          throw new Error("Failed to fetch PDF from server");
        }
        const newPdfBlob = await pdfResponse.blob();
        if (pdfUrl) {
          URL.revokeObjectURL(pdfUrl);
        }
        const blobUrl = URL.createObjectURL(newPdfBlob);
        setPdfBlob(newPdfBlob);
        setPdfUrl(blobUrl);
        setIsSignedPdf(false);
        setPdfModalOpen(true);
      } else {
        // Handle Reject: Remove from pool and proceed
        try {
          await axiosInstance.get("/Officer/RemoveFromPool", {
            params: {
              ServiceId: serviceId,
              itemToRemove: id,
            },
          });
          toast.success("Application rejected and removed from pool!", {
            position: "top-center",
            autoClose: 2000,
            theme: "colored",
          });
        } catch (error) {
          console.error("Error removing from pool:", error);
          toast.error("Failed to remove application from pool.", {
            position: "top-center",
            autoClose: 3000,
            theme: "colored",
          });
        }

        // Move to the next ID
        const nextIndex = currentIdIndex + 1;
        if (nextIndex < pendingIds.length) {
          setCurrentIdIndex(nextIndex);
          await processSingleId(pendingIds[nextIndex]);
        } else {
          setPendingIds([]);
          setCurrentIdIndex(0);
          setCurrentApplicationId("");
          handleRecords(serviceId);
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        `Error processing ${selectedAction.toLowerCase()} request: ${
          error.message
        }`,
        {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        }
      );
    }
  };

  // Sign and update PDF
  const signAndUpdatePdf = async (pinToUse) => {
    try {
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

      // Remove the application from the pool
      try {
        await axiosInstance.get("/Officer/RemoveFromPool", {
          params: {
            ServiceId: serviceId,
            itemToRemove: currentApplicationId,
          },
        });
        toast.success("Application sanctioned and removed from pool!", {
          position: "top-center",
          autoClose: 2000,
          theme: "colored",
        });
      } catch (error) {
        console.error("Error removing from pool:", error);
        toast.error("Failed to remove application from pool.", {
          position: "top-center",
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
        position: "top-center",
        autoClose: 2000,
        theme: "colored",
      });

      // Move to the next ID
      const nextIndex = currentIdIndex + 1;
      if (nextIndex < pendingIds.length) {
        setCurrentIdIndex(nextIndex);
        await processSingleId(pendingIds[nextIndex]);
      } else {
        setPendingIds([]);
        setCurrentIdIndex(0);
        setCurrentApplicationId("");
        handleRecords(serviceId);
      }
    } catch (error) {
      console.error("Signing error:", error);
      toast.error("Error signing PDF: " + error.message, {
        position: "top-center",
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
        position: "top-center",
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
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
        setConfirmOpen(true);
      }
    } else {
      setConfirmOpen(true);
    }
  };

  // Handle bulk action execution
  const handleExecuteAction = async (selectedRows) => {
    if (!selectedRows || selectedRows.length === 0) {
      toast.error("No applications selected.", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }
    const ids = selectedRows.map((item) => item.original.referenceNumber);
    setPendingIds(ids);
    setCurrentIdIndex(0);
    await processSingleId(ids[0]);
  };

  // Get action options for bulk action dropdown
  const getActionOptions = () => {
    const options = [{ value: "Reject", label: "Reject" }];
    if (canSanction) {
      options.push({ value: "Sanction", label: "Sanction" });
    }
    return options;
  };

  // extraParams for ServerSideTable
  const extraParams = {
    ServiceId: serviceId,
    type: type,
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        await fetchServiceList(setServices);
      } catch (error) {
        console.error("Failed to fetch services:", error);
        toast.error("Failed to load services. Please try again.", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
      }
    };
    fetchServices();
  }, []);

  return (
    <Box
      sx={{
        height: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
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
            key={`${serviceId}-${type}`}
            url="/Officer/GetApplications"
            extraParams={extraParams}
            actionFunctions={actionFunctions}
            canSanction={canSanction}
            canHavePool={canHavePool}
            pendingApplications={type === "Pending"}
            serviceId={serviceId}
            onPushToPool={handlePushToPool}
            onExecuteAction={handleExecuteAction}
            actionOptions={getActionOptions()}
            selectedAction={selectedAction}
            setSelectedAction={setSelectedAction}
          />
        </Container>
      )}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Enter USB Token PIN</DialogTitle>
        <DialogContent>
          <Typography>
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
          />
          <FormHelperText id="pin-helper-text">
            Required to sign the document.
          </FormHelperText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} aria-label="Cancel">
            Cancel
          </Button>
          <Button
            onClick={handlePinSubmit}
            color="primary"
            disabled={!pin}
            aria-label="Submit PIN"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
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
            borderRadius: 2,
          },
        }}
      />
    </Box>
  );
}

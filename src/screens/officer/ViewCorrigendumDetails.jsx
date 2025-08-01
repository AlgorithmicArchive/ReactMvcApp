import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosConfig";
import {
  Box,
  CircularProgress,
  MenuItem,
  Select,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BasicModal from "../../components/BasicModal";
import { MaterialReactTable } from "material-react-table";
import styled from "@emotion/styled";
import CollapsibleFormDetails from "../../components/officer/CollapsibleFormDetails";
import { fetchUserDetail } from "../../assets/fetch";
import CollapsibleActionHistory from "../../components/officer/CollapsibleActionHistory";

const TableContainer = styled(Box)`
  background: linear-gradient(180deg, #e6f0fa 0%, #b3cde0 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  border-radius: 16px;
`;

const TableCard = styled(Box)`
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  width: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  }
`;

const MaterialTable = ({ columns, data, viewType }) => {
  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      enableColumnActions={false}
      enableColumnFilters={false}
      enablePagination={false}
      enableSorting={false}
      muiTablePaperProps={{
        sx: {
          borderRadius: "12px",
          background: "#ffffff",
          border: "1px solid #b3cde0",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
        },
      }}
      muiTableContainerProps={{
        sx: { maxHeight: "600px", background: "#ffffff" },
      }}
      muiTableHeadCellProps={{
        sx: {
          background: "#e6f0fa",
          color: "#1f2937",
          fontWeight: 600,
          fontSize: { xs: 12, md: 14 },
          borderBottom: "2px solid #b3cde0",
          borderRight: "1px solid #b3cde0",
          "&:last-child": { borderRight: "none" },
        },
      }}
      muiTableBodyRowProps={{
        sx: {
          "&:hover": {
            background: "#f8fafc",
            transition: "background-color 0.2s ease",
          },
        },
      }}
      muiTableBodyCellProps={{
        sx: {
          color: "#1f2937",
          background: "#ffffff",
          fontSize: { xs: 12, md: 14 },
          borderRight: "1px solid #b3cde0",
          borderBottom: "1px solid #b3cde0",
          "&:last-child": { borderRight: "none" },
        },
      }}
      muiTableFooterRowProps={{
        sx: { borderTop: "2px solid #b3cde0" },
      }}
      muiTablePaginationProps={{
        rowsPerPageOptions: [10, 25, 50],
        showFirstButton: true,
        showLastButton: true,
        sx: {
          color: "#1f2937",
          background: "#ffffff",
          borderTop: "1px solid #b3cde0",
          fontSize: { xs: 12, md: 14 },
        },
      }}
      renderEmptyRowsFallback={() => (
        <Box
          sx={{
            textAlign: "center",
            py: 4,
            color: "rgb(107, 114, 128)",
            fontSize: { xs: 14, md: 16 },
          }}
        >
          No {viewType?.toLowerCase() || ""} applications available.
        </Box>
      )}
    />
  );
};

const CollapsibleTable = ({
  title,
  columns,
  data,
  viewType,
  open,
  setOpen,
  onViewPdf,
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "#e6f0fa",
          p: 2,
          borderRadius: "8px",
          cursor: "pointer",
          border: "1px solid #b3cde0",
        }}
        onClick={() => setOpen(!open)}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#2196f3" }}>
          {title}
        </Typography>
        <IconButton aria-label={open ? `Collapse ${title}` : `Expand ${title}`}>
          {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={open}>
        <TableContainer>
          <TableCard>
            <MaterialTable
              columns={columns}
              data={data.map((item) => {
                const isArray = Array.isArray(item.files);
                const shouldShowButtons = isArray && item.files.length > 0;

                return {
                  ...item,
                  files: shouldShowButtons ? (
                    <div
                      style={{
                        display: "flex",
                        gap: 2,
                      }}
                    >
                      {item.files.map((fileName, index) => (
                        <Button
                          key={index}
                          variant="outlined"
                          size="small"
                          onClick={() => onViewPdf(fileName)}
                          sx={{
                            textTransform: "none",
                            borderColor: "#1976D2",
                            color: "#1976D2",
                            "&:hover": {
                              borderColor: "#1565C0",
                              color: "#1565C0",
                            },
                          }}
                        >
                          View PDF {index + 1}
                        </Button>
                      ))}
                    </div>
                  ) : isArray ? (
                    item.files.join(", ")
                  ) : (
                    item.files
                  ),
                };
              })}
              viewType={viewType}
            />
          </TableCard>
        </TableContainer>
      </Collapse>
    </Box>
  );
};

const validationSchema = yup.object().shape({
  action: yup.string().required("Action is required"),
  remarks: yup.string().required("Remarks are required"),
});

export default function ViewCorrigendumDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { referenceNumber, applicationId } = location.state || {};
  const [loading, setLoading] = useState(true);
  const [fieldColumns, setFieldColumns] = useState([]);
  const [fieldData, setFieldData] = useState([]);
  const [canTakeAction, setCanTakeAction] = useState(false);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [actions, setActions] = useState([]);
  const [formDetails, setFormDetails] = useState({});
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [corrigendumId, setCorrigendumId] = useState();
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfBlob, setPdfBlob] = useState(null);
  const [isSignedPdf, setIsSignedPdf] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [corHistoryOpen, setCorHistoryOpen] = useState(false);
  const [isSanctionLetter, setIsSanctionLetter] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      action: "",
      remarks: "",
    },
  });

  const formatKey = (key) => {
    if (!key) return "";
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  useEffect(() => {
    const fetchCorrigendum = async () => {
      try {
        const response = await axiosInstance.get(
          "/Officer/GetCorrigendumApplication",
          {
            params: {
              referenceNumber: referenceNumber,
              ...(applicationId && { corrigendumId: applicationId }),
            },
          },
        );
        const result = response.data;
        setData(result.data);
        setColumns(result.columns);
        setFieldData(result.fieldsData);
        setFieldColumns(result.fieldColumns);
        setCanTakeAction(result.canTakeAction);
        setActions(result.actions);
        setCorrigendumId(result.corrigendumId);
      } catch (error) {
        console.error("Error fetching corrigendum details:", error);
        toast.error("Failed to load corrigendum details. Please try again.", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
      } finally {
        setLoading(false);
      }
    };
    async function loadDetails() {
      setLoading(true);
      try {
        await fetchUserDetail(referenceNumber, setFormDetails);
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error("Failed to load user details. Please try again.", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
      } finally {
        setLoading(false);
      }
    }
    if (applicationId) {
      loadDetails();
      fetchCorrigendum();
    }
  }, [applicationId]);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const checkDesktopApp = async () => {
    try {
      const response = await fetch("http://localhost:8000/");
      if (!response.ok) {
        toast.error("Desktop application is not running.", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
        return false;
      }
      return true;
    } catch (error) {
      toast.error(
        "Please start the USB Token PDF Signer desktop application.",
        {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        },
      );
      return false;
    }
  };

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

  const signPdf = async (pdfBlob, pin) => {
    const formData = new FormData();
    formData.append("pdf", pdfBlob, "document.pdf");
    formData.append("pin", pin);
    formData.append(
      "original_path",
      applicationId.replace(/\//g, "_") + "CorrigendumSanctionLetter.pdf",
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
          " Check if Desktop App is started.",
      );
    }
  };

  const handleViewPdf = (url) => {
    setPdfUrl(url);
    setIsSignedPdf(false);
    setPdfModalOpen(true);
  };

  const handlePinSubmit = async () => {
    if (!pin) {
      toast.error("Please enter the USB token PIN.", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    setButtonLoading(true);
    try {
      const certificates = await fetchCertificates(pin);
      if (!certificates || certificates.length === 0) {
        throw new Error("No certificates found on the USB token.");
      }

      const signedBlob = await signPdf(pdfBlob, pin);
      console.log("Signed blob:", signedBlob);

      const updateFormData = new FormData();
      updateFormData.append("signedPdf", signedBlob, "signed.pdf");
      updateFormData.append("applicationId", referenceNumber);
      updateFormData.append("corrigendumId", corrigendumId);
      const updateResponse = await axiosInstance.post(
        "/Officer/UpdateCorrigendumPdf",
        updateFormData,
      );

      if (!updateResponse.data.status) {
        throw new Error(
          "Failed to update PDF on server: " +
            (updateResponse.data.response || "Unknown error"),
        );
      }

      console.log("Server PDF path:", updateResponse.data.path);

      // Revoke old blob URL if it exists
      if (pdfUrl && pdfUrl.startsWith("blob:")) {
        URL.revokeObjectURL(pdfUrl);
      }

      // Use server path with cache-busting
      const uniqueUrl = `${updateResponse.data.path}`;
      setPdfUrl(uniqueUrl);
      setPdfModalOpen(false);
      setTimeout(() => {
        setPdfBlob(null);
        setIsSignedPdf(true);
        setConfirmOpen(false);
        setPdfModalOpen(true);
      }, 100);

      if (pendingFormData) {
        await handleFinalSubmit(pendingFormData);
        setPendingFormData(null);
      }
    } catch (error) {
      console.error("Signing error:", error);
      toast.error("Error signing PDF: " + error.message, {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setButtonLoading(false);
      setPin("");
    }
  };

  const sanctionAction = async () => {
    try {
      const response = await axiosInstance.get(
        "/Officer/GetCorrigendumSanctionLetter",
        {
          params: { applicationId: referenceNumber, corrigendumId },
        },
      );
      const result = response.data;
      if (!result.status) {
        throw new Error(result.response || "Something went wrong");
      }
      const pdfResponse = await axiosInstance.get(`/Base/DisplayFile`, {
        params: { filename: result.path },
        responseType: "blob",
      });
      const newPdfBlob = new Blob([pdfResponse.data], {
        type: "application/pdf",
      });

      setPdfModalOpen(false);
      setPdfBlob(newPdfBlob);
      setPdfUrl(result.path);
      setIsSignedPdf(false);
      setPdfModalOpen(true);
      setIsSanctionLetter(true);
    } catch (error) {
      console.error("Error fetching corrigendum sanction letter:", error);
      toast.error(
        "Failed to fetch corrigendum sanction letter: " + error.message,
        {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        },
      );
    }
  };

  const handleFinalSubmit = async (formData) => {
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    data.append("corrigendumId", corrigendumId);
    data.append("referenceNumber", referenceNumber);

    try {
      const response = await axiosInstance.post(
        "/Officer/HandleCorrigendumAction",
        data,
      );
      if (!response.data.status) {
        throw new Error(response.data.response || "Something went wrong");
      }
      toast.success("Action completed successfully!", {
        position: "top-center",
        autoClose: 6000,
        theme: "colored",
      });
      setTimeout(() => {
        navigate("/officer/home");
      }, 6000);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error processing request: " + error.message, {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  const onSubmit = async (formData) => {
    setButtonLoading(true);
    if (formData.action === "sanction") {
      const isAppRunning = await checkDesktopApp();
      if (!isAppRunning) {
        setButtonLoading(false);
        return;
      }
      setPendingFormData(formData);
      await sanctionAction();
      setButtonLoading(false);
      return;
    }
    await handleFinalSubmit(formData);
    setButtonLoading(false);
  };

  const handleModalClose = () => {
    setPdfModalOpen(false);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl("");
    setPdfBlob(null);
    setIsSanctionLetter(false);
    setIsSignedPdf(false);
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

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 2,
        minHeight: "100vh",
        bgcolor: "#f0f2f5",
      }}
    >
      <Box
        sx={{
          width: "90%",
          maxWidth: "1200px",
          bgcolor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
          padding: 4,
          my: 4,
        }}
      >
        <Typography
          variant="h5"
          textAlign="center"
          gutterBottom
          sx={{ color: "#1f2937", fontWeight: 700 }}
        >
          Corrigendum Application Details
        </Typography>
        <Typography
          variant="h6"
          textAlign="center"
          color="text.secondary"
          mb={4}
        >
          Reference Number: {referenceNumber}
        </Typography>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "primary.main",
            textAlign: "center",
            mt: 4,
            mb: 4,
          }}
        >
          Citizen Application Details
        </Typography>
        <CollapsibleFormDetails
          formDetails={formDetails}
          formatKey={formatKey}
          detailsOpen={detailsOpen}
          setDetailsOpen={setDetailsOpen}
          onViewPdf={handleViewPdf}
          applicationId={referenceNumber}
        />

        <Typography
          variant="h4"
          id="user-details-title"
          sx={{
            fontWeight: 700,
            color: "primary.main",
            textAlign: "center",
            mb: 4,
          }}
        >
          Application Movement History
        </Typography>
        <CollapsibleActionHistory
          detailsOpen={historyOpen}
          setDetailsOpen={setHistoryOpen}
          applicationId={referenceNumber}
        />

        <CollapsibleTable
          title="Corrigendum Fields"
          columns={fieldColumns}
          data={fieldData}
          viewType="corrigendum field"
          open={fieldsOpen}
          setOpen={setFieldsOpen}
          onViewPdf={handleViewPdf}
        />

        <CollapsibleTable
          title="Corrigendum History"
          columns={columns}
          data={data}
          viewType="corrigendum history"
          open={corHistoryOpen}
          setOpen={setCorHistoryOpen}
          onViewPdf={handleViewPdf}
        />

        {canTakeAction && (
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{
              width: "100%",
              maxWidth: "600px",
              mx: "auto",
              mt: 6,
              border: "1px solid #b3cde0",
              borderRadius: "12px",
              padding: 4,
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
              bgcolor: "#ffffff",
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <Typography
              variant="h5"
              textAlign="center"
              gutterBottom
              sx={{ color: "#4caf50", fontWeight: 600 }}
            >
              Action Form
            </Typography>

            <FormControl fullWidth error={!!errors.action}>
              <InputLabel id="action-select-label">Select Action</InputLabel>
              <Controller
                name="action"
                control={control}
                render={({ field }) => (
                  <Select
                    labelId="action-select-label"
                    id="action-select"
                    label="Select Action"
                    {...field}
                  >
                    {actions.map((action) => (
                      <MenuItem key={action.value} value={action.value}>
                        {action.label}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.action && (
                <Typography variant="caption" color="error">
                  {errors.action.message}
                </Typography>
              )}
            </FormControl>

            <Controller
              name="remarks"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Remarks"
                  fullWidth
                  multiline
                  rows={4}
                  error={!!errors.remarks}
                  helperText={errors.remarks?.message}
                />
              )}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={buttonLoading}
              sx={{
                mt: 2,
                py: 1.5,
                bgcolor: "#2196f3",
                "&:hover": { bgcolor: "#1976d2" },
              }}
            >
              {buttonLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Submit Action"
              )}
            </Button>
          </Box>
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderColor: "#E0E0E0",
                  "&:hover fieldset": { borderColor: "#1976D2" },
                  "&.Mui-focused fieldset": {
                    borderColor: "#1976D2",
                    borderWidth: "2px",
                  },
                  backgroundColor: "#FAFAFA",
                  borderRadius: "8px",
                  fontSize: "14px",
                },
                "& .MuiInputLabel-root": {
                  color: "#757575",
                  "&.Mui-focused": { color: "#1976D2" },
                },
              }}
              aria-label="USB Token PIN"
              inputProps={{ "aria-describedby": "pin-helper-text" }}
            />
            <Typography id="pin-helper-text" variant="caption">
              Required to sign the document.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)} aria-label="Cancel">
              Cancel
            </Button>
            <Button
              onClick={handlePinSubmit}
              color="primary"
              disabled={buttonLoading || !pin}
              aria-label="Submit PIN"
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>

        <BasicModal
          open={pdfModalOpen}
          handleClose={handleModalClose}
          handleActionButton={
            isSanctionLetter && !isSignedPdf ? () => setConfirmOpen(true) : null
          }
          buttonText={isSanctionLetter && !isSignedPdf ? "Sign PDF" : null}
          Title={isSignedPdf ? "Signed Document" : "Document Preview"}
          pdf={pdfUrl}
          sx={{
            "& .MuiDialog-paper": {
              width: { xs: "90%", md: "80%" },
              maxWidth: "800px",
              height: "80vh",
              borderRadius: "12px",
            },
          }}
        />
      </Box>
      <ToastContainer />
    </Box>
  );
}

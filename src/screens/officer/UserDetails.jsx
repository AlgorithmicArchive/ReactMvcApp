import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchCertificateDetails, fetchUserDetail } from "../../assets/fetch";
import { Container, Row, Col } from "react-bootstrap";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { formatKey, runValidations } from "../../assets/formvalidations";
import { Controller, useForm } from "react-hook-form";
import CustomButton from "../../components/CustomButton";
import axiosInstance from "../../axiosConfig";
import BasicModal from "../../components/BasicModal";
import SectionSelectCheckboxes from "../../components/SectionSelectCheckboxes";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { CollapsibleFormDetails } from "../../components/officer/CollapsibleFormDetails";

// Common styles for form fields
const commonStyles = {
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "divider" },
    "&:hover fieldset": { borderColor: "primary.main" },
    "&.Mui-focused fieldset": {
      borderColor: "primary.main",
      borderWidth: "2px",
    },
    backgroundColor: "background.paper",
    color: "text.primary",
    borderRadius: 1,
  },
  "& .MuiInputLabel-root": {
    color: "text.secondary",
    "&.Mui-focused": { color: "primary.main" },
  },
  marginBottom: 2,
};

// Button styles
const buttonStyles = {
  backgroundColor: "primary.main",
  color: "background.paper",
  textTransform: "none",
  fontSize: 14,
  borderRadius: 2,
  "&:hover": {
    backgroundColor: "primary.dark",
    transform: "scale(1.02)",
    transition: "all 0.2s ease",
  },
  "&:disabled": {
    backgroundColor: "action.disabledBackground",
    color: "action.disabled",
  },
};

export default function UserDetails() {
  const location = useLocation();
  const { applicationId } = location.state || {};
  const [formDetails, setFormDetails] = useState({});
  const [actionForm, setActionForm] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfBlob, setPdfBlob] = useState(null);
  const [isSignedPdf, setIsSignedPdf] = useState(false);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [certificateDetails, setCertificateDetails] = useState(null);
  const [isSanctionLetter, setIsSanctionLetter] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  // Cleanup blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  // Fetch user details
  useEffect(() => {
    async function loadDetails() {
      setLoading(true);
      try {
        await fetchUserDetail(applicationId, setFormDetails, setActionForm);
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
    if (applicationId) loadDetails();
  }, [applicationId]);

  // Handle PDF view
  const handleViewPdf = (url) => {
    setPdfUrl(url);
    setIsSignedPdf(false);
    setPdfModalOpen(true);
  };

  // Sign PDF
  async function signPdf(pdfBlob, pin) {
    const formData = new FormData();
    formData.append("pdf", pdfBlob, "document.pdf");
    formData.append("pin", pin);
    formData.append(
      "original_path",
      applicationId.replace(/\//g, "_") + "SanctionLetter.pdf"
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
          "Check If Desktop App is started."
      );
    }
  }

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
        }
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

  // Handle PIN submission and sign PDF
  const handlePinSubmit = async () => {
    if (!pin) {
      toast.error("Please enter the USB token PIN.", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    const normalizeSerial = (value) =>
      value?.toString().replace(/\s+/g, "").toUpperCase();

    setButtonLoading(true);
    try {
      const certificates = await fetchCertificates(pin);
      if (!certificates || certificates.length === 0) {
        throw new Error("No certificates found on the USB token.");
      }

      const selectedCertificate = certificates[0];
      const expiration = new Date(certificateDetails.expirationDate);
      const now = new Date();
      const tokenSerial = normalizeSerial(selectedCertificate.serial_number);
      const registeredSerial = normalizeSerial(
        certificateDetails.serial_number
      );

      if (tokenSerial !== registeredSerial) {
        toast.error("Not the registered certificate.", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
        return;
      } else if (expiration < now) {
        toast.error("The registered certificate has expired.", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
        return;
      }

      const signedBlob = await signPdf(pdfBlob, pin);

      const updateFormData = new FormData();
      updateFormData.append("signedPdf", signedBlob, "signed.pdf");
      updateFormData.append("applicationId", applicationId);
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

      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      const blobUrl = URL.createObjectURL(signedBlob);
      setPdfUrl(blobUrl);
      setPdfBlob(null);
      setIsSignedPdf(true);
      setConfirmOpen(false);
      setPdfModalOpen(true);

      if (pendingFormData) {
        await handleFinalSubmit(pendingFormData); // Submit form after sign
        setPendingFormData(null); // Clear after submission
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
    const response = await axiosInstance.get("/Officer/GetSanctionLetter", {
      params: { applicationId: applicationId },
    });
    const result = response.data;
    if (!result.status) {
      throw new Error(result.response || "Something went wrong");
    }
    const pdfResponse = await fetch(result.path);
    if (!pdfResponse.ok) {
      throw new Error("Failed to fetch PDF from server");
    }
    const newPdfBlob = await pdfResponse.blob();
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    const blobUrl = URL.createObjectURL(newPdfBlob);
    setPdfBlob(newPdfBlob);
    setPdfUrl(blobUrl);
    setIsSignedPdf(false);
    setPdfModalOpen(true);
    setIsSanctionLetter(true);
  };

  const handleFinalSubmit = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value && typeof value === "object") {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value ?? "");
      }
    });
    formData.append("applicationId", applicationId);
    try {
      const { data: result } = await axiosInstance.post(
        "/Officer/HandleAction",
        formData
      );
      if (!result.status) {
        throw new Error(result.response || "Something went wrong");
      } else {
        toast.success("Action completed successfully!", {
          position: "top-center",
          autoClose: 6000,
          theme: "colored",
        });
        if (certificateDetails != null) {
          setTimeout(() => {
            navigate("/officer/home");
          }, 6000);
        } else navigate("/officer/home");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error processing request: " + error.message, {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setButtonLoading(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    const defaultAction = data.defaultAction?.toLowerCase();
    setButtonLoading(true);

    if (defaultAction === "sanction") {
      const certDetails = await fetchCertificateDetails();
      if (!certDetails) {
        toast.error(
          "You have not registered DSC, so you can't sanction this application.",
          {
            position: "top-center",
            autoClose: 3000,
            theme: "colored",
          }
        );
        setButtonLoading(false);
        return;
      }

      const isAppRunning = await checkDesktopApp();
      if (!isAppRunning) {
        setButtonLoading(false);
        return;
      }

      setCertificateDetails(certDetails);
      setPendingFormData(data); // Save form data for later
      await sanctionAction(); // Fetch PDF and open modal
      setButtonLoading(false);
      return;
    }

    // For other actions, proceed directly
    await handleFinalSubmit(data);
  };

  // Handle modal close
  const handleModalClose = () => {
    setPdfModalOpen(false);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl("");
    setPdfBlob(null);
    setIsSignedPdf(false);
    setIsSanctionLetter(false);
  };

  // Render form fields
  const renderField = (field, sectionIndex) => {
    switch (field.type) {
      case "text":
      case "email":
      case "date":
        return (
          <Controller
            key={field.name}
            name={field.name}
            control={control}
            defaultValue=""
            rules={{
              validate: async (value) =>
                await runValidations(field, value, getValues()),
            }}
            render={({ field: { onChange, value, ref } }) => (
              <TextField
                type={field.type}
                id={field.id}
                label={field.label}
                value={value || ""}
                onChange={onChange}
                inputRef={ref}
                error={Boolean(errors[field.name])}
                helperText={errors[field.name]?.message}
                fullWidth
                margin="normal"
                inputProps={{
                  maxLength: field.validationFunctions?.includes(
                    "specificLength"
                  )
                    ? field.maxLength
                    : undefined,
                }}
                sx={commonStyles}
                aria-describedby={`field-${field.id}-error`}
              />
            )}
          />
        );
      case "file":
        return (
          <Controller
            key={field.name}
            name={field.name}
            control={control}
            defaultValue={null}
            rules={{
              validate: async (value) => await runValidations(field, value),
            }}
            render={({ field: { onChange, ref } }) => (
              <FormControl
                fullWidth
                margin="normal"
                error={Boolean(errors[field.name])}
                sx={commonStyles}
              >
                <Tooltip title={`Upload ${field.label}`} arrow>
                  <Button
                    variant="contained"
                    component="label"
                    sx={buttonStyles}
                    aria-label={`Upload ${field.label}`}
                  >
                    {field.label}
                    <input
                      type="file"
                      hidden
                      onChange={(e) => onChange(e.target.files[0])}
                      ref={ref}
                      accept={field.accept}
                    />
                  </Button>
                </Tooltip>
                <FormHelperText sx={{ color: "error.main" }}>
                  {errors[field.name]?.message}
                </FormHelperText>
              </FormControl>
            )}
          />
        );
      case "select":
        return (
          <Controller
            key={field.name}
            name={field.name}
            control={control}
            defaultValue={field.options[0]?.value || ""}
            rules={{
              validate: async (value) =>
                await runValidations(field, value, getValues()),
            }}
            render={({ field: { onChange, value, ref } }) => {
              let options =
                field.optionsType === "dependent" && field.dependentOn
                  ? field.dependentOptions?.[watch(field.dependentOn)] || []
                  : field.options || [];
              return (
                <>
                  <FormControl
                    fullWidth
                    margin="normal"
                    error={Boolean(errors[field.name])}
                    sx={commonStyles}
                  >
                    <InputLabel id={`${field.id}-label`}>
                      {field.label}
                    </InputLabel>
                    <Select
                      labelId={`${field.id}-label`}
                      id={field.id}
                      value={value || ""}
                      label={field.label}
                      onChange={onChange}
                      inputRef={ref}
                      sx={{ color: "text.primary" }}
                      aria-describedby={`field-${field.id}-error`}
                    >
                      {options.map((option) => (
                        <MenuItem
                          key={`${field.name}-${option.value}`}
                          value={option.value}
                        >
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText sx={{ color: "error.main" }}>
                      {errors[field.name]?.message}
                    </FormHelperText>
                  </FormControl>
                  {field.additionalFields && field.additionalFields[value] && (
                    <Box sx={{ mt: 2 }}>
                      {field.additionalFields[value].map((additionalField) => {
                        const additionalFieldName =
                          additionalField.name ||
                          `${field.name}_${additionalField.id}`;
                        return (
                          <Box key={additionalField.id} sx={{ mb: 2 }}>
                            <InputLabel
                              htmlFor={additionalField.id}
                              sx={{ color: "text.secondary", mb: 1 }}
                            >
                              {additionalField.label}
                            </InputLabel>
                            {renderField(
                              { ...additionalField, name: additionalFieldName },
                              sectionIndex
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </>
              );
            }}
          />
        );
      case "enclosure":
        return (
          <Controller
            key={field.name}
            name={field.name}
            control={control}
            defaultValue={{
              selected: field.options[0]?.value || "",
              file: null,
            }}
            rules={{
              validate: async (value) =>
                await runValidations(field, value, getValues()),
            }}
            render={({ field: { onChange, value, ref } }) => (
              <Box sx={{ mb: 2 }}>
                <FormControl
                  fullWidth
                  margin="normal"
                  error={Boolean(errors[field.name]?.selected)}
                  sx={commonStyles}
                >
                  <InputLabel id={`${field.id}_select-label`}>
                    {field.label}
                  </InputLabel>
                  <Select
                    labelId={`${field.id}_select-label`}
                    id={`${field.id}_select`}
                    value={value?.selected || ""}
                    label={field.label}
                    onChange={(e) =>
                      onChange({ ...value, selected: e.target.value })
                    }
                    inputRef={ref}
                    sx={{ color: "text.primary" }}
                    aria-describedby={`field-${field.id}-error`}
                  >
                    {field.options.map((option) => (
                      <MenuItem
                        key={`${field.name}-${option.value}`}
                        value={option.value}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText sx={{ color: "error.main" }}>
                    {errors[field.name]?.selected?.message}
                  </FormHelperText>
                </FormControl>
                <FormControl
                  fullWidth
                  margin="normal"
                  error={Boolean(errors[field.name]?.file)}
                  sx={commonStyles}
                >
                  <Tooltip title="Upload enclosure file" arrow>
                    <Button
                      variant="contained"
                      component="label"
                      sx={{ ...buttonStyles, mt: 2 }}
                      disabled={!value?.selected}
                      aria-label={`Upload ${field.label} file`}
                    >
                      Upload File
                      <input
                        type="file"
                        hidden
                        onChange={(e) =>
                          onChange({ ...value, file: e.target.files[0] })
                        }
                        accept={field.accept}
                      />
                    </Button>
                  </Tooltip>
                  <FormHelperText sx={{ color: "error.main" }}>
                    {errors[field.name]?.file?.message}
                  </FormHelperText>
                </FormControl>
              </Box>
            )}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, rgb(252, 252, 252) 0%, rgb(240, 236, 236) 100%)",
        }}
      >
        <CircularProgress color="primary" aria-label="Loading user details" />
      </Box>
    );
  }

  return (
    <Container
      style={{
        maxWidth: 1200,
        padding: 0,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: { xs: 3, md: 5 },
      }}
    >
      <Box
        sx={{
          width: "100%",
          bgcolor: "background.default",
          borderRadius: 3,
          boxShadow: "0 8px 3px rgba(0, 0, 0, 0.1)",
          p: { xs: 3, md: 5 },
          transition: "transform 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-5px)",
          },
        }}
        role="main"
        aria-labelledby="user-details-title"
      >
        <Typography
          variant="h4"
          id="user-details-title"
          sx={{
            fontFamily: "'Playfair Display', serif",
            color: "primary.main",
            textAlign: "center",
            mb: 4,
            fontWeight: 700,
          }}
        >
          User Details
        </Typography>

        {/* Collapsible Form Details */}
        <CollapsibleFormDetails
          formDetails={formDetails}
          formatKey={formatKey}
          detailsOpen={detailsOpen}
          setDetailsOpen={setDetailsOpen}
          onViewPdf={handleViewPdf}
        />

        {/* Action Form */}
        <Typography
          variant="h5"
          sx={{
            fontFamily: "'Playfair Display', serif",
            color: "primary.main",
            textAlign: "center",
            mt: detailsOpen ? 6 : 4,
            mb: 4,
            fontWeight: 700,
          }}
        >
          Action Form
        </Typography>
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
            p: { xs: 3, md: 5 },
            maxWidth: 600,
            mx: "auto",
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
            {actionForm.length > 0 ? (
              actionForm.map((field, index) => {
                const selectedValue =
                  field.type === "select" ? watch(field.name) : null;
                return (
                  <Box key={index} sx={{ mb: 2 }}>
                    {renderField(field, index)}
                    {field.type === "select" &&
                      selectedValue === "ReturnToCitizen" && (
                        <Controller
                          name="returnFields"
                          control={control}
                          defaultValue={[]}
                          rules={{
                            validate: (value) =>
                              value.length > 0 ||
                              "Select at least one user detail field.",
                          }}
                          render={({ field: { onChange, value } }) => (
                            <Box
                              sx={{
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 2,
                                maxHeight: 200,
                                overflowY: "auto",
                                p: 2,
                                mt: 2,
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{ color: "text.secondary", mb: 1 }}
                              >
                                Select Fields to Return
                              </Typography>
                              <SectionSelectCheckboxes
                                formDetails={formDetails}
                                control={control}
                                name="returnFields"
                                value={value}
                                onChange={onChange}
                                formatKey={formatKey}
                              />
                              {errors.returnFields && (
                                <FormHelperText sx={{ color: "error.main" }}>
                                  {errors.returnFields.message}
                                </FormHelperText>
                              )}
                            </Box>
                          )}
                        />
                      )}
                  </Box>
                );
              })
            ) : (
              <Typography
                sx={{ textAlign: "center", color: "text.secondary", py: 4 }}
              >
                No action form fields available.
              </Typography>
            )}
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <CustomButton
                text="Take Action"
                sx={{ ...buttonStyles, width: "100%", mt: 3 }}
                disabled={buttonLoading}
                startIcon={
                  buttonLoading && (
                    <CircularProgress size={20} color="inherit" />
                  )
                }
                type="submit"
                aria-label="Submit action form"
              />
            </Box>
          </form>
        </Box>

        {/* Confirmation Dialog */}
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
              sx={commonStyles}
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
              disabled={buttonLoading || !pin}
              aria-label="Submit PIN"
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>

        {/* PDF Modal */}
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
              maxWidth: 800,
              height: "80vh",
              borderRadius: 2,
            },
          }}
        />
      </Box>
      <ToastContainer />
    </Container>
  );
}

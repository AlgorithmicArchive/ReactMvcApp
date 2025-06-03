import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchUserDetail } from "../../assets/fetch";
import { Container, Row, Col } from "react-bootstrap";
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  Divider,
  FormControl,
  FormControlLabel,
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

// Updated CollapsibleFormDetails
const CollapsibleFormDetails = ({
  formDetails,
  formatKey,
  detailsOpen,
  setDetailsOpen,
  onViewPdf,
}) => {
  const sections = useMemo(() => {
    return Array.isArray(formDetails)
      ? formDetails
      : Object.entries(formDetails).map(([key, value]) => ({ [key]: value }));
  }, [formDetails]);

  return (
    <Box sx={{ width: "100%", maxWidth: 800, mx: "auto", mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Tooltip
          title={detailsOpen ? "Collapse details" : "Expand details"}
          arrow
        >
          <Button
            onClick={() => setDetailsOpen((prev) => !prev)}
            sx={{
              backgroundColor: "primary.main",
              color: "background.paper",
              fontWeight: 600,
              textTransform: "none",
              py: 1,
              px: 3,
              borderRadius: 2,
              mb: 2,
              "&:hover": {
                backgroundColor: "primary.dark",
                transform: "scale(1.02)",
                transition: "all 0.2s ease",
              },
            }}
            startIcon={detailsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            aria-expanded={detailsOpen}
            aria-label={detailsOpen ? "Collapse details" : "Expand details"}
          >
            {detailsOpen ? "Collapse" : "Expand"} Details
          </Button>
        </Tooltip>
      </Box>
      <Collapse in={detailsOpen} timeout={500}>
        <Box
          sx={{
            bgcolor: "#FFFFFF",
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            p: { xs: 3, md: 5 },
            border: "1px solid",
            borderColor: "divider",
            maxHeight: 400,
            overflowY: "auto",
          }}
        >
          {sections.length > 0 ? (
            sections.map((section, index) => (
              <Box key={index} sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: "'Playfair Display', serif",
                    color: "primary.main",
                    fontWeight: 700,
                    mb: 2,
                    borderBottom: "2px solid",
                    borderColor: "primary.main",
                    pb: 1,
                  }}
                >
                  {Object.keys(section)[0]}
                </Typography>
                <Row className="g-3">
                  {Object.entries(section).map(([sectionName, fields]) =>
                    fields.map((field, fieldIndex) => (
                      <Col xs={12} md={6} key={fieldIndex}>
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                          <Tooltip title={field.label || field.name} arrow>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 600,
                                color: "text.secondary",
                                mb: 1,
                                maxWidth: "100%",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {field.label || field.name}
                            </Typography>
                          </Tooltip>
                          {field.File && field.File !== "" ? (
                            /\.(jpg|jpeg|png|gif)$/i.test(field.File) ? (
                              <Box
                                component="img"
                                src={field.File}
                                alt={field.label}
                                sx={{
                                  width: "100%",
                                  height: 150,
                                  objectFit: "cover",
                                  borderRadius: 2,
                                  border: "1px solid",
                                  borderColor: "divider",
                                  p: 1,
                                  transition: "transform 0.3s ease",
                                  "&:hover": {
                                    transform: "scale(1.02)",
                                  },
                                }}
                              />
                            ) : (
                              <Box sx={{ mt: 1 }}>
                                <Tooltip title="View document" arrow>
                                  <Button
                                    variant="outlined"
                                    onClick={() => onViewPdf(field.File)}
                                    startIcon={<PictureAsPdfIcon />}
                                    sx={{
                                      textTransform: "none",
                                      borderColor: "primary.main",
                                      color: "primary.main",
                                      "&:hover": {
                                        backgroundColor: "primary.light",
                                        borderColor: "primary.dark",
                                      },
                                    }}
                                    aria-label={`View ${field.label} document`}
                                  >
                                    View Document
                                  </Button>
                                </Tooltip>
                                {field.Enclosure && (
                                  <Typography
                                    variant="caption"
                                    display="block"
                                    sx={{ mt: 1, color: "text.secondary" }}
                                  >
                                    Enclosure: {field.Enclosure}
                                  </Typography>
                                )}
                              </Box>
                            )
                          ) : (
                            <Typography
                              variant="body1"
                              sx={{
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 2,
                                p: 2,
                                mt: 1,
                                color: field.value
                                  ? "text.primary"
                                  : "text.secondary",
                              }}
                            >
                              {field.value ?? "--"}
                            </Typography>
                          )}
                        </Box>
                      </Col>
                    ))
                  )}
                </Row>
                {index < sections.length - 1 && (
                  <Divider
                    sx={{
                      my: 3,
                      borderColor: "primary.main",
                      borderWidth: "1px",
                    }}
                  />
                )}
              </Box>
            ))
          ) : (
            <Typography
              sx={{ textAlign: "center", color: "text.secondary", py: 4 }}
            >
              No form details available.
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

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
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm({ mode: "onChange" });

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
    setPdfModalOpen(true);
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

  // Sign PDF
  async function signPdf(pdfBlob) {
    const formData = new FormData();
    formData.append("pdf", pdfBlob, "document.pdf");
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
      throw new Error("Error signing PDF: " + error.message);
    }
  }

  // Handle form submission
  const onSubmit = async (data) => {
    setButtonLoading(true);
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
      }
      if (result.path) {
        const pdfResponse = await fetch(result.path);
        if (!pdfResponse.ok) {
          throw new Error("Failed to fetch PDF from server");
        }
        const pdfBlob = await pdfResponse.blob();
        const signedBlob = await signPdf(pdfBlob);
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
        const blobUrl = URL.createObjectURL(signedBlob);
        setPdfUrl(blobUrl);
        setPdfModalOpen(true);
        toast.success("Action completed and PDF signed successfully!", {
          position: "top-center",
          autoClose: 2000,
          theme: "colored",
        });
      } else {
        toast.success("Action completed successfully!", {
          position: "top-center",
          autoClose: 2000,
          theme: "colored",
        });
        navigate("/officer/home");
      }
    } catch (error) {
      console.error("Submission or signing error:", error);
      toast.error("Error processing request: " + error.message, {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setButtonLoading(false);
      setConfirmOpen(false);
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
        background:
          "linear-gradient(135deg, rgb(252, 252, 252) 0%, rgb(240, 236, 236) 100%)",
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
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
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
          <form onSubmit={handleSubmit(() => setConfirmOpen(true))}>
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
          <DialogTitle>Confirm Action</DialogTitle>
          <DialogContent>
            Are you sure you want to submit the action form? This may involve
            signing and updating documents.
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)} aria-label="Cancel">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              color="primary"
              disabled={buttonLoading}
              aria-label="Confirm action"
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        {/* PDF Modal */}
        <BasicModal
          open={pdfModalOpen}
          handleClose={() => setPdfModalOpen(false)}
          Title="Document Viewer"
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

import { Box } from "@mui/system";
import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchUserDetail } from "../../assets/fetch";
import { Col, Row } from "react-bootstrap";
import {
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
} from "@mui/material";
import { formatKey, runValidations } from "../../assets/formvalidations";
import { Controller, useForm } from "react-hook-form";
import CustomButton from "../../components/CustomButton";
import axiosInstance from "../../axiosConfig";
import BasicModal from "../../components/BasicModal";
import SectionSelectCheckboxes from "../../components/SectionSelectCheckboxes";

// Updated CollapsibleFormDetails accepts an onViewPdf prop
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
    <>
      <Button
        onClick={() => setDetailsOpen((prev) => !prev)}
        sx={{
          backgroundColor: "divider",
          color: "text.primary",
          fontWeight: "bold",
        }}
      >
        {detailsOpen ? "Collapse" : "Expand"} Details
      </Button>
      <Collapse in={detailsOpen}>
        <Box
          sx={{
            width: "60%",
            maxHeight: "10%",
            overflowY: "auto",
            border: "2px solid #CCA682",
            borderRadius: 5,
            padding: 5,
            backgroundColor: "background.default",
            margin: { lg: "0 auto" },
          }}
        >
          {sections.map((section, index) => (
            <Box key={index} sx={{ marginBottom: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  marginBottom: 2,
                  borderBottom: "1px solid",
                  paddingBottom: 1,
                }}
              >
                {Object.keys(section)[0]}
              </Typography>

              <Row>
                {Object.entries(section).map(([sectionName, fields]) =>
                  fields.map((field, fieldIndex) => (
                    <Col
                      xs={12}
                      lg={6}
                      key={fieldIndex}
                      style={{ marginBottom: 10 }}
                    >
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontSize: 14,
                            fontWeight: "bold",
                            width: "250px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {field.label || field.name}
                        </Typography>

                        {field.File && field.File !== "" ? (
                          /\.(jpg|jpeg|png|gif)$/i.test(field.File) ? (
                            <Box
                              component="img"
                              src={field.File}
                              alt={field.label}
                              sx={{
                                width: "100%",
                                maxHeight: 200,
                                objectFit: "contain",
                                borderRadius: 2,
                                border: "1px solid",
                                padding: 1,
                                mt: 1,
                              }}
                            />
                          ) : (
                            <Box sx={{ mt: 1 }}>
                              <Button
                                variant="outlined"
                                onClick={() => onViewPdf(field.File)}
                              >
                                View Document
                              </Button>
                              {field.Enclosure && (
                                <Typography
                                  variant="caption"
                                  display="block"
                                  sx={{ mt: 1 }}
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
                              borderRadius: 3,
                              padding: 2,
                              mt: 1,
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

              <Divider
                orientation="horizontal"
                sx={{ borderColor: "divider", my: 5 }}
              />
            </Box>
          ))}
        </Box>
      </Collapse>
    </>
  );
};

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
  },
  "& .MuiInputLabel-root": {
    color: "text.primary",
    "&.Mui-focused": { color: "primary.main" },
  },
  marginBottom: 5,
};

export default function UserDetails() {
  const location = useLocation();
  const { applicationId } = location.state || {};
  const [formDetails, setFormDetails] = useState({});
  const [actionForm, setActionForm] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  useEffect(() => {
    fetchUserDetail(applicationId, setFormDetails, setActionForm);
  }, [applicationId]);

  const handleViewPdf = (url) => {
    setPdfUrl(url);
    setPdfModalOpen(true);
  };

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
                helperText={errors[field.name]?.message || ""}
                fullWidth
                margin="normal"
                inputProps={{
                  maxLength: field.validationFunctions?.includes(
                    "specificLength"
                  )
                    ? field.maxLength
                    : undefined,
                }}
                sx={{
                  ...commonStyles,
                  "& .MuiInputBase-input": { color: "#312C51" },
                }}
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
                <Button
                  variant="contained"
                  component="label"
                  sx={{ backgroundColor: "#312C51", color: "#fff" }}
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
                <FormHelperText>
                  {errors[field.name]?.message || ""}
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
              const districtFields = [
                "district",
                "presentdistrict",
                "permanentdistrict",
              ];
              const normalizedFieldName = field.name
                .toLowerCase()
                .replace(/\s/g, "");
              const isDistrict = districtFields.includes(normalizedFieldName);

              let options;
              if (field.optionsType === "dependent" && field.dependentOn) {
                const parentValue = watch(field.dependentOn);
                options =
                  field.dependentOptions && field.dependentOptions[parentValue]
                    ? field.dependentOptions[parentValue]
                    : [];
              } else {
                options = field.options;
              }

              return (
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
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#312C51",
                      },
                      color: "#312C51",
                    }}
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
                  <FormHelperText>
                    {errors[field.name]?.message || ""}
                  </FormHelperText>

                  {/* Render additional fields conditionally */}
                  {field.additionalFields &&
                    field.additionalFields[value] &&
                    field.additionalFields[value].map((additionalField) => {
                      const additionalFieldName =
                        additionalField.name ||
                        `${field.name}_${additionalField.id}`;
                      return (
                        <div
                          key={additionalField.id}
                          style={{ marginBottom: 16 }}
                        >
                          <InputLabel
                            htmlFor={additionalField.id}
                            sx={{ color: "#312C51" }}
                          >
                            {additionalField.label}
                          </InputLabel>
                          {renderField(
                            { ...additionalField, name: additionalFieldName },
                            sectionIndex
                          )}
                        </div>
                      );
                    })}
                </FormControl>
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
            render={({ field: { onChange, value, ref } }) => (
              <FormControl
                fullWidth
                margin="normal"
                error={Boolean(errors[field.name])}
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
                  onChange={(e) => {
                    const newVal = { ...value, selected: e.target.value };
                    onChange(newVal);
                  }}
                  inputRef={ref}
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#312C51",
                    },
                    color: "#312C51",
                  }}
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
                <FormHelperText>
                  {errors[field.name]?.message || ""}
                </FormHelperText>
                <Button
                  variant="contained"
                  component="label"
                  sx={{ mt: 2, backgroundColor: "#312C51", color: "#fff" }}
                >
                  Upload File
                  <input
                    type="file"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files[0];
                      onChange({ ...value, file });
                    }}
                    accept={field.accept}
                  />
                </Button>
              </FormControl>
            )}
          />
        );

      default:
        return null;
    }
  };

  async function signPdf(pdfBlob) {
    const formData = new FormData();
    formData.append("pdf", pdfBlob, "document.pdf");
    // Note: We don’t append 'original_path' to get the signed PDF bytes back

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

  const onSubmit = async (data) => {
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
        return alert(result.response || "Something went wrong");
      }

      if (result.path) {
        // Fetch the PDF from the server
        const pdfResponse = await fetch(result.path);
        if (!pdfResponse.ok) {
          throw new Error("Failed to fetch PDF from server");
        }
        const pdfBlob = await pdfResponse.blob();

        // Sign the PDF
        const signedBlob = await signPdf(pdfBlob);

        // Send the signed PDF back to overwrite the original
        const updateFormData = new FormData();
        updateFormData.append("signedPdf", signedBlob, "signed.pdf");
        updateFormData.append("applicationId", applicationId);

        const updateResponse = await axiosInstance.post(
          `/Officer/UpdatePdf`,
          updateFormData
        );

        if (!updateResponse.data.status) {
          throw new Error(
            "Failed to update PDF on server: " +
              (updateResponse.data.response || "Unknown error")
          );
        }

        // Create a blob URL and display in modal
        const blobUrl = URL.createObjectURL(signedBlob);
        setPdfUrl(blobUrl);
        setPdfModalOpen(true);
      } else {
        navigate("/officer/home");
      }
    } catch (error) {
      console.error("Submission or signing error:", error);
      alert("Error processing request: " + error.message);
    }
  };

  return (
    <Box
      sx={{
        height: "120vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        paddingBottom: 5,
      }}
    >
      <Typography variant="h3">USER DETAILS</Typography>
      <CollapsibleFormDetails
        formDetails={formDetails}
        formatKey={formatKey}
        detailsOpen={detailsOpen}
        setDetailsOpen={setDetailsOpen}
        onViewPdf={handleViewPdf}
      />

      <Typography variant="h3" sx={{ marginTop: detailsOpen ? 40 : 5 }}>
        Action Form
      </Typography>
      <Box
        sx={{
          width: "50vw",
          backgroundColor: "background.paper",
          borderRadius: 5,
          color: "#312C51",
          padding: 10,
        }}
      >
        <form style={{ width: "100%" }}>
          {actionForm.map((field, index) => {
            const selectedValue =
              field.type === "select" ? watch(field.name) : null;
            return (
              <Box key={index}>
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
                            padding: 1,
                            marginTop: 2,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <SectionSelectCheckboxes
                            formDetails={formDetails}
                            control={control}
                            name="returnFields"
                            value={value}
                            onChange={onChange}
                            formatKey={formatKey}
                          />
                        </Box>
                      )}
                    />
                  )}
              </Box>
            );
          })}

          <CustomButton
            text="Take Action"
            bgColor="primary.main"
            color="background.paper"
            width="100%"
            onClick={handleSubmit(onSubmit)}
          />
        </form>
      </Box>

      <BasicModal
        open={pdfModalOpen}
        handleClose={() => setPdfModalOpen(false)}
        Title="Document Viewer"
        pdf={pdfUrl}
      />
    </Box>
  );
}

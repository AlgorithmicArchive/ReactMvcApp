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
import {
  runValidations,
  TransformationFunctionsList,
} from "../../assets/formvalidations";
import { useLocation } from "react-router-dom";

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
  minWidth: "200px",
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
  const [formDetailsFields, setFormDetailsFields] = useState([]);
  const [formElements, setFormElements] = useState([]);
  const [corrigendumFields, setCorrigendumFields] = useState([]);
  const [selectedField, setSelectedField] = useState("");
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({});

  const location = useLocation();
  const { ReferenceNumber, ServiceId, applicationId } = location.state || {};

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

  useEffect(() => {
    if (applicationId && ReferenceNumber && ServiceId) {
      setReferenceNumber(ReferenceNumber);
      setServiceId(ServiceId);
      handleCheckIfCorrigendum();
    }
  }, [applicationId, ReferenceNumber, ServiceId, services]);

  const normalizeDetails = (formDetails) => {
    if (!formDetails || typeof formDetails !== "object") {
      console.warn("formDetails is not an object or is null:", formDetails);
      return [];
    }

    const allFields = [];
    Object.values(formDetails).forEach((section) => {
      if (!section || !Array.isArray(section)) {
        console.warn("Section is not an array:", section);
        return;
      }
      section.forEach((item) => {
        const fieldConfig = findFieldConfig(item.name);
        if (
          ["file", "enclosure"].includes(fieldConfig.type) ||
          fieldConfig.editable === false
        ) {
          return;
        }
        allFields.push({
          label: item.label || item.name,
          name: item.name,
          value: item.value?.toString() || "",
        });
      });
    });

    return allFields;
  };

  const findFieldConfig = (fieldName, parsedFormElements = null) => {
    if (parsedFormElements == null) {
      parsedFormElements = formElements;
    }
    console.log("Form Elements", parsedFormElements);

    for (const section of parsedFormElements) {
      for (const field of section.fields) {
        console.log("field", field);
        if (field.name === fieldName) {
          return {
            ...field,
            validationFunctions: field.validationFunctions || [],
            transformationFunctions: field.transformationFunctions || [],
            additionalFields: field.additionalFields || {},
          };
        }
        for (const key in field.additionalFields) {
          const additional = field.additionalFields[key];
          const found = additional.find((f) => f.name === fieldName);
          if (found) {
            return {
              ...found,
              validationFunctions: found.validationFunctions || [],
              transformationFunctions: found.transformationFunctions || [],
              additionalFields: found.additionalFields || {},
            };
          }
        }
      }
    }
    return {
      label: fieldName,
      name: fieldName,
      type: "text",
      editable: true,
      validationFunctions: [],
      transformationFunctions: [],
      additionalFields: {},
    };
  };

  const validateField = async (field, value, formData, referenceNumber) => {
    const fieldConfig = findFieldConfig(field.name);
    let transformedValue = value || "";

    // Apply transformation functions
    for (const transformFn of field.transformationFunctions || []) {
      if (TransformationFunctionsList[transformFn]) {
        transformedValue =
          TransformationFunctionsList[transformFn](transformedValue);
      }
    }

    // Run validations
    const validationResult = await runValidations(
      {
        ...fieldConfig,
        validationFunctions: field.validationFunctions || [],
      },
      transformedValue,
      formData,
      referenceNumber
    );

    return {
      transformedValue,
      error: validationResult === true ? null : validationResult,
    };
  };

  const revalidateAllFields = async (
    updatedFields,
    formData,
    referenceNumber
  ) => {
    const newErrors = {};
    for (let i = 0; i < updatedFields.length; i++) {
      const field = updatedFields[i];
      const { error } = await validateField(
        field,
        field.newValue,
        formData,
        referenceNumber
      );
      newErrors[i] = error;

      // Validate additional fields
      for (const additionalFieldName in field.additionalValues) {
        const additionalFieldConfig = (
          field.additionalFields[field.newValue] || []
        ).find((f) => f.name === additionalFieldName);
        if (additionalFieldConfig) {
          const validationResult = await runValidations(
            {
              ...additionalFieldConfig,
              validationFunctions:
                additionalFieldConfig.validationFunctions || [],
            },
            field.additionalValues[additionalFieldName],
            formData,
            referenceNumber
          );
          newErrors[`${i}-${additionalFieldName}`] =
            validationResult === true ? null : validationResult;
        }
      }
    }
    return newErrors;
  };

  const handleCheckIfCorrigendum = async () => {
    if (!applicationId && (!referenceNumber || !serviceId)) {
      toast.warning("Please provide both reference number and service.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    setLoading(true);
    try {
      const params = applicationId
        ? {
            referenceNumber: ReferenceNumber,
            serviceId: ServiceId,
            applicationId,
          }
        : { referenceNumber, serviceId };

      const response = await axiosInstance.get(
        "/Officer/GetApplicationForCorrigendum",
        { params }
      );
      const result = response.data;

      if (result.status) {
        const normalizedFields = normalizeDetails(result.formDetails);
        const parsedFormElements =
          typeof result.formElements === "string"
            ? JSON.parse(result.formElements)
            : result.formElements || [];

        setFormDetailsFields(normalizedFields);
        setFormElements(parsedFormElements);
        setCanIssue(true);

        setReferenceNumber(
          result.application.ReferenceNumber || referenceNumber
        );
        setServiceId(result.application.ServiceId || serviceId);

        const newFormData = {};
        normalizedFields.forEach((item) => {
          newFormData[item.name] = item.value;
        });

        // Populate corrigendumFields if applicationId is provided
        let newCorrigendumFields = [];
        let newErrors = {};
        if (applicationId && result.corrigendumFields) {
          try {
            const corrigendumFieldsData = JSON.parse(result.corrigendumFields);
            let index = 0;
            for (const [name, fieldData] of Object.entries(
              corrigendumFieldsData
            )) {
              const fieldConfig = findFieldConfig(name, parsedFormElements);
              const formDetail = normalizedFields.find(
                (item) => item.name === name
              );
              console.log(
                "Form Detail",
                formDetail,
                "Form Details Fields",
                normalizedFields,
                "Field Config",
                fieldConfig
              );
              const selected = normalizedFields.find(
                (item) =>
                  item.name === formDetail.name &&
                  item.label === formDetail.label
              );

              if (!formDetail) {
                console.warn(`Field ${name} not found in formDetailsFields`);
                continue;
              }
              const newField = {
                label: selected.label,
                name: selected.name,
                oldValue: selected.value,
                newValue: fieldData.new_value,
                additionalValues: {},
                type: fieldConfig.type,
                options: fieldConfig.options || [],
                validationFunctions: fieldConfig.validationFunctions || [],
                transformationFunctions:
                  fieldConfig.transformationFunctions || [],
                additionalFields: fieldConfig.additionalFields || {},
              };
              newCorrigendumFields.push(newField);

              index++;
            }
          } catch (error) {
            console.error("Error parsing corrigendumFields:", error);
            toast.error("Invalid corrigendum fields data from server.", {
              position: "top-right",
              autoClose: 3000,
              theme: "colored",
            });
          }
        }

        setCorrigendumFields(newCorrigendumFields);
        setErrors(newErrors);
        setFormData(newFormData);
        handleAddCorrigendumField();

        // Revalidate all fields to ensure consistency
        const revalidatedErrors = await revalidateAllFields(
          newCorrigendumFields,
          newFormData,
          result.application.ReferenceNumber
        );
        setErrors(revalidatedErrors);

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
      console.error("Error in handleCheckIfCorrigendum:", error);
      toast.error("Error checking application. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

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

    const selected = formDetailsFields.find(
      (item) => item.name === name && item.label === label
    );
    if (!selected) {
      toast.error("Selected field not found.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    const fieldConfig = findFieldConfig(name);
    if (!fieldConfig) {
      toast.error("Field configuration not found.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    const newField = {
      label: selected.label,
      name: selected.name,
      oldValue: selected.value,
      newValue: "",
      additionalValues: {},
      type: fieldConfig.type,
      options: fieldConfig.options || [],
      validationFunctions: fieldConfig.validationFunctions || [],
      transformationFunctions: fieldConfig.transformationFunctions || [],
      additionalFields: fieldConfig.additionalFields || {},
    };

    setCorrigendumFields((prev) => [...prev, newField]);
    setSelectedField("");

    // Validate the new field
    const updatedFields = [...corrigendumFields, newField];
    revalidateAllFields(updatedFields, formData, referenceNumber).then(
      (newErrors) => {
        setErrors(newErrors);
      }
    );
  };

  const handleNewValueChange = async (
    index,
    value,
    additionalFieldName = null
  ) => {
    const updated = [...corrigendumFields];
    const field = updated[index];

    let transformedValue;
    let error;

    if (additionalFieldName) {
      const additionalFieldConfig = (
        field.additionalFields[field.newValue] || []
      ).find((f) => f.name === additionalFieldName);
      if (!additionalFieldConfig) {
        console.warn(
          `Additional field config not found for ${additionalFieldName}`
        );
        return;
      }

      transformedValue = value;
      for (const transformFn of additionalFieldConfig.transformationFunctions ||
        []) {
        if (TransformationFunctionsList[transformFn]) {
          transformedValue =
            TransformationFunctionsList[transformFn](transformedValue);
        }
      }

      const validationResult = await runValidations(
        {
          ...additionalFieldConfig,
          validationFunctions: additionalFieldConfig.validationFunctions || [],
        },
        transformedValue,
        formData,
        referenceNumber
      );

      error = validationResult === true ? null : validationResult;

      setErrors((prev) => ({
        ...prev,
        [`${index}-${additionalFieldName}`]: error,
      }));

      updated[index].additionalValues = {
        ...field.additionalValues,
        [additionalFieldName]: transformedValue,
      };
    } else {
      const result = await validateField(
        field,
        value,
        formData,
        referenceNumber
      );
      transformedValue = result.transformedValue;
      error = result.error;

      updated[index].newValue = transformedValue;

      setErrors((prev) => ({
        ...prev,
        [index]: error,
      }));
    }

    setCorrigendumFields(updated);
    setFormData((prev) => ({
      ...prev,
      [additionalFieldName || field.name]: transformedValue,
    }));

    // Revalidate all fields to ensure consistency
    const newErrors = await revalidateAllFields(
      updated,
      formData,
      referenceNumber
    );
    setErrors(newErrors);

    if (error) {
      toast.warning(
        `Validation error for ${additionalFieldName || field.name}: ${error}`,
        {
          position: "top-right",
          autoClose: 2000,
          theme: "colored",
        }
      );
    }
  };

  const handleRemoveCorrigendumField = (index) => {
    const updated = [...corrigendumFields];
    updated.splice(index, 1);
    setCorrigendumFields(updated);
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith(`${index}-`) || key === `${index}`) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };

  const generateCorrigendumObject = () => {
    const corrigendumObject = corrigendumFields.reduce((acc, field) => {
      acc[field.name] = {
        old_value: field.oldValue,
        new_value: field.newValue,
        additional_values: field.additionalValues || {},
      };
      return acc;
    }, {});
    return corrigendumObject;
  };

  const handleSubmitCorrigendum = async () => {
    if (corrigendumFields.length === 0) {
      toast.warning("Please add at least one field to submit.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    const hasEmptyNewValue = corrigendumFields.some((field) => !field.newValue);
    const hasValidationErrors = Object.values(errors).some(
      (error) => error !== null
    );
    if (hasEmptyNewValue) {
      toast.warning("Please fill in all new values before submitting.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }
    if (hasValidationErrors) {
      toast.warning("Please correct all validation errors before submitting.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    setLoading(true);
    try {
      const corrigendumObject = generateCorrigendumObject();
      try {
        JSON.parse(JSON.stringify(corrigendumObject));
      } catch (error) {
        toast.error("Invalid corrigendum fields format.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("referenceNumber", referenceNumber);
      formData.append("remarks", remarks);
      formData.append("serviceId", serviceId);
      formData.append("corrigendumFields", JSON.stringify(corrigendumObject));
      if (applicationId) {
        formData.append("applicationId", applicationId);
      }

      console.log("Form Data", formData);

      const response = await axiosInstance.post(
        "/Officer/SubmitCorrigendum",
        formData
      );

      if (response.data.status) {
        toast.success(
          response.data.message || "Corrigendum submitted successfully!",
          {
            position: "top-right",
            autoClose: 3000,
            theme: "colored",
          }
        );
        setCorrigendumFields([]);
        setSelectedField("");
        setRemarks("");
        setCanIssue(false);
        setReferenceNumber("");
        setServiceId("");
        setErrors({});
        setFormData({});
      } else {
        toast.error(response.data.message || "Failed to submit corrigendum.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Error submitting corrigendum. Please try again.",
        {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const renderInputField = (field, index) => {
    const renderPrimaryInput = () => {
      switch (field.type) {
        case "select":
          return (
            <StyledFormControl sx={{ minWidth: 200 }}>
              <InputLabel>New Value</InputLabel>
              <Select
                value={field.newValue}
                onChange={(e) => handleNewValueChange(index, e.target.value)}
                label="New Value"
                error={!!errors[index]}
              >
                {field.options
                  .filter((option) => option.value !== "Please Select")
                  .map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
              </Select>
              {errors[index] && (
                <Typography color="error" variant="caption">
                  {errors[index]}
                </Typography>
              )}
            </StyledFormControl>
          );
        case "date":
          return (
            <TextField
              type="date"
              label="New Value"
              value={field.newValue}
              onChange={(e) => handleNewValueChange(index, e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={!!errors[index]}
              helperText={errors[index] || ""}
              sx={{ minWidth: 200 }}
            />
          );
        case "email":
          return (
            <TextField
              type="email"
              label="New Value"
              value={field.newValue}
              onChange={(e) => handleNewValueChange(index, e.target.value)}
              error={!!errors[index]}
              helperText={errors[index] || ""}
              sx={{ minWidth: 200 }}
            />
          );
        case "text":
        default:
          return (
            <TextField
              label="New Value"
              value={field.newValue}
              onChange={(e) => handleNewValueChange(index, e.target.value)}
              error={!!errors[index]}
              helperText={errors[index] || ""}
              sx={{ minWidth: 200 }}
            />
          );
      }
    };

    const renderAdditionalFields = () => {
      if (!field.newValue || !field.additionalFields[field.newValue]) {
        return null;
      }

      const additionalFields = field.additionalFields[field.newValue] || [];
      return additionalFields.map((addField) => {
        const errorKey = `${index}-${addField.name}`;
        switch (addField.type) {
          case "select":
            return (
              <StyledFormControl sx={{ minWidth: 200 }} key={addField.name}>
                <InputLabel>{addField.label}</InputLabel>
                <Select
                  value={field.additionalValues[addField.name] || ""}
                  onChange={(e) =>
                    handleNewValueChange(index, e.target.value, addField.name)
                  }
                  label={addField.label}
                  error={!!errors[errorKey]}
                >
                  {addField.options
                    .filter((option) => option.value !== "Please Select")
                    .map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                </Select>
                {errors[errorKey] && (
                  <Typography color="error" variant="caption">
                    {errors[errorKey]}
                  </Typography>
                )}
              </StyledFormControl>
            );
          case "date":
            return (
              <TextField
                key={addField.name}
                type="date"
                label={addField.label}
                value={field.additionalValues[addField.name] || ""}
                onChange={(e) =>
                  handleNewValueChange(index, e.target.value, addField.name)
                }
                InputLabelProps={{ shrink: true }}
                error={!!errors[errorKey]}
                helperText={errors[errorKey] || ""}
                sx={{ minWidth: 200 }}
              />
            );
          case "email":
            return (
              <TextField
                key={addField.name}
                type="email"
                label={addField.label}
                value={field.additionalValues[addField.name] || ""}
                onChange={(e) =>
                  handleNewValueChange(index, e.target.value, addField.name)
                }
                error={!!errors[errorKey]}
                helperText={errors[errorKey] || ""}
                sx={{ minWidth: 200 }}
              />
            );
          case "text":
          default:
            return (
              <TextField
                key={addField.name}
                label={addField.label}
                value={field.additionalValues[addField.name] || ""}
                onChange={(e) =>
                  handleNewValueChange(index, e.target.value, addField.name)
                }
                error={!!errors[errorKey]}
                helperText={errors[errorKey] || ""}
                sx={{ minWidth: 200 }}
              />
            );
        }
      });
    };

    return (
      <Box
        sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}
      >
        {renderPrimaryInput()}
        {renderAdditionalFields()}
      </Box>
    );
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
        background: "linear-gradient(to bottom, #75aecfff 0%, #417ac5ff 100%)",
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
          {applicationId != null ? "Edit Corrigendum" : "Issue Corrigendum"}
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
            value={serviceId}
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
            disabled={!!applicationId}
          />

          <StyledButton
            onClick={handleCheckIfCorrigendum}
            disabled={loading || !!applicationId}
          >
            Check Application
          </StyledButton>
        </Box>

        {canIssue && (
          <Box sx={{ mt: 6 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: "600", color: "#333", mb: 3 }}
              >
                Corrigendum (Form Details)
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: "400", color: "#333", mb: 3 }}
              >
                Reference Number: {referenceNumber}
              </Typography>
            </Box>
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
                  {formDetailsFields
                    .filter(
                      (item) =>
                        !corrigendumFields.some((f) => f.name === item.name)
                    )
                    .map((item) => (
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
            {formDetailsFields.length === 0 && (
              <Typography color="error" sx={{ mt: 2 }}>
                No editable fields available for this application.
              </Typography>
            )}

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
                  label="Field"
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
                {renderInputField(field, index)}
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

            <TextField
              name="remarks"
              label="Remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              multiline
              rows={4}
              sx={{
                width: "100%",
                mt: 2,
                "& .MuiInputBase-root": {
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                },
              }}
            />

            {corrigendumFields.length > 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <StyledButton
                  onClick={handleSubmitCorrigendum}
                  disabled={loading}
                >
                  Submit Corrigendum
                </StyledButton>
              </Box>
            )}
          </Box>
        )}
      </StyledContainer>
      <ToastContainer />
    </Box>
  );
}

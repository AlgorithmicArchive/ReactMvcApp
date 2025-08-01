import React, { useEffect, useState, useRef } from "react";
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
  FormHelperText,
} from "@mui/material";
import { styled } from "@mui/system";
import { Delete as DeleteIcon } from "@mui/icons-material";
import ServiceSelectionForm from "../../components/ServiceSelectionForm";
import { fetchServiceList } from "../../assets/fetch";
import axiosInstance from "../../axiosConfig";
import {
  runValidations,
  TransformationFunctionsList,
} from "../../assets/formvalidations";
import { useLocation } from "react-router-dom";
import { MaterialReactTable } from "material-react-table";

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
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({});
  const [touched, setTouched] = useState({ remarks: false, files: false });
  const [nextOfficer, setNextOfficer] = useState("");
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [responseMessage, setResponseMessage] = useState({
    message: "",
    type: "",
  });
  const fileInputRef = useRef(null);

  const location = useLocation();
  const { ReferenceNumber, ServiceId, applicationId } = location.state || {};

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        await fetchServiceList(setServices);
      } catch (error) {
        setResponseMessage({
          message: "Failed to load services. Please try again.",
          type: "error",
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
    for (const section of parsedFormElements) {
      for (const field of section.fields) {
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

  const applyTransformations = (value, transformationFunctions) => {
    let transformedValue = value || "";
    for (const transformFn of transformationFunctions || []) {
      if (TransformationFunctionsList[transformFn]) {
        transformedValue =
          TransformationFunctionsList[transformFn](transformedValue);
      }
    }
    return transformedValue;
  };

  const validateField = async (field, value, formData, referenceNumber) => {
    const fieldConfig = findFieldConfig(field.name);

    if (value === field.oldValue) {
      return {
        transformedValue: value,
        error: "New value cannot be the same as old value",
      };
    }

    const validationResult = await runValidations(
      {
        ...fieldConfig,
        validationFunctions: fieldConfig.validationFunctions || [],
      },
      value,
      formData,
      referenceNumber,
    );

    return {
      transformedValue: value,
      error: validationResult === true ? null : validationResult,
    };
  };

  const validateRemarks = (value) => {
    return value.trim() ? null : "Remarks are required";
  };

  const validateFiles = (files) => {
    return files.length > 0
      ? null
      : "At least one verification document is required";
  };

  const revalidateAllFields = async (
    updatedFields,
    formData,
    referenceNumber,
    validateRemarksAndFiles = false,
  ) => {
    const newErrors = {};
    for (let i = 0; i < updatedFields.length; i++) {
      const field = updatedFields[i];
      if (field.newValue) {
        const { error } = await validateField(
          field,
          field.newValue,
          formData,
          referenceNumber,
        );
        newErrors[i] = error;

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
              referenceNumber,
            );
            newErrors[`${i}-${additionalFieldName}`] =
              validationResult === true ? null : validationResult;
          }
        }
      }
    }
    if (validateRemarksAndFiles) {
      newErrors.remarks = validateRemarks(remarks);
      newErrors.files = validateFiles(files);
    }
    return newErrors;
  };

  const handleCheckIfCorrigendum = async () => {
    if (!applicationId && (!referenceNumber || !serviceId)) {
      setResponseMessage({
        message: "Please provide both reference number and service.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    setResponseMessage({ message: "", type: "" });
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
        { params },
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
        setNextOfficer(result.nextOfficer);
        if (applicationId != null) {
          setColumns(result.columns);
          setData(result.data);
        }

        setReferenceNumber(
          result.application.ReferenceNumber || referenceNumber,
        );
        setServiceId(result.application.ServiceId || serviceId);

        const newFormData = {};
        normalizedFields.forEach((item) => {
          newFormData[item.name] = item.value;
        });

        let newCorrigendumFields = [];
        let newErrors = {};
        if (applicationId && result.corrigendumFields) {
          try {
            const corrigendumFieldsData = JSON.parse(result.corrigendumFields);
            let index = 0;
            for (const [name, fieldData] of Object.entries(
              corrigendumFieldsData,
            )) {
              const fieldConfig = findFieldConfig(name, parsedFormElements);
              const formDetail = normalizedFields.find(
                (item) => item.name === name,
              );
              const selected = normalizedFields.find(
                (item) =>
                  item.name === formDetail.name &&
                  item.label === formDetail.label,
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

              const { error } = await validateField(
                newField,
                newField.newValue,
                newFormData,
                result.application.ReferenceNumber,
              );
              newErrors[index] = error;

              index++;
            }
          } catch (error) {
            console.error("Error parsing corrigendumFields:", error);
            setResponseMessage({
              message: "Invalid corrigendum fields data from server.",
              type: "error",
            });
          }
        }

        setCorrigendumFields(newCorrigendumFields);
        setErrors(newErrors);
        setFormData(newFormData);
        if (!applicationId) {
          handleAddCorrigendumField();
        }

        setResponseMessage({
          message: "Application found. You can issue a corrigendum.",
          type: "success",
        });
      } else {
        setCanIssue(false);
        setResponseMessage({
          message: result.message,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error in handleCheckIfCorrigendum:", error);
      setResponseMessage({
        message: "Error checking application. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCorrigendumField = () => {
    if (!selectedField) {
      setErrors((prev) => ({
        ...prev,
        selectedField: "Please select a field to add.",
      }));
      return;
    }

    const [label, name] = selectedField.split("|");
    const existing = corrigendumFields.find((f) => f.name === name);
    if (existing) {
      setErrors((prev) => ({
        ...prev,
        selectedField: "This field is already added.",
      }));
      return;
    }

    const selected = formDetailsFields.find(
      (item) => item.name === name && item.label === label,
    );
    if (!selected) {
      setErrors((prev) => ({
        ...prev,
        selectedField: "Selected field not found.",
      }));
      return;
    }

    const fieldConfig = findFieldConfig(name);
    if (!fieldConfig) {
      setErrors((prev) => ({
        ...prev,
        selectedField: "Field configuration not found.",
      }));
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
    setErrors((prev) => ({ ...prev, selectedField: null }));

    const updatedFields = [...corrigendumFields, newField];
    revalidateAllFields(updatedFields, formData, referenceNumber).then(
      (newErrors) => {
        setErrors(newErrors);
      },
    );
  };

  const handleNewValueChange = (index, value, additionalFieldName = null) => {
    const updated = [...corrigendumFields];
    const field = updated[index];
    let transformedValue;

    if (additionalFieldName) {
      const additionalFieldConfig = (
        field.additionalFields[field.newValue] || []
      ).find((f) => f.name === additionalFieldName);
      if (!additionalFieldConfig) {
        console.warn(
          `Additional field config not found for ${additionalFieldName}`,
        );
        return;
      }
      transformedValue = applyTransformations(
        value,
        additionalFieldConfig.transformationFunctions,
      );
      updated[index].additionalValues = {
        ...field.additionalValues,
        [additionalFieldName]: transformedValue,
      };
      setFormData((prev) => ({
        ...prev,
        [additionalFieldName]: transformedValue,
      }));
    } else {
      transformedValue = applyTransformations(
        value,
        field.transformationFunctions,
      );
      updated[index].newValue = transformedValue;
      setFormData((prev) => ({
        ...prev,
        [field.name]: transformedValue,
      }));
    }

    setCorrigendumFields(updated);
  };

  const handleNewValueBlur = async (
    index,
    value,
    additionalFieldName = null,
  ) => {
    const updated = [...corrigendumFields];
    const field = updated[index];

    let error;

    if (additionalFieldName) {
      const additionalFieldConfig = (
        field.additionalFields[field.newValue] || []
      ).find((f) => f.name === additionalFieldName);
      if (!additionalFieldConfig) {
        console.warn(
          `Additional field config not found for ${additionalFieldName}`,
        );
        return;
      }

      const validationResult = await runValidations(
        {
          ...additionalFieldConfig,
          validationFunctions: additionalFieldConfig.validationFunctions || [],
        },
        field.additionalValues[additionalFieldName],
        formData,
        referenceNumber,
      );

      error = validationResult === true ? null : validationResult;
      setErrors((prev) => ({
        ...prev,
        [`${index}-${additionalFieldName}`]: error,
      }));
    } else {
      const result = await validateField(
        field,
        field.newValue,
        formData,
        referenceNumber,
      );
      error = result.error;
      setErrors((prev) => ({
        ...prev,
        [index]: error,
      }));
    }

    const newErrors = await revalidateAllFields(
      updated,
      formData,
      referenceNumber,
      true,
    );
    setErrors(newErrors);
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
    setTouched((prev) => ({ ...prev, files: true }));
    const error = validateFiles([...files, ...selectedFiles]);
    setErrors((prev) => ({ ...prev, files: error }));
    event.target.value = "";
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setTouched((prev) => ({ ...prev, files: true }));
    const error = validateFiles(files.filter((_, i) => i !== index));
    setErrors((prev) => ({ ...prev, files: error }));
  };

  const handleAddFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemarksBlur = () => {
    setTouched((prev) => ({ ...prev, remarks: true }));
    const error = validateRemarks(remarks);
    setErrors((prev) => ({ ...prev, remarks: error }));
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
      setErrors((prev) => ({
        ...prev,
        corrigendumFields: "Please add at least one field to submit.",
      }));
      return;
    }

    setTouched((prev) => ({ ...prev, remarks: true, files: true }));

    const newErrors = await revalidateAllFields(
      corrigendumFields,
      formData,
      referenceNumber,
      true,
    );
    setErrors(newErrors);

    const hasEmptyNewValue = corrigendumFields.some((field) => !field.newValue);
    const hasValidationErrors = Object.values(newErrors).some(
      (error) => error !== null,
    );

    if (hasEmptyNewValue) {
      setErrors((prev) => ({
        ...prev,
        corrigendumFields: "Please fill in all new values before submitting.",
      }));
      return;
    }

    if (hasValidationErrors) {
      setErrors((prev) => ({
        ...prev,
        corrigendumFields:
          "Please correct all validation errors before submitting.",
      }));
      return;
    }

    setLoading(true);
    setResponseMessage({ message: "", type: "" });
    try {
      const corrigendumObject = generateCorrigendumObject();
      try {
        JSON.parse(JSON.stringify(corrigendumObject));
      } catch (error) {
        setResponseMessage({
          message: "Invalid corrigendum fields format.",
          type: "error",
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
      files.forEach((file, index) => {
        formData.append(`verificationDocuments[${index}]`, file);
      });

      const response = await axiosInstance.post(
        "/Officer/SubmitCorrigendum",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response.data.status) {
        setResponseMessage({
          message:
            response.data.message || "Corrigendum submitted successfully!",
          type: "success",
        });
        setCorrigendumFields([]);
        setSelectedField("");
        setRemarks("");
        setFiles([]);
        setCanIssue(false);
        setReferenceNumber("");
        setServiceId("");
        setErrors({});
        setFormData({});
        setTouched({ remarks: false, files: false });
        setNextOfficer("");
      } else {
        setResponseMessage({
          message: response.data.message || "Failed to submit corrigendum.",
          type: "error",
        });
      }
    } catch (error) {
      setResponseMessage({
        message:
          error.response?.data?.message ||
          "Error submitting corrigendum. Please try again.",
        type: "error",
      });
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
                onBlur={(e) => handleNewValueBlur(index, e.target.value)}
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
                <FormHelperText error>{errors[index]}</FormHelperText>
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
              onBlur={(e) => handleNewValueBlur(index, e.target.value)}
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
              onBlur={(e) => handleNewValueBlur(index, e.target.value)}
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
              onBlur={(e) => handleNewValueBlur(index, e.target.value)}
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
                  onBlur={(e) =>
                    handleNewValueBlur(index, e.target.value, addField.name)
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
                  <FormHelperText error>{errors[errorKey]}</FormHelperText>
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
                onBlur={(e) =>
                  handleNewValueBlur(index, e.target.value, addField.name)
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
                onBlur={(e) =>
                  handleNewValueBlur(index, e.target.value, addField.name)
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
                onBlur={(e) =>
                  handleNewValueBlur(index, e.target.value, addField.name)
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

          {responseMessage.message && (
            <Typography
              sx={{ mt: 2 }}
              color={
                responseMessage.type === "error" ? "error" : "success.main"
              }
            >
              {responseMessage.message}
            </Typography>
          )}
        </Box>

        {applicationId != null && (
          <Box>
            <MaterialTable
              columns={columns}
              data={data}
              viewType={"Corrigendum History"}
            />
          </Box>
        )}

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
                  error={!!errors.selectedField}
                >
                  <MenuItem value="" disabled>
                    Select a field
                  </MenuItem>
                  {formDetailsFields
                    .filter(
                      (item) =>
                        !corrigendumFields.some((f) => f.name === item.name) &&
                        [
                          "ApplicantName",
                          "DateOfBirth",
                          "IfscCode",
                          "AccountNumber",
                        ].includes(item.name),
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
                {errors.selectedField && (
                  <FormHelperText error>{errors.selectedField}</FormHelperText>
                )}
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
            {errors.corrigendumFields && (
              <Typography color="error" sx={{ mt: 2, mb: 2 }}>
                {errors.corrigendumFields}
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
                  onClick={() => {
                    const updatedFields = corrigendumFields.filter(
                      (_, i) => i !== index,
                    );
                    setCorrigendumFields(updatedFields);
                    revalidateAllFields(
                      updatedFields,
                      formData,
                      referenceNumber,
                      true,
                    ).then((newErrors) => {
                      setErrors(newErrors);
                    });
                  }}
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
              onBlur={handleRemarksBlur}
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
              error={!!errors.remarks}
              helperText={errors.remarks || ""}
            />

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, color: "#333" }}>
                Verification Documents
              </Typography>
              <StyledButton
                variant="outlined"
                onClick={handleAddFileClick}
                sx={{ mb: 2 }}
              >
                Add Verification Document
              </StyledButton>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                style={{ display: "none" }}
                ref={fileInputRef}
              />
              {errors.files && (
                <FormHelperText error sx={{ mt: 1, mb: 1 }}>
                  {errors.files}
                </FormHelperText>
              )}
              {files.length > 0 && (
                <Box
                  sx={{
                    mt: 1,
                    display: "flex",
                    flexDirection: "row",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  {files.map((file, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "max-content",
                        backgroundColor: "#f9f9f9",
                        padding: "8px 12px",
                        border: "1px solid #000",
                        borderRadius: "8px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: "#333", pr: 2 }}
                      >
                        {file.name}
                      </Typography>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveFile(index)}
                        sx={{
                          "&:hover": {
                            backgroundColor: "rgba(211, 47, 47, 0.1)",
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {corrigendumFields.length > 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <StyledButton
                  onClick={handleSubmitCorrigendum}
                  disabled={loading}
                >
                  {`Forward Corrigendum to ${nextOfficer}`}
                </StyledButton>
              </Box>
            )}
          </Box>
        )}
      </StyledContainer>
    </Box>
  );
}

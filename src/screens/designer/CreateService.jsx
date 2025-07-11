import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import { Col, Row, Container } from "react-bootstrap";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import SortableSection from "../../components/designer/SortableSections";
import FieldEditModal from "../../components/designer/FieldEditModal";
import AdditionalFieldsModal from "../../components/designer/AdditionalFieldsModal";
import { defaultFormConfig } from "../../assets/dummyData";
import axiosInstance from "../../axiosConfig";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Function to normalize a field object to include all required properties
const normalizeField = (field, timestamp = Date.now()) => ({
  id:
    field.id ||
    `field-${timestamp}-${Math.random().toString(36).substring(2, 9)}`,
  type: field.type || "text",
  label: field.label || "New Field",
  name: field.name || `NewField_${timestamp}`,
  minLength: field.minLength !== undefined ? field.minLength : 5,
  maxLength: field.maxLength !== undefined ? field.maxLength : 50,
  options: Array.isArray(field.options) ? field.options : [],
  span: field.span !== undefined ? field.span : 12,
  validationFunctions: Array.isArray(field.validationFunctions)
    ? field.validationFunctions
    : [],
  transformationFunctions: Array.isArray(field.transformationFunctions)
    ? field.transformationFunctions
    : [],
  additionalFields: normalizeAdditionalFields(
    field.additionalFields || {},
    timestamp
  ),
  accept: field.accept || "",
  editable: field.editable !== undefined ? field.editable : true,
  value: field.value || undefined,
  dependentOn: field.dependentOn || undefined,
  dependentOptions: field.dependentOptions || undefined,
  isDependentEnclosure: field.isDependentEnclosure || false,
  dependentField: field.dependentField || undefined,
  dependentValues: Array.isArray(field.dependentValues)
    ? field.dependentValues
    : [],
  isConsentCheckbox: field.isConsentCheckbox ?? false, // Add isConsentCheckbox
  checkboxLayout: field.checkboxLayout || "vertical",
});

// Function to recursively normalize additionalFields
const normalizeAdditionalFields = (additionalFields, timestamp) => {
  const normalized = {};
  Object.keys(additionalFields).forEach((option) => {
    normalized[option] = (additionalFields[option] || []).map((field) =>
      normalizeField(field, timestamp)
    );
  });
  return normalized;
};

// Function to normalize sections and their fields
const normalizeSections = (sections) => {
  return sections.map((section) => ({
    ...section,
    id: section.id || `section-${Date.now()}`,
    section: section.section || `Section ${sections.length + 1}`,
    fields: (section.fields || []).map((field) => normalizeField(field)),
    editable: section.editable !== undefined ? section.editable : true,
  }));
};

export default function CreateService() {
  const [sections, setSections] = useState(defaultFormConfig);
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [serviceNameShort, setServiceNameShort] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [isAdditionalModalOpen, setIsAdditionalModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axiosInstance.get("/Base/GetServices");
        if (response.data.status && response.data.services) {
          setServices(response.data.services);
        }
      } catch (err) {
        toast.error("Failed to fetch services");
      }
    }
    fetchData();
  }, []);

  const handleServiceChange = (e) => {
    const serviceId = e.target.value;
    setSelectedServiceId(serviceId);

    if (serviceId === "") {
      setSections(defaultFormConfig);
      setServiceName("");
      setServiceNameShort("");
      setDepartmentName("");
      return;
    }

    const service = services.find((s) => s.serviceId === serviceId);
    if (service) {
      setServiceName(service.serviceName || "");
      setServiceNameShort(service.nameShort || "");
      setDepartmentName(service.department || "");
      if (service.formElement) {
        try {
          const config = JSON.parse(service.formElement);
          setSections(normalizeSections(config));
        } catch (err) {
          console.error("Error parsing formElements:", err);
          toast.error("Invalid form data format.");
          setSections(defaultFormConfig);
        }
      } else {
        setSections(defaultFormConfig);
      }
    }
  };

  const handleAddSection = () => {
    const newSection = {
      id: `section-${sections.length + 1}`,
      section: `Section ${sections.length + 1}`,
      fields: [],
      editable: true,
    };
    setSections((prev) => [...prev, newSection]);
  };

  const handleAddSectionAfter = (sectionId) => {
    const index = sections.findIndex((section) => section.id === sectionId);
    if (index === -1) return;

    const newSection = {
      id: `section-${Date.now()}`,
      section: `Section ${sections.length + 1}`,
      fields: [],
      editable: true,
    };

    const newSections = [
      ...sections.slice(0, index + 1),
      newSection,
      ...sections.slice(index + 1),
    ];
    setSections(newSections);
  };

  const handleDuplicateSection = (sectionId) => {
    const sectionToDuplicate = sections.find(
      (section) => section.id === sectionId
    );
    if (sectionToDuplicate) {
      const newSection = {
        ...sectionToDuplicate,
        id: `section-${sections.length + 1}`,
        section: `${sectionToDuplicate.section} Copy`,
        fields: sectionToDuplicate.fields.map((field) =>
          normalizeField({
            ...field,
            id: `field-${Date.now()}-${Math.random()
              .toString(36)
              .substring(2, 9)}`,
          })
        ),
      };
      setSections((prev) => [...prev, newSection]);
    }
  };

  const handleRemoveSection = (sectionId) => {
    setSections((prev) => prev.filter((section) => section.id !== sectionId));
  };

  const handleAddField = (sectionId) => {
    const newField = {
      id: `field-${Date.now()}`,
      type: "text",
      label: "New Field",
      name: `NewField_${Date.now()}`,
      minLength: 5,
      maxLength: 50,
      options: [],
      span: 12,
      validationFunctions: [],
      transformationFunctions: [],
      additionalFields: {},
      accept: "",
      editable: true,
      value: undefined,
      dependentOn: undefined,
      dependentOptions: undefined,
      isDependentEnclosure: false,
      dependentField: undefined,
      dependentValues: [],
    };

    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, fields: [...section.fields, newField] }
          : section
      )
    );
  };

  const handleSectionNameChange = (sectionId, newName) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, section: newName } : section
      )
    );
  };

  const handleUpdateSectionFields = (sectionId, newFields) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, fields: newFields } : section
      )
    );
  };

  const handleLogForm = async () => {
    const formdata = new FormData();
    if (!serviceName || !serviceNameShort || !departmentName) {
      toast.error(
        "Please provide Service Name, Service Name Short, and Department Name."
      );
      return;
    }
    console.log("Sections", sections);
    formdata.append("serviceName", serviceName);
    formdata.append("serviceNameShort", serviceNameShort);
    formdata.append("departmentName", departmentName);
    formdata.append("serviceId", selectedServiceId);
    formdata.append("formElement", JSON.stringify(sections));

    try {
      const response = await axiosInstance.post("/Base/FormElement", formdata);
      const result = response.data;
      if (result.status) {
        toast.success(
          selectedServiceId
            ? "Service updated successfully!"
            : "New service created successfully!"
        );
        if (!selectedServiceId) {
          setServiceName("");
          setServiceNameShort("");
          setDepartmentName("");
          setSections(defaultFormConfig);
          setSelectedServiceId("");
        }
        const servicesResponse = await axiosInstance.get("/Base/GetServices");
        if (servicesResponse.data.status && servicesResponse.data.services) {
          setServices(servicesResponse.data.services);
        }
      } else {
        toast.error(result.response || "Failed to save service.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    }
  };

  const updateField = (updatedField) => {
    console.log("UPDATED Field", updatedField);
    setSections((prev) => {
      // If sectionId is present, update main field
      if (updatedField.sectionId) {
        return prev.map((section) =>
          section.id === updatedField.sectionId
            ? {
                ...section,
                fields: section.fields.map((field) =>
                  field.id === updatedField.id
                    ? normalizeField(updatedField)
                    : field
                ),
              }
            : section
        );
      } else {
        // Handle additional fields (no sectionId)
        return prev.map((section) =>
          section.fields.some((field) => field.id === updatedField.id)
            ? {
                ...section,
                fields: section.fields.map((field) =>
                  field.id === updatedField.id
                    ? normalizeField(updatedField)
                    : field
                ),
              }
            : section
        );
      }
    });
  };

  const handleRemoveField = (sectionId, fieldId) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.filter((field) => field.id !== fieldId),
            }
          : section
      )
    );
  };

  const updateFieldValue = (sectionId, fieldId, newValue) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.map((field) =>
                field.id === fieldId ? { ...field, value: newValue } : field
              ),
            }
          : section
      )
    );
    console.log("Updated field value:", { sectionId, fieldId, newValue });
  };

  const sectionSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleSectionDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    setSections((prev) => arrayMove(prev, oldIndex, newIndex));
  };

  const handleEditField = (field) => {
    setSelectedField({
      ...field,
      sectionId: sections.find((section) =>
        section.fields.some((f) => f.id === field.id)
      )?.id,
    });
    setIsModalOpen(true);
  };

  const handleAdditionalModal = (field) => {
    setSelectedField(field);
    setIsAdditionalModalOpen(true);
  };

  return (
    <Container fluid sx={{ bgcolor: "grey.100", minHeight: "100vh", py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          maxWidth: 1400,
          mx: "auto",
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "white",
        }}
      >
        <Box sx={{ p: 4, bgcolor: "primary.main", color: "white" }}>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Service Configuration
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.8 }}>
            Create or edit services with customizable form sections
          </Typography>
        </Box>
        <Box sx={{ p: 4 }}>
          <Row>
            <Col lg={3} md={12} xs={12}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: "grey.50",
                  height: "100%",
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="service-select-label">
                      Select Service
                    </InputLabel>
                    <Select
                      labelId="service-select-label"
                      value={selectedServiceId}
                      label="Select Service"
                      onChange={handleServiceChange}
                      sx={{
                        bgcolor: "white",
                        borderRadius: 1,
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "grey.300",
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>Create New Service</em>
                      </MenuItem>
                      {services.map((service) => (
                        <MenuItem
                          key={service.serviceId}
                          value={service.serviceId}
                        >
                          {service.serviceName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Service Name"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    variant="outlined"
                    sx={{
                      bgcolor: "white",
                      borderRadius: 1,
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "grey.300" },
                        "&:hover fieldset": { borderColor: "primary.main" },
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Service Name Short"
                    value={serviceNameShort}
                    onChange={(e) => setServiceNameShort(e.target.value)}
                    variant="outlined"
                    sx={{
                      bgcolor: "white",
                      borderRadius: 1,
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "grey.300" },
                        "&:hover fieldset": { borderColor: "primary.main" },
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Department Name"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    variant="outlined"
                    sx={{
                      bgcolor: "white",
                      borderRadius: 1,
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "grey.300" },
                        "&:hover fieldset": { borderColor: "primary.main" },
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddSection}
                    sx={{
                      py: 1.5,
                      borderRadius: 1,
                      textTransform: "none",
                      fontWeight: "bold",
                      bgcolor: "primary.dark",
                      "&:hover": {
                        bgcolor: "primary.main",
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    Add Section
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleLogForm}
                    sx={{
                      py: 1.5,
                      borderRadius: 1,
                      textTransform: "none",
                      fontWeight: "bold",
                      bgcolor: "success.main",
                      "&:hover": {
                        bgcolor: "success.dark",
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    Save Form
                  </Button>
                </Box>
              </Paper>
            </Col>
            <Col lg={9} md={12} xs={12}>
              <Paper
                elevation={2}
                sx={{
                  p: 4,
                  borderRadius: 2,
                  bgcolor: "white",
                  maxHeight: "60vh",
                  overflowY: "auto",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ mb: 3, fontWeight: "bold", color: "grey.800" }}
                >
                  Form Sections
                </Typography>
                {sections.length === 0 ? (
                  <Typography
                    sx={{ color: "grey.600", textAlign: "center", py: 4 }}
                  >
                    No sections added yet. Click "Add Section" to start.
                  </Typography>
                ) : (
                  <DndContext
                    sensors={sectionSensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleSectionDragEnd}
                  >
                    <SortableContext
                      items={sections.map((section) => section.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {sections.map((section) => (
                        <SortableSection
                          key={section.id}
                          section={section}
                          onAddField={handleAddField}
                          onEditSectionName={handleSectionNameChange}
                          onEditField={handleEditField}
                          onAdditonalModal={handleAdditionalModal}
                          onUpdateSectionFields={handleUpdateSectionFields}
                          onFieldChange={updateFieldValue}
                          onRemoveField={handleRemoveField}
                          onDuplicateSection={handleDuplicateSection}
                          onRemoveSection={handleRemoveSection}
                          onAddSectionAfter={handleAddSectionAfter}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </Paper>
            </Col>
          </Row>
        </Box>
      </Paper>

      {isModalOpen && selectedField && (
        <FieldEditModal
          selectedField={selectedField}
          sections={sections}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedField(null);
          }}
          updateField={updateField}
          sx={{
            bgcolor: "white",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            maxWidth: 600,
            mx: "auto",
            mt: "10%",
            "& .MuiButton-root": {
              borderRadius: 1,
              textTransform: "none",
              fontWeight: "bold",
            },
          }}
        />
      )}
      {isAdditionalModalOpen && selectedField && (
        <AdditionalFieldsModal
          sections={sections}
          selectedField={selectedField}
          onClose={() => {
            setIsAdditionalModalOpen(false);
            setSelectedField(null);
          }}
          updateField={updateField}
          sx={{
            bgcolor: "white",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            maxWidth: 600,
            mx: "auto",
            mt: "10%",
            "& .MuiButton-root": {
              borderRadius: 1,
              textTransform: "none",
              fontWeight: "bold",
            },
          }}
        />
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </Container>
  );
}

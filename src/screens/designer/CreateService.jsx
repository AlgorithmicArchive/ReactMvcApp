import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
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
    if (serviceId == "") {
      setSections(defaultFormConfig);
      setSelectedServiceId("");
      return;
    }
    setSelectedServiceId(serviceId);
    setServiceName(""); // Clear inputs when selecting an existing service
    setServiceNameShort("");
    const service = services.find((s) => s.serviceId === serviceId);
    if (service && service.formElement) {
      try {
        const config = JSON.parse(service.formElement);
        setSections(config);
      } catch (err) {
        console.error("Error parsing formElements:", err);
        toast.error("Invalid form data format.");
        setSections([]);
      }
    } else {
      setSections([]);
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
        fields: sectionToDuplicate.fields.map((field) => ({
          ...field,
          id: `field-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`,
        })),
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
      name: "NewField",
      minLength: 5,
      maxLength: 50,
      options: [],
      span: 12,
      validationFunctions: [],
      transformationFunctions: [],
      additionalFields: {},
      accept: "",
      editable: true,
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
    if (!selectedServiceId) {
      // For new service, ensure serviceName and serviceNameShort are provided
      if (!serviceName || !serviceNameShort || !departmentName) {
        toast.error(
          "Please provide both Service Name and Service Name Short and Department Name."
        );
        return;
      }
      formdata.append("serviceName", serviceName);
      formdata.append("serviceNameShort", serviceNameShort);
      formdata.append("departmentName", departmentName);
    }
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
        // Clear inputs after successful save
        if (!selectedServiceId) {
          setServiceName("");
          setServiceNameShort("");
          setSections(defaultFormConfig);
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
    setSections((prev) =>
      prev.map((section) =>
        section.id === updatedField.sectionId
          ? {
              ...section,
              fields: section.fields.map((field) =>
                field.id === updatedField.id ? updatedField : field
              ),
            }
          : section
      )
    );
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
    setSelectedField(field);
    setIsModalOpen(true);
  };

  const handleAdditionalModal = (field) => {
    setSelectedField(field);
    setIsAdditionalModalOpen(true);
  };

  return (
    <Container fluid>
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 2,
        }}
      >
        <Row style={{ width: "100%" }}>
          <Col lg={2} md={12} xs={12}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="service-select-label">
                  Select Service
                </InputLabel>
                <Select
                  labelId="service-select-label"
                  value={selectedServiceId}
                  label="Select Service"
                  onChange={handleServiceChange}
                >
                  <MenuItem value="">
                    <em>Create New Service</em>
                  </MenuItem>
                  {services.map((service) => (
                    <MenuItem key={service.serviceId} value={service.serviceId}>
                      {service.serviceName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {!selectedServiceId && (
                <>
                  <TextField
                    fullWidth
                    label="Service Name"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    label="Service Name Short"
                    value={serviceNameShort}
                    onChange={(e) => setServiceNameShort(e.target.value)}
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    label="Department Name"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    variant="outlined"
                  />
                </>
              )}
              <Button variant="contained" onClick={handleAddSection}>
                Add Section
              </Button>
              <Button variant="contained" onClick={handleLogForm}>
                Save Form
              </Button>
            </Box>
          </Col>
          <Col lg={10} md={12} xs={12}>
            <Box
              sx={{
                borderRadius: 5,
                backgroundColor: "white",
                width: "100%",
                height: "80vh",
                padding: 5,
                color: "black",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
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
            </Box>
          </Col>
        </Row>
      </Box>

      {isModalOpen && selectedField && (
        <FieldEditModal
          selectedField={selectedField}
          sections={sections}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedField(null);
          }}
          updateField={updateField}
        />
      )}
      {isAdditionalModalOpen && selectedField && (
        <AdditionalFieldsModal
          selectedField={selectedField}
          onClose={() => {
            setIsAdditionalModalOpen(false);
            setSelectedField(null);
          }}
          updateField={updateField}
        />
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </Container>
  );
}

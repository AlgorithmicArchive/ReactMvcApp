import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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

export default function CreateService() {
  // State for our dynamic form config.
  const [sections, setSections] = useState(defaultFormConfig);
  // State for service selection and services list.
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [isAdditionalModalOpen, setIsAdditionalModalOpen] = useState(false);

  // Fetch active services for selection.
  useEffect(() => {
    async function fetchData(){
      const response = await axiosInstance.get('/Base/GetServices');
      if(response.data.status && response.data.services){
        setServices(response.data.services);
      }
    }
    fetchData();
  }, []);

  // When a service is selected, parse its formElements config.
  const handleServiceChange = (e) => {
    const serviceId = e.target.value;
    setSelectedServiceId(serviceId);
    const service = services.find((s) => s.serviceId === serviceId);
    if (service && service.formElement) {
      console.log(service.formElement);
      try {
        const config = JSON.parse(service.formElement);
        setSections(config);
      } catch (err) {
        console.error("Error parsing formElements:", err);
        setSections([]);
      }
    } else {
      setSections([]);
    }
  };

  // Add a new section (for new form configuration).
  const handleAddSection = () => {
    const newSection = {
      id: `section-${sections.length + 1}`,
      section: `Section ${sections.length + 1}`,
      fields: [],
      editable: true,
    };
    setSections((prev) => [...prev, newSection]);
  };

  // Insert a new section after the section with the given id.
  const handleAddSectionAfter = (sectionId) => {
    // Find the index of the section
    const index = sections.findIndex((section) => section.id === sectionId);
    if (index === -1) return;

    // Create a new section. You may adjust the naming as needed.
    const newSection = {
      id: `section-${Date.now()}`, // use a unique value for the id
      section: `Section ${sections.length + 1}`,
      fields: [],
      editable: true,
    };

    // Insert the new section right after the found index.
    const newSections = [
      ...sections.slice(0, index + 1),
      newSection,
      ...sections.slice(index + 1),
    ];
    setSections(newSections);
  };

  // Duplicate a section.
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

  //Remove Section
  const handleRemoveSection = (sectionId) => {
    setSections((prev) => prev.filter((section) => section.id !== sectionId));
  };

  // Add a new field inside a section.
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

  // Update section name.
  const handleSectionNameChange = (sectionId, newName) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, section: newName } : section
      )
    );
  };

  // Update fields order in a section.
  const handleUpdateSectionFields = (sectionId, newFields) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, fields: newFields } : section
      )
    );
  };

  // Log current form state.
  const handleLogForm = async () => {
    const formdata = new FormData();
    formdata.append("serviceId", selectedServiceId);
    formdata.append("formElement", JSON.stringify(sections));

    console.log(sections);
    const response = await fetch("/Base/FormElement", {
      method: "POST",
      body: formdata,
    });
    const result = await response.json();
    console.log(result);

    console.log(formdata);
  };

  // Update a field after editing in the modal.
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

  // Update field value.
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

  // DnD sensors for sections.
  const { attributes, listeners, setNodeRef } = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  });
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

  // Open modal for editing a field.
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
              {/* Service selection dropdown */}
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
                  {services.map((service) => (
                    <MenuItem key={service.serviceId} value={service.serviceId}>
                      {service.serviceName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
              ref={setNodeRef}
              {...attributes}
              {...listeners}
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
    </Container>
  );
}

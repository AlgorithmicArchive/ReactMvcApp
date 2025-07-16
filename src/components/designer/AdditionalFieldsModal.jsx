import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import FieldEditModal from "./FieldEditModal";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// Function to normalize a field, preserving existing values
const normalizeField = (field) => {
  const normalized = {
    id:
      field.id ||
      `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Ensure unique ID
    type: field.type || "text",
    label: field.label || "New Field",
    name: field.name || `NewField_${Date.now()}`,
    minLength: field.minLength ?? 5,
    maxLength: field.maxLength ?? 50,
    options: Array.isArray(field.options) ? field.options : [],
    span: field.span ?? 12,
    validationFunctions: Array.isArray(field.validationFunctions)
      ? field.validationFunctions
      : [],
    transformationFunctions: Array.isArray(field.transformationFunctions)
      ? field.transformationFunctions
      : [],
    additionalFields: normalizeAdditionalFields(field.additionalFields || {}),
    accept: field.accept || "",
    editable: field.editable ?? true,
    value: field.value ?? undefined,
    dependentOn: field.dependentOn ?? undefined,
    dependentOptions: field.dependentOptions ?? undefined,
    isDependentEnclosure: field.isDependentEnclosure ?? false,
    dependentField: field.dependentField ?? undefined,
    dependentValues: Array.isArray(field.dependentValues)
      ? field.dependentValues
      : [],
    optionsType:
      field.optionsType || (field.type === "select" ? "independent" : ""),
  };
  return normalized;
};

// Function to normalize additionalFields recursively
const normalizeAdditionalFields = (additionalFields) => {
  const normalized = {};
  Object.keys(additionalFields).forEach((option) => {
    normalized[option] = (additionalFields[option] || []).map((field) =>
      normalizeField(field)
    );
  });
  return normalized;
};

const AdditionalFieldsModal = ({
  sections,
  selectedField,
  onClose,
  updateField,
  isNested = false,
}) => {
  const [localAdditionalFields, setLocalAdditionalFields] = useState(
    normalizeAdditionalFields(selectedField.additionalFields || {})
  );
  const [selectedOption, setSelectedOption] = useState(
    selectedField.options && selectedField.options.length > 0
      ? selectedField.options[0].value
      : ""
  );
  const [editingField, setEditingField] = useState(null);
  const [nestedFieldToEdit, setNestedFieldToEdit] = useState(null);

  useEffect(() => {
    setLocalAdditionalFields(
      normalizeAdditionalFields(selectedField.additionalFields || {})
    );
  }, [selectedField]);

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const addAdditionalField = () => {
    const newField = {
      id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique ID
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
    setLocalAdditionalFields((prev) => ({
      ...prev,
      [selectedOption]: prev[selectedOption]
        ? [...prev[selectedOption], newField]
        : [newField],
    }));
  };

  const removeAdditionalField = (fieldId) => {
    setLocalAdditionalFields((prev) => ({
      ...prev,
      [selectedOption]: (prev[selectedOption] || []).filter(
        (field) => field.id !== fieldId
      ),
    }));
  };

  const handleEditField = (field) => {
    setEditingField({ ...field, parentOption: selectedOption });
  };

  const handleAddNestedFields = (field) => {
    setNestedFieldToEdit(field);
  };

  const handleSaveField = (updatedField) => {
    console.log("Saving field in AdditionalFieldsModal:", updatedField);
    setLocalAdditionalFields((prev) => {
      const updatedFields = {
        ...prev,
        [selectedOption]: (prev[selectedOption] || []).map((field) =>
          field.id === updatedField.id ? normalizeField(updatedField) : field
        ),
      };
      console.log("Updated localAdditionalFields:", updatedFields);
      return updatedFields;
    });
    setEditingField(null);
  };

  const handleSaveNestedFields = (updatedNestedField) => {
    setLocalAdditionalFields((prev) => {
      const updatedFields = {
        ...prev,
        [selectedOption]: (prev[selectedOption] || []).map((field) => {
          if (field.id === updatedNestedField.id) {
            return normalizeField(updatedNestedField);
          }
          if (field.additionalFields) {
            const updatedAdditionalFields = Object.fromEntries(
              Object.entries(field.additionalFields).map(
                ([option, nestedFields]) => [
                  option,
                  nestedFields.map((nestedField) =>
                    nestedField.id === updatedNestedField.id
                      ? normalizeField(updatedNestedField)
                      : nestedField
                  ),
                ]
              )
            );
            return { ...field, additionalFields: updatedAdditionalFields };
          }
          return field;
        }),
      };
      console.log("Updated localAdditionalFields (nested):", updatedFields);
      return updatedFields;
    });
    setNestedFieldToEdit(null);
  };

  const onDragEnd = (result) => {
    console.log("onDragEnd triggered:", result); // Debug log
    const { source, destination, draggableId } = result;

    if (!destination) {
      console.log("No destination, drag cancelled");
      return;
    }

    const fields = [...(localAdditionalFields[selectedOption] || [])];
    const [removed] = fields.splice(source.index, 1);
    fields.splice(destination.index, 0, removed);

    setLocalAdditionalFields((prev) => ({
      ...prev,
      [selectedOption]: fields,
    }));
    console.log("Fields reordered:", fields);
  };

  const handleSave = () => {
    const updatedAdditionalFields = normalizeAdditionalFields(
      localAdditionalFields
    );
    const updatedField = {
      ...selectedField,
      additionalFields: updatedAdditionalFields,
    };
    console.log("Saving to parent field:", updatedField);
    updateField(updatedField);
    onClose();
  };

  return (
    <Dialog open={true} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isNested ? "Nested Additional Fields" : "Additional Properties"}
      </DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Select an option to configure additional fields:
        </Typography>
        <Select
          fullWidth
          margin="dense"
          value={selectedOption}
          onChange={handleOptionChange}
        >
          {selectedField.options.map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </Select>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Additional Fields for Option: {selectedOption}
          </Typography>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={selectedOption}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {(localAdditionalFields[selectedOption] || []).map(
                    (field, index) => (
                      <Draggable
                        key={field.id}
                        draggableId={field.id}
                        index={index}
                      >
                        {(provided) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                              mt: 1,
                              border: "1px solid #ccc",
                              padding: 1,
                              borderRadius: 1,
                              backgroundColor: "#fff",
                              cursor: "move",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Typography variant="body2">
                                {field.label}
                              </Typography>
                              <Box>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => handleEditField(field)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => handleAddNestedFields(field)}
                                >
                                  Add Nested Fields
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    removeAdditionalField(field.id)
                                  }
                                >
                                  Remove
                                </Button>
                              </Box>
                            </Box>
                            {field.additionalFields && (
                              <Box sx={{ marginLeft: 2 }}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  Nested Additional Fields:
                                </Typography>
                                {Object.entries(field.additionalFields).map(
                                  ([option, nestedFields]) => (
                                    <Box key={option}>
                                      <Typography
                                        variant="body2"
                                        sx={{ fontWeight: "bold" }}
                                      >
                                        {option}:
                                      </Typography>
                                      {nestedFields.map((nestedField) => (
                                        <Box
                                          key={nestedField.id}
                                          sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            marginLeft: 2,
                                          }}
                                        >
                                          <Typography variant="body2">
                                            {nestedField.label}
                                          </Typography>
                                          <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() =>
                                              handleEditField(nestedField)
                                            }
                                          >
                                            Edit
                                          </Button>
                                        </Box>
                                      ))}
                                    </Box>
                                  )
                                )}
                              </Box>
                            )}
                          </Box>
                        )}
                      </Draggable>
                    )
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <Button
            variant="outlined"
            onClick={addAdditionalField}
            sx={{ mt: 2 }}
          >
            Add Additional Field
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save Changes
        </Button>
      </DialogActions>

      {editingField && (
        <FieldEditModal
          selectedField={editingField}
          sections={sections}
          onClose={() => setEditingField(null)}
          updateField={handleSaveField}
        />
      )}
      {nestedFieldToEdit && (
        <AdditionalFieldsModal
          sections={sections}
          selectedField={nestedFieldToEdit}
          onClose={() => setNestedFieldToEdit(null)}
          updateField={handleSaveNestedFields}
          isNested={true}
        />
      )}
    </Dialog>
  );
};

export default AdditionalFieldsModal;

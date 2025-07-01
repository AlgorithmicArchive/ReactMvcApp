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

// Function to normalize a field, preserving existing values
const normalizeField = (field) => {
  console.log("Normalizing field, input:", field); // Debug input
  const normalized = {
    id: field.id || `field-${Date.now()}`,
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
  };
  console.log("Normalized field, output:", normalized); // Debug output
  return normalized;
};

// Function to normalize additionalFields recursively
const normalizeAdditionalFields = (additionalFields) => {
  console.log("Normalizing additionalFields, input:", additionalFields); // Debug input
  const normalized = {};
  Object.keys(additionalFields).forEach((option) => {
    normalized[option] = (additionalFields[option] || []).map((field) =>
      normalizeField(field)
    );
  });
  console.log("Normalized additionalFields, output:", normalized); // Debug output
  return normalized;
};

const AdditionalFieldsModal = ({
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
    console.log("AdditionalFieldsModal initialized with:", {
      selectedField,
      localAdditionalFields,
    });
  }, [selectedField]);

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
    console.log("Selected option:", e.target.value);
  };

  const addAdditionalField = () => {
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
    setLocalAdditionalFields((prev) => {
      const updatedFields = {
        ...prev,
        [selectedOption]: prev[selectedOption]
          ? [...prev[selectedOption], newField]
          : [newField],
      };
      console.log(
        "Added new field:",
        newField,
        "Updated fields:",
        updatedFields
      );
      return updatedFields;
    });
  };

  const removeAdditionalField = (fieldId) => {
    setLocalAdditionalFields((prev) => {
      const updatedFields = {
        ...prev,
        [selectedOption]: (prev[selectedOption] || []).filter(
          (field) => field.id !== fieldId
        ),
      };
      console.log("Removed field:", fieldId, "Updated fields:", updatedFields);
      return updatedFields;
    });
  };

  const handleEditField = (field) => {
    setEditingField({ ...field, parentOption: selectedOption });
  };

  const handleAddNestedFields = (field) => {
    setNestedFieldToEdit(field);
  };

  const handleSaveField = (updatedField) => {
    setLocalAdditionalFields((prev) => {
      let updatedFields = { ...prev };
      const selectedOption =
        updatedField.parentOption || "PHYSICALLY CHALLENGED PERSON"; // Ensure this matches your context
      const parentFields = updatedFields[selectedOption] || [];

      const parentField = parentFields.find(
        (f) =>
          f.additionalFields &&
          Object.values(f.additionalFields).some((fields) =>
            fields.some((nestedField) => nestedField.id === updatedField.id)
          )
      );

      if (!parentField) {
        console.log("Parent field not found for ID:", updatedField.id);
        return prev; // No update if parent not found
      }

      const nestedOption = Object.keys(parentField.additionalFields).find(
        (opt) =>
          parentField.additionalFields[opt].some(
            (f) => f.id === updatedField.id
          )
      );

      if (!nestedOption) {
        console.log("Nested option not found for ID:", updatedField.id);
        return prev; // No update if nested option not found
      }

      // Update the nested fields
      const updatedNestedFields = parentField.additionalFields[
        nestedOption
      ].map((f) => {
        if (f.id === updatedField.id) {
          const mergedField = { ...f, ...updatedField };
          console.log(
            "Merging field:",
            f,
            "with",
            updatedField,
            "Result:",
            mergedField
          );
          return mergedField;
        }
        return f;
      });

      // Construct the updated parent field
      const updatedParentField = {
        ...parentField,
        additionalFields: {
          ...parentField.additionalFields,
          [nestedOption]: updatedNestedFields,
        },
      };

      // Update the parent fields array
      updatedFields = {
        ...updatedFields,
        [selectedOption]: parentFields.map((field) =>
          field.id === parentField.id ? updatedParentField : field
        ),
      };

      // Verify the update
      const finalNestedField = updatedFields[selectedOption]
        .find((f) => f.id === parentField.id)
        .additionalFields[nestedOption].find((f) => f.id === updatedField.id);
      console.log("Final nested field maxLength:", finalNestedField.maxLength);

      return updatedFields;
    });
    setEditingField(null);
  };
  const handleSaveNestedFields = (updatedNestedField) => {
    setLocalAdditionalFields((prev) => {
      const currentFields = prev[selectedOption] || [];
      const updatedFields = currentFields.map((field) => {
        if (field.additionalFields) {
          const updatedAdditionalFields = Object.fromEntries(
            Object.entries(field.additionalFields).map(
              ([option, nestedFields]) => [
                option,
                nestedFields.map((nestedField) =>
                  nestedField.id === updatedNestedField.id
                    ? { ...nestedField, ...updatedNestedField }
                    : nestedField
                ),
              ]
            )
          );
          return { ...field, additionalFields: updatedAdditionalFields };
        }
        return field;
      });
      const newLocalFields = { ...prev, [selectedOption]: updatedFields };
      console.log(
        "Saved nested field:",
        updatedNestedField,
        "New localAdditionalFields:",
        newLocalFields
      );
      return newLocalFields;
    });
    setNestedFieldToEdit(null);
  };

  const handleSave = () => {
    const updatedAdditionalFields = normalizeAdditionalFields(
      localAdditionalFields
    );
    const updatedField = {
      ...selectedField,
      additionalFields: updatedAdditionalFields,
    };
    console.log("Saving to parent:", updatedField);
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
          {(localAdditionalFields[selectedOption] || []).map((field) => (
            <Box
              key={field.id}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                mt: 1,
                border: "1px solid #ccc",
                padding: 1,
                borderRadius: 1,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">{field.label}</Typography>
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
                    onClick={() => removeAdditionalField(field.id)}
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
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
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
                              onClick={() => handleEditField(nestedField)}
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
          ))}
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
          sections={[]}
          onClose={() => setEditingField(null)}
          updateField={handleSaveField}
        />
      )}
      {nestedFieldToEdit && (
        <AdditionalFieldsModal
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

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
} from "@mui/material";
import FieldEditModal from "./FieldEditModal";

const AdditionalFieldsModal = ({
  selectedField,
  onClose,
  updateField,
  isNested = false, // Add this prop to distinguish between main and nested fields
}) => {
  const [localAdditionalFields, setLocalAdditionalFields] = useState(
    selectedField.additionalFields || {}
  );
  const [selectedOption, setSelectedOption] = useState(
    selectedField.options && selectedField.options.length > 0
      ? selectedField.options[0].value
      : ""
  );
  const [editingField, setEditingField] = useState(null);
  const [nestedFieldToEdit, setNestedFieldToEdit] = useState(null); // New state for nested field

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const addAdditionalField = () => {
    const newField = {
      id: Date.now(),
      label: "",
      type: "text",
      options: [],
      validationFunctions: [],
      transformationFunctions: [],
      additionalFields: {}, // Allow nested additional fields
      accept: "",
    };
    setLocalAdditionalFields((prev) => ({
      ...prev,
      [selectedOption]: prev[selectedOption]
        ? [...prev[selectedOption], newField]
        : [newField],
    }));
  };

  const handleEditField = (field) => {
    setEditingField(field);
  };
  const handleAddNestedFields = (field) => {
    setNestedFieldToEdit(field); // Set the field to add nested fields to
  };

  const handleSaveField = (updatedField) => {
    setLocalAdditionalFields((prev) => {
      const currentFields = prev[selectedOption] || [];
      const updatedFields = currentFields.map((field) =>
        field.id === updatedField.id ? updatedField : field
      );
      return { ...prev, [selectedOption]: updatedFields };
    });
    setEditingField(null);
  };

  const handleSaveNestedFields = (updatedNestedField) => {
    setLocalAdditionalFields((prev) => {
      const currentFields = prev[selectedOption] || [];
      const updatedFields = currentFields.map((field) =>
        field.id === updatedNestedField.id ? updatedNestedField : field
      );
      return { ...prev, [selectedOption]: updatedFields };
    });
    setNestedFieldToEdit(null); // Close the nested modal
  };

  const handleSave = () => {
    updateField({ ...selectedField, additionalFields: localAdditionalFields });
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
          {(localAdditionalFields[selectedOption] || []).map((field, index) => (
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
                    onClick={() => handleAddNestedFields(field)} // Use new handler
                  >
                    Add Nested Fields
                  </Button>
                </Box>
              </Box>
              {/* Render nested additional fields if they exist */}
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

      {/* Reuse FieldEditModal for editing additional fields */}
      {editingField && (
        <FieldEditModal
          selectedField={editingField}
          sections={[]}
          onClose={() => setEditingField(null)}
          updateField={handleSaveField}
        />
      )}
      {/* Nested Additional Fields Modal */}
      {nestedFieldToEdit && (
        <AdditionalFieldsModal
          selectedField={nestedFieldToEdit}
          onClose={() => setNestedFieldToEdit(null)}
          updateField={handleSaveNestedFields}
        />
      )}
    </Dialog>
  );
};

export default AdditionalFieldsModal;

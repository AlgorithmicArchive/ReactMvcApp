// src/components/FieldEditModal.js
import React, { useContext, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";
import { validationFunctionsList } from "../../assets/formvalidations";

// Async function to fetch districts from your API endpoint.
const fetchDistricts = async () => {
  try {
    const response = await fetch("/Base/GetDistricts");
    const data = await response.json();
    if (data.status) {
      return data.districts; // Assume districts is an array of objects with districtId and districtName.
    }
    return [];
  } catch (error) {
    console.error("Error fetching districts:", error);
    return [];
  }
};

const FieldEditModal = ({ selectedField, sections, onClose, updateField }) => {
  const [dependentOn, setDependentOn] = useState("");

  // Ensure options is an array; if not, default to an empty array.
  const initialOptions =
    Array.isArray(selectedField.options) && selectedField.options.length
      ? selectedField.options
      : [];

  // Initialize state including validationFunctions and new conditional options props.
  const [formData, setFormData] = useState({
    type: "text",
    ...selectedField,
    options: initialOptions,
    validationFunctions: selectedField.validationFunctions || [],
  });

  const saveChanges = () => {
    updateField(formData);
    onClose();
  };

  // Handler for when the "Is District" checkbox changes.
  const handleDistrictCheckboxChange = async (e) => {
    const checked = e.target.checked;
    if (checked) {
      // If checked, fetch district data and update options.
      const districts = await fetchDistricts();
      const districtOptions = districts.map((d) => ({
        value: d.districtId,
        label: d.districtName,
      }));
      // Prepend the "Please Select" option.
      const newOptions = [
        { value: "Please Select", label: "Please Select" },
        ...districtOptions,
      ];
      setFormData((prev) => ({ ...prev, options: newOptions }));
    } else {
      // If unchecked, clear the options so the user can enter custom values.
      setFormData((prev) => ({ ...prev, options: [] }));
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      aria-labelledby="form-dialog-title"
      PaperProps={{ style: { width: "90%", maxWidth: 600 } }}
    >
      <DialogTitle id="form-dialog-title">Edit Field Properties</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Field Label"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          margin="dense"
        />
        <TextField
          fullWidth
          label="Field Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          margin="dense"
        />
        <TextField
          fullWidth
          label="Minimum Length"
          type="text"
          value={formData.minLength}
          onChange={(e) =>
            setFormData({
              ...formData,
              minLength: parseInt(e.target.value, 10),
            })
          }
          margin="dense"
        />
        <TextField
          fullWidth
          label="Maximum Length"
          type="text"
          value={formData.maxLength}
          onChange={(e) =>
            setFormData({
              ...formData,
              maxLength: parseInt(e.target.value, 10),
            })
          }
          margin="dense"
        />
        <TextField
          fullWidth
          label="Span (Grid)"
          type="text"
          value={formData.span}
          onChange={(e) =>
            setFormData({ ...formData, span: parseInt(e.target.value, 10) })
          }
          margin="dense"
        />
        <Typography variant="body2" sx={{ marginTop: 1 }}>
          Field Type
        </Typography>
        <FormControl fullWidth margin="dense">
          <InputLabel id="field-type-label">Field Type</InputLabel>
          <Select
            labelId="field-type-label"
            value={formData.type}
            label="Field Type"
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <MenuItem value="text">Text</MenuItem>
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="select">Select</MenuItem>
            <MenuItem value="file">File</MenuItem>
            <MenuItem value="date">Date</MenuItem>
            <MenuItem value="enclosure">Enclosure</MenuItem>
          </Select>
        </FormControl>
        {/* If type is select, show options inputs */}
        {formData.type === "select" && (
          <>
            <FormControl fullWidth margin="dense">
              <InputLabel id="options-type-label">Options Type</InputLabel>
              <Select
                labelId="options-type-label"
                value={formData.optionsType || ""}
                label="Options Type"
                onChange={(e) =>
                  setFormData({ ...formData, optionsType: e.target.value })
                }
              >
                <MenuItem value="">Please Select</MenuItem>
                <MenuItem value="independent">Independent</MenuItem>
                <MenuItem value="dependent">Dependent</MenuItem>
              </Select>
            </FormControl>
            {formData.optionsType === "independent" && (
              <TextField
                fullWidth
                label="Default Options (comma-separated)"
                value={formData.options.map((opt) => opt.label).join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    options: e.target.value.split(",").map((optStr) => {
                      const trimmed = optStr.trim();
                      return { value: trimmed, label: trimmed };
                    }),
                  })
                }
                margin="dense"
              />
            )}
            {formData.optionsType === "dependent" && (
              <>
                <FormControl fullWidth margin="dense">
                  <InputLabel id="dependent-on-label">Dependent On</InputLabel>
                  <Select
                    labelId="dependent-on-label"
                    value={dependentOn}
                    label="Dependent On"
                    onChange={(e) => {
                      setDependentOn(e.target.value);
                      setFormData({ ...formData, dependentOn: e.target.value });
                    }}
                  >
                    {sections
                      .flatMap((section) => section.fields)
                      .filter(
                        (field) =>
                          field.type === "select" &&
                          !field.name.includes("District")
                      )
                      .map((field) => (
                        <MenuItem key={field.name} value={field.name}>
                          {field.label}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                {dependentOn && (
                  <>
                    {(() => {
                      // Find the parent field by name
                      const allFields = sections.flatMap(
                        (section) => section.fields
                      );
                      const parentField = allFields.find(
                        (field) => field.name === dependentOn
                      );
                      if (parentField && parentField.options) {
                        return parentField.options.map((option) => (
                          <TextField
                            key={option.value}
                            fullWidth
                            label={`Options for ${option.label} (comma-separated)`}
                            value={
                              formData.dependentOptions &&
                              formData.dependentOptions[option.value]
                                ? formData.dependentOptions[option.value]
                                    .map((opt) => opt.label)
                                    .join(", ")
                                : ""
                            }
                            onChange={(e) => {
                              const newOptions = e.target.value
                                .split(",")
                                .map((optStr) => {
                                  const trimmed = optStr.trim();
                                  return { value: trimmed, label: trimmed };
                                });
                              setFormData((prev) => ({
                                ...prev,
                                dependentOptions: {
                                  ...prev.dependentOptions,
                                  [option.value]: newOptions,
                                },
                              }));
                            }}
                            margin="dense"
                          />
                        ));
                      }
                      return null;
                    })()}
                  </>
                )}
              </>
            )}
            <FormControlLabel
              control={<Checkbox onChange={handleDistrictCheckboxChange} />}
              label="Is District"
            />
          </>
        )}
        {/* For enclosure type, just show one options input */}
        {formData.type === "enclosure" && (
          <TextField
            fullWidth
            label="Options (comma-separated)"
            value={formData.options.map((opt) => opt.label).join(", ")}
            onChange={(e) =>
              setFormData({
                ...formData,
                options: e.target.value.split(",").map((optStr) => {
                  const trimmed = optStr.trim();
                  return { value: trimmed, label: trimmed };
                }),
              })
            }
            margin="dense"
          />
        )}
        {formData.type === "file" && (
          <TextField
            fullWidth
            label="File Type Allowed"
            value={formData.accept}
            onChange={(e) =>
              setFormData({ ...formData, accept: e.target.value })
            }
            margin="dense"
          />
        )}
        {/* Validation Functions as Checkboxes */}
        <Typography variant="body2" sx={{ marginTop: 2 }}>
          Validation Functions
        </Typography>
        {validationFunctionsList.map((func) => (
          <FormControlLabel
            key={func.id}
            control={
              <Checkbox
                checked={formData.validationFunctions.includes(func.id)}
                onChange={(e) => {
                  let updatedValidations = [...formData.validationFunctions];
                  if (e.target.checked) {
                    updatedValidations.push(func.id);
                  } else {
                    updatedValidations = updatedValidations.filter(
                      (id) => id !== func.id
                    );
                  }
                  setFormData({
                    ...formData,
                    validationFunctions: updatedValidations,
                  });
                }}
              />
            }
            label={func.label}
          />
        ))}
        <Button
          fullWidth
          variant="contained"
          onClick={saveChanges}
          sx={{ marginTop: 2 }}
        >
          Save Changes
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default FieldEditModal;

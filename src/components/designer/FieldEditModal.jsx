// src/components/FieldEditModal.js
import React, { useState } from "react";
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

  // Determine if the current maximum length is dependent based on initial data.
  const initialIsDependentMaxLength =
    typeof selectedField.maxLength === "object" &&
    selectedField.maxLength.dependentOn
      ? true
      : false;
  const [isDependentMaxLength, setIsDependentMaxLength] = useState(
    initialIsDependentMaxLength
  );

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

        {/* --- Maximum Length Section --- */}
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="body2">Maximum Length</Typography>
          {/* Toggle between static and dependent maximum length */}
          <FormControlLabel
            control={
              <Checkbox
                checked={isDependentMaxLength}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsDependentMaxLength(checked);
                  if (checked) {
                    // initialize as an object with empty dependentOn if switching to dependent mode
                    setFormData((prev) => ({
                      ...prev,
                      maxLength: { dependentOn: "" },
                    }));
                  } else {
                    // when turning off, reset to a static value (e.g., 0 or any default)
                    setFormData((prev) => ({
                      ...prev,
                      maxLength: 0,
                    }));
                  }
                }}
              />
            }
            label="Dependent Maximum Length"
          />
          {isDependentMaxLength ? (
            <>
              {/* Select the field to depend on */}
              <FormControl fullWidth margin="dense">
                <InputLabel id="maxLength-dependent-on-label">
                  Dependent Field
                </InputLabel>
                <Select
                  labelId="maxLength-dependent-on-label"
                  value={formData.maxLength.dependentOn || ""}
                  label="Dependent Field"
                  onChange={(e) => {
                    const field = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      maxLength: { dependentOn: field },
                    }));
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
              {/* Render a text field for each option of the selected dependent field */}
              {(() => {
                const dependentFieldName = formData.maxLength.dependentOn;
                if (dependentFieldName) {
                  const allFields = sections.flatMap(
                    (section) => section.fields
                  );
                  const parentField = allFields.find(
                    (field) => field.name === dependentFieldName
                  );
                  if (parentField && parentField.options) {
                    return parentField.options.map((option) => (
                      <TextField
                        key={option.value}
                        fullWidth
                        label={`Maximum Length for ${option.label}`}
                        type="number"
                        value={
                          (formData.maxLength &&
                            formData.maxLength[option.value]) ||
                          ""
                        }
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value, 10);
                          setFormData((prev) => ({
                            ...prev,
                            maxLength: {
                              ...prev.maxLength,
                              [option.value]: newValue,
                            },
                          }));
                        }}
                        margin="dense"
                      />
                    ));
                  }
                }
                return null;
              })()}
            </>
          ) : (
            <TextField
              fullWidth
              label="Maximum Length"
              type="number"
              value={formData.maxLength}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxLength: parseInt(e.target.value, 10),
                })
              }
              margin="dense"
            />
          )}
        </Box>
        {/* --- End Maximum Length Section --- */}

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
                {sections && <MenuItem value="dependent">Dependent</MenuItem>}
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
          <>
            {/* Checkbox to determine if the enclosure is dependent */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isDependentEnclosure || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isDependentEnclosure: e.target.checked,
                      dependentField: e.target.checked ? "" : null, // Reset when unchecked
                      dependentValues: e.target.checked ? [] : null, // Reset when unchecked
                    })
                  }
                />
              }
              label="Is Dependent on Another Field?"
            />

            {/* Dependency Configuration Section */}
            {formData.isDependentEnclosure && (
              <>
                {/* Select the field on which the enclosure depends */}
                <FormControl fullWidth margin="dense">
                  <InputLabel id="dependent-field-label">
                    Dependent Field
                  </InputLabel>
                  <Select
                    labelId="dependent-field-label"
                    value={formData.dependentField || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dependentField: e.target.value,
                      })
                    }
                  >
                    {sections
                      .flatMap((section) => section.fields)
                      .filter((field) => field.type === "select") // Only dropdown fields
                      .map((field) => (
                        <MenuItem key={field.name} value={field.name}>
                          {field.label}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>

                {/* Select the specific values from the dependent field */}
                {formData.dependentField && (
                  <FormControl fullWidth margin="dense">
                    <InputLabel id="dependent-values-label">
                      Dependent Values (Select Multiple)
                    </InputLabel>
                    <Select
                      labelId="dependent-values-label"
                      multiple
                      value={formData.dependentValues || []}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dependentValues: e.target.value,
                        })
                      }
                      renderValue={(selected) =>
                        selected
                          .map(
                            (val) =>
                              sections
                                .flatMap((section) => section.fields)
                                .find(
                                  (field) =>
                                    field.name === formData.dependentField
                                )
                                ?.options.find((opt) => opt.value === val)
                                ?.label
                          )
                          .join(", ")
                      }
                    >
                      {(() => {
                        const allFields = sections.flatMap(
                          (section) => section.fields
                        );
                        const parentField = allFields.find(
                          (field) => field.name === formData.dependentField
                        );

                        return parentField?.options?.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ));
                      })()}
                    </Select>
                  </FormControl>
                )}
              </>
            )}

            {/* Enclosure Options Section */}
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
          </>
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

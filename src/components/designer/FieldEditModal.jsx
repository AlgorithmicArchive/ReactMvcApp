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
  const [dependentOn, setDependentOn] = useState(
    selectedField.dependentOn || ""
  );

  // Initialize state with all field properties, including defaults for optional ones
  const [formData, setFormData] = useState({
    id: selectedField.id || `field-${Date.now()}`,
    type: selectedField.type || "text",
    label: selectedField.label || "New Field",
    name: selectedField.name || `NewField_${Date.now()}`,
    minLength:
      selectedField.minLength !== undefined ? selectedField.minLength : 5,
    maxLength:
      selectedField.maxLength !== undefined ? selectedField.maxLength : 50,
    options: Array.isArray(selectedField.options) ? selectedField.options : [],
    span: selectedField.span !== undefined ? selectedField.span : 12,
    validationFunctions: Array.isArray(selectedField.validationFunctions)
      ? selectedField.validationFunctions
      : [],
    transformationFunctions: Array.isArray(
      selectedField.transformationFunctions
    )
      ? selectedField.transformationFunctions
      : [],
    additionalFields: selectedField.additionalFields || {},
    accept: selectedField.accept || "",
    editable:
      selectedField.editable !== undefined ? selectedField.editable : true,
    value: selectedField.value || undefined,
    optionsType: selectedField.optionsType || "",
    dependentOn: selectedField.dependentOn || "",
    dependentOptions: selectedField.dependentOptions || {},
    isDependentEnclosure: selectedField.isDependentEnclosure || false,
    dependentField: selectedField.dependentField || "",
    dependentValues: selectedField.dependentValues || [],
  });

  // Determine if maxLength is dependent
  const initialIsDependentMaxLength =
    typeof selectedField.maxLength === "object" &&
    selectedField.maxLength.dependentOn;
  const [isDependentMaxLength, setIsDependentMaxLength] = useState(
    initialIsDependentMaxLength
  );

  const saveChanges = () => {
    // Ensure all properties are included in the update
    updateField(formData);
    onClose();
  };

  // Handler for district checkbox
  const handleDistrictCheckboxChange = async (e) => {
    const checked = e.target.checked;
    if (checked) {
      const districts = await fetchDistricts();
      const districtOptions = districts.map((d) => ({
        value: d.districtId,
        label: d.districtName,
      }));
      setFormData((prev) => ({
        ...prev,
        options: [
          { value: "Please Select", label: "Please Select" },
          ...districtOptions,
        ],
      }));
    } else {
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
          type="number"
          value={formData.minLength}
          onChange={(e) =>
            setFormData({
              ...formData,
              minLength: parseInt(e.target.value, 10) || 0,
            })
          }
          margin="dense"
        />

        {/* Maximum Length Section */}
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="body2">Maximum Length</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={isDependentMaxLength}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsDependentMaxLength(checked);
                  setFormData((prev) => ({
                    ...prev,
                    maxLength: checked ? { dependentOn: "" } : 50,
                  }));
                }}
              />
            }
            label="Dependent Maximum Length"
          />
          {isDependentMaxLength ? (
            <>
              <FormControl fullWidth margin="dense">
                <InputLabel id="maxLength-dependent-on-label">
                  Dependent Field
                </InputLabel>
                <Select
                  labelId="maxLength-dependent-on-label"
                  value={formData.maxLength.dependentOn || ""}
                  label="Dependent Field"
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      maxLength: {
                        ...prev.maxLength,
                        dependentOn: e.target.value,
                      },
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
              {formData.maxLength.dependentOn && (
                <>
                  {(() => {
                    const dependentFieldName = formData.maxLength.dependentOn;
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
                            const newValue = parseInt(e.target.value, 10) || 0;
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
                    return null;
                  })()}
                </>
              )}
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
                  maxLength: parseInt(e.target.value, 10) || 50,
                })
              }
              margin="dense"
            />
          )}
        </Box>

        <TextField
          fullWidth
          label="Span (Grid)"
          type="number"
          value={formData.span}
          onChange={(e) =>
            setFormData({
              ...formData,
              span: parseInt(e.target.value, 10) || 12,
            })
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
        {/* Select Type Options */}
        {formData.type === "select" && (
          <>
            <FormControl fullWidth margin="dense">
              <InputLabel id="options-type-label">Options Type</InputLabel>
              <Select
                labelId="options-type-label"
                value={formData.optionsType || ""}
                label="Options Type"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    optionsType: e.target.value,
                    dependentOn:
                      e.target.value === "dependent" ? dependentOn : "",
                    dependentOptions:
                      e.target.value === "dependent" ? {} : undefined,
                    options:
                      e.target.value === "independent" ? [] : formData.options,
                  })
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
                    options: e.target.value
                      .split(",")
                      .map((optStr) => {
                        const trimmed = optStr.trim();
                        return trimmed
                          ? { value: trimmed, label: trimmed }
                          : null;
                      })
                      .filter((opt) => opt !== null),
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
                      const newDependentOn = e.target.value;
                      setDependentOn(newDependentOn);
                      setFormData((prev) => ({
                        ...prev,
                        dependentOn: newDependentOn,
                        dependentOptions: newDependentOn
                          ? {}
                          : prev.dependentOptions,
                      }));
                    }}
                  >
                    <MenuItem value="">
                      <em>Select a field</em>
                    </MenuItem>
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
                              formData.dependentOptions?.[option.value]
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
                                  return trimmed
                                    ? { value: trimmed, label: trimmed }
                                    : null;
                                })
                                .filter((opt) => opt !== null);
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
        {/* Enclosure Type Options */}
        {formData.type === "enclosure" && (
          <>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isDependentEnclosure || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isDependentEnclosure: e.target.checked,
                      dependentField: e.target.checked ? "" : null,
                      dependentValues: e.target.checked ? [] : null,
                    })
                  }
                />
              }
              label="Is Dependent on Another Field?"
            />
            {formData.isDependentEnclosure && (
              <>
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
                    <MenuItem value="">
                      <em>Select a field</em>
                    </MenuItem>
                    {sections
                      .flatMap((section) => section.fields)
                      .filter((field) => field.type === "select")
                      .map((field) => (
                        <MenuItem key={field.name} value={field.name}>
                          {field.label}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
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
                          .filter((label) => label)
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
                        return (
                          parentField?.options?.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          )) || []
                        );
                      })()}
                    </Select>
                  </FormControl>
                )}
              </>
            )}
            <TextField
              fullWidth
              label="Options (comma-separated)"
              value={formData.options.map((opt) => opt.label).join(", ")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  options: e.target.value
                    .split(",")
                    .map((optStr) => {
                      const trimmed = optStr.trim();
                      return trimmed
                        ? { value: trimmed, label: trimmed }
                        : null;
                    })
                    .filter((opt) => opt !== null),
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

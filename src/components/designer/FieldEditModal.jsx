import React, { useState, useEffect } from "react";
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
import {
  transformationFunctionsList,
  validationFunctionsList,
} from "../../assets/formvalidations";
import axiosnInstance from "../../axiosConfig";

// Async function to fetch districts from your API endpoint
const fetchDistricts = async () => {
  try {
    const response = await axiosnInstance.get("/Base/GetDistricts");
    const data = await response.data;
    if (data.status) {
      return data.districts;
    }
    return [];
  } catch (error) {
    console.error("Error fetching districts:", error);
    return [];
  }
};

// Utility function to collect all selectable fields, including nested additional fields
const getSelectableFields = (sections = [], actionForm = []) => {
  const selectableFields = [];

  // Recursive function to process fields and their nested additional fields
  const processFields = (fields, parentLabel = "", parentFieldName = "") => {
    fields.forEach((field) => {
      // Add the current field to selectableFields
      selectableFields.push({
        id: field.name, // Use name as ID for consistency
        label: parentLabel ? `${parentLabel} > ${field.label}` : field.label,
        options: field.options || [],
        isAdditional: !!parentFieldName,
        type: field.type,
        parentFieldName: parentFieldName || undefined,
      });

      // Process additional fields recursively
      if (field.additionalFields) {
        Object.values(field.additionalFields).forEach(
          (additionalFieldArray) => {
            processFields(
              additionalFieldArray,
              parentLabel ? `${parentLabel} > ${field.label}` : field.label,
              field.name
            );
          }
        );
      }
    });
  };

  // Handle sections (CreateService context)
  if (sections && sections.length > 0) {
    sections.forEach((section) => {
      processFields(section.fields || []);
    });
  }

  // Handle actionForm (CreateWorkflow context)
  if (actionForm && actionForm.length > 0) {
    processFields(actionForm);
  }

  // Filter out fields with "District" in their ID
  return selectableFields.filter((field) => !field.id.includes("District"));
};

const FieldEditModal = ({
  selectedField,
  sections = [],
  actionForm = [],
  onClose,
  updateField,
}) => {
  const [dependentOn, setDependentOn] = useState(
    selectedField?.dependentOn || ""
  );
  const [formData, setFormData] = useState({
    id: selectedField?.id || `field-${Date.now()}`,
    type: selectedField?.type || "text",
    label: selectedField?.label || "New Field",
    name: selectedField?.name || `NewField_${Date.now()}`,
    minLength:
      selectedField?.minLength !== undefined ? selectedField.minLength : 5,
    maxLength:
      selectedField?.maxLength !== undefined ? selectedField.maxLength : 50,
    options: Array.isArray(selectedField?.options) ? selectedField.options : [],
    span: selectedField?.span !== undefined ? selectedField.span : 12,
    validationFunctions: Array.isArray(selectedField?.validationFunctions)
      ? selectedField.validationFunctions
      : [],
    transformationFunctions: Array.isArray(
      selectedField?.transformationFunctions
    )
      ? selectedField.transformationFunctions
      : [],
    additionalFields: selectedField?.additionalFields || {},
    accept: selectedField?.accept || "",
    editable:
      selectedField?.editable !== undefined ? selectedField.editable : true,
    value: selectedField?.value || undefined,
    optionsType:
      selectedField?.optionsType ||
      (selectedField?.type === "select" ? "independent" : ""),
    dependentOn: selectedField?.dependentOn || "",
    dependentOptions: selectedField?.dependentOptions || {},
    isDependentEnclosure: selectedField?.isDependentEnclosure || false,
    dependentField: selectedField?.dependentField || "",
    dependentValues: selectedField?.dependentValues || [],
  });

  const [optionInputText, setOptionInputText] = useState(
    formData.options.map((opt) => opt.label).join("; ")
  );
  const initialIsDependentMaxLength =
    typeof selectedField?.maxLength === "object" &&
    selectedField?.maxLength?.dependentOn;
  const [isDependentMaxLength, setIsDependentMaxLength] = useState(
    initialIsDependentMaxLength
  );

  const isWorkflowContext = sections.length === 0 && actionForm.length > 0;
  const selectableFields = getSelectableFields(sections, actionForm);

  // Filter selectable fields, excluding the current field
  const filteredSelectableFields = selectableFields.filter(
    (field) => field.id !== selectedField?.name
  );

  const handleDistrictCheckboxChange = async (e) => {
    const checked = e.target.checked;
    if (checked) {
      const districts = await fetchDistricts();
      const districtOptions = districts.map((d) => ({
        value: d.districtId, // Use districtId as value
        label: d.districtName, // Use districtName as label
      }));
      setFormData((prev) => ({
        ...prev,
        options: [
          { value: "Please Select", label: "Please Select" },
          ...districtOptions,
        ],
        optionsType: "independent",
      }));
      setOptionInputText(districtOptions.map((opt) => opt.label).join("; "));
    } else {
      setFormData((prev) => ({ ...prev, options: [], optionsType: "" }));
      setOptionInputText("");
    }
  };

  const saveChanges = () => {
    console.log("Saved FormData:", formData);
    updateField(formData);
    onClose();
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
        {filteredSelectableFields.length === 0 &&
          formData.type === "select" && (
            <Typography color="error" sx={{ marginBottom: 2 }}>
              No fields available for dependency. Please ensure the form
              contains other fields.
            </Typography>
          )}
        <TextField
          fullWidth
          label="Field Label"
          value={formData.label}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, label: e.target.value }))
          }
          margin="dense"
        />
        <TextField
          fullWidth
          label="Field Name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          margin="dense"
        />
        <TextField
          fullWidth
          label="Minimum Length"
          type="number"
          value={formData.minLength}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              minLength: parseInt(e.target.value, 10) || 0,
            }))
          }
          margin="dense"
        />
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="body2">Maximum Length</Typography>
          {!isWorkflowContext && (
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
          )}
          {isDependentMaxLength && !isWorkflowContext ? (
            <>
              <FormControl fullWidth margin="dense">
                <InputLabel id="maxLength-dependent-on-label">
                  Dependent Field
                </InputLabel>
                <Select
                  labelId="maxLength-dependent-on-label"
                  value={formData.maxLength.dependentOn || ""}
                  label="Dependent Field"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxLength: {
                        ...prev.maxLength,
                        dependentOn: e.target.value,
                      },
                    }))
                  }
                >
                  <MenuItem value="">
                    <em>Select a field</em>
                  </MenuItem>
                  {filteredSelectableFields.map((field) => (
                    <MenuItem key={field.id} value={field.id}>
                      {field.label} ({field.type})
                      {field.isAdditional && " [Additional]"}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {formData.maxLength.dependentOn && (
                <>
                  {(() => {
                    const dependentFieldId = formData.maxLength.dependentOn;
                    const selectedField = selectableFields.find(
                      (field) => field.id === dependentFieldId
                    );
                    if (selectedField && selectedField.options?.length > 0) {
                      return selectedField.options.map((option) => (
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
                    } else {
                      return (
                        <TextField
                          fullWidth
                          label="Maximum Length Condition"
                          value={formData.maxLength?.condition || ""}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              maxLength: {
                                ...prev.maxLength,
                                condition: e.target.value,
                              },
                            }));
                          }}
                          margin="dense"
                          placeholder="e.g., 'Not empty' for text fields"
                        />
                      );
                    }
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
                setFormData((prev) => ({
                  ...prev,
                  maxLength: parseInt(e.target.value, 10) || 50,
                }))
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
            setFormData((prev) => ({
              ...prev,
              span: parseInt(e.target.value, 10) || 12,
            }))
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
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                type: e.target.value,
                options:
                  e.target.value === "select"
                    ? [{ value: "Please Select", label: "Please Select" }]
                    : [],
                optionsType: e.target.value === "select" ? "independent" : "",
              }))
            }
          >
            <MenuItem value="text">Text</MenuItem>
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="select">Select</MenuItem>
            <MenuItem value="file">File</MenuItem>
            <MenuItem value="date">Date</MenuItem>
            <MenuItem value="enclosure">Enclosure</MenuItem>
          </Select>
        </FormControl>
        {formData.type === "select" && (
          <>
            <FormControl fullWidth margin="dense">
              <InputLabel id="options-type-label">Options Type</InputLabel>
              <Select
                labelId="options-type-label"
                value={formData.optionsType || ""}
                label="Options Type"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    optionsType: e.target.value,
                    dependentOn:
                      e.target.value === "dependent" ? dependentOn : "",
                    dependentOptions:
                      e.target.value === "dependent" ? {} : undefined,
                    options:
                      e.target.value === "independent"
                        ? [{ value: "Please Select", label: "Please Select" }]
                        : prev.options,
                  }))
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
                label="Default Options (semicolon-separated)"
                value={optionInputText}
                onChange={(e) => setOptionInputText(e.target.value)}
                onBlur={() => {
                  setFormData((prev) => ({
                    ...prev,
                    options: optionInputText
                      .split(";")
                      .map((optStr) => {
                        const cleaned = optStr.trim();
                        return cleaned
                          ? { value: cleaned, label: cleaned }
                          : null;
                      })
                      .filter((opt) => opt !== null),
                  }));
                }}
                margin="dense"
                placeholder="Type options separated by semicolons, e.g., Option 1;Option 2 with space, comma;Option 3"
                helperText="Use semicolons (;) to separate options. Commas and spaces are allowed within each option."
              />
            )}
            {formData.optionsType === "dependent" && !isWorkflowContext && (
              <>
                <FormControl fullWidth margin="dense">
                  <InputLabel id="dependent-on-label">Dependent On</InputLabel>
                  <Select
                    labelId="dependent-on-label"
                    value={dependentOn || ""}
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
                    {filteredSelectableFields.map((field) => (
                      <MenuItem key={field.id} value={field.id}>
                        {field.label} ({field.type})
                        {field.isAdditional && " [Additional]"}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {dependentOn && (
                  <>
                    {(() => {
                      const selectedField = selectableFields.find(
                        (field) => field.id === dependentOn
                      );
                      if (selectedField && selectedField.options?.length > 0) {
                        return selectedField.options.map((option) => (
                          <TextField
                            key={option.value}
                            fullWidth
                            label={`Options for ${option.label} (semicolon-separated)`}
                            value={
                              formData.dependentOptions?.[option.value]
                                ? formData.dependentOptions[option.value]
                                    .map((opt) => opt.label)
                                    .join("; ")
                                : ""
                            }
                            onChange={(e) => {
                              const newOptions = e.target.value
                                .split(";")
                                .map((optStr) => {
                                  const cleaned = optStr.trim();
                                  return cleaned
                                    ? { value: cleaned, label: cleaned }
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
                            placeholder="Type options separated by semicolons, e.g., Sub-option 1;Sub-option 2 with comma;Sub-option 3"
                            helperText="Use semicolons (;) to separate options. Commas and spaces are allowed within each option."
                          />
                        ));
                      } else {
                        return (
                          <TextField
                            fullWidth
                            label={`Dependent Options for ${
                              selectedField?.label || "Selected Field"
                            } (semicolon-separated)`}
                            value={
                              formData.dependentOptions?.["default"]
                                ? formData.dependentOptions["default"]
                                    .map((opt) => opt.label)
                                    .join("; ")
                                : ""
                            }
                            onChange={(e) => {
                              const newOptions = e.target.value
                                .split(";")
                                .map((optStr) => {
                                  const cleaned = optStr.trim();
                                  return cleaned
                                    ? { value: cleaned, label: cleaned }
                                    : null;
                                })
                                .filter((opt) => opt !== null);
                              setFormData((prev) => ({
                                ...prev,
                                dependentOptions: {
                                  ...prev.dependentOptions,
                                  default: newOptions,
                                },
                              }));
                            }}
                            margin="dense"
                            placeholder="Type options separated by semicolons, e.g., Sub-option 1;Sub-option 2 with comma;Sub-option 3"
                            helperText="Use semicolons (;) to separate options. Commas and spaces are allowed within each option."
                          />
                        );
                      }
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
        {formData.type === "enclosure" && (
          <>
            {!isWorkflowContext && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isDependentEnclosure || false}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isDependentEnclosure: e.target.checked,
                        dependentField: e.target.checked ? "" : null,
                        dependentValues: e.target.checked ? [] : null,
                      }))
                    }
                  />
                }
                label="Is Dependent on Another Field?"
              />
            )}
            {formData.isDependentEnclosure && !isWorkflowContext && (
              <>
                <FormControl fullWidth margin="dense">
                  <InputLabel id="dependent-field-label">
                    Dependent Field
                  </InputLabel>
                  <Select
                    labelId="dependent-field-label"
                    value={formData.dependentField || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dependentField: e.target.value,
                        dependentValues: [],
                      }))
                    }
                  >
                    <MenuItem value="">
                      <em>Select a field</em>
                    </MenuItem>
                    {filteredSelectableFields.map((field) => (
                      <MenuItem key={field.id} value={field.id}>
                        {field.label} ({field.type})
                        {field.isAdditional && " [Additional]"}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {formData.dependentField && (
                  <FormControl fullWidth margin="dense">
                    <InputLabel id="dependent-values-label">
                      Dependent Values (Select Multiple)
                    </InputLabel>
                    {(() => {
                      const selectedField = selectableFields.find(
                        (field) => field.id === formData.dependentField
                      );
                      if (selectedField?.options?.length > 0) {
                        return (
                          <Select
                            labelId="dependent-values-label"
                            multiple
                            value={formData.dependentValues || []}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                dependentValues: e.target.value,
                              }))
                            }
                            renderValue={(selected) =>
                              selected
                                .map((val) => {
                                  return selectedField.options.find(
                                    (opt) => opt.value === val
                                  )?.label;
                                })
                                .filter((label) => label)
                                .join("; ")
                            }
                          >
                            {selectedField.options.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        );
                      } else {
                        return (
                          <TextField
                            fullWidth
                            label="Condition for Dependent Field"
                            value={formData.dependentValues?.[0] || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                dependentValues: [e.target.value],
                              }))
                            }
                            margin="dense"
                            placeholder="e.g., 'Not empty' for text fields"
                          />
                        );
                      }
                    })()}
                  </FormControl>
                )}
              </>
            )}
            <TextField
              fullWidth
              label="Default Options (semicolon-separated)"
              value={optionInputText}
              onChange={(e) => setOptionInputText(e.target.value)}
              onBlur={() =>
                setFormData((prev) => ({
                  ...prev,
                  options: optionInputText
                    .split(";")
                    .map((optStr) => {
                      const cleaned = optStr.trim();
                      return cleaned
                        ? { value: cleaned, label: cleaned }
                        : null;
                    })
                    .filter((opt) => opt !== null),
                }))
              }
              margin="dense"
              placeholder="Type options separated by semicolons, e.g., Option 1;Option 2 with space, comma;Option 3"
              helperText="Use semicolons (;) to separate options. Commas and spaces are allowed within each option."
            />
          </>
        )}
        {formData.type === "file" && (
          <TextField
            fullWidth
            label="File Type Allowed"
            value={formData.accept}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, accept: e.target.value }))
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
                  setFormData((prev) => ({
                    ...prev,
                    validationFunctions: updatedValidations,
                  }));
                }}
              />
            }
            label={func.label}
          />
        ))}
        {transformationFunctionsList.map((func) => (
          <FormControlLabel
            key={func.id}
            control={
              <Checkbox
                checked={formData.transformationFunctions.includes(func.id)}
                onChange={(e) => {
                  let updatedValidations = [
                    ...formData.transformationFunctions,
                  ];
                  if (e.target.checked) {
                    updatedValidations.push(func.id);
                  } else {
                    updatedValidations = updatedValidations.filter(
                      (id) => id !== func.id
                    );
                  }
                  setFormData((prev) => ({
                    ...prev,
                    transformationFunctions: updatedValidations,
                  }));
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

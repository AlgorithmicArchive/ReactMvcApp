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
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
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

  const processFields = (fields, parentLabel = "", parentFieldName = "") => {
    fields.forEach((field) => {
      selectableFields.push({
        id: field.name,
        label: parentLabel ? `${parentLabel} > ${field.label}` : field.label,
        options: field.options || [],
        isAdditional: !!parentFieldName,
        type: field.type,
        parentFieldName: parentFieldName || undefined,
      });

      if (field.additionalFields) {
        Object.values(field.additionalFields).forEach((additionalFieldArray) => {
          processFields(
            additionalFieldArray,
            parentLabel ? `${parentLabel} > ${field.label}` : field.label,
            field.name
          );
        });
      }
    });
  };

  if (sections?.length > 0) {
    sections.forEach((section) => processFields(section.fields || []));
  }

  if (actionForm?.length > 0) {
    processFields(actionForm);
  }

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
    minLength: selectedField?.minLength ?? 5,
    maxLength: selectedField?.maxLength ?? 50,
    options: Array.isArray(selectedField?.options) ? selectedField.options : [],
    span: selectedField?.span ?? 12,
    validationFunctions: Array.isArray(selectedField?.validationFunctions)
      ? selectedField.validationFunctions
      : [],
    transformationFunctions: Array.isArray(
      selectedField?.transformationFunctions
    )
      ? selectedField.transformationFunctions
      : [],
    additionalFields: selectedField?.additionalFields || {}, // Maps option values to arrays of additional fields
    accept: selectedField?.accept || "",
    editable: selectedField?.editable ?? true,
    value: selectedField?.value ?? undefined,
    optionsType:
      selectedField?.optionsType ||
      (selectedField?.type === "select" ? "independent" : ""),
    dependentOn: selectedField?.dependentOn || "",
    dependentOptions: selectedField?.dependentOptions || {},
    isDependentEnclosure: selectedField?.isDependentEnclosure || false,
    dependentField: selectedField?.dependentField || "",
    dependentValues: selectedField?.dependentValues || [],
    checkboxLayout: selectedField?.checkboxLayout || "vertical",
    isConsentCheckbox: selectedField?.isConsentCheckbox ?? false,
    required: selectedField?.required ?? false,
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
  const filteredSelectableFields = selectableFields.filter(
    (field) => field.id !== selectedField?.name
  );

  // Ensure consent checkbox clears irrelevant fields on initialization
  useEffect(() => {
    if (formData.isConsentCheckbox && formData.type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        options: [],
        optionsType: "",
        dependentOn: "",
        dependentOptions: {},
        additionalFields: {}, // Clear additional fields for consent
      }));
      setOptionInputText("");
      setDependentOn("");
    }
  }, [formData.isConsentCheckbox, formData.type]);

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
        optionsType: "independent",
      }));
      setOptionInputText(districtOptions.map((opt) => opt.label).join("; "));
    } else {
      setFormData((prev) => ({ ...prev, options: [], optionsType: "" }));
      setOptionInputText("");
    }
  };

  const addAdditionalFieldForOption = (optionValue) => {
    setFormData((prev) => {
      const newAdditionalFields = {
        ...prev.additionalFields,
        [optionValue]: [...(prev.additionalFields[optionValue] || []), { name: "", label: "", type: "text" }],
      };
      return { ...prev, additionalFields: newAdditionalFields };
    });
  };

  const removeAdditionalFieldForOption = (optionValue, index) => {
    setFormData((prev) => {
      const newAdditionalFields = { ...prev.additionalFields };
      if (newAdditionalFields[optionValue]) {
        newAdditionalFields[optionValue].splice(index, 1);
        if (newAdditionalFields[optionValue].length === 0) {
          delete newAdditionalFields[optionValue];
        }
      }
      return { ...prev, additionalFields: newAdditionalFields };
    });
  };

  const updateAdditionalField = (optionValue, index, fieldData) => {
    setFormData((prev) => {
      const newAdditionalFields = { ...prev.additionalFields };
      if (!newAdditionalFields[optionValue]) {
        newAdditionalFields[optionValue] = [];
      }
      newAdditionalFields[optionValue][index] = fieldData;
      return { ...prev, additionalFields: newAdditionalFields };
    });
  };

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    const optionValue = Object.keys(formData.additionalFields).find(key =>
      formData.additionalFields[key].some(field => field.id === draggableId)
    );

    if (!optionValue) return;

    const fields = [...formData.additionalFields[optionValue]];
    const [removed] = fields.splice(source.index, 1);
    fields.splice(destination.index, 0, removed);

    setFormData((prev) => ({
      ...prev,
      additionalFields: {
        ...prev.additionalFields,
        [optionValue]: fields,
      },
    }));
  };

  const saveChanges = () => {
    console.log("Saving FormData:", {
      ...formData,
      isConsentCheckbox: formData.isConsentCheckbox,
      additionalFields: formData.additionalFields,
      options: formData.options,
    });

    const finalFormData = {
      ...formData,
      additionalFields: formData.isConsentCheckbox
        ? {}
        : formData.additionalFields,
      options: formData.isConsentCheckbox ? [] : formData.options,
      optionsType: formData.isConsentCheckbox ? "" : formData.optionsType,
      dependentOn: formData.isConsentCheckbox ? "" : formData.dependentOn,
      dependentOptions: formData.isConsentCheckbox
        ? {}
        : formData.dependentOptions,
    };

    updateField(finalFormData);
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
          (formData.type === "select" || formData.type === "checkbox") && (
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
                    if (selectedField?.options?.length > 0) {
                      return selectedField.options.map((option) => (
                        <TextField
                          key={option.value}
                          fullWidth
                          label={`Maximum Length for ${option.label}`}
                          type="number"
                          value={formData.maxLength?.[option.value] || ""}
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
                    return (
                      <TextField
                        fullWidth
                        label="Maximum Length Condition"
                        value={formData.maxLength?.condition || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            maxLength: {
                              ...prev.maxLength,
                              condition: e.target.value,
                            },
                          }))
                        }
                        margin="dense"
                        placeholder="e.g., 'Not empty' for text fields"
                      />
                    );
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
                isConsentCheckbox:
                  e.target.value === "checkbox"
                    ? prev.isConsentCheckbox
                    : false,
                additionalFields:
                  e.target.value === "checkbox" && prev.isConsentCheckbox
                    ? {}
                    : prev.additionalFields,
              }))
            }
          >
            <MenuItem value="text">Text</MenuItem>
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="select">Select</MenuItem>
            <MenuItem value="checkbox">Checkbox</MenuItem>
            <MenuItem value="file">File</MenuItem>
            <MenuItem value="date">Date</MenuItem>
            <MenuItem value="enclosure">Enclosure</MenuItem>
          </Select>
        </FormControl>

        {/* Checkbox-specific configuration */}
        {(formData.type === "checkbox" || formData.type === "select") && (
          <>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isConsentCheckbox}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData((prev) => ({
                      ...prev,
                      isConsentCheckbox: checked,
                      options: checked ? [] : prev.options,
                      optionsType: checked ? "" : prev.optionsType,
                      dependentOn: checked ? "" : prev.dependentOn,
                      dependentOptions: checked ? {} : prev.dependentOptions,
                      additionalFields: checked ? {} : prev.additionalFields,
                    }));
                    if (checked) {
                      setOptionInputText("");
                      setDependentOn("");
                    }
                  }}
                />
              }
              label="Single Consent Checkbox (True/False)"
            />
            {!formData.isConsentCheckbox && (
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
                          e.target.value === "independent" ? [] : prev.options,
                      }))
                    }
                  >
                    <MenuItem value="">Please Select</MenuItem>
                    <MenuItem value="independent">Independent</MenuItem>
                    {sections && (
                      <MenuItem value="dependent">Dependent</MenuItem>
                    )}
                  </Select>
                </FormControl>
                {formData.optionsType === "independent" && (
                  <TextField
                    fullWidth
                    label="Options (semicolon-separated)"
                    value={optionInputText}
                    onChange={(e) => setOptionInputText(e.target.value)}
                    onBlur={() => {
                      const newOptions = optionInputText
                        .split(";")
                        .map((optStr) => {
                          const cleaned = optStr.trim();
                          return cleaned
                            ? { value: cleaned, label: cleaned }
                            : null;
                        })
                        .filter((opt) => opt !== null);
                      setFormData((prev) => ({ ...prev, options: newOptions }));
                    }}
                    margin="dense"
                    placeholder="Type options separated by semicolons, e.g., Option 1;Option 2 with space, comma;Option 3"
                    helperText="Use semicolons (;) to separate options. Commas and spaces are allowed within each option."
                  />
                )}
                {formData.optionsType === "dependent" && !isWorkflowContext && (
                  <>
                    <FormControl fullWidth margin="dense">
                      <InputLabel id="dependent-on-label">
                        Dependent On
                      </InputLabel>
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
                          if (selectedField?.options?.length > 0) {
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
                          }
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
                        })()}
                      </>
                    )}
                  </>
                )}
                <Typography variant="body2" sx={{ marginTop: 2 }}>
                  Link Additional Fields to Options
                </Typography>
                {formData.options.map((option) => (
                  <Box key={option.value} sx={{ marginBottom: 2 }}>
                    <Typography variant="subtitle1">
                      Options: {option.label} ({option.value})
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => addAdditionalFieldForOption(option.value)}
                      sx={{ marginRight: 1 }}
                    >
                      Add Additional Field
                    </Button>
                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable droppableId={option.value}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {formData.additionalFields[option.value]?.map(
                              (field, index) => (
                                <Draggable
                                  key={`${option.value}-${index}`}
                                  draggableId={`${option.value}-${index}`}
                                  index={index}
                                >
                                  {(provided) => (
                                    <Box
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      sx={{
                                        marginTop: 1,
                                        padding: 1,
                                        border: "1px solid #ccc",
                                        backgroundColor: "#fff",
                                        cursor: "move",
                                      }}
                                    >
                                      <TextField
                                        fullWidth
                                        label="Field Name"
                                        value={field.name || ""}
                                        onChange={(e) =>
                                          updateAdditionalField(option.value, index, {
                                            ...field,
                                            name: e.target.value,
                                          })
                                        }
                                        margin="dense"
                                      />
                                      <TextField
                                        fullWidth
                                        label="Field Label"
                                        value={field.label || ""}
                                        onChange={(e) =>
                                          updateAdditionalField(option.value, index, {
                                            ...field,
                                            label: e.target.value,
                                          })
                                        }
                                        margin="dense"
                                      />
                                      <Select
                                        fullWidth
                                        label="Field Type"
                                        value={field.type || "text"}
                                        onChange={(e) =>
                                          updateAdditionalField(option.value, index, {
                                            ...field,
                                            type: e.target.value,
                                          })
                                        }
                                        margin="dense"
                                      >
                                        <MenuItem value="text">Text</MenuItem>
                                        <MenuItem value="email">Email</MenuItem>
                                        <MenuItem value="select">Select</MenuItem>
                                        <MenuItem value="checkbox">
                                          Checkbox
                                        </MenuItem>
                                      </Select>
                                      <IconButton
                                        color="error"
                                        onClick={() =>
                                          removeAdditionalFieldForOption(
                                            option.value,
                                            index
                                          )
                                        }
                                      >
                                        <RemoveIcon />
                                      </IconButton>
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
                  </Box>
                ))}
                <FormControlLabel
                  control={<Checkbox onChange={handleDistrictCheckboxChange} />}
                  label="Is District"
                />
              </>
            )}
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.required}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      required: e.target.checked,
                    }))
                  }
                />
              }
              label="Required Field"
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
                                .map(
                                  (val) =>
                                    selectedField.options.find(
                                      (opt) => opt.value === val
                                    )?.label
                                )
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
                      }
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
        <Typography variant="body2" sx={{ marginTop: 2 }}>
          Transformation Functions
        </Typography>
        {transformationFunctionsList.map((func) => (
          <FormControlLabel
            key={func.id}
            control={
              <Checkbox
                checked={formData.transformationFunctions.includes(func.id)}
                onChange={(e) => {
                  let updatedTransformations = [
                    ...formData.transformationFunctions,
                  ];
                  if (e.target.checked) {
                    updatedTransformations.push(func.id);
                  } else {
                    updatedTransformations = updatedTransformations.filter(
                      (id) => id !== func.id
                    );
                  }
                  setFormData((prev) => ({
                    ...prev,
                    transformationFunctions: updatedTransformations,
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
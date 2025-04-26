import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { runValidations } from "../../assets/formvalidations";
import {
  Box,
  Checkbox,
  FormControlLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Button,
  Typography,
} from "@mui/material";
import { Col, Row } from "react-bootstrap";
import { fetchFormDetails, GetServiceContent } from "../../assets/fetch";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosConfig";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const sectionIconMap = {
  Location: <LocationOnIcon sx={{ fontSize: 36 }} />,
  "Applicant Details": <PersonIcon sx={{ fontSize: 36 }} />,
  "Present Address Details": <HomeIcon sx={{ fontSize: 36 }} />,
  "Permanent Address Details": <HomeIcon sx={{ fontSize: 36 }} />,
  "Bank Details": <AccountBalanceIcon sx={{ fontSize: 36 }} />,
  Documents: <InsertDriveFileIcon sx={{ fontSize: 36 }} />,
};

// Helper function to flatten the nested formDetails structure
const flattenFormDetails = (nestedDetails) => {
  const flatData = {};
  Object.keys(nestedDetails).forEach((section) => {
    nestedDetails[section].forEach((field) => {
      if (field.type === "enclosure") {
        flatData[field.name] = {
          // You can decide how to preselect; here we default to the first option.
          selected:
            field.options && field.options[0] ? field.options[0].value : "",
          // Use the file path if available
          file: field.File || "",
        };
      } else {
        if (field.hasOwnProperty("value")) {
          flatData[field.name] = field.value;
        }
        if (field.hasOwnProperty("File") && field.File) {
          flatData[field.name] = field.File;
        }
      }
    });
  });
  return flatData;
};

const DynamicStepForm = ({ mode = "new", data }) => {
  const {
    control,
    handleSubmit,
    trigger,
    watch,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  const [formSections, setFormSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [initialData, setInitialData] = useState(null);
  // Store additionalDetails from the fetch so we can use returnFields
  const [additionalDetails, setAdditionalDetails] = useState(null);
  const [isCopyAddressChecked, setIsCopyAddressChecked] = useState(false);
  const applicantImageFile = watch("ApplicantImage");
  const [applicantImagePreview, setApplicantImagePreview] = useState(
    "/assets/images/profile.jpg"
  );
  const navigate = useNavigate();
  const location = useLocation();

  // To avoid duplicate defaults
  const hasRunRef = useRef(false);

  // Helper to determine if a field should be disabled in "edit" mode.
  const isFieldDisabled = (fieldName) => {
    if (
      mode === "edit" &&
      additionalDetails &&
      additionalDetails.returnFields
    ) {
      // Enable only if the field is included in returnFields; otherwise disable.
      return !additionalDetails.returnFields.includes(fieldName);
    }
    return false;
  };

  // Update image preview when the applicant file changes
  useEffect(() => {
    if (applicantImageFile && applicantImageFile instanceof File) {
      const objectUrl = URL.createObjectURL(applicantImageFile);
      setApplicantImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [applicantImageFile]);

  // Load service content and, if mode === "incomplete" or "edit", fetch and flatten existing form details
  useEffect(() => {
    async function loadForm() {
      try {
        // Expect ServiceId and optionally referenceNumber from location.state
        const { ServiceId, referenceNumber } = location.state || {};
        setSelectedServiceId(ServiceId);
        if (referenceNumber) {
          setReferenceNumber(referenceNumber);
        }
        const result = await GetServiceContent(ServiceId);
        if (result && result.status) {
          try {
            const config = JSON.parse(result.formElement);
            setFormSections(config);
          } catch (err) {
            console.error("Error parsing formElements:", err);
            setFormSections([]);
          }
        }
        // For incomplete or edit modes, fetch the existing form details along with additionalDetails.
        if ((mode === "incomplete" || mode === "edit") && referenceNumber) {
          const { formDetails, additionalDetails } = await fetchFormDetails(
            referenceNumber
          );
          const flatDetails = flattenFormDetails(formDetails);
          setInitialData(flatDetails);
          reset(flatDetails);
          setAdditionalDetails(additionalDetails);
        } else if (data !== undefined) {
          setInitialData(data);
          reset(data);
        }
      } catch (error) {
        console.error("Error fetching service content:", error);
      } finally {
        setLoading(false);
      }
    }
    loadForm();
  }, [location.state, mode, reset, data]);

  // Set default file for fields that require it (e.g., applicant image)
  const setDefaultFile = async (path) => {
    const response = await fetch(path);
    const blob = await response.blob();
    const file = new File([blob], "profile.jpg", { type: blob.type });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    console.log("FILE", dataTransfer.files[0]);
    setValue("ApplicantImage", dataTransfer.files[0]);
  };

  // Once the form sections and initialData are available, set any dependent defaults (districts, files, etc.)
  useEffect(() => {
    if (!formSections.length || !initialData) return;
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    formSections.forEach((section, sectionIndex) => {
      section.fields.forEach((field) => {
        if (
          field.name.toLowerCase().includes("district") &&
          initialData[field.name]
        ) {
          handleDistrictChange(sectionIndex, field, initialData[field.name]);
        }
        if (
          field.name.toLowerCase().includes("applicantimage") &&
          initialData[field.name]
        ) {
          setApplicantImagePreview(initialData[field.name]);
          setDefaultFile(initialData[field.name]);
        }
      });
    });
  }, [formSections, initialData, setValue]);

  // Copy address from Present to Permanent if checked
  const handleCopyAddress = (checked, sectionIndex) => {
    if (checked) {
      const presentSection = formSections.find(
        (sec) => sec.section === "Present Address Details"
      );
      const permanentSection = formSections.find(
        (sec) => sec.section === "Permanent Address Details"
      );
      const permanentDistrictField = permanentSection.fields.find((field) =>
        field.name.includes("District")
      );
      if (presentSection) {
        presentSection.fields.forEach((field) => {
          const presentFieldName = field.name;
          const permanentFieldName = presentFieldName.replace(
            "Present",
            "Permanent"
          );
          const presentValue = getValues(presentFieldName);
          setValue(permanentFieldName, presentValue);
          if (permanentFieldName.includes("District")) {
            handleDistrictChange(
              sectionIndex,
              permanentDistrictField,
              presentValue
            );
          }
        });
      }
    }
  };

  const handleNext = async () => {
    // Get all field names including additional fields
    const currentFieldNames = formSections[currentStep].fields.flatMap(
      (field) => {
        const baseFields = [field.name];

        // Handle select fields with additional fields
        if (field.type === "select" && field.additionalFields) {
          const selectedValue = getValues(field.name);
          const additionalFields = field.additionalFields[selectedValue] || [];
          return [...baseFields, ...additionalFields.map((af) => af.name)];
        }

        return baseFields;
      }
    );

    const valid = await trigger(currentFieldNames);

    if (valid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // When a district field changes, fetch tehsils and update the tehsil field options
  const handleDistrictChange = async (sectionIndex, districtField, value) => {
    try {
      const response = await fetch(
        `/Base/GetTeshilForDistrict?districtId=${value}`
      );
      const data = await response.json();
      if (data.status && data.tehsils) {
        const newOptions = [
          { value: "Please Select", label: "Please Select" },
          ...data.tehsils.map((tehsil) => ({
            value: tehsil.tehsilId,
            label: tehsil.tehsilName,
          })),
        ];
        setFormSections((prevSections) => {
          const newSections = [...prevSections];
          const section = newSections[sectionIndex];
          // Assume the tehsil field's name is derived by replacing "District" with "Tehsil"
          const tehsilFieldName = districtField.name.replace(
            "District",
            "Tehsil"
          );
          section.fields = section.fields.map((field) =>
            field.name === tehsilFieldName
              ? { ...field, options: newOptions }
              : field
          );
          return newSections;
        });
      }
    } catch (error) {
      console.error("Error fetching tehsils:", error);
    }
  };

  // Process the form data and submit
  const onSubmit = async (data, operationType) => {
    const groupedFormData = {};
    setButtonLoading(true);

    // Recursively process each field and any nested additional fields
    const processField = (field, data) => {
      // If the field is an enclosure and is dependent,
      // check if the parent's value meets the condition.
      if (field.type === "enclosure" && field.isDependentEnclosure) {
        const parentValue = data[field.dependentField];
        if (!parentValue || !field.dependentValues.includes(parentValue)) {
          // Skip this enclosure field if dependency is not met.
          return null;
        }
      }

      const sectionFormData = {};
      const fieldValue = data[field.name] || "";
      sectionFormData["label"] = field.label;
      sectionFormData["name"] = field.name;

      if (field.type === "enclosure") {
        // Since enclosures now have two controllers,
        // retrieve values from their respective keys.
        sectionFormData["Enclosure"] = data[`${field.name}_select`] || "";
        sectionFormData["File"] = data[`${field.name}_file`] || "";
      } else if (field.name === "ApplicantImage") {
        sectionFormData["File"] = fieldValue;
      } else {
        sectionFormData["value"] = fieldValue;
      }

      // Process nested additional fields if present
      if (field.additionalFields) {
        const selectedValue = data[field.name] || "";
        const additionalFields = field.additionalFields[selectedValue];
        if (additionalFields) {
          sectionFormData.additionalFields = additionalFields
            .map((additionalField) => {
              const nestedFieldName =
                additionalField.name || `${field.name}_${additionalField.id}`;
              return processField(
                { ...additionalField, name: nestedFieldName },
                data
              );
            })
            .filter((nestedField) => nestedField !== null); // Filter out any null fields.
        }
      }
      return sectionFormData;
    };

    // Loop through each form section and process its fields.
    formSections.forEach((section) => {
      groupedFormData[section.section] = [];
      section.fields.forEach((field) => {
        const sectionData = processField(field, data);
        if (sectionData !== null) {
          groupedFormData[section.section].push(sectionData);
        }
      });
    });

    // Build form data for submission.
    const formdata = new FormData();
    formdata.append("serviceId", selectedServiceId);
    formdata.append("formDetails", JSON.stringify(groupedFormData));

    // Append any file instances from the grouped data.
    for (const section in groupedFormData) {
      groupedFormData[section].forEach((field) => {
        if (field.hasOwnProperty("File") && field.File instanceof File) {
          formdata.append(field.name, field.File);
        }
        if (field.additionalFields) {
          field.additionalFields.forEach((nestedField) => {
            if (
              nestedField.hasOwnProperty("File") &&
              nestedField.File instanceof File
            ) {
              formdata.append(nestedField.name, nestedField.File);
            }
          });
        }
      });
    }

    formdata.append(
      "status",
      operationType === "submit" ? "Initiated" : "Incomplete"
    );
    formdata.append("referenceNumber", referenceNumber);
    let url = "/User/InsertFormDetails";
    if (additionalDetails != null) {
      formdata.append("returnFields", additionalDetails["returnFields"]);
      url = "/User/UpdateApplicationDetails";
    }

    // Uncomment and adjust below lines when integrating with your backend.
    const response = await axiosInstance.post(url, formdata);
    const result = response.data;
    setButtonLoading(false);
    if (result.status) {
      if (result.type === "Submit") {
        navigate("/user/acknowledge", {
          state: { applicationId: result.referenceNumber },
        }); //rms portal
      } else {
        setReferenceNumber(result.referenceNumber);
      }
    }
  };

  // Note: We pass disabled={isFieldDisabled(field.name)} for every input control.
  const renderField = (field, sectionIndex) => {
    // Common styles for all fields
    const commonStyles = {
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: "divider",
        },
        "&:hover fieldset": {
          borderColor: "primary.main",
        },
        "&.Mui-focused fieldset": {
          borderColor: "primary.main",
          borderWidth: "2px",
        },
        backgroundColor: "background.paper",
        color: "text.primary",
      },
      "& .MuiInputLabel-root": {
        color: "text.primary",
        "&.Mui-focused": {
          color: "primary.main",
        },
      },
      marginBottom: 5,
    };

    // Button styles
    const buttonStyles = {
      backgroundColor: "primary.main",
      color: "background.paper",
      fontWeight: "bold",
      "&:hover": {
        backgroundColor: "primary.dark",
      },
      marginBottom: 5,
    };

    switch (field.type) {
      case "text":
      case "email":
      case "date":
        return (
          <Controller
            name={field.name}
            control={control}
            defaultValue={""}
            rules={{
              validate: async (value) =>
                await runValidations(field, value, getValues()),
            }}
            render={({ field: { onChange, value, ref } }) => (
              <TextField
                type={field.type}
                id={`field-${field.id}`}
                label={field.label}
                value={value || ""}
                onChange={onChange}
                inputRef={ref}
                disabled={isFieldDisabled(field.name)}
                error={Boolean(errors[field.name])}
                helperText={errors[field.name]?.message || ""}
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  maxLength: field.validationFunctions?.includes(
                    "specificLength"
                  )
                    ? field.maxLength
                    : undefined,
                }}
                sx={commonStyles}
              />
            )}
          />
        );

      case "file":
        return (
          <Controller
            name={field.name}
            control={control}
            defaultValue={null}
            rules={{
              validate: async (value) => await runValidations(field, value),
            }}
            render={({ field: { onChange, ref } }) => (
              <FormControl
                fullWidth
                margin="normal"
                error={Boolean(errors[field.name])}
                sx={commonStyles}
              >
                <Button
                  variant="contained"
                  component="label"
                  disabled={isFieldDisabled(field.name)}
                  sx={buttonStyles}
                >
                  {field.label}
                  <input
                    type="file"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files[0];
                      onChange(file);
                    }}
                    ref={ref}
                    accept={field.accept}
                  />
                </Button>
                <FormHelperText sx={{ color: "error.main" }}>
                  {errors[field.name]?.message || ""}
                </FormHelperText>
              </FormControl>
            )}
          />
        );

      case "select":
        return (
          <Controller
            name={field.name}
            control={control}
            defaultValue={field.options[0]?.value || ""}
            rules={{
              validate: async (value) =>
                await runValidations(field, value, getValues()),
            }}
            render={({ field: { onChange, value, ref } }) => {
              let options;
              if (field.optionsType === "dependent" && field.dependentOn) {
                const parentValue = watch(field.dependentOn);
                options =
                  field.dependentOptions && field.dependentOptions[parentValue]
                    ? field.dependentOptions[parentValue]
                    : [];
              } else {
                options = field.options;
              }

              return (
                <>
                  <TextField
                    select
                    fullWidth
                    variant="outlined"
                    label={field.label}
                    value={value || ""}
                    id={`field-${field.id}`}
                    onChange={(e) => {
                      onChange(e);
                      const districtFields = [
                        "district",
                        "presentdistrict",
                        "permanentdistrict",
                      ];
                      const normalizedFieldName = field.name
                        .toLowerCase()
                        .replace(/\s/g, "");
                      const isDistrict =
                        districtFields.includes(normalizedFieldName);
                      if (isDistrict) {
                        handleDistrictChange(
                          sectionIndex,
                          field,
                          e.target.value
                        );
                      }
                    }}
                    error={Boolean(errors[field.name])}
                    helperText={errors[field.name]?.message || ""}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputRef={ref}
                    sx={commonStyles}
                  >
                    {options.map((option) => (
                      <MenuItem
                        key={option.value}
                        value={option.value}
                        sx={{
                          color: "text.primary",
                          "&:hover": {
                            backgroundColor: "primary.light",
                          },
                          "&.Mui-selected": {
                            backgroundColor: "primary.main",
                            color: "background.paper",
                          },
                        }}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  {field.additionalFields &&
                    field.additionalFields[value] &&
                    field.additionalFields[value].map((additionalField) => (
                      <Col
                        xs={12}
                        lg={additionalField.span}
                        key={additionalField.id}
                      >
                        {renderField(additionalField, sectionIndex)}
                      </Col>
                    ))}
                </>
              );
            }}
          />
        );

      case "enclosure":
        const isDependent = field.isDependentEnclosure;
        const parentValue = isDependent ? watch(field.dependentField) : null;
        if (
          isDependent &&
          (!parentValue || !field.dependentValues.includes(parentValue))
        ) {
          return null;
        } else
          return (
            <>
              {/* Select Field Controller */}
              <Controller
                name={`${field.name}_select`}
                control={control}
                defaultValue={field.options[0]?.value || ""}
                rules={{
                  validate: async (value) =>
                    await runValidations(field, value, getValues()),
                }}
                render={({ field: { onChange, value, ref } }) => (
                  <FormControl
                    fullWidth
                    margin="normal"
                    error={Boolean(errors[`${field.name}_select`])}
                    sx={commonStyles}
                  >
                    <InputLabel id={`${field.id}_select-label`}>
                      {field.label}
                    </InputLabel>
                    <Select
                      labelId={`${field.id}_select-label`}
                      id={`${field.id}_select`}
                      value={value || ""}
                      label={field.label}
                      disabled={isFieldDisabled(`${field.name}_select`)}
                      onChange={(e) => onChange(e.target.value)}
                      inputRef={ref}
                    >
                      {field.options.map((option) => (
                        <MenuItem
                          key={option.value}
                          value={option.value}
                          sx={{
                            color: "text.primary",
                            "&:hover": {
                              backgroundColor: "primary.light",
                            },
                            "&.Mui-selected": {
                              backgroundColor: "primary.main",
                              color: "background.paper",
                            },
                          }}
                        >
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText sx={{ color: "error.main" }}>
                      {errors[`${field.name}_select`]?.message || ""}
                    </FormHelperText>
                  </FormControl>
                )}
              />

              {/* File Upload Controller */}
              <Controller
                name={`${field.name}_file`}
                control={control}
                defaultValue={null}
                rules={{
                  validate: async (value) =>
                    await runValidations(field, value, getValues()),
                }}
                render={({ field: { onChange, value } }) => (
                  <>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <Button
                        variant="contained"
                        component="label"
                        sx={{
                          ...buttonStyles,
                          width: "100%",
                          borderRadius: 15,
                        }}
                        disabled={
                          isFieldDisabled(`${field.name}_file`) ||
                          !watch(`${field.name}_select`)
                        }
                      >
                        Upload
                        <input
                          type="file"
                          hidden
                          onChange={(e) => {
                            const file = e.target.files[0];
                            onChange(file);
                          }}
                          accept={field.accept}
                        />
                      </Button>

                      {value && (
                        <FormHelperText
                          sx={{
                            cursor: "pointer",
                            color: "primary.main",
                            textDecoration: "underline",
                            fontSize: 16,
                            textAlign: "center",
                            "&:hover": {
                              color: "primary.dark",
                            },
                          }}
                          onClick={() => {
                            const fileURL =
                              typeof value === "string"
                                ? value
                                : URL.createObjectURL(value);
                            window.open(fileURL, "_blank");
                          }}
                        >
                          {typeof value === "string" ? "View file" : value.name}
                        </FormHelperText>
                      )}
                    </div>
                    <Box>
                      <FormHelperText sx={{ color: "error.main" }}>
                        {errors[`${field.name}_file`]?.message || ""}
                      </FormHelperText>
                    </Box>
                  </>
                )}
              />
            </>
          );

      default:
        return null;
    }
  };

  if (loading) return <div>Loading form...</div>;

  return (
    <Box
      sx={{
        width: "50vw",
        margin: "0 auto",
        backgroundColor: "#FFFFFF",
        borderRadius: 5,
        color: "priamry.main",
        padding: 10,
        boxShadow: 20,
      }}
    >
      <form onSubmit={handleSubmit((data) => onSubmit(data, "submit"))}>
        {formSections.length > 0 ? (
          <>
            {formSections.map((section, index) => {
              if (index !== currentStep) return null;
              return (
                <div
                  key={section.id}
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <Box
                    style={{
                      textAlign: "center",
                      marginBottom: 50,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: "primary.main",
                        height: 50, // Use numbers for pixels (MUI will convert to 'px')
                        width: 50, // Same as above
                        borderRadius: "50%", // Perfect circle (better than "75%")
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "#FFFFFF", // Ensures icon is white (adjust if needed)
                        flexShrink: 0, // Prevents shrinking in flex containers
                      }}
                    >
                      {sectionIconMap[section.section] || (
                        <HelpOutlineIcon
                          sx={{
                            fontSize: 36, // Better proportion for 50px circle
                            "& path": {
                              // Ensures SVG path inherits color
                              fill: "currentColor",
                            },
                          }}
                        />
                      )}
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start", // More explicit than "start"
                        alignItems: "flex-start", // Add this to align items to the left
                        width: "100%", // Ensures full width alignment
                      }}
                    >
                      <Typography sx={{ fontSize: 12, fontWeight: "bold" }}>
                        Step {currentStep + 1}/{formSections.length}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {section.section}
                      </Typography>
                    </Box>
                  </Box>
                  {section.section === "Permanent Address Details" && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isCopyAddressChecked}
                          onChange={(e) => {
                            setIsCopyAddressChecked(e.target.checked);
                            handleCopyAddress(e.target.checked, index);
                          }}
                        />
                      }
                      label="Same As Present Address"
                    />
                  )}
                  {section.section === "Applicant Details" && (
                    <Box
                      component="img"
                      src={applicantImagePreview}
                      alt="Applicant Image"
                      sx={{
                        width: 150,
                        height: 150,
                        borderRadius: "8px",
                        objectFit: "cover",
                        boxShadow: 2,
                        margin: "0 auto",
                      }}
                    />
                  )}
                  <Row
                    style={{
                      display: "flex",
                      flexDirection:
                        section.section == "Documents" ? "column" : "row",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {section.fields.map((field) => (
                      <Col xs={12} lg={field.span} key={field.id}>
                        {renderField(field, index)}
                      </Col>
                    ))}
                  </Row>
                </div>
              );
            })}

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 3,
              }}
            >
              {currentStep > 0 && (
                <Button
                  sx={{
                    backgroundColor: "primary.main",
                    borderRadius: 10,
                    color: "#FFFFFF",
                    fontSize: 24,
                    width: "40%",
                  }}
                  onClick={handlePrev}
                >
                  Previous
                </Button>
              )}
              {currentStep < formSections.length - 1 && (
                <Button
                  sx={{
                    backgroundColor: "primary.main",
                    borderRadius: 10,
                    color: "#FFFFFF",
                    fontSize: 24,
                    width: "40%",
                  }}
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
              {currentStep === formSections.length - 1 && (
                <Button
                  sx={{
                    backgroundColor: "primary.main",
                    borderRadius: 10,
                    color: "#FFFFFF",
                    fontSize: 24,
                    width: "40%",
                  }}
                  onClick={handleSubmit((data) => onSubmit(data, "submit"))}
                >
                  Submit
                </Button>
              )}
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "center", marginTop: 5 }}
            >
              {currentStep !== formSections.length - 1 && (
                <Button
                  sx={{
                    backgroundColor: "primary.main",
                    borderRadius: 10,
                    color: "#FFFFFF",
                    fontSize: 24,
                    width: "40%",
                  }}
                  onClick={handleSubmit((data) => onSubmit(data, "save"))}
                >
                  Save
                </Button>
              )}
            </Box>
          </>
        ) : (
          !loading && <div>No form configuration available.</div>
        )}
      </form>
    </Box>
  );
};

export default DynamicStepForm;

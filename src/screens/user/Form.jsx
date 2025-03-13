import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { runValidations } from "../../assets/formvalidations";
import { Box, Checkbox, FormControlLabel } from "@mui/material";
import CustomButton from "../../components/CustomButton";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Button,
} from "@mui/material";
import { Col, Row } from "react-bootstrap";
import { GetServiceContent } from "../../assets/fetch";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosConfig";

const commonStyles = {
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#312C51" },
    "&:hover fieldset": { borderColor: "#312C51" },
    "&.Mui-focused fieldset": { borderColor: "#312C51" },
  },
  "& .MuiInputLabel-root": { color: "#312C51" },
  "& .MuiInputBase-input::placeholder": { color: "#312C51" },
  color: "#312C51",
};

const DynamicStepForm = () => {
  const {
    control,
    handleSubmit,
    trigger,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  const [formSections, setFormSections] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState(""); // State for selected service
  const location = useLocation();
  const navigate = useNavigate();
  // State for checkbox
  const [isCopyAddressChecked, setIsCopyAddressChecked] = useState(false);
  const applicantImageFile = watch("ApplicantImage");

  // State to hold the preview URL
  const [applicantImagePreview, setApplicantImagePreview] = useState(
    "/assets/images/profile.jpg"
  );

  useEffect(() => {
    if (applicantImageFile && applicantImageFile instanceof File) {
      // Create a preview URL for the uploaded file
      const objectUrl = URL.createObjectURL(applicantImageFile);
      setApplicantImagePreview(objectUrl);

      // Clean up the URL when the component unmounts or file changes
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [applicantImageFile]);

  // Fetch services on mount
  useEffect(() => {
    async function ServiceContent() {
      try {
        const { ServiceId } = location.state || {};
        setSelectedServiceId(ServiceId);
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
      } catch (error) {
        console.error("Error fetching service content:", error);
      } finally {
        setLoading(false);
      }
    }
    ServiceContent();
  }, []);

  // Copy address handler
  const handleCopyAddress = (checked, sectionIndex) => {
    if (checked) {
      // Find present address fields
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

          // Get present address value and set to permanent address
          const presentValue = getValues(presentFieldName);
          setValue(permanentFieldName, presentValue);
          if (permanentFieldName.includes("District")) {
            console.log(sectionIndex, permanentDistrictField, presentValue);
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

  // When Next is pressed, trigger validation for all fields in the current step
  const handleNext = async () => {
    const currentFieldNames = formSections[currentStep].fields.map(
      (field) => field.name
    );
    const valid = await trigger(currentFieldNames);
    if (valid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = async (data, operationType) => {
    // This will hold all fields in a flat structure.
    const finalFormData = {};
    setButtonLoading(true);
    // Recursive function to process a field and any nested additional fields.
    const processField = (field, data) => {
      const fieldValue = data[field.name] || "";

      // If the field is of type "enclosure", split the values into two keys.
      if (field.type === "enclosure") {
        // Assumes the value is an object like { selected: ..., file: ... }
        finalFormData[field.name + "Enclosure"] = fieldValue.selected || "";
        finalFormData[field.name + "File"] = fieldValue.file || "";
      } else {
        // Simply store the field value under its name.
        finalFormData[field.name] = fieldValue;
      }

      // No extra textValue is added now for district/tehsil fields.

      // Process any additional (nested) fields recursively.
      if (field.additionalFields) {
        const selectedValue = data[field.name];
        const additionalFields = field.additionalFields[selectedValue];
        if (additionalFields) {
          additionalFields.forEach((additionalField) => {
            // Generate a unique nested field name.
            const nestedFieldName =
              additionalField.name || `${field.name}_${additionalField.id}`;
            processField({ ...additionalField, name: nestedFieldName }, data);
          });
        }
      }
    };

    // Instead of grouping by section, loop through all sections and all fields to build one flat object.
    formSections.forEach((section) => {
      section.fields.forEach((field) => {
        processField(field, data);
      });
    });

    // Create a FormData object to send to the server.
    const formdata = new FormData();
    formdata.append("serviceId", selectedServiceId);
    // Convert the flat object to JSON.
    formdata.append("formDetails", JSON.stringify(finalFormData));

    for (const key in finalFormData) {
      if (finalFormData.hasOwnProperty(key)) {
        if (finalFormData[key] instanceof File) {
          formdata.append(key, finalFormData[key]);
        }
      }
    }
    formdata.append(
      "status",
      operationType == "submit" ? "Initiated" : "Incomplete"
    );
    formdata.append("referenceNumber", referenceNumber);
    const response = await axiosInstance.post(
      "/User/InsertFormDetails",
      formdata
    );
    const result = response.data;
    setButtonLoading(false);
    if (result.status) {
      if (result.type == "submit") {
        navigate("/user/acknowledge", {
          state: { applicationId: result.referenceNumber },
        });
      } else {
        setReferenceNumber(result.referenceNumber);
      }
    }
  };

  // When a district field changes, fetch tehsils and update the corresponding tehsil field's options
  const handleDistrictChange = async (sectionIndex, districtField, value) => {
    try {
      const response = await fetch(
        `/Base/GetTeshilForDistrict?districtId=${value}`
      );
      const data = await response.json();
      if (data.status && data.tehsils) {
        const newOptions = data.tehsils.map((tehsil) => ({
          value: tehsil.tehsilId,
          label: tehsil.tehsilName,
        }));

        setFormSections((prevSections) => {
          const newSections = [...prevSections];
          const section = newSections[sectionIndex];
          // Assume the tehsil field's name is derived by replacing "District" with "Tehsil"
          const tehsilFieldName = districtField.name.replace(
            "District",
            "Tehsil"
          );
          section.fields = section.fields.map((field) => {
            if (field.name === tehsilFieldName) {
              return { ...field, options: newOptions };
            }
            return field;
          });
          return newSections;
        });
      }
    } catch (error) {
      console.error("Error fetching tehsils:", error);
    }
  };

  // Render an individual field using Controller
  const renderField = (field, sectionIndex) => {
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
                id={field.id}
                label={field.label}
                value={value || ""}
                onChange={onChange}
                inputRef={ref}
                error={Boolean(errors[field.name])}
                helperText={errors[field.name]?.message || ""}
                fullWidth
                margin="normal"
                inputProps={{
                  maxLength: field.validationFunctions?.includes(
                    "specificLength"
                  )
                    ? field.maxLength // Replace with your actual max length value
                    : undefined,
                }}
                sx={{
                  ...commonStyles,
                  "& .MuiInputBase-input": { color: "#312C51" },
                }}
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
            render={({ field: { onChange, ref, value } }) => (
              <FormControl
                fullWidth
                margin="normal"
                error={Boolean(errors[field.name])}
                sx={commonStyles}
              >
                <Button
                  variant="contained"
                  component="label"
                  sx={{ backgroundColor: "#312C51", color: "#fff" }}
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
                <FormHelperText>
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
              const districtFields = [
                "district",
                "presentdistrict",
                "permanentdistrict",
              ];
              const normalizedFieldName = field.name
                .toLowerCase()
                .replace(/\s/g, "");

              const isDistrict = districtFields.includes(normalizedFieldName);
              let options;
              if (field.optionsType == "dependent" && field.dependentOn) {
                const parentValue = watch(field.dependentOn);
                options =
                  field.dependentOptions && field.dependentOptions[parentValue]
                    ? field.dependentOptions[parentValue]
                    : [];
              } else options = field.options;
              return (
                <FormControl
                  fullWidth
                  margin="normal"
                  error={Boolean(errors[field.name])}
                  sx={commonStyles}
                >
                  <InputLabel id={`${field.id}-label`}>
                    {field.label}
                  </InputLabel>
                  <Select
                    labelId={`${field.id}-label`}
                    id={field.id}
                    value={value || ""}
                    label={field.label}
                    onChange={(e) => {
                      onChange(e);
                      if (isDistrict) {
                        handleDistrictChange(
                          sectionIndex,
                          field,
                          e.target.value
                        );
                      }
                    }}
                    inputRef={ref}
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#312C51",
                      },
                      color: "#312C51",
                    }}
                  >
                    {options.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {errors[field.name]?.message || ""}
                  </FormHelperText>
                  {
                    // Render additional fields if this select option has extra fields.
                    field.additionalFields &&
                      field.additionalFields[value] &&
                      field.additionalFields[value].map((additionalField) => {
                        const additionalFieldName =
                          additionalField.name ||
                          `${field.name}_${additionalField.id}`;
                        return (
                          <div
                            key={additionalField.id}
                            style={{ marginBottom: 16 }}
                          >
                            <InputLabel
                              htmlFor={additionalField.id}
                              sx={{ color: "#312C51" }}
                            >
                              {additionalField.label}
                            </InputLabel>
                            {renderField(
                              { ...additionalField, name: additionalFieldName },
                              sectionIndex
                            )}
                          </div>
                        );
                      })
                  }
                </FormControl>
              );
            }}
          />
        );

      case "enclosure":
        return (
          <Controller
            name={field.name}
            control={control}
            defaultValue={{
              selected: field.options[0]?.value || "",
              file: null,
            }}
            rules={{}}
            render={({ field: { onChange, value, ref } }) => {
              const isDependent = field.isDependentEnclosure;
              const parentValue = isDependent
                ? watch(field.dependentField)
                : null;

              // Check if the enclosure should be hidden
              if (
                isDependent &&
                (!parentValue || !field.dependentValues.includes(parentValue))
              ) {
                return null; // Do not render anything
              }

              // Get available options based on dependency
              let options = field.options;

              // Reset selection if the parent field changes
              useEffect(() => {
                if (
                  isDependent &&
                  !options.find((opt) => opt.value === value.selected)
                ) {
                  onChange({ selected: "", file: null });
                }
              }, [parentValue]);

              return (
                <FormControl
                  fullWidth
                  margin="normal"
                  error={Boolean(errors[field.name])}
                  sx={commonStyles}
                >
                  <InputLabel id={`${field.id}_select-label`}>
                    {field.label}
                  </InputLabel>
                  <Select
                    labelId={`${field.id}_select-label`}
                    id={`${field.id}_select`}
                    value={value.selected || ""}
                    label={field.label}
                    onChange={(e) => {
                      const newVal = {
                        ...value,
                        selected: e.target.value,
                        file: null,
                      };
                      onChange(newVal);
                    }}
                    inputRef={ref}
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#312C51",
                      },
                      color: "#312C51",
                    }}
                  >
                    {options.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {errors[field.name]?.message || ""}
                  </FormHelperText>

                  {/* Show file name above the button and allow viewing */}
                  {value.file && (
                    <FormHelperText
                      sx={{
                        cursor: "pointer",
                        color: "#312C51",
                        textDecoration: "underline",
                        fontSize: 16,
                        textAlign: "center",
                        "&:hover": { color: "#1A1736" },
                      }}
                      onClick={() => {
                        const fileURL = URL.createObjectURL(value.file);
                        window.open(fileURL, "_blank");
                      }}
                    >
                      {value.file.name}
                    </FormHelperText>
                  )}

                  <Button
                    variant="contained"
                    component="label"
                    sx={{ mt: 2, backgroundColor: "#312C51", color: "#fff" }}
                    disabled={!value.selected} // Disable if no selection
                  >
                    Upload File
                    <input
                      type="file"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files[0];
                        onChange({ ...value, file });
                      }}
                      accept={field.accept}
                    />
                  </Button>
                </FormControl>
              );
            }}
          />
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
        height: "auto",
        display: "flex",
        margin: "0 auto",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F0C38E",
        borderRadius: 5,
        color: "#312C51",
        padding: 10,
      }}
    >
      <form
        onSubmit={handleSubmit((data) => onSubmit(data, "submit"))}
        style={{ width: "100%" }}
      >
        {/* Show form sections only if they exist */}
        {formSections.length > 0 ? (
          <>
            {/* Current step content */}
            {formSections.map((section, index) => {
              if (index !== currentStep) return null;
              return (
                <div
                  style={{ display: "flex", flexDirection: "column" }}
                  key={section.id}
                >
                  <h1 style={{ textAlign: "center", marginBottom: 50 }}>
                    {section.section}
                  </h1>
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
                  {section.section == "Applicant Details" && (
                    <Box
                      id="applicantImageHolder"
                      component="img"
                      src={applicantImagePreview} // Updated to use the preview URL
                      alt="Applicant Image"
                      sx={{
                        width: 150,
                        height: 150,
                        borderRadius: "8px", // Rounded corners
                        objectFit: "cover", // Maintain aspect ratio
                        boxShadow: 2, // Adds a slight shadow
                        margin: "0 auto",
                      }}
                    />
                  )}
                  <Row>
                    {section.fields.map((field) => (
                      <Col xs={12} lg={field.span} key={field.id}>
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                          {renderField(field, index)}
                        </Box>
                      </Col>
                    ))}
                  </Row>
                </div>
              );
            })}

            {/* Navigation buttons */}
            <Box
              sx={{ display: "flex", justifyContent: "center", marginTop: 5 }}
            >
              {currentStep > 0 && (
                <CustomButton
                  text="Previous"
                  bgColor="#312C51"
                  color="#F0C38E"
                  width={"40%"}
                  onClick={handlePrev}
                />
              )}
              {currentStep < formSections.length - 1 && (
                <CustomButton
                  text="Next"
                  bgColor="#312C51"
                  color="#F0C38E"
                  width={"40%"}
                  onClick={handleNext}
                />
              )}
              {currentStep === formSections.length - 1 && (
                <CustomButton
                  text="Submit"
                  bgColor="#312C51"
                  color="#F0C38E"
                  width={"40%"}
                  type="submit"
                />
              )}
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "center", marginTop: 5 }}
            >
              {currentStep != formSections.length - 1 && (
                <CustomButton
                  text="Save"
                  bgColor="#312C51"
                  color="#F0C38E"
                  isLoading={buttonLoading}
                  width={"40%"}
                  type="button"
                  onClick={handleSubmit((data) => onSubmit(data, "save"))}
                />
              )}
            </Box>
          </>
        ) : (
          /* Show message only after services are loaded and no form config */
          !loading && <div>No form configuration available.</div>
        )}
      </form>
    </Box>
  );
};

export default DynamicStepForm;

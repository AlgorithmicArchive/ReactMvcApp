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
} from "@mui/material";
import { Col, Row } from "react-bootstrap";
import { fetchFormDetails, GetServiceContent } from "../../assets/fetch";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosConfig";
import CustomButton from "../../components/CustomButton";

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

const DynamicStepForm = ({ mode = "new" }) => {
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
  const [initialData, setInitialData] = useState(null);
  const [isCopyAddressChecked, setIsCopyAddressChecked] = useState(false);
  const applicantImageFile = watch("ApplicantImage");
  const [applicantImagePreview, setApplicantImagePreview] = useState(
    "/assets/images/profile.jpg"
  );
  const navigate = useNavigate();
  const location = useLocation();

  // To avoid duplicate defaults
  const hasRunRef = useRef(false);

  // Update image preview when the applicant file changes
  useEffect(() => {
    if (applicantImageFile && applicantImageFile instanceof File) {
      const objectUrl = URL.createObjectURL(applicantImageFile);
      setApplicantImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [applicantImageFile]);

  // Load service content and, if mode === "incomplete", also fetch existing form details
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
        if (mode === "incomplete" && referenceNumber) {
          const details = await fetchFormDetails(referenceNumber);
          setInitialData(details);
          reset(details);
        }
      } catch (error) {
        console.error("Error fetching service content:", error);
      } finally {
        setLoading(false);
      }
    }
    loadForm();
  }, [location.state, mode, reset]);

  // Set default file for fields that require it (e.g., applicant image)
  const setDefaultFile = async (path) => {
    const response = await fetch(path);
    const blob = await response.blob();
    const file = new File([blob], "profile.jpg", { type: blob.type });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
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

  // Navigation between steps
  const [currentStep, setCurrentStep] = useState(0);
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

  // When a district field changes, fetch tehsils and update the tehsil field options
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
    const finalFormData = {};
    setButtonLoading(true);

    // Recursively process each field and any additional nested fields
    const processField = (field, data) => {
      const fieldValue = data[field.name] || "";
      if (field.type === "enclosure") {
        finalFormData[field.name + "Enclosure"] = fieldValue.selected || "";
        finalFormData[field.name + "File"] = fieldValue.file || "";
      } else {
        finalFormData[field.name] = fieldValue;
      }
      if (field.additionalFields) {
        const selectedValue = data[field.name];
        const additionalFields = field.additionalFields[selectedValue];
        if (additionalFields) {
          additionalFields.forEach((additionalField) => {
            const nestedFieldName =
              additionalField.name || `${field.name}_${additionalField.id}`;
            processField({ ...additionalField, name: nestedFieldName }, data);
          });
        }
      }
    };

    formSections.forEach((section) => {
      section.fields.forEach((field) => {
        processField(field, data);
      });
    });

    const formdata = new FormData();
    formdata.append("serviceId", selectedServiceId);
    formdata.append("formDetails", JSON.stringify(finalFormData));
    for (const key in finalFormData) {
      if (
        finalFormData.hasOwnProperty(key) &&
        finalFormData[key] instanceof File
      ) {
        formdata.append(key, finalFormData[key]);
      }
    }
    formdata.append(
      "status",
      operationType === "submit" ? "Initiated" : "Incomplete"
    );
    formdata.append("referenceNumber", referenceNumber);

    const response = await axiosInstance.post(
      "/User/InsertFormDetails",
      formdata
    );
    const result = response.data;
    setButtonLoading(false);
    if (result.status) {
      if (result.type === "Submit") {
        navigate("/user/acknowledge", {
          state: { applicationId: result.referenceNumber },
        });
      } else {
        setReferenceNumber(result.referenceNumber);
      }
    }
  };

  // Render each field based on its type
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
                    ? field.maxLength
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
              // Handle dependent options (e.g., district fields)
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
                  {field.additionalFields &&
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
                    })}
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
              if (
                isDependent &&
                (!parentValue || !field.dependentValues.includes(parentValue))
              ) {
                return null;
              }
              let options = field.options;
              // Reset selection if parent changes
              useEffect(() => {
                if (
                  isDependent &&
                  !options.find((opt) => opt.value === value.selected)
                ) {
                  onChange({ selected: "", file: null });
                }
              }, [parentValue]); // eslint-disable-line react-hooks/exhaustive-deps

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
                    disabled={!value.selected}
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
        margin: "0 auto",
        backgroundColor: "#F0C38E",
        borderRadius: 5,
        color: "#312C51",
        padding: 10,
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
                  type="button"
                  onClick={handleSubmit((data) => onSubmit(data, "submit"))}
                />
              )}
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "center", marginTop: 5 }}
            >
              {currentStep !== formSections.length - 1 && (
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
          !loading && <div>No form configuration available.</div>
        )}
      </form>
    </Box>
  );
};

export default DynamicStepForm;

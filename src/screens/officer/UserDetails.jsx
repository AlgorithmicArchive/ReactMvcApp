import { Box } from "@mui/system";
import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchUserDetail } from "../../assets/fetch";
import { Col, Row } from "react-bootstrap";
import {
  Button,
  Checkbox,
  Collapse,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { formatKey, runValidations } from "../../assets/formvalidations";
import { Controller, useForm } from "react-hook-form";
import CustomButton from "../../components/CustomButton";
import axiosInstance from "../../axiosConfig";

// Modified CollapsibleFormDetails now receives its open state from props.
const CollapsibleFormDetails = ({
  formDetails,
  formatKey,
  detailsOpen,
  setDetailsOpen,
}) => {
  return (
    <>
      <Button
        onClick={() => setDetailsOpen((prev) => !prev)}
        sx={{
          backgroundColor: "#CCA682",
          color: "#312C51",
          fontWeight: "bold",
        }}
      >
        {detailsOpen ? "Collapse" : "Expand"} Details
      </Button>
      <Collapse in={detailsOpen}>
        <Box
          sx={{
            width: "60%",
            maxHeight: "10%",
            overflowY: "auto",
            border: "2px solid #CCA682",
            borderRadius: 5,
            padding: 5,
            backgroundColor: "#312C51",
            margin: { lg: "0 auto" },
          }}
        >
          {formDetails.map((section, index) => (
            <Row key={index} style={{ marginBottom: 40 }}>
              {Object.entries(section).map(([key, value]) => (
                <Col
                  xs={12}
                  lg={Object.keys(section).length === 1 ? 12 : 6}
                  key={key}
                  style={{ marginBottom: 10 }}
                >
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontSize: 14,
                        fontWeight: "bold",
                        width: "250px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {formatKey(key)}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        border: "2px solid #CCA682",
                        borderRadius: 3,
                        padding: 2,
                      }}
                    >
                      {value}
                    </Typography>
                  </Box>
                </Col>
              ))}
              <Divider
                orientation="horizontal"
                sx={{ borderColor: "#CCA682", my: 5 }}
              />
            </Row>
          ))}
        </Box>
      </Collapse>
    </>
  );
};

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

export default function UserDetails() {
  const location = useLocation();
  const { applicationId } = location.state || {};
  const [formDetails, setFormDetails] = useState([]);
  const [actionForm, setActionForm] = useState([]);
  // Lift the open/closed state for user details
  const [detailsOpen, setDetailsOpen] = useState(true);
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  useEffect(() => {
    // fetchUserDetail is assumed to set both formDetails and actionForm
    fetchUserDetail(applicationId, setFormDetails, setActionForm);
  }, [applicationId]);

  // Create an array of user details options by flattening formDetails
  const userDetailsOptions = useMemo(() => {
    const options = [];
    formDetails.forEach((section) => {
      Object.keys(section).forEach((key) => {
        options.push({ value: key, label: formatKey(key) });
      });
    });
    // Remove duplicates if any
    return options.filter(
      (option, index, self) =>
        index === self.findIndex((o) => o.value === option.value)
    );
  }, [formDetails]);

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
                    onChange={(e) => onChange(e.target.files[0])}
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
              if (field.optionsType === "dependent" && field.dependentOn) {
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
                      // Additional logic (if needed) can be added here.
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
                      const newVal = { ...value, selected: e.target.value };
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
                    {field.options.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {errors[field.name]?.message || ""}
                  </FormHelperText>
                  <Button
                    variant="contained"
                    component="label"
                    sx={{ mt: 2, backgroundColor: "#312C51", color: "#fff" }}
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

  // onSubmit handles the action form submission.
  const onSubmit = async (data) => {
    console.log("Submitted Data:", data);

    // Create a new FormData instance
    const formData = new FormData();

    // Iterate over each key in the data object
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === "object" && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });

    formData.append("applicationId", applicationId);
    console.log(formData);

    const response = await axiosInstance.post(
      "/Officer/HandleAction",
      formData
    );
    const result = response.data;
    if (result.status) navigate("/officer/home");
    else alert(result.response);
  };

  return (
    <Box
      sx={{
        height: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
      }}
    >
      <Typography variant="h3">USER DETAILS</Typography>
      <CollapsibleFormDetails
        formDetails={formDetails}
        formatKey={formatKey}
        detailsOpen={detailsOpen}
        setDetailsOpen={setDetailsOpen}
      />
      <Typography variant="h3" sx={{ marginTop: detailsOpen ? 40 : 5 }}>
        Action Form
      </Typography>
      <Box
        sx={{
          width: "50vw",
          height: "auto",
          margin: "0 auto",
          backgroundColor: "#F0C38E",
          borderRadius: 5,
          color: "#312C51",
          padding: 10,
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
          {actionForm.length > 0 &&
            actionForm.map((field, index) => {
              // For select fields, watch the current value.
              const selectedValue =
                field.type === "select" ? watch(field.name) : null;
              return (
                <Box key={index}>
                  {renderField(field, index)}
                  {/* If field is a select and its value is ReturnToCitizen, render a scrollable list of checkboxes */}
                  {field.type === "select" &&
                    selectedValue === "ReturnToCitizen" && (
                      <Controller
                        name={`returnFields_${index}`}
                        control={control}
                        defaultValue={[]}
                        rules={{
                          validate: (value) =>
                            value.length > 0 ||
                            "Select at least one user detail field.",
                        }}
                        render={({ field: { onChange, value } }) => (
                          <Box
                            sx={{
                              border: "1px solid #312C51",
                              borderRadius: 2,
                              maxHeight: 200,
                              overflowY: "auto",
                              padding: 1,
                              marginTop: 2,
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            {userDetailsOptions.map((option) => (
                              <FormControlLabel
                                key={option.value}
                                control={
                                  <Checkbox
                                    checked={value.includes(option.value)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        onChange([...value, option.value]);
                                      } else {
                                        onChange(
                                          value.filter(
                                            (v) => v !== option.value
                                          )
                                        );
                                      }
                                    }}
                                    sx={{
                                      color: "#312C51",
                                      "&.Mui-checked": { color: "#312C51" },
                                    }}
                                  />
                                }
                                label={option.label}
                              />
                            ))}
                          </Box>
                        )}
                      />
                    )}
                </Box>
              );
            })}

          <CustomButton
            text="Take Action"
            bgColor="#312C51"
            color="#F0C38E"
            width={"100%"}
            onClick={handleSubmit(onSubmit)}
          />
        </form>
      </Box>
    </Box>
  );
}

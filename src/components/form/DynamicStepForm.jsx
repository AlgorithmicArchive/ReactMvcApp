import React, { useState } from "react";
import { useForm } from "react-hook-form";
import CustomInputField from "./CustomInputField";
import CustomSelectField from "./CustomSelectField";
import CustomFileSelector from "./CustomFileSelector";
import CustomCheckbox from "./CustomCheckBox";
import CustomRadioButton from "./CustomRadioButton";
import axios from "axios";
import validationFunctionsList from "../../assets/formvalidations";
import { Typography } from "@mui/material";
import CustomButton from "../CustomButton";

const DynamicStepForm = ({ formConfig, serviceId }) => {
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();
  const [step, setStep] = useState(0);
  const [applicationId, setApplicationId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API endpoints for each step (adjust these endpoints as needed)
  const apiEndpoints = [
    "/InsertGeneralDetails",
    "/InsertAddressDetails",
    "/InsertBankDetails",
    "/InsertDocuments",
  ];

  // Asynchronous validation runner
  const runValidations = async (field, value) => {
    if (!Array.isArray(field.validationFunctions)) return true;

    for (const validationFn of field.validationFunctions) {
      const validate = validationFunctionsList[validationFn];
      if (validate) {
        const error = await validate(field, value || '');

        // Conditionally update value for specific validations
        if (validationFn === 'CapitalizeAlphabets' && !error) {
          setValue(field.name, value.toUpperCase(), { shouldValidate: true });
        } else if (error) {
          return error; // Return the first error encountered
        }
      }
    }
    return true; // No errors found
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();

      // Add form fields to FormData
      Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
      });

      // Include ApplicationId and serviceId in subsequent requests
      if (applicationId) formData.append("ApplicationId", applicationId);
      if (serviceId) formData.append("ServiceId", serviceId);

      // Determine current endpoint based on step
      const endpoint = apiEndpoints[step];

      // Make an API call to submit data
      const response = await axios.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { status, ApplicationId } = response.data;

      if (status) {
        // Store the ApplicationId for subsequent steps
        if (!applicationId) setApplicationId(ApplicationId);

        // Move to the next step if submission is successful
        if (step < formConfig.length - 1) {
          setStep((prev) => prev + 1);
        } else {
          alert("Form submitted successfully!");
        }
      } else {
        alert("Submission failed. Please check your input.");
      }
    } catch (error) {
      console.error("Error during form submission:", error);
      alert("An error occurred while submitting the form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form errors
  const handleErrors = (errors) => {
    console.log("Validation Errors:", errors);
  };

  // Dynamic field rendering
  const renderField = (field) => {
    const {
      type,
      label,
      name,
      options = [],
      placeholder,
      accept,
    } = field;

    // Render fields based on type
    switch (type) {
      case "text":
      case "email":
      case "date":
      case "number":
      case "password":
        return (
          <CustomInputField
            key={name}
            label={label}
            name={name}
            type={type}
            control={control}
            placeholder={placeholder}
            rules={{
              required:'This field is required',
              validate: (value) => runValidations(field, value),
            }}
            errors={errors}
          />
        );

      case "select":
        return (
          <CustomSelectField
            key={name}
            label={label}
            name={name}
            control={control}
            options={options.map((option) => ({
              label: option,
              value: option,
            }))}
            placeholder={placeholder}
            rules={{
              validate: (value) => runValidations(field, value),
            }}
            errors={errors}
          />
        );

      case "file":
        return (
          <CustomFileSelector
            key={name}
            label={label}
            name={name}
            control={control}
            accept={accept}
            rules={{
              validate: (value) => runValidations(field, value),
            }}
            errors={errors}
          />
        );

      case "checkbox":
        return (
          <CustomCheckbox
            key={name}
            label={label}
            name={name}
            control={control}
            rules={{
              validate: (value) => runValidations(field, value),
            }}
            errors={errors}
          />
        );

      case "radio":
        return (
          <CustomRadioButton
            key={name}
            label={label}
            name={name}
            control={control}
            options={options}
            rules={{
              validate: (value) => runValidations(field, value),
            }}
            errors={errors}
          />
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h4" sx={{ color: "background.paper", mb: 5 }}>
        {formConfig[step].section}
      </Typography>

      {/* Render fields for the current step */}
      {formConfig[step].fields.map((field) => renderField(field))}

      <div
        className="step-buttons"
        style={{ display: "flex", justifyContent: "center" }}
      >
        {step > 0 && (
          <CustomButton
            text="Previous"
            onClick={() => setStep((prev) => prev - 1)}
            type="button"
          />
        )}
        <CustomButton
          text={step < formConfig.length - 1 ? "Next" : "Submit"}
          onClick={() => {}}
          type="submit"
          disabled={isSubmitting}
          bgColor="background.paper"
          color="primary.main"
        />
      </div>
    </form>
  );
};

export default DynamicStepForm;

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import CustomInputField from "./CustomInputField";
import CustomSelectField from "./CustomSelectField";
import CustomFileSelector from "./CustomFileSelector";
import CustomCheckbox from "./CustomCheckBox";
import CustomRadioButton from "./CustomRadioButton";
import CustomDateInput from "./CustomDateInput";
import axios from "axios";
import {
  validationFunctionsList,
  CapitalizeAlphabets,
} from "../../assets/formvalidations";
import { Typography } from "@mui/material";
import CustomButton from "../CustomButton";
import axiosInstance from "../../axiosConfig";
import { fetchBlocks, fetchDistricts, fetchTehsils } from "../../assets/fetch";

const DynamicStepForm = ({ formConfig, serviceId }) => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const [step, setStep] = useState(0);
  const [applicationId, setApplicationId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [tehsilOptions, setTehsilOptions] = useState([]);
  const [blockOptions, setBlockOptions] = useState([]);

  const [selectedDistrict, setSelectedDistrict] = useState(0);

  const apiEndpoints = [
    "/User/InsertGeneralDetails",
    "/User/InsertAddressDetails",
    "/User/InsertBankDetails",
    "/User/InsertDocuments",
  ];

  // Fetch districts from the API
  useEffect(() => {
    fetchDistricts(setDistrictOptions);
  }, []);

  // Fetch Tehsils and Blocks when the district changes
  useEffect(() => {
    if (selectedDistrict) {
      fetchTehsils(selectedDistrict,setTehsilOptions);
      fetchBlocks(selectedDistrict,setBlockOptions);
    }
  }, [selectedDistrict]);

 

  const runValidations = async (field, value) => {
    if (!Array.isArray(field.validationFunctions)) return true;

    for (const validationFn of field.validationFunctions) {
      const fun = validationFunctionsList[validationFn];
      if (typeof fun !== "function") continue;

      try {
        const error = await fun(field, value || "");
        if (error !== true) return error;
      } catch (err) {
        return "Validation failed due to an unexpected error.";
      }
    }

    return true;
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      const serviceSpecific = {}; // Object to store form-specific fields

      Object.keys(data).forEach((key) => {
        // Find the field configuration
        const fieldConfig = formConfig[step].fields.find(
          (field) => field.name === key
        );

        // Check if the field is form-specific
        if (fieldConfig && fieldConfig.isFormSpecific) {
          // Add to ServiceSpecific object
          serviceSpecific[key] = data[key];
        } else {
          // Add to FormData as usual
          formData.append(key, data[key]);
        }
      });

      // Add the serialized ServiceSpecific object to FormData
      if (Object.keys(serviceSpecific).length > 0) {
        formData.append("ServiceSpecific", JSON.stringify(serviceSpecific));
      }

      if (applicationId) formData.append("ApplicationId", applicationId);
      if (serviceId) formData.append("ServiceId", serviceId);

      const endpoint = apiEndpoints[step];

      const response = await axiosInstance.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { status, ApplicationId } = response.data;
      if (status) {
        if (!applicationId) setApplicationId(ApplicationId);
        if (step < formConfig.length - 1) {
          setStep((prev) => prev + 1);
        } else {
          alert("Form submitted successfully!");
        }
      } else {
        alert("Submission failed. Please check your input.");
      }
    } catch (error) {
      alert("An error occurred while submitting the form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field) => {
    const {
      type,
      label,
      name,
      options = [],
      placeholder,
      accept,
      maxLength,
    } = field;

    const handleTransformation = (e) => {
      if (field.transformationFunctions?.includes("CapitalizeAlphabets")) {
        const transformedValue = CapitalizeAlphabets(field, e.target.value);
        setValue(field.name, transformedValue, { shouldValidate: true });
      }
    };

    // Render fields based on type
    switch (type) {
      case "text":
      case "email":
        return (
          <CustomInputField
            key={name}
            label={label}
            name={name}
            type={type}
            control={control}
            placeholder={placeholder}
            maxLength={maxLength}
            rules={{
              validate: async (value) => {
                const error = await runValidations(field, value);
                return error === true || error === "" ? true : error;
              },
            }}
            onChange={handleTransformation}
            errors={errors}
          />
        );
      case "date":
        return (
          <CustomDateInput
            key={name}
            label={label}
            name={name}
            control={control}
            rules={{
              validate: async (value) => {
                const error = await runValidations(field, value);
                return error === true || error === "" ? true : error;
              },
            }}
            errors={errors}
          />
        );
      case "select":
        // Check if the field is related to 'district', 'tehsil', or 'block' and use the fetched options
        let selectOptions = options.map((option) => ({
          label: option,
          value: option,
        }));

        if (name.toLowerCase().includes("district")) {
          selectOptions = districtOptions;
        } else if (name.toLowerCase().includes("tehsil")) {
          selectOptions = tehsilOptions;
        } else if (name.toLowerCase().includes("block")) {
          selectOptions = blockOptions;
        }

        selectOptions = [{ label: "Select Option", value: "" }, ...selectOptions];
        return (
          <CustomSelectField
            key={name}
            label={label}
            name={name}
            control={control}
            options={selectOptions}
            placeholder={placeholder}
            rules={{
              validate: (value) => runValidations(field, value),
            }}
            onChange={(value) => {
              setSelectedDistrict(value); // Custom handler to update selected district
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

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        {formConfig[step].fields.map((field) => (
          <div
            key={field.name}
            style={{
              flex: "1 1 calc(50% - 16px)", // Two columns
              minWidth: "200px", // Minimum width for proper alignment
            }}
          >
            {renderField(field)}
          </div>
        ))}
      </div>

      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
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

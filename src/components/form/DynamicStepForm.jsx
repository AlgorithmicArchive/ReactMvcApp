// DynamicStepForm.jsx
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import CustomInputField from "./CustomInputField";
import CustomSelectField from "./CustomSelectField";
import CustomFileSelector from "./CustomFileSelector";
import CustomCheckbox from "./CustomCheckBox";
import CustomRadioButton from "./CustomRadioButton";
import CustomDateInput from "./CustomDateInput";
import {
  validationFunctionsList,
  CapitalizeAlphabets,
} from "../../assets/formvalidations";
import { Typography,Box } from "@mui/material";
import CustomButton from "../CustomButton";
import axiosInstance from "../../axiosConfig";
import { fetchBlocks, fetchDistricts, fetchTehsils } from "../../assets/fetch";
import Row from "../grid/Row";
import Col from "../grid/Col";
import Container from "../grid/Container";

const DynamicStepForm = ({ formConfig, serviceId }) => {
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const [step, setStep] = useState(0);
  const [ApplicationId, setApplicationId] = useState(null);
  const [PreAddressId,setPreAddressId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [tehsilOptions, setTehsilOptions] = useState([]);
  const [blockOptions, setBlockOptions] = useState([]);
  const [appliedDistrict, setAppliedDistrict] = useState(0);
  const [selectedDistrict, setSelectedDistrict] = useState(0);

  const sameAsPresent = watch('SameAsPresent');

  const apiEndpoints = [
    "/User/InsertGeneralDetails",
    "/User/InsertPresentAddressDetails",
    "/User/InsertPermanentAddressDetails",
    "/User/InsertBankDetails",
    "/User/InsertDocuments",
  ];

  // Initialize the ref
  const formTopRef = useRef(null);

  // Fetch districts from the API
  useEffect(() => {
    fetchDistricts(setDistrictOptions);
  }, []);

  // Fetch Tehsils and Blocks when the district changes
  useEffect(() => {
    if (selectedDistrict) {
      fetchTehsils(selectedDistrict, setTehsilOptions);
      fetchBlocks(selectedDistrict, setBlockOptions);
    }
  }, [selectedDistrict]);

  // Scroll to top whenever 'step' changes
  useEffect(() => {
    if (formTopRef.current) {
      formTopRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [step]);

  // Handle 'SameAsPresent' checkbox functionality
  useEffect(() => {
    if (sameAsPresent) {
      // When checkbox is checked, copy present address to permanent address
      const presentAddress = {
        PermanentAddress: getValues('PresentAddress') || '',
        PermanentDistrict: getValues('PresentDistrict') || '',
        PermanentTehsil: getValues('PresentTehsil') || '',
        PermanentBlock: getValues('PresentBlock') || '',
        PermanentPanchayatMuncipality: getValues('PresentPanchayatMuncipality') || '',
        PermanentVillage: getValues('PresentVillage') || '',
        PermanentWard: getValues('PresentWard') || '',
        PermanentPincode: getValues('PresentPincode') || '',
      };

      Object.entries(presentAddress).forEach(([field, value]) => {
        setValue(field, value, { shouldValidate: true, shouldDirty: true });
      });
    } else {
      // When checkbox is unchecked, clear permanent address fields
      const permanentFields = [
        'PermanentAddress',
        'PermanentDistrict',
        'PermanentTehsil',
        'PermanentBlock',
        'PermanentPanchayatMuncipality',
        'PermanentVillage',
        'PermanentWard',
        'PermanentPincode',
      ];

      permanentFields.forEach(field => {
        setValue(field, '', { shouldValidate: true, shouldDirty: true });
      });
    }
  }, [sameAsPresent, setValue, getValues]);

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
        const fieldConfig = formConfig[step].fields.find(
          (field) => field.name === key
        );
        if (fieldConfig && fieldConfig.isFormSpecific) {
          serviceSpecific[key] = data[key];
        } else {
          formData.append(key, data[key]);
        }
      });

      // Add the serialized ServiceSpecific object to FormData
      if (Object.keys(serviceSpecific).length > 0) {
        formData.append("ServiceSpecific", JSON.stringify(serviceSpecific));
      }

      if (step == 4) {
        const labels = [...new Set(formConfig[step].fields.map(item => item.label.split(" ").join("")))];
        formData.append('labels', JSON.stringify(labels));
        formData.append('AccessCode', appliedDistrict);
      }

      if (ApplicationId) formData.append("ApplicationId", ApplicationId);
      if(PreAddressId) formData.append('PresentAddressId',PreAddressId);
      if (serviceId) formData.append("ServiceId", serviceId);

      const endpoint = apiEndpoints[step];

      console.log("End Point",endpoint,"Form Data",formData);
      const response = await axiosInstance.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { status, applicationId,presentAddressId } = response.data;
      // const status = true;
      if (status) {
        if (!ApplicationId) setApplicationId(applicationId);
        if(!PreAddressId)setPreAddressId(presentAddressId);
        if (step < formConfig.length - 1) {
          setStep((prev) => prev + 1);
        } else {  
          alert("Form submitted successfully!");
        }
      } else {
        alert("Submission failed. Please check your input.");
      }
    } catch (error) {
      console.log(error);
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
              if (name === "District") setAppliedDistrict(value);
              if (name.toLowerCase().includes('district'))
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
      <Box ref={formTopRef}>
        <Typography variant="h4" sx={{ color: "background.paper", mb: 5, textAlign: 'center' }}>
          {formConfig[step].section}
        </Typography>
        <Container maxWidth="xl">
          <Row sx={{ flex: 1 }}>
            {formConfig[step].fields.map((field) => (
              <Col md={step == 3 || step == 4 || field.type == "checkbox" ? 12 : 6} xs={12} key={field.name}>
                {renderField(field)}
              </Col>
            ))}
          </Row>
        </Container>
      </Box>
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "20px", gap: 5 }}
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

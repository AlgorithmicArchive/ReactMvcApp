import React, { useState, useEffect, useRef } from "react";
import { useController, useForm } from "react-hook-form";
import CustomInputField from "./CustomInputField";
import CustomSelectField from "./CustomSelectField";
import CustomFileSelector from "./CustomFileSelector";
import CustomCheckbox from "./CustomCheckBox";
import CustomRadioButton from "./CustomRadioButton";
import CustomDateInput from "./CustomDateInput";
import {
  runValidations,
  CapitalizeAlphabets,
} from "../../assets/formvalidations";
import { Typography, Box } from "@mui/material";
import CustomButton from "../CustomButton";
import axiosInstance from "../../axiosConfig";
import { fetchBlocks, fetchDistricts, fetchTehsils } from "../../assets/fetch";
import Row from "../grid/Row";
import Col from "../grid/Col";
import Container from "../grid/Container";
import { useNavigate } from "react-router-dom";
import { dummyDataList, insertDummyData } from "../../assets/dummyData";

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
  const [PreAddressId, setPreAddressId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [tehsilOptions, setTehsilOptions] = useState([]);
  const [blockOptions, setBlockOptions] = useState([]);
  const [appliedDistrict, setAppliedDistrict] = useState(0);
  const [selectedDistrict, setSelectedDistrict] = useState(0);

  const navigate = useNavigate();
  const sameAsPresent = watch("SameAsPresent");
  const formTopRef = useRef(null);
  const fileInputRefs = useRef({}); // To store refs for file selectors

  const apiEndpoints = [
    "/User/InsertGeneralDetails",
    "/User/InsertPresentAddressDetails",
    "/User/InsertPermanentAddressDetails",
    "/User/InsertBankDetails",
    "/User/InsertDocuments",
  ];


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
      const presentAddress = {
        PermanentAddress: getValues("PresentAddress") || "",
        PermanentDistrict: getValues("PresentDistrict") || "",
        PermanentTehsil: getValues("PresentTehsil") || "",
        PermanentBlock: getValues("PresentBlock") || "",
        PermanentPanchayatMuncipality:
          getValues("PresentPanchayatMuncipality") || "",
        PermanentVillage: getValues("PresentVillage") || "",
        PermanentWard: getValues("PresentWard") || "",
        PermanentPincode: getValues("PresentPincode") || "",
      };

      Object.entries(presentAddress).forEach(([field, value]) => {
        setValue(field, value, { shouldValidate: true, shouldDirty: true });
      });
    } else {
      const permanentFields = [
        "PermanentAddress",
        "PermanentDistrict",
        "PermanentTehsil",
        "PermanentBlock",
        "PermanentPanchayatMuncipality",
        "PermanentVillage",
        "PermanentWard",
        "PermanentPincode",
      ];

      permanentFields.forEach((field) => {
        setValue(field, "", { shouldValidate: true, shouldDirty: true });
      });
    }
  }, [sameAsPresent, setValue, getValues]);



  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      const serviceSpecific = {};

      const currentStepFields = formConfig[step].fields.map(
        (field) => field.name
      );

      Object.keys(data).forEach((key) => {
        if (currentStepFields.includes(key)) {
          const fieldConfig = formConfig[step].fields.find(
            (field) => field.name === key
          );

          if (fieldConfig && fieldConfig.isFormSpecific) {
            serviceSpecific[key] = data[key];
          } else {
            formData.append(key, data[key]);
          }
        }
      });

      if (Object.keys(serviceSpecific).length > 0) {
        formData.append("ServiceSpecific", JSON.stringify(serviceSpecific));
      }

      if (step === 4) {
        const labels = [
          ...new Set(
            formConfig[step].fields.map((item) =>
              item.label.split(" ").join("")
            )
          ),
        ];
        formData.append("labels", JSON.stringify(labels));
        formData.append("AccessCode", appliedDistrict);
      }

      if (ApplicationId) formData.append("ApplicationId", ApplicationId);
      if (PreAddressId) formData.append("PresentAddressId", PreAddressId);
      if (serviceId) formData.append("ServiceId", serviceId);

      const endpoint = apiEndpoints[step];

      const response = await axiosInstance.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { status, applicationId, presentAddressId } = response.data;
      if (status) {
        if (!ApplicationId) setApplicationId(applicationId);
        if (!PreAddressId) setPreAddressId(presentAddressId);
        if (step < formConfig.length - 1) {
          setStep((prev) => prev + 1);
        } else {
          alert("Form submitted successfully!");
          navigate("/user/acknowledgement");
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

        selectOptions = [
          { label: "Select Option", value: "" },
          ...selectOptions,
        ];
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
              console.log("HERE");
              if (name === "District") setAppliedDistrict(value);
              if (name.toLowerCase().includes("district"))
                setSelectedDistrict(value);
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
            ref={(el) => (fileInputRefs.current[name] = el)}
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
      <Box>
        <Typography
          variant="h4"
          sx={{ color: "background.paper", mb: 5, textAlign: "center" }}
        >
          {formConfig[step].section}
        </Typography>
        <Box
          sx={{
            width:'max-content',
            margin:'0 auto'
          }}
        >
          <CustomButton
            text="Insert Dummy Data"
            onClick={() =>
              insertDummyData(
                setValue,
                setSelectedDistrict,
                formConfig,
                step,
                fileInputRefs
              )
            }
            type="button"
            bgColor="secondary.main"
            color="background.paper"
          />
        </Box>

        <Container maxWidth="xl">
          <Row sx={{ flex: 1 }}>
            {formConfig[step].fields.map((field) => (
              <Col
                md={step === 3 || field.type === "checkbox" ? 12 : 6}
                xs={12}
                key={field.name}
              >
                {renderField(field)}
              </Col>
            ))}
          </Row>
        </Container>
      </Box>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "20px",
          gap: 5,
        }}
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

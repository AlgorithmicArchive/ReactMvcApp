import { Box, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import axiosInstance from "../../axiosConfig";
import { useForm } from "react-hook-form";
import CustomInputField from "../../components/form/CustomInputField";
import CustomDateInput from "../../components/form/CustomDateInput";
import CustomSelectField from "../../components/form/CustomSelectField";
import CustomFileSelector from "../../components/form/CustomFileSelector";
import CustomCheckbox from "../../components/form/CustomCheckBox";
import CustomRadioButton from "../../components/form/CustomRadioButton";
import CustomButton from "../../components/CustomButton";
import { runValidations } from "../../assets/formvalidations";

export default function EditForm() {
  const [fields, setFields] = useState([]);
  const location = useLocation();
  const { applicationId: urlApplicationId } = useParams(); // Extract from URL if available
  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm();

  const fileInputRefs = useRef({});

  useEffect(() => {
    const applicationId = location.state?.applicationId || urlApplicationId;

    if (applicationId) {
      GetEditForm(applicationId); // Fetch data based on applicationId
    } else {
      console.error("No applicationId found.");
    }
  }, [location, urlApplicationId]);

  async function GetEditForm(applicationId) {
    try {
      const response = await axiosInstance.get("/User/GetEditForm", {
        params: { applicationId },
      });
      const editFields = response.data.editFields;
      setFields(editFields);

      // Loop through fields and handle files
      for (const field of editFields) {
        if (field.type === "file") {
          await handleFileField(field.name, field.value); // Fetch file from the server if the field is a file type
        }
      }
    } catch (error) {
      console.error("Error fetching form fields", error);
    }
  }

  const handleFileField = async (fieldName, filePath) => {
    const fileSelectorRef = fileInputRefs.current[fieldName];
    if (fileSelectorRef) {
      try {
        const fileResponse = await axiosInstance.get(`/User/GetFile`, {
          params: { filePath },
          responseType: "blob", // Expecting a blob (file) from the server
        });

        if (fileResponse.status === 200) {
          const fileBlob = fileResponse.data;
          const fileName = filePath.split("/").pop(); // Extract file name from the path
          const file = new File([fileBlob], fileName, { type: fileBlob.type });

          // Set the file as the default value for the form
          setValue(fieldName, file, {
            shouldValidate: true,
            shouldDirty: true,
          });

          // Set preview or selected file for the CustomFileSelector
          if (fieldName === "ApplicantImage") {
            fileSelectorRef.setPreview(URL.createObjectURL(file)); // For images, set preview
          } else {
            fileSelectorRef.setSelectedFile(file); // For other files, set the selected file
          }
        }
      } catch (error) {
        console.error(`Error fetching the file for field: ${fieldName}`, error);
      }
    }
  };

  const onSubmit = (data) => {
    console.log(data);
  };

  const CapitalizeAlphabets = (field, value) => {
    return value.toUpperCase();
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Typography sx={{ fontSize: 36, fontWeight: "bold", marginBottom: 5 }}>
        EDIT FORM
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "primary.main",
          padding: 5,
          borderRadius: 5,
          width: "60%",
        }}
      >
        {fields.map((field) => {
          const {
            type,
            label,
            name,
            value,
            options = [],
            placeholder,
            accept,
            maxLength,
          } = field;

          const handleTransformation = (e) => {
            if (
              field.transformationFunctions?.includes("CapitalizeAlphabets")
            ) {
              const transformedValue = CapitalizeAlphabets(
                field,
                e.target.value
              );
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
                  value={value}
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
                  defaultDate={value}
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
                  value={value}
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
        })}

        <CustomButton
          text="Submit"
          bgColor="background.paper"
          color="primary.main"
          onClick={handleSubmit(onSubmit)}
        />
      </Box>
    </Box>
  );
}

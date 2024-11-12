import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useForm } from "react-hook-form";
import CustomSelectField from "./form/CustomSelectField";
import CustomButton from "./CustomButton";

const ServiceSelectionForm = ({ services, errors, onServiceSelect }) => {
  const { control, handleSubmit, setValue } = useForm();
  const [selectedValue, setSelectedValue] = useState("");

  const onSubmit = (data) => {
    console.log(data);
    onServiceSelect(data.Service); // Pass only the selected service ID to OfficerHome
  };

  useEffect(() => {
    if (services.length === 1) {
      const defaultService = services[0].value;
      setSelectedValue(defaultService);
      setValue("Service", defaultService); // Set default value in form

      // Trigger form submission after setting the value
      handleSubmit(onSubmit)();
    }
  }, [services, setValue, handleSubmit, onSubmit]);

  return (
    <Box
      sx={{
        backgroundColor: "primary.main",
        padding: 1,
        borderRadius: 5,
        margin: "0 auto",
        display: "flex",
        gap: 10,
        alignItems: "center",
        paddingRight: 2,
        paddingLeft: 2,
      }}
    >
      <CustomSelectField
        control={control}
        options={services}
        value={selectedValue}
        label="Select Service"
        name="Service"
        rules={{ required: "This field is required" }}
        errors={errors}
      />
      <CustomButton
        type="submit"
        onClick={handleSubmit(onSubmit)} // Use handleSubmit to handle form submission
        text="Get Details"
        bgColor="background.default"
        color="primary.main"
        width="50%"
      />
    </Box>
  );
};

export default ServiceSelectionForm;

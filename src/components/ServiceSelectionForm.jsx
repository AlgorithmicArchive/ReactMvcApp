import React from "react";
import { Box } from "@mui/material";
import { useForm } from "react-hook-form";
import CustomSelectField from "./form/CustomSelectField";
import CustomButton from "./CustomButton";

const ServiceSelectionForm = ({ services, errors, onServiceSelect }) => {
  const { control, handleSubmit } = useForm();

  const onSubmit = (data) => {
    onServiceSelect(data); // Pass the selected service ID to OfficerHome
  };

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
        label="Select Service"
        name="Service"
        rules={{ required: "This field is required" }}
        errors={errors}
      />
      <CustomButton
        type="submit"
        onClick={handleSubmit(onSubmit)} // Use onSubmit function to handle form submission
        text="Get Records"
        bgColor="background.default"
        color="primary.main"
        width="50%"
      />
    </Box>
  );
};

export default ServiceSelectionForm;

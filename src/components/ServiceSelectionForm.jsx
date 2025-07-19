import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useForm } from "react-hook-form";
import CustomSelectField from "./form/CustomSelectField";
import CustomButton from "./CustomButton";

const ServiceSelectionForm = ({ services, errors, onServiceSelect }) => {
  const { control, handleSubmit, setValue } = useForm();
  const [selectedValue, setSelectedValue] = useState("");

  const onSubmit = (data) => {
    onServiceSelect(data.Service);
  };

  useEffect(() => {
    if (services.length > 0) {
      // Always select the first service by default
      const defaultService = services[0].value;
      setSelectedValue(defaultService);
      setValue("Service", defaultService);

      // If there's only one service, auto-submit
      if (services.length === 1) {
        handleSubmit(onSubmit)();
      }
    }
  }, [services]);

  return (
    <Box
      sx={{
        margin: "0 auto",
        color: "primary.main",
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
        onChange={(e) => setSelectedValue(e.target.value)}
      />
      {services.length > 1 && (
        <CustomButton
          type="submit"
          onClick={handleSubmit(onSubmit)}
          text="Get Details"
          bgColor="primary.main"
          color="background.paper"
          width="50%"
        />
      )}
    </Box>
  );
};

export default ServiceSelectionForm;

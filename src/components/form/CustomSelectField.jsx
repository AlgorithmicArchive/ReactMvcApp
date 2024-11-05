import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { Controller } from "react-hook-form";

const CustomSelectField = forwardRef(
  (
    {
      label,
      name,
      value = "",
      control,
      options = [],
      placeholder = "Select an option...",
      rules = {},
      errors,
      onChange, // Add onChange prop
    },
    ref
  ) => {
    const selectFieldRef = useRef(null);

    useImperativeHandle(ref, () => ({
      setSelectValue: (value) => {
        if (selectFieldRef.current) {
          selectFieldRef.current.onChange(value); // Call internal onChange to trigger form update
        }
      },
    }));

    return (
      <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
        {label && (
          <Typography
            sx={{ fontWeight: "bold", mb: 1, color: "background.default" }}
          >
            {label}
          </Typography>
        )}

        <Controller
          name={name}
          control={control}
          rules={rules}
          defaultValue={value}
          render={({ field }) => {
            selectFieldRef.current = field;

            return (
              <select
                {...field}
                value={field.value || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value); // Update react-hook-form state
                  if (onChange) onChange(value); // Call parent onChange if provided
                }}
                style={{
                  padding: "10px",
                  fontSize: "16px",
                  border: errors[name] ? "2px solid red" : "2px solid #48426D",
                  borderRadius: "5px",
                  outline: "none",
                  width: "100%",
                  backgroundColor: "transparent",
                  color: "#48426D",
                }}
              >
                <option value="" disabled>
                  {placeholder}
                </option>
                {options.map((option, index) => (
                  <option
                    key={index}
                    value={option.value}
                    style={{ color: "#000" }}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            );
          }}
        />

        {errors?.[name] && (
          <Typography variant="body2" sx={{ color: "red", mt: 1 }}>
            {errors[name].message}
          </Typography>
        )}
      </Box>
    );
  }
);

export default CustomSelectField;

import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { Controller } from "react-hook-form";
import CustomButton from "../CustomButton";

export default function CustomFileSelector({
  label,
  name,
  control,
  accept = "",
  rules = {},
}) {
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  if (!control) {
    console.error(
      "CustomFileSelector requires a valid control prop from react-hook-form."
    );
    return null;
  }

  const handleFileChange = (event, onChange) => {
    const file = event.target.files[0];
    setSelectedFile(file || null); // Set to null if no file is selected
    onChange(file);

    // Show preview for image files
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
      {label && (
        <Typography
          sx={{ fontWeight: "bold", mb: 1, color: "background.default" }}
        >
          {label}
        </Typography>
      )}

      {/* File Input Field with Controller */}
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState: { error } }) => (
          <Box>
            {/* Hidden file input */}
            <input
              type="file"
              accept={accept}
              onChange={(e) => handleFileChange(e, field.onChange)}
              style={{ display: "none" }}
              id={name}
            />
            <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
              <label htmlFor={name}>
                <CustomButton
                  component="span"
                  text="Choose File"
                  bgColor="background.paper"
                  color="primary.main"
                  onClick={() => document.getElementById(name).click()}
                />
              </label>

              {/* Show image preview if the file is an image */}
              {preview && (
                <Box sx={{ }}>
                  <img
                    src={preview}
                    alt="Preview"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "5px",
                    }}
                  />
                </Box>
              )}
            </Box>

            {error && (
              <Typography variant="body2" sx={{ color: "red", mt: 1 }}>
                {error.message}
              </Typography>
            )}
          </Box>
        )}
      />
    </Box>
  );
}

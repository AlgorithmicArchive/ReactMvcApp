import React from "react";
import { FormControlLabel, Checkbox, Box, Typography } from "@mui/material";
import { useController } from "react-hook-form";

export default function SectionSelectCheckboxes({
  formDetails,
  control,
  name,
  formatKey,
}) {
  // Use react-hook-form's useController hook to manage the value
  const {
    field: { value = [], onChange },
  } = useController({ control, name });

  return (
    <Box>
      {Object.entries(formDetails).map(([sectionKey, fields]) => {
        // Array of field names for this section
        const sectionFieldNames = fields.map((f) => f.name);
        // Check if all fields in this section are selected
        const isSectionChecked = sectionFieldNames.every((fieldName) =>
          value.includes(fieldName)
        );

        return (
          <Box
            key={sectionKey}
            sx={{ mb: 2, border: "1px solid #ccc", p: 1, borderRadius: 1 }}
          >
            {/* Section-level checkbox */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={isSectionChecked}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // Add all field names from this section (avoid duplicates)
                      const newVal = [
                        ...new Set([...value, ...sectionFieldNames]),
                      ];
                      onChange(newVal);
                    } else {
                      // Remove all field names belonging to this section
                      const newVal = value.filter(
                        (v) => !sectionFieldNames.includes(v)
                      );
                      onChange(newVal);
                    }
                  }}
                  sx={{
                    color: "#312C51",
                    "&.Mui-checked": { color: "#312C51" },
                  }}
                />
              }
              label={
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  {formatKey(sectionKey)}
                </Typography>
              }
            />
            {/* Nested individual field checkboxes */}
            <Box sx={{ ml: 4 }}>
              {fields.map((field) => {
                const isChecked = value.includes(field.name);
                return (
                  <FormControlLabel
                    key={field.name}
                    control={
                      <Checkbox
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            onChange([...value, field.name]);
                          } else {
                            onChange(value.filter((v) => v !== field.name));
                          }
                        }}
                        sx={{
                          color: "#312C51",
                          "&.Mui-checked": { color: "#312C51" },
                        }}
                      />
                    }
                    label={field.label || field.name}
                  />
                );
              })}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

// src/components/SortableField.js
import React from "react";
import { Box, TextField, Typography, Select, MenuItem } from "@mui/material";
import { Col } from "react-bootstrap";
import { useSortable } from "@dnd-kit/sortable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faPlusCircle,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

const SortableField = ({
  field,
  sectionId,
  onEditField,
  onAdditonalModal,
  onFieldChange,
  onRemoveField,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.id });

  const renderFieldInput = () => {
    switch (field.type) {
      case "text":
      case "email":
      case "file":
      case "date":
        return (
          <TextField
            fullWidth
            type={field.type}
            size="small"
            placeholder={field.label}
            value={field.value || ""}
            onChange={(e) => onFieldChange(sectionId, field.id, e.target.value)}
            slotProps={{
              htmlInput:
                field.type === "file" && field.accept !== ""
                  ? { accept: field.accept }
                  : {},
            }}
            sx={{
              border: "2px solid #312C51",
              ".MuiOutlinedInput-input": { color: "#312C51" },
              "&::placeholder": { color: "#312C51" },
            }}
          />
        );
      case "select":
        return (
          <Select
            fullWidth
            size="small"
            value={
              field.value ||
              (field.options.length > 0 ? field.options[0].value : "")
            }
            onChange={(e) => onFieldChange(sectionId, field.id, e.target.value)}
            sx={{
              ".MuiSelect-select": { color: "#312C51" },
            }}
          >
            {field.options.map((option, index) => (
              <MenuItem key={index} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        );
      case "enclosure":
        return (
          <>
            <Select
              fullWidth
              size="small"
              value={
                field.value ||
                (field.options.length > 0 ? field.options[0].value : "")
              }
              onChange={(e) =>
                onFieldChange(sectionId, field.id, e.target.value)
              }
              sx={{
                border: "2px solid #312C51",
                ".MuiSelect-select": { color: "#312C51" },
              }}
            >
              {field.options.map((option, index) => (
                <MenuItem key={index} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            <TextField
              fullWidth
              type={"file"}
              size="small"
              placeholder={field.label}
              value={field.value || ""}
              onChange={(e) =>
                onFieldChange(sectionId, field.id, e.target.value)
              }
              sx={{
                marginTop: 2,
                border: "2px solid #312C51",
                ".MuiOutlinedInput-input": { color: "#312C51" },
                "&::placeholder": { color: "#312C51" },
              }}
            />
          </>
        );
      default:
        return (
          <TextField
            fullWidth
            size="small"
            placeholder={field.label}
            value={field.value || ""}
            onChange={(e) => onFieldChange(sectionId, field.id, e.target.value)}
            sx={{
              ".MuiOutlinedInput-input": { color: "#312C51" },
              "&::placeholder": { color: "#312C51" },
            }}
          />
        );
    }
  };

  return (
    <Col ref={setNodeRef} xs={12} lg={field.span}>
      <Box
        {...attributes}
        {...listeners}
        sx={{
          border: "1px solid #321C51",
          borderRadius: 1,
          padding: 1,
          marginBottom: 1,
          backgroundColor: "#fff",
          transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
          transition,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography
            variant="body2"
            sx={{ color: "#312C51", fontSize: 12, fontWeight: "bold" }}
          >
            {field.label}
          </Typography>
          {(field.editable ?? true) && (
            <Box>
              <FontAwesomeIcon
                icon={faPen}
                style={{ cursor: "pointer", marginRight: 8 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditField({ ...field, sectionId });
                }}
              />
              <FontAwesomeIcon
                icon={faTrash}
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveField(sectionId, field.id); // Call the handler
                }}
              />
              {field.type === "select" && (
                <FontAwesomeIcon
                  icon={faPlusCircle}
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdditonalModal({ ...field, sectionId });
                  }}
                />
              )}
            </Box>
          )}
        </Box>
        {renderFieldInput()}
      </Box>
    </Col>
  );
};

export default SortableField;

// src/components/SortableSection.js
import React from "react";
import { Box, Button, TextField } from "@mui/material";
import { Row } from "react-bootstrap";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import SortableField from "./SortableField";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faTrash } from "@fortawesome/free-solid-svg-icons";

const SortableSection = ({
  section,
  onAddField,
  onEditSectionName,
  onEditField,
  onAdditonalModal,
  onUpdateSectionFields,
  onFieldChange,
  onDuplicateSection, // new prop received
  onRemoveSection, // Add this prop
  onRemoveField,
  onAddSectionAfter,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: section.id,
    });
  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    cursor: "grab",
  };

  // Sensor for sorting fields inside the section
  const fieldSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleFieldDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = section.fields.findIndex((f) => f.id === active.id);
    const newIndex = section.fields.findIndex((f) => f.id === over.id);
    const newFields = arrayMove(section.fields, oldIndex, newIndex);
    onUpdateSectionFields(section.id, newFields);
  };

  return (
    <Box
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      sx={{
        border: "2px solid #312C51",
        borderRadius: 2,
        padding: 3,
        backgroundColor: "#F0C38E",
        ...style,
        marginBottom: 2,
      }}
    >
      {/* Section header with text field and duplicate icon */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 2,
        }}
      >
        <TextField
          value={section.section}
          onChange={(e) => {
            if (section.editable) {
              onEditSectionName(section.id, e.target.value);
            }
          }}
          fullWidth
          sx={{
            border: "2px solid #312C51",
            ".MuiOutlinedInput-input": { color: "#312C51" },
          }}
        />

        {section.editable && (
          <>
            <FontAwesomeIcon
              icon={faCopy}
              style={{
                cursor: "pointer",
                color: "#312C51",
                fontSize: 18,
                marginLeft: 5,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onDuplicateSection(section.id);
              }}
            />
            <FontAwesomeIcon
              icon={faTrash}
              style={{
                cursor: "pointer",
                color: "#312C51",
                fontSize: 18,
                marginLeft: 3,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onRemoveSection(section.id);
              }}
            />
          </>
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 5 }}>
        <Button
          variant="contained"
          size="small"
          onClick={() => onAddField(section.id)}
          sx={{
            marginBottom: 2,
            background: "#312C51",
            color: "#F0C38E",
          }}
        >
          Add Field
        </Button>

        <Button
          variant="contained"
          size="small"
          sx={{
            marginBottom: 2,
            background: "#312C51",
            color: "#F0C38E",
          }}
          onClick={() => onAddSectionAfter(section.id)}
        >
          Add Section After
        </Button>
      </Box>
      <DndContext
        sensors={fieldSensors}
        collisionDetection={closestCenter}
        onDragEnd={handleFieldDragEnd}
      >
        <SortableContext
          items={section.fields}
          strategy={verticalListSortingStrategy}
        >
          <Row>
            {section.fields.map((field) => (
              <SortableField
                key={field.id}
                field={field}
                sectionId={section.id}
                onEditField={onEditField}
                onAdditonalModal={onAdditonalModal}
                onFieldChange={onFieldChange}
                onRemoveField={onRemoveField}
              />
            ))}
          </Row>
        </SortableContext>
      </DndContext>
    </Box>
  );
};

export default SortableSection;

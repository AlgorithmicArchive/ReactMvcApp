// PlayerEditModal.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  InputLabel,
  Select,
  FormControl,
  MenuItem,
} from "@mui/material";
import FieldEditModal from "./FieldEditModal";
import SortableField from "./SortableField";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const PlayerEditModal = ({ player, onClose, onSave }) => {
  const [editedPlayer, setEditedPlayer] = useState(player);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [designations, setDesignations] = useState(null);

  // Updated sensor: activationConstraint ensures drag doesn't start immediately
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    async function getDesignations() {
      const response = await fetch("/Base/GetDesignations");
      const result = await response.json();
      setDesignations(result.designations);
    }
    getDesignations();
  }, []);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = editedPlayer.actionForm.findIndex(
      (field) => field.id === active.id
    );
    const newIndex = editedPlayer.actionForm.findIndex(
      (field) => field.id === over.id
    );

    const newActionForm = arrayMove(
      editedPlayer.actionForm,
      oldIndex,
      newIndex
    );
    setEditedPlayer((prev) => ({ ...prev, actionForm: newActionForm }));
  };

  const handleChange = (field, value) => {
    setEditedPlayer((prev) => ({ ...prev, [field]: value }));
  };

  const handleActionFormChange = (index, field, value) => {
    const updatedActionForm = [...editedPlayer.actionForm];
    updatedActionForm[index] = { ...updatedActionForm[index], [field]: value };
    setEditedPlayer((prev) => ({ ...prev, actionForm: updatedActionForm }));
  };

  const addActionFormField = () => {
    const newField = {
      id: `field-${Date.now()}`,
      type: "text",
      label: "New Field",
      name: "NewField",
      minLength: 5,
      maxLength: 50,
      options: [],
      span: 12,
      validationFunctions: [],
      transformationFunctions: [],
      additionalFields: {},
      accept: "",
    };

    setEditedPlayer((prev) => ({
      ...prev,
      actionForm: prev.actionForm ? [...prev.actionForm, newField] : [newField],
    }));
  };

  const handleEditField = (field) => {
    setSelectedField(field);
    setIsFieldModalOpen(true);
  };

  // Remove handler: receives sectionId and fieldId (sectionId is fixed as "actionForm")
  const handleRemoveField = (sectionId, fieldId) => {
    setEditedPlayer((prev) => ({
      ...prev,
      actionForm: prev.actionForm.filter((field) => field.id !== fieldId),
    }));
  };

  // Update the edited player's actionForm with the updated field
  const updateField = (updatedField) => {
    setEditedPlayer((prev) => ({
      ...prev,
      actionForm: prev.actionForm.map((field) =>
        field.id === updatedField.id ? updatedField : field
      ),
    }));
  };

  return (
    <Modal open onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h2>Edit Player</h2>

        {/* Designation as a Select */}
        <FormControl fullWidth margin="normal">
          <InputLabel id="designation-select-label">Designation</InputLabel>
          <Select
            labelId="designation-select-label"
            label="Designation"
            value={editedPlayer.designation || ""}
            onChange={(e) => handleChange("designation", e.target.value)}
          >
            {designations &&
              designations.map((des, index) => (
                <MenuItem key={index} value={des.designation}>
                  {des.designation}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        {/* Permissions */}
        <Typography variant="h6" sx={{ mt: 2 }}>
          Permissions
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={editedPlayer.canSanction}
              onChange={(e) => handleChange("canSanction", e.target.checked)}
            />
          }
          label="Can Sanction"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={editedPlayer.canReturnToPlayer}
              onChange={(e) =>
                handleChange("canReturnToPlayer", e.target.checked)
              }
            />
          }
          label="Can Return to Player"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={editedPlayer.canReturnToCitizen}
              onChange={(e) =>
                handleChange("canReturnToCitizen", e.target.checked)
              }
            />
          }
          label="Can Return to Citizen"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={editedPlayer.canForwardToPlayer}
              onChange={(e) =>
                handleChange("canForwardToPlayer", e.target.checked)
              }
            />
          }
          label="Can Forward to Player"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={editedPlayer.canReject}
              onChange={(e) => handleChange("canReject", e.target.checked)}
            />
          }
          label="Can Reject"
        />

        {/* Action Form */}
        <Typography variant="h6" sx={{ mt: 2 }}>
          Action Form
        </Typography>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={editedPlayer.actionForm.map((field) => field.id)}
            strategy={verticalListSortingStrategy}
          >
            {editedPlayer.actionForm.map((field, index) => (
              <SortableField
                key={field.id}
                field={field}
                sectionId="actionForm"
                onEditField={handleEditField}
                onRemoveField={handleRemoveField}
              />
            ))}
          </SortableContext>
        </DndContext>
        <Button variant="contained" onClick={addActionFormField} sx={{ mt: 2 }}>
          Add Action Form Field
        </Button>

        {/* Save and Cancel Buttons */}
        <Box
          sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}
        >
          <Button variant="contained" onClick={() => onSave(editedPlayer)}>
            Save
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
        </Box>
        {isFieldModalOpen && selectedField && (
          <FieldEditModal
            selectedField={selectedField}
            onClose={() => {
              setIsFieldModalOpen(false);
              setSelectedField(null);
            }}
            updateField={updateField}
          />
        )}
      </Box>
    </Modal>
  );
};

export default PlayerEditModal;

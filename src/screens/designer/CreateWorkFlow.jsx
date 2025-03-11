import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Col, Row, Container } from "react-bootstrap";
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
import { SortableItem } from "../../components/designer/SortableItem"; // Create this component
import PlayerEditModal from "../../components/designer/PlayerEditModal"; // Create this component

// Helper: generate a default action field based on player's permissions.

export default function CreateWorkflow() {
  // State for workflow players
  const [players, setPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState({
    playerId: 0,
    designation: "",
    canSanction: false,
    canReturnToPlayer: false,
    canReturnToCitizen: false,
    canForwardToPlayer: false,
    canReject: false,
    actionForm: [],
    prevPlayerId: null,
    nextPlayerId: null,
    status: "",
    completedAt: null,
    remarks: "",
    canPull: false,
  });

  // State for service selection and services list
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");

  // State for editing a player
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Helper: generate a default action field based on player's permissions.
  const getDefaultActionFields = (player) => {
    const actionOptions = [];

    // For "Forward" action: if a next player exists, use their designation.
    if (player.canForwardToPlayer) {
      let label = "Forward to Player";
      if (player.nextPlayerId !== null) {
        const nextPlayer = players.find(
          (p) => p.playerId === player.nextPlayerId
        );
        if (nextPlayer && nextPlayer.designation) {
          label = `Forward to ${nextPlayer.designation}`;
        }
      }
      actionOptions.push({ value: "Forward", label });
    }

    // Static sanction option.
    if (player.canSanction) {
      actionOptions.push({ value: "Sanction", label: "Sanction" });
    }

    // For "Return" action: if a previous player exists, use their designation.
    if (player.canReturnToPlayer) {
      let label = "Return to Player";
      if (player.prevPlayerId !== null) {
        const previousPlayer = players.find(
          (p) => p.playerId === player.prevPlayerId
        );
        if (previousPlayer && previousPlayer.designation) {
          label = `Return to ${previousPlayer.designation}`;
        }
      }
      actionOptions.push({ value: "ReturnToPlayer", label });
    }

    // Other actions
    if (player.canReturnToCitizen) {
      actionOptions.push({
        value: "ReturnToCitizen",
        label: "Return to Citizen",
      });
    }
    if (player.canReject) {
      actionOptions.push({ value: "Reject", label: "Reject" });
    }

    const defaultActionField = {
      id: `default-field-${Date.now()}`,
      type: "select",
      label: "Action",
      name: "defaultAction",
      minLength: 0,
      maxLength: 0,
      options: actionOptions,
      span: 12,
      validationFunctions: [],
      transformationFunctions: [],
      additionalFields: {},
      accept: "",
    };

    const remarksField = {
      id: `remarks-field-${Date.now()}`,
      type: "text",
      label: "Remarks",
      name: "Remarks",
      minLength: 0,
      maxLength: 100,
      options: [],
      span: 12,
      validationFunctions: ["notEmpty", "onlyAlphabets"],
      transformationFunctions: [],
      additionalFields: {},
      accept: "",
    };

    return [defaultActionField, remarksField];
  };

  // Helper: update default fields for all players based on current designations.
  const updateAllDefaultActionFields = () => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => {
        // Regenerate default fields using the updated players list.
        const defaultFields = getDefaultActionFields(player);
        // Replace only the default fields (identified by fixed names) in the actionForm.
        const updatedActionForm = player.actionForm.map((field) => {
          if (field.name === "defaultAction" || field.name === "Remarks") {
            const newField = defaultFields.find((f) => f.name === field.name);
            return newField ? newField : field;
          }
          return field;
        });
        return { ...player, actionForm: updatedActionForm };
      })
    );
  };

  const removePlayer = (playerIdToRemove) => {
    // Remove the selected player from the list.
    const filteredPlayers = players.filter(
      (player) => player.playerId !== playerIdToRemove
    );

    // Reassign playerId, prevPlayerId, and nextPlayerId for the remaining players.
    const updatedPlayers = filteredPlayers.map((player, index) => ({
      ...player,
      playerId: index,
      prevPlayerId: index > 0 ? index - 1 : null,
      nextPlayerId: index < filteredPlayers.length - 1 ? index + 1 : null,
    }));

    setPlayers(updatedPlayers);
  };

  // Fetch active services for selection
  useEffect(() => {
    fetch("/Base/GetServices")
      .then((response) => response.json())
      .then((data) => {
        if (data.status && data.services) {
          setServices(data.services);
        }
      })
      .catch((error) => console.error("Error fetching services:", error));
  }, []);

  // When a service is selected, load its workflow (if it exists)
  const handleServiceChange = (e) => {
    const serviceId = e.target.value;
    setSelectedServiceId(serviceId);
    const service = services.find((s) => s.serviceId === serviceId);
    if (service && service.officerEditableField) {
      try {
        const workflow = JSON.parse(service.officerEditableField);
        setPlayers(workflow);
      } catch (err) {
        console.error("Error parsing workflow:", err);
        setPlayers([]);
      }
    } else {
      setPlayers([]);
    }
  };

  // Add a new player to the workflow
  const addPlayer = () => {
    const newPlayerId = players.length;

    // Update previous player's nextPlayerId if exists.
    const updatedPlayers = players.map((player, index) =>
      index === players.length - 1
        ? { ...player, nextPlayerId: newPlayerId }
        : player
    );

    // Create new player with default action form fields.
    const newPlayerWithDefaultFields = {
      ...newPlayer,
      playerId: newPlayerId,
      prevPlayerId: newPlayerId > 0 ? newPlayerId - 1 : null,
      nextPlayerId: null,
      actionForm: getDefaultActionFields(newPlayer),
    };

    setPlayers([...updatedPlayers, newPlayerWithDefaultFields]);

    // Reset the newPlayer template.
    setNewPlayer({
      designation: "",
      canSanction: false,
      canReturnToPlayer: false,
      canReturnToCitizen: false,
      canForwardToPlayer: false,
      canReject: false,
      actionForm: [],
      status: "",
      completedAt: null,
      remarks: "",
      canPull: false,
    });
  };

  // Save the workflow to the selected service
  const saveWorkflow = async () => {
    if (!selectedServiceId) {
      alert("Please select a service first.");
      return;
    }
    const formdata = new FormData();
    formdata.append("serviceId", selectedServiceId);
    formdata.append("workflowplayers", JSON.stringify(players));

    console.log(players);
    const response = await fetch("/Base/WorkFlowPlayers", {
      method: "POST",
      body: formdata,
    });
    const result = await response.json();
    console.log(result);
  };

  // Handle drag-and-drop reordering
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = active.data.current.sortable.index;
    const newIndex = over.data.current.sortable.index;

    // Get reordered array
    const reorderedPlayers = arrayMove(players, oldIndex, newIndex);

    // Reassign IDs and relationships based on new positions
    const updatedPlayers = reorderedPlayers.map((player, index) => ({
      ...player,
      playerId: index,
      prevPlayerId: index > 0 ? index - 1 : null,
      nextPlayerId: index < reorderedPlayers.length - 1 ? index + 1 : null,
    }));

    setPlayers(updatedPlayers);
  };

  // Open edit modal for a player
  const handleEditPlayer = (player) => {
    setSelectedPlayer(player);
    setIsEditModalOpen(true);
  };

  // Update player after editing
  const updatePlayer = (updatedPlayer) => {
    // Update the current player's default fields as before.
    const defaultFields = getDefaultActionFields(updatedPlayer);
    const updatedActionForm = updatedPlayer.actionForm.map((field) => {
      if (field.name === "defaultAction" || field.name === "Remarks") {
        const newField = defaultFields.find((f) => f.name === field.name);
        return newField ? newField : field;
      }
      return field;
    });
    updatedPlayer.actionForm = updatedActionForm;

    setPlayers((prev) =>
      prev.map((p) =>
        p.playerId === updatedPlayer.playerId ? updatedPlayer : p
      )
    );

    // After updating this player, update all players' default fields.
    updateAllDefaultActionFields();

    setIsEditModalOpen(false);
  };

  // DnD sensors
  const sensors = useSensors(useSensor(PointerSensor));

  return (
    <Container fluid>
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 2,
        }}
      >
        <Row style={{ width: "100%" }}>
          <Col lg={2} md={12} xs={12}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Service selection dropdown */}
              <FormControl fullWidth>
                <InputLabel id="service-select-label">
                  Select Service
                </InputLabel>
                <Select
                  labelId="service-select-label"
                  value={selectedServiceId}
                  label="Select Service"
                  onChange={handleServiceChange}
                >
                  {services.map((service) => (
                    <MenuItem key={service.serviceId} value={service.serviceId}>
                      {service.serviceName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Add Player Button */}
              <Button variant="contained" onClick={addPlayer}>
                Add Player
              </Button>

              {/* Save Workflow Button */}
              <Button variant="contained" onClick={saveWorkflow}>
                Save Workflow
              </Button>
            </Box>
          </Col>

          <Col lg={10} md={12} xs={12}>
            <Box
              sx={{
                borderRadius: 5,
                backgroundColor: "white",
                width: "100%",
                height: "80vh",
                padding: 5,
                color: "black",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {/* Drag-and-drop context for players */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={players.map((p) => p.playerId)}
                  strategy={verticalListSortingStrategy}
                >
                  {players.map((player) => (
                    <SortableItem key={player.playerId} id={player.playerId}>
                      <Box
                        sx={{
                          border: "1px solid #ccc",
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: "#312c51",
                          color: "#F0C38E",
                        }}
                      >
                        <p>Designation: {player.designation}</p>
                        <ul>
                          <li>Sanction: {player.canSanction ? "Yes" : "No"}</li>
                          <li>
                            Return to Player:{" "}
                            {player.canReturnToPlayer ? "Yes" : "No"}
                          </li>
                          <li>
                            Return to Citizen:{" "}
                            {player.canReturnToCitizen ? "Yes" : "No"}
                          </li>
                          <li>
                            Forward to Player:{" "}
                            {player.canForwardToPlayer ? "Yes" : "No"}
                          </li>
                          <li>Reject: {player.canReject ? "Yes" : "No"}</li>
                        </ul>
                        <Button
                          variant="contained"
                          onClick={() => handleEditPlayer(player)}
                        >
                          Edit Player
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => removePlayer(player.playerId)}
                          sx={{ ml: 2 }}
                        >
                          Remove Player
                        </Button>
                      </Box>
                    </SortableItem>
                  ))}
                </SortableContext>
              </DndContext>
            </Box>
          </Col>
        </Row>
      </Box>

      {/* Edit Player Modal */}
      {isEditModalOpen && selectedPlayer && (
        <PlayerEditModal
          player={selectedPlayer}
          onClose={() => setIsEditModalOpen(false)}
          onSave={updatePlayer}
        />
      )}
    </Container>
  );
}

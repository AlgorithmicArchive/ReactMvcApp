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
    currentlyWith: false,
    poolApplications: [],
  });

  // State for service selection and services list
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");

  // State for editing a player
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

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

    // Update previous player's nextPlayerId
    const updatedPlayers = players.map((player, index) =>
      index === players.length - 1
        ? { ...player, nextPlayerId: newPlayerId }
        : player
    );

    setPlayers([
      ...updatedPlayers,
      {
        ...newPlayer,
        playerId: newPlayerId,
        prevPlayerId: newPlayerId > 0 ? newPlayerId - 1 : null,
        nextPlayerId: null,
      },
    ]);

    // Reset new player template
    setNewPlayer({
      designation: "",
      canSanction: false,
      canReturnToPlayer: false,
      canReturnToCitizen: false,
      canForwardToPlayer: false,
      canReject: false,
      actionForm: [],
      currentlyWith: false,
      status: "pending",
      completedAt: null,
      remarks: "",
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
    setPlayers((prev) =>
      prev.map((p) =>
        p.playerId === updatedPlayer.playerId ? updatedPlayer : p
      )
    );
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

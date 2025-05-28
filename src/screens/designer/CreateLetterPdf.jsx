import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Box,
  Modal,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { Col, Row } from "react-bootstrap";
import axiosInstance from "../../axiosConfig";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateLetterPdf = () => {
  const [formFields, setFormFields] = useState([]);
  const [letterFor, setLetterFor] = useState("");
  const [information, setInformation] = useState("");
  const [rows, setRows] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRowIndex, setModalRowIndex] = useState(-1);
  const [modalRowData, setModalRowData] = useState({
    label: "",
    transformString: "",
    selectedFields: [],
  });
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedLetterType, setSelectedLetterType] = useState("");

  // Fetch services and form fields
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axiosInstance.get("/Base/GetServices");
        if (response.data.status && response.data.services) {
          setServices(response.data.services);
        } else {
          toast.error("No services found.");
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        toast.error("Failed to load services.");
      }
    };

    const fetchFormFields = async () => {
      try {
        const response = await axiosInstance.get("/Base/GetFormElements", {
          params: { serviceId: selectedServiceId || "1" },
        });
        setFormFields(response.data.names || []);
      } catch (error) {
        console.error("Error fetching form fields:", error);
        toast.error("Failed to load form fields.");
      }
    };

    fetchServices();
    fetchFormFields();
  }, [selectedServiceId]);

  // Fetch letter details when service or letter type changes
  useEffect(() => {
    if (!selectedServiceId || !selectedLetterType) {
      setLetterFor("");
      setInformation("");
      setRows([]);
      return;
    }

    const fetchLetterDetails = async () => {
      try {
        const response = await axiosInstance.get("/Base/GetLetterDetails", {
          params: {
            serviceId: selectedServiceId,
            objField: selectedLetterType,
          },
        });
        if (response.data.requiredObj) {
          const { letterFor, tableFields, information } =
            response.data.requiredObj;
          setLetterFor(letterFor || "");
          setInformation(information || "");
          setRows(tableFields || []);
          toast.success(
            `${selectedLetterType} letter data loaded successfully.`
          );
        } else {
          setLetterFor("");
          setInformation("");
          setRows([]);
          toast.info(
            `No existing ${selectedLetterType} letter data found for this service.`
          );
        }
      } catch (error) {
        console.error(
          `Error fetching ${selectedLetterType} letter details:`,
          error
        );
        setLetterFor("");
        setInformation("");
        setRows([]);
        toast.error(`Failed to load ${selectedLetterType} letter data.`);
      }
    };

    fetchLetterDetails();
  }, [selectedServiceId, selectedLetterType]);

  const openModalForEdit = (index) => {
    setModalRowIndex(index);
    setModalRowData(JSON.parse(JSON.stringify(rows[index])));
    setModalOpen(true);
  };

  const openModalForAdd = () => {
    setModalRowIndex(-1);
    setModalRowData({ label: "", transformString: "", selectedFields: [] });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const saveModal = () => {
    const newRows = [...rows];
    if (modalRowIndex === -1) {
      newRows.push(modalRowData);
    } else {
      newRows[modalRowIndex] = modalRowData;
    }
    setRows(newRows);
    closeModal();
  };

  const updateLabel = (value) => {
    setModalRowData((prev) => ({ ...prev, label: value.toUpperCase() }));
  };

  const updateTransformString = (value) => {
    setModalRowData((prev) => ({ ...prev, transformString: value }));
  };

  const addSelectedField = () => {
    setModalRowData((prev) => ({
      ...prev,
      selectedFields: [...prev.selectedFields, ""],
    }));
  };

  const updateSelectedField = (index, value) => {
    setModalRowData((prev) => {
      const updatedFields = [...prev.selectedFields];
      updatedFields[index] = value;
      return { ...prev, selectedFields: updatedFields };
    });
  };

  const removeSelectedField = (index) => {
    setModalRowData((prev) => {
      const updatedFields = prev.selectedFields.filter((_, i) => i !== index);
      return { ...prev, selectedFields: updatedFields };
    });
  };

  const handleRemoveRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const getPreview = (row) => {
    let preview = row.transformString;
    row.selectedFields.forEach((field, index) => {
      preview = preview.replace(`{${index}}`, `{${field}}`);
    });
    return preview;
  };

  const handleGenerateJson = () => {
    const jsonOutput = {
      [selectedLetterType]: {
        letterFor,
        tableFields: rows.map((row) => ({
          label: row.label,
          transformString: row.transformString,
          selectedFields: row.selectedFields.filter((f) =>
            formFields.includes(f)
          ),
        })),
        information,
      },
    };
    console.log(JSON.stringify(jsonOutput, null, 2));
    return jsonOutput;
  };

  const saveLetter = async () => {
    if (!selectedServiceId) {
      toast.error("Please select a service first.");
      return;
    }
    if (!selectedLetterType) {
      toast.error("Please select a letter type.");
      return;
    }

    const jsonOutput = handleGenerateJson();

    const formData = new FormData();
    formData.append("serviceId", selectedServiceId);
    formData.append("objField", selectedLetterType);
    formData.append("letterData", JSON.stringify(jsonOutput));

    try {
      const response = await axiosInstance.post(
        "/Base/SaveLetterDetails",
        formData
      );
      if (response.data.status) {
        toast.success(`${selectedLetterType} letter saved successfully!`);
      } else {
        toast.error(`Failed to save ${selectedLetterType} letter.`);
      }
    } catch (error) {
      console.error(`Error saving ${selectedLetterType} letter:`, error);
      toast.error(
        `An error occurred while saving the ${selectedLetterType} letter.`
      );
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.100", p: 3 }}>
      <Container sx={{ bgcolor: "white", borderRadius: 2, boxShadow: 3, p: 4 }}>
        <Typography
          variant="h4"
          sx={{ color: "grey.800", mb: 4, fontWeight: "bold" }}
        >
          Configure Letter
        </Typography>

        <Box sx={{ mb: 4 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="service-select-label">Select Service</InputLabel>
            <Select
              labelId="service-select-label"
              value={selectedServiceId}
              label="Select Service"
              onChange={(e) => setSelectedServiceId(e.target.value)}
            >
              <MenuItem value="" disabled>
                Select a Service
              </MenuItem>
              {services.map((service) => (
                <MenuItem key={service.serviceId} value={service.serviceId}>
                  {service.serviceName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="letter-type-select-label">
              Select Letter Type
            </InputLabel>
            <Select
              labelId="letter-type-select-label"
              value={selectedLetterType}
              label="Select Letter Type"
              onChange={(e) => setSelectedLetterType(e.target.value)}
              disabled={!selectedServiceId}
            >
              <MenuItem value="" disabled>
                Select a Letter Type
              </MenuItem>
              <MenuItem value="Sanction">Sanction</MenuItem>
              <MenuItem value="Acknowledgement">Acknowledgement</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Letter For"
            value={letterFor}
            onChange={(e) => setLetterFor(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{ mb: 2, bgcolor: "grey.50" }}
            disabled={!selectedServiceId || !selectedLetterType}
          />
          <TextField
            label="Letter Information"
            value={information}
            onChange={(e) => setInformation(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{ bgcolor: "grey.50" }}
            disabled={!selectedServiceId || !selectedLetterType}
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          {rows.map((row, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                p: 2,
                bgcolor: "grey.50",
                borderRadius: 1,
                mb: 2,
              }}
            >
              <Row className="w-100 align-items-center" style={{ margin: 0 }}>
                <Col md={5} style={{ padding: 0 }}>
                  <Box
                    sx={{
                      border: "1px solid #ccc",
                      padding: "8px 12px",
                      height: "100%",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <Typography variant="body1">
                      {row.label || `Row ${index + 1}`}
                    </Typography>
                  </Box>
                </Col>
                <Col md={5} style={{ padding: 0 }}>
                  <Box
                    sx={{
                      border: "1px solid #ccc",
                      padding: "8px 12px",
                      height: "100%",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <Typography variant="body1">{getPreview(row)}</Typography>
                  </Box>
                </Col>
                <Col
                  md={2}
                  className="d-flex justify-content-end"
                  style={{ padding: 0 }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => openModalForEdit(index)}
                    sx={{ minWidth: "80px", mr: 1 }}
                    disabled={!selectedServiceId || !selectedLetterType}
                  >
                    Edit
                  </Button>
                  <IconButton
                    onClick={() => handleRemoveRow(index)}
                    color="error"
                    size="small"
                    disabled={!selectedServiceId || !selectedLetterType}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Col>
              </Row>
            </Box>
          ))}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openModalForAdd}
            sx={{ bgcolor: "blue.500" }}
            disabled={!selectedServiceId || !selectedLetterType}
          >
            Add Row
          </Button>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateJson}
            disabled={!selectedServiceId || !selectedLetterType}
          >
            Generate JSON
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={saveLetter}
            disabled={!selectedServiceId || !selectedLetterType}
          >
            Save Letter
          </Button>
        </Box>

        <Modal open={modalOpen} onClose={closeModal}>
          <Box
            sx={{
              bgcolor: "white",
              p: 4,
              borderRadius: 2,
              maxWidth: 500,
              mx: "auto",
              mt: "10%",
              boxShadow: 24,
            }}
          >
            <Typography variant="h5" sx={{ mb: 3 }}>
              Configure Row
            </Typography>
            <TextField
              label="Label"
              value={modalRowData.label}
              onChange={(e) => updateLabel(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{ mb: 3 }}
            />
            <TextField
              label="Transform String"
              value={modalRowData.transformString}
              onChange={(e) => updateTransformString(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{ mb: 3 }}
            />

            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Selected Fields
            </Typography>
            {modalRowData.selectedFields.map((field, index) => (
              <Box
                key={index}
                sx={{ display: "flex", alignItems: "center", mb: 2 }}
              >
                <FormControl sx={{ width: "80%", mr: 2 }}>
                  <Select
                    value={field}
                    onChange={(e) => updateSelectedField(index, e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Select Field
                    </MenuItem>
                    {formFields.map((formField) => (
                      <MenuItem key={formField} value={formField}>
                        {formField}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <IconButton
                  onClick={() => removeSelectedField(index)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addSelectedField}
              sx={{ mb: 3 }}
            >
              Add Field
            </Button>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button variant="outlined" onClick={closeModal}>
                Cancel
              </Button>
              <Button variant="contained" onClick={saveModal}>
                Save
              </Button>
            </Box>
          </Box>
        </Modal>
      </Container>

      <ToastContainer position="top-right" autoClose={3000} />
    </Box>
  );
};

export default CreateLetterPdf;

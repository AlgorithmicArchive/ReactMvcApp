import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import {
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Button,
  IconButton,
  Box,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import axiosInstance from "../../axiosConfig";

const CreateSanctionPdf = () => {
  const [formFields, setFormFields] = useState([]);
  const [rows, setRows] = useState([
    { label: "", transformString: "", selectedFields: [] },
  ]);

  useEffect(() => {
    const fetchFormFields = async () => {
      try {
        const response = await axiosInstance.get("/Base/GetFormElements", {
          params: { serviceId: "1" },
        });
        setFormFields(response.data.names);
      } catch (error) {
        console.error("Error fetching form fields:", error);
      }
    };
    fetchFormFields();
  }, []);

  const handleRowChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const handleAddRow = () => {
    setRows([...rows, { label: "", transformString: "", selectedFields: [] }]);
  };

  const handleRemoveRow = (index) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
  };

  const handleGenerateJson = () => {
    const jsonConfig = JSON.stringify(rows, null, 2);
    console.log(jsonConfig);
    // In a real app, this could be sent to a server or stored
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "90vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 2,
      }}
    >
      <Container>
        <Typography variant="h5" gutterBottom>
          Configure Sanction Letter Sections
        </Typography>
        <Row className="mb-2">
          <Col md={3}>
            <Typography variant="subtitle1">Label</Typography>
          </Col>
          <Col md={3}>
            <Typography variant="subtitle1">Transform String</Typography>
          </Col>
          <Col md={5}>
            <Typography variant="subtitle1">Selected Fields</Typography>
          </Col>
          <Col md={1}>
            <Typography variant="subtitle1">Actions</Typography>
          </Col>
        </Row>
        {rows.map((row, index) => (
          <Row key={index} className="align-items-center mb-2">
            <Col md={3}>
              <TextField
                label="Label"
                value={row.label}
                onChange={(e) =>
                  handleRowChange(index, "label", e.target.value)
                }
                fullWidth
                variant="outlined"
              />
            </Col>
            <Col md={3}>
              <TextField
                label="Transform String (e.g., {0} / {1})"
                value={row.transformString}
                onChange={(e) =>
                  handleRowChange(index, "transformString", e.target.value)
                }
                fullWidth
                variant="outlined"
              />
            </Col>
            <Col md={5}>
              <FormControl fullWidth>
                <Select
                  multiple
                  value={row.selectedFields}
                  onChange={(e) =>
                    handleRowChange(index, "selectedFields", e.target.value)
                  }
                  renderValue={(selected) => selected.join(", ")}
                >
                  {formFields.map((field) => (
                    <MenuItem key={field} value={field}>
                      {field}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Col>
            <Col md={1}>
              <IconButton onClick={() => handleRemoveRow(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </Col>
          </Row>
        ))}
        <Row className="mt-3">
          <Col md={6}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddRow}
              fullWidth
            >
              Add Row
            </Button>
          </Col>
          <Col md={6}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerateJson}
              fullWidth
            >
              Generate JSON
            </Button>
          </Col>
        </Row>
      </Container>
    </Box>
  );
};

export default CreateSanctionPdf;

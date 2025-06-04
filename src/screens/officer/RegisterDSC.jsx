import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import axiosInstance from "../../axiosConfig";

export default function RegisterDSC() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const checkDesktopApp = async () => {
    try {
      const response = await fetch("http://localhost:8000/");
      if (!response.ok) throw new Error("Desktop application is not running.");
      return true;
    } catch {
      throw new Error(
        "Please start the USB Token PDF Signer desktop application."
      );
    }
  };

  const fetchCertificates = async (pin) => {
    const formData = new FormData();
    formData.append("pin", pin);
    const response = await fetch("http://localhost:8000/certificates", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  };

  const registerDSC = async (certificate) => {
    const formdata = new FormData();
    formdata.append("serial_number", certificate.serial_number);
    formdata.append("certifying_authority", certificate.certifying_authority);
    formdata.append("expiration_date", certificate.expiration_date);
    const response = await axiosInstance.post("/Officer/RegisterDSC", formdata);
    if (!response.data.success)
      throw new Error("Failed to register DSC with the server.");
    return response.data;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Check if desktop app is running
      await checkDesktopApp();

      // Fetch certificates from desktop app
      const certificates = await fetchCertificates(pin);
      if (!certificates || certificates.length === 0) {
        throw new Error("No certificates found on the USB token.");
      }

      // For simplicity, select the first certificate (you can add a selection UI later)
      const selectedCertificate = certificates[0];

      console.log(selectedCertificate);
      // Register DSC with the backend
      await registerDSC(selectedCertificate);
      setSuccess("DSC registered successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row>
        <Col md={{ span: 6, offset: 3 }}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: 4,
              height: "90vh",
            }}
          >
            <Typography variant="h5" component="h1" gutterBottom>
              Register DSC
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            <TextField
              label="USB Token PIN"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              disabled={loading}
            />
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Register DSC"}
            </Button>
          </Box>
        </Col>
      </Row>
    </Container>
  );
}

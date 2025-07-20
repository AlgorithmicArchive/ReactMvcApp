import React, { useMemo } from "react";
import { Box, Button, Collapse, Divider, Typography } from "@mui/material";
import { Col, Row } from "react-bootstrap";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

const buttonStyles = {
  backgroundColor: "#FFFFFF",
  color: "primary.main",
  textTransform: "none",
  fontSize: "14px",
  fontWeight: 500,
  padding: "8px 16px",
  border: "1px solid",
  borderColor: "primary.main",
  borderRadius: "8px",
  "&:hover": {
    backgroundColor: "#E3F2FD",
    borderColor: "#1565C0",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
};

export const CollapsibleFormDetails = ({
  formDetails,
  formatKey,
  detailsOpen,
  setDetailsOpen,
  onViewPdf,
  applicationId,
}) => {
  const sections = useMemo(() => {
    return Array.isArray(formDetails)
      ? formDetails
      : Object.entries(formDetails).map(([key, value]) => ({ [key]: value }));
  }, [formDetails]);

  return (
    <Box sx={{ width: "100%", mx: "auto", mb: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Button
          onClick={() => setDetailsOpen(!detailsOpen)}
          sx={buttonStyles}
          startIcon={detailsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          aria-expanded={detailsOpen}
          aria-label={detailsOpen ? "Collapse details" : "Expand details"}
        >
          {detailsOpen ? "Hide Details" : "Show Details"}
        </Button>
      </Box>
      <Collapse in={detailsOpen} timeout={500}>
        <Box
          sx={{
            bgcolor: "#FFFFFF",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            p: 3,
            border: "1px solid",
            borderColor: "primary.main",
            maxHeight: "800px",
            overflowY: "auto",
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "primary.main", mb: 2 }}
            >
              Reference Number
            </Typography>
            <Row className="g-3">
              <Col xs={12} md={12}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography
                    variant="body1"
                    sx={{
                      border: "1px solid #E0E0E0",
                      borderRadius: "8px",
                      p: 2,
                      color: applicationId ? "#212121" : "#B0BEC5",
                    }}
                  >
                    {applicationId}
                  </Typography>
                </Box>
              </Col>
            </Row>
          </Box>
          {sections.length > 0 ? (
            sections.map((section, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "primary.main", mb: 2 }}
                >
                  {Object.keys(section)[0]}
                </Typography>
                <Row className="g-3">
                  {Object.entries(section).map(([sectionName, fields]) => {
                    // Flatten fields and additionalFields into a single array
                    const allFields = fields.reduce((acc, field) => {
                      acc.push(field); // Add the parent field
                      if (
                        field.additionalFields &&
                        Array.isArray(field.additionalFields)
                      ) {
                        acc.push(...field.additionalFields); // Add additionalFields as independent fields
                      }
                      return acc;
                    }, []);

                    return allFields.map(
                      (field, fieldIndex) =>
                        field.name !== "SameAsPresent" ? (
                          <Col
                            xs={12}
                            md={6}
                            key={`${sectionName}-${field.name}-${fieldIndex}`}
                          >
                            <Box
                              sx={{ display: "flex", flexDirection: "column" }}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 500,
                                  color: "#616161",
                                  mb: 1,
                                }}
                              >
                                {field.label || field.name}
                              </Typography>

                              {field.File && field.File !== "" ? (
                                /\.(jpg|jpeg|png|gif)$/i.test(field.File) ? (
                                  <Box
                                    component="img"
                                    src={`/Base/DisplayFile?filename=${field.File}`}
                                    alt={field.label}
                                    sx={{
                                      width: "100%",
                                      maxHeight: 200,
                                      objectFit: "contain",
                                      borderRadius: "8px",
                                      border: "1px solid #E0E0E0",
                                      transition: "transform 0.3s ease",
                                      "&:hover": { transform: "scale(1.02)" },
                                    }}
                                  />
                                ) : (
                                  <Box sx={{ mt: 1 }}>
                                    <Button
                                      variant="outlined"
                                      onClick={() => onViewPdf(field.File)}
                                      startIcon={<PictureAsPdfIcon />}
                                      sx={{
                                        textTransform: "none",
                                        borderColor: "#1976D2",
                                        color: "#1976D2",
                                        "&:hover": {
                                          backgroundColor: "#E3F2FD",
                                          borderColor: "#1565C0",
                                        },
                                      }}
                                      aria-label={`View ${field.label} document`}
                                    >
                                      View Document
                                    </Button>
                                    {field.Enclosure && (
                                      <Typography
                                        variant="caption"
                                        sx={{ mt: 1, color: "#757575" }}
                                      >
                                        Enclosure: {field.Enclosure}
                                      </Typography>
                                    )}
                                  </Box>
                                )
                              ) : (
                                <Typography
                                  variant="body1"
                                  sx={{
                                    border: "1px solid #E0E0E0",
                                    borderRadius: "8px",
                                    p: 2,
                                    color: field.value ? "#212121" : "#B0BEC5",
                                  }}
                                >
                                  {field.value ?? "--"}
                                </Typography>
                              )}
                            </Box>
                          </Col>
                        ) : null // Skip rendering if name is SameAsPresent
                    );
                  })}
                </Row>
                {index < sections.length - 1 && (
                  <Divider sx={{ my: 3, borderColor: "#E0E0E0" }} />
                )}
              </Box>
            ))
          ) : (
            <Typography sx={{ textAlign: "center", color: "#B0BEC5", py: 4 }}>
              No form details available.
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default CollapsibleFormDetails;

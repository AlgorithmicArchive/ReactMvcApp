import {
  Box,
  Button,
  Collapse,
  Divider,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useMemo } from "react";
import { Col, Row } from "react-bootstrap";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

// CollapsibleFormDetails
export const CollapsibleFormDetails = ({
  formDetails,
  formatKey,
  detailsOpen,
  setDetailsOpen,
  onViewPdf,
}) => {
  const sections = useMemo(() => {
    return Array.isArray(formDetails)
      ? formDetails
      : Object.entries(formDetails).map(([key, value]) => ({ [key]: value }));
  }, [formDetails]);

  return (
    <Box sx={{ width: "100%", maxWidth: 800, mx: "auto", mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Tooltip
          title={detailsOpen ? "Collapse details" : "Expand details"}
          arrow
        >
          <Button
            onClick={() => setDetailsOpen((prev) => !prev)}
            sx={{
              backgroundColor: "primary.main",
              color: "background.paper",
              fontWeight: 600,
              textTransform: "none",
              py: 1,
              px: 3,
              borderRadius: 2,
              mb: 2,
              "&:hover": {
                backgroundColor: "primary.dark",
                transform: "scale(1.02)",
                transition: "all 0.2s ease",
              },
            }}
            startIcon={detailsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            aria-expanded={detailsOpen}
            aria-label={detailsOpen ? "Collapse details" : "Expand details"}
          >
            {detailsOpen ? "Collapse" : "Expand"} Details
          </Button>
        </Tooltip>
      </Box>
      <Collapse in={detailsOpen} timeout={500}>
        <Box
          sx={{
            bgcolor: "#FFFFFF",
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            p: { xs: 3, md: 5 },
            border: "1px solid",
            borderColor: "divider",
            maxHeight: 400,
            overflowY: "auto",
          }}
        >
          {sections.length > 0 ? (
            sections.map((section, index) => (
              <Box key={index} sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: "'Playfair Display', serif",
                    color: "primary.main",
                    fontWeight: 700,
                    mb: 2,
                    borderBottom: "2px solid",
                    borderColor: "primary.main",
                    pb: 1,
                  }}
                >
                  {Object.keys(section)[0]}
                </Typography>
                <Row className="g-3">
                  {Object.entries(section).map(([sectionName, fields]) =>
                    fields.map((field, fieldIndex) => (
                      <Col xs={12} md={6} key={fieldIndex}>
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                          <Tooltip title={field.label || field.name} arrow>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 600,
                                color: "text.secondary",
                                mb: 1,
                                maxWidth: "100%",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {field.label || field.name}
                            </Typography>
                          </Tooltip>
                          {field.File && field.File !== "" ? (
                            /\.(jpg|jpeg|png|gif)$/i.test(field.File) ? (
                              <Box
                                component="img"
                                src={field.File}
                                alt={field.label}
                                sx={{
                                  width: "100%",
                                  height: 150,
                                  objectFit: "cover",
                                  borderRadius: 2,
                                  border: "1px solid",
                                  borderColor: "divider",
                                  p: 1,
                                  transition: "transform 0.3s ease",
                                  "&:hover": {
                                    transform: "scale(1.02)",
                                  },
                                }}
                              />
                            ) : (
                              <Box sx={{ mt: 1 }}>
                                <Tooltip title="View document" arrow>
                                  <Button
                                    variant="outlined"
                                    onClick={() => onViewPdf(field.File)}
                                    startIcon={<PictureAsPdfIcon />}
                                    sx={{
                                      textTransform: "none",
                                      borderColor: "primary.main",
                                      color: "primary.main",
                                      "&:hover": {
                                        backgroundColor: "primary.light",
                                        borderColor: "primary.dark",
                                      },
                                    }}
                                    aria-label={`View ${field.label} document`}
                                  >
                                    View Document
                                  </Button>
                                </Tooltip>
                                {field.Enclosure && (
                                  <Typography
                                    variant="caption"
                                    display="block"
                                    sx={{ mt: 1, color: "text.secondary" }}
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
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 2,
                                p: 2,
                                mt: 1,
                                color: field.value
                                  ? "text.primary"
                                  : "text.secondary",
                              }}
                            >
                              {field.value ?? "--"}
                            </Typography>
                          )}
                          {field.additionalFields &&
                            Array.isArray(field.additionalFields) && (
                              <Box sx={{ ml: 2, mt: 2 }}>
                                {field.additionalFields.map(
                                  (nestedField, nestedIndex) => (
                                    <Box
                                      key={nestedIndex}
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                      }}
                                    >
                                      <Tooltip
                                        title={
                                          nestedField.label || nestedField.name
                                        }
                                        arrow
                                      >
                                        <Typography
                                          variant="subtitle2"
                                          sx={{
                                            fontWeight: 600,
                                            color: "text.secondary",
                                            mb: 1,
                                            maxWidth: "100%",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                          }}
                                        >
                                          {nestedField.label ||
                                            nestedField.name}
                                        </Typography>
                                      </Tooltip>
                                      <Typography
                                        variant="body1"
                                        sx={{
                                          border: "1px solid",
                                          borderColor: "divider",
                                          borderRadius: 2,
                                          p: 2,
                                          mt: 1,
                                          color: nestedField.value
                                            ? "text.primary"
                                            : "text.secondary",
                                        }}
                                      >
                                        {nestedField.value ?? "--"}
                                      </Typography>
                                    </Box>
                                  )
                                )}
                              </Box>
                            )}
                        </Box>
                      </Col>
                    ))
                  )}
                </Row>
                {index < sections.length - 1 && (
                  <Divider
                    sx={{
                      my: 3,
                      borderColor: "primary.main",
                      borderWidth: "1px",
                    }}
                  />
                )}
              </Box>
            ))
          ) : (
            <Typography
              sx={{ textAlign: "center", color: "text.secondary", py: 4 }}
            >
              No form details available.
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

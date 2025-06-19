import { Box, Divider, Typography } from "@mui/material";
import React from "react";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        width: "100%",
        borderTopWidth: 2,
        borderTopStyle: "solid",
        borderTopColor: "text.primary",
        padding: 5,
      }}
    >
      <Container>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            gap: 5,
          }}
        >
          <Typography sx={{ color: "text.secondary" }}>
            Sahayata Nidhi
          </Typography>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ borderColor: "text.primary", height: 100 }}
          />
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Box sx={{ display: "flex", gap: 5 }}>
              <Typography
                variant="subtitle1"
                sx={{ color: "text.secondary", cursor: "pointer" }}
              >
                About
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ color: "text.secondary", cursor: "pointer" }}
              >
                Support
              </Typography>
              <Box
                component="button"
                sx={{
                  color: "text.secondary",
                  cursor: "pointer",
                  border: "none",
                  backgroundColor: "transparent",
                }}
                onClick={() => navigate("/register")}
              >
                Register
              </Box>
            </Box>

            <Typography sx={{ color: "text.secondary" }}>
              @2025 Social Welfare Deparment
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

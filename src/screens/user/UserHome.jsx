import React, { useEffect, useRef, useState } from "react";
import { Box, Divider, Typography } from "@mui/material";

import axiosInstance from "../../axiosConfig";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Col, Container, Row } from "react-bootstrap";

export default function UserHome() {
  const [userDetails, setUserDetails] = useState(null);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ file: "", url: "" });

  async function GetUserDetails() {
    const response = await axiosInstance.get("/User/GetUserDetails");
    setUserDetails(response.data);
    setLoading(false);
    setProfile({ file: "", url: response.data.profile });
  }

  async function GetSanctionDetils() {
    const response = await axiosInstance.get("/User/GetSanctionDetails", {
      params: { applicationId: "JK-PN-JMU/2025-2026/2", serviceId: "1" },
    });
    console.log(response.data);
  }

  useEffect(() => {
    GetUserDetails();
    GetSanctionDetils();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: { xs: "100vh", md: "70vh" },
      }}
    >
      <Container
        style={{
          height: "80%",
          padding: 0,
        }}
      >
        <Row style={{ height: "100%" }} className="g-0">
          <Col xs={12} lg={6}>
            <Box
              sx={{
                backgroundColor: "background.default",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%", // ensures it fills the parent Col
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Box
                component="img"
                src={profile.url}
                sx={{
                  width: "45%",
                  maxWidth: "100%",
                  height: "auto",
                }}
              />
              <Typography
                variant="h4"
                sx={{ fontFamily: "'Playfair Display', serif" }}
              >
                {userDetails.name}
              </Typography>
            </Box>
          </Col>
          <Col
            xs={12}
            lg={6}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "15px 15px 15px rgba(0, 0, 0, 0.1)",
              borderTop: "1px solid #333333",
            }}
          >
            <Box sx={{ width: { xs: "100%", lg: "80%" } }}>
              <Typography
                variant="h3"
                sx={{ fontFamily: "ariel", textAlign: "center" }}
              >
                User Profile
              </Typography>
              <Box
                sx={{
                  backgroundColor: "background.default",
                  padding: { xs: 2, lg: 10 },
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ color: "gray", fontSize: 14 }}>
                    Username
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: 12, lg: 16 },
                      width: "40%",
                      textAlign: "left",
                    }}
                  >
                    {userDetails.username}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ color: "gray", fontSize: 14 }}>
                    Email
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: 12, lg: 16 },
                      width: "40%",
                      textAlign: "left",
                    }}
                  >
                    {userDetails.email}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ color: "gray", fontSize: 14 }}>
                    Mobile Number
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: 12, lg: 16 },
                      width: "40%",
                      textAlign: "left",
                    }}
                  >
                    {userDetails.mobileNumber}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ color: "gray", fontSize: 14 }}>
                    Initiated Applications
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: 12, lg: 16 },
                      width: "40%",
                      textAlign: "left",
                    }}
                  >
                    {userDetails.initiated}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ color: "gray", fontSize: 14 }}>
                    Incomplete Applications
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: 12, lg: 16 },
                      width: "40%",
                      textAlign: "left",
                    }}
                  >
                    {userDetails.incomplete}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ color: "gray", fontSize: 14 }}>
                    Sanctioned Applications
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: 12, lg: 16 },
                      width: "40%",
                      textAlign: "left",
                    }}
                  >
                    {userDetails.sanctioned}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Col>
        </Row>
      </Container>
    </Box>
  );
}

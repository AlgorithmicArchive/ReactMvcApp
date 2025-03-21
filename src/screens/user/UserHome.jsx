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

  useEffect(() => {
    GetUserDetails();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <Box
      sx={{
        width: "100vw",
        height: { xs: "120vh", md: "70vh" },
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 2,
      }}
    >
      <Row className="align-items-center">
        <Col md={4} xs={12}>
          <Box
            sx={{
              border: "2px solid",
              borderColor: "primary.main",
              borderRadius: 3,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: 3,
              backgroundColor: "background.paper",
              overflow: "hidden",
            }}
          >
            <img
              src={profile.url}
              alt="User Profile Picture"
              style={{ width: "100%" }}
            />
          </Box>
        </Col>
        <Col md={8} xs={12} className="mt-5 mt-md-0">
          <Box
            sx={{
              border: "2px solid",
              borderColor: "primary.main",
              borderRadius: 3,
              padding: 3,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: 3,
              backgroundColor: "background.paper",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Typography sx={{ fontWeight: "bold" }}>Name:</Typography>
              <Typography sx={{ fontWeight: "bold" }}>
                {userDetails.name}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Typography sx={{ fontWeight: "bold" }}>Username:</Typography>
              <Typography sx={{ fontWeight: "bold" }}>
                {userDetails.username}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Typography sx={{ fontWeight: "bold" }}>Email:</Typography>
              <Typography sx={{ fontWeight: "bold" }}>
                {userDetails.email}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Typography sx={{ fontWeight: "bold" }}>
                Mobile Number:
              </Typography>
              <Typography sx={{ fontWeight: "bold" }}>
                {userDetails.mobileNumber}
              </Typography>
            </Box>
            <Divider
              sx={{
                borderColor: "primary.main",
                borderWidth: "2px",
                width: "100%",
              }}
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Typography sx={{ fontWeight: "bold", fontSize: "18px" }}>
                Initiated Applications:
              </Typography>
              <Typography sx={{ fontWeight: "bold", fontSize: "18px" }}>
                {userDetails.initiated}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Typography sx={{ fontWeight: "bold", fontSize: "18px" }}>
                Icomplete Applications:
              </Typography>
              <Typography sx={{ fontWeight: "bold", fontSize: "18px" }}>
                {userDetails.incomplete}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Typography sx={{ fontWeight: "bold", fontSize: "18px" }}>
                Sanctioned Applications:
              </Typography>
              <Typography sx={{ fontWeight: "bold", fontSize: "18px" }}>
                {userDetails.sanctioned}
              </Typography>
            </Box>
          </Box>
        </Col>
      </Row>
    </Box>
  );
}

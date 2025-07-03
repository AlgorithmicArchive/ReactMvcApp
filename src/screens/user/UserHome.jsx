import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  CircularProgress,
} from "@mui/material";
import { Container, Row, Col } from "react-bootstrap";
import axiosInstance from "../../axiosConfig";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function UserHome() {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ file: "", url: "" });

  // Fetch user details
  async function GetUserDetails() {
    try {
      const response = await axiosInstance.get("/User/GetUserDetails");
      setUserDetails(response.data);
      setProfile({ file: "", url: response.data.profile || "" });
    } catch (error) {
      toast.error("Failed to load user details. Please try again.", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    GetUserDetails();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, rgb(252, 252, 252) 0%, rgb(240, 236, 236) 100%)",
        }}
      >
        <CircularProgress color="primary" aria-label="Loading user profile" />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: { xs: "100vh", lg: "80vh" },
        background:
          "linear-gradient(135deg, rgb(252, 252, 252) 0%, rgb(240, 236, 236) 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: { xs: 2, md: 4 },
      }}
      role="main"
      aria-labelledby="user-profile-title"
    >
      <Container
        style={{
          maxWidth: 900,
          padding: 0,
        }}
      >
        <Row className="g-0">
          {/* Left Section: Profile Image and Name */}
          <Col xs={12} lg={5}>
            <Box
              sx={{
                bgcolor: "background.default",
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                p: { xs: 3, md: 4 },
                transition: "transform 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-5px)", // Subtle hover animation
                },
              }}
            >
              <Avatar
                src={profile.url}
                alt={`${userDetails?.name || "User"}'s profile picture`}
                sx={{
                  width: { xs: 100, md: 120 },
                  height: { xs: 100, md: 120 },
                  bgcolor: "grey.300",
                  border: "2px solid",
                  borderColor: "primary.main",
                  mb: 2,
                }}
              />
              <Typography
                variant="h4"
                sx={{
                  fontFamily: "'Playfair Display', serif",
                  color: "primary.main",
                  textAlign: "center",
                  fontWeight: 700,
                }}
              >
                {userDetails?.name || "User Name"}
              </Typography>
            </Box>
          </Col>

          {/* Right Section: User Details */}
          <Col xs={12} lg={7}>
            <Box
              sx={{
                bgcolor: "background.paper",
                borderRadius: 3,
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
                p: { xs: 3, md: 4 },
                height: "100%",
                transition: "transform 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-5px)", // Subtle hover animation
                },
              }}
            >
              <Typography
                variant="h5"
                id="user-profile-title"
                sx={{
                  fontFamily: "'Playfair Display', serif",
                  color: "primary.main",
                  mb: 3,
                  textAlign: "center",
                  fontWeight: 700,
                }}
              >
                User Profile
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {[
                  { label: "Username", value: userDetails?.username },
                  { label: "Email", value: userDetails?.email },
                  { label: "Mobile Number", value: userDetails?.mobileNumber },
                  {
                    label: "Initiated Applications",
                    value: userDetails?.initiated,
                  },
                  {
                    label: "Incomplete Applications",
                    value: userDetails?.incomplete,
                  },
                ].map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      py: 1,
                      borderBottom: "1px solid",
                      borderColor: "grey.200",
                    }}
                    aria-label={`${item.label}: ${item.value || "N/A"}`}
                  >
                    <Typography
                      sx={{
                        color: "text.secondary",
                        fontSize: { xs: 14, md: 16 },
                        fontWeight: 500,
                        width: "50%",
                      }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: { xs: 14, md: 16 },
                        fontWeight: 400,
                        color: "text.primary",
                        width: "50%",
                        textAlign: "right",
                      }}
                    >
                      {item.value || "N/A"}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Col>
        </Row>
      </Container>

      {/* Toast Container */}
      <ToastContainer />
    </Box>
  );
}

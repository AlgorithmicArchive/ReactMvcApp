import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Box,
  Divider,
  Typography,
  Avatar,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { Container, Row, Col } from "react-bootstrap";
import axiosInstance from "../axiosConfig";
import CustomButton from "../components/CustomButton";
import { UserContext } from "../UserContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

export default function Settings() {
  const { setProfile } = useContext(UserContext);
  const [userDetails, setUserDetails] = useState(null);
  const [used, setUsed] = useState([]);
  const [unused, setUnused] = useState([]);
  const [save, setSave] = useState(false);
  const [profile, setLocalProfile] = useState({ file: "", url: "" });
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const profileRef = useRef(null);

  // Handle profile image change
  const handleProfileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setLocalProfile({ file, url: imageUrl });
      setSave(true);
      toast.info("Profile image selected. Click Save to update.", {
        position: "top-center",
        autoClose: 2000,
        theme: "colored",
      });
    }
  };

  // Save profile image
  const handleSaveProfile = async () => {
    setButtonLoading(true);
    try {
      const formdata = new FormData();
      formdata.append("profile", profile.file);
      const response = await axiosInstance.post(
        "/Profile/ChangeImage",
        formdata
      );
      setProfile(response.data.filePath);
      setLocalProfile({ file: "", url: response.data.filePath });
      setSave(false);
      toast.success("Profile image updated successfully!", {
        position: "top-center",
        autoClose: 2000,
        theme: "colored",
      });
    } catch (error) {
      console.error("Error saving profile image:", error);
      toast.error("Failed to update profile image. Please try again.", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setButtonLoading(false);
    }
  };

  // Generate new backup codes
  const handleNewCodes = async () => {
    setButtonLoading(true);
    try {
      const response = await axiosInstance.get("/Profile/GenerateBackupCodes");
      if (response.data.status) {
        toast.success("New backup codes generated successfully!", {
          position: "top-center",
          autoClose: 2000,
          theme: "colored",
        });
        await GetUserDetails(); // Refresh data instead of reloading
      } else {
        throw new Error("Failed to generate codes");
      }
    } catch (error) {
      console.error("Error generating backup codes:", error);
      toast.error("Failed to generate backup codes. Please try again.", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setButtonLoading(false);
    }
  };

  // Fetch user details
  async function GetUserDetails() {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/Profile/GetUserDetails");
      setUserDetails(response.data);
      setLocalProfile({ file: "", url: response.data.profile || "" });
      const backupCodes = JSON.parse(response.data.backupCodes);
      setUsed(backupCodes.used || []);
      setUnused(backupCodes.unused || []);
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to load settings. Please try again.", {
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

  const buttonStyles = {
    backgroundColor: "primary.main",
    color: "background.paper",
    fontWeight: 600,
    textTransform: "none",
    py: 1,
    px: 3,
    borderRadius: 2,
    "&:hover": {
      backgroundColor: "primary.dark",
      transform: "scale(1.02)",
      transition: "all 0.2s ease",
    },
    "&:disabled": {
      backgroundColor: "action.disabledBackground",
      color: "action.disabled",
    },
  };

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
        <CircularProgress color="primary" aria-label="Loading settings" />
      </Box>
    );
  }

  return (
    <Container
      style={{
        maxWidth: 800,
        padding: 0,
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: "100%",
          bgcolor: "background.default",
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          p: { xs: 3, md: 5 },
          transition: "transform 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-5px)",
          },
        }}
        role="main"
        aria-labelledby="settings-title"
      >
        <Typography
          variant="h4"
          id="settings-title"
          sx={{
            fontFamily: "'Playfair Display', serif",
            color: "primary.main",
            textAlign: "center",
            mb: 4,
            fontWeight: 700,
          }}
        >
          Settings
        </Typography>

        {/* Profile Image Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            mb: 4,
          }}
        >
          <Tooltip title="Profile Picture" arrow>
            <Avatar
              src={profile.url}
              alt={`${userDetails?.name || "User"}'s profile picture`}
              sx={{
                width: { xs: 120, md: 150 },
                height: { xs: 120, md: 150 },
                bgcolor: "grey.300",
                border: "2px solid",
                borderColor: "primary.main",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            />
          </Tooltip>
          <input
            type="file"
            ref={profileRef}
            hidden
            onChange={handleProfileChange}
            accept="image/*"
            aria-label="Upload profile image"
          />
          {!save ? (
            <CustomButton
              text="Change Image"
              onClick={() => profileRef.current.click()}
              sx={buttonStyles}
              aria-label="Change profile image"
            />
          ) : (
            <CustomButton
              text="Save"
              onClick={handleSaveProfile}
              sx={buttonStyles}
              disabled={buttonLoading}
              startIcon={
                buttonLoading && <CircularProgress size={20} color="inherit" />
              }
              aria-label="Save profile image"
            />
          )}
        </Box>

        <Divider
          sx={{
            my: 4,
            borderColor: "primary.main",
            borderWidth: "1px",
          }}
        />

        {/* Backup Codes Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontFamily: "'Playfair Display', serif",
              color: "primary.main",
              fontWeight: 700,
            }}
          >
            Backup Codes
          </Typography>
          {unused.length === 0 && used.length === 0 ? (
            <Typography
              sx={{ color: "text.secondary", textAlign: "center", py: 2 }}
            >
              No backup codes available. Generate new codes to continue.
            </Typography>
          ) : (
            <Row className="g-3 justify-content-center">
              {unused.map((code, index) => (
                <Col key={`unused-${index}`} xs={6} md={3}>
                  <Tooltip title="Unused backup code" arrow>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "success.main",
                        color: "background.paper",
                        borderRadius: 2,
                        textAlign: "center",
                        fontWeight: 600,
                        fontSize: { xs: 14, md: 16 },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        transition: "transform 0.2s ease",
                        "&:hover": {
                          transform: "scale(1.02)",
                        },
                      }}
                      aria-label={`Unused backup code ${code}`}
                    >
                      <CheckCircleIcon fontSize="small" />
                      {code}
                    </Box>
                  </Tooltip>
                </Col>
              ))}
              {used.map((code, index) => (
                <Col key={`used-${index}`} xs={6} md={3}>
                  <Tooltip title="Used backup code" arrow>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "grey.500",
                        color: "background.paper",
                        borderRadius: 2,
                        textAlign: "center",
                        fontWeight: 600,
                        fontSize: { xs: 14, md: 16 },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        opacity: 0.7,
                      }}
                      aria-label={`Used backup code ${code}`}
                    >
                      <CancelIcon fontSize="small" />
                      {code}
                    </Box>
                  </Tooltip>
                </Col>
              ))}
            </Row>
          )}
          <Tooltip title="Generate new backup codes" arrow>
            <CustomButton
              text="Generate New"
              onClick={handleNewCodes}
              sx={buttonStyles}
              disabled={buttonLoading}
              startIcon={
                buttonLoading && <CircularProgress size={20} color="inherit" />
              }
              aria-label="Generate new backup codes"
            />
          </Tooltip>
        </Box>
      </Box>
      <ToastContainer />
    </Container>
  );
}

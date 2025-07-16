import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  CircularProgress,
  Container,
  Divider,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Grid2,
  Tooltip,
  IconButton,
  Input,
} from "@mui/material";
import { Edit, Upload } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../axiosConfig";
import { useNavigate } from "react-router-dom";

export default function UserHome() {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    file: "",
    url: "/assets/images/profile.jpg",
  });

  const navigate = useNavigate();

  // Fetch user details
  async function GetUserDetails() {
    try {
      const response = await axiosInstance.get("/User/GetUserDetails");
      setUserDetails(response.data);
      setProfile({
        file: "",
        url: response.data.profile || "/assets/images/profile.jpg",
      });
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

  // Handle profile picture upload (client-side preview and server-side upload)
  const handleProfileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // Client-side validation
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        toast.error("Only JPEG or PNG images are allowed.", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB.", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
        return;
      }

      const url = URL.createObjectURL(file);
      setProfile({ file, url });
      toast.success("Profile picture preview updated!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });

      // Server-side upload
      const formData = new FormData();
      formData.append("profilePicture", file);
      try {
        await axiosInstance.post("/User/UploadProfilePicture", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Profile picture uploaded successfully!", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
      } catch (error) {
        toast.error("Failed to upload profile picture. Please try again.", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
        setProfile((prev) => ({
          ...prev,
          url: userDetails?.profile || "/assets/images/profile.jpg",
        }));
      }
    }
  };

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
          bgcolor: "#F8FAFC",
        }}
        aria-live="polite"
      >
        <CircularProgress
          color="primary"
          size={40}
          aria-label="Loading user profile"
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: { xs: "100vh", lg: "80vh" },
        bgcolor: "#F8FAFC",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        py: 4,
      }}
      role="main"
      aria-labelledby="user-profile-title"
    >
      <Container
        sx={{
          bgcolor: "white",
          borderRadius: 8,
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
          p: { xs: 2, md: 3 },
          mt: 2,
          mb: 2,
          transition: "box-shadow 0.2s ease",
          "&:hover": {
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        <Grid2 container spacing={2}>
          <Grid2
            size={{ xs: 12, md: 5 }}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={profile.url}
                alt={`${userDetails?.name || "User"}'s profile picture`}
                sx={{
                  width: 180,
                  height: 180,
                  border: "3px solid #3B82F6",
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                  transition: "transform 0.2s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                  bgcolor: "#3B82F6",
                }}
              />
            </Box>
            <Grid2 container spacing={2} sx={{ mt: 2 }}>
              <Grid2 size={{ xs: 6 }}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 2,
                    backgroundColor: "background.default",
                    border: "1px solid black",
                    borderRadius: 8,
                    bgcolor: "#F9FAFB",
                    transition: "box-shadow 0.2s ease",
                    "&:hover": {
                      boxShadow: "0 4px 24px rgba(0, 0, 0, 0.15)",
                    },
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "#3B82F6", fontWeight: 600 }}
                  >
                    INITIATED
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ color: "#1E293B", fontWeight: 600 }}
                  >
                    {userDetails?.initiated ?? "N/A"}
                  </Typography>
                </Box>
              </Grid2>
              <Grid2 size={{ xs: 6 }}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 2,
                    backgroundColor: "background.default",
                    border: "1px solid black",
                    borderRadius: 8,
                    bgcolor: "#F9FAFB",
                    transition: "box-shadow 0.2s ease",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    },
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "#EC4899", fontWeight: 600 }}
                  >
                    INCOMPLETE
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ color: "#1E293B", fontWeight: 600 }}
                  >
                    {userDetails?.incomplete ?? "N/A"}
                  </Typography>
                </Box>
              </Grid2>
            </Grid2>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 7 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography
                variant="h4"
                id="user-profile-title"
                sx={{
                  fontWeight: 600,
                  color: "#1E293B",
                }}
              >
                {userDetails?.name || "Unknown User"}
              </Typography>
              <Tooltip title="Edit profile details">
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  aria-label="Edit profile"
                  onClick={() => navigate("/settings")}
                  sx={{
                    borderRadius: 6,
                    p: "8px 16px",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    bgcolor: "#3B82F6",
                    color: "white",
                    textTransform: "none",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "#1E40AF",
                      boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                    },
                  }}
                >
                  Edit
                </Button>
              </Tooltip>
            </Box>
            <Typography
              variant="body2"
              sx={{ color: "#4B5563", fontWeight: 500, mb: 2 }}
            >
              {userDetails?.location || "Jammu, Jammu"}
            </Typography>
            <Divider sx={{ my: 2, borderColor: "#E5E7EB" }} />
            <Table
              aria-label="User details table"
              sx={{
                bgcolor: "white",
                borderRadius: 6,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <TableBody>
                <TableRow>
                  <TableCell
                    sx={{
                      borderBottom: "1px solid #E5E7EB",
                      p: 1,
                      fontWeight: 600,
                      color: "#4B5563",
                    }}
                  >
                    Username
                  </TableCell>
                  <TableCell
                    sx={{
                      borderBottom: "1px solid #E5E7EB",
                      p: 1,
                      color: "#1E293B",
                      fontWeight: 500,
                    }}
                  >
                    {userDetails?.username || "N/A"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    sx={{
                      borderBottom: "1px solid #E5E7EB",
                      p: 1,
                      fontWeight: 600,
                      color: "#4B5563",
                    }}
                  >
                    Email
                  </TableCell>
                  <TableCell
                    sx={{
                      borderBottom: "1px solid #E5E7EB",
                      p: 1,
                      color: "#1E293B",
                      fontWeight: 500,
                      wordBreak: "break-word",
                    }}
                  >
                    {userDetails?.email || "N/A"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    sx={{
                      borderBottom: "1px solid #E5E7EB",
                      p: 1,
                      fontWeight: 600,
                      color: "#4B5563",
                    }}
                  >
                    Mobile Number
                  </TableCell>
                  <TableCell
                    sx={{
                      borderBottom: "1px solid #E5E7EB",
                      p: 1,
                      color: "#1E293B",
                      fontWeight: 500,
                    }}
                  >
                    {userDetails?.mobileNumber || "N/A"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Grid2>
        </Grid2>
        <ToastContainer
          toastStyle={{
            background: "white",
            color: "#1E293B",
            borderRadius: 6,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        />
      </Container>
    </Box>
  );
}

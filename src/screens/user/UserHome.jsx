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
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

const StyledContainer = styled(Container)(({ theme }) => ({
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.grey[100]})`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: `0 8px 32px ${theme.palette.grey[400]}`,
  padding: theme.spacing(4),
  [theme.breakpoints.down("md")]: {
    padding: theme.spacing(2),
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 200,
  height: 200,
  border: `4px solid ${theme.palette.primary.main}`,
  boxShadow: `0 4px 12px ${theme.palette.grey[500]}`,
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1, 2),
  fontWeight: 600,
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: `0 4px 12px ${theme.palette.primary.light}`,
  },
}));

const StatBox = styled(Box)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.grey[100],
  transition: "background-color 0.3s ease",
  "&:hover": {
    backgroundColor: theme.palette.grey[200],
  },
}));

export default function UserHome() {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    file: "",
    url: "/assets/images/profile.jpg",
  });

  const naviagate = useNavigate();

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

  // Handle profile picture upload (client-side preview)
  const handleProfileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfile({ file, url });
      toast.success("Profile picture updated!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
      // TODO: Implement server-side upload
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
          bgcolor: "background.default",
        }}
        aria-live="polite"
      >
        <CircularProgress color="primary" aria-label="Loading user profile" />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: { xs: "100vh", lg: "80vh" },
        bgcolor: "background.default",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        py: 4,
      }}
      role="main"
      aria-labelledby="user-profile-title"
    >
      <StyledContainer>
        <Grid2 container spacing={4}>
          <Grid2
            size={{ xs: 12, md: 5 }}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box position="relative">
              <StyledAvatar
                src={profile.url}
                alt={`${userDetails?.name || "User"}'s profile picture`}
              />
            </Box>
            <Grid2 container spacing={2} sx={{ mt: 2 }}>
              <Grid2 size={{ xs: 6 }}>
                <StatBox>
                  <Typography variant="subtitle1" color="text.secondary">
                    INITIATED
                  </Typography>
                  <Typography variant="h6" color="text.primary">
                    {userDetails?.initiated ?? "N/A"}
                  </Typography>
                </StatBox>
              </Grid2>
              <Grid2 size={{ xs: 6 }}>
                <StatBox>
                  <Typography variant="subtitle1" color="text.secondary">
                    INCOMPLETE
                  </Typography>
                  <Typography variant="h6" color="text.primary">
                    {userDetails?.incomplete ?? "N/A"}
                  </Typography>
                </StatBox>
              </Grid2>
            </Grid2>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 7 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography variant="h4" id="user-profile-title">
                {userDetails?.name || "Unknown User"}
              </Typography>
              <Tooltip title="Edit profile details">
                <StyledButton
                  variant="contained"
                  startIcon={<Edit />}
                  aria-label="Edit profile"
                  onClick={() => naviagate("/settings")}
                >
                  Edit
                </StyledButton>
              </Tooltip>
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {userDetails?.location || "Jammu,Jammu"}
            </Typography>
            <Divider sx={{ my: 2, borderColor: "grey.300" }} />
            <Table aria-label="User details table">
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      Username
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.primary">
                      {userDetails?.username || "N/A"}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ wordBreak: "break-word" }}
                    >
                      {userDetails?.email || "N/A"}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      Mobile Number
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.primary">
                      {userDetails?.mobileNumber || "N/A"}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Grid2>
        </Grid2>
        <ToastContainer />
      </StyledContainer>
    </Box>
  );
}

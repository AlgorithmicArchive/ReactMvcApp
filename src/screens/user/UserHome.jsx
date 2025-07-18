import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  CircularProgress,
  Divider,
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
import styled from "@emotion/styled";

const MainContainer = styled(Box)`
  min-height: 100vh;
  background: linear-gradient(180deg, #e6f0fa 0%, #b3cde0 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const ProfileCard = styled(Box)`
  background: #ffffff;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const StyledAvatar = styled(Avatar)`
  width: 120px;
  height: 120px;
  border: 3px solid #1e88e5;
  box-shadow: 0 4px 12px rgba(30, 136, 229, 0.3);
  transition: transform 0.3s ease;
  margin: 0 auto;
  &:hover {
    transform: scale(1.1);
  }
`;

const UploadButton = styled(IconButton)`
  background: #1e88e5;
  color: #ffffff;
  position: absolute;
  bottom: -8px;
  right: -8px;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  &:hover {
    background: #1565c0;
    transform: scale(1.1);
  }
`;

const StatContainer = styled(Box)`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin: 1.5rem 0;
`;

const StatBox = styled(Box)`
  flex: 1;
  background: #e6f0fa;
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
  border: 1px solid #b3cde0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const InfoItem = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #b3cde0;
  &:last-of-type {
    border-bottom: none;
  }
`;

const ActionButton = styled(Button)`
  background: linear-gradient(45deg, #1e88e5, #4fc3f7);
  color: #ffffff;
  font-weight: 600;
  text-transform: none;
  border-radius: 10px;
  padding: 0.75rem 2rem;
  margin-top: 1.5rem;
  width: 100%;
  transition: all 0.3s ease;
  &:hover {
    background: linear-gradient(45deg, #1565c0, #039be5);
    box-shadow: 0 4px 12px rgba(30, 136, 229, 0.3);
  }
`;

export default function UserHome() {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    file: "",
    url: "/assets/images/profile.jpg",
  });

  const navigate = useNavigate();

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
          bgcolor: "#ffd7c4",
        }}
        aria-live="polite"
      >
        <CircularProgress
          color="inherit"
          size={40}
          sx={{ color: "#8b5cf6" }}
          aria-label="Loading user profile"
        />
      </Box>
    );
  }

  return (
    <MainContainer>
      <ProfileCard>
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Box sx={{ position: "relative", display: "inline-block" }}>
            <StyledAvatar
              src={profile.url}
              alt={`${userDetails?.name || "User"}'s profile picture`}
            />
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#1f2937",
              fontFamily: "'Inter', sans-serif",
              mt: 2,
            }}
            id="user-profile-title"
          >
            {userDetails?.name || "Unknown User"}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#6b7280", fontWeight: 500 }}
          >
            {userDetails?.location || "Jammu, Jammu"}
          </Typography>
        </Box>
        <Divider sx={{ my: 2, borderColor: "#e5e7eb" }} />
        <StatContainer>
          <StatBox>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: "#8b5cf6" }}
            >
              INITIATED
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1f2937" }}>
              {userDetails?.initiated ?? "N/A"}
            </Typography>
          </StatBox>
          <StatBox>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: "#ec4899" }}
            >
              INCOMPLETE
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1f2937" }}>
              {userDetails?.incomplete ?? "N/A"}
            </Typography>
          </StatBox>
        </StatContainer>
        <Divider sx={{ my: 2, borderColor: "#e5e7eb" }} />
        <Box>
          <InfoItem>
            <Typography
              variant="body1"
              sx={{ fontWeight: 600, color: "#6b7280" }}
            >
              Username
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontWeight: 500, color: "#1f2937" }}
            >
              {userDetails?.username || "N/A"}
            </Typography>
          </InfoItem>
          <InfoItem>
            <Typography
              variant="body1"
              sx={{ fontWeight: 600, color: "#6b7280" }}
            >
              Email
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 500,
                color: "#1f2937",
                wordBreak: "break-word",
              }}
            >
              {userDetails?.email || "N/A"}
            </Typography>
          </InfoItem>
          <InfoItem>
            <Typography
              variant="body1"
              sx={{ fontWeight: 600, color: "#6b7280" }}
            >
              Mobile Number
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontWeight: 500, color: "#1f2937" }}
            >
              {userDetails?.mobileNumber || "N/A"}
            </Typography>
          </InfoItem>
        </Box>
        <ActionButton
          variant="contained"
          startIcon={<Edit />}
          aria-label="Edit profile"
          onClick={() => navigate("/settings")}
        >
          Edit Profile
        </ActionButton>
      </ProfileCard>
      <ToastContainer
        toastStyle={{
          background: "white",
          color: "#1f2937",
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      />
    </MainContainer>
  );
}

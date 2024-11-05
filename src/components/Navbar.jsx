import React, { useContext, useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Menu,
  MenuItem,
  Box,
  Avatar,
  IconButton,
  Typography,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";

const Navbar = () => {
  const navigate = useNavigate();
  const {
    userType,
    setUserType,
    setToken,
    setUsername,
    setProfile,
    username,
    profile,
  } = useContext(UserContext);

  // Separate anchor states for each menu
  const [statusAnchorEl, setStatusAnchorEl] = useState(null); // Application status anchor
  const [profileAnchorEl, setProfileAnchorEl] = useState(null); // Profile anchor

  // Handle Logout
  const handleLogout = () => {
    setToken(null);
    setUserType(null);
    setUsername(null);
    setProfile(null);
    localStorage.clear(); // Clear all localStorage on logout
    navigate("/login");
  };

  // Handlers for Application Status menu
  const handleStatusMenuClick = (event) => {
    setStatusAnchorEl(event.currentTarget);
  };

  const handleStatusMenuClose = () => {
    setStatusAnchorEl(null);
  };

  // Handlers for Profile menu
  const handleProfileMenuClick = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        top: "185px",
        zIndex: 1100,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "background.paper",
          boxShadow: "none",
          color: "primary.main",
          gap: 10,
        }}
      >
        {!userType && (
          <>
            <Button
              color="inherit"
              sx={{ fontWeight: "bold" }}
              component={Link}
              to="/"
            >
              Home
            </Button>
            <Button
              color="inherit"
              sx={{ fontWeight: "bold" }}
              component={Link}
              to="/login"
            >
              Login
            </Button>
            <img
              src="/assets/images/logo.png"
              alt="Logo"
              style={{ width: "80px" }}
            />
            <Button
              color="inherit"
              sx={{ fontWeight: "bold" }}
              component={Link}
              to="/register"
            >
              Register
            </Button>
          </>
        )}

        {userType === "Citizen" && (
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
            {/* Central buttons for Citizen */}
            <Box
              sx={{ display: "flex", justifyContent: "center",gap:10, flexGrow: 1 }}
            >
              <Button
                color="inherit"
                sx={{ fontWeight: "bold" }}
                component={Link}
                to="/user/home"
              >
                Home
              </Button>
              <Button
                color="inherit"
                sx={{ fontWeight: "bold" }}
                component={Link}
                to="/user/services"
              >
                Apply for Service
              </Button>
              <Button
                color="inherit"
                sx={{ fontWeight: "bold" }}
                onClick={handleStatusMenuClick} // Application Status handler
              >
                Application Status
              </Button>
              {/* Menu for Application Status */}
              <Menu
                anchorEl={statusAnchorEl} // Ensure anchorEl is valid
                open={Boolean(statusAnchorEl)}
                onClose={handleStatusMenuClose}
              >
                <MenuItem onClick={() => navigate("/user/initiated")}>
                  Initiated Applications
                </MenuItem>
                <MenuItem onClick={() => navigate("/user/incomplete")}>
                  Incomplete Applications
                </MenuItem>
              </Menu>
            </Box>

            {/* Right-side profile image with dropdown menu */}
            <Box sx={{ marginLeft: "auto", display: "flex", gap: 5, alignItems: "center" }}>
              <Typography sx={{ color: "primary.main", fontWeight: "bold" }}>
                {username}
              </Typography>
              <IconButton
                onClick={handleProfileMenuClick} // Profile menu handler
                sx={{ p: 0 }}
              >
                <Avatar
                  alt={username}
                  src={profile || "/default-avatar.png"} // Ensure avatar URL or default
                />
              </IconButton>
              {/* Menu for Profile and Logout */}
              <Menu
                anchorEl={profileAnchorEl} // Ensure anchorEl is valid for profile menu
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
              >
                <MenuItem onClick={() => navigate("/profile")}>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          </Box>
        )}

        {userType === "Officer" && (
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
            {/* Central buttons for Officer */}
            <Box
              sx={{ display: "flex", justifyContent: "center",gap:10, flexGrow: 1 }}
            >
              <Button
                color="inherit"
                sx={{ fontWeight: "bold" }}
                component={Link}
                to="/officer/home"
              >
                Home
              </Button>
              <Button
                color="inherit"
                sx={{ fontWeight: "bold" }}
                component={Link}
                to="/officer/reports"
              >
                Reports
              </Button>
              <Button
                color="inherit"
                sx={{ fontWeight: "bold" }}
                onClick={handleStatusMenuClick} // DSC Management handler
              >
                DSC Management
              </Button>
              {/* Menu for Officer-specific actions */}
              <Menu
                anchorEl={statusAnchorEl}
                open={Boolean(statusAnchorEl)}
                onClose={handleStatusMenuClose}
              >
                <MenuItem onClick={() => navigate("/officer/registerDSC")}>
                  Register DSC
                </MenuItem>
                <MenuItem onClick={() => navigate("/officer/unregisterDSC")}>
                  Unregister DSC
                </MenuItem>
              </Menu>
            </Box>

            {/* Right-side profile image with dropdown menu */}
            <Box sx={{ marginLeft: "auto", display: "flex", gap: 5, alignItems: "center" }}>
              <Typography sx={{ color: "primary.main", fontWeight: "bold" }}>
                {username}
              </Typography>
              <IconButton
                onClick={handleProfileMenuClick}
                sx={{ p: 0 }}
              >
                <Avatar
                  alt={username}
                  src={profile || "/default-avatar.png"} // Profile image
                />
              </IconButton>
              {/* Menu for Profile and Logout */}
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
              >
                <MenuItem onClick={() => navigate("/profile")}>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          </Box>
        )}

        {userType === "Admin" && (
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
            {/* Central buttons for Admin */}
            <Box
              sx={{ display: "flex", justifyContent: "center",gap:10, flexGrow: 1 }}
            >
              <Button
                color="inherit"
                sx={{ fontWeight: "bold" }}
                component={Link}
                to="/admin/home"
              >
                Dashboard
              </Button>
              <Button
                color="inherit"
                sx={{ fontWeight: "bold" }}
                component={Link}
                to="/admin/manageUsers"
              >
                Manage Users
              </Button>
              <Button
                color="inherit"
                sx={{ fontWeight: "bold" }}
                onClick={handleStatusMenuClick} // Admin Actions handler
              >
                Admin Actions
              </Button>
              {/* Menu for Admin-specific actions */}
              <Menu
                anchorEl={statusAnchorEl}
                open={Boolean(statusAnchorEl)}
                onClose={handleStatusMenuClose}
              >
                <MenuItem onClick={() => navigate("/admin/reports")}>
                  View Reports
                </MenuItem>
                <MenuItem onClick={() => navigate("/admin/settings")}>
                  Settings
                </MenuItem>
              </Menu>
            </Box>

            {/* Right-side profile image with dropdown menu */}
            <Box sx={{ marginLeft: "auto", display: "flex", gap: 5, alignItems: "center" }}>
              <Typography sx={{ color: "primary.main", fontWeight: "bold" }}>
                {username}
              </Typography>
              <IconButton
                onClick={handleProfileMenuClick}
                sx={{ p: 0 }}
              >
                <Avatar
                  alt={username}
                  src={profile || "/default-avatar.png"} // Profile image
                />
              </IconButton>
              {/* Menu for Profile and Logout */}
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
              >
                <MenuItem onClick={() => navigate("/profile")}>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

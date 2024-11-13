import React, { useContext, useState, useEffect } from "react";
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
    designation,
    verified,
    setVerified,
  } = useContext(UserContext);

  // Separate anchor states for each menu
  const [statusAnchorEl, setStatusAnchorEl] = useState(null); // Application status anchor
  const [profileAnchorEl, setProfileAnchorEl] = useState(null); // Profile anchor
  const [manageAnchorEl, setManageAnchorEl] = useState(null); // Manage Users anchor

  // Reset anchor elements when userType changes to prevent invalid anchorEl
  useEffect(() => {
    setStatusAnchorEl(null);
    setProfileAnchorEl(null);
    setManageAnchorEl(null); // Reset Manage Users menu
  }, [userType]);

  // Handle Logout
  const handleLogout = () => {
    setToken(null);
    setUserType(null);
    setUsername(null);
    setProfile(null);
    setVerified(false);
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

  // Handlers for Manage Users menu
  const handleManageMenuClick = (event) => {
    setManageAnchorEl(event.currentTarget);
  };

  const handleManageMenuClose = () => {
    setManageAnchorEl(null);
  };

  return (
    <AppBar position="fixed" sx={{ top: "185px", zIndex: 1100 }}>
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
        {!userType && !verified && (
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

        {userType === "Citizen" && verified && (
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 10,
                flexGrow: 1,
              }}
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
                onClick={handleStatusMenuClick}
              >
                Application Status
              </Button>
              <Menu
                anchorEl={statusAnchorEl}
                open={Boolean(statusAnchorEl)}
                onClose={handleStatusMenuClose}
              >
                <MenuItem
                  onClick={() => {
                    navigate("/user/initiated");
                    handleStatusMenuClose(); // Close menu after selection
                  }}
                >
                  Initiated Applications
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    navigate("/user/incomplete");
                    handleStatusMenuClose(); // Close menu after selection
                  }}
                >
                  Incomplete Applications
                </MenuItem>
              </Menu>
            </Box>

            <Box
              sx={{
                marginLeft: "auto",
                display: "flex",
                gap: 5,
                alignItems: "center",
              }}
            >
              <Typography sx={{ color: "primary.main", fontWeight: "bold" }}>
                {username}
              </Typography>
              <IconButton onClick={handleProfileMenuClick} sx={{ p: 0 }}>
                <Avatar
                  alt={String(username)}
                  src={profile || "/default-avatar.png"}
                />
              </IconButton>
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
              >
                <MenuItem
                  onClick={() => {
                    navigate("/settings");
                    handleProfileMenuClose(); // Close menu after selection
                  }}
                >
                  Settings
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          </Box>
        )}

        {userType === "Officer" && verified && (
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 10,
                flexGrow: 1,
              }}
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
              {/* New "Manage Bank File*/}
              {designation == "Director Finance" && (
                <>
                  <Button
                    color="inherit"
                    sx={{ fontWeight: "bold" }}
                    onClick={handleManageMenuClick}
                  >
                    Manage Bank File
                  </Button>
                  <Menu
                    anchorEl={manageAnchorEl}
                    open={Boolean(manageAnchorEl)}
                    onClose={handleManageMenuClose}
                  >
                    <MenuItem
                      onClick={() => {
                        navigate("/officer/bankFile");
                        handleManageMenuClose(); // Close menu after selection
                      }}
                    >
                      Create Bank File
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        navigate("/officer/responseFile");
                        handleManageMenuClose(); // Close menu after selection
                      }}
                    >
                      Check Response File
                    </MenuItem>
                  </Menu>

                  <Button
                    color="inherit"
                    sx={{ fontWeight: "bold" }}
                    onClick={handleStatusMenuClick}
                  >
                    DSC Management
                  </Button>
                  <Menu
                    anchorEl={statusAnchorEl}
                    open={Boolean(statusAnchorEl)}
                    onClose={handleStatusMenuClose}
                  >
                    <MenuItem
                      onClick={() => {
                        navigate("/officer/registerDSC");
                        handleStatusMenuClose(); // Close menu after selection
                      }}
                    >
                      Register DSC
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        navigate("/officer/unregisterDSC");
                        handleStatusMenuClose(); // Close menu after selection
                      }}
                    >
                      Unregister DSC
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
            <Box
              sx={{
                marginLeft: "auto",
                display: "flex",
                gap: 5,
                alignItems: "center",
              }}
            >
              <Typography sx={{ color: "primary.main", fontWeight: "bold" }}>
                {username}
              </Typography>
              <IconButton onClick={handleProfileMenuClick} sx={{ p: 0 }}>
                <Avatar
                  alt={String(username)}
                  src={profile || "/default-avatar.png"}
                />
              </IconButton>
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
              >
                <MenuItem
                  onClick={() => {
                    navigate("/settings");
                    handleProfileMenuClose(); // Close menu after selection
                  }}
                >
                  Settings
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          </Box>
        )}

        {userType === "Admin" && verified && (
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 10,
                flexGrow: 1,
              }}
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
                onClick={handleStatusMenuClick}
              >
                Reports
              </Button>
              <Menu
                anchorEl={statusAnchorEl}
                open={Boolean(statusAnchorEl)}
                onClose={handleStatusMenuClose}
              >
                <MenuItem
                  onClick={() => {
                    navigate("/admin/individual");
                    handleStatusMenuClose(); // Close menu after selection
                  }}
                >
                  Individual Report
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    navigate("/admin/history");
                    handleStatusMenuClose(); // Close menu after selection
                  }}
                >
                  History
                </MenuItem>
              </Menu>
            </Box>

            <Box
              sx={{
                marginLeft: "auto",
                display: "flex",
                gap: 5,
                alignItems: "center",
              }}
            >
              <Typography sx={{ color: "primary.main", fontWeight: "bold" }}>
                {username}
              </Typography>
              <IconButton onClick={handleProfileMenuClick} sx={{ p: 0 }}>
                <Avatar
                  alt={String(username)}
                  src={profile || "/default-avatar.png"}
                />
              </IconButton>
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
              >
                <MenuItem
                  onClick={() => {
                    navigate("/settings");
                    handleProfileMenuClose(); // Close menu after selection
                  }}
                >
                  Settings
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

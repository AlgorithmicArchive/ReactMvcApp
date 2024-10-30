import React, { useContext, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { userType, setUserType, setToken } = useContext(UserContext);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    setToken(null);
    setUserType(null);
    navigate("/login");
  };

  const handleDropdownClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
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
          <>
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
              onClick={handleDropdownClick}
            >
              Application Status
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleDropdownClose}
            >
              <MenuItem onClick={() => navigate("/user/initiated")}>
                Initiated Applications
              </MenuItem>
              <MenuItem onClick={() => navigate("/user/incomplete")}>
                Incomplet Applications
              </MenuItem>
            </Menu>
            <Button
              color="inherit"
              sx={{ fontWeight: "bold" }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </>
        )}

        {userType === "Officer" && (
          <>
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
              onClick={handleDropdownClick}
            >
              DSC Management
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleDropdownClose}
            >
              <MenuItem onClick={() => navigate("/officer/registerDSC")}>
                Register DSC
              </MenuItem>
              <MenuItem onClick={() => navigate("/officer/unregisterDSC")}>
                Unregister DSC
              </MenuItem>
            </Menu>
            <Button
              color="inherit"
              sx={{ fontWeight: "bold" }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </>
        )}

        {/* Add similar blocks for 'Officer' and 'Admin' userTypes if needed */}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

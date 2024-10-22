import React, { useContext } from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import { UserContext } from "../UserContext";

const Navbar = () => {
  const handleScrollToSection3 = () => {
    const scrollEvent = new CustomEvent("scrollToSection", {
      detail: "section3",
    });
    window.dispatchEvent(scrollEvent);
  };

  const { userType } = useContext(UserContext);
  return (
    <AppBar
      position="fixed"
      sx={{
        top: "185px", // Adjust the top position based on the height of the Header
        zIndex: 1100, // Ensure it's below the header but above the content
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
            <Button
              color="inherit"
              sx={{ fontWeight: "bold" }}
              onClick={handleScrollToSection3}
            >
              Contact Us
            </Button>
          </>
        )}

        {userType == "Citizen" &&
        <>
           <Button
              color="inherit"
              sx={{ fontWeight: "bold" }}
              component={Link}
              to="/user"
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
        </>
        }
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

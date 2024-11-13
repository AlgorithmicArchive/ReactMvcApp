import React from "react";
import { Box, Typography, Button, Grid2 } from "@mui/material";
import GoogleTranslateWidget from "./GoogleTranslateWidget"; // Import the Google Translate Widget
import Grid from "@mui/material/Grid2";

const Header = () => {
  return (
    <Box
      sx={{
        padding: "0 0",
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 1200,
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
      }}
      className="notranslate"
    >
      {/* Top Bar */}

      <Grid
        container
        spacing={2}
        width={"100%"}
        sx={{ backgroundColor: "purple" }}
      >
        <Grid xs={6} width={"100%"} sx={{ backgroundColor: "red" }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: "bold",
                display: "flex",
                gap: "10px",
                color: "primary.main",
              }}
            >
              <span>जम्मू और कश्मीर सरकार</span>
              <span>GOVERNMENT OF JAMMU AND KASHMIR</span>
              <span>حکومت جموں و کشمیر</span>
            </Typography>
          </Box>
        </Grid>
        <Grid
          width={"100%"}
          xs={6}
          sx={{
            backgroundColor: "blue",
            display: "flex",
            justifyContent: "end",
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "flex-end",
              gap: "15px",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Typography sx={{ fontSize: "18px", fontWeight: "bold" }}>
                A
              </Typography>
              <Typography sx={{ fontSize: "16px" }}>A</Typography>
            </Box>
            {/* Replace the Select dropdown with the Google Translate Widget */}
            <GoogleTranslateWidget />
          </Box>
        </Grid>
      </Grid>

      {/* Main Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "100px",
          padding: "20px 20px",
          backgroundColor: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <img
            src="/assets/images/emblem.png"
            alt="Gov Emblem"
            style={{ height: "100px" }}
          />
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              fontWeight: "bold",
              color: "background.default",
            }}
          >
            समाज कल्याण विभाग
            <br />
            DEPARTMENT OF SOCIAL WELFARE
            <br />
            محکمہ سوشیل ویلفیئر
          </Typography>
        </Box>
        <Box>
          <img
            src="/assets/images/swach-bharat.png"
            alt="Swachh Bharat"
            style={{ height: "80px" }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Header;

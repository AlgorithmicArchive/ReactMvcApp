import React from "react";
import {
  Box,
  Typography,
  Container,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import GoogleTranslateWidget from "./GoogleTranslateWidget";
import MyNavbar from "./Navbar";

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box sx={{ width: "100%", height: "30vh" }}>
      {/* Top Row */}
      <Box sx={{ borderBottom: "2px solid #333333" }}>
        <Container>
          <Box
            sx={{
              backgroundColor: "#FFFFFF",
              color: "#333333",
              py: 1,
              px: { xs: 2, md: 6 },
              display: { xs: "none", md: "flex" },
              justifyContent: "center",
              alignItems: "center",
              gap: 3,
            }}
            translate="no" // Prevent translation
            className="notranslate" // Fallback for compatibility
          >
            <Typography>जम्मू और कश्मीर सरकार</Typography>
            <Typography>GOVERNMENT OF JAMMU AND KASHMIR</Typography>
            <Typography>حکومت جموں و کشمیر</Typography>

            <Box
              sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 3 }}
            >
              <Typography sx={{ fontSize: "18px", fontWeight: "bold" }}>
                Aa
              </Typography>
              <GoogleTranslateWidget />
            </Box>
          </Box>
        </Container>
      </Box>
      {/* Middle Row */}
      <Box sx={{ borderBottom: "2px solid #333333" }}>
        <Container>
          <Box
            sx={{
              backgroundColor: "#FFFFFF",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 1,
              px: { xs: 2, md: 6 },
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 2, md: 0 },
            }}
            translate="no" // Prevent translation
            className="notranslate" // Fallback for compatibility
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "center", md: "flex-start" },
                alignItems: "center",
                gap: 2,
                flexDirection: { xs: "column", md: "row" },
              }}
            >
              <Box
                component="img"
                src="/assets/images/emblem.png"
                alt="Gov Emblem"
                sx={{ width: { xs: "15vw", md: "5vw" }, maxWidth: "80px" }}
              />
              <Typography
                variant="h6"
                sx={{
                  textAlign: "center",
                  fontWeight: "bold",
                  color: "text.primary",
                  fontSize: { xs: "1rem", md: "1.25rem" },
                }}
              >
                समाज कल्याण विभाग
                <br />
                DEPARTMENT OF SOCIAL WELFARE
                <br />
                محکمہ سوشیل ویلفیئر
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "center", md: "flex-end" },
                alignItems: "center",
              }}
            >
              <Box
                component="img"
                src="/assets/images/swach-bharat.png"
                alt="Swachh Bharat"
                sx={{ height: { xs: "80px", md: "100px" } }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Navbar Row */}
      <Box>
        <MyNavbar />
      </Box>
    </Box>
  );
};

export default Header;

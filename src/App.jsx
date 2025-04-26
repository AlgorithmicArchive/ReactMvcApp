import React, { useContext, useEffect, useState } from "react";
import { BrowserRouter as Router, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Container, Box } from "@mui/material";
import { GovSoftTheme, TwilightBlossom } from "./themes/TwilightBlossom";
import RoutesComponent from "./components/RoutesComponent"; // Import the RoutesComponent
import Header from "./components/Header";
import { UserProvider, UserContext } from "./UserContext";
import ScrollToTop from "./components/ScrollToTop";
import Footer from "./components/Footer";

const App = () => {
  return (
    <ThemeProvider theme={GovSoftTheme}>
      <UserProvider>
        <CssBaseline /> {/* Normalize CSS across browsers */}
        <Router>
          <ScrollToTop />
          <Header />
          <MainContent />
          <Footer />
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
};

const MainContent = () => {
  const { token, userType, verified } = useContext(UserContext);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const isInitialLoad = sessionStorage.getItem("initialLoad") === null;

    if (isInitialLoad) {
      if (token && !verified) {
        navigate("/Verification");
      } else if (token && verified) {
        if (userType === "Citizen") {
          navigate("/user/home");
        } else if (userType === "Officer") {
          navigate("/officer/home");
        } else if (userType === "Admin") {
          navigate("/admin/home");
        }
      }
      sessionStorage.setItem("initialLoad", false);
    }
  }, [token, userType, verified, isInitialLoad]);

  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      <RoutesComponent />
    </Box>
  );
};

export default App;

import React, { useContext, useEffect, useState } from "react";
import { BrowserRouter as Router, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Container, Box } from "@mui/material";
import { TwilightBlossom } from "./themes/TwilightBlossom";
import RoutesComponent from "./components/RoutesComponent"; // Import the RoutesComponent
import Header from "./components/Header";
import { UserProvider, UserContext } from "./UserContext";

const App = () => {
  return (
    <ThemeProvider theme={TwilightBlossom}>
      <UserProvider>
        <CssBaseline /> {/* Normalize CSS across browsers */}
        <Router>
          <Header />
          <MainContent />
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
        width: "100vw",
        backgroundColor: "background.default",
        marginTop: {
          xs: "10vh", // Extra-small screens (default, below sm)
          md: "30vh", // Medium screens (900px and up)
        },
      }}
    >
      <RoutesComponent />
    </Box>
  );
};

export default App;

import React, { useContext, useEffect, useState } from "react";
import { BrowserRouter as Router, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Container } from "@mui/material";
import { TwilightBlossom } from "./themes/TwilightBlossom";
import RoutesComponent from "./components/RoutesComponent"; // Import the RoutesComponent
import Navbar from "./components/Navbar"; // Import the Navbar component
import Header from "./components/Header";
import { UserProvider, UserContext } from "./UserContext";

const App = () => {
  return (
    <ThemeProvider theme={TwilightBlossom}>
      <UserProvider>
        <CssBaseline /> {/* Normalize CSS across browsers */}
        <Router>
          <Header />
          <Navbar /> {/* Render the Navbar */}
          <MainContent />{" "}
          {/* Handle routing and redirection in a separate component */}
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
    <Container
      disableGutters
      maxWidth={false}
      sx={{
        top: "250px",
        width: "100%",
        backgroundColor: "background.default",
        paddingTop: "150px",
      }}
    >
      <RoutesComponent />
    </Container>
  );
};

export default App;

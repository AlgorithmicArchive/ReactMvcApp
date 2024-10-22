import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container } from '@mui/material';
import { TwilightBlossom } from './themes/TwilightBlossom';
import RoutesComponent from './components/RoutesComponent'; // Import the RoutesComponent
import Navbar from './components/Navbar'; // Import the Navbar component
import Header from './components/Header';
import { UserProvider } from './UserContext';

const App = () => {
  return (
    <ThemeProvider theme={TwilightBlossom}>
        <UserProvider>
          <CssBaseline /> {/* Normalize CSS across browsers */}
          <Router>
            <Header/>
            <Navbar /> {/* Render the Navbar */}
            <Container disableGutters maxWidth={false} sx={{top:'250px',width:'100%',backgroundColor:'background.default',paddingTop:'150px'}}>
                <RoutesComponent /> {/* Render the routing component */}
            </Container>
          </Router>
        </UserProvider>
    </ThemeProvider>
  );
};

export default App;

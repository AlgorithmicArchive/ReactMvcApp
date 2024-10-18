import { createTheme } from '@mui/material/styles';

// Define the TwilightBlossom theme for Material-UI
export const TwilightBlossom = createTheme({
  palette: {
    mode: 'dark', // Dark mode
    primary: {
      main: '#F0C38E', // Primary color
    },
    background: {
      default: '#48426D', // Background color
      paper: '#312C51', // Paper (card) background color
    },
    text: {
      primary: '#F1AA9B', // Text color
    },
    divider: '#312C51', // Divider color
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0, // Remove body margin
          padding: 0, // Remove body padding
          overflowX: 'hidden', // Prevent horizontal overflow
        },
        html: {
          margin: 0,
          padding: 0,
          height: '100%',
        },
        '*': {
          boxSizing: 'border-box', // Ensure box-sizing is border-box for all elements
        },
      },
    },
  },
});

import { createTheme } from "@mui/material/styles";

export const TwilightBlossom = createTheme({
  palette: {
    mode: "dark", // Dark mode
    primary: {
      main: "#F0C38E", // Primary color
    },
    background: {
      default: "#48426D", // Background color
      paper: "#312C51", // Paper (card) background color
    },
    text: {
      primary: "#F1AA9B", // Text color
    },
    divider: "#312C51", // Divider color
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0, // Remove body margin
          padding: 0, // Remove body padding
          overflowX: "hidden", // Prevent horizontal overflow
        },
        html: {
          margin: 0,
          padding: 0,
          height: "100%",
        },
        "*": {
          boxSizing: "border-box", // Ensure box-sizing is border-box for all elements
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "none", // Remove shadow
          backgroundImage: "none", // Remove overlay gradient
        },
      },
    },
  },
});

export const GovSoftTheme = createTheme({
  palette: {
    mode: "light", // Light mode for better contrast with soft tones
    primary: {
      main: "#D2946A", // Warm Muted Orange for buttons and highlights
    },
    background: {
      default: "#EFEAE4", // Soft Beige main background
      paper: "#F9F7F4", // Very Light Beige card background
    },
    text: {
      primary: "#333333", // Dark Gray for readable text
      secondary: "#999999", // Soft Gray for placeholders and muted text
    },
    divider: "#D8D8D8", // Light Gray divider
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          overflowX: "hidden",
          backgroundColor: "transparent", // Ensure body background matches theme
          color: "#333333",
          fontFamily: "'Roboto', 'Segoe UI', sans-serif", // Clean, readable font
        },
        html: {
          margin: 0,
          padding: 0,
          height: "100%",
        },
        "*": {
          boxSizing: "border-box",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          backgroundImage: "none",
          backgroundColor: "#F9F7F4", // Override to match soft card background
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", // Remove uppercase transform
          borderRadius: "8px", // Smooth rounded corners
        },
      },
    },
  },
});

export const SoftSerenity = createTheme({
  palette: {
    mode: "light", // Light mode
    primary: {
      main: "#6D9DC5", // Soft blue for a calming effect
    },
    secondary: {
      main: "#F4A261", // Warm peach accent
    },
    background: {
      default: "#F8F9FA", // Light, airy background
      paper: "#FFFFFF", // Clean white card background
    },
    text: {
      primary: "#374151", // Deep gray for readability
      secondary: "#6B7280", // Softer gray for secondary text
    },
    divider: "#E5E7EB", // Light gray divider
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          overflowX: "hidden",
          backgroundColor: "#F8F9FA", // Ensure consistent background
        },
        html: {
          margin: 0,
          padding: 0,
          height: "100%",
        },
        "*": {
          boxSizing: "border-box",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          backgroundImage: "none",
        },
      },
    },
  },
});

export const VibrantDream = createTheme({
  palette: {
    mode: "light", // Light mode
    primary: {
      main: "#A100FF", // Bold purple
    },
    secondary: {
      main: "#DB97FF", // Soft lavender accent
    },
    background: {
      default: "#9FFBFB", // Light cyan background
      paper: "#FFB6FF", // Soft pink card background
    },
    text: {
      primary: "#2D2D2D", // Dark gray for readability
      secondary: "#5C5C5C", // Softer gray for secondary text
    },
    divider: "#DB97FF", // Lavender divider
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          overflowX: "hidden",
          backgroundColor: "#9FFBFB", // Ensure consistent background
        },
        html: {
          margin: 0,
          padding: 0,
          height: "100%",
        },
        "*": {
          boxSizing: "border-box",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          backgroundImage: "none",
        },
      },
    },
  },
});

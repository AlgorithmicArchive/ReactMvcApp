import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  Avatar,
  TextField,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/system";
import {
  AssignmentTurnedIn,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Group,
  TrendingUp,
  AccountBalanceWallet,
  MonetizationOn,
  ErrorOutline,
  EmojiEvents,
} from "@mui/icons-material";
import { Col, Row } from "react-bootstrap";
import axiosInstance from "../../axiosConfig";

// Mock function to simulate dashboard data API response
const mockDashboardData = (params) => {
  const { state, division, district, tehsil } = params;
  let multiplier = 1;

  // Determine multiplier based on the most specific filter selected
  if (tehsil != null) multiplier = 0.1; // Smallest scope
  else if (district != null) multiplier = 0.2;
  else if (division != null) multiplier = 0.5;
  else if (state != null && state !== "") multiplier = 1; // Largest scope

  // Modify default data based on the multiplier
  return defaultCardData.map((card) => {
    let newValue;
    if (card.value.startsWith("₹")) {
      // Handle currency values
      const amount = parseInt(card.value.replace(/[^0-9]/g, ""), 10);
      newValue = `₹${Math.round(amount * multiplier).toLocaleString()}`;
    } else {
      // Handle numerical values
      const num = parseInt(card.value.replace(/[^0-9]/g, ""), 10);
      newValue = Math.round(num * multiplier).toString();
    }
    return { ...card, value: newValue };
  });
};

// Mock axios instance for dashboard data only
const mockAxiosInstance = {
  get: (url, config) => {
    if (url === "/api/dashboard/stats") {
      console.log(
        "Mock API call for dashboard stats with params:",
        config.params
      );
      return Promise.resolve({ data: mockDashboardData(config.params) });
    }
    // Use real axiosInstance for other endpoints
    return axiosInstance.get(url, config);
  },
};

const DashboardCard = styled(Card)(({ theme }) => ({
  minWidth: 200,
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
}));

// Default data used as a base for mock dashboard data
const defaultCardData = [
  {
    title: "Applications Received",
    value: "1,234",
    icon: <AssignmentTurnedIn />,
    cardColor: "#1976D2",
    textColor: "#FFFFFF",
  },
  {
    title: "Sanctioned",
    value: "856",
    icon: <CheckCircle />,
    cardColor: "#388E3C",
    textColor: "#FFFFFF",
  },
  {
    title: "Under Process",
    value: "200",
    icon: <HourglassEmpty />,
    cardColor: "#FBC02D",
    textColor: "#212121",
  },
  {
    title: "Pending with Citizen",
    value: "20",
    icon: <Group />,
    cardColor: "#7B1FA2",
    textColor: "#FFFFFF",
  },
  {
    title: "Rejected",
    value: "178",
    icon: <Cancel />,
    cardColor: "#D32F2F",
    textColor: "#FFFFFF",
  },
  {
    title: "Total Amount Disbursed (Latest Month)",
    value: "₹5,67,89,000",
    icon: <MonetizationOn />,
    cardColor: "#00897B",
    textColor: "#FFFFFF",
  },
  {
    title: "New Sanctions (After Latest Disbursements)",
    value: "320",
    icon: <TrendingUp />,
    cardColor: "#4CAF50",
    textColor: "#FFFFFF",
  },
  {
    title: "No. of Beneficiaries Paid (Latest Month)",
    value: "542",
    icon: <AccountBalanceWallet />,
    cardColor: "#0288D1",
    textColor: "#FFFFFF",
  },
  {
    title: "Successful Disbursements (Latest Month)",
    value: "519",
    icon: <EmojiEvents />,
    cardColor: "#43A047",
    textColor: "#FFFFFF",
  },
  {
    title: "Failed Disbursements (Latest Month)",
    value: "23",
    icon: <ErrorOutline />,
    cardColor: "#C62828",
    textColor: "#FFFFFF",
  },
  {
    title: "Arrear Amount Disbursed (Latest Month)",
    value: "₹12,50,000",
    icon: <MonetizationOn />,
    cardColor: "#00695C",
    textColor: "#FFFFFF",
  },
];

export default function ViewerHome() {
  const theme = useTheme();
  const [state, setState] = useState(0); // Default to Jammu & Kashmir
  const [division, setDivision] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [district, setDistrict] = useState(null);
  const [tehsils, setTehsils] = useState([]);
  const [tehsil, setTehsil] = useState(null);
  const [dashboardData, setDashboardData] = useState(defaultCardData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch districts when division changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (division != null && division !== "") {
        try {
          const response = await mockAxiosInstance.get("/Base/GetDistricts", {
            params: { division },
          });
          const result = response.data;
          const Districts = result.districts.map((item) => ({
            label: item.districtName,
            value: item.districtId,
          }));
          setDistricts(Districts);
        } catch (err) {
          console.error("Failed to fetch districts", err);
          setError("Failed to fetch districts");
        }
      } else {
        setDistricts([]);
      }
    };
    fetchDistricts();
  }, [division]);

  // Fetch tehsils when district changes
  useEffect(() => {
    const fetchTehsils = async () => {
      if (district != null && district !== "") {
        try {
          const response = await mockAxiosInstance.get(
            "/Base/GetTeshilForDistrict",
            {
              params: { districtId: district },
            }
          );
          const result = response.data;
          const Tehsils = result.tehsils.map((item) => ({
            label: item.tehsilName,
            value: item.tehsilId,
          }));
          setTehsils(Tehsils);
        } catch (err) {
          console.error("Failed to fetch tehsils", err);
          setError("Failed to fetch tehsils");
        }
      } else {
        setTehsils([]);
      }
    };
    fetchTehsils();
  }, [district]);

  // Reset district and tehsil when division changes
  useEffect(() => {
    setDistrict(null);
    setTehsil(null);
  }, [division]);

  // Reset tehsil when district changes
  useEffect(() => {
    setTehsil(null);
  }, [district]);

  // Fetch dashboard data when filters change
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = {};
        if (state !== "" && state != null) params.state = state;
        if (division != null) params.division = division;
        if (district != null) params.district = district;
        if (tehsil != null) params.tehsil = tehsil;

        const response = await mockAxiosInstance.get("/api/dashboard/stats", {
          params,
        });
        setDashboardData(response.data);
      } catch (err) {
        setError("Failed to fetch dashboard data");
        console.error(err);
        setDashboardData(defaultCardData); // Fallback on error
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [state, division, district, tehsil]);

  return (
    <Box
      sx={{
        padding: "32px",
        minHeight: "100vh",
        background: `linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)`,
      }}
    >
      <Typography
        variant="h4"
        align="center"
        sx={{
          mb: 6,
          fontWeight: "bold",
          color: theme.palette.text.primary,
        }}
      >
        Dashboard
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: "24px",
          justifyContent: "center",
        }}
      >
        <Row style={{ width: "100%", justifyContent: "center" }}>
          <Col xs={12} lg={2}>
            <TextField
              select
              name="State"
              label="Select State"
              fullWidth
              value={state}
              onChange={(e) => setState(e.target.value)}
            >
              {[
                { label: "Please Select", value: "" },
                { label: "Jammu & Kashmir", value: 0 },
              ].map((item, index) => (
                <MenuItem key={index} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>
          </Col>
          <Col xs={12} lg={2}>
            <TextField
              select
              name="Division"
              label="Select Division"
              fullWidth
              value={division || ""}
              onChange={(e) => setDivision(e.target.value)}
            >
              {[
                { label: "Please Select", value: "" },
                { label: "Jammu", value: 1 },
                { label: "Kashmir", value: 2 },
              ].map((item, index) => (
                <MenuItem key={index} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>
          </Col>
          <Col xs={12} lg={2}>
            <TextField
              select
              name="District"
              label="Select District"
              fullWidth
              value={district || ""}
              onChange={(e) => setDistrict(e.target.value)}
            >
              <MenuItem value="">Please Select</MenuItem>
              {districts.map((item, index) => (
                <MenuItem key={index} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>
          </Col>
          <Col xs={12} lg={2}>
            <TextField
              select
              name="Tehsil"
              label="Select Tehsil"
              fullWidth
              value={tehsil || ""}
              onChange={(e) => setTehsil(e.target.value)}
            >
              <MenuItem value="">Please Select</MenuItem>
              {tehsils.map((item, index) => (
                <MenuItem key={index} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>
          </Col>
        </Row>

        {isLoading ? (
          <Typography>Loading...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Row style={{ justifyContent: "center" }}>
            {dashboardData.map((card, index) => (
              <Col
                key={index}
                lg={
                  index > 4 && index < 7
                    ? 6
                    : index > 6
                    ? 3
                    : index === 9
                    ? 12
                    : 2
                }
                xs={12}
                style={{ marginBottom: 40 }}
              >
                <DashboardCard sx={{ backgroundColor: card.cardColor }}>
                  <CardContent
                    sx={{
                      textAlign: "center",
                      padding: "22px 20px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "#FFFFFF",
                        width: 56,
                        height: 56,
                        mb: 2,
                      }}
                    >
                      {React.cloneElement(card.icon, {
                        style: { color: card.cardColor },
                      })}
                    </Avatar>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 500,
                        color: card.textColor,
                        mb: 1,
                      }}
                    >
                      {card.title}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: "bold",
                        color: card.textColor,
                      }}
                    >
                      {card.value}
                    </Typography>
                  </CardContent>
                </DashboardCard>
              </Col>
            ))}
          </Row>
        )}
      </Box>
    </Box>
  );
}

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
import CustomSelectField from "../../components/form/CustomSelectField";
import { useForm } from "react-hook-form";
import axiosInstance from "../../axiosConfig";
import { fetchTehsils } from "../../assets/fetch";

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

const cardData = [
  {
    title: "Applications Received",
    value: "1,234",
    icon: <AssignmentTurnedIn />,
    cardColor: "#1976D2", // Blue for incoming applications
    textColor: "#FFFFFF", // White for readability
  },
  {
    title: "Sanctioned",
    value: "856",
    icon: <CheckCircle />,
    cardColor: "#388E3C", // Green for positive outcome
    textColor: "#FFFFFF",
  },
  {
    title: "Under Process",
    value: "200",
    icon: <HourglassEmpty />,
    cardColor: "#FBC02D", // Amber for ongoing work
    textColor: "#212121", // Dark gray for lighter background
  },
  {
    title: "Pending with Citizen",
    value: "20",
    icon: <Group />,
    cardColor: "#7B1FA2", // Purple for user-related actions
    textColor: "#FFFFFF",
  },
  {
    title: "Rejected",
    value: "178",
    icon: <Cancel />,
    cardColor: "#D32F2F", // Red for negative outcome
    textColor: "#FFFFFF",
  },
  {
    title: "Total Amount Disbursed (Latest Month)",
    value: "₹5,67,89,000",
    icon: <MonetizationOn />,
    cardColor: "#00897B", // Teal for financial metrics
    textColor: "#FFFFFF",
  },
  {
    title: "New Sanctions (After Latest Disbursements)",
    value: "320",
    icon: <TrendingUp />,
    cardColor: "#4CAF50", // Light green for new positive actions
    textColor: "#FFFFFF",
  },
  {
    title: "No. of Beneficiaries Paid (Latest Month)",
    value: "542",
    icon: <AccountBalanceWallet />,
    cardColor: "#0288D1", // Blue-green for payments
    textColor: "#FFFFFF",
  },
  {
    title: "Successful Disbursements (Latest Month)",
    value: "519",
    icon: <EmojiEvents />,
    cardColor: "#43A047", // Bright green for success
    textColor: "#FFFFFF",
  },
  {
    title: "Failed Disbursements (Latest Month)",
    value: "23",
    icon: <ErrorOutline />,
    cardColor: "#C62828", // Dark red for failures
    textColor: "#FFFFFF",
  },
  {
    title: "Arrear Amount Disbursed (Latest Month)",
    value: "₹12,50,000",
    icon: <MonetizationOn />,
    cardColor: "#00695C", // Dark teal for financial arrears
    textColor: "#FFFFFF",
  },
];

export default function ViewerHome() {
  const theme = useTheme();
  const [state, setState] = useState(0);
  const [division, setDvision] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [district, setDistrict] = useState();
  const [tehsils, setTehsils] = useState([]);
  const [tehsil, setTeshil] = useState();

  const { control } = useForm();

  useEffect(() => {
    setDistricts([]);
    const fetchDistricts = async () => {
      const response = await axiosInstance.get("/Base/GetDistricts", {
        params: { division },
      });
      const result = response.data;
      let Districts = result.districts.map((item) => ({
        label: item.districtName,
        value: item.districtId,
      }));
      setDistricts(Districts);
    };
    if (division != null && division != "") {
      fetchDistricts();
    }
  }, [division]);

  useEffect(() => {
    setTehsils([]);
    const fetchTeshils = async () => {
      const response = await axiosInstance.get("/Base/GetTeshilForDistrict", {
        params: { districtId: district },
      });
      const result = response.data;
      let Teshils = result.tehsils.map((item) => ({
        label: item.tehsilName,
        value: item.tehsilId,
      }));
      setTehsils(Teshils);
    };
    if (district != null && district != "") {
      fetchTeshils();
    }
  }, [district]);

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
              defaultValue={0}
              onChange={(e) => setState(e.target.value)}
            >
              {[
                { label: "Please Select", value: "" },
                { label: "Jammu & Kahsmir", value: 0 },
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
              name="Dvision"
              label="Select Dvision"
              fullWidth
              onChange={(e) => setDvision(e.target.value)}
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
              onChange={(e) => setDistrict(e.target.value)}
            >
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
              name="Teshil"
              label="Select Tehsil"
              fullWidth
              onChange={(e) => setTeshil(e.target.value)}
            >
              {tehsils.map((item, index) => (
                <MenuItem key={index} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>
          </Col>
        </Row>
        <Row style={{ justifyContent: "center" }}>
          {cardData.map((card, index) => (
            <Col
              key={index}
              lg={
                index > 4 && index < 7 ? 6 : index > 6 ? 3 : index == 9 ? 12 : 2
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
      </Box>
    </Box>
  );
}

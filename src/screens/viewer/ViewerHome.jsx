import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  Avatar,
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

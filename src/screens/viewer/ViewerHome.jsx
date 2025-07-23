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
  background: theme.palette.background.paper,
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
}));

const iconList = [
  <AssignmentTurnedIn />,
  <CheckCircle />,
  <Cancel />,
  <HourglassEmpty />,
  <Group />,
  <TrendingUp />,
  <AccountBalanceWallet />,
  <MonetizationOn />,
  <ErrorOutline />,
  <EmojiEvents />,
];

const colors = [
  "#42A5F5",
  "#66BB6A",
  "#EF5350",
  "#FFCA28",
  "#7E57C2",
  "#26A69A",
  "#FF7043",
  "#5C6BC0",
  "#D81B60",
  "#43A047",
];

const cardData = [
  { title: "Received Applications", value: "1,234" },
  { title: "Sanctioned ", value: "856" },
  { title: "Rejected ", value: "178" },
  { title: "Under Process ", value: "200" },
  { title: "Pending with Citizen ", value: "20" },
  { title: "Total Amount Latest Month Disbursed", value: "₹5,67,89,000" },
  { title: "Latest Disbursed (Beneficiaries)", value: "542" },
  { title: "Sanctioned After Last Month", value: "320" },
  { title: "Success in Latest Month Disbursed", value: "519" },
  { title: "Failures in Latest Month Disbursed", value: "23" },
  { title: "Latest Arrear Disbursed", value: "₹12,50,000" },
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
        Dashboard Overview
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
              lg={index > 4 && index < 8 ? 3 : index > 7 ? 3 : 2}
              xs={12}
              style={{ marginRight: 0.5, marginBottom: 40 }}
            >
              <DashboardCard>
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
                      bgcolor: colors[index % colors.length],
                      width: 56,
                      height: 56,
                      mb: 2,
                    }}
                  >
                    {React.cloneElement(iconList[index % iconList.length], {
                      style: { color: "#fff" },
                    })}
                  </Avatar>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 500,
                      color: theme.palette.text.secondary,
                      mb: 1,
                    }}
                  >
                    {card.title}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "bold",
                      color: theme.palette.primary.main,
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

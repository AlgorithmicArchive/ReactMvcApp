import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Button,
  Tooltip,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import SendIcon from "@mui/icons-material/Send";
import ReplayIcon from "@mui/icons-material/Replay";
import BlockIcon from "@mui/icons-material/Block";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ListAltIcon from "@mui/icons-material/ListAlt";

// Map status name to icon
const getStatusIcon = (statusName, textColor) => {
  switch (statusName?.toLowerCase()) {
    case "total applications":
      return <ListAltIcon sx={{ color: textColor }} />;
    case "pending":
      return <HourglassTopIcon sx={{ color: textColor }} />;
    case "forwarded":
      return <SendIcon sx={{ color: textColor }} />;
    case "returned":
      return <ReplayIcon sx={{ color: textColor }} />;
    case "rejected":
      return <BlockIcon sx={{ color: textColor }} />;
    case "pending with citizen":
      return <PersonIcon sx={{ color: textColor }} />;
    case "sanctioned":
      return <CheckCircleIcon sx={{ color: textColor }} />;
    default:
      return <ListAltIcon sx={{ color: textColor }} />;
  }
};

const statusColorMap = {
  "total applications": "#e0e0e0",
  pending: "#ffe082",
  forwarded: "#bbdefb",
  returned: "#ffccbc",
  rejected: "#ef9a9a",
  "pending with citizen": "#d1c4e9",
  sanctioned: "#a5d6a7",
};

const StatusCountCard = ({
  statusName = "Pending",
  count = 0,
  onClick,
  tooltipText,
  bgColor,
  textColor,
  sx = {},
}) => {
  const colorKey = statusName.toLowerCase();
  const chipColor = statusColorMap[colorKey] || "#e0e0e0";

  return (
    <Tooltip
      title={tooltipText || statusName}
      arrow
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor: "#ffffff",
            color: "#000",
            fontSize: "14px",
            padding: "10px",
            borderRadius: "8px",
            boxShadow: 3,
          },
        },
        arrow: {
          sx: {
            color: "#ffffff",
          },
        },
      }}
    >
      <Card
        onClick={onClick}
        sx={{
          borderRadius: 2,
          boxShadow: 3,
          p: 2,
          transition: "transform 0.2s",
          cursor: onClick ? "pointer" : "default",
          "&:hover": {
            transform: "scale(1.02)",
          },
          width: {
            xs: "100%", // full width on mobile
            sm: "48%", // nearly half on small screens
            md: "32%", // one-third on medium screens
            lg: "90%", // one-fourth on large screens
          },
          ...sx,
        }}
      >
        <CardContent sx={{ paddingBottom: "16px !important" }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={{ xs: 1.5, sm: 2 }}
            flexWrap="wrap"
          >
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{
                fontSize: { xs: "0.9rem", sm: "1rem" },
              }}
            >
              {statusName}
            </Typography>

            <Chip
              label={getStatusIcon(statusName, textColor)}
              size="small"
              sx={{
                backgroundColor: bgColor || chipColor,
                color: "#000",
                fontWeight: 600,
                px: 1.5,
              }}
            />
          </Box>

          <Typography
            variant="h4"
            sx={{
              color: "#7B61FF",
              fontWeight: 600,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              mb: 0.5,
            }}
          >
            {count}
          </Typography>

          <Box display="flex" justifyContent="flex-end" alignItems="center">
            <Button
              size="small"
              endIcon={<ArrowForwardIcon />}
              sx={{
                color: "#7B61FF",
                fontWeight: 600,
                textTransform: "none",
                padding: 0,
                minWidth: "unset",
              }}
            >
              View
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Tooltip>
  );
};

export default StatusCountCard;

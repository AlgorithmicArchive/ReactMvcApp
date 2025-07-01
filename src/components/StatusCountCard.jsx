import React from "react";
import { Box, Card, CardContent, Typography, Tooltip } from "@mui/material";
import StatusIcons from "./StatusIcons";

const StatusCountCard = ({
  statusName,
  count,
  bgColor,
  textColor,
  onClick,
  tooltipText, // optional prop
}) => {
  return (
    <Tooltip
      title={tooltipText || statusName}
      arrow
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor: "#333",
            color: "#fff",
            fontSize: "14px",
            padding: "10px",
            borderRadius: "8px",
            boxShadow: 3,
          },
        },
        arrow: {
          sx: {
            color: "#333",
          },
        },
      }}
    >
      <Card
        sx={{
          minWidth: 300,
          minHeight: 200,
          margin: "10px",
          padding: "10px",
          backgroundColor: bgColor,
          cursor: statusName !== "" ? "pointer" : "default",
          borderRadius: 5,
        }}
        onClick={onClick}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              component="div"
              gutterBottom
              color={textColor}
              sx={{ fontSize: 36 }}
            >
              {statusName}
            </Typography>
            <StatusIcons status={statusName} textColor={textColor} />
          </Box>
          <Typography variant="h4" color={textColor} sx={{ fontSize: 80 }}>
            {count}
          </Typography>
        </CardContent>
      </Card>
    </Tooltip>
  );
};

export default StatusCountCard;

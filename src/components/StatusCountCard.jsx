import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import StatusIcons from "./StatusIcons";

// Accept an onClick prop
const StatusCountCard = ({
  statusName,
  count,
  bgColor,
  textColor,
  onClick,
}) => {
  return (
    <Card
      sx={{
        minWidth: 300,
        minHeight: 200,
        margin: "10px",
        padding: "10px",
        backgroundColor: bgColor,
        cursor: statusName != "" ? "pointer" : "default",
        borderRadius: 5,
      }}
      onClick={onClick} // Attach onClick handler
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
  );
};

export default StatusCountCard;

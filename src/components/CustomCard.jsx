import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

const CustomCard = ({ heading, discription }) => {
  return (
    <Card
      sx={{
        backgroundColor: "#D2946A",
        color: "#FFFFFF", // white text for contrast
        maxWidth: 400,
        margin: "auto",
        borderRadius: 3,
        boxShadow: 3,
        height: 400,
      }}
    >
      <CardContent>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          {heading}
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          {discription}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CustomCard;

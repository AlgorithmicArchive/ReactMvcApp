import { TextField, Button, Box, Typography, Container  } from "@mui/material";
import React from "react";
import CustomInputField from "../../components/form/CustomInputField";
import CustomButton from "../../components/CustomButton";

export default function RegisterScreen() {
  return (
    <Box sx={{ backgroundColor: "background.default" }}>
      {/* Section 1 */}
      <Box
        sx={{
          width: "100vw",
          height: "90vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 3,
        }}
      >
        <Container
          maxWidth="sm"
          sx={{ mt: 5, bgcolor: "primary.main", p: 4, borderRadius: 5, boxShadow: 20 }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{ mb: 3, textAlign: "center",color:'background.paper',fontWeight:'bold' }}
          >
            Registration
          </Typography>

          <Box component="form" noValidate autoComplete="off">
            <Box sx={{ display: "flex",justifyContent:'space-between',gap:1, mb: 2 }}>
              <CustomInputField label="Full Name" placeholder="Full Name" type="text"/>
              <CustomInputField label="Username" placeholder="Username" type="text"/>
            </Box>
            <Box sx={{ display: "flex",justifyContent:'space-between',gap:1, mb: 2 }}>
              <CustomInputField label="Email" placeholder="Email" type="email"/>
              <CustomInputField label="Mobile Number" placeholder="Mobile Number" type="text"/>
            </Box>
            <Box sx={{ display: "flex",justifyContent:'space-between',gap:1, mb: 2 }}>
              <CustomInputField label="Password" placeholder="Password" type="password"/>
              <CustomInputField label="Confirm Password" placeholder="Confirm Password" type="password"/>
            </Box>
            <Box sx={{display:'flex',justifyContent:'center'}}>
              <CustomButton text="Register" bgColor="background.paper" color="primary.main"/>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

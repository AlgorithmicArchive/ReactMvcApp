import { Container, Typography, Button, Box } from "@mui/material";
import React, { useContext, useState } from "react";
import CustomInputField from "../../components/form/CustomInputField";
import { useForm } from "react-hook-form";
import CustomButton from "../../components/CustomButton";
import { useNavigate } from "react-router-dom";
import { Validate } from "../../assets/fetch";
import { UserContext } from "../../UserContext";

export default function Verification() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const { setVerified } = useContext(UserContext);
  const navigate = useNavigate();

  // Handle option selection
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const onSubmit = async (data) => {
    // Prepare form data
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      // Send verification data to the server
      const response = await Validate(formData);

      if (response.status) {
        setVerified(true);
        const url =
          response.userType === "Admin"
            ? "/admin/home"
            : response.userType === "Officer"
            ? "/officer/home"
            : "/user/home";
        navigate(url);
      } else {
        // Handle verification failure
        console.error("Verification failed:", response.message);
        setErrorMessage(response.message || "Verification failed.");
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setErrorMessage("An error occurred during verification.");
    }
  };

  return (
    <Container
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        sx={{ mb: 3, fontWeight: "bold" }}
      >
        Verification
      </Typography>

      {/* Show options if no option is selected */}
      {!selectedOption && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Button
            variant="contained"
            sx={{ backgroundColor: "primary.main", color: "background.paper" }}
            onClick={() => handleOptionSelect("otp")}
          >
            Use OTP Verification
          </Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: "background.paper", color: "primary.main" }}
            onClick={() => handleOptionSelect("backup")}
          >
            Use Backup Codes
          </Button>
        </Box>
      )}

      {/* Conditionally render the input field based on selected option */}
      {selectedOption === "otp" && (
        <Box
          sx={{
            mt: 4,
            width: "100%",
            maxWidth: 400,
            backgroundColor: "primary.main",
            padding: 5,
            borderRadius: 5,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <CustomInputField
            label="Enter Otp set to your mail."
            name="otp"
            placeholder="OTP"
            type="text"
            control={control}
            rules={{ required: "OTP is required." }}
            errors={errors}
          />
          <CustomButton
            text="Submit"
            onClick={handleSubmit(onSubmit)}
            bgColor="background.paper"
            color="primary.main"
          />
        </Box>
      )}

      {selectedOption === "backup" && (
        <Box
          sx={{
            mt: 4,
            width: "100%",
            maxWidth: 400,
            backgroundColor: "primary.main",
            padding: 5,
            borderRadius: 5,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <CustomInputField
            label="Enter Backup Code."
            name="backupCode"
            placeholder="Backup Code"
            type="text"
            control={control}
            rules={{ required: "Backup Code is required." }}
            errors={errors}
          />
          <CustomButton
            text="Submit"
            onClick={handleSubmit(onSubmit)}
            bgColor="background.paper"
            color="primary.main"
          />
        </Box>
      )}

      {errorMessage && (
        <Typography color="error" variant="body1">
          {errorMessage}
        </Typography>
      )}
    </Container>
  );
}

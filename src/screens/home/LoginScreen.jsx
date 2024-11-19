import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { Box, Typography } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import CustomInputField from "../../components/form/CustomInputField";
import CustomButton from "../../components/CustomButton";
import { Login } from "../../assets/fetch"; // Assuming the Login function is in this file
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../UserContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Container } from "react-bootstrap";

// Define a validation schema using Yup
const schema = yup.object().shape({
  username: yup.string().required("Username is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function LoginScreen() {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const {
    setUserType,
    setToken,
    setProfile,
    setUsername,
    setVerified,
    setDesignation,
  } = useContext(UserContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Handle form submission
  const onSubmit = async (data) => {
    // Convert data to FormData
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    setLoading(true);
    try {
      const response = await Login(formData); // Call the Login function
      if (response.status) {
        setToken(response.token);
        setUserType(response.userType);
        setProfile(response.profile);
        setUsername(response.username);
        setVerified(false);
        setDesignation(response.designation);
        navigate("/Verification");
      }
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        paddingBottom: "50px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: { xs: "80vh", md: "80vh" },
      }}
    >
      {loading && <LoadingSpinner />}
      <Box
        sx={{
          backgroundColor: "primary.main",
          padding: 5,
          borderRadius: 5,
          width: { xs: "90%", md: "50%" },
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            mb: 3,
            textAlign: "center",
            color: "background.paper",
            fontWeight: "bold",
          }}
        >
          Login
        </Typography>
        <Box
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Username Field */}
          <CustomInputField
            label="Username"
            name="username"
            control={control}
            placeholder="Enter your username"
            rules={{ required: "Username is required" }}
            errors={errors}
          />

          {/* Password Field */}
          <CustomInputField
            label="Password"
            name="password"
            control={control}
            type="password"
            placeholder="Enter your password"
            rules={{
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            }}
            errors={errors}
          />

          {/* Submit Button */}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <CustomButton
              text="Login"
              bgColor="background.paper"
              color="primary.main"
              onClick={handleSubmit(onSubmit)} // Use handleSubmit here
              type="submit" // Set type to "submit" for correct form behavior
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

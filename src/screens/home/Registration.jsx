import React, { useState } from "react";
import { Box, Typography, Container, Button } from "@mui/material";
import { useForm } from "react-hook-form";
import CustomInputField from "../../components/form/CustomInputField";
import CustomButton from "../../components/CustomButton";
import OtpModal from "../../components/OtpModal";
import ReactLoading from "react-loading";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function RegisterScreen() {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [userId, setUserId] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Async validation function for username
  const validateUsername = async (value) => {
    if (!value) return "Username is required";
    try {
      const response = await axios.get("/Home/CheckUsername", {
        params: { username: value },
      });
      if (!response.data.isUnique) {
        return "Username already exists";
      }
      return true;
    } catch (error) {
      return "Error validating username";
    }
  };

  // Async validation function for email
  const validateEmail = async (value) => {
    if (!value) return "Email is required";
    try {
      const response = await axios.get("/Home/CheckEmail", {
        params: { email: value },
      });
      if (!response.data.isUnique) {
        return "Email already exists";
      }
      return true;
    } catch (error) {
      return "Error validating email";
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    try {
      const response = await axios.post("/Home/Register", formData);
      const { status, userId } = response.data;
      if (status) {
        setIsOtpModalOpen(true);
        setUserId(userId);
      }
    } catch (error) {
      console.error("Registration error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (otp) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("otp", otp);
    formData.append("UserId", userId);
    try {
      const response = await axios.post("/Home/OTPValidation", formData);
      if (response.data.status) {
        navigate("/login");
      }
    } catch (error) {
      console.error("OTP validation error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 3,
          height: "100vh",
        }}
      >
        {loading && (
          <Container
            maxWidth={false}
            sx={{
              position: "absolute",
              width: "20vw",
              backgroundColor: "transparent",
              top: "50%",
              borderRadius: 10,
              zIndex: 1100,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ReactLoading
              type="spinningBubbles"
              color="#48426D"
              height={200}
              width={200}
            />
          </Container>
        )}
        <Container
          maxWidth="sm"
          sx={{
            bgcolor: "background.default",
            p: 4,
            borderRadius: 5,
            boxShadow: 5,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              mb: 3,
              textAlign: "center",
              color: "primary.main",
              fontWeight: "bold",
            }}
          >
            Registration
          </Typography>

          <Box
            component="form"
            noValidate
            autoComplete="off"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Box>
              <CustomInputField
                rules={{ required: "This Field is required" }}
                label="Full Name"
                name="fullName"
                control={control}
                placeholder="Full Name"
                errors={errors}
              />
              <CustomInputField
                rules={{
                  required: "This Field is required",
                  validate: validateUsername,
                }}
                label="Username"
                name="username"
                control={control}
                placeholder="Username"
                errors={errors}
              />
            </Box>

            <Box>
              <CustomInputField
                rules={{
                  required: "This Field is required",
                  validate: validateEmail,
                }}
                label="Email"
                name="email"
                control={control}
                placeholder="Email"
                type="email"
                errors={errors}
              />
              <CustomInputField
                rules={{
                  required: "This Field is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Mobile number must be exactly 10 digits",
                  },
                }}
                label="Mobile Number"
                name="mobileNumber"
                control={control}
                placeholder="Mobile Number"
                errors={errors}
                maxLength={10}
              />
            </Box>

            <Box>
              <CustomInputField
                rules={{ required: "This Field is required" }}
                label="Password"
                name="password"
                control={control}
                placeholder="Password"
                type="password"
                errors={errors}
              />
              <CustomInputField
                rules={{ required: "This Field is required" }}
                label="Confirm Password"
                name="confirmPassword"
                control={control}
                placeholder="Confirm Password"
                type="password"
                errors={errors}
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <CustomButton
                text="Register"
                bgColor="primary.main"
                color="background.paper"
                type="submit"
                width="100%"
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 3,
              }}
            >
              <Typography sx={{ textAlign: "center", fontSize: 14 }}>
                Already have an account?
              </Typography>
              <Button
                sx={{ color: "darkblue" }}
                onClick={() => navigate("/login")}
              >
                Sign in now
              </Button>
            </Box>
          </Box>
        </Container>
        <OtpModal
          open={isOtpModalOpen}
          onClose={() => setIsOtpModalOpen(false)}
          onSubmit={handleOtpSubmit}
        />
      </Box>
    </Box>
  );
}

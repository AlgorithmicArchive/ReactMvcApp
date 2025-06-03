import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { Box, Button, Typography, Link } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import CustomInputField from "../../components/form/CustomInputField";
import CustomButton from "../../components/CustomButton";
import { Login } from "../../assets/fetch";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../UserContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CircularProgress from "@mui/material/CircularProgress";

// Validation schema
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
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    setLoading(true);
    try {
      const response = await Login(formData);
      if (response.status) {
        setToken(response.token);
        setUserType(response.userType);
        setProfile(response.profile);
        setUsername(response.username);
        setVerified(false);
        setDesignation(response.designation);
        navigate("/Verification");
      } else {
        toast.error(response.response, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("An error occurred. Please try again.", {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
        background:
          "linear-gradient(135deg,rgb(252, 252, 252) 0%,rgb(240, 236, 236) 100%)", // Subtle gradient background
        padding: { xs: 2, md: 4 },
      }}
    >
      <Box
        sx={{
          backgroundColor: "#FFFFFF",
          padding: { xs: 3, md: 5 },
          borderRadius: 3,
          width: { xs: "95%", sm: "80%", md: "50%", lg: "35%" },
          maxWidth: 500,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          transition: "transform 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-5px)", // Subtle hover animation
          },
        }}
        role="form"
        aria-labelledby="login-title"
      >
        {/* Logo or Branding */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography
            variant="h4"
            component="h1"
            id="login-title"
            sx={{
              fontWeight: 700,
              color: "primary.main",
              mb: 1,
            }}
          >
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to continue
          </Typography>
        </Box>

        {/* Form */}
        <Box
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          {/* Username Field */}
          <CustomInputField
            label="Username"
            name="username"
            control={control}
            placeholder="Enter your username"
            errors={errors}
            aria-describedby="username-error"
            disabled={loading}
          />

          {/* Password Field */}
          <CustomInputField
            label="Password"
            name="password"
            control={control}
            type="password"
            placeholder="Enter your password"
            errors={errors}
            aria-describedby="password-error"
            disabled={loading}
          />

          {/* Forgot Password Link */}
          <Box sx={{ textAlign: "right" }}>
            <Link
              href="/forgot-password"
              sx={{ fontSize: 14, color: "primary.main" }}
              underline="hover"
              aria-label="Forgot password"
            >
              Forgot Password?
            </Link>
          </Box>

          {/* Submit Button */}
          <CustomButton
            text={loading ? "Logging In..." : "Log In"}
            bgColor="primary.main"
            color="background.default"
            type="submit"
            width="100%"
            disabled={loading}
            startIcon={
              loading && <CircularProgress size={20} color="inherit" />
            }
            sx={{
              py: 1.5,
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                backgroundColor: "primary.dark",
                transform: "scale(1.02)",
                transition: "all 0.2s ease",
              },
            }}
          />

          {/* Sign Up Link */}
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{" "}
              <Link
                href="/register"
                sx={{ color: "primary.main", fontWeight: 600 }}
                underline="hover"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/register");
                }}
                aria-label="Sign up"
              >
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Toast Container */}
      <ToastContainer />
    </Box>
  );
}

import React, { useEffect, useState } from "react";
import { Box, Typography, Container, Link } from "@mui/material";
import { useForm } from "react-hook-form";
import CustomInputField from "../../components/form/CustomInputField";
import CustomSelectField from "../../components/form/CustomSelectField";
import CustomButton from "../../components/CustomButton";
import { fetchDesignation, fetchDistricts } from "../../assets/fetch";
import OtpModal from "../../components/OtpModal";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CircularProgress from "@mui/material/CircularProgress";

// Validation schema (using inline rules as in original code)
export default function OfficerRegisterScreen() {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm();

  const [designations, setDesignations] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [tehsilOptions, setTehsilOptions] = useState([]);
  const [accessLevelMap, setAccessLevelMap] = useState({});
  const selectedDesignation = watch("designation");
  const selectedDistrict = watch("District");
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [userId, setUserId] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Async validation for username
  const validateUsername = async (value) => {
    if (!value) return "Username is required";
    try {
      const response = await axios.get("/Home/CheckUsername", {
        params: { username: value },
      });
      return response.data.isUnique ? true : "Username already exists";
    } catch (error) {
      return "Error validating username";
    }
  };

  // Async validation for email
  const validateEmail = async (value) => {
    if (!value) return "Email is required";
    try {
      const response = await axios.get("/Home/CheckEmail", {
        params: { email: value },
      });
      return response.data.isUnique ? true : "Email already exists";
    } catch (error) {
      return "Error validating email";
    }
  };

  // Fetch designations and districts on mount
  useEffect(() => {
    fetchDesignation(setDesignations, setAccessLevelMap);
    fetchDistricts(setDistrictOptions);
  }, []);

  // Fetch tehsils when district changes
  useEffect(() => {
    if (selectedDistrict) {
      axios
        .get(`/Base/GetTeshilForDistrict?districtId=${selectedDistrict}`)
        .then((response) => {
          if (response.data.status) {
            const tehsilOptionsFormatted = response.data.tehsils.map(
              (tehsil) => ({
                label: tehsil.tehsilName,
                value: tehsil.tehsilId,
              })
            );
            setTehsilOptions(tehsilOptionsFormatted);
          } else {
            toast.error("Failed to fetch tehsils", {
              position: "top-center",
              autoClose: 3000,
              theme: "colored",
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching tehsils", error);
          toast.error("Error fetching tehsils", {
            position: "top-center",
            autoClose: 3000,
            theme: "colored",
          });
        });
    }
  }, [selectedDistrict]);

  // Handle form submission
  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }
    setLoading(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("accessLevel", accessLevelMap[selectedDesignation]);
    formData.append(
      "accessCode",
      accessLevelMap[selectedDesignation] !== "State"
        ? accessLevelMap[selectedDesignation].includes("Tehsil")
          ? data["Tehsil"]
          : accessLevelMap[selectedDesignation].includes("District")
          ? data["District"]
          : data["Division"]
        : 0
    );
    try {
      const response = await axios.post("/Home/OfficerRegistration", formData);
      const { status, userId } = response.data;
      if (status) {
        setIsOtpModalOpen(true);
        setUserId(userId);
      } else {
        toast.error("Registration failed. Please try again.", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
      }
    } catch (error) {
      console.error("Registration error", error);
      toast.error("An error occurred. Please try again.", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP submission
  const handleOtpSubmit = async (otp) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("otp", otp);
    formData.append("UserId", userId);
    try {
      const response = await axios.post("/Home/OTPValidation", formData);
      if (response.data.status) {
        toast.success("Registration successful! Redirecting to login...", {
          position: "top-center",
          autoClose: 2000,
          theme: "colored",
        });
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error("Invalid OTP. Please try again.", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
      }
    } catch (error) {
      console.error("OTP validation error", error);
      toast.error("Error validating OTP. Please try again.", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
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
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, rgb(252, 252, 252) 0%, rgb(240, 236, 236) 100%)", // Specified gradient
        padding: { xs: 2, md: 4 },
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          bgcolor: "#FFFFFF",
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          maxWidth: 500,
          transition: "transform 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-5px)", // Subtle hover animation
          },
        }}
        role="form"
        aria-labelledby="officer-register-title"
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography
            variant="h4"
            component="h1"
            id="officer-register-title"
            sx={{
              fontWeight: 700,
              color: "primary.main",
              mb: 1,
            }}
          >
            Officer Registration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign up as an officer to get started
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
          {/* Personal Info */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <CustomInputField
              rules={{ required: "Full Name is required" }}
              label="Full Name"
              name="fullName"
              control={control}
              placeholder="Enter your full name"
              errors={errors}
              aria-describedby="fullName-error"
              disabled={loading}
            />
            <CustomInputField
              rules={{
                required: "Username is required",
                validate: validateUsername,
              }}
              label="Username"
              name="username"
              control={control}
              placeholder="Choose a username"
              errors={errors}
              aria-describedby="username-error"
              disabled={loading}
            />
          </Box>

          {/* Contact Info */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <CustomInputField
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
                validate: validateEmail,
              }}
              label="Email"
              name="email"
              control={control}
              placeholder="Enter your email"
              type="email"
              errors={errors}
              aria-describedby="email-error"
              disabled={loading}
            />
            <CustomInputField
              rules={{
                required: "Mobile number is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Mobile number must be exactly 10 digits",
                },
              }}
              label="Mobile Number"
              name="mobileNumber"
              control={control}
              placeholder="Enter your mobile number"
              errors={errors}
              maxLength={10}
              type="tel"
              aria-describedby="mobileNumber-error"
              disabled={loading}
            />
          </Box>

          {/* Password Info */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <CustomInputField
              rules={{
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              }}
              label="Password"
              name="password"
              control={control}
              placeholder="Create a password"
              type="password"
              errors={errors}
              aria-describedby="password-error"
              disabled={loading}
            />
            <CustomInputField
              rules={{
                required: "Please confirm your password",
                validate: (value, formValues) =>
                  value === formValues.password || "Passwords do not match",
              }}
              label="Confirm Password"
              name="confirmPassword"
              control={control}
              placeholder="Confirm your password"
              type="password"
              errors={errors}
              aria-describedby="confirmPassword-error"
              disabled={loading}
            />
          </Box>

          {/* Designation Info */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <CustomSelectField
              label="Designation"
              name="designation"
              control={control}
              placeholder="Select Designation"
              options={designations}
              rules={{ required: "Designation is required" }}
              errors={errors}
              aria-describedby="designation-error"
              disabled={loading}
            />
            {(accessLevelMap[selectedDesignation] === "District" ||
              accessLevelMap[selectedDesignation] === "Tehsil") && (
              <CustomSelectField
                label="District"
                name="District"
                control={control}
                placeholder="Select District"
                options={districtOptions}
                rules={{ required: "District is required" }}
                errors={errors}
                aria-describedby="district-error"
                disabled={loading}
              />
            )}
            {accessLevelMap[selectedDesignation] === "Tehsil" && (
              <CustomSelectField
                label="Tehsil"
                name="Tehsil"
                control={control}
                placeholder="Select Tehsil"
                options={tehsilOptions}
                rules={{ required: "Tehsil is required" }}
                errors={errors}
                aria-describedby="tehsil-error"
                disabled={loading}
              />
            )}
            {accessLevelMap[selectedDesignation] === "Division" && (
              <CustomSelectField
                label="Division"
                name="Division"
                control={control}
                placeholder="Select Division"
                options={[
                  { label: "Jammu", value: 1 },
                  { label: "Kashmir", value: 2 },
                ]}
                rules={{ required: "Division is required" }}
                errors={errors}
                aria-describedby="division-error"
                disabled={loading}
              />
            )}
          </Box>

          {/* Submit Button */}
          <CustomButton
            text={loading ? "Registering..." : "Register"}
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

          {/* Login Link */}
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Link
                href="/login"
                sx={{ color: "primary.main", fontWeight: 600 }}
                underline="hover"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/login");
                }}
                aria-label="处理Sign in"
              >
                Sign In
              </Link>
            </Typography>
          </Box>
        </Box>
      </Container>

      {/* OTP Modal */}
      <OtpModal
        open={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onSubmit={handleOtpSubmit}
        aria-labelledby="otp-modal-title"
        sx={{
          maxWidth: 400,
          mx: "auto",
          p: 3,
          bgcolor: "background.default",
          borderRadius: 3,
        }}
      />

      {/* Toast Container */}
      <ToastContainer />
    </Box>
  );
}

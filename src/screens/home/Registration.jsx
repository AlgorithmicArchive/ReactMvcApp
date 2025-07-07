import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Link,
  CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import CustomInputField from "../../components/form/CustomInputField";
import CustomButton from "../../components/CustomButton";
import OtpModal from "../../components/OtpModal";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Col, Row } from "react-bootstrap";
import CustomSelectField from "../../components/form/CustomSelectField";
import { fetchDistricts } from "../../assets/fetch";

export default function RegisterScreen() {
  const {
    handleSubmit,
    control,
    getValues,
    watch,
    formState: { errors },
  } = useForm();

  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [userId, setUserId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [tehsilOptions, setTehsilOptions] = useState([]);
  const selectedDistrict = watch("District");

  const navigate = useNavigate();

  // Fetch designations and districts on mount
  useEffect(() => {
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

  // ✅ Async username validation
  const validateUsername = async (value) => {
    if (!value) return "Username is required";
    try {
      const res = await axios.get("/Home/CheckUsername", {
        params: { username: value },
      });
      return res.data?.isUnique ? true : "Username already exists";
    } catch (error) {
      console.error("Username validation error:", error);
      return "Server error while checking username";
    }
  };

  // ✅ Async email validation
  const validateEmail = async (value) => {
    if (!value) return "Email is required";
    try {
      const res = await axios.get("/Home/CheckEmail", {
        params: { email: value },
      });
      return res.data?.isUnique ? true : "Email already exists";
    } catch (error) {
      console.error("Email validation error:", error);
      return "Server error while checking email";
    }
  };

  const validateMobileNumber = async (value) => {
    if (!value) return "Mobile Number is required";
    try {
      const res = await axios.get("/Home/CheckMobileNumber", {
        params: { number: value },
      });
      return res.data?.isUnique ? true : "Mobile Number already exists";
    } catch (error) {
      console.error("Mobile Number validation error:", error);
      return "Server error while checking email";
    }
  };

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
    Object.entries(data).forEach(([key, value]) => formData.append(key, value));

    try {
      const response = await axios.post("/Home/Register", formData);
      const { status, userId } = response.data;
      if (status) {
        setIsOtpModalOpen(true);
        setUserId(userId);
      } else {
        toast.error("Registration failed. Please try again.", {
          position: "top-center",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Registration error", error);
      toast.error("An error occurred during registration.", {
        position: "top-center",
        autoClose: 3000,
      });
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
        toast.success("Registration successful! Redirecting to login...", {
          position: "top-center",
          autoClose: 2000,
        });
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error("Invalid OTP. Please try again.", {
          position: "top-center",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("OTP validation error", error);
      toast.error("Error validating OTP.", {
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
        minHeight: { xs: "90vh", lg: "80vh" },
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg, rgb(252, 252, 252) 0%, rgb(240, 236, 236) 100%)",
        p: 2,
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          backgroundColor: "#fff",
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            color: "primary.main",
            mb: 1,
          }}
          variant="h4"
          fontWeight={700}
          textAlign="center"
          mb={2}
        >
          Create an Account
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Row>
              <Col xs={6}>
                <CustomInputField
                  name="fullName"
                  label="Full Name"
                  control={control}
                  errors={errors}
                  rules={{ required: "Full name is required" }}
                  disabled={loading}
                />
              </Col>
              <Col xs={6}>
                <CustomInputField
                  name="username"
                  label="Username"
                  control={control}
                  errors={errors}
                  rules={{ required: true, validate: validateUsername }}
                  disabled={loading}
                />
              </Col>
            </Row>
            <Row>
              <Col xs={6}>
                <CustomInputField
                  name="email"
                  label="Email"
                  type="email"
                  control={control}
                  errors={errors}
                  rules={{
                    required: true,
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email format",
                    },
                    validate: validateEmail,
                  }}
                  disabled={loading}
                />
              </Col>
              <Col xs={6}>
                <CustomInputField
                  name="mobileNumber"
                  label="Mobile Number"
                  type="tel"
                  control={control}
                  errors={errors}
                  rules={{
                    required: true,
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Enter 10 digit number",
                    },
                    validate: validateMobileNumber,
                  }}
                  disabled={loading}
                />
              </Col>
            </Row>

            <Row>
              <Col xs={6}>
                <CustomInputField
                  name="password"
                  label="Password"
                  type="password"
                  control={control}
                  errors={errors}
                  rules={{
                    required: true,
                    minLength: {
                      value: 6,
                      message: "At least 6 characters",
                    },
                  }}
                  disabled={loading}
                />
              </Col>
              <Col xs={6}>
                <CustomInputField
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  control={control}
                  errors={errors}
                  rules={{
                    required: "Confirm your password",
                    validate: (value) =>
                      value === getValues("password") ||
                      "Passwords do not match",
                  }}
                  disabled={loading}
                />
              </Col>
              <Col xs={6}>
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
              </Col>
              <Col xs={6}>
                <CustomSelectField
                  label="TSWO Office"
                  name="Tehsil"
                  control={control}
                  placeholder="Select Tehsil"
                  options={tehsilOptions}
                  rules={{ required: "Tehsil is required" }}
                  errors={errors}
                  aria-describedby="tehsil-error"
                  disabled={loading}
                />
              </Col>
            </Row>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <CustomButton
              type="submit"
              text={loading ? "Registering..." : "Register"}
              bgColor="primary.main"
              color="white"
              width="50%"
              disabled={loading}
              startIcon={
                loading && <CircularProgress size={20} color="inherit" />
              }
              sx={{ mt: 3 }}
            />
          </Box>
        </form>

        <Box textAlign="center" mt={2}>
          <Typography variant="body2">
            Already have an account?{" "}
            <Link
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
              sx={{ fontWeight: 600 }}
            >
              Sign In
            </Link>
          </Typography>
        </Box>
        <Box textAlign="center" mt={2}>
          <Typography variant="body2">
            An Officer?{" "}
            <Link
              href="/officerRegistration"
              onClick={(e) => {
                e.preventDefault();
                navigate("/officerRegistration");
              }}
              sx={{ fontWeight: 600 }}
            >
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Container>

      {/* OTP Modal */}
      <OtpModal
        open={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onSubmit={handleOtpSubmit}
      />

      {/* Toast */}
      <ToastContainer />
    </Box>
  );
}

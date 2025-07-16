import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Link,
  CircularProgress,
  IconButton,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
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

// Function to generate a random CAPTCHA (6 alphanumeric characters)
const generateCaptcha = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let captcha = "";
  for (let i = 0; i < 6; i++) {
    captcha += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return captcha;
};

// Validation schema with CAPTCHA
const schema = yup.object().shape({
  fullName: yup
    .string()
    .required("Full name is required")
    .min(5, "Full Name must be at least 5 characters"),
  username: yup
    .string()
    .required("Username is required")
    .min(5, "Username must be at least 5 characters")
    .test("username-unique", "Username already exists", async (value) => {
      if (!value) return false;
      try {
        const res = await axios.get("/Home/CheckUsername", {
          params: { username: value },
        });
        return res.data?.isUnique;
      } catch {
        return false;
      }
    }),
  email: yup
    .string()
    .required("Email is required")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format")
    .test("email-unique", "Email already exists", async (value) => {
      if (!value) return false;
      try {
        const res = await axios.get("/Home/CheckEmail", {
          params: { email: value, UserType: "Citizen" },
        });
        return res.data?.isUnique;
      } catch {
        return false;
      }
    }),
  mobileNumber: yup
    .string()
    .required("Mobile Number is required")
    .matches(/^[0-9]{10}$/, "Enter 10 digit number")
    .test("mobile-unique", "Mobile Number already exists", async (value) => {
      if (!value) return false;
      try {
        const res = await axios.get("/Home/CheckMobileNumber", {
          params: { number: value, UserType: "Citizen" },
        });
        return res.data?.isUnique;
      } catch {
        return false;
      }
    }),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(12, "Password must be at most 12 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,12}$/,
      "Password must include uppercase, lowercase, number, and special character"
    ),
  confirmPassword: yup
    .string()
    .required("Confirm your password")
    .test("passwords-match", "Passwords do not match", function (value) {
      return value === this.parent.password;
    }),
  captcha: yup
    .string()
    .required("CAPTCHA is required")
    .test("captcha-match", "CAPTCHA is incorrect", function (value) {
      return value === this.options.context.captcha;
    }),
});

export default function RegisterScreen() {
  const {
    handleSubmit,
    control,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: yupResolver(schema),
  });
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [userId, setUserId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [tehsilOptions, setTehsilOptions] = useState([]);
  const selectedDistrict = watch("District");

  const navigate = useNavigate();

  // Fetch districts on mount
  useEffect(() => {
    fetchDistricts(setDistrictOptions);
    setCaptcha(generateCaptcha());
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

  const handleRefreshCaptcha = () => {
    setCaptcha(generateCaptcha());
  };

  const onSubmit = async (data) => {
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
      setCaptcha(generateCaptcha());
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
                  disabled={loading}
                />
              </Col>
              <Col xs={6}>
                <CustomInputField
                  name="username"
                  label="Username"
                  control={control}
                  errors={errors}
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
                  maxLength={10}
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
                  disabled={loading}
                />
              </Col>
            </Row>
            {/* CAPTCHA Display and Input */}
            <Row>
              <Col xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mt: 2,
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      background: "linear-gradient(45deg, #f3f4f6, #e5e7eb)",
                      border: "2px solid",
                      borderColor: "primary.main",
                      borderRadius: 2,
                      padding: 1.5,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      minWidth: 140,
                      position: "relative",
                      overflow: "hidden",
                      width: "95%",
                      marginBottom: 2,
                      "&:before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background:
                          "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0, 0, 0, 0.05) 10px, rgba(0, 0, 0, 0.05) 12px)",
                        opacity: 0.2,
                      },
                    }}
                    aria-label={`CAPTCHA code: ${captcha}`}
                  >
                    {captcha.split("").map((char, index) => (
                      <Box
                        key={index}
                        component="span"
                        sx={{
                          fontFamily: "monospace",
                          fontSize: { xs: 16, sm: 18 },
                          fontWeight: Math.random() > 0.5 ? 700 : 400,
                          color:
                            Math.random() > 0.5 ? "primary.main" : "#2d3748",
                          transform: `rotate(${Math.floor(
                            Math.random() * 31 - 15
                          )}deg) translateY(${Math.floor(
                            Math.random() * 6 - 3
                          )}px)`,
                          margin: "0 2px",
                          userSelect: "none",
                        }}
                      >
                        {char}
                      </Box>
                    ))}
                  </Box>
                  <IconButton
                    onClick={handleRefreshCaptcha}
                    disabled={loading}
                    sx={{
                      color: "primary.main",
                      border: "1px solid",
                      borderColor: "primary.main",
                      borderRadius: 2,
                      p: 1,
                      "&:hover": {
                        backgroundColor: "primary.light",
                        borderColor: "primary.dark",
                        transform: "scale(1.05)",
                      },
                    }}
                    aria-label="Refresh CAPTCHA"
                  >
                    <RefreshIcon />
                  </IconButton>
                </Box>
                <CustomInputField
                  label="Enter CAPTCHA"
                  name="captcha"
                  control={control}
                  placeholder="Enter the CAPTCHA code"
                  errors={errors}
                  aria-describedby="captcha-error"
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
            Department Officer?{" "}
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

import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Container,
  Link,
  CircularProgress,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useForm, Controller } from "react-hook-form";
import CustomButton from "../../components/CustomButton";
import OtpModal from "../../components/OtpModal";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Col, Row } from "react-bootstrap";
import { fetchDistricts } from "../../assets/fetch";
import { CheckCircleOutline } from "@mui/icons-material";

// Function to generate a random CAPTCHA
const generateCaptcha = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let captcha = "";
  for (let i = 0; i < 6; i++) {
    captcha += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return captcha;
};

export default function RegisterScreen() {
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const {
    handleSubmit,
    control,
    getValues,
    watch,
    formState: { errors, touchedFields },
    trigger,
    setValue,
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      mobileNumber: "",
      password: "",
      confirmPassword: "",
      captcha: "",
      District: "",
      Tehsil: "",
    },
  });
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [userId, setUserId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [tehsilOptions, setTehsilOptions] = useState([]);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const selectedDistrict = watch("District");
  const emailValue = watch("email"); // Watch email field for conditional rendering

  const navigate = useNavigate();

  // Debug OtpModal state
  useEffect(() => {
    console.log("OtpModal open state:", isOtpModalOpen);
  }, [isOtpModalOpen]);

  // Reset captcha field when captcha state changes
  useEffect(() => {
    setValue("captcha", "");
    setCaptcha(generateCaptcha());
  }, [setValue]);

  // Fetch districts on mount
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

  const handleRefreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setValue("captcha", "");
  }, [setValue]);

  // Handle email validation button click
  const handleEmailValidate = async () => {
    const isValid = await trigger("email");
    if (isValid && !errors.email) {
      setLoading(true);
      try {
        const email = getValues("email");
        const response = await axios.get("/Home/SendOtp", {
          params: { email },
        });
        if (response.data.status) {
          setIsOtpSent(true);
          setIsOtpModalOpen(true);
          setUserId(response.data.userId);
          toast.success("OTP sent to your email!", {
            position: "top-center",
            autoClose: 3000,
          });
        } else {
          toast.error("Failed to send OTP. Please try again.", {
            position: "top-center",
            autoClose: 3000,
          });
        }
      } catch (error) {
        console.error("Error sending OTP", error);
        toast.error("Error sending OTP.", {
          position: "top-center",
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const onSubmit = async (data) => {
    if (!isOtpVerified) {
      toast.error("Please verify OTP before registering.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value));

    try {
      const response = await axios.post("/Home/Register", formData);
      const { status } = response.data;
      if (status) {
        toast.success("Registration successful! Redirecting to login...", {
          position: "top-center",
          autoClose: 2000,
        });
        setTimeout(() => navigate("/login"), 2000);
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
      handleRefreshCaptcha();
    }
  };

  const handleOtpSubmit = async (otp) => {
    console.log("handleOtpSubmit called with OTP:", otp);
    if (!otp) {
      toast.error("Please enter an OTP.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    const email = getValues("email");
    formData.append("otp", otp);
    formData.append("email", email);

    try {
      const response = await axios.post("/Home/OTPValidation", formData);
      if (response.data.status) {
        setIsOtpVerified(true);
        setIsOtpModalOpen(false);
        toast.success("OTP verified successfully!", {
          position: "top-center",
          autoClose: 2000,
        });
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
    <>
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
                  <Controller
                    name="fullName"
                    control={control}
                    rules={{
                      required: "Full name is required",
                      minLength: {
                        value: 5,
                        message: "Full Name must be at least 5 characters",
                      },
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="Full Name"
                        variant="outlined"
                        fullWidth
                        disabled={loading}
                        error={!!error}
                        helperText={error ? error.message : ""}
                        sx={{ mb: 2 }}
                        aria-label="Full Name"
                      />
                    )}
                  />
                </Col>
                <Col xs={6}>
                  <Controller
                    name="username"
                    control={control}
                    rules={{
                      required: "Username is required",
                      minLength: {
                        value: 5,
                        message: "Username must be at least 5 characters",
                      },
                      validate: async (value) => {
                        if (!value) return "Username is required";
                        try {
                          const res = await axios.get("/Home/CheckUsername", {
                            params: { username: value },
                          });
                          return (
                            res.data?.isUnique || "Username already exists"
                          );
                        } catch {
                          return "Error checking username";
                        }
                      },
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="Username"
                        variant="outlined"
                        fullWidth
                        disabled={loading}
                        error={!!error}
                        helperText={error ? error.message : ""}
                        sx={{ mb: 2 }}
                        aria-label="Username"
                      />
                    )}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Controller
                      name="email"
                      control={control}
                      rules={{
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Invalid email format",
                        },
                        validate: async (value) => {
                          if (!value) return "Email is required";
                          try {
                            const res = await axios.get("/Home/CheckEmail", {
                              params: { email: value, UserType: "Citizen" },
                            });
                            return res.data?.isUnique || "Email already exists";
                          } catch {
                            return "Error checking email";
                          }
                        },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Email"
                          type="email"
                          variant="outlined"
                          fullWidth
                          disabled={loading || isOtpVerified}
                          error={!!error}
                          helperText={error ? error.message : ""}
                          sx={{ mb: 2, flex: 1 }}
                          aria-label="Email"
                        />
                      )}
                    />
                    {isOtpVerified && (
                      <Typography
                        variant="subtitle2"
                        color="success"
                        fontWeight="bold"
                      >
                        Verified
                      </Typography>
                    )}
                  </Box>
                  {!isOtpVerified && !errors.email && emailValue && (
                    <CustomButton
                      text="Validate Email"
                      bgColor="primary.main"
                      color="white"
                      width="100%"
                      disabled={loading}
                      onClick={handleEmailValidate}
                      sx={{ mb: 2 }}
                    />
                  )}
                </Col>
                <Col xs={6}>
                  <Controller
                    name="mobileNumber"
                    control={control}
                    rules={{
                      required: "Mobile Number is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Enter 10 digit number",
                      },
                      validate: async (value) => {
                        if (!value) return "Mobile Number is required";
                        try {
                          const res = await axios.get(
                            "/Home/CheckMobileNumber",
                            {
                              params: { number: value, UserType: "Citizen" },
                            }
                          );
                          return (
                            res.data?.isUnique || "Mobile Number already exists"
                          );
                        } catch {
                          return "Error checking mobile number";
                        }
                      },
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="Mobile Number"
                        type="tel"
                        variant="outlined"
                        fullWidth
                        disabled={loading}
                        error={!!error}
                        helperText={error ? error.message : ""}
                        inputProps={{ maxLength: 10 }}
                        sx={{ mb: 2 }}
                        aria-label="Mobile Number"
                      />
                    )}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={6}>
                  <Controller
                    name="password"
                    control={control}
                    rules={{
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                      maxLength: {
                        value: 12,
                        message: "Password must be at most 12 characters",
                      },
                      pattern: {
                        value:
                          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,12}$/,
                        message:
                          "Password must include uppercase, lowercase, number, and special character",
                      },
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        disabled={loading}
                        error={!!error}
                        helperText={error ? error.message : ""}
                        sx={{ mb: 2 }}
                        aria-label="Password"
                      />
                    )}
                  />
                </Col>
                <Col xs={6}>
                  <Controller
                    name="confirmPassword"
                    control={control}
                    rules={{
                      required: "Confirm your password",
                      validate: (value) =>
                        value === getValues("password") ||
                        "Passwords do not match",
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="Confirm Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        disabled={loading}
                        error={!!error}
                        helperText={error ? error.message : ""}
                        sx={{ mb: 2 }}
                        aria-label="Confirm Password"
                      />
                    )}
                  />
                </Col>
              </Row>
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
                  <Controller
                    name="captcha"
                    control={control}
                    rules={{
                      required: "CAPTCHA is required",
                      validate: (value) => {
                        console.log("Validating CAPTCHA:", { value, captcha });
                        return (
                          !captcha ||
                          value === captcha ||
                          "CAPTCHA is incorrect"
                        );
                      },
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="Enter CAPTCHA"
                        variant="outlined"
                        fullWidth
                        disabled={loading}
                        error={!!error}
                        helperText={error ? error.message : ""}
                        sx={{ mb: 2 }}
                        aria-describedby="captcha-error"
                      />
                    )}
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
                disabled={loading || !isOtpVerified}
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
              Department Officer ?
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
        {OtpModal && (
          <OtpModal
            open={isOtpModalOpen}
            onClose={() => {
              console.log("OtpModal onClose triggered");
              setIsOtpModalOpen(false);
            }}
            onSubmit={handleOtpSubmit}
          />
        )}

        {/* Toast */}
        <ToastContainer />
      </Box>

      {/* Full-screen loader */}
      {loading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
          }}
        >
          <CircularProgress size={60} color="primary" />
        </Box>
      )}
    </>
  );
}

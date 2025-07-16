import React, { useContext, useState } from "react";
import {
  Box,
  Typography,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import CustomInputField from "../../components/form/CustomInputField";
import CustomButton from "../../components/CustomButton";
import { Login } from "../../assets/fetch";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../UserContext";
import { ToastContainer, toast } from "react-toastify";
import CircularProgress from "@mui/material/CircularProgress";
import "react-toastify/dist/ReactToastify.css";

// Validation schema
const schema = yup.object().shape({
  username: yup.string().required("Username is required"),
  password: yup.string().min(6).required("Password is required"),
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
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("password", data.password);

    setLoading(true);
    try {
      const response = await Login(formData);

      if (response.status) {
        setToken(response.token);
        setUserType(response.userType);
        setProfile(response.profile);
        setUsername(response.username);
        setDesignation(response.designation);
        navigate("/verification");
      } else if (response.isEmailVerified === false) {
        const formDataEmail = new FormData();
        formDataEmail.append("email", response.email);

        const res = await fetch("/Home/SendEmailVerificationOtp", {
          method: "POST",
          body: formDataEmail,
        });

        const resJson = await res.json();

        if (resJson.status) {
          setEmail(response.email);
          setUsername(response.username);
          setOtpModalOpen(true);
          toast.success("OTP sent to your email.");
        } else {
          toast.error(resJson.message || "Failed to send OTP.");
        }
      } else {
        toast.error(response.response || "Invalid credentials.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("OTP must be 6 digits.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("otp", otp);

      const res = await fetch("/Home/VerifyEmailOtp", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (result.status) {
        setOtpModalOpen(false);
        toast.success("Email verified. Please login again.");
      } else {
        toast.error(result.message || "OTP verification failed.");
      }
    } catch (err) {
      toast.error("Error verifying OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    const formData = new FormData();
    formData.append("email", email);

    try {
      const res = await fetch("/Home/SendEmailVerificationOtp", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (result.status) {
        toast.success("OTP resent to your email.");
      } else {
        toast.error(result.message || "Failed to resend OTP.");
      }
    } catch (err) {
      toast.error("Error resending OTP.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: { xs: "90vh", lg: "80vh" },
        background:
          "linear-gradient(135deg,rgb(252, 252, 252) 0%,rgb(240, 236, 236) 100%)",
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
            transform: "translateY(-5px)",
          },
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography
            variant="h4"
            component="h1"
            id="login-title"
            sx={{ fontWeight: 700, color: "primary.main", mb: 1 }}
          >
            Login
          </Typography>
          {/* <Typography variant="body2" color="text.secondary">
            Sign in to continue
          </Typography> */}
        </Box>

        <Box
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <CustomInputField
            label="Username"
            name="username"
            control={control}
            placeholder="Enter your username"
            errors={errors}
            aria-describedby="username-error"
            disabled={loading}
          />

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

          <Box sx={{ textAlign: "right" }}>
            <Link
              href="/forgot-password"
              sx={{ fontSize: 14, color: "primary.main" }}
              underline="hover"
              aria-label="Forgot password"
            >
              Forgot Password/Username?
            </Link>
          </Box>

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

      {/* OTP Dialog */}
      <Dialog open={otpModalOpen} onClose={() => setOtpModalOpen(false)}>
        <DialogTitle>Verify Your Email</DialogTitle>
        <DialogContent>
          <Typography variant="body2" mb={1}>
            Enter the 6-digit OTP sent to <strong>{email}</strong>
          </Typography>
          <TextField
            fullWidth
            label="OTP"
            variant="outlined"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            slotProps={{ maxLength: 6 }}
            disabled={loading}
          />
          <Box mt={1}>
            <Link
              component="button"
              variant="body2"
              onClick={handleResendOtp}
              disabled={loading}
            >
              Resend OTP
            </Link>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOtpModalOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleOtpVerify}
            disabled={loading}
          >
            Verify
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </Box>
  );
}

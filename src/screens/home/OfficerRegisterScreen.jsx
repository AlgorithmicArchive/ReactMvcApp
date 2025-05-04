import React, { useEffect, useState } from "react";
import { Box, Typography, Container, Button } from "@mui/material";
import { useForm } from "react-hook-form";
import CustomInputField from "../../components/form/CustomInputField";
import CustomButton from "../../components/CustomButton";
import CustomSelectField from "../../components/form/CustomSelectField";
import { fetchDesignation, fetchDistricts } from "../../assets/fetch";
import OtpModal from "../../components/OtpModal";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReactLoading from "react-loading";

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
      if (!response.data.isUnique) {
        return "Username already exists";
      }
      return true;
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
      if (!response.data.isUnique) {
        return "Email already exists";
      }
      return true;
    } catch (error) {
      return "Error validating email";
    }
  };

  useEffect(() => {
    fetchDesignation(setDesignations, setAccessLevelMap);
    fetchDistricts(setDistrictOptions);
  }, []);

  // Fetch Tehsil values when District changes
  useEffect(() => {
    if (selectedDistrict) {
      axios
        .get(`/Base/GetTeshilForDistrict?districtId=${selectedDistrict}`)
        .then((response) => {
          if (response.data.status) {
            const tehsilOptionsFormatted = response.data.tehsils.map((tehsil) => ({
              label: tehsil.tehsilName,
              value: tehsil.tehsilId,
            }));
            setTehsilOptions(tehsilOptionsFormatted);
          }
        })
        .catch((error) => {
          console.error("Error fetching tehsils", error);
        });
    }
  }, [selectedDistrict]);

  // Handle form submission
  const onSubmit = async (data) => {
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
          : data["District"]
        : 0
    );
    try {
      const response = await axios.post("/Home/OfficerRegistration", formData);
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

  // Handle OTP submission
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
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 3,
          height: "120vh",
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
            Officer Registration
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

            <Box>
              <CustomSelectField
                label="Select Designation"
                name="designation"
                control={control}
                placeholder="Designation"
                options={designations}
                rules={{ required: "This field is required" }}
                errors={errors}
              />
              {(accessLevelMap[selectedDesignation] === "District" ||
                accessLevelMap[selectedDesignation] === "Tehsil") && (
                <CustomSelectField
                  label="Select District"
                  name="District"
                  control={control}
                  placeholder="Select District"
                  options={districtOptions}
                  rules={{ required: "This field is required" }}
                  errors={errors}
                />
              )}
              {accessLevelMap[selectedDesignation] === "Tehsil" && (
                <CustomSelectField
                  label="Select Tehsil"
                  name="Tehsil"
                  control={control}
                  placeholder="Select Tehsil"
                  options={tehsilOptions}
                  rules={{ required: "This field is required" }}
                  errors={errors}
                />
              )}
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
  );
}
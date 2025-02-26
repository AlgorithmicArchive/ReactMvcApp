import React, { useEffect, useState } from "react";
import { Box, Typography, Container } from "@mui/material";
import { useForm } from "react-hook-form";
import CustomInputField from "../../components/form/CustomInputField";
import CustomButton from "../../components/CustomButton";
import CustomSelectField from "../../components/form/CustomSelectField";
import { fetchDesignation, fetchDistricts } from "../../assets/fetch";
import OtpModal from "../../components/OtpModal";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Col, Row } from "react-bootstrap";

export default function OfficerRegisterScreen() {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm();

  const [designations, setDesignations] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [tehsilOptions, setTehsilOptions] = useState([]); // State for Tehsil values
  const [accessLevelMap, setAccessLevelMap] = useState({});
  const selectedDesignation = watch("designation");
  const selectedDistrict = watch("District"); // Watch for changes in District
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [userId, setUserId] = useState(0);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDesignation(setDesignations, setAccessLevelMap);
    fetchDistricts(setDistrictOptions);
  }, []);

  // Fetch Tehsil values when the District selection changes.
  useEffect(() => {
    if (selectedDistrict) {
      axios
        .get(`/Base/GetTeshilForDistrict?districtId=${selectedDistrict}`)
        .then((response) => {
          console.log(response);
          if (response.data.status) {
            console.log(response.data);
            // Convert tehsils to an array of objects with label and value properties
            const tehsilOptionsFormatted = response.data.tehsils.map(
              (tehsil) => ({
                label: tehsil.tehsilName,
                value: tehsil.tehsilId,
              })
            );
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
    console.log(formData);
    try {
      const response = await axios.post("/Home/OfficerRegistration", formData);
      const { status, userId } = response.data;
      setLoading(false);
      if (status) {
        setIsOtpModalOpen(true);
        setUserId(userId);
      }
    } catch (error) {
      setLoading(false);
      console.error("Registration error", error);
    }
  };

  const handleOtpSubmit = async (otp) => {
    const formdata = new FormData();
    formdata.append("otp", otp);
    formdata.append("UserId", userId);
    const response = await axios.post("/Home/OTPValidation", formdata);
    const { status } = response.data;
    if (status) navigate("/login");
  };

  return (
    <Box sx={{ backgroundColor: "background.default" }}>
      {loading && <LoadingSpinner />}
      <Box
        sx={{
          marginTop: "",
          width: "100vw",
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 3,
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            bgcolor: "primary.main",
            p: 4,
            borderRadius: 5,
            boxShadow: 20,
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
            Registration
          </Typography>

          <Box
            component="form"
            noValidate
            autoComplete="off"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Row>
              <Col xs={12} lg={6}>
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
                    rules={{ required: "This Field is required" }}
                    label="Username"
                    name="username"
                    control={control}
                    placeholder="Username"
                    errors={errors}
                  />
                </Box>
              </Col>
              <Col xs={12} lg={6}>
                <Box>
                  <CustomInputField
                    rules={{ required: "This Field is required" }}
                    label="Email"
                    name="email"
                    control={control}
                    placeholder="Email"
                    type="email"
                    errors={errors}
                  />
                  <CustomInputField
                    rules={{ required: "This Field is required" }}
                    label="Mobile Number"
                    name="mobileNumber"
                    control={control}
                    placeholder="Mobile Number"
                    errors={errors}
                  />
                </Box>
              </Col>
              <Col xs={12} lg={6}>
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
                </Box>
              </Col>
              <Col xs={12} lg={6}>
                <Box>
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
              </Col>
              <Col xs={12} lg={6}>
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
                </Box>
              </Col>
              <Col xs={12} lg={6}>
                <Box>
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
                </Box>
              </Col>
              <Col xs={12} lg={6}>
                <Box>
                  {accessLevelMap[selectedDesignation] === "Tehsil" && (
                    <CustomSelectField
                      label="Select Tehsil"
                      name="Tehsil"
                      control={control}
                      placeholder="Select Tehsil"
                      options={tehsilOptions} // Use fetched tehsil options here
                      rules={{ required: "This field is required" }}
                      errors={errors}
                    />
                  )}
                </Box>
              </Col>
              <Col xs={12} lg={12}>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <CustomButton
                    text="Register"
                    bgColor="background.paper"
                    color="primary.main"
                    type="submit" // Set type to "submit" for form submission
                  />
                </Box>
              </Col>
              <OtpModal
                open={isOtpModalOpen}
                onClose={() => setIsOtpModalOpen(false)}
                onSubmit={handleOtpSubmit}
              />
            </Row>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

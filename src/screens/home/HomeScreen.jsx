import { Box, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import CustomButton from "../../components/CustomButton";
import CustomInputField from "../../components/form/CustomInputField";
import CustomTextarea from "../../components/form/CustomTextArea";
import { Email, Phone, LocationOn, AccessTime } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Col, Container, Row } from "react-bootstrap";

// Define validation schema using Yup
const schema = yup.object().shape({
  fullName: yup.string().required("Full Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  message: yup.string().required("Message is required"),
});

export default function HomeScreen() {
  // Initialize useForm
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Create a ref for Section 3
  const section3Ref = useRef(null);

  const [contactMsg, setContactMsg] = useState("");

  // Scroll to Section 3 when triggered
  useEffect(() => {
    const handleScrollToSection = (event) => {
      if (event.detail === "section3") {
        section3Ref.current?.scrollIntoView({ behavior: "smooth" });
      }
    };

    window.addEventListener("scrollToSection", handleScrollToSection);

    return () => {
      window.removeEventListener("scrollToSection", handleScrollToSection);
    };
  }, []);

  // Handle form submission
  const onSubmit = async (data) => {
    console.log("Form Data:", data);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await axios.post("/Home/Contact", formData);
    const result = response.data;
    if (result.status) setContactMsg(result.message);
  };
  const navigate = useNavigate();

  return (
    <Container
      fluid
      style={{
        paddingTop: "50px",
        paddingBottom: "50px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Row className="gap-3 mb-5">
        <Col md={12} xs={12} className="d-flex justify-content-center">
          <Box
            component={"img"}
            src="/assets/images/socialwelfare.png"
            sx={{
              backgroundColor: "primary.main",
              borderRadius: 5,
              width: { xs: "80vw", md: "25vw" },
            }}
          />
        </Col>
        <Col md={12} xs={12} className="d-flex justify-content-center">
          <CustomButton
            text={"Get Started"}
            onClick={() => navigate("/login")}
          />
        </Col>
      </Row>
      <Row className="mt-5 mb-5">
        <Col md={12} xs={12} className="mb-5">
          <Typography sx={{ textAlign: "center", fontSize: "48px" }}>
            Services
          </Typography>
        </Col>
        {[
          { url: "LadliBeti.png", label: "Ladli Beti" },
          { url: "Pension.png", label: "Pension Scheme" },
          { url: "marriage.png", label: "Marriage Assistance" },
        ].map((service, index) => (
          <Col
            key={index}
            md={4}
            xs={12}
            className="d-flex flex-column justify-content-center align-items-center"
          >
            <Box
              component={"img"}
              src={`/assets/images/${service.url}`}
              sx={{
                position: "relative",
                width: { xs: "80vw", md: "25vw" },
                borderRadius: 5,
                backgroundColor: "primary.main",
              }}
            />
            <Typography
              sx={{
                color: "primary.main",
                fontWeight: "bold",
                textAlign: "center",
                width: "85%",
              }}
            >
              {service.label}
            </Typography>
          </Col>
        ))}
      </Row>
      <Row className="mt-5 gap-md-0 gap-5">
        <Col md={6} xs={12}>
          <Box
            sx={{
              flex: 1,
              backgroundColor: "primary.main",
              padding: "50px",
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
              borderRadius: "10px",
              color: "background.paper",
              width: "100%",
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: "bold", mb: 2 }}>
              Contact Us
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
              Feel free to contact us any time. We will get back to you as soon
              as we can!
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
              <CustomInputField
                label="Full Name"
                name="fullName"
                control={control}
                placeholder="Enter your full name"
                rules={{ required: "Full Name is required" }}
                errors={errors}
              />
              <CustomInputField
                label="Email"
                name="email"
                control={control}
                type="email"
                placeholder="Enter your email"
                rules={{ required: "Email is required" }}
                errors={errors}
              />
              <CustomTextarea
                label="Message"
                name="message"
                control={control}
                placeholder="Enter your message"
                rules={{ required: "Message is required" }}
              />

              <CustomButton
                text="SEND"
                bgColor="background.paper"
                color="primary.main"
                type="submit"
              />
              {contactMsg != "" && (
                <Typography sx={{ color: "background.paper" }}>
                  {contactMsg}
                </Typography>
              )}
            </form>
          </Box>
        </Col>
        <Col
          md={6}
          xs={12}
          className="d-flex justify-content-center align-items-center"
        >
          <Box
            sx={{
              backgroundColor: "text.primary",
              color: "background.paper",
              padding: "50px",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 4 }}>
              Info
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Email sx={{ mr: 2 }} />
              <Typography>info@getintouch.we</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Phone sx={{ mr: 2 }} />
              <Typography>+24 56 89 146</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <LocationOn sx={{ mr: 2 }} />
              <Typography>14 Greenroad St.</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <AccessTime sx={{ mr: 2 }} />
              <Typography>09:00 - 18:00</Typography>
            </Box>
          </Box>
        </Col>
      </Row>
    </Container>
  );
}

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

  return (
    <Box sx={{ backgroundColor: "background.default" }}>
      {/* Section 1 */}
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 3,
        }}
      >
        <Box sx={{ backgroundColor: "primary.main", borderRadius: 5 }}>
          <img
            src="/assets/images/socialwelfare.png"
            alt="HOME Image"
            style={{ width: "30vw" }}
          />
        </Box>
        <CustomButton text={"Get Started"} />
      </Box>

      {/* Section 2 */}
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <Typography variant="h2" sx={{ color: "white" }}>
          Services
        </Typography>
        {/* Service Boxes */}
        <Box sx={{ display: "flex", gap: 20 }}>
          {[
            { url: "LadliBeti.png", label: "Ladli Beti" },
            { url: "Pension.png", label: "Pension Scheme" },
            { url: "marriage.png", label: "Marriage Assistance" },
          ].map((service, index) => (
            <Box
              key={index}
              sx={{
                position: "relative",
                width: "20vw",
                borderRadius: 5,
                backgroundColor: "primary.main",
              }}
            >
              <img
                src={`/assets/images/${service.url}`}
                alt={service.url}
                style={{
                  width: "100%",
                  borderRadius: "5px",
                  display: "block",
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  position: "absolute",
                  bottom: "5px",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: "background.paper",
                  fontWeight: "bold",
                  width: "100%",
                  textAlign: "center",
                }}
              >
                {service.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Section 3 */}
      <Box
        ref={section3Ref}
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "50px",
            backgroundColor: "background.paper",
            borderRadius: 10,
            gap: 5,
          }}
        >
          {/* Left Section (Contact Form) */}
          <Box
            sx={{
              flex: 1,
              backgroundColor: "primary.main",
              padding: "50px",
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
              borderRadius: "10px",
              color: "background.paper",
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: "bold", mb: 2 }}>
              Contact Us
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
              Feel free to contact us any time. We will get back to you as soon
              as we can!
            </Typography>

            {/* Contact Form */}
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

          {/* Right Section (Info) */}
          <Box
            sx={{
              flex: 1,
              backgroundColor: "text.primary",
              padding: "50px",
              color: "background.paper",
              borderRadius: "10px",
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 4 }}>
              Info
            </Typography>

            {/* Contact Information */}
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
        </Box>
      </Box>
    </Box>
  );
}

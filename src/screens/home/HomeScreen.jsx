import { Box, TextField, Typography } from "@mui/material";
import React, { useEffect, useRef } from "react";
import { Col, Container, Row } from "react-bootstrap";
import CustomCard from "../../components/CustomCard";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import PlaceIcon from "@mui/icons-material/Place";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function HomeScreen() {
  const navigate = useNavigate();
  const section1Ref = useRef();
  const card1Ref = useRef();
  const card2Ref = useRef();
  const card3Ref = useRef();
  const section3Ref = useRef();

  useEffect(() => {
    gsap.fromTo(
      section1Ref.current,
      { opacity: 1 }, // initial state: fully visible, at its original position
      {
        opacity: 0, // fade out
        duration: 1,
        scrollTrigger: {
          trigger: section1Ref.current,
          start: "bottom 90%", // trigger when the section starts entering the viewport
          scrub: true, // scrub ensures the animation stays in sync with the scroll position
          toggleActions: "restart none none none", // restart animation when re-triggered
        },
      }
    );

    gsap.fromTo(
      [card1Ref.current, card2Ref.current, card3Ref.current], // Array of elements to animate
      {
        x: -200, // Initial position to the left
        opacity: 0, // Initial opacity is 0
      },
      {
        x: 0, // Final position (center)
        opacity: 1, // Final opacity (fully visible)
        duration: 1,
        delay: 0.2,
        stagger: 0.2, // Stagger animation for each card
        ease: "power2.out", // Ease function for smooth animation
        scrollTrigger: {
          trigger: card1Ref.current, // Trigger animation when the first card is in view
          start: "top 80%", // Start when the top of the trigger is 80% from the top of the viewport
          end: "bottom 20%", // End when the bottom of the trigger is 20% from the top of the viewport
          toggleActions: "play reverse play reverse", // Play on enter, reverse on leave (both directions)
        },
      }
    );

    gsap.fromTo(
      section3Ref.current,
      { x: -200, opacity: 0 }, // Initial state: invisible, positioned to the left
      {
        x: 0, // Move to its original position
        opacity: 1, // Fade in
        duration: 1,
        stagger: 0.2, // Stagger each element (if needed)
        ease: "power2.out", // Animation easing
        scrollTrigger: {
          trigger: section3Ref.current,
          start: "top 50%", // Animation starts when the section comes into view
          toggleActions: "restart none reverse none", // Reset animation on scroll back up
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <Box sx={{ width: "100%" }}>
      {/* Section 1 */}
      <Box
        ref={section1Ref}
        sx={{
          height: "70vh",
          width: "100%",
        }}
      >
        <Container>
          <Row>
            <Col xs={12} lg={6}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-evenly",
                  gap: 5,
                }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: "bold",
                    wordBreak: "break-word", // ensures words break properly
                    maxWidth: "500px", // set your desired width
                  }}
                >
                  Facilitating Financial Assistance for Every Citizen
                </Typography>

                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "text.secondary",
                    maxWidth: "500px", // match width if you want consistent layout
                    wordBreak: "break-word",
                  }}
                >
                  Submit your application for welfare schemes through a
                  transparent and structured process. Each form is carefully
                  evaluated and processed across designated phases before
                  approval and sanction.
                </Typography>

                <Box
                  component="button"
                  sx={{
                    border: "none",
                    backgroundColor: "primary.main",
                    padding: 1,
                    width: "50%",
                    color: "#FDF6F0",
                    fontWeight: "bold",
                  }}
                  onClick={() => navigate("/login")}
                >
                  Get Started
                </Box>
              </Box>
            </Col>
            <Col
              xs={12}
              lg={6}
              style={{
                display: "flex",
                justifyContent: "end",
              }}
            >
              <Box
                component={"img"}
                src="/assets/images/socialwelfare.png"
                sx={{
                  width: 500,
                  backgroundColor: "background.default",
                  borderRadius: 5,
                }}
              />
            </Col>
          </Row>
        </Container>
      </Box>
      {/* Section 2 */}
      <Box
        sx={{
          height: "100vh",
          width: "100%",
          backgroundColor: "background.default",
        }}
      >
        <Container
          style={{
            height: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              padding: 10,
            }}
          >
            <Row>
              <Col
                xs={12}
                lg={12}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h1" sx={{ textAlign: "center" }}>
                  Services Provided
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    textAlign: "center",
                    color: "text.secondary",
                    wordBreak: "break-word",
                    padding: 5,
                  }}
                >
                  Our platform offers a wide array of government-backed
                  financial assistance services designed to support economically
                  and socially vulnerable citizens. From scheme-specific
                  applications to transparent processing and sanctioning, each
                  service is aimed at promoting inclusive development and
                  ensuring timely support reaches those who need it most.
                </Typography>
              </Col>
            </Row>
            <Row>
              <Col xs={12} lg={4}>
                <div ref={card1Ref}>
                  <CustomCard
                    heading={"Ladli Beti"}
                    discription={
                      "Aimed at promoting the education and well-being of the girl child, this scheme provides financial support to families for the upbringing and education of daughters. Eligible beneficiaries receive structured monetary assistance at different stages of the child's development to reduce gender disparity and encourage empowerment."
                    }
                  />
                </div>
              </Col>
              <Col xs={12} lg={4}>
                <div ref={card2Ref}>
                  <CustomCard
                    heading={"Marriage Assistance"}
                    discription={
                      "This scheme extends financial assistance to economically disadvantaged women at the time of their marriage. It is intended to support families facing financial constraints, ensuring dignity and reducing the economic burden associated with marriage expenses."
                    }
                  />
                </div>
              </Col>
              <Col xs={12} lg={4}>
                <div ref={card3Ref}>
                  <CustomCard
                    heading={"JKISSS Pension"}
                    discription={
                      "This comprehensive pension program offers financial security to senior citizens, persons with disabilities, women in distress, and transgender individuals. Monthly pension support ensures dignity, inclusion, and sustenance for those in need, contributing to social justice and welfare."
                    }
                  />
                </div>
              </Col>
            </Row>
          </Box>
        </Container>
      </Box>
      {/* Section 3 */}
      <Box
        ref={section3Ref}
        sx={{
          height: "100vh",
          width: "100%",
        }}
      >
        <Container
          style={{
            height: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Row>
              <Col xs={12} lg={6}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <TextField
                    name="FullName"
                    placeholder="Full Name"
                    label="Full Name"
                    sx={{ width: "80%", borderColor: "text.primary" }}
                  />
                  <TextField
                    name="Email"
                    placeholder="Email"
                    label="Email"
                    sx={{ width: "80%", borderColor: "text.primary" }}
                  />
                  <TextField
                    name="Subject"
                    placeholder="Subject"
                    label="Subject"
                    sx={{ width: "80%", borderColor: "text.primary" }}
                  />
                  <TextField
                    name="Message"
                    placeholder="Message"
                    label="Message"
                    multiline
                    rows={5}
                    sx={{ width: "80%", borderColor: "text.primary" }}
                  />
                  <Box
                    component="button"
                    sx={{
                      border: "none",
                      backgroundColor: "primary.main",
                      padding: 1,
                      width: "50%",
                      color: "#FDF6F0",
                      fontWeight: "bold",
                    }}
                  >
                    Send Message
                  </Box>
                </Box>
              </Col>
              <Col xs={12} lg={6}>
                <Typography variant="h5" sx={{ color: "text.primary" }}>
                  Contact Us
                </Typography>
                <Typography variant="h3" sx={{ color: "text.primary" }}>
                  Get In Touch
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ color: "text.secondary" }}
                >
                  We are here to assist you with any queries regarding welfare
                  schemes, application processes, or general information.
                  Whether you're looking to apply, follow up on an existing
                  request, or simply learn more about our services, feel free to
                  reach out. Our team is committed to providing prompt,
                  transparent, and supportive responses to ensure every citizen
                  receives the help they need. Your questions matter to us, and
                  we're just a message or call away.
                </Typography>
                <Row>
                  <Col xs={6} lg={6}>
                    <Box sx={{ display: "flex", marginTop: 5 }}>
                      <LocalPhoneIcon sx={{ fontSize: 50 }} />
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography>Call Us</Typography>
                        <Typography
                          variant="subtitle1"
                          sx={{ color: "text.secondary" }}
                        >
                          91XXXXX9238
                        </Typography>
                      </Box>
                    </Box>
                  </Col>
                  <Col xs={6} lg={6}>
                    <Box sx={{ display: "flex", marginTop: 5 }}>
                      <AlternateEmailIcon sx={{ fontSize: 50 }} />
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography>Email Us</Typography>
                        <Typography
                          variant="subtitle1"
                          sx={{ color: "text.secondary" }}
                        >
                          example@gmail.com
                        </Typography>
                      </Box>
                    </Box>
                  </Col>
                </Row>
                <Row>
                  <Col xs={6} lg={6}>
                    <Box sx={{ display: "flex", marginTop: 5 }}>
                      <PlaceIcon sx={{ fontSize: 50 }} />
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography>Address</Typography>
                        <Typography
                          variant="subtitle1"
                          sx={{ color: "text.secondary" }}
                        >
                          22,B.Baker Street
                        </Typography>
                      </Box>
                    </Box>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

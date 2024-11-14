import React from "react";
import { Box, Typography, Button, Grid2 } from "@mui/material";
import GoogleTranslateWidget from "./GoogleTranslateWidget"; // Import the Google Translate Widget
import { Container, Row, Col } from "react-bootstrap";
import MyNavbar from "./Navbar";

const Header = () => {
  return (
    <Container fluid style={{ position: "fixed", top: 0, zIndex: 1000 }}>
      <Row
        style={{ backgroundColor: "#312C51", color: "#F0C38E", padding: 10 }}
      >
        <Col
          md={6}
          sm={12}
          className="d-flex gap-3 justify-content-center flex-md-row flex-column"
        >
          <Typography>जम्मू और कश्मीर सरकार</Typography>
          <Typography>GOVERNMENT OF JAMMU AND KASHMIR</Typography>
          <Typography>حکومت جموں و کشمیر</Typography>
        </Col>
        <Col
          md={6}
          sm={12}
          className="d-flex gap-3 justify-content-center flex-md-row flex-column"
        >
          <Typography sx={{ fontSize: "18px", fontWeight: "bold" }}>
            Aa
          </Typography>
          <GoogleTranslateWidget />
        </Col>
      </Row>
      <Row style={{ backgroundColor: "#FFFFFF", padding: 10 }}>
        <Col
          md={6}
          sm={12}
          className="d-flex justify-content-center flex-md-row flex-column"
        >
          <img
            src="/assets/images/emblem.png"
            alt="Gov Emblem"
            className="me-md-0 mx-auto"
            style={{ width: "5vw" }}
          />
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              fontWeight: "bold",
              color: "background.default",
            }}
          >
            समाज कल्याण विभाग
            <br />
            DEPARTMENT OF SOCIAL WELFARE
            <br />
            محکمہ سوشیل ویلفیئر
          </Typography>
        </Col>
        <Col
          md={6}
          sm={12}
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <img
            src="/assets/images/swach-bharat.png"
            alt="Swachh Bharat"
            style={{ height: "80px" }}
          />
        </Col>
      </Row>
      <Row>
        <MyNavbar />
      </Row>
    </Container>
  );
};

export default Header;

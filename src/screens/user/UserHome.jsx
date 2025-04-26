import React, { useEffect, useRef, useState } from "react";
import { Box, Divider, Typography } from "@mui/material";

import axiosInstance from "../../axiosConfig";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Col, Container, Row } from "react-bootstrap";

export default function UserHome() {
  const [userDetails, setUserDetails] = useState(null);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ file: "", url: "" });

  async function GetUserDetails() {
    const response = await axiosInstance.get("/User/GetUserDetails");
    setUserDetails(response.data);
    setLoading(false);
    setProfile({ file: "", url: response.data.profile });
  }

  useEffect(() => {
    GetUserDetails();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    // <Box sx={{ width: "100%", height: "70vh" }}>
    //   <Container>
    //     <Box
    //       sx={{
    //         width: "100%",
    //         height: "100%",
    //         display: "flex",
    //         flexDirection: "column",
    //         justifyContent: "center",
    //         alignItems: "center",
    //         gap: 10,
    //         padding: 5,
    //         borderRadius: 5,
    //         boxShadow: 5,
    //       }}
    //     >
    //       <Box
    //         sx={{
    //           display: "flex",
    //           justifyContent: "center",
    //           alignItems: "center",
    //           width: "max-content",
    //           gap: 5,
    //         }}
    //       >
    //         <Box
    //           component={"img"}
    //           src={profile.url}
    //           alt="User Profile Picture"
    //           sx={{ width: 200, borderRadius: 25 }}
    //         />
    //       </Box>

    //       <Row style={{ width: "100%" }}>
    //         <Col
    //           xs={12}
    //           lg={4}
    //           style={{
    //             display: "flex",
    //             flexDirection: "column",
    //           }}
    //           className="shadow-lg p-3"
    //         >
    //           <Typography
    //             sx={{
    //               fontWeight: "bold",
    //               fontSize: "18px",
    //               textAlign: "center",
    //             }}
    //           >
    //             Initiated Applications
    //           </Typography>
    //           <Typography
    //             sx={{
    //               fontWeight: "bold",
    //               fontSize: "18px",
    //               textAlign: "center",
    //             }}
    //           >
    //             {userDetails.initiated}
    //           </Typography>
    //         </Col>
    //         <Col
    //           xs={12}
    //           lg={4}
    //           style={{
    //             display: "flex",
    //             flexDirection: "column",
    //           }}
    //           className="shadow-lg p-3"
    //         >
    //           <Typography
    //             sx={{
    //               fontWeight: "bold",
    //               fontSize: "18px",
    //               textAlign: "center",
    //             }}
    //           >
    //             Incomplete Applications
    //           </Typography>
    //           <Typography
    //             sx={{
    //               fontWeight: "bold",
    //               fontSize: "18px",
    //               textAlign: "center",
    //             }}
    //           >
    //             {userDetails.incomplete}
    //           </Typography>
    //         </Col>
    //         <Col
    //           xs={12}
    //           lg={4}
    //           style={{
    //             display: "flex",
    //             flexDirection: "column",
    //           }}
    //           className="shadow-lg p-3"
    //         >
    //           <Typography
    //             sx={{
    //               fontWeight: "bold",
    //               fontSize: "18px",
    //               textAlign: "center",
    //             }}
    //           >
    //             Sanctioned Applications
    //           </Typography>
    //           <Typography
    //             sx={{
    //               fontWeight: "bold",
    //               fontSize: "18px",
    //               textAlign: "center",
    //             }}
    //           >
    //             {userDetails.sanctioned}
    //           </Typography>
    //         </Col>
    //       </Row>
    //       <Box sx={{ display: "flex", flexDirection: "column" }}>
    //         <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
    //           Full Name
    //         </Typography>
    //         <Typography>{userDetails.name}</Typography>
    //         <Divider
    //           orientation="horizontal"
    //           flexItem
    //           sx={{ borderColor: "text.primary" }}
    //         />
    //         <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
    //           Username
    //         </Typography>
    //         <Typography>{userDetails.username}</Typography>
    //         <Divider
    //           orientation="horizontal"
    //           flexItem
    //           sx={{ borderColor: "text.primary" }}
    //         />
    //         <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
    //           Email
    //         </Typography>
    //         <Typography>{userDetails.email}</Typography>
    //         <Divider
    //           orientation="horizontal"
    //           flexItem
    //           sx={{ borderColor: "text.primary" }}
    //         />
    //         <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
    //           Mobile Number
    //         </Typography>
    //         <Typography>{userDetails.mobileNumber}</Typography>
    //       </Box>
    //     </Box>
    //   </Container>
    // </Box>

    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: { xs: "100vh", md: "70vh" },
      }}
    >
      <Container
        style={{
          height: "80%",
          padding: 0,
        }}
      >
        <Row style={{ height: "100%" }} className="g-0">
          <Col xs={12} lg={6}>
            <Box
              sx={{
                backgroundColor: "background.default",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%", // ensures it fills the parent Col
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Box
                component="img"
                src={profile.url}
                sx={{
                  width: "45%",
                  maxWidth: "100%",
                  height: "auto",
                }}
              />
              <Typography
                variant="h4"
                sx={{ fontFamily: "'Playfair Display', serif" }}
              >
                {userDetails.name}
              </Typography>
            </Box>
          </Col>
          <Col
            xs={12}
            lg={6}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "15px 15px 15px rgba(0, 0, 0, 0.1)",
              borderTop: "1px solid #333333",
            }}
          >
            <Box sx={{ width: { xs: "100%", lg: "80%" } }}>
              <Typography
                variant="h3"
                sx={{ fontFamily: "ariel", textAlign: "center" }}
              >
                User Profile
              </Typography>
              <Box
                sx={{
                  backgroundColor: "background.default",
                  padding: { xs: 2, lg: 10 },
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ color: "gray", fontSize: 14 }}>
                    Username
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: 12, lg: 16 },
                      width: "40%",
                      textAlign: "left",
                    }}
                  >
                    {userDetails.username}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ color: "gray", fontSize: 14 }}>
                    Email
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: 12, lg: 16 },
                      width: "40%",
                      textAlign: "left",
                    }}
                  >
                    {userDetails.email}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ color: "gray", fontSize: 14 }}>
                    Mobile Number
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: 12, lg: 16 },
                      width: "40%",
                      textAlign: "left",
                    }}
                  >
                    {userDetails.mobileNumber}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ color: "gray", fontSize: 14 }}>
                    Initiated Applications
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: 12, lg: 16 },
                      width: "40%",
                      textAlign: "left",
                    }}
                  >
                    {userDetails.initiated}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ color: "gray", fontSize: 14 }}>
                    Incomplete Applications
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: 12, lg: 16 },
                      width: "40%",
                      textAlign: "left",
                    }}
                  >
                    {userDetails.incomplete}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ color: "gray", fontSize: 14 }}>
                    Sanctioned Applications
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: 12, lg: 16 },
                      width: "40%",
                      textAlign: "left",
                    }}
                  >
                    {userDetails.sanctioned}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Col>
        </Row>
      </Container>
    </Box>
  );
}

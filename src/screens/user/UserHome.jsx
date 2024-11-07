import React, { useEffect, useState } from "react";
import { Box, Divider, Typography } from "@mui/material";
import Container from "../../components/grid/Container";
import Row from "../../components/grid/Row";
import Col from "../../components/grid/Col";
import axiosInstance from "../../axiosConfig";
import LoadingSpinner from "../../components/LoadingSpinner";
import CustomButton from "../../components/CustomButton";

export default function UserHome() {
  const [userDetails, setUserDetails] = useState();
  const [used, setUsed] = useState([]);
  const [unused, setUnussed] = useState([]);
  const [loading, setLoading] = useState(true);
  async function GetUserDetails() {
    const response = await axiosInstance.get("/User/GetUserDetails");
    setUserDetails(response.data);
    setLoading(false);
    const backupCodes = JSON.parse(response.data.backupCodes);
    setUsed(backupCodes.used);
    setUnussed(backupCodes.unused);
  }
  useEffect(() => {
    GetUserDetails();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Container>
        <Row>
          <Col md={4} xs={12}>
            <Box
              sx={{
                border: "2px solid",
                borderColor: "primary.main",
                borderRadius: 3,
                padding: 3,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                gap: 3,
                height: "60vh",
                backgroundColor: "background.paper",
              }}
            >
              <img
                src={userDetails.profile}
                alt="User Profile Picture"
                style={{ width: "15vw", height: "30vh" }}
              />
              <CustomButton text="Change Image" onClick={() => {}} />
              <Divider />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Typography sx={{ fontWeight: "bold" }}>Name:</Typography>
                <Typography sx={{ fontWeight: "bold" }}>
                  {userDetails.name}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Typography sx={{ fontWeight: "bold" }}>Username:</Typography>
                <Typography sx={{ fontWeight: "bold" }}>
                  {userDetails.username}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Typography sx={{ fontWeight: "bold" }}>Email:</Typography>
                <Typography sx={{ fontWeight: "bold" }}>
                  {userDetails.email}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Typography sx={{ fontWeight: "bold" }}>
                  Mobile Number:
                </Typography>
                <Typography sx={{ fontWeight: "bold" }}>
                  {userDetails.mobileNumber}
                </Typography>
              </Box>
            </Box>
          </Col>
          <Col md={8} xs={12}>
            <Box
              sx={{
                border: "2px solid",
                borderColor: "primary.main",
                borderRadius: 3,
                padding: 3,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                gap: 3,
                height: "60vh",
                backgroundColor: "background.paper",
              }}
            >
              <Divider />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Typography sx={{ fontWeight: "bold" }}>
                  Initiated Applications:
                </Typography>
                <Typography sx={{ fontWeight: "bold" }}>
                  {userDetails.initiated}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Typography sx={{ fontWeight: "bold" }}>
                  Icomplete Applications:
                </Typography>
                <Typography sx={{ fontWeight: "bold" }}>
                  {userDetails.incomplete}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Typography sx={{ fontWeight: "bold" }}>
                  Sanctioned Applications:
                </Typography>
                <Typography sx={{ fontWeight: "bold" }}>
                  {userDetails.sanctioned}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                <Row>
                  {unused.map((item) => (
                    <Col md={3} xs={6}>
                      <Typography
                        sx={{
                          padding: 3,
                          backgroundColor: "primary.main",
                          color: "background.paper",
                          borderRadius: 3,
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        {item}
                      </Typography>
                    </Col>
                  ))}
                  {used.map((item) => (
                    <Col md={3} xs={6}>
                      <Typography
                        sx={{
                          padding: 3,
                          backgroundColor: "primary.main",
                          color: "background.paper",
                          borderRadius: 3,
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        {item}
                      </Typography>
                    </Col>
                  ))}
                </Row>
              </Box>
            </Box>
          </Col>
        </Row>
      </Container>
    </Box>
  );
}

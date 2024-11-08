import React, { useEffect, useRef, useState } from "react";
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
  const [profile, setProfile] = useState({ file: "", url: "" });
  const [save, setSave] = useState(false);
  async function GetUserDetails() {
    const response = await axiosInstance.get("/User/GetUserDetails");
    setUserDetails(response.data);
    setLoading(false);
    setProfile({ file: "", url: response.data.profile });
    const backupCodes = JSON.parse(response.data.backupCodes);
    setUsed(backupCodes.used);
    setUnussed(backupCodes.unused);
  }

  const profileRef = useRef(null);
  const handleProfileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfile({ file: file, url: imageUrl }); // Set the image URL for the preview
      setSave(true);
    }
  };

  const handleSaveProfile = async () => {
    const formdata = new FormData();
    formdata.append("profile", profile.file);
    const response = await axiosInstance.post("/Profile/ChangeImage", formdata);
    console.log(response.data);
  };

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
                src={profile.url}
                alt="User Profile Picture"
                style={{ width: "15vw", height: "30vh" }}
              />
              <input
                type="file"
                ref={profileRef}
                hidden
                onChange={handleProfileChange}
              />
              {!save && (
                <CustomButton
                  text="Change Image"
                  onClick={() => profileRef.current.click()}
                />
              )}
              {save && <CustomButton text="Save" onClick={handleSaveProfile} />}
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

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
                  Backup Codes
                </Typography>
                <Row>
                  {unused.map((item, index) => (
                    <Col key={index} md={3} xs={6}>
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
                  {used.map((item, index) => (
                    <Col key={index} md={3} xs={6}>
                      <Typography
                        sx={{
                          padding: 3,
                          backgroundColor: "text.primary",
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

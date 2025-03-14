import { Box, Divider, Typography } from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import axiosInstance from "../axiosConfig";
import CustomButton from "../components/CustomButton";
import { UserContext } from "../UserContext";
import { Col, Row } from "react-bootstrap";

export default function Settings() {
  const { setProfile } = useContext(UserContext);
  const [userDetails, setUserDetails] = useState(null);
  const [used, setUsed] = useState([]);
  const [unused, setUnussed] = useState([]);
  const [save, setSave] = useState(false);
  const [profile, setLocalProfile] = useState({ file: "", url: "" });
  const profileRef = useRef(null);
  const handleProfileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setLocalProfile({ file: file, url: imageUrl }); // Set the image URL for the preview
      setSave(true);
    }
  };

  const handleNewCodes = async () => {
    const response = await axiosInstance.get("/Profile/GenerateBackupCodes");
    const result = response.data;
    if (result.status) window.location.reload();
  };

  const handleSaveProfile = async () => {
    const formdata = new FormData();
    formdata.append("profile", profile.file);
    const response = await axiosInstance.post("/Profile/ChangeImage", formdata);
    setProfile(response.filePath);
    setSave(false);
  };

  async function GetUserDetails() {
    const response = await axiosInstance.get("/Profile/GetUserDetails");
    setUserDetails(response.data);
    setLocalProfile({ file: "", url: response.data.profile });
    const backupCodes = JSON.parse(response.data.backupCodes);
    setUsed(backupCodes.used);
    setUnussed(backupCodes.unused);
  }

  useEffect(() => {
    GetUserDetails();
  }, []);

  return (
    <Box
      sx={{
        height: { xs: "100vh", md: "110vh" },
        widht: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "120px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 5,
          borderColor: "primary.main",
          border: "3px solid",
          borderRadius: 3,
          padding: 5,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            width: "max-content",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            gap: 2,
          }}
        >
          <Box
            sx={{
              borderColor: "primary.main",
              border: "3px solid",
              borderRadius: 3,
              width: { xs: "100%", md: "max-content" },
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <img
              src={profile.url}
              alt="User Profile Picture"
              style={{ width: "100%", height: "30vh" }}
            />
          </Box>
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
        </Box>
        <Divider
          sx={{
            width: "100%",
            borderColor: "primary.main",
            borderWidth: "2px",
          }}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
            Backup Codes
          </Typography>
          <Row className="gap-md-2 gap-xs-2 justify-content-center">
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

          <CustomButton text="Generate New" onClick={handleNewCodes} />
        </Box>
      </Box>
    </Box>
  );
}

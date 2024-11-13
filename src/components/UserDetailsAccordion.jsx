import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid2,
  Box,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axiosInstance from "../axiosConfig";
import BasicModal from "./BasicModal";
import { formatKey } from "../assets/formvalidations";

const UserDetailsAccordion = ({ applicationId }) => {
  const [generalDetails, setGeneralDetails] = useState([]);
  const [preAddressDetails, setPreAddressDetails] = useState([]);
  const [perAddressDetails, setPerAddressDetails] = useState([]);
  const [bankDetails, setBankDetails] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [open, setOpen] = useState(false);
  const [pdf, setPdf] = useState(null);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDocument = (link) => {
    setPdf(`http://localhost:5004${link}`);
    handleOpen();
  };

  useEffect(() => {
    async function fetchUserDetail() {
      const response = await axiosInstance.get("/User/GetApplicationDetails", {
        params: { applicationId: applicationId },
      });
      setGeneralDetails(response.data.generalDetails);
      setPreAddressDetails(response.data.presentAddressDetails);
      setPerAddressDetails(response.data.permanentAddressDetails);
      setBankDetails(response.data.bankDetails);
      setDocuments(response.data.documents);
    }
    fetchUserDetail();
  }, []);

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
        sx={{ backgroundColor: "primary.main", borderRadius: 3 }}
      >
        <Typography sx={{ color: "background.paper", fontSize: "18px" }}>
          Application Details
        </Typography>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          maxHeight: "400px", // Set max height for scrollable area
          overflowY: "scroll", // Enable vertical scrolling,
          backgroundColor: "transparent",
        }}
      >
        <Grid2
          container
          spacing={5}
          sx={{
            justifyContent: "center",
            alignItems: "center",
            border: "2px solid",
            borderColor: "primary.main",
            padding: 2,
            borderRadius: 3,
          }}
          width={"100%"}
        >
          <Grid2 container spacing={{ md: 12, xs: 12 }} width={"100%"}>
            <Typography variant="h5">General Details</Typography>
          </Grid2>
          {generalDetails.map((item, index) => (
            <Grid2
              key={index}
              container
              spacing={{ md: 6, xs: 12 }}
              width={"40%"}
            >
              <Box
                sx={{ display: "flex", flexDirection: "column", width: "100%" }}
              >
                <Typography sx={{ fontWeight: "bold", fontSize: "12px" }}>
                  {item.key}
                </Typography>
                {item.key != "Applicant Image" ? (
                  <Typography
                    sx={{
                      fontWeight: "normal",
                      fontSize: "14px",
                      border: "2px solid",
                      borderColor: "primary.main",
                      borderRadius: 3,
                      padding: 1,
                    }}
                  >
                    {item.value}
                  </Typography>
                ) : (
                  <Box>
                    <img
                      src={`http://localhost:5004${item.value}`}
                      alt="Preview"
                      style={{
                        width: "150px",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "5px",
                      }}
                    />
                  </Box>
                )}
              </Box>
            </Grid2>
          ))}
          <Divider
            sx={{
              width: "100%",
              borderColor: "primary.main",
              borderWidth: "2px",
            }}
          />
          <Grid2 container spacing={{ md: 12, xs: 12 }} width={"100%"}>
            <Typography variant="h5">Present Address Details</Typography>
          </Grid2>
          {preAddressDetails.map((item, index) => (
            <Grid2
              key={index}
              container
              spacing={{ md: 6, xs: 12 }}
              width={"40%"}
            >
              <Box
                sx={{ display: "flex", flexDirection: "column", width: "100%" }}
              >
                <Typography sx={{ fontWeight: "bold", fontSize: "12px" }}>
                  {item.key}
                </Typography>
                <Typography
                  sx={{
                    fontWeight: "normal",
                    fontSize: "14px",
                    border: "2px solid",
                    borderColor: "primary.main",
                    borderRadius: 3,
                    padding: 1,
                  }}
                >
                  {item.value}
                </Typography>
              </Box>
            </Grid2>
          ))}
          <Divider
            sx={{
              width: "100%",
              borderColor: "primary.main",
              borderWidth: "2px",
            }}
          />
          <Grid2 container spacing={{ md: 12, xs: 12 }} width={"100%"}>
            <Typography variant="h5">Permanent Address Details</Typography>
          </Grid2>
          {perAddressDetails.map((item, index) => (
            <Grid2
              key={index}
              container
              spacing={{ md: 6, xs: 12 }}
              width={"40%"}
            >
              <Box
                sx={{ display: "flex", flexDirection: "column", width: "100%" }}
              >
                <Typography sx={{ fontWeight: "bold", fontSize: "12px" }}>
                  {item.key}
                </Typography>
                <Typography
                  sx={{
                    fontWeight: "normal",
                    fontSize: "14px",
                    border: "2px solid",
                    borderColor: "primary.main",
                    borderRadius: 3,
                    padding: 1,
                  }}
                >
                  {item.value}
                </Typography>
              </Box>
            </Grid2>
          ))}
          <Divider
            sx={{
              width: "100%",
              borderColor: "primary.main",
              borderWidth: "2px",
            }}
          />
          <Grid2 container spacing={{ md: 12, xs: 12 }} width={"100%"}>
            <Typography variant="h5">Bank Details</Typography>
          </Grid2>
          {bankDetails.map((item, index) => (
            <Grid2
              key={index}
              container
              spacing={{ md: 12, xs: 12 }}
              width={"100%"}
            >
              <Box
                sx={{ display: "flex", flexDirection: "column", width: "100%" }}
              >
                <Typography sx={{ fontWeight: "bold", fontSize: "12px" }}>
                  {item.key}
                </Typography>
                <Typography
                  sx={{
                    fontWeight: "normal",
                    fontSize: "14px",
                    border: "2px solid",
                    borderColor: "primary.main",
                    borderRadius: 3,
                    padding: 1,
                  }}
                >
                  {item.value}
                </Typography>
              </Box>
            </Grid2>
          ))}
          <Divider
            sx={{
              width: "100%",
              borderColor: "primary.main",
              borderWidth: "2px",
            }}
          />
          <Grid2 container spacing={{ md: 12, xs: 12 }} width={"100%"}>
            <Typography variant="h5">Bank Details</Typography>
          </Grid2>
          {documents.map((item, index) => (
            <Grid2
              key={index}
              container
              spacing={{ md: 6, xs: 12 }}
              width={"40%"}
            >
              <Box
                sx={{ display: "flex", flexDirection: "column", width: "100%" }}
              >
                <Typography
                  sx={{
                    fontWeight: "bold",
                    fontSize: "14px",
                    wordWrap: "break-word",
                  }}
                >
                  {formatKey(item.Label)}
                </Typography>
                <Typography
                  component={"div"}
                  sx={{
                    fontWeight: "normal",
                    fontSize: "18px",
                    border: "2px solid",
                    borderColor: "primary.main",
                    borderRadius: 3,
                    padding: 1,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography>{item.Enclosure}</Typography>
                  <Typography
                    sx={{
                      cursor: "pointer",
                      fontWeight: "bold",
                      border: "2px solid",
                      borderRadius: 3,
                      height: "max-content",
                      paddingLeft: 1,
                      paddingRight: 1,
                      backgroundColor: "primary.main",
                      color: "background.paper",
                    }}
                    onClick={() => handleDocument(item.File)}
                  >
                    View
                  </Typography>
                </Typography>
              </Box>
            </Grid2>
          ))}
        </Grid2>
      </AccordionDetails>
      <BasicModal
        open={open}
        handleClose={handleClose}
        Title={""}
        pdf={pdf}
        table={null}
      />
    </Accordion>
  );
};

export default UserDetailsAccordion;

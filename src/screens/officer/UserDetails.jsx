import { Box, Container, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "../../axiosConfig";
import Row from "../../components/grid/Row";
import Col from "../../components/grid/Col";
import BasicModal from "../../components/BasicModal";

export default function UserDetails() {
  const [generalDetails, setGeneralDetails] = useState([]);
  const [preAddressDetails,setPreAddressDetails] = useState([]);
  const [perAddressDetails,setPerAddressDetails] = useState([]);
  const [bankDetails,setBankDetails] = useState([]);
  const [documents,setDocuments] = useState([]);
  const location = useLocation();
  const { applicationId } = location.state || {};

  const [pdf,setPdf] = useState(null);
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDocument = (link)=>{
    console.log(link);
    setPdf(`http://localhost:5004${link}`);
    handleOpen();
  }

  useEffect(() => {
    async function fetchUserDetail() {
      const response = await axiosInstance.get("/Officer/GetUserDetails", {
        params: { applicationId: applicationId },
      });
      console.log(response.data);
      setGeneralDetails(response.data.generalDetails);
      setPreAddressDetails(response.data.presentAddressDetails)
      setPerAddressDetails(response.data.permanentAddressDetails)
      setBankDetails(response.data.bankDetails)
      setDocuments(response.data.documents)
    }
    fetchUserDetail();
  }, []);
  return (
    <Container
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        marginTop: "12vh",
      }}
    >
      <Box sx={{maxHeight:'600px',overflowY:'scroll',border:'2px solid',borderColor:'primary.main',borderRadius:5,marginTop:10,padding:3,backgroundColor:'background.paper'}}>
        <Row>
          <Col md={12} xs={12}>
            <Typography variant="h3">General Details</Typography>
          </Col>
          {generalDetails.map((item,index) => (
            <>
              <Col key={index} md={6} xs={12}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontWeight: "bold", fontSize: "14px" }}>
                    {item.key}
                  </Typography>
                  {item.key!="Applicant Image"?<Typography
                    sx={{
                      fontWeight: "normal",
                      fontSize: "18px",
                      border: "2px solid",
                      borderColor: "primary.main",
                      borderRadius: 3,
                      padding: 1,
                    }}
                  >
                    {item.value}
                  </Typography>:
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
                  }
                </Box>
              </Col>
            </>
          ))}
          <Col md={12} xs={12}>
            <Typography variant="h3">Present Address Details</Typography>
          </Col>
          {preAddressDetails.map((item,index) => (
            <>
              <Col key={index} md={6} xs={12}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontWeight: "bold", fontSize: "14px" }}>
                    {item.key}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: "normal",
                      fontSize: "18px",
                      border: "2px solid",
                      borderColor: "primary.main",
                      borderRadius: 3,
                      padding: 1,
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              </Col>
            </>
          ))}
           <Col md={12} xs={12}>
            <Typography variant="h3">Permanent Address Details</Typography>
          </Col>
          {perAddressDetails.map((item,index) => (
            <>
              <Col key={index} md={6} xs={12}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontWeight: "bold", fontSize: "14px" }}>
                    {item.key}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: "normal",
                      fontSize: "18px",
                      border: "2px solid",
                      borderColor: "primary.main",
                      borderRadius: 3,
                      padding: 1,
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              </Col>
            </>
          ))}
           <Col md={12} xs={12}>
            <Typography variant="h3">Bank Details</Typography>
          </Col>
          {bankDetails.map((item,index) => (
            <>
              <Col key={index} md={12} xs={12}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontWeight: "bold", fontSize: "14px" }}>
                    {item.key}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: "normal",
                      fontSize: "18px",
                      border: "2px solid",
                      borderColor: "primary.main",
                      borderRadius: 3,
                      padding: 1,
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              </Col>
            </>
          ))}
           <Col md={12} xs={12}>
            <Typography variant="h3">Documents</Typography>
          </Col>
          {documents.map((item,index) => (
            <>
              <Col key={index} md={6} xs={12}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontWeight: "bold", fontSize: "14px" }}>
                    {item.Label}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: "normal",
                      fontSize: "18px",
                      border: "2px solid",
                      borderColor: "primary.main",
                      borderRadius: 3,
                      padding: 1,
                    }}
                    onClick={()=>handleDocument(item.File)}
                  >
                    {item.Enclosure}
                  </Typography>
                </Box>
              </Col>
            </>
          ))}
        </Row>
      </Box>
      <BasicModal
        open={open}
        handleClose={handleClose}
        Title={"Application List"}
        pdf={pdf}
        table={null}
        handleActionButton={()=>{}}
      />
    </Container>
  );
}

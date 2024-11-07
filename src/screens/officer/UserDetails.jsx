import { Box, Container, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosConfig";
import Row from "../../components/grid/Row";
import Col from "../../components/grid/Col";
import BasicModal from "../../components/BasicModal";
import CustomTable from "../../components/CustomTable";
import { fetchData, SetServiceId } from "../../assets/fetch";
import { useForm } from "react-hook-form";
import ActionModal from "../../components/ActionModal";
import CustomButton from "../../components/CustomButton";

export default function UserDetails() {
  const [generalDetails, setGeneralDetails] = useState([]);
  const [preAddressDetails, setPreAddressDetails] = useState([]);
  const [perAddressDetails, setPerAddressDetails] = useState([]);
  const [bankDetails, setBankDetails] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [actionOptions, setActionOptions] = useState([]);
  const [editList, setEditList] = useState([]);
  const [editableField, setEditableField] = useState(null);
  const [currentOfficer, setCurrentOfficer] = useState("");
  const location = useLocation();
  const { applicationId } = location.state || {};
  const [serviceId, setServiceID] = useState(0);
  const [modalButtonText, setModalButtonText] = useState("Approve");
  const [handleActionButton, setHandleActionButton] = useState(() => () => {});

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({ mode: "onChange" });
  const [pdf, setPdf] = useState(null);
  const [open, setOpen] = useState(false);
  const [actionOpen, setActionOpen] = useState(false);
  const navigate = useNavigate();
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleActionOpen = () => setActionOpen(true);
  const handleActionClose = () => setActionOpen(false);

  const handleDocument = (link) => {
    setPdf(`http://localhost:5004${link}`);
    handleOpen();
  };

  const handleRedirect = () => {
    navigate("/officer/home");
  };

  const handleApprove = async () => {
    const response = await axiosInstance.get("/Officer/SignPdf", {
      params: { ApplicationId: applicationId },
    });
    if (response.data.status) {
      const path =
        "/files/" + applicationId.replace(/\//g, "_") + "SanctionLetter.pdf";
      setPdf(path);
      setModalButtonText("OK");
      // Close the modal first
      handleClose();

      // Reopen the modal after a brief delay
      setTimeout(() => {
        handleOpen();
        setHandleActionButton(() => handleRedirect);
      }, 300); // Adjust delay time as needed
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      if (value instanceof FileList) {
        formData.append(key, value[0]);
      } else if (key == "editableField") {
        formData.append(
          "editableField",
          JSON.stringify({
            serviceSpeicific: editableField.isFormSpecific ?? false,
            name: editableField.name,
            value: value,
          })
        );
      } else if (key == "editList") {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    }
    formData.append("serviceId", serviceId);
    formData.append("applicationId", applicationId);

    const response = await axiosInstance.post(
      "/Officer/HandleAction",
      formData
    );
    if (response.data.status) {
      console.log(response.data);
      if (response.data.action == "sanction") {
        handleOpen();
        const path =
          "/files/" +
          response.data.applicationId.replace(/\//g, "_") +
          "SanctionLetter.pdf";
        setPdf(path);
        setHandleActionButton(() => handleApprove);
      } else {
        navigate("/officer/home");
      }
    }
  };

  useEffect(() => {
    async function fetchUserDetail() {
      const response = await axiosInstance.get("/Officer/GetUserDetails", {
        params: { applicationId: applicationId },
      });
      console.log(response.data);
      setGeneralDetails(response.data.generalDetails);
      setPreAddressDetails(response.data.presentAddressDetails);
      setPerAddressDetails(response.data.permanentAddressDetails);
      setBankDetails(response.data.bankDetails);
      setDocuments(response.data.documents);
      setActionOptions(response.data.actionOptions);
      setEditList(response.data.editList);
      setEditableField(response.data.officerEditableField);
      setServiceID(response.data.serviceId);
      setCurrentOfficer(response.data.currentOfficer);
    }
    fetchUserDetail();
  }, []);

  return (
    <Container
      sx={{
        width: "100vw",
        height: "70vh",
        display: "flex",
        flexDirection: "column",
        gap: 5,
        marginTop: "12vh",
      }}
    >
      <CustomButton
        text="Take Action"
        width={"50%"}
        onClick={() => handleActionOpen()}
      />
      <Box
        sx={{
          maxHeight: "600px",
          overflowY: "scroll",
          border: "2px solid",
          borderColor: "primary.main",
          borderRadius: 5,
          marginTop: 2,
          padding: 3,
          backgroundColor: "background.paper",
        }}
      >
        <Row>
          <Col md={12} xs={12}>
            <Typography variant="h3">General Details</Typography>
          </Col>
          {generalDetails.map((item, index) => (
            <Col key={index} md={6} xs={12}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography sx={{ fontWeight: "bold", fontSize: "14px" }}>
                  {item.key}
                </Typography>
                {item.key != "Applicant Image" ? (
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
            </Col>
          ))}
          <Col md={12} xs={12}>
            <Typography variant="h3">Present Address Details</Typography>
          </Col>
          {preAddressDetails.map((item, index) => (
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
          ))}
          <Col md={12} xs={12}>
            <Typography variant="h3">Permanent Address Details</Typography>
          </Col>
          {perAddressDetails.map((item, index) => (
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
          ))}
          <Col md={12} xs={12}>
            <Typography variant="h3">Bank Details</Typography>
          </Col>
          {bankDetails.map((item, index) => (
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
          ))}
          <Col md={12} xs={12}>
            <Typography variant="h3">Previous Actions</Typography>
          </Col>
          <CustomTable
            fetchData={fetchData}
            url={"/Officer/GetApplicationHistory"}
            title={"Previous Actions"}
            buttonActionHandler={() => {}}
            params={{ applicationId: applicationId }}
          />
          <Col md={12} xs={12}>
            <Typography variant="h3">Documents</Typography>
          </Col>
          {documents.map((item, index) => (
            <Col key={index} md={6} xs={12}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography sx={{ fontWeight: "bold", fontSize: "14px" }}>
                  {item.Label}
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
                    sx={{ cursor: "pointer" }}
                    onClick={() => handleDocument(item.File)}
                  >
                    View
                  </Typography>
                </Typography>
              </Box>
            </Col>
          ))}
        </Row>
      </Box>
      <ActionModal
        open={actionOpen}
        handleClose={handleActionClose}
        control={control}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        actionOptions={actionOptions}
        editList={editList}
        editableField={editableField}
        currentOfficer={currentOfficer}
        errors={errors}
      />
      <BasicModal
        open={open}
        handleClose={handleClose}
        Title={"Document"}
        pdf={pdf}
        table={null}
        handleActionButton={handleActionButton}
        buttonText={modalButtonText}
      />
    </Container>
  );
}

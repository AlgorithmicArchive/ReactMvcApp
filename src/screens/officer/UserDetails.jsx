// import { Box, Container, Typography } from "@mui/material";
// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import axiosInstance from "../../axiosConfig";
// import BasicModal from "../../components/BasicModal";
// import CustomTable from "../../components/CustomTable";
// import { fetchData, SetServiceId } from "../../assets/fetch";
// import { useForm } from "react-hook-form";
// import ActionModal from "../../components/ActionModal";
// import CustomButton from "../../components/CustomButton";
// import { formatKey } from "../../assets/formvalidations";
// import { Col, Row } from "react-bootstrap";

// export default function UserDetails() {
//   const [generalDetails, setGeneralDetails] = useState([]);
//   const [preAddressDetails, setPreAddressDetails] = useState([]);
//   const [perAddressDetails, setPerAddressDetails] = useState([]);
//   const [bankDetails, setBankDetails] = useState([]);
//   const [documents, setDocuments] = useState([]);
//   const [actionOptions, setActionOptions] = useState([]);
//   const [editList, setEditList] = useState([]);
//   const [editableField, setEditableField] = useState(null);
//   const [currentOfficer, setCurrentOfficer] = useState("");
//   const location = useLocation();
//   const { applicationId } = location.state || {};
//   const [serviceId, setServiceID] = useState(0);
//   const [canSanction, setCanSanction] = useState(false);
//   const [modalButtonText, setModalButtonText] = useState("Approve");
//   const [handleActionButton, setHandleActionButton] = useState(() => () => {});

//   const {
//     control,
//     formState: { errors },
//     handleSubmit,
//   } = useForm({ mode: "onChange" });
//   const [pdf, setPdf] = useState(null);
//   const [open, setOpen] = useState(false);
//   const [actionOpen, setActionOpen] = useState(false);
//   const navigate = useNavigate();
//   const handleOpen = () => setOpen(true);
//   const handleClose = () => setOpen(false);

//   const handleActionOpen = () => setActionOpen(true);
//   const handleActionClose = () => setActionOpen(false);

//   const handleDocument = (link) => {
//     setPdf(`http://localhost:5004${link}`);
//     handleOpen();
//   };

//   const handleRedirect = () => {
//     navigate("/officer/home");
//   };

//   const handleApprove = async () => {
//     const response = await axiosInstance.get("/Officer/SignPdf", {
//       params: { ApplicationId: applicationId },
//     });
//     if (response.data.status) {
//       const path =
//         "/files/" + applicationId.replace(/\//g, "_") + "SanctionLetter.pdf";
//       setPdf(path);
//       setModalButtonText("OK");
//       // Close the modal first
//       handleClose();

//       // Reopen the modal after a brief delay
//       setTimeout(() => {
//         handleOpen();
//         setHandleActionButton(() => handleRedirect);
//       }, 300); // Adjust delay time as needed
//     }
//   };

//   const onSubmit = async (data) => {
//     const formData = new FormData();
//     for (const [key, value] of Object.entries(data)) {
//       if (value instanceof FileList) {
//         formData.append(key, value[0]);
//       } else if (key == "editableField") {
//         formData.append(
//           "editableField",
//           JSON.stringify({
//             serviceSpeicific: editableField.isFormSpecific ?? false,
//             name: editableField.name,
//             value: value,
//           })
//         );
//       } else if (key == "editList") {
//         formData.append(key, JSON.stringify(value));
//       } else {
//         formData.append(key, value);
//       }
//     }
//     formData.append("serviceId", serviceId);
//     formData.append("applicationId", applicationId);

//     const response = await axiosInstance.post(
//       "/Officer/HandleAction",
//       formData
//     );
//     if (response.data.status) {
//       if (response.data.action == "sanction") {
//         handleOpen();
//         const path =
//           "/files/" +
//           response.data.applicationId.replace(/\//g, "_") +
//           "SanctionLetter.pdf";
//         setPdf(path);
//         setHandleActionButton(() => handleApprove);
//       } else {
//         navigate("/officer/home");
//       }
//     }
//   };

//   useEffect(() => {
//     async function fetchUserDetail() {
//       const response = await axiosInstance.get("/Officer/GetUserDetails", {
//         params: { applicationId: applicationId },
//       });
//       setGeneralDetails(response.data.generalDetails);
//       setPreAddressDetails(response.data.presentAddressDetails);
//       setPerAddressDetails(response.data.permanentAddressDetails);
//       setBankDetails(response.data.bankDetails);
//       setDocuments(response.data.documents);
//       setActionOptions(response.data.actionOptions);
//       setEditList(response.data.editList);
//       setEditableField(response.data.officerEditableField);
//       setServiceID(response.data.serviceId);
//       setCurrentOfficer(response.data.currentOfficer);
//       setCanSanction(response.data.canSanction);
//     }
//     fetchUserDetail();
//   }, []);

//   return (
//     <Box
//       sx={{
//         height: { xs: "100vh", md: "80vh" },
//         width: "100vw",
//         display: "flex",
//         flexDirection: "column",
//         gap: 5,
//         justifyContent: "center",
//         alignItems: "center",
//       }}
//     >
//       <CustomButton
//         text="Take Action"
//         width={"50%"}
//         onClick={() => handleActionOpen()}
//       />
//       <Box
//         sx={{
//           maxHeight: "600px",
//           overflowY: "scroll",
//           border: "2px solid",
//           borderColor: "primary.main",
//           borderRadius: 5,
//           marginTop: 2,
//           padding: 3,
//           backgroundColor: "background.paper",
//           width: { xs: "95%", md: "60%" },
//         }}
//       >
//         <Row style={{ rowGap: "25px" }}>
//           <Col md={12} xs={12}>
//             <Typography variant="h3">General Details</Typography>
//           </Col>
//           {generalDetails.map((item, index) => (
//             <Col key={index} md={6} xs={12}>
//               <Box sx={{ display: "flex", flexDirection: "column" }}>
//                 <Typography sx={{ fontWeight: "bold", fontSize: "14px" }}>
//                   {item.key}
//                 </Typography>
//                 {item.key != "Applicant Image" ? (
//                   <Typography
//                     sx={{
//                       fontWeight: "normal",
//                       fontSize: "18px",
//                       border: "2px solid",
//                       borderColor: "primary.main",
//                       borderRadius: 3,
//                       padding: 1,
//                     }}
//                   >
//                     {item.value}
//                   </Typography>
//                 ) : (
//                   <Box>
//                     <img
//                       src={`http://localhost:5004${item.value}`}
//                       alt="Preview"
//                       style={{
//                         width: "150px",
//                         height: "150px",
//                         objectFit: "cover",
//                         borderRadius: "5px",
//                       }}
//                     />
//                   </Box>
//                 )}
//               </Box>
//             </Col>
//           ))}
//           <Col md={12} xs={12}>
//             <Typography variant="h3">Present Address Details</Typography>
//           </Col>
//           {preAddressDetails.map((item, index) => (
//             <Col key={index} md={6} xs={12}>
//               <Box sx={{ display: "flex", flexDirection: "column" }}>
//                 <Typography sx={{ fontWeight: "bold", fontSize: "14px" }}>
//                   {item.key}
//                 </Typography>
//                 <Typography
//                   sx={{
//                     fontWeight: "normal",
//                     fontSize: "18px",
//                     border: "2px solid",
//                     borderColor: "primary.main",
//                     borderRadius: 3,
//                     padding: 1,
//                   }}
//                 >
//                   {item.value}
//                 </Typography>
//               </Box>
//             </Col>
//           ))}
//           <Col md={12} xs={12}>
//             <Typography variant="h3">Permanent Address Details</Typography>
//           </Col>
//           {perAddressDetails.map((item, index) => (
//             <Col key={index} md={6} xs={12}>
//               <Box sx={{ display: "flex", flexDirection: "column" }}>
//                 <Typography sx={{ fontWeight: "bold", fontSize: "14px" }}>
//                   {item.key}
//                 </Typography>
//                 <Typography
//                   sx={{
//                     fontWeight: "normal",
//                     fontSize: "18px",
//                     border: "2px solid",
//                     borderColor: "primary.main",
//                     borderRadius: 3,
//                     padding: 1,
//                   }}
//                 >
//                   {item.value}
//                 </Typography>
//               </Box>
//             </Col>
//           ))}
//           <Col md={12} xs={12}>
//             <Typography variant="h3">Bank Details</Typography>
//           </Col>
//           {bankDetails.map((item, index) => (
//             <Col key={index} md={12} xs={12}>
//               <Box sx={{ display: "flex", flexDirection: "column" }}>
//                 <Typography sx={{ fontWeight: "bold", fontSize: "14px" }}>
//                   {item.key}
//                 </Typography>
//                 <Typography
//                   sx={{
//                     fontWeight: "normal",
//                     fontSize: "18px",
//                     border: "2px solid",
//                     borderColor: "primary.main",
//                     borderRadius: 3,
//                     padding: 1,
//                   }}
//                 >
//                   {item.value}
//                 </Typography>
//               </Box>
//             </Col>
//           ))}
//           <Col md={12} xs={12}>
//             <Typography variant="h3">Previous Actions</Typography>
//           </Col>
//           <CustomTable
//             fetchData={fetchData}
//             url={"/Officer/GetApplicationHistory"}
//             title={"Previous Actions"}
//             buttonActionHandler={() => {}}
//             params={{ applicationId: applicationId }}
//           />
//           <Col md={12} xs={12}>
//             <Typography variant="h3">Documents</Typography>
//           </Col>
//           {documents.map((item, index) => (
//             <Col key={index} md={6} xs={12}>
//               <Box sx={{ display: "flex", flexDirection: "column" }}>
//                 <Typography sx={{ fontWeight: "bold", fontSize: "14px" }}>
//                   {formatKey(item.Label)}
//                 </Typography>
//                 <Typography
//                   component={"div"}
//                   sx={{
//                     fontWeight: "normal",
//                     fontSize: "18px",
//                     border: "2px solid",
//                     borderColor: "primary.main",
//                     borderRadius: 3,
//                     padding: 1,
//                     display: "flex",
//                     justifyContent: "space-between",
//                   }}
//                 >
//                   <Typography>{item.Enclosure}</Typography>
//                   <Typography
//                     sx={{ cursor: "pointer" }}
//                     onClick={() => handleDocument(item.File)}
//                   >
//                     View
//                   </Typography>
//                 </Typography>
//               </Box>
//             </Col>
//           ))}
//         </Row>
//       </Box>
//       <ActionModal
//         open={actionOpen}
//         handleClose={handleActionClose}
//         control={control}
//         handleSubmit={handleSubmit}
//         onSubmit={onSubmit}
//         actionOptions={actionOptions}
//         editList={editList}
//         editableField={editableField}
//         currentOfficer={currentOfficer}
//         errors={errors}
//       />
//       <BasicModal
//         open={open}
//         handleClose={handleClose}
//         pdf={pdf}
//         table={null}
//         handleActionButton={canSanction ? handleActionButton : null}
//         buttonText={modalButtonText}
//       />
//     </Box>
//   );
// }

import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { fetchUserDetail } from "../../assets/fetch";
import { Col, Row } from "react-bootstrap";
import { Button, Collapse, Divider, Typography } from "@mui/material";
import { formatKey } from "../../assets/formvalidations";

const CollapsibleFormDetails = ({ formDetails, formatKey }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen((prev) => !prev)}
        sx={{
          backgroundColor: "#CCA682",
          color: "#312C51",
          fontWeight: "bold",
        }}
      >
        {open ? "Collapse" : "Expand"} Details
      </Button>
      <Collapse in={open}>
        <Box
          sx={{
            width: "60%",
            maxHeight: "10%",
            overflowY: "auto",
            border: "2px solid #CCA682",
            borderRadius: 5,
            padding: 5,
            backgroundColor: "#312C51",
            margin: { lg: "0 auto" },
          }}
        >
          {formDetails.map((section, index) => (
            <Row key={index} style={{ marginBottom: 40 }}>
              {Object.entries(section).map(([key, value]) => (
                <Col
                  xs={12}
                  lg={Object.keys(section).length === 1 ? 12 : 6}
                  key={key}
                  style={{ marginBottom: 10 }}
                >
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography
                      variant="label"
                      sx={{
                        fontSize: 14,
                        fontWeight: "bold",
                        width: "250px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {formatKey(key)}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        border: "2px solid #CCA682",
                        borderRadius: 3,
                        padding: 2,
                      }}
                    >
                      {value}
                    </Typography>
                  </Box>
                </Col>
              ))}
              <Divider
                orientation="horizontal"
                sx={{ borderColor: "#CCA682", my: 5 }}
              />
            </Row>
          ))}
        </Box>
      </Collapse>
    </>
  );
};

export default function UserDetails() {
  const location = useLocation();
  const { applicationId } = location.state || {};
  const [formDetails, setFormDetails] = useState([]);

  useEffect(() => {
    fetchUserDetail(applicationId, setFormDetails);
  }, []);

  return (
    <Box
      sx={{
        height: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
      }}
    >
      <Typography variant="h3">USER DETAILS</Typography>
      <CollapsibleFormDetails formDetails={formDetails} formatKey={formatKey} />
    </Box>
  );
}

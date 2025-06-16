import { Box } from "@mui/material";
import React from "react";
import DynamicStepForm from "../../components/form/DynamicStepForm";

export default function Form() {
  const dummyData = {
    Location: [
      {
        label: "Select District",
        name: "District",
        value: 5,
      },
      {
        label: "Select Tehsil Social Welfare Office (TSWO)",
        name: "Tehsil",
        value: 79,
      },
    ],
    "Pension Type": [
      {
        label: "Pension Type",
        name: "PensionType",
        value: "OLD AGE PENSION",
      },
    ],
    "Applicant Details": [
      {
        label: "Applicant Name",
        name: "ApplicantName",
        value: "RHAUL SHARMA",
      },
      {
        label: "Applicant Image",
        name: "ApplicantImage",
        File: "/uploads/bf279f20.jpg",
      },
      {
        label: "Date of Birth",
        name: "DateOfBirth",
        value: "1960-02-02",
      },
      {
        label: "Mobile Number",
        name: "MobileNumber",
        value: "9237283728",
      },
      {
        label: "Email",
        name: "Email",
        value: "rahulsharma@gmail.com",
      },
      {
        label: "Category",
        name: "Category",
        value: "AYY",
      },
      {
        label: "Relation",
        name: "Relation",
        value: "Father",
      },
      {
        label: "Relation Name",
        name: "RelationName",
        value: "SHOBIT SHARMA",
      },
      {
        label: "Gender",
        name: "Gender",
        value: "Male",
      },
    ],
    "Present Address Details": [
      {
        label: "Address",
        name: "PresentAddress",
        value: "16 TRIKUTA NAGAR",
      },
      {
        label: "District",
        name: "PresentDistrict",
        value: 5,
      },
      {
        label: "Tehsil",
        name: "PresentTehsil",
        value: 79,
      },
      {
        label: "Block",
        name: "PresentBlock",
        value: "BLOCK",
      },
      {
        label: "Halqa Panchayat / Municipality Name",
        name: "PresentHalqaPanchayatMunicipalityName",
        value: "PANCHAYAT",
      },
      {
        label: "Village",
        name: "PresentVillage",
        value: "VILLAGE",
      },
      {
        label: "Ward",
        name: "PresentWard",
        value: "WARD",
      },
      {
        label: "Pincode",
        name: "PresentPincode",
        value: "180001",
      },
    ],
    "Permanent Address Details": [
      {
        label: "Address",
        name: "PermanentAddress",
        value: "16 TRIKUTA NAGAR",
      },
      {
        label: "District",
        name: "PermanentDistrict",
        value: 5,
      },
      {
        label: "Tehsil",
        name: "PermanentTehsil",
        value: 79,
      },
      {
        label: "Block",
        name: "PermanentBlock",
        value: "BLOCK",
      },
      {
        label: "Halqa Panchayat / Municipality Name ",
        name: "PermanentHalqaPanchayatMunicipalityName",
        value: "PANCHAYAT",
      },
      {
        label: "Village",
        name: "PermanentVillage",
        value: "VILLAGE",
      },
      {
        label: "Ward",
        name: "PermanentWard",
        value: "WARD",
      },
      {
        label: "Pincode",
        name: "PermanentPincode",
        value: "180001",
      },
    ],
    "Bank Details": [
      {
        label: "Select Bank",
        name: "BankName",
        value: "JAMMU AND KASHMIR BANK",
      },
      {
        label: "Branch Name",
        name: "BranchName",
        value: "RESIDENCY ROAD",
      },
      {
        label: "IFSC Code",
        name: "IfscCode",
        value: "JAKA0KEEPER",
      },
      {
        label: "Account Number",
        name: "AccountNumber",
        value: "1800019292928833",
      },
    ],
    Documents: [
      {
        label: "Identity Proof",
        name: "IdentityProof",
        Enclosure: "Adhaar Card",
        File: "/uploads/f42b76d1.pdf",
      },
      {
        label: "Age Proof",
        name: "AgeProof",
        Enclosure: "Class 10th Ceritificate",
        File: "/uploads/42fb28c3.pdf",
      },
    ],
  };
  return (
    <Box
      sx={{
        minHeight: { xs: "120vh", lg: "90vh" }, // Use min-height to ensure at least full viewport height
        display: { xs: "flex" },
        justifyContent: { xs: "center" }, // Center content vertically
        alignItems: { xs: "center", lg: "start" }, // Center content horizontally
        boxSizing: "border-box",
      }}
    >
      <DynamicStepForm data={dummyData} />
    </Box>
  );
}

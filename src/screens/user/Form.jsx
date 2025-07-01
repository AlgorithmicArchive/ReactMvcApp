import { Box } from "@mui/material";
import React from "react";
import DynamicStepForm from "../../components/form/DynamicStepForm";

export default function Form() {
  const dummyDataList = [
    {
      Location: [
        { label: "Select District", name: "District", value: 5 },
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
          value: "RAHUL SHARMA",
        },
        {
          label: "Applicant Image",
          name: "ApplicantImage",
          File: "/uploads/rahul.jpg",
        },
        { label: "Date of Birth", name: "DateOfBirth", value: "1950-01-01" },
        { label: "Mobile Number", name: "MobileNumber", value: "9999911111" },
        { label: "Email", name: "Email", value: "randomizerweb129@gmail.com" },
        { label: "Category", name: "Category", value: "AYY" },
        { label: "Relation", name: "Relation", value: "Father" },
        { label: "Relation Name", name: "RelationName", value: "RAM SHARMA" },
        { label: "Gender", name: "Gender", value: "Male" },
      ],
      "Present Address Details": [
        { label: "Address", name: "PresentAddress", value: "123 Old Road" },
        { label: "District", name: "PresentDistrict", value: 5 },
        { label: "Tehsil", name: "PresentTehsil", value: 79 },
        { label: "Block", name: "PresentBlock", value: "BLOCK A" },
        {
          label: "Halqa Panchayat / Municipality Name",
          name: "PresentHalqaPanchayatMunicipalityName",
          value: "PANCHAYAT X",
        },
        { label: "Village", name: "PresentVillage", value: "Village One" },
        { label: "Ward", name: "PresentWard", value: "Ward Five" },
        { label: "Pincode", name: "PresentPincode", value: "180001" },
      ],
      "Permanent Address Details": [
        { label: "Address", name: "PermanentAddress", value: "123 Old Road" },
        { label: "District", name: "PermanentDistrict", value: 5 },
        { label: "Tehsil", name: "PermanentTehsil", value: 79 },
        { label: "Block", name: "PermanentBlock", value: "BLOCK A" },
        {
          label: "Halqa Panchayat / Municipality Name ",
          name: "PermanentHalqaPanchayatMunicipalityName",
          value: "PANCHAYAT X",
        },
        { label: "Village", name: "PermanentVillage", value: "Village One" },
        { label: "Ward", name: "PermanentWard", value: "Ward Five" },
        { label: "Pincode", name: "PermanentPincode", value: "180001" },
      ],
      "Bank Details": [
        {
          label: "Select Bank",
          name: "BankName",
          value: "JAMMU AND KASHMIR BANK",
        },
        { label: "Branch Name", name: "BranchName", value: "MAIN BAZAR" },
        { label: "IFSC Code", name: "IfscCode", value: "JAKA0KEEPER" },
        {
          label: "Account Number",
          name: "AccountNumber",
          value: "1234567890122514",
        },
      ],
      Documents: [
        {
          label: "Identity Proof",
          name: "IdentityProof",
          Enclosure: "Aadhaar Card",
          File: "/uploads/rahul-aadhaar.pdf",
        },
        {
          label: "Age Proof",
          name: "AgeProof",
          Enclosure: "Birth Certificate",
          File: "/uploads/rahul-dob.pdf",
        },
      ],
    },
    {
      Location: [
        { label: "Select District", name: "District", value: 5 },
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
          value: "PHYSICALLY CHALLENGED PERSON",
        },
      ],
      "Applicant Details": [
        { label: "Applicant Name", name: "ApplicantName", value: "AARTI DEVI" },
        {
          label: "Applicant Image",
          name: "ApplicantImage",
          File: "/uploads/aarti.jpg",
        },
        { label: "Date of Birth", name: "DateOfBirth", value: "1980-05-05" },
        { label: "Mobile Number", name: "MobileNumber", value: "8888822222" },
        { label: "Email", name: "Email", value: "randomizerweb129@gmail.com" },
        { label: "Category", name: "Category", value: "PHH" },
        { label: "Relation", name: "Relation", value: "Husband" },
        { label: "Relation Name", name: "RelationName", value: "RAKESH KUMAR" },
        { label: "Gender", name: "Gender", value: "Female" },
      ],
      "Present Address Details": [
        { label: "Address", name: "PresentAddress", value: "456 New Lane" },
        { label: "District", name: "PresentDistrict", value: 5 },
        { label: "Tehsil", name: "PresentTehsil", value: 79 },
        { label: "Block", name: "PresentBlock", value: "BLOCK B" },
        {
          label: "Halqa Panchayat / Municipality Name",
          name: "PresentHalqaPanchayatMunicipalityName",
          value: "PANCHAYAT Y",
        },
        { label: "Village", name: "PresentVillage", value: "Village Two" },
        { label: "Ward", name: "PresentWard", value: "Ward Two" },
        { label: "Pincode", name: "PresentPincode", value: "190002" },
      ],
      "Permanent Address Details": [
        { label: "Address", name: "PermanentAddress", value: "456 New Lane" },
        { label: "District", name: "PermanentDistrict", value: 5 },
        { label: "Tehsil", name: "PermanentTehsil", value: 79 },
        { label: "Block", name: "PermanentBlock", value: "BLOCK B" },
        {
          label: "Halqa Panchayat / Municipality Name ",
          name: "PermanentHalqaPanchayatMunicipalityName",
          value: "PANCHAYAT Y",
        },
        { label: "Village", name: "PermanentVillage", value: "Village Two" },
        { label: "Ward", name: "PermanentWard", value: "Ward Two" },
        { label: "Pincode", name: "PermanentPincode", value: "190002" },
      ],
      "Bank Details": [
        {
          label: "Select Bank",
          name: "BankName",
          value: "JAMMU AND KASHMIR BANK",
        },
        { label: "Branch Name", name: "BranchName", value: "CITY BRANCH" },
        { label: "IFSC Code", name: "IfscCode", value: "JAKA0KEEPER" },
        {
          label: "Account Number",
          name: "AccountNumber",
          value: "9876543210982345",
        },
      ],
      Documents: [
        {
          label: "Identity Proof",
          name: "IdentityProof",
          Enclosure: "Aadhaar Card",
          File: "/uploads/aarti-aadhaar.pdf",
        },
        {
          label: "Disability Certificate",
          name: "DisabilityCert",
          Enclosure: "Medical Certificate",
          File: "/uploads/aarti-medical.pdf",
        },
      ],
    },
    {
      Location: [
        { label: "Select District", name: "District", value: 5 },
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
          value: "WOMEN IN DISTRESS",
        },
      ],
      "Applicant Details": [
        {
          label: "Applicant Name",
          name: "ApplicantName",
          value: "MEENA KUMARI",
        },
        {
          label: "Applicant Image",
          name: "ApplicantImage",
          File: "/uploads/meena.jpg",
        },
        { label: "Date of Birth", name: "DateOfBirth", value: "1975-12-10" },
        { label: "Mobile Number", name: "MobileNumber", value: "7777733333" },
        { label: "Email", name: "Email", value: "randomizerweb129@gmail.com" },
        { label: "Category", name: "Category", value: "PHH" },
        { label: "Relation", name: "Relation", value: "Husband" },
        { label: "Relation Name", name: "RelationName", value: "RAJU KUMAR" },
        { label: "Gender", name: "Gender", value: "Female" },
      ],
      "Present Address Details": [
        { label: "Address", name: "PresentAddress", value: "789 North Street" },
        { label: "District", name: "PresentDistrict", value: 5 },
        { label: "Tehsil", name: "PresentTehsil", value: 79 },
        { label: "Block", name: "PresentBlock", value: "BLOCK C" },
        {
          label: "Halqa Panchayat / Municipality Name",
          name: "PresentHalqaPanchayatMunicipalityName",
          value: "PANCHAYAT Z",
        },
        { label: "Village", name: "PresentVillage", value: "Village Three" },
        { label: "Ward", name: "PresentWard", value: "Ward Three" },
        { label: "Pincode", name: "PresentPincode", value: "181003" },
      ],
      "Permanent Address Details": [
        {
          label: "Address",
          name: "PermanentAddress",
          value: "789 North Street",
        },
        { label: "District", name: "PermanentDistrict", value: 5 },
        { label: "Tehsil", name: "PermanentTehsil", value: 79 },
        { label: "Block", name: "PermanentBlock", value: "BLOCK C" },
        {
          label: "Halqa Panchayat / Municipality Name ",
          name: "PermanentHalqaPanchayatMunicipalityName",
          value: "PANCHAYAT Z",
        },
        { label: "Village", name: "PermanentVillage", value: "Village Three" },
        { label: "Ward", name: "PermanentWard", value: "Ward Three" },
        { label: "Pincode", name: "PermanentPincode", value: "181003" },
      ],
      "Bank Details": [
        {
          label: "Select Bank",
          name: "BankName",
          value: "JAMMU AND KASHMIR BANK",
        },
        { label: "Branch Name", name: "BranchName", value: "EAST SIDE" },
        { label: "IFSC Code", name: "IfscCode", value: "JAKA0KEEPER" },
        {
          label: "Account Number",
          name: "AccountNumber",
          value: "1111222233332123",
        },
      ],
      Documents: [
        {
          label: "Identity Proof",
          name: "IdentityProof",
          Enclosure: "Aadhaar Card",
          File: "/uploads/meena-aadhaar.pdf",
        },
        {
          label: "Spouse Death Certificate",
          name: "DeathCert",
          Enclosure: "Death Certificate",
          File: "/uploads/meena-deathcert.pdf",
        },
      ],
    },
    {
      Location: [
        { label: "Select District", name: "District", value: 5 },
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
        { label: "Applicant Name", name: "ApplicantName", value: "SITA RAM" },
        {
          label: "Applicant Image",
          name: "ApplicantImage",
          File: "/uploads/sita.jpg",
        },
        { label: "Date of Birth", name: "DateOfBirth", value: "1948-09-22" },
        { label: "Mobile Number", name: "MobileNumber", value: "6666611111" },
        { label: "Email", name: "Email", value: "randomizerweb129@gmail.com" },
        { label: "Category", name: "Category", value: "NPHH" },
        { label: "Relation", name: "Relation", value: "Father" },
        { label: "Relation Name", name: "RelationName", value: "MOHAN LAL" },
        { label: "Gender", name: "Gender", value: "Male" },
      ],
      "Present Address Details": [
        { label: "Address", name: "PresentAddress", value: "999 South Road" },
        { label: "District", name: "PresentDistrict", value: 5 },
        { label: "Tehsil", name: "PresentTehsil", value: 79 },
        { label: "Block", name: "PresentBlock", value: "BLOCK D" },
        {
          label: "Halqa Panchayat / Municipality Name",
          name: "PresentHalqaPanchayatMunicipalityName",
          value: "PANCHAYAT A",
        },
        { label: "Village", name: "PresentVillage", value: "Village Four" },
        { label: "Ward", name: "PresentWard", value: "Ward nine" },
        { label: "Pincode", name: "PresentPincode", value: "185004" },
      ],
      "Permanent Address Details": [
        { label: "Address", name: "PermanentAddress", value: "999 South Road" },
        { label: "District", name: "PermanentDistrict", value: 5 },
        { label: "Tehsil", name: "PermanentTehsil", value: 79 },
        { label: "Block", name: "PermanentBlock", value: "BLOCK D" },
        {
          label: "Halqa Panchayat / Municipality Name ",
          name: "PermanentHalqaPanchayatMunicipalityName",
          value: "PANCHAYAT A",
        },
        { label: "Village", name: "PermanentVillage", value: "Village Four" },
        { label: "Ward", name: "PermanentWard", value: "Ward nine" },
        { label: "Pincode", name: "PermanentPincode", value: "185004" },
      ],
      "Bank Details": [
        {
          label: "Select Bank",
          name: "BankName",
          value: "JAMMU AND KASHMIR BANK",
        },
        { label: "Branch Name", name: "BranchName", value: "MARKET LANE" },
        { label: "IFSC Code", name: "IfscCode", value: "JAKA0KEEPER" },
        {
          label: "Account Number",
          name: "AccountNumber",
          value: "4444555566661234",
        },
      ],
      Documents: [
        {
          label: "Identity Proof",
          name: "IdentityProof",
          Enclosure: "Aadhaar Card",
          File: "/uploads/sita-aadhaar.pdf",
        },
        {
          label: "Age Proof",
          name: "AgeProof",
          Enclosure: "Birth Certificate",
          File: "/uploads/sita-dob.pdf",
        },
      ],
    },
    // Add 5th similarly if you want — let me know!
  ];
  const randomIndex = Math.floor(Math.random() * dummyDataList.length);
  const dummyData = dummyDataList[randomIndex];
  return (
    <Box
      sx={{
        minHeight: { xs: "180vh", lg: "90vh" }, // Use min-height to ensure at least full viewport height
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

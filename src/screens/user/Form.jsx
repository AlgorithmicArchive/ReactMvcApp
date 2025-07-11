import { Box } from "@mui/material";
import React from "react";
import DynamicScrollableForm from "../../components/form/DynamicStepForm";

export default function Form() {
  const dummyDataList = [
    {
      Location: [
        { label: "Select District", name: "District", value: 5 },
        {
          label: "Select Tehsil Social Welfare Office (TSWO)",
          name: "Tehsil",
          value: 25,
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
        {
          label: "Ration Card Number",
          name: "RationCardNumber",
          value: "1111111111",
        },
        { label: "Relation", name: "Relation", value: "Father" },
        { label: "Relation Name", name: "RelationName", value: "RAM SHARMA" },
        { label: "Gender", name: "Gender", value: "Male" },
        {
          label: "Aadhaar Number",
          name: "AadharNumber",
          value: "690317886783",
        },
      ],
      "Present Address Details": [
        {
          label: "Present Address",
          name: "PresentAddress",
          value: "123, Main Street, Jammu",
        },
        {
          label: "Present Address Type",
          name: "PresentAddressType",
          value: "Urban",
        },
        { label: "Present District", name: "PresentDistrict", value: 5 },
        {
          label: "Present Muncipality",
          name: "PresentMuncipality",
          value: 248194,
        },
        { label: "Present Ward No", name: "PresentWardNo", value: 11158 },
        { label: "Present Pincode", name: "PresentPincode", value: "180001" },
      ],
      // "Permanent Address Details": [
      //   {
      //     label: "Permanent Address",
      //     name: "PermanentAddress",
      //     value: "456, Another Street, Jammu",
      //   },
      //   {
      //     label: "Permanent Address Type",
      //     name: "PermanentAddressType",
      //     value: "Urban",
      //   },
      //   { label: "Permanent District", name: "PermanentDistrict", value: 5 },
      //   {
      //     label: "Permanent Muncipality",
      //     name: "PermanentMuncipality",
      //     value: 248194,
      //   },
      //   { label: "Permanent Ward No", name: "PermanentWardNo", value: 11158 },
      //   {
      //     label: "Permanent Pincode",
      //     name: "PermanentPincode",
      //     value: "180001",
      //   },
      // ],
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
      <DynamicScrollableForm data={dummyData} />
    </Box>
  );
}

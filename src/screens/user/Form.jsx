import { Box } from "@mui/material";
import React from "react";
import DynamicScrollableForm from "../../components/form/DynamicScrollableForm";

export default function Form() {
  const dummyDataList = [
    {
      Location: [
        {
          label: "District",
          name: "District",
          value: 5,
        },
        {
          label: "Tehsil Social Welfare Office (TSWO)",
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
          File: "/assets/dummyDocs/Male2.jpg",
        },
        {
          label: "Date of Birth",
          name: "DateOfBirth",
          value: "1950-01-01",
        },
        {
          label: "Mobile Number",
          name: "MobileNumber",
          value: "9999911111",
        },
        {
          label: "Email",
          name: "Email",
          value: "randomizerweb129@gmail.com",
        },
        {
          label: "Category",
          name: "Category",
          value: "AYY",
        },
        {
          label: "Ration Card Number",
          name: "RationCardNumber",
          value: "1111111111",
        },
        {
          label: "Gender",
          name: "Gender",
          value: "Male",
        },
        {
          label: "Relation",
          name: "Relation",
          value: "Father",
        },
        {
          label: "Relation Name",
          name: "RelationName",
          value: "RAM SHARMA",
        },
        {
          label: "Aadhaar Number",
          name: "AadharNumber",
          value: "690317886783",
        },
      ],
      "Present Address Details": [
        {
          label: "Present Address  (H.No., Street Name)",
          name: "PresentAddress",
          value: "123, Main Street, Jammu",
        },
        {
          label: "Present Address Type",
          name: "PresentAddressType",
          value: "Urban",
          additionalFields: [],
        },
        {
          label: "Present Pincode",
          name: "PresentPincode",
          value: "180001",
        },
      ],
      "Bank Details": [
        {
          label: "Bank",
          name: "BankName",
          value: "JAMMU AND KASHMIR BANK",
        },
        {
          label: "Branch Name",
          name: "BranchName",
          value: "MAIN BAZAR",
        },
        {
          label: "IFSC Code",
          name: "IfscCode",
          value: "JAKA0KEEPER",
        },
        {
          label: "Account Number",
          name: "AccountNumber",
          value: "1234567890122516",
        },
      ],
      Documents: [
        {
          label: "Domicile Certificate",
          name: "DomicileCertificate",
          Enclosure: "Domicile Certificate",
          File: "/assets/dummyDocs/Other.pdf",
        },
        {
          label: "Proof Of Residence",
          name: "ProofOfResidence",
          Enclosure: "Electricity Bill",
          File: "/assets/dummyDocs/Other.pdf",
        },
        {
          label: "Proof Of Age",
          name: "ProofOfAge",
          Enclosure: "Domicile Certificate",
          File: "/assets/dummyDocs/Other.pdf",
        },
        {
          label: "Ration Card",
          name: "RationCard",
          Enclosure: "Ration Card(Inner & Outter Both)",
          File: "/assets/dummyDocs/Other.pdf",
        },
        {
          label: "Bank Passbook",
          name: "BankPassbook",
          Enclosure: "Bank Passbook",
          File: "/assets/dummyDocs/Other.pdf",
        },
        {
          label: "Affidavit",
          name: "Affidavit",
          Enclosure:
            "Affidavit attested by Judicial Magistrate lst Class or Executive Magistrate First Class that she/he is not in receipt of any pension/financial assistance from any other source.",
          File: "/assets/dummyDocs/Other.pdf",
        },
        {
          label: "Other",
          name: "Other",
          Enclosure: "",
          File: null,
        },
      ],
    },
    {
      Location: [
        {
          label: "District",
          name: "District",
          value: 5,
        },
        {
          label: "Tehsil Social Welfare Office (TSWO)",
          name: "Tehsil",
          value: 25,
        },
      ],
      "Pension Type": [
        {
          label: "Pension Type",
          name: "PensionType",
          value: "WOMEN IN DISTRESS",
          additionalFields: [
            {
              label: "Civil Condition",
              name: "CivilCondition",
              value: "WIDOW",
            },
          ],
        },
      ],
      "Applicant Details": [
        {
          label: "Applicant Name",
          name: "ApplicantName",
          value: "RINA SHARMA",
        },
        {
          label: "Applicant Image",
          name: "ApplicantImage",
          File: "/assets/dummyDocs/Female2.jpg",
        },
        {
          label: "Date of Birth",
          name: "DateOfBirth",
          value: "1950-01-01",
        },
        {
          label: "Mobile Number",
          name: "MobileNumber",
          value: "9999911111",
        },
        {
          label: "Email",
          name: "Email",
          value: "randomizerweb129@gmail.com",
        },
        {
          label: "Category",
          name: "Category",
          value: "AYY",
        },
        {
          label: "Ration Card Number",
          name: "RationCardNumber",
          value: "1111111111",
        },
        {
          label: "Gender",
          name: "Gender",
          value: "Female",
        },
        {
          label: "Relation",
          name: "Relation",
          value: "Father",
        },
        {
          label: "Relation Name",
          name: "RelationName",
          value: "RAM SHARMA",
        },
        {
          label: "Aadhaar Number",
          name: "AadharNumber",
          value: "690317886783",
        },
      ],
      "Present Address Details": [
        {
          label: "Present Address  (H.No., Street Name)",
          name: "PresentAddress",
          value: "123, Main Street, Jammu",
        },
        {
          label: "Present Address Type",
          name: "PresentAddressType",
          value: "Urban",
          additionalFields: [],
        },
        {
          label: "Present Pincode",
          name: "PresentPincode",
          value: "180001",
        },
      ],
      "Bank Details": [
        {
          label: "Bank",
          name: "BankName",
          value: "JAMMU AND KASHMIR BANK",
        },
        {
          label: "Branch Name",
          name: "BranchName",
          value: "MAIN BAZAR",
        },
        {
          label: "IFSC Code",
          name: "IfscCode",
          value: "JAKA0KEEPER",
        },
        {
          label: "Account Number",
          name: "AccountNumber",
          value: "1234567890122519",
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

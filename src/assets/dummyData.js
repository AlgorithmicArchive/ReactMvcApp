import axiosInstance from "../axiosConfig";

export const indianWomenNames = [
  "Aditi Sharma",
  "Ananya Singh",
  "Anika Patel",
  "Anusha Reddy",
  "Arpita Mehta",
  "Chandni Chauhan",
  "Deepika Iyer",
  "Divya Kapoor",
  "Gauri Desai",
  "Ishita Joshi",
  "Jhanvi Agarwal",
  "Kavya Nair",
  "Lavanya Menon",
  "Meera Shah",
  "Neha Verma",
  "Nikita Sinha",
  "Pooja Bansal",
  "Priya Gupta",
  "Radhika Malhotra",
  "Rashmi Rao",
  "Riya Bhatt",
  "Sakshi Jain",
  "Saloni Chawla",
  "Sanya Bhargava",
  "Shreya Acharya",
  "Simran Kaur",
  "Sneha Kulkarni",
  "Srishti Chauhan",
  "Swati Deshmukh",
  "Tanvi Vyas",
  "Trisha Roy",
  "Vaishnavi Pillai",
  "Vidya Narayan",
  "Yashika Saxena",
];

export const indianMotherNames = [
  "Anjali Mehta",
  "Bhavna Kapoor",
  "Chitra Reddy",
  "Deepa Iyer",
  "Geeta Sharma",
  "Hema Joshi",
  "Indira Nair",
  "Jaya Verma",
  "Kalpana Patel",
  "Lakshmi Rao",
  "Mamta Singh",
  "Neelam Desai",
  "Padma Shah",
  "Poonam Malhotra",
  "Radha Gupta",
  "Rekha Chauhan",
  "Sandhya Menon",
  "Sarita Bansal",
  "Seema Agarwal",
  "Shanti Pillai",
  "Sujata Bhargava",
  "Sunita Chawla",
  "Usha Kulkarni",
  "Vandana Sinha",
  "Veena Jain",
  "Vidya Bhatt",
  "Yamuna Acharya",
];
export const indianFatherNames = [
  "Ajay Mehta",
  "Amit Sharma",
  "Anil Kapoor",
  "Ashok Patel",
  "Baldev Reddy",
  "Chandrakant Joshi",
  "Devendra Singh",
  "Dinesh Nair",
  "Ganesh Verma",
  "Harish Rao",
  "Kailash Gupta",
  "Lalit Malhotra",
  "Mahesh Agarwal",
  "Manoj Desai",
  "Mukesh Shah",
  "Narendra Chauhan",
  "Omprakash Menon",
  "Pradeep Bansal",
  "Rajesh Pillai",
  "Rakesh Bhargava",
  "Ravi Chawla",
  "Sanjay Iyer",
  "Suresh Kulkarni",
  "Tarun Sinha",
  "Vikas Bhatt",
  "Vijay Acharya",
  "Vinod Jain",
  "Yogesh Roy",
];

function getRandomDate() {
  // Current date
  const currentDate = new Date();

  // Generate a random number between 1 and 6 for months to add
  const randomMonths = Math.floor(Math.random() * 6) + 1;

  // Add random months to the current date
  currentDate.setMonth(currentDate.getMonth() + randomMonths);

  // Format the date as DD MMM YYYY
  const day = String(currentDate.getDate()).padStart(2, "0");
  const month = currentDate
    .toLocaleString("en-US", { month: "short" })
    .toUpperCase();
  const year = currentDate.getFullYear();

  return `${day} ${month} ${year}`;
}

export function getRandomName(nameArray) {
  const randomIndex = Math.floor(Math.random() * nameArray.length);
  return nameArray[randomIndex];
}

export const dummyDataList = [
  {
    District: "5",
    ApplicantName: getRandomName(indianWomenNames).toUpperCase(),
    ApplicantImage: "formImage.jpg",
    DateOfBirth: "23 JUL 2000",
    MobileNumber: "9127282373",
    Email: "randomizerweb129@gmail.com",
    Category: "PRIORITY HOUSEHOLD (PHH)",
    DateOfMarriage: getRandomDate(),
    RelationName: getRandomName(indianFatherNames).toUpperCase(),
    MotherName: getRandomName(indianMotherNames).toUpperCase(),
  }, // Step 1
  {
    PresentAddress: "161 GUJJAR NAGAR",
    PresentDistrict: "5",
    PresentTehsil: "79",
    PresentBlock: "56",
    PresentPanchayatMuncipality: "PANCHAYAT",
    PresentVillage: "VILLAGE",
    PresentWard: "WARD",
    PresentPincode: "180001",
  }, // Step 2
  {
    PermanentAddress: "161 GUJJAR NAGAR",
    PermanentDistrict: "5",
    PermanentTehsil: "79",
    PermanentBlock: "56",
    PermanentPanchayatMuncipality: "PANCHAYAT",
    PermanentVillage: "VILLAGE",
    PermanentWard: "WARD",
    PermanentPincode: "180001",
  }, // Step 3
  {
    BankName: "THE JAMMU AND KASHMIR BANK LTD.",
    BranchName: "RESIDENCY ROAD",
    IfscCode: "JAKA0KEEPER",
    AccountNumber: "1234567891234567",
  }, // Step 4
  {
    IdentityProofEnclosure: "Driving Licence",
    IdentityProofFile: "DummyPDF.pdf",

    AddressProofEnclosure: "Voter Card (Both Sides)",
    AddressProofFile: "DummyPDF.pdf",

    RationCardEnclosure: "Ration Card (Inner & Outter Both)",
    RationCardFile: "DummyPDF.pdf",

    EducationQualificationCertificateEnclosure:
      "Education Qualification Certificate",
    EducationQualificationCertificateFile: "DummyPDF.pdf",

    ProofofDateofBirthEnclosure: "Birth Certificate issued by School",
    ProofofDateofBirthFile: "DummyPDF.pdf",

    AadharCardEnclosure: "Aadhar Card (Both Sides)",
    AadharCardFile: "DummyPDF.pdf",

    DomicileCertificateEnclosure: "Domicile Certificate",
    DomicileCertificateFile: "DummyPDF.pdf",

    BankPassbookEnclosure: "Bank Passbook",
    BankPassbookFile: "DummyPDF.pdf",

    MarriageCardEnclosure: "Marriage Card",
    MarriageCardFile: "DummyPDF.pdf",

    AffidavitdulyattestedbytheJudicialMagistrateFirstClassEnclosure:
      "Affidavit duly attested by the Judicial Magistrate First Class",
    AffidavitdulyattestedbytheJudicialMagistrateFirstClassFile: "DummyPDF.pdf",

    ConsentFormforAadharSeedingoftheBankAccountEnclosure:
      "Consent Form for Aadhar Seeding of the Bank Account",
    ConsentFormforAadharSeedingoftheBankAccountFile: "DummyPDF.pdf",

    OtherEnclosure: "Other",
    OtherFile: "DummyPDF.pdf",
  }, // Step 5
];

export const insertDummyData = async (
  setValue,
  setSelectedDistrict,
  formConfig,
  step,
  fileInputRefs
) => {
  const currentStepFields = formConfig[step].fields;
  const currentDummyData = dummyDataList[step];

  for (const field of currentStepFields) {
    const fieldName = field.name;
    const fieldType = field.type;

    if (currentDummyData[fieldName]) {
      if (fieldType === "file") {
        const fileSelectorRef = fileInputRefs.current[fieldName];
        if (fileSelectorRef) {
          try {
            const fileResponse = await axiosInstance.get(`/User/GetFile`, {
              params: { filePath: currentDummyData[fieldName] },
              responseType: "blob",
            });

            if (fileResponse.status === 200) {
              const fileBlob = fileResponse.data;
              const fileName = currentDummyData[fieldName];
              const file = new File([fileBlob], fileName, {
                type: fileBlob.type,
              });

              setValue(fieldName, file, {
                shouldValidate: true,
                shouldDirty: true,
              });

              if (fieldName=="ApplicantImage") {
                fileSelectorRef.setPreview(URL.createObjectURL(file));
              }else{
                fileSelectorRef.setSelectedFile(file);
              }
            }
          } catch (error) {
            console.error("Error fetching the file:", error);
          }
        }
      } else if (fieldType === "select") {
        setValue(fieldName, currentDummyData[fieldName], {
          shouldValidate: true,
          shouldDirty: true,
        });

        if (fieldName.toLowerCase().includes("district")) {
          setSelectedDistrict(currentDummyData[fieldName]);
        }
      } else {
        setValue(fieldName, currentDummyData[fieldName], {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }
  }
};

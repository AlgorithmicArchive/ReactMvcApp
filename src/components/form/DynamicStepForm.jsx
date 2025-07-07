import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { runValidations } from "../../assets/formvalidations";
import {
  Box,
  Checkbox,
  FormControlLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Button,
  Typography,
  Divider,
  IconButton,
  Alert,
} from "@mui/material";
import { Col, Row } from "react-bootstrap";
import { fetchFormDetails, GetServiceContent } from "../../assets/fetch";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosConfig";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/CloseOutlined";
import MessageModal from "../MessageModal";

const sectionIconMap = {
  Location: <LocationOnIcon sx={{ fontSize: 36, color: "#14B8A6" }} />, // Teal
  "Applicant Details": <PersonIcon sx={{ fontSize: 36, color: "#EC4899" }} />, // Pink
  "Present Address Details": (
    <HomeIcon sx={{ fontSize: 36, color: "#8B5CF6" }} />
  ), // Indigo
  "Permanent Address Details": (
    <HomeIcon sx={{ fontSize: 36, color: "#8B5CF6" }} />
  ), // Indigo
  "Bank Details": (
    <AccountBalanceIcon sx={{ fontSize: 36, color: "#F59E0B" }} />
  ), // Amber
  Documents: <InsertDriveFileIcon sx={{ fontSize: 36, color: "#10B981" }} />, // Green
};

// Helper function to flatten the nested formDetails structure
const flattenFormDetails = (nestedDetails) => {
  const flat = {};
  function recurse(fields) {
    fields.forEach((field) => {
      if (field.hasOwnProperty("Enclosure")) {
        flat[field.name] = {
          selected: field.Enclosure || "",
          file: field.File || "",
        };
      } else {
        if ("value" in field) flat[field.name] = field.value;
        if ("File" in field && field.File) flat[field.name] = field.File;
      }

      if (field.additionalFields) {
        const branches = Array.isArray(field.additionalFields)
          ? field.additionalFields
          : Object.values(field.additionalFields).flat();

        recurse(
          branches.map((af) => ({
            ...af,
            name: af.name || `${field.name}_${af.id}`,
          }))
        );
      }
    });
  }

  Object.values(nestedDetails).forEach((fields) => recurse(fields));
  return flat;
};

const DynamicScrollableForm = ({ mode = "new", data }) => {
  const {
    control,
    handleSubmit,
    trigger,
    watch,
    getValues,
    setValue,
    reset,
    formState: { errors, dirtyFields },
  } = useForm({
    mode: "onChange",
    shouldUnregister: false,
    defaultValues: {},
  });

  const [formSections, setFormSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [initialData, setInitialData] = useState(null);
  const [additionalDetails, setAdditionalDetails] = useState(null);
  const [isCopyAddressChecked, setIsCopyAddressChecked] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const applicantImageFile = watch("ApplicantImage");
  const [applicantImagePreview, setApplicantImagePreview] = useState(
    "/assets/images/profile.jpg"
  );
  const navigate = useNavigate();
  const location = useLocation();

  const hasRunRef = useRef(false);

  const isFieldDisabled = (fieldName) => {
    if (
      mode === "edit" &&
      additionalDetails &&
      additionalDetails.returnFields
    ) {
      return !additionalDetails.returnFields.includes(fieldName);
    }
    return false;
  };

  useEffect(() => {
    if (applicantImageFile && applicantImageFile instanceof File) {
      const objectUrl = URL.createObjectURL(applicantImageFile);
      setApplicantImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [applicantImageFile]);

  useEffect(() => {
    async function loadForm() {
      try {
        const { ServiceId, referenceNumber } = location.state || {};
        setSelectedServiceId(ServiceId);
        if (referenceNumber) {
          setReferenceNumber(referenceNumber);
        }
        const result = await GetServiceContent(ServiceId);
        if (result && result.status) {
          try {
            const config = JSON.parse(result.formElement);
            setFormSections(config);
          } catch (err) {
            console.error("Error parsing formElements:", err);
            setFormSections([]);
          }
        }
        if ((mode === "incomplete" || mode === "edit") && referenceNumber) {
          const { formDetails, additionalDetails } = await fetchFormDetails(
            referenceNumber
          );
          const flatDetails = flattenFormDetails(formDetails);
          setInitialData(flatDetails);
          const resetData = {
            ...flatDetails,
            ...Object.keys(flatDetails).reduce((acc, key) => {
              if (
                flatDetails[key] &&
                typeof flatDetails[key] === "object" &&
                "selected" in flatDetails[key]
              ) {
                acc[`${key}_select`] = flatDetails[key].selected;
                acc[`${key}_file`] = flatDetails[key].file;
              }
              return acc;
            }, {}),
          };
          reset(resetData);
          setAdditionalDetails(additionalDetails);
        } else if (data !== null && data !== undefined) {
          setInitialData(data);
          reset(data);
        }

        if (data != null) {
          Object.keys(data).forEach((key) => {
            data[key].map((item, sectionIndex) => {
              setValue(item.name, item.value);
              if (item.name.toLowerCase().includes("district")) {
                handleDistrictChange(
                  sectionIndex,
                  { name: item.name },
                  item.value
                );
              }
            });
          });
        }
      } catch (error) {
        console.error("Error fetching service content:", error);
      } finally {
        setLoading(false);
      }
    }
    loadForm();
  }, [location.state, mode, reset, data, setValue]);

  const setDefaultFile = async (path) => {
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error("Failed to fetch file");
      const blob = await response.blob();
      const file = new File([blob], path.split("/").pop(), { type: blob.type });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      setValue("ApplicantImage", dataTransfer.files[0]);
    } catch (error) {
      console.error("Error setting default file:", error);
    }
  };

  useEffect(() => {
    if (!formSections.length || !initialData) return;
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    function recurseAndSet(fields, sectionIndex, sectionName) {
      fields.forEach((field) => {
        const name = field.name;
        // Find the corresponding section in initialData
        const sectionData = initialData[sectionName] || [];
        // Find the field in initialData by name
        const fieldData = sectionData.find((f) => f.name === name);
        const value = fieldData ? fieldData.value : undefined;

        if (
          (name.toLowerCase().includes("district") ||
            name.toLowerCase().includes("muncipality") ||
            name.toLowerCase().includes("municipality")) &&
          value !== undefined
        ) {
          handleAreaChange(sectionIndex, { ...field, name }, value);
        }

        if (name.toLowerCase().includes("applicantimage") && value) {
          setApplicantImagePreview(value);
          setDefaultFile(value);
        }

        if (field.type === "enclosure" && value) {
          setValue(`${name}_select`, value.selected || "", {
            shouldValidate: true,
          });
          setValue(`${name}_file`, value.file || null, {
            shouldValidate: true,
          });
        }
        // Set the field value if it exists
        if (value !== undefined) {
          setValue(name, value, { shouldValidate: true });
        }

        if (field.additionalFields) {
          const branches = Array.isArray(field.additionalFields)
            ? field.additionalFields
            : Object.values(field.additionalFields).flat();

          recurseAndSet(
            branches.map((af) => ({
              ...af,
              name: af.name || `${name}_${af.id}`,
            })),
            sectionIndex,
            sectionName
          );
        }
      });
    }

    formSections.forEach((section, idx) => {
      // Map section.section to initialData keys (e.g., "Present Address Details")
      const sectionName = section.section;
      recurseAndSet(section.fields, idx, sectionName);
    });
  }, [
    formSections,
    initialData,
    setValue,
    handleAreaChange,
    setApplicantImagePreview,
    setDefaultFile,
  ]);

  const handleCopyAddress = async (checked, sectionIndex) => {
    if (!checked) {
      setValue("PermanentAddressType", "Please Select");
      return;
    }

    const presentSection = formSections.find(
      (sec) => sec.section === "Present Address Details"
    );
    const permanentSection = formSections.find(
      (sec) => sec.section === "Permanent Address Details"
    );

    if (!presentSection || !permanentSection) {
      console.warn("Present or Permanent Address section not found");
      return;
    }

    // Step 1: Get AddressType field
    const presentTypeField = presentSection.fields[0]; // Assuming first field is AddressType
    const permanentTypeField = permanentSection.fields[0]; // Assuming first field is AddressType

    if (
      presentTypeField.name !== "PresentAddressType" ||
      permanentTypeField.name !== "PermanentAddressType"
    ) {
      console.warn("Address type fields not found in sections");
      return;
    }

    // Step 2: Get actual values ("Urban"/"Rural")
    const presentAddressType = getValues(presentTypeField.name);
    let permanentAddressType = getValues(permanentTypeField.name);

    // Step 3: Sync PermanentAddressType with PresentAddressType
    if (
      permanentAddressType === "Please Select" ||
      !["Urban", "Rural"].includes(permanentAddressType)
    ) {
      permanentAddressType = presentAddressType;
      setValue(permanentTypeField.name, presentAddressType, {
        shouldValidate: true,
      });
    }

    // Step 5: Copy top-level AddressType field
    setValue(permanentTypeField.name, presentAddressType, {
      shouldValidate: true,
    });

    // Step 6: Copy additional fields based on AddressType
    const presentAdditionalFields =
      presentSection.fields[0].additionalFields?.[presentAddressType] || [];
    const permanentAdditionalFields =
      permanentSection.fields[0].additionalFields?.[permanentAddressType] || [];

    if (!permanentSection.fields[0].additionalFields) {
      console.warn("Permanent section additionalFields is missing");
      return;
    }

    if (!permanentAdditionalFields.length) {
      console.warn(
        `No permanent additional fields found for AddressType: ${permanentAddressType}`
      );
      return;
    }

    // Register all permanent fields to avoid "not found in fieldNames" errors
    permanentAdditionalFields.forEach((field) => {
      setValue(field.name, "", { shouldValidate: false });
    });

    // Map fields explicitly to handle naming inconsistencies
    const fieldNameMap = {
      PresentDistrict: "PermanentDistrict",
      PresentMuncipality: "PermanentMuncipality", // Match typo
      PresentMunicipality: "PermanentMuncipality", // Handle correct spelling
      PresentWardNo: "PermanentWardNo",
      PresentBlock: "PermanentBlock",
      PresentHalqaPanchayat: "PermanentHalqaPanchayat",
      PresentVillage: "PermanentVillage",
    };

    // Process fields sequentially to respect dependencies
    for (const presentField of presentAdditionalFields) {
      let permanentFieldName = fieldNameMap[presentField.name];

      if (!permanentFieldName) {
        // Fallback: Try replacing "Present" with "Permanent"
        permanentFieldName = presentField.name.replace("Present", "Permanent");
      }

      const permanentField = permanentAdditionalFields.find(
        (f) => f.name.toLowerCase() === permanentFieldName.toLowerCase()
      );

      if (!permanentField) {
        console.warn(
          `Permanent field not found for ${presentField.name}. Expected: ${permanentFieldName}`
        );
        continue;
      }

      const fieldValue = getValues(presentField.name);
      setValue(permanentField.name, fieldValue, { shouldValidate: true });

      // Handle dependent fields
      if (
        presentField.name.includes("District") ||
        presentField.name.includes("Muncipality") ||
        presentField.name.includes("Municipality") ||
        presentField.name.includes("Block") ||
        presentField.name.includes("HalqaPanchayat") ||
        presentField.name.includes("Ward") ||
        presentField.name.includes("Village")
      ) {
        await handleAreaChange(sectionIndex, permanentField, fieldValue);
      }
    }

    // Step 7: Trigger validation for all copied fields
    const validateFields = async () => {
      await trigger(permanentTypeField.name);

      for (const field of permanentAdditionalFields) {
        try {
          await trigger(field.name);
        } catch (error) {
          console.warn(`Validation failed for ${field.name}:`, error.message);
        }
      }
    };

    await validateFields();
  };

  const collectNestedFields = (field, formData) => {
    const fields = [];
    if (field.type === "enclosure") {
      fields.push(`${field.name}_select`, `${field.name}_file`);
    } else if (field.type === "select" && field.additionalFields) {
      const sel = formData[field.name] || "";
      const extra = field.additionalFields[sel] || [];
      fields.push(field.name);
      extra.forEach((af) => {
        const nestedFieldName = af.name || `${field.name}_${af.id}`;
        fields.push(nestedFieldName);
        // Recursively collect nested fields of nested fields
        if (af.type === "select" && af.additionalFields) {
          const nestedSel = formData[nestedFieldName] || "";
          const nestedExtra = af.additionalFields[nestedSel] || [];
          nestedExtra.forEach((nestedAf) => {
            const nestedNestedFieldName =
              nestedAf.name || `${nestedFieldName}_${nestedAf.id}`;
            fields.push(nestedNestedFieldName);
          });
        }
      });
    } else {
      fields.push(field.name);
    }
    return fields;
  };

  const handleValidateAll = async () => {
    const formData = getValues();
    const allFields = formSections.flatMap((section, index) =>
      section.fields.flatMap((field) => collectNestedFields(field, formData))
    );

    const enabledFields = allFields.filter((name) => !isFieldDisabled(name));

    if (mode === "edit") {
      const allUpdated = enabledFields.every((name) => dirtyFields[name]);
      if (!allUpdated) {
        alert("Please modify all correction fields before proceeding.");
        return false;
      }
    }

    const validationResults = await Promise.all(
      allFields.map((fieldName) => trigger(fieldName))
    );
    return validationResults.every((result) => result);
  };

  const handleDistrictChange = async (sectionIndex, districtField, value) => {
    try {
      const response = await fetch(
        `/Base/GetTeshilForDistrict?districtId=${value}`
      );
      const data = await response.json();
      if (data.status && data.tehsils) {
        const newOptions = [
          { value: "Please Select", label: "Please Select" },
          ...data.tehsils.map((tehsil) => ({
            value: tehsil.tehsilId,
            label: tehsil.tehsilName,
          })),
        ];
        setFormSections((prevSections) => {
          const newSections = [...prevSections];
          const section = newSections[sectionIndex];
          const tehsilFieldName = districtField.name.replace(
            "District",
            "Tehsil"
          );
          section.fields = section.fields.map((field) =>
            field.name === tehsilFieldName
              ? { ...field, options: newOptions }
              : field
          );
          return newSections;
        });
      }
    } catch (error) {
      console.error("Error fetching tehsils:", error);
    }
  };

  const handleAreaChange = async (sectionIndex, field, value) => {
    try {
      // 🧠 Determine which AddressType to use based on field name
      let addressTypeKey = "";
      if (field.name.startsWith("Present")) {
        addressTypeKey = "PresentAddressType";
      } else if (field.name.startsWith("Permanent")) {
        addressTypeKey = "PermanentAddressType";
      }

      const AddressType = getValues(addressTypeKey); // 'Urban' or 'Rural'

      const fieldNames = [
        { name: "District", childname: "Tehsil", respectiveTable: "Tehsil" },
        {
          name: "PresentDistrict",
          childname: { Urban: "PresentMuncipality", Rural: "PresentBlock" },
          respectiveTable: { Urban: "Muncipality", Rural: "Block" },
        },
        {
          name: "PermanentDistrict",
          childname: { Urban: "PermanentMuncipality", Rural: "PermanentBlock" },
          respectiveTable: { Urban: "Muncipality", Rural: "Block" },
        },
        {
          name: "PresentMuncipality",
          childname: "PresentWardNo",
          respectiveTable: "Ward",
        },
        {
          name: "PermanentMuncipality",
          childname: "PermanentWardNo",
          respectiveTable: "Ward",
        },
        {
          name: "PresentBlock",
          childname: "PresentHalqaPanchayat",
          respectiveTable: "HalqaPanchayat",
        },
        {
          name: "PermanentBlock",
          childname: "PermanentHalqaPanchayat",
          respectiveTable: "HalqaPanchayat",
        },
        {
          name: "PresentHalqaPanchayat",
          childname: "PresentVillage",
          respectiveTable: "Village",
        },
        {
          name: "PermanentHalqaPanchayat",
          childname: "PermanentVillage",
          respectiveTable: "Village",
        },
      ];

      const match = fieldNames.find((f) => f.name === field.name);
      if (!match) {
        console.warn(`Field "${field.name}" not found in fieldNames.`);
        return;
      }

      const childFieldName =
        typeof match.childname === "object"
          ? match.childname[AddressType]
          : match.childname;

      const tableName =
        typeof match.respectiveTable === "object"
          ? match.respectiveTable[AddressType]
          : match.respectiveTable;

      if (!childFieldName || !tableName) {
        console.warn(
          `Invalid child field or table for ${addressTypeKey}: ${AddressType}`
        );
        return;
      }

      const response = await axiosInstance.get(
        `/Base/GetAreaList?table=${tableName}&parentId=${value}`
      );
      const areaList = response.data?.data || [];

      const newOptions = [
        { label: "Please Select", value: "Please Select" },
        ...areaList.map((item) => ({
          value: item.id ?? item.value,
          label: item.name ?? item.label,
        })),
      ];

      setFormSections((prevSections) => {
        const newSections = [...prevSections];
        const section = newSections[sectionIndex];
        let updated = false;

        section.fields = section.fields.map((f) => {
          if (f.name === childFieldName) {
            updated = true;
            return { ...f, options: newOptions };
          }

          if (
            f.additionalFields &&
            typeof f.additionalFields === "object" &&
            Array.isArray(f.additionalFields[AddressType])
          ) {
            f.additionalFields[AddressType] = f.additionalFields[
              AddressType
            ].map((af) => {
              if (af.name === childFieldName) {
                updated = true;
                return { ...af, options: newOptions };
              }
              return af;
            });
          }

          return f;
        });

        if (!updated) {
          console.warn(`Child field "${childFieldName}" not found in section.`);
        }

        return newSections;
      });
    } catch (error) {
      console.error("Error fetching child field options:", error);
    }
  };

  const onSubmit = async (data, operationType) => {
    const groupedFormData = {};
    setButtonLoading(true);

    let returnFieldsArray = [];
    if (additionalDetails != null && additionalDetails != "") {
      const returnFields = additionalDetails?.returnFields || "";
      returnFieldsArray = JSON.parse(returnFields);
    }

    const processField = (field, data) => {
      if (field.type === "enclosure" && field.isDependentEnclosure) {
        const parentValue = data[field.dependentField];
        if (!parentValue || !field.dependentValues.includes(parentValue)) {
          return null;
        }
      }

      const sectionFormData = {};
      const fieldValue = data[field.name] || "";
      sectionFormData["label"] = field.label;
      sectionFormData["name"] = field.name;

      if (field.type === "enclosure") {
        sectionFormData["Enclosure"] = data[`${field.name}_select`] || "";
        sectionFormData["File"] = data[`${field.name}_file`] || "";
      } else if (field.name === "ApplicantImage") {
        sectionFormData["File"] = fieldValue;
      } else {
        sectionFormData["value"] = fieldValue;
      }

      if (field.additionalFields) {
        const selectedValue = data[field.name] || "";
        const additionalFields = field.additionalFields[selectedValue];
        if (additionalFields) {
          sectionFormData.additionalFields = additionalFields
            .map((additionalField) => {
              const nestedFieldName =
                additionalField.name || `${field.name}_${additionalField.id}`;
              return processField(
                { ...additionalField, name: nestedFieldName },
                data
              );
            })
            .filter((nestedField) => nestedField !== null);
        }
      }

      return sectionFormData;
    };

    formSections.forEach((section) => {
      groupedFormData[section.section] = [];
      section.fields.forEach((field) => {
        const sectionData = processField(field, data);
        if (
          sectionData !== null &&
          (returnFieldsArray.length === 0 ||
            returnFieldsArray.includes(sectionData.name))
        ) {
          groupedFormData[section.section].push(sectionData);
        }
      });
    });

    const formdata = new FormData();
    formdata.append("serviceId", selectedServiceId);
    formdata.append("formDetails", JSON.stringify(groupedFormData));

    if (mode === "edit" && returnFieldsArray.length > 0) {
      returnFieldsArray.forEach((fieldName) => {
        const fieldValue = data[fieldName];
        if (fieldValue !== undefined && fieldValue !== null) {
          formdata.append(fieldName, fieldValue);
        }
      });
    }

    for (const section in groupedFormData) {
      groupedFormData[section].forEach((field) => {
        if (field.hasOwnProperty("File") && field.File instanceof File) {
          formdata.append(field.name, field.File);
        }
        if (field.additionalFields) {
          field.additionalFields.forEach((nestedField) => {
            if (
              nestedField.hasOwnProperty("File") &&
              nestedField.File instanceof File
            ) {
              formdata.append(nestedField.name, nestedField.File);
            }
          });
        }
      });
    }

    formdata.append(
      "status",
      operationType === "submit" ? "Initiated" : "Incomplete"
    );
    formdata.append("referenceNumber", referenceNumber);

    let url = "/User/InsertFormDetails";
    if (additionalDetails != null && additionalDetails != "") {
      formdata.append("returnFields", JSON.stringify(returnFieldsArray));
      url = "/User/UpdateApplicationDetails";
    }

    try {
      const response = await axiosInstance.post(url, formdata);
      const result = response.data;
      setButtonLoading(false);
      if (result.status) {
        if (result.type === "Submit") {
          navigate("/user/acknowledge", {
            state: { applicationId: result.referenceNumber },
          });
        } else if (result.type == "Edit") {
          setReferenceNumber(result.referenceNumber);
          navigate("/user/initiated");
        } else {
          setReferenceNumber(result.referenceNumber);
        }
      } else {
        console.error("Submission failed:", result);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setButtonLoading(false);
    }
  };

  const handleChekcBankIfsc = async (fieldName) => {
    const bankName = getValues("BankName");
    const IfscCode = getValues("IfscCode");
    console.log(bankName, IfscCode);
  };

  const renderField = (field, sectionIndex) => {
    const commonStyles = {
      "& .MuiOutlinedInput-root": {
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        transition: "all 0.3s ease",
        "& fieldset": {
          borderColor: "#A5B4FC", // Indigo-200
        },
        "&:hover fieldset": {
          borderColor: "#6366F1", // Indigo-500
        },
        "&.Mui-focused fieldset": {
          borderColor: "#6366F1", // Indigo-500
          boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.2)",
        },
        "&.Mui-error fieldset": {
          borderColor: "#F43F5E", // Rose-500
        },
        "&.Mui-disabled": {
          backgroundColor: "#EDE9FE", // Indigo-50
        },
      },
      "& .MuiInputLabel-root": {
        color: "#6B7280", // Gray-500
        fontWeight: "500",
        fontSize: "0.9rem",
        "&.Mui-focused": {
          color: "#6366F1", // Indigo-500
        },
        "&.Mui-error": {
          color: "#F43F5E", // Rose-500
        },
      },
      "& .MuiInputBase-input": {
        fontSize: "1rem",
        color: "#1F2937", // Gray-900
        padding: "14px 16px",
      },
      "& .MuiFormHelperText-root": {
        color: "#F43F5E", // Rose-500
        fontSize: "0.85rem",
      },
      marginBottom: "1.5rem",
    };

    const buttonStyles = {
      background: "linear-gradient(to right, #10B981, #059669)", // Green-500 to Green-600
      color: "#FFFFFF",
      fontWeight: "600",
      textTransform: "none",
      borderRadius: "10px",
      padding: "10px 20px",
      "&:hover": {
        background: "linear-gradient(to right, #059669, #047857)", // Green-600 to Green-700
      },
      "&.Mui-disabled": {
        background: "#D1D5DB", // Gray-300
        color: "#9CA3AF", // Gray-400
      },
      marginBottom: "0.5rem",
    };

    const getLabelWithAsteriskJSX = (field) => {
      const isRequired = field.validationFunctions?.includes("notEmpty");
      return (
        <>
          {field.label}
          {isRequired && (
            <span style={{ color: "#F43F5E", fontSize: "1rem" }}> *</span> // Rose-500
          )}
        </>
      );
    };

    switch (field.type) {
      case "text":
      case "email":
      case "date":
        return (
          <Controller
            name={field.name}
            control={control}
            defaultValue=""
            rules={{
              validate: async (value) =>
                await runValidations(
                  field,
                  value,
                  getValues(),
                  referenceNumber
                ),
            }}
            render={({ field: { onChange, value, ref } }) => (
              <TextField
                type={field.type}
                id={`field-${field.id}`}
                label={getLabelWithAsteriskJSX(field)}
                value={value || ""}
                onChange={(e) => {
                  let val = e.target.value;
                  if (
                    field.transformationFunctions?.includes("CaptilizeAlphabet")
                  ) {
                    val = val.toUpperCase();
                  }
                  onChange(val);
                }}
                onBlur={() => {
                  if (field.name === "IfscCode") {
                    handleChekcBankIfsc(field.name);
                  }
                }}
                inputRef={ref}
                disabled={isFieldDisabled(field.name)}
                error={Boolean(errors[field.name])}
                helperText={errors[field.name]?.message || ""}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  maxLength: field.maxLength,
                }}
                sx={commonStyles}
              />
            )}
          />
        );

      case "file":
        return (
          <Controller
            name={field.name}
            control={control}
            defaultValue={null}
            rules={{
              validate: async (value) => await runValidations(field, value),
            }}
            render={({ field: { onChange, ref } }) => (
              <FormControl
                fullWidth
                margin="normal"
                error={Boolean(errors[field.name])}
                sx={commonStyles}
              >
                <Button
                  variant="contained"
                  component="label"
                  disabled={isFieldDisabled(field.name)}
                  sx={buttonStyles}
                >
                  {getLabelWithAsteriskJSX(field)}
                  <input
                    type="file"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files[0];
                      onChange(file);
                    }}
                    ref={ref}
                    accept={field.accept}
                  />
                </Button>
                <Typography sx={{ fontSize: "0.85rem", color: "#6B7280" }}>
                  Accepted File Types: {field.accept} Size: 20kb-50kb
                </Typography>
                <FormHelperText sx={{ color: "#F43F5E" }}>
                  {errors[field.name]?.message || ""}
                </FormHelperText>
              </FormControl>
            )}
          />
        );

      case "select":
        return (
          <Controller
            name={field.name}
            control={control}
            defaultValue={field.options[0]?.value || ""}
            rules={{
              validate: async (value) =>
                await runValidations(field, value, getValues()),
            }}
            render={({ field: { onChange, value, ref } }) => {
              let options = [];
              if (field.dependentOn && field.dependentOn != "") {
                const parentValue = watch(field.dependentOn);
                options =
                  field.dependentOptions && field.dependentOptions[parentValue]
                    ? field.dependentOptions[parentValue]
                    : field.options || [];
              } else {
                options = field.options || [];
              }
              if (value && !options.some((opt) => opt.value === value)) {
                options = [...options, { value, label: value }];
              }

              return (
                <>
                  <TextField
                    select
                    fullWidth
                    variant="outlined"
                    label={getLabelWithAsteriskJSX(field)}
                    value={value || ""}
                    id={`field-${field.id}`}
                    onChange={(e) => {
                      onChange(e);
                      handleAreaChange(sectionIndex, field, e.target.value);
                    }}
                    onBlur={() => {
                      if (field.name === "BankName") {
                        handleChekcBankIfsc(field.name);
                      }
                    }}
                    error={Boolean(errors[field.name])}
                    helperText={errors[field.name]?.message || ""}
                    InputLabelProps={{ shrink: true }}
                    inputRef={ref}
                    sx={commonStyles}
                    disabled={isFieldDisabled(field.name)}
                  >
                    {options.map((option) => (
                      <MenuItem
                        key={option.value}
                        value={option.value}
                        sx={{
                          color: "#1F2937", // Gray-900
                          "&:hover": { backgroundColor: "#DBEAFE" }, // Blue-100
                          "&.Mui-selected": {
                            backgroundColor: "#6366F1", // Indigo-500
                            color: "#FFFFFF",
                          },
                        }}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  {field.additionalFields &&
                    field.additionalFields[value] &&
                    field.additionalFields[value].map((additionalField) => {
                      const nestedFieldName =
                        additionalField.name ||
                        `${field.name}_${additionalField.id}`;
                      return (
                        <Col
                          xs={12}
                          lg={additionalField.span}
                          key={additionalField.id}
                        >
                          {renderField(
                            {
                              ...additionalField,
                              name: nestedFieldName,
                            },
                            sectionIndex
                          )}
                        </Col>
                      );
                    })}
                </>
              );
            }}
          />
        );

      case "enclosure":
        const isDependent = field.isDependentEnclosure;
        const parentValue = isDependent ? watch(field.dependentField) : null;
        if (
          isDependent &&
          (!parentValue || !field.dependentValues.includes(parentValue))
        ) {
          return null;
        }

        const selectFieldName = `${field.name}_select`;
        const fileFieldName = `${field.name}_file`;

        const selectValue =
          getValues(selectFieldName) ||
          initialData?.[field.name]?.selected ||
          "";
        const options = field.options || [];

        if (selectValue && !options.some((opt) => opt.value === selectValue)) {
          options.push({ value: selectValue, label: selectValue });
        }

        const additionalFields =
          field.additionalFields && field.additionalFields[selectValue];

        return (
          <>
            <Controller
              name={selectFieldName}
              control={control}
              defaultValue={selectValue}
              rules={{
                validate: async (value) =>
                  await runValidations(field, value, getValues()),
              }}
              render={({ field: { onChange, value, ref } }) => (
                <FormControl
                  fullWidth
                  margin="normal"
                  error={Boolean(errors[selectFieldName])}
                  sx={commonStyles}
                >
                  <InputLabel id={`${field.id}_select-label`}>
                    {getLabelWithAsteriskJSX(field)}
                  </InputLabel>
                  <Select
                    labelId={`${field.id}_select-label`}
                    id={`${field.id}_select`}
                    value={value || ""}
                    label={getLabelWithAsteriskJSX(field)}
                    disabled={isFieldDisabled(selectFieldName)}
                    onChange={(e) => onChange(e.target.value)}
                    inputRef={ref}
                  >
                    {options.map((option) => (
                      <MenuItem
                        key={option.value}
                        value={option.value}
                        sx={{
                          color: "#1F2937", // Gray-900
                          "&:hover": { backgroundColor: "#DBEAFE" }, // Blue-100
                          "&.Mui-selected": {
                            backgroundColor: "#6366F1", // Indigo-500
                            color: "#FFFFFF",
                          },
                        }}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText sx={{ color: "#F43F5E" }}>
                    {errors[selectFieldName]?.message || ""}
                  </FormHelperText>
                </FormControl>
              )}
            />

            {additionalFields &&
              additionalFields.map((additionalField) => {
                const nestedFieldName =
                  additionalField.name || `${field.name}_${additionalField.id}`;
                return (
                  <Col
                    xs={12}
                    lg={additionalField.span}
                    key={additionalField.id}
                  >
                    {renderField(
                      {
                        ...additionalField,
                        name: nestedFieldName,
                      },
                      sectionIndex
                    )}
                  </Col>
                );
              })}

            <Controller
              name={fileFieldName}
              control={control}
              defaultValue={initialData?.[field.name]?.file || null}
              rules={{
                validate: async (value) =>
                  await runValidations(field, value, getValues()),
              }}
              render={({ field: { onChange, value } }) => (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    width: "100%",
                    marginBottom: "0.5rem",
                  }}
                >
                  {value && (
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={1}
                      sx={{ mb: 1 }}
                    >
                      <FormHelperText
                        sx={{
                          cursor: "pointer",
                          color: "#6366F1", // Indigo-500
                          textDecoration: "underline",
                          fontSize: "0.9rem",
                          "&:hover": { color: "#4F46E5" }, // Indigo-600
                        }}
                        onClick={() => {
                          const fileURL =
                            typeof value === "string"
                              ? value
                              : URL.createObjectURL(value);
                          window.open(fileURL, "_blank");
                        }}
                      >
                        {typeof value === "string"
                          ? "View file"
                          : value?.name || "View file"}
                      </FormHelperText>
                      <IconButton
                        size="small"
                        onClick={() => onChange(null)}
                        sx={{
                          color: "#F43F5E", // Rose-500
                          "&:hover": { color: "#E11D48" }, // Rose-600
                          p: 0.5,
                        }}
                        aria-label="Remove file"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}

                  <Button
                    variant="contained"
                    component="label"
                    sx={{
                      ...buttonStyles,
                      width: "100%",
                      borderRadius: "12px",
                    }}
                    disabled={
                      isFieldDisabled(fileFieldName) || !watch(selectFieldName)
                    }
                  >
                    Upload
                    <input
                      type="file"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files[0];
                        onChange(file);
                      }}
                      accept={field.accept}
                    />
                  </Button>

                  <Box>
                    <FormHelperText sx={{ color: "#F43F5E" }}>
                      {errors[fileFieldName]?.message || ""}
                    </FormHelperText>
                  </Box>
                </div>
              )}
            />
          </>
        );

      default:
        return null;
    }
  };

  if (loading)
    return (
      <Typography
        sx={{ textAlign: "center", color: "#6B7280", fontSize: "1.2rem" }}
      >
        Loading form...
      </Typography>
    );

  return (
    <Box
      sx={{
        maxWidth: "900px",
        margin: "2rem auto",
        background: "linear-gradient(to bottom, #E0F2FE, #BAE6FD)", // Sky-100 to Sky-200
        borderRadius: "16px",
        padding: { xs: "1.5rem", md: "3rem" },
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        minHeight: "100vh",
        overflowY: "auto",
        "&::-webkit-scrollbar": {
          width: "8px",
          backgroundColor: "#E0F2FE", // Sky-100
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#38BDF8", // Sky-400
          borderRadius: "4px",
        },
      }}
    >
      <form onSubmit={handleSubmit((data) => onSubmit(data, "submit"))}>
        {formSections.length > 0 ? (
          <>
            {formSections.map((section, index) => (
              <Box
                key={section.id}
                sx={{
                  marginBottom: "3rem",
                  padding: "2rem",
                  borderRadius: "12px",
                  background: "linear-gradient(to bottom, #FFFFFF, #F0FDFA)", // White to Teal-50
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 4px 15px rgba(20, 184, 166, 0.3)", // Teal-500 shadow
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    marginBottom: "1.5rem",
                  }}
                >
                  {sectionIconMap[section.section] || (
                    <HelpOutlineIcon sx={{ fontSize: 36, color: "#14B8A6" }} /> // Teal-500
                  )}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "600",
                      color: "#1F2937", // Gray-900
                      fontSize: "1.5rem",
                    }}
                  >
                    {section.section}
                  </Typography>
                </Box>
                <Divider
                  sx={{ marginBottom: "1.5rem", borderColor: "#A5B4FC" }} // Indigo-200
                />
                {section.section === "Permanent Address Details" && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isCopyAddressChecked}
                        onChange={(e) => {
                          setIsCopyAddressChecked(e.target.checked);
                          handleCopyAddress(e.target.checked, index);
                        }}
                        sx={{
                          color: "#EC4899", // Pink-500
                          "&.Mui-checked": { color: "#EC4899" }, // Pink-500
                        }}
                      />
                    }
                    label="Same As Present Address"
                    sx={{ marginBottom: "1rem", color: "#4B5563" }} // Gray-600
                  />
                )}
                {section.section === "Applicant Details" && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <Box
                      component="img"
                      src={applicantImagePreview}
                      alt="Applicant Image"
                      sx={{
                        width: 180,
                        height: 180,
                        borderRadius: "50%",
                        objectFit: "cover",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        border: "3px solid #A5B4FC", // Indigo-200
                      }}
                    />
                  </Box>
                )}
                {section.section === "Documents" && (
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      textAlign: "center",
                      color: "#4B5563", // Gray-600
                      marginBottom: "1rem",
                    }}
                  >
                    Accepted File Type: .pdf, Size: 100Kb-200Kb
                  </Typography>
                )}
                <Row
                  style={{
                    dispaly: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {section.fields.map((field) => {
                    const element = renderField(field, index);
                    if (element != null) {
                      return (
                        <Col xs={12} lg={field.span} key={field.id}>
                          {element}
                        </Col>
                      );
                    }
                    return null;
                  })}
                </Row>
              </Box>
            ))}
            <Box
              sx={{
                position: "sticky",
                bottom: 0,
                background: "linear-gradient(to top, #E0F2FE, #BAE6FD)", // Sky-100 to Sky-200
                padding: "1.5rem",
                borderTop: "1px solid #A5B4FC", // Indigo-200
                boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.1)",
                display: "flex",
                justifyContent: "center",
                gap: 3,
                zIndex: 1000,
              }}
            >
              <Button
                sx={{
                  background: "linear-gradient(to right, #F59E0B, #D97706)", // Amber-500 to Amber-600
                  color: "#FFFFFF",
                  fontSize: { xs: "0.9rem", md: "1rem" },
                  fontWeight: "600",
                  padding: "0.75rem 2.5rem",
                  borderRadius: "10px",
                  textTransform: "none",
                  "&:hover": {
                    background: "linear-gradient(to right, #D97706, #B45309)", // Amber-600 to Amber-700
                  },
                  "&.Mui-disabled": {
                    background: "#D1D5DB", // Gray-300
                    color: "#9CA3AF", // Gray-400
                  },
                }}
                disabled={buttonLoading || loading}
                onClick={handleSubmit((data) => onSubmit(data, "save"))}
              >
                Save{buttonLoading ? "..." : ""}
              </Button>
              <Button
                sx={{
                  background: "linear-gradient(to right, #10B981, #059669)", // Green-500 to Green-600
                  color: "#FFFFFF",
                  fontSize: { xs: "0.9rem", md: "1rem" },
                  fontWeight: "600",
                  padding: "0.75rem 2.5rem",
                  borderRadius: "10px",
                  textTransform: "none",
                  "&:hover": {
                    background: "linear-gradient(to right, #059669, #047857)", // Green-600 to Green-700
                  },
                  "&.Mui-disabled": {
                    background: "#D1D5DB", // Gray-300
                    color: "#9CA3AF", // Gray-400
                  },
                }}
                disabled={buttonLoading || loading}
                onClick={async () => {
                  const valid = await handleValidateAll();
                  if (valid) {
                    handleSubmit((data) => onSubmit(data, "submit"))();
                  } else {
                    setMessageModalOpen(true);
                  }
                }}
              >
                Submit{buttonLoading ? "..." : ""}
              </Button>
            </Box>
          </>
        ) : (
          !loading && (
            <Typography
              sx={{ textAlign: "center", color: "#4B5563", fontSize: "1.2rem" }}
            >
              No form configuration available.
            </Typography>
          )
        )}
      </form>

      <MessageModal
        open={messageModalOpen}
        onClose={() => setMessageModalOpen(false)}
        title="Error"
        message="Some fields are not filled or are incorrectly filed. Please correctly fill all fields."
        type="error" // can be: "error", "success", "warning", "info"
      />
    </Box>
  );
};

export default DynamicScrollableForm;

import { Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { fetchDistricts, fetchServiceList } from "../../assets/fetch";
import CustomSelectField from "../../components/form/CustomSelectField";
import CustomInputField from "../../components/form/CustomInputField";
import CustomButton from "../../components/CustomButton";
import axiosInstance from "../../axiosConfig";
import { downloadFile } from "../../assets/downloadFile";

export default function () {
  const {
    control,
    formState: { errors },
    handleSubmit,
    getValues,
  } = useForm();
  const [districts, setDistricts] = useState([]);
  const [services, setServices] = useState([]);
  const [responseMessage, setResponseMessage] = useState("");
  const [responseColor, setResponseColor] = useState("background.paper");
  const [responseFile, setResponseFile] = useState("");

  useEffect(() => {
    fetchDistricts(setDistricts);
    fetchServiceList(setServices);
  }, []);

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    console.log(formData);
    const response = await axiosInstance.post(
      "/Officer/GetResponseBankFile",
      formData
    );
    const result = response.data;
    console.log(result);
    setResponseMessage(result.message);
    setResponseFile(result.filePath);
    result.status
      ? setResponseColor("background.paper")
      : setResponseColor("red");
  };

  const DownloadFile = () => {
    downloadFile(responseFile);
  };

  const handleDatabaseUpdate = async () => {
    const serviceId = getValues("serviceId");
    const formdata = new FormData();
    formdata.append("serviceId", serviceId);
    formdata.append("responseFile", responseFile);
    const response = await axiosInstance.post(
      "/Officer/ProcessResponseFile",
      formdata
    );
    const result = response.data;
    setResponseMessage(result.message);
    setResponseFile(result.filePath);
    result.status
      ? setResponseColor("background.paper")
      : setResponseColor("red");
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: "10%",
      }}
    >
      <Box
        sx={{
          backgroundColor: "primary.main",
          padding: 3,
          borderRadius: 3,
          height: "max-content",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <CustomSelectField
          label="Select District"
          name="districtId"
          control={control}
          options={districts}
          placeholder="Select District"
          rules={{ required: "This field is required" }}
          errors={errors}
        />
        <CustomSelectField
          label="Select Service"
          name="serviceId"
          control={control}
          options={services}
          placeholder="Select Service"
          rules={{ required: "This field is required" }}
          errors={errors}
        />
        <CustomInputField
          name={"ftpHost"}
          label={"FTP HOST"}
          control={control}
          placeholder="FTP HOST"
          rules={{ required: "This field is required" }}
          errors={errors}
        />
        <CustomInputField
          name={"ftpUser"}
          label={"FTP User"}
          control={control}
          placeholder="FTP User"
          rules={{ required: "This field is required" }}
          errors={errors}
        />
        <CustomInputField
          name={"ftpPassword"}
          label={"FTP Password"}
          type="password"
          control={control}
          placeholder="FTP Password"
          rules={{ required: "This field is required" }}
          errors={errors}
        />
        <CustomButton
          text="Check Response"
          bgColor="background.paper"
          color="primary.main"
          onClick={handleSubmit(onSubmit)}
        />
        {responseMessage != "" && (
          <Typography
            sx={{
              textAlign: "center",
              color: responseColor,
              fontWeight: "bold",
            }}
          >
            {responseMessage}
          </Typography>
        )}
        {responseFile != "" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <CustomButton
              text="Downlaod File"
              bgColor="background.paper"
              color="primary.main"
              onClick={DownloadFile}
            />
            <CustomButton
              text="Update Database"
              bgColor="background.paper"
              color="primary.main"
              onClick={handleDatabaseUpdate}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}

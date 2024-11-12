import { Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import CustomSelectField from "../../components/form/CustomSelectField";
import CustomButton from "../../components/CustomButton";
import {
  checkBankFile,
  fetchDistricts,
  fetchServiceList,
  createBankFile,
} from "../../assets/fetch";
import connection, {
  startSignalRConnection,
} from "../../assets/signalRService";
import SftpModal from "../../components/SftpModal";

export default function BankFile() {
  const {
    control,
    formState: { errors },
    handleSubmit,
    getValues,
  } = useForm();

  const [districts, setDistricts] = useState([]);
  const [services, setServices] = useState([]);
  const [isBankFile, setIsBankFile] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [isTriggered, setIsTriggered] = useState(false);
  const [progress, setProgress] = useState(0);

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    // Fetch initial data for districts and services
    fetchDistricts(setDistricts);
    fetchServiceList(setServices);

    startSignalRConnection();

    connection.onreconnecting((error) => {
      console.log("SignalR reconnecting due to error:", error);
    });

    connection.onreconnected((connectionId) => {
      console.log("SignalR reconnected. Connection ID:", connectionId);
    });

    // Listen for progress updates and set progress
    connection.on("ReceiveProgress", (progress) => {
      console.log("Progress update:", progress);
      setProgress(progress); // Set progress state to trigger re-render
    });

    return () => {
      // Clean up event listener when component unmounts
      connection.off("ReceiveProgress");
    };
  }, []);

  const onSubmit = async (data) => {
    const districtId = data.district;
    const serviceId = data.service;
    const result = await checkBankFile(districtId, serviceId);
    setIsBankFile(result.isBankFileSent);
    setTotalCount(result.totalCount);
    setIsTriggered(true);
  };

  const handleCreateBankFile = async () => {
    try {
      // Reset progress before starting a new file creation
      setProgress(0);

      const districtId = getValues("district");
      const serviceId = getValues("service");
      await createBankFile(districtId, serviceId); // Ensure this function triggers the backend process
    } catch (error) {
      console.error("Error creating bank file:", error);
    }
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
          display: "flex",
          flexDirection: "column",
          backgroundColor: "primary.main",
          width: "40%",
          height: "max-content",
          padding: 3,
          borderRadius: 3,
        }}
      >
        <CustomSelectField
          label="Select District"
          name="district"
          control={control}
          options={districts}
          placeholder="Select District"
          rules={{ required: "This field is required" }}
          errors={errors}
        />
        <CustomSelectField
          label="Select Service"
          name="service"
          control={control}
          options={services}
          placeholder="Select Service"
          rules={{ required: "This field is required" }}
          errors={errors}
        />
        <CustomButton
          text="Check"
          type="submit"
          bgColor="background.paper"
          color="primary.main"
          onClick={handleSubmit(onSubmit)}
        />
      </Box>

      {isTriggered && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Typography sx={{ fontSize: "24px", textAlign: "center" }}>
            {isBankFile == null
              ? "No Bank File for this district and service has been created yet."
              : !isBankFile
              ? "File Already Present for this district and service."
              : "File Sent To Bank."}
          </Typography>
          <Typography sx={{ fontSize: "24px", textAlign: "center" }}>
            {totalCount === 0 ? (
              "No new sanctioned records for this district and service."
            ) : (
              <>
                There are{" "}
                <Typography
                  component="span"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "24px",
                    textAlign: "center",
                    color: "text.primary",
                  }}
                >
                  {totalCount}
                </Typography>{" "}
                new sanctioned records for this district and service.
              </>
            )}
          </Typography>
          {isBankFile == null && totalCount > 0 && (
            <CustomButton
              text="Create Bank File"
              onClick={handleCreateBankFile}
            />
          )}
          {isBankFile != null && !isBankFile && totalCount > 0 && (
            <CustomButton
              text="Append to Bank File"
              onClick={handleCreateBankFile}
            />
          )}
          {(isBankFile != null && !isBankFile && totalCount === 0) ||
          progress === 100 ? (
            <CustomButton text="Send Bank File" onClick={handleOpen} />
          ) : null}

          {/* Render Progress Bar if progress is above 0 */}
          {progress > 0 && (
            <Box sx={{ width: "100%", mt: 2 }}>
              <Typography>Progress: {progress}%</Typography>
              <progress value={progress} max="100" style={{ width: "100%" }} />
            </Box>
          )}
        </Box>
      )}
      <SftpModal
        open={open}
        handleClose={handleClose}
        serviceId={getValues("service")}
        districtId={getValues("district")}
        type={"send"}
      />
    </Box>
  );
}

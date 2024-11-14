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
  fetchData,
} from "../../assets/fetch";
import connection, {
  startSignalRConnection,
} from "../../assets/signalRService";
import SftpModal from "../../components/SftpModal";
import CustomTable from "../../components/CustomTable";

export default function BankFile() {
  const {
    control,
    formState: { errors },
    handleSubmit,
    getValues,
  } = useForm();

  const [districts, setDistricts] = useState([]);
  const [services, setServices] = useState([]);
  const [currentList, setCurrentList] = useState("");
  const [isBankFile, setIsBankFile] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [bankFileRecords, setBankFileRecords] = useState(0);
  const [isTriggered, setIsTriggered] = useState(false);
  const [progress, setProgress] = useState(0);
  const [table, setTable] = useState(null);

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
    setBankFileRecords(result.bankFileRecords);
    console.log(result.isBankFileSent, result.totalCount);
    if (result.isBankFileSent != null && result.isBankFileSent) {
      setCurrentList("Bank File Records");
      setTable({
        url: "/Officer/GetBankFileRecords",
        params: {
          ServiceId: serviceId,
          DistrictId: districtId,
          status: "Dispatched",
        },
        key: Date.now(),
      });
    } else if (result.isBankFileSent != null && !result.isBankFileSent) {
      setCurrentList("Bank File Records");
      setTable({
        url: "/Officer/GetBankFileRecords",
        params: {
          ServiceId: serviceId,
          DistrictId: districtId,
          status: "Deposited",
        },
        key: Date.now(),
      });
    } else if (result.totalCount > 0) {
      console.log(result.totalCount);
      setCurrentList("New Records");
      setTable({
        url: "/Officer/GetBankFileRecords",
        params: {
          ServiceId: serviceId,
          DistrictId: districtId,
          status: "Sanctioned",
        },
        key: Date.now(),
      });
    }
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

  const handleListChange = (name) => {
    setCurrentList(name);
    setTable({
      url: "/Officer/GetBankFileRecords",
      params: {
        ServiceId: getValues("service"),
        DistrictId: getValues("district"),
        status: name == "Bank File Records" ? "Deposited" : "Sanctioned",
      },
      key: Date.now(),
    });
  };

  const BoldText = ({ text }) => {
    return (
      <Typography
        component={"span"}
        sx={{ fontWeight: "bold", fontSize: "24px" }}
      >
        {text}
      </Typography>
    );
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
          {/* Message based on isBankFile status */}
          <Typography sx={{ fontSize: "24px", textAlign: "center" }}>
            {isBankFile == null ? (
              "A bank file for this district and service has not been created yet."
            ) : !isBankFile ? (
              <>
                A bank file for this district and service already exists with{" "}
                <BoldText text={bankFileRecords} /> entries.
              </>
            ) : (
              <>
                The bank file with <BoldText text={bankFileRecords} /> records
                has been sent to the bank.
              </>
            )}
          </Typography>

          {/* Message for sanctioned records count */}
          <Typography sx={{ fontSize: "24px", textAlign: "center" }}>
            {totalCount === 0 ? (
              "There are no new sanctioned records for this district and service."
            ) : (
              <>
                There are <BoldText text={totalCount} /> new sanctioned records
                for this district and service.
              </>
            )}
          </Typography>

          {bankFileRecords > 0 && totalCount > 0 && (
            <Box
              sx={{
                backgroundColor: "primary.main",
                padding: 5,
                display: "flex",
                justifyContent: "center",
                gap: 3,
                borderRadius: 5,
              }}
            >
              <Typography
                sx={{
                  backgroundColor:
                    currentList == "Bank File Records"
                      ? "background.paper"
                      : "gray",
                  borderRadius: 5,
                  paddingLeft: 2,
                  paddingRight: 2,
                  paddingTop: 1,
                  paddingBottom: 1,
                  cursor: "pointer",
                }}
                onClick={() => handleListChange("Bank File Records")}
              >
                Bank File Records
              </Typography>
              <Typography
                sx={{
                  backgroundColor:
                    currentList == "New Records" ? "background.paper" : "gray",
                  borderRadius: 5,
                  paddingLeft: 2,
                  paddingRight: 2,
                  paddingTop: 1,
                  paddingBottom: 1,
                  cursor: "pointer",
                }}
                onClick={() => handleListChange("New Records")}
              >
                New Records
              </Typography>
            </Box>
          )}

          {((isBankFile != null && bankFileRecords > 0) || totalCount > 0) && (
            <CustomTable
              key={table.key}
              fetchData={fetchData}
              url={table.url}
              params={table.params}
              title={currentList + " List"}
            />
          )}

          {/* Create Bank File Button */}
          {isBankFile == null && totalCount > 0 && (
            <CustomButton
              text="Create Bank File"
              onClick={handleCreateBankFile}
            />
          )}

          {/* Append to Bank File Button */}
          {isBankFile != null && !isBankFile && totalCount > 0 && (
            <CustomButton
              text="Append to Bank File"
              onClick={handleCreateBankFile}
            />
          )}

          {/* Send Bank File Button */}
          {((isBankFile != null && !isBankFile && totalCount === 0) ||
            progress === 100) && (
            <CustomButton text="Send Bank File" onClick={handleOpen} />
          )}

          {/* Progress Bar */}
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

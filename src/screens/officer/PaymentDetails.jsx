import { Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../axiosConfig";
import CustomSelectField from "../../components/form/CustomSelectField";
import { useForm } from "react-hook-form";
import CustomTable from "../../components/CustomTable";
import { fetchData, fetchDistricts } from "../../assets/fetch";

export default function PaymentDetails() {
  const [accessLevel, setAccessLevel] = useState("");
  const [accessCode, setAccessCode] = useState(0);
  const [table, setTable] = useState(null);
  const [districts, setDistricts] = useState(0);

  const {
    control,
    formState: { errors },
  } = useForm();
  async function GetOfficerDetails() {
    const response = await axiosInstance.get("/Officer/GetOfficerDetails");
    setAccessLevel(response.data.accessLevel);
    setAccessCode(response.data.accessCode);
    setTable({
      url: "/Officer/GetPaymentDetails",
      params: {},
      key: Date.now(),
    });
  }
  const setDistrict = (value) => {
    setTable({
      url: "/Officer/GetPaymentDetails",
      params: { districtId: parseInt(value) },
      key: Date.now(),
    });
  };

  useEffect(() => {
    GetOfficerDetails();
    fetchDistricts(setDistricts);
  }, []);
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 5,
          backgroundColor: "primary.main",
          borderRadius: 3,
          width: { xs: "90%", md: "20%" },
          padding: 2,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {(accessLevel == "Division" || accessLevel == "State") && (
          <CustomSelectField
            control={control}
            label="Select District"
            name="district"
            options={districts}
            rules={{ required: "This field is required" }}
            errors={errors}
            onChange={(value) => setDistrict(value)}
          />
        )}
      </Box>
      <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
        Payment Details
      </Typography>
      {table != null && (
        <Box sx={{ width: { xs: "100%", md: "80%" } }}>
          <CustomTable
            key={table.key}
            fetchData={fetchData}
            url={table.url}
            params={table.params}
          />
        </Box>
      )}
    </Box>
  );
}

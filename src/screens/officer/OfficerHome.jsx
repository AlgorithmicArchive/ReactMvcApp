import React, { useEffect, useState } from "react";
import { Box, Container } from "@mui/material";
import axiosInstance from "../../axiosConfig";
import CustomSelectField from "../../components/form/CustomSelectField";
import { useForm } from "react-hook-form";
import CustomButton from "../../components/CustomButton";
import StatusCountCard from "../../components/StatusCountCard";

export default function OfficerHome() {
  const [services, setServices] = useState([]); // Initialize as an empty array
  const [serviceId,setServieId] = useState();
  const [countList, setCountList] = useState([]);
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm();

  useEffect(() => {
    const fetchServiceList = async () => {
      try {
        const response = await axiosInstance.get("/Officer/GetServiceList");
        const serviceList = response.data.serviceList;

        // Map over serviceList to create the options array
        const arr = serviceList.map((item) => ({
          label: item.serviceName,
          value: item.serviceId,
        }));

        setServices(arr);
      } catch (error) {
        console.error("Failed to fetch service list:", error);
      }
    };

    fetchServiceList();
  }, []); // Empty dependency array to run only on mount

  const handleRecords = async (data) => {
    try {
      setServieId(data.Service);
      const response = await axiosInstance.get("/Officer/GetApplicationsCount", {
        params: { ServiceId: serviceId },
      });
      
      // Set the count list from response
      setCountList(response.data.countList);
    } catch (error) {
      console.error("Failed to fetch application counts:", error);
    }
  };

  // Handle card click
  const handleCardClick = async(statusName) => {
    console.log(`Card clicked: ${statusName}`);
    if (statusName == "Pending") 
        {
          const response = await axiosInstance.get('/Officer/GetApplications',{params:{ServiceId:serviceId,type:"Pending"}})
        }
  };

  return (
    <Container
      sx={{
        width: "100vw",
        height: "100vh",
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        marginTop: "12vh",
      }}
    >
      <Box
        sx={{
          backgroundColor: "primary.main",
          padding: 1,
          borderRadius: 5,
          width: "50%",
          margin: "0 auto",
          display: "flex",
          gap: 10,
          alignItems: "center",
          paddingRight: 2,
          paddingLeft: 2,
        }}
      >
        <CustomSelectField
          control={control}
          options={services}
          label="Select Service"
          name="Service"
          rules={{ required: "This field is required" }}
          errors={errors}
        />
        <CustomButton
          type="submit"
          onClick={handleSubmit(handleRecords)}
          text="Get Records"
          bgColor="background.default"
          color="primary.main"
          width={"50%"}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-evenly', marginTop: '50px' }}>
        {countList && countList.map((item, index) => (
          <StatusCountCard
            key={index}
            statusName={item.label}
            count={item.count}
            bgColor={item.bgColor}
            textColor={item.textColor}
            onClick={() => handleCardClick(item.label)} // Pass the onClick handler
          />
        ))}
      </Box>
    </Container>
  );
}

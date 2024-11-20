import { Box, Grid2 } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import StatusCountCard from "../../components/StatusCountCard";
import axiosInstance from "../../axiosConfig";
import Chart from "react-apexcharts";
import { useForm } from "react-hook-form";
import CustomSelectField from "../../components/form/CustomSelectField";
import CustomButton from "../../components/CustomButton";
import CustomTable from "../../components/CustomTable";
import { fetchData } from "../../assets/fetch";

export default function AdminHome() {
  const [countList, setCountList] = useState([]);
  const [districts, setDistircts] = useState([]);
  const [services, setServices] = useState([]);
  const [table, setTable] = useState(null);
  const [currentList, setCurrentList] = useState("");

  const [barChartOptions, setBarChartOptions] = useState({
    chart: {
      type: "bar",
      id: "applications-bar-chart",
    },
    plotOptions: {
      bar: {
        distributed: true,
      },
    },
    xaxis: {
      categories: [
        "Total",
        "Pending",
        "Sanctioned",
        "Disbursed",
        "Pending With Citizen",
        "Rejected",
      ],
      labels: {
        style: {
          colors: [
            "#F0C38E",
            "#FFC107",
            "#81C784",
            "#4CAF50",
            "#CE93D8",
            "#FF7043",
          ],
          fontSize: "12px",
          fontWeight: "bold",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#F0C38E",
          fontSize: "12px",
        },
      },
    },
    colors: ["#F0C38E", "#FFC107", "#81C784", "#4CAF50", "#CE93D8", "#FF7043"],
    title: {
      text: "Applications Overview",
      align: "center",
      style: {
        color: "#F0C38E",
        fontSize: "18px",
      },
    },
    legend: {
      show: false,
    },
  });

  const [pieChartOptions, setPieChartOptions] = useState({
    chart: {
      type: "pie",
      id: "applications-pie-chart",
    },
    labels: [
      "Total",
      "Pending",
      "Sanctioned",
      "Disbursed",
      "Pending With Citizen",
      "Rejected",
    ],
    colors: ["#F0C38E", "#FFC107", "#81C784", "#4CAF50", "#CE93D8", "#FF7043"], // Set colors for each pie segment, which also affects legend markers
    title: {
      text: "Applications Overview",
      align: "center",
      style: {
        color: "#F0C38E",
        fontSize: "18px",
      },
    },
    legend: {
      position: "bottom",
      labels: {
        colors: [
          "#F0C38E",
          "#FFC107",
          "#81C784",
          "#4CAF50",
          "#CE93D8",
          "#FF7043",
        ], // Colors for each legend text
        useSeriesColors: true, // Use the pie chart colors for each legend label
      },
      markers: {
        width: 12,
        height: 12,
        radius: 12,
        offsetX: -5,
      },
    },
  });

  const [barChartSeries, setBarChartSeries] = useState([]);
  const [pieChartSeries, setPieChartSeries] = useState([]);

  const {
    control,
    formState: { errors },
    handleSubmit,
    getValues,
  } = useForm();
  const tableRef = useRef(null);

  const fetchCount = async (
    ServiceId = null,
    Officer = null,
    DistrictId = null
  ) => {
    try {
      const response = await axiosInstance.get("/Base/GetApplicationsCount", {
        params: { ServiceId, Officer, DistrictId },
      });
      const data = response.data;
      setCountList(data.countList);
      setDistircts(data.districts);
      setServices(data.services);
      setBarChartSeries([
        {
          name: "Applications",
          data: data.countList.map((item) => item.count),
        },
      ]);
      setPieChartSeries(data.countList.map((item) => item.count));
    } catch (error) {
      console.error("Failed to fetch count data:", error);
    }
  };
  const handleRecords = (data) => {
    fetchCount(data.service, data.officer, data.district);
  };

  useEffect(() => {
    fetchCount();
  }, []);

  const handleCardClick = (statusName) => {
    const applicationStatus =
      statusName == "Total"
        ? null
        : statusName == "Citizen Pending"
        ? "ReturnToEdit"
        : statusName;

    setCurrentList(statusName);
    const district = getValues("district") == "" ? null : getValues("district");
    const service = getValues("service") == "" ? null : getValues("service");
    setTable({
      url: "/Base/GetApplicationDetails",
      params: {
        ServiceId: service,
        DistrictId: district,
        applicationStatus,
      },
      key: Date.now(),
    });
    // Scroll to CustomTable after setting table data
    if (tableRef.current) {
      // Scroll to the element smoothly
      tableRef.current.scrollIntoView({ behavior: "smooth" });

      // Use a slight delay to scroll down by an offset
      setTimeout(() => {
        window.scrollBy({
          top: 200, // Adjust this value to scroll a bit lower
          behavior: "smooth",
        });
      }, 500); // Adjust the delay if necessary
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 5,
        paddingRight: 5,
        paddingLeft: 5,
        marginTop: "110px",
      }}
    >
      <Box
        sx={{
          width: "60%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "primary.main",
          borderRadius: 3,
          padding: 3,
          gap: 2,
        }}
      >
        <CustomSelectField
          label={"Select District"}
          name="district"
          control={control}
          options={districts}
          errors={errors}
        />
        <CustomSelectField
          label={"Select Service"}
          name="service"
          control={control}
          options={services}
          errors={errors}
        />
        <CustomButton
          text="Get Records"
          type="submit"
          bgColor="background.paper"
          color="primary.main"
          onClick={handleSubmit(handleRecords)}
        />
      </Box>

      <Box
        sx={{
          width: "80%",
          display: "flex",
          justifyContent: "center",
          margin: "0 auto",
        }}
      >
        <Grid2 container spacing={0}>
          {countList &&
            countList.map((item, index) => (
              <Grid2 key={index} size={{ md: 4, xs: 12 }}>
                <StatusCountCard
                  statusName={item.label}
                  count={item.count}
                  bgColor={item.bgColor}
                  textColor={item.textColor}
                  onClick={() => handleCardClick(item.label)}
                />
              </Grid2>
            ))}
        </Grid2>
      </Box>

      <Box
        sx={{
          display: "flex",
          width: "100%",
          height: "max-content",
          gap: 5,
          padding: 0,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Grid2
          container
          spacing={5}
          sx={{
            justifyContent: "center",
            alignItems: "center",
          }}
          width={"100%"}
        >
          <Grid2 container spacing={{ xs: 12, md: 6 }} width={"40%"}>
            <Box
              sx={{
                border: "2px solid",
                borderColor: "primary.main",
                padding: 3,
                borderRadius: 3,
                backgroundColor: "background.paper",
                width: "100%",
              }}
            >
              {barChartSeries.length > 0 && (
                <Chart
                  options={barChartOptions}
                  series={barChartSeries}
                  type="bar"
                  width="100%"
                />
              )}
            </Box>
          </Grid2>
          <Grid2 container spacing={{ xs: 12, md: 6 }} width={"40%"}>
            <Box
              sx={{
                border: "2px solid",
                borderColor: "primary.main",
                padding: 3,
                borderRadius: 3,
                backgroundColor: "background.paper",
                width: "100%",
              }}
            >
              {pieChartSeries.length > 0 && (
                <Chart
                  options={pieChartOptions}
                  series={pieChartSeries}
                  type="pie"
                  width="100%"
                />
              )}
            </Box>
          </Grid2>
        </Grid2>
      </Box>

      <Box sx={{ width: "100%" }} ref={tableRef}>
        {table && (
          <CustomTable
            key={table.key}
            fetchData={fetchData}
            url={table.url}
            params={table.params}
            title={currentList + " Applications"}
            buttonActionHandler={() => {}}
          />
        )}
      </Box>
    </Box>
  );
}

import { Box, Container, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import StatusCountCard from '../../components/StatusCountCard';
import axiosInstance from '../../axiosConfig';
import Chart from 'react-apexcharts';
import { useForm } from 'react-hook-form';
import CustomSelectField from '../../components/form/CustomSelectField';

export default function AdminHome() {
  const [countList,setCountList] = useState();
  const [chartOptions, setChartOptions] = useState({
    chart: {
      type: 'bar',
      id: 'applications-bar-chart',
    },
    xaxis: {
      categories: ['Total','Pending', 'Sanctioned', 'Disbursed', 'Pending With Citizen', 'Rejected'], // Labels for each bar
      labels: {
        style: {
          colors: ['#F0C38E','#FFC107', '#81C784', '#4CAF50', '#CE93D8', '#E0E0E0'], // Individual colors for each label
          fontSize: '12px', // Optional: change font size if needed
          fontWeight:'bold'
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#F0C38E', // Color for Y-axis labels (you can specify an array for multiple series)
          fontSize: '12px', // Optional: change font size if needed
        },
      },
    },
    colors: ["#F0C38E","#FFC107", "#81C784", "#4CAF50", "#CE93D8", "#E0E0E0"], // Bar colors
    title: {
      text: 'Applications Overview',
      align: 'center',
      style: {
        color: '#F0C38E', // Custom color for the title text
        fontSize: '18px', // Optional: change font size if needed
      },
    },
  });
  const [chartSeries, setChartSeries] = useState([]);
  const {control,formState:{errors}} = useForm();
  useEffect(()=>{
    const fetchCount = async () =>{
      const response = await axiosInstance.get("/Admin/GetApplicationsCount");
      const data = response.data;
      console.log(data);
      setCountList(response.data.countList);
      setChartSeries([
        {
          name: 'Applications',
          data: [data.countList[0].count, data.countList[1].count, data.countList[2].count, data.countList[3].count, data.countList[4].count], // Map the fetched data
        },
      ]);
    }
    fetchCount();
  },[]);
  return (
    <Box  sx={{ width: '100%', height: '130vh', display: 'flex', justifyContent: 'center', alignItems: 'center',flexDirection:'column',gap:5,paddingRight:5,paddingLeft:5 }}>
      <Box sx={{width:'60%',display:'flex',justifyContent:'space-evenly',backgroundColor:'primary.main',padding:3,borderRadius:3}}>
      <CustomSelectField
          label={'Select District'}
          name="district"
          control={control}
          options={[]}
          errors={errors}
        />
        <CustomSelectField
          label={'Select Service'}
          name="service"
          control={control}
          options={[]}
          errors={errors}
        />
        <CustomSelectField
          label={'Select Officer'}
          name="officer"
          control={control}
          options={[]}
          errors={errors}
        />
      </Box>
      <Box sx={{width:'80%',display: 'flex',justifyContent:'center',margin:'0 auto' }}>
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
      <Box sx={{border:'2px solid',borderColor:'primary.main',marginTop:10,padding:3,borderRadius:3}}>
        {chartSeries.length > 0 && (
          <Chart options={chartOptions} series={chartSeries} type='bar' width="500" />
        )}
      </Box>
    </Box>
  )
}

import { Box } from '@mui/material'
import React, { useState } from 'react'
import CustomTable from '../../components/CustomTable'
import { fetchData, SetServiceId } from '../../assets/fetch'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function Services() {
  const navigate = useNavigate();
  const[loading,setLoading] = useState(false);
  const handleButtonAction = async(functionName, parameters) => {
    if (functionName === 'OpenForm') {
      const formdata = new FormData();
      formdata.append('serviceId',parameters[0]);
      try {
        setLoading(true)
        const result = await SetServiceId(formdata);
        navigate(result.url)
      } catch (error) {
        
      }finally{
        setLoading(false);
      }
    
    }
    // Additional handlers can be added here
  };

  if(loading){
    return <LoadingSpinner/>
  }


  return (
    <Box
      sx={{
        display:'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height:'100vh'
      }}
    >
          <CustomTable
            title={"Services"}
            fetchData={fetchData}
            url="/User/GetServices"
            buttonActionHandler={handleButtonAction}
           />
    </Box>
  )
}

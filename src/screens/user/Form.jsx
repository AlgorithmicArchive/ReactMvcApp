import { Box, Typography } from '@mui/material'
import React from 'react'
import CustomSelectField from '../../components/form/CustomSelectField'
import { useForm } from 'react-hook-form';

export default function Form() {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();
  return (
    <Box
    sx={{
      display:'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height:'100vh'
    }}
  >
   <Box sx={{backgroundColor:'primary.main',padding:5,borderRadius:5}}>
     <CustomSelectField  control={control} name="Demo" placeholder='Number Selection' label="Select Field" options={[{label:"First",value:1},{label:"Second",value:2},{label:"Third",value:3}]}/>
   </Box>
  </Box>
  )
}

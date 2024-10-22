import { Container, Typography, Button, Box, TextField } from '@mui/material';
import React, { useContext, useState } from 'react';
import CustomInputField from '../../components/form/CustomInputField';
import { useForm } from 'react-hook-form';
import CustomButton from '../../components/CustomButton';
import { UserContext } from '../../UserContext';
import { useNavigate } from 'react-router-dom';
import { Validate } from '../../assets/fetch';

export default function Verification() {
  const [selectedOption, setSelectedOption] = useState(null);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const {setUserType} = useContext(UserContext);
  const navigate = useNavigate();

  // Handle option selection
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const onSubmit = async (data) =>{
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      const response = await Validate(formData); // Call the Login function
      console.log(response);
      if(response.status){
        setUserType(response.userType);
        const url = response.userType=="Admin"?"/admin":response.userType=="Officer"?"/officer":"/user";
        navigate(url);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  return (
    <Container sx={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
        Verification
      </Typography>

      {/* Show options if no option is selected */}
      {!selectedOption && (
        <Box sx={{ display: 'flex',flexDirection:'column', gap: 2 }}>
          <Button
            variant="contained"
            sx={{backgroundColor:'primary.main',color:'background.paper'}}
            onClick={() => handleOptionSelect('otp')}
          >
            Use OTP Verification
          </Button>
          <Button
            variant="contained"
            sx={{backgroundColor:'background.paper',color:'primary.main'}}
            onClick={() => handleOptionSelect('backup')}
          >
            Use Backup Codes
          </Button>
        </Box>
      )}

      {/* Conditionally render the input field based on selected option */}
      {selectedOption === 'otp' && (
        <Box sx={{ mt: 4, width: '100%', maxWidth: 400,backgroundColor:'primary.main',padding:5,borderRadius:5,display:'flex',flexDirection:'column',justifyContent:'center'  }}>
         <CustomInputField label="Enter Otp set to your mail." name="otp" placeholder='OTP' type='text' control={control} rules={{required:'OTP is required.'}}/>
         <CustomButton text='Submit' onClick={handleSubmit(onSubmit)} bgColor='background.paper' color='primary.main'/>
        </Box>
      )}

      {selectedOption === 'backup' && (
        <Box sx={{ mt: 4, width: '100%', maxWidth: 400,backgroundColor:'primary.main',padding:5,borderRadius:5,display:'flex',flexDirection:'column',justifyContent:'center' }}>
           <CustomInputField label="Enter Backup Code." name="backupCode" placeholder='Backup Code' type='text' control={control} rules={{required:'Backup Code is required.'}}/>
           <CustomButton text='Submit' onClick={handleSubmit(onSubmit)} bgColor='background.paper' color='primary.main'/>
        </Box>
      )}
    </Container>
  );
}

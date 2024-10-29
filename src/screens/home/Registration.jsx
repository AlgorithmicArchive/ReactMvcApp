import React, {  useState } from 'react';
import { Box, Typography, Container } from '@mui/material';
import { useForm } from 'react-hook-form';
import CustomInputField from '../../components/form/CustomInputField';
import CustomButton from '../../components/CustomButton';
import OtpModal from '../../components/OtpModal';
import ReactLoading from 'react-loading';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

  

export default function RegisterScreen() {

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();


  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [userId,setUserId] = useState(0);
  const [loading, setLoading] = useState(false);
  const naviagate = useNavigate();
  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    const response = await axios.post('/Home/Register',formData);
    const {status,userId} = response.data
    if(status) {
      setLoading(false);
      setIsOtpModalOpen(true);
      setUserId(userId);
    }
  };

  const handleOtpSubmit = async (otp) => {
    setLoading(true);
    const formdata = new FormData();
    formdata.append('otp',otp);
    formdata.append('UserId',userId);
    const response = await axios.post('/Home/OTPValidation',formdata);
    const {status} = response.data;
    if(status){
      setLoading(false);
      naviagate("/login")
    }
  };


  return (
    <Box sx={{ backgroundColor: 'background.default' }}>
      <Box
        sx={{
          marginTop:'',
          width: '100vw',
          height: '130vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 3,
        }}
      >
         {loading &&
              <Container maxWidth={false} sx={{position:'absolute', width:'20vw', backgroundColor:'transparent',top:'50%',borderRadius:10, zIndex:1100,display:'flex',justifyContent:'center',alignItems:'center'}}> 
                <ReactLoading type="spinningBubbles" color="#48426D" height={200} width={200}  />
              </Container>
          }
        <Container
          maxWidth="sm"
          sx={{ mt: 5, bgcolor: 'primary.main', p: 4, borderRadius: 5, boxShadow: 20 }}
        >
         
          <Typography
            variant="h4"
            component="h1"
            sx={{ mb: 3, textAlign: 'center', color: 'background.paper', fontWeight: 'bold' }}
          >
            Registration
          </Typography>

          <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ }}>
              <CustomInputField
                rules={{required:'This Field is required'}}
                label="Full Name"
                name="fullName"
                control={control}
                placeholder="Full Name"
                errors={errors}
              />
              <CustomInputField
                rules={{required:'This Field is required'}}
                label="Username"
                name="username"
                control={control}
                placeholder="Username"
                errors={errors}
              />
            </Box>

            <Box sx={{}}>
              <CustomInputField
                rules={{required:'This Field is required'}}
                label="Email"
                name="email"
                control={control}
                placeholder="Email"
                type="email"
                errors={errors}
              />
              <CustomInputField
                rules={{required:'This Field is required'}}
                label="Mobile Number"
                name="mobileNumber"
                control={control}
                placeholder="Mobile Number"
                errors={errors}
              />
            </Box>

            <Box sx={{}}>
              <CustomInputField
                rules={{required:'This Field is required'}}
                label="Password"
                name="password"
                control={control}
                placeholder="Password"
                type="password"
                errors={errors}
              />
              <CustomInputField
                rules={{required:'This Field is required'}}
                label="Confirm Password"
                name="confirmPassword"
                control={control}
                placeholder="Confirm Password"
                type="password"
                errors={errors}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CustomButton
                text="Register"
                bgColor="background.paper"
                color="primary.main"
                type="submit" // Set type to "submit" for correct form behavior
              />
              
            </Box>
          </Box>
        </Container>
        <OtpModal open={isOtpModalOpen} onClose={() => setIsOtpModalOpen(false)} onSubmit={handleOtpSubmit} />
      </Box>
    </Box>
  );
}

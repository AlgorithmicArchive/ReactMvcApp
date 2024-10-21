import React from 'react';
import { useForm } from 'react-hook-form';
import { Box, Typography, Container } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import CustomInputField from '../../components/form/CustomInputField';
import CustomButton from '../../components/CustomButton';
import { Login } from '../../assets/fetch'; // Assuming the Login function is in this file

// Define a validation schema using Yup
const schema = yup.object().shape({
  username: yup.string().required('Username is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export default function LoginScreen() {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Handle form submission
  const onSubmit = async (data) => {
    // Convert data to FormData
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      console.log(formData);
      const response = await Login(formData); // Call the Login function
      console.log('Login response:', response); // Handle the response as needed
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Box sx={{ backgroundColor: 'background.default' }}>
      <Box
        sx={{
          width: '100vw',
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            mt: 5,
            bgcolor: 'primary.main',
            p: 4,
            borderRadius: 5,
            boxShadow: 20,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              mb: 3,
              textAlign: 'center',
              color: 'background.paper',
              fontWeight: 'bold',
            }}
          >
            Login
          </Typography>

          {/* Form */}
          <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            {/* Username Field */}
            <CustomInputField
              label="Username"
              name="username"
              control={control}
              placeholder="Enter your username"
              rules={{ required: 'Username is required' }}
            />

            {/* Password Field */}
            <CustomInputField
              label="Password"
              name="password"
              control={control}
              type="password"
              placeholder="Enter your password"
              rules={{
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              }}
            />

           {/* Submit Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CustomButton
                text='Login'
                bgColor='background.paper'
                color='primary.main'
                onClick={handleSubmit(onSubmit)} // Use handleSubmit here
                type="submit" // Set type to "submit" for correct form behavior
              />
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

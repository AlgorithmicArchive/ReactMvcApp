import { Box, Typography,TextField } from '@mui/material';
import React from 'react';
import CustomButton from '../components/CustomButton';
import { Email, Phone, LocationOn, AccessTime } from '@mui/icons-material';
import CustomInputField from '../components/form/CustomInputField';
import CustomTextarea from '../components/form/CustomTextArea';

export default function HomeScreen() {
  return (
    <Box sx={{top:'200px',backgroundColor:'background.default'}}>
      {/* Section 1 */}
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection:'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap:3,
        }}
      >
        <Box sx={{backgroundColor:'primary.main',borderRadius:5}}>
          <img src='/assets/images/socialwelfare.png' alt='HOME Image' style={{width:'30vw'}}/>
        </Box>
        <CustomButton text={'Get Started'}/>
      </Box>

      {/* Section 2 */}
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection:'column',
          gap:10
        }}
      >
        <Typography variant="h2" sx={{ color: 'white' }}>
          Services
        </Typography>

        <Box sx={{ display: 'flex', gap: 20 }}>
          <Box sx={{ position: 'relative', width: '20vw', borderRadius: 5,backgroundColor:'primary.main'}}>
            <img
              src='/assets/images/LadliBeti.png'
              alt='Ladli Beti'
              style={{
                width: '100%',
                borderRadius: '5px',
                display: 'block', // Make sure image is displayed as a block
              }}
            />
            <Typography
              variant='h6'
              sx={{
                position: 'absolute',
                top: '50%', // Vertically center
                left: '50%', // Horizontally center
                transform: 'translate(-50%, -50%)', // Adjust the centering
                color: 'background.paper', // Text color
                fontWeight: 'bold',
              }}
            >
              Ladli Beti
            </Typography>
          </Box>
          <Box sx={{ position: 'relative', width: '20vw', borderRadius: 5 ,backgroundColor:'primary.main' }}>
            <img
              src='/assets/images/Pension.png'
              alt='Pension'
              style={{
                width: '100%',
                borderRadius: '5px',
                display: 'block',
              }}
            />
            <Typography
              variant='h6'
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'background.paper',
                fontWeight: 'bold',
              }}
            >
              Pension
            </Typography>
          </Box>
          <Box sx={{ position: 'relative', width: '20vw', borderRadius: 5 ,backgroundColor:'primary.main' }}>
            <img
              src='/assets/images/marriage.png'
              alt='Marriage'
              style={{
                width: '100%',
                borderRadius: '5px',
                display: 'block',
              }}
            />
            <Typography
              variant='h6'
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'background.paper',
                fontWeight: 'bold',
              }}
            >
              Marriage
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Section 3 */}
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
      <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '50px',
            backgroundColor: 'background.paper',
            borderRadius:10,
            gap:5
          }}
        >
          {/* Left Section (Contact Form) */}
          <Box
            sx={{
              flex: 1,
              backgroundColor: 'primary.main',
              padding: '50px',
              boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
              borderRadius: '10px',
              color:'background.paper' 
            }}
          >
              
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
              Contact Us
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
              Feel free to contact us any time. We will get back to you as soon as we can!
            </Typography>

            <CustomInputField  label="Full Name" placeholder='Full Name'/>
            <CustomInputField label="Email" placeholder='Email' type='email'/>
            <CustomTextarea label="Message" placeholder='Message'/>
            <CustomButton text='SEND' bgColor='background.paper' color='primary.main'/>
          </Box>

          {/* Right Section (Info) */}
          <Box
            sx={{
              flex: 1,
              backgroundColor: 'text.primary',
              padding: '50px',
              color: 'background.paper',
              borderRadius: '10px',
              boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
              Info
            </Typography>

            {/* Email Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Email sx={{ mr: 2 }} />
              <Typography>info@getintouch.we</Typography>
            </Box>

            {/* Phone Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Phone sx={{ mr: 2 }} />
              <Typography>+24 56 89 146</Typography>
            </Box>

            {/* Location Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOn sx={{ mr: 2 }} />
              <Typography>14 Greenroad St.</Typography>
            </Box>

            {/* Working Hours */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTime sx={{ mr: 2 }} />
              <Typography>09:00 - 18:00</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

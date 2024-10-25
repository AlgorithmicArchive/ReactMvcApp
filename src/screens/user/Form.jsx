import { Box, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { GetServiceContent } from '../../assets/fetch'; // Assuming you have a function for fetching
import DynamicStepForm from '../../components/form/DynamicStepForm'; // Import your dynamic step form component

export default function Form() {
  const [serviceName, setServiceName] = useState('');
  const [formElements, setFormElements] = useState([]);
  const [serviceId, setServiceId] = useState(null);

  useEffect(() => {
    async function ServiceContent() {
      try {
        const result = await GetServiceContent();
        if (result && result.status) {
          setServiceName(result.serviceName);
          setFormElements(JSON.parse(result.formElement)); // Parse formElements from JSON string
          setServiceId(result.serviceId);
        }
      } catch (error) {
        console.error('Error fetching service content:', error);
      }
    }
    ServiceContent();
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent:'center',
        alignItems:'center',
        flexDirection: 'column',
        padding: 3,
        marginTop:'100px'
      }}
    >
      <Typography variant="h4" sx={{ mb: 3,width:'80%',textAlign:'center' }}>
        {serviceName || 'Loading...'}
      </Typography>

      {/* Render the dynamic step form if formElements are available */}
      {formElements.length > 0 && (
        <Box sx={{backgroundColor:'primary.main',width:'80%',padding:5,borderRadius:5}}>
            <DynamicStepForm formConfig={formElements} serviceId={serviceId} />
        </Box>
      )}
    </Box>
  );
}

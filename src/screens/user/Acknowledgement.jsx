import React, { useEffect, useState } from 'react'
import { fetchAcknowledgement } from '../../assets/fetch'
import { Box, Typography } from '@mui/material';
import PdfViewer from '../../components/PdfViewer';

export default function Acknowledgement() {
    const [url,setUrl] = useState();
    
    useEffect(()=>{
      async function Async(){
        const path =  await fetchAcknowledgement();
       console.log(path);
       setUrl(path)
      }
       Async();
    },[])
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
        <Typography>Acknowledgement</Typography>
        <PdfViewer pdfUrl={url} />
    </Box>
  )
}

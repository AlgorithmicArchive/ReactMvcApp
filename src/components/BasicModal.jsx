import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import CustomTable from './CustomTable';
import PdfViewer from './PdfViewer';
import { fetchData } from '../assets/fetch';

// Modal style
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50vw',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const BasicModal = ({ open, handleClose,Title,table,pdf }) => {
  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">
          {Title}
        </Typography>
        <Box sx={{ mt: 2 }}>
          {table!=null && <CustomTable fetchData={fetchData} url={table.url} params={table.params}/>}
          {pdf!=null && <PdfViewer/>}
        </Box>
        <Button variant="outlined" onClick={handleClose} sx={{ mt: 2 }}>
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default BasicModal;
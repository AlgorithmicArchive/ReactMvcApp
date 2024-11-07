import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import CustomTable from "./CustomTable";
import PdfViewer from "./PdfViewer";
import { fetchData } from "../assets/fetch";
import CustomButton from "./CustomButton";

// Modal style
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "50vw",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const BasicModal = ({
  open,
  handleClose,
  Title,
  table,
  pdf,
  handleActionButton,
  buttonText = "",
}) => {
  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={[style, { maxHeight: "600px", overflowY: "scroll" }]}>
        <Typography variant="h6" component="h2" sx={{ textAlign: "center" }}>
          {Title}
        </Typography>
        <Box sx={{ mt: 2 }}>
          {table != null && (
            <CustomTable
              fetchData={fetchData}
              url={table.url}
              params={table.params}
              buttonActionHandler={handleActionButton}
            />
          )}
          {pdf != null && <PdfViewer pdfUrl={pdf} />}
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Button variant="outlined" onClick={handleClose} sx={{ mt: 2 }}>
            Close
          </Button>
          {handleActionButton && (
            <CustomButton text={buttonText} onClick={handleActionButton} />
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default BasicModal;

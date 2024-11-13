import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import CustomTable from "./CustomTable";
import PdfViewer from "./PdfViewer";
import { fetchData } from "../assets/fetch";
import CustomButton from "./CustomButton";
import UserDetailsAccordion from "./UserDetailsAccordion";
import CancelIcon from "@mui/icons-material/Cancel";

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
  accordion = null,
}) => {
  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={[style, { maxHeight: "600px", overflowY: "scroll" }]}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" component="h2" sx={{ textAlign: "center" }}>
            {Title}
          </Typography>
          <CancelIcon
            color="primary.main"
            onClick={handleClose}
            sx={{ cursor: "pointer", fontSize: "18px" }}
          />
        </Box>
        {accordion && (
          <Box sx={{ mt: 2 }}>
            <UserDetailsAccordion applicationId={accordion} />
          </Box>
        )}
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
            }}
          >
            {handleActionButton && buttonText && (
              <CustomButton text={buttonText} onClick={handleActionButton} />
            )}
            <Button variant="outlined" onClick={handleClose} sx={{ mt: 2 }}>
              Close
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default BasicModal;

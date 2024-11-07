import React, { useEffect, useState } from "react";
import axios from "axios";
import { fetchAcknowledgement } from "../../assets/fetch";
import { Box, Typography } from "@mui/material";
import PdfViewer from "../../components/PdfViewer";
import { useLocation } from "react-router-dom";

export default function Acknowledgement() {
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const location = useLocation();
  const { applicationId } = location.state || {};
  useEffect(() => {
    async function getPdfBlob() {
      try {
        const path = await fetchAcknowledgement(applicationId);
        console.log("Fetched PDF path:", path);

        if (path) {
          // Fetch the PDF as a blob using axios
          const response = await axios.get(path, {
            responseType: "blob",
          });

          if (response.status === 200) {
            const blobUrl = URL.createObjectURL(response.data);
            setPdfBlobUrl(blobUrl);
          } else {
            console.error("Failed to fetch PDF from server:", response);
          }
        }
      } catch (error) {
        console.error("Error loading PDF:", error);
      }
    }

    getPdfBlob();
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: 3,
        marginTop: "100px",
      }}
    >
      <Typography variant="h2" gutterBottom>
        Acknowledgement
      </Typography>
      {pdfBlobUrl ? (
        <PdfViewer pdfUrl={pdfBlobUrl} />
      ) : (
        <Typography variant="body1">Loading PDF...</Typography>
      )}
    </Box>
  );
}

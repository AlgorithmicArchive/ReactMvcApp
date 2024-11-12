import React, { useEffect, useState } from "react";
import axios from "axios";
import { fetchAcknowledgement } from "../../assets/fetch";
import { Box, Typography } from "@mui/material";
import PdfViewer from "../../components/PdfViewer";
import { useLocation } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function Acknowledgement() {
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [path, setPath] = useState("");
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { applicationId } = location.state || {};
  useEffect(() => {
    async function getPdfBlob() {
      try {
        const { path, completePath } = await fetchAcknowledgement(
          applicationId
        );
        if (completePath) {
          // Fetch the PDF as a blob using axios
          const response = await axios.get(completePath, {
            responseType: "blob",
          });

          if (response.status === 200) {
            const blobUrl = URL.createObjectURL(response.data);
            setPdfBlobUrl(blobUrl);
            setPath(path);
          } else {
            console.error("Failed to fetch PDF from server:", response);
          }
        }
      } catch (error) {
        console.error("Error loading PDF:", error);
      } finally {
        setLoading(false);
      }
    }
    setTimeout(() => {
      getPdfBlob();
    }, 2000);
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
      {loading && <LoadingSpinner />}
      <Typography variant="h2" gutterBottom>
        Acknowledgement
      </Typography>
      {pdfBlobUrl ? (
        <PdfViewer pdfUrl={pdfBlobUrl} path={path} />
      ) : (
        <Typography variant="body1">Loading PDF...</Typography>
      )}
    </Box>
  );
}

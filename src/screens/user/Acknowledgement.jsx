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

  const { state } = useLocation();
  const applicationId = state?.applicationId;

  useEffect(() => {
    if (!applicationId) return;

    const getPdfBlob = async () => {
      try {
        const { path, completePath } = await fetchAcknowledgement(
          applicationId
        );

        if (completePath) {
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
    };

    const timeoutId = setTimeout(getPdfBlob, 1000);

    return () => clearTimeout(timeoutId); // cleanup
  }, [applicationId]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: 3,
        marginTop: "100px",
        width: "100%",
      }}
    >
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <Typography variant="h2" gutterBottom>
            Acknowledgement
          </Typography>
          {pdfBlobUrl ? (
            <Box sx={{ width: "80%" }}>
              <PdfViewer
                pdfUrl={pdfBlobUrl}
                path={path}
                exportButton={true}
                width={"80%"}
              />
            </Box>
          ) : (
            <Typography variant="body1">Unable to load PDF.</Typography>
          )}
        </>
      )}
    </Box>
  );
}

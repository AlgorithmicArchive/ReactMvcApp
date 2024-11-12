import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import CustomButton from "./CustomButton";
import { downloadFile } from "../assets/downloadFile";

pdfjs.GlobalWorkerOptions.workerSrc = "/js/pdf.worker.min.js";

const PdfViewer = ({ pdfUrl, path }) => {
  const [numPages, setNumPages] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reset error and page count on retry
    setError(null);
    setNumPages(null);
  }, [retryCount]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error("Failed to load PDF document:", error);
    if (retryCount < 3) {
      setRetryCount(retryCount + 1); // Retry up to 3 times
    } else {
      setError("Failed to load PDF document. Please try again.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "50px",
        gap: 5,
      }}
    >
      <CustomButton text="Export PDF" onClick={() => downloadFile(path)} />
      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          key={retryCount}
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              renderTextLayer
              renderAnnotationLayer
              width={600}
            />
          ))}
        </Document>
      )}
    </div>
  );
};

export default PdfViewer;

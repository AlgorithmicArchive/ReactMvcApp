import React from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import CustomButton from "./CustomButton";
import { downloadFile } from "../assets/downloadFile";

const PdfViewer = ({ pdfUrl, path, exportButton = null }) => {
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
      {exportButton && (
        <CustomButton text="Export PDF" onClick={() => downloadFile(path)} />
      )}
      {/* The Worker component provides the PDF.js worker.
          Here we use a CDN URL; ensure the version here is in sync with the library version. */}
      <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js">
        <div style={{ height: "750px", width: "600px" }}>
          <Viewer fileUrl={pdfUrl} />
        </div>
      </Worker>
    </div>
  );
};

export default PdfViewer;

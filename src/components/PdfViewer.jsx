import React, { useEffect, useState } from 'react';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { Worker } from '@react-pdf-viewer/core';
import { Viewer } from '@react-pdf-viewer/default-layout';

const PdfViewer = () => {
  const pdfUrl = 'http://127.0.0.1:5004/files/JMU_2024-2025_2Acknowledgement.pdf';
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const response = await fetch(pdfUrl, { mode: 'cors' });
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.statusText}`);
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);
      } catch (error) {
        console.error('Error fetching PDF:', error);
      }
    };

    fetchPdf();
  }, []);

  if (!pdfBlobUrl) {
    return <p>Loading PDF...</p>;
  }

  return (
    <div style={{ height: '100vh' }}>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer fileUrl={pdfBlobUrl} />
      </Worker>
    </div>
  );
};

export default PdfViewer;

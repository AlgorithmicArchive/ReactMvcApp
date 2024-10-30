import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import CustomButton from './CustomButton';

// Set the local worker source
pdfjs.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.js';

const PdfViewer = ({ pdfUrl }) => {
  const [numPages, setNumPages] = React.useState(null);
  const [error, setError] = React.useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setError(null); // Clear any previous errors
  };

  const onDocumentLoadError = (error) => {
    console.error('Failed to load PDF document:', error);
    setError('Failed to load PDF document. Please try again.');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'Acknowledgement.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',marginTop:'50px',gap:5 }}>

      <CustomButton text='Export PDF' onClick={handleDownload}/>

      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <Document 
          file={pdfUrl} 
          onLoadSuccess={onDocumentLoadSuccess} 
          onLoadError={onDocumentLoadError}
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          ))}
        </Document>
      )}
    </div>
  );
};

export default PdfViewer;

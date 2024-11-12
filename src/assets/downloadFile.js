import axios from "axios";

export const downloadFile = async (filePath) => {
  try {
    const response = await axios.get(`http://localhost:5004/${filePath}`, {
      responseType: "blob", // Important to handle the file as a Blob
    });

    // Create a link element
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filePath); // Use the provided filename

    // Append the link to the body
    document.body.appendChild(link);

    // Programmatically click the link to trigger the download
    link.click();

    // Clean up
    link.parentNode.removeChild(link);
  } catch (error) {
    console.error("Error downloading the file", error);
  }
};

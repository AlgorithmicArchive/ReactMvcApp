import axiosInstance from '../axiosConfig'; // Adjust the path as needed


export async function Login(formData) {
  try {
    const response = await fetch('/Home/Login', {method:"POST",body:formData});
    return response.json();
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

export async function Validate(formData) {
  try {
    const response = await fetch('/Home/Verification', {method:"POST",body:formData});
    return response.json();
  } catch (error) {
    console.error('Verification failed:', error);
    throw error;
  }
}

export const fetchData = async (page, rowsPerPage, URL) => {
  try {
    const url = `${URL}?page=${page}&size=${rowsPerPage}`;

    const response = await axiosInstance.get(url);

    return {
      data: response.data.data,
      totalCount: response.data.totalCount,
      columns: response.data.columns, // Columns are still included if dynamic
      currentPage: page,
      pageSize: rowsPerPage,
    };
  } catch (error) {
    console.error('Error while fetching data:', error);
    throw error;
  }
};

export async function SetServiceId(formData) {
  try {
    // Make POST request to the desired endpoint with formData as the body
    const response = await axiosInstance.post('/User/SetServiceForm', formData);
    return response.data;
  } catch (error) {
    // Handle error
    console.error('Error setting service ID:', error);
    throw error;
  }
}

export async function GetServiceContent() {
  try {
    const response = await axiosInstance.get('/User/GetServiceContent');
    return response.data;
  } catch (error) {
    console.error('Error getting service content:', error);
    throw error;
  }
}
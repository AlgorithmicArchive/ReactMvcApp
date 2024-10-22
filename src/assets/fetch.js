export async function Login(formdata){
    const response = await fetch('/Home/Login',{method:'POST',body:formdata});
    const data = await response.json();
    return data;
}

export async function Validate(formdata) {
    const response = await fetch('/Home/Verification',{method:'POSt',body:formdata});
    const data = await response.json();
    return data;
}

export const fetchData = async (page, rowsPerPage,URL) => {
  try {
    const url = `${URL}?page=${page}&size=${rowsPerPage}`;

    const response = await fetch(url);


    if (!response.ok) {
      throw new Error('Failed to fetch data from server');
    }

    const result = await response.json();

    return {
      data: result.data,
      totalCount: result.totalCount,
      columns: result.columns, // Columns are still included if dynamic
      currentPage: page,
      pageSize: rowsPerPage,
    };
  } catch (error) {
    console.error('Error while fetching data:', error);
    throw error;
  }
};
import axiosInstance from "../axiosConfig"; // Adjust the path as needed
import axios from "axios";

export async function Login(formData) {
  try {
    const response = await fetch("/Home/Login", {
      method: "POST",
      body: formData,
    });
    return response.json();
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
}

export async function Validate(formData) {
  try {
    const response = await axiosInstance.post("/Home/Verification", formData);
    return response.data; // Return response data directly, no need to parse
  } catch (error) {
    console.error("Verification failed:", error);
    throw error;
  }
}

export const fetchData = async (page, rowsPerPage, URL, params) => {
  try {
    const url = `${URL}?page=${page}&size=${rowsPerPage}`;
    const response = await axiosInstance.get(url, { params: params });
    return {
      data: response.data.data,
      totalCount: response.data.totalCount,
      columns: response.data.columns, // Columns are still included if dynamic
      currentPage: page,
      pageSize: rowsPerPage,
    };
  } catch (error) {
    console.error("Error while fetching data:", error);
    throw error;
  }
};

export async function SetServiceId(formData) {
  try {
    // Make POST request to the desired endpoint with formData as the body
    const response = await axiosInstance.post("/User/SetServiceForm", formData);
    return response.data;
  } catch (error) {
    // Handle error
    console.error("Error setting service ID:", error);
    throw error;
  }
}

export async function GetServiceContent(ServiceId) {
  try {
    const response = await axiosInstance.get("/User/GetServiceContent", {
      params: { ServiceId },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting service content:", error);
    throw error;
  }
}

export const fetchDistricts = async (setDistrictOptions) => {
  try {
    const response = await axios.get("/Base/GetDistricts");
    const { status, districts } = response.data;
    if (status) {
      const formattedDistricts = districts.map((district) => ({
        label: district.districtName,
        value: district.districtId,
      }));
      setDistrictOptions(formattedDistricts);
    } else {
      alert("Failed to load districts.");
    }
  } catch (error) {
    console.error("Error fetching districts:", error);
  }
};

export const fetchTehsils = async (districtId, setTehsilOptions) => {
  try {
    const response = await axios.get(
      `/Base/GetTeshilForDistrict?districtId=${districtId}`
    );
    const { status, tehsils } = response.data;
    if (status) {
      const formattedTehsils = tehsils.map((tehsil) => ({
        label: tehsil.tehsilName,
        value: tehsil.tehsilId,
      }));
      setTehsilOptions(formattedTehsils);
    } else {
      alert("Failed to load tehsils.");
    }
  } catch (error) {
    console.error("Error fetching tehsils:", error);
  }
};

export const fetchBlocks = async (districtId, setBlockOptions) => {
  try {
    const response = await axios.get(
      `/Base/GetBlockForDistrict?districtId=${districtId}`
    );
    const { status, blocks } = response.data;
    if (status) {
      const formattedBlocks = blocks.map((block) => ({
        label: block.blockName,
        value: block.blockId,
      }));
      setBlockOptions(formattedBlocks);
    } else {
      alert("Failed to load blocks.");
    }
  } catch (error) {
    console.error("Error fetching blocks:", error);
  }
};

export async function fetchDesignation(setDesignations, setAccessLevelMap) {
  try {
    const response = await axios.get("/Home/GetDesignations");
    const { status, designations } = response.data;
    if (status) {
      // Create an object with designation.designation as the key and designation.accessLevel as the value
      const designationObject = designations.reduce((acc, designation) => {
        acc[designation.designation] = designation.accessLevel;
        return acc;
      }, {});
      let Designations = designations.map((designation) => ({
        label: designation.designation,
        value: designation.designation,
      }));
      Designations = [{ label: "Select Option", value: "" }, ...Designations];
      setDesignations(Designations);
      setAccessLevelMap(designationObject);
    }
  } catch (error) {
    console.log("Error", error);
  }
}

export async function fetchAcknowledgement() {
  try {
    const response = await axiosInstance.get("/User/GetAcknowledgement");
    const { path } = response.data;

    // Ensure that the path includes the protocol
    const completePath = path.startsWith("http")
      ? path
      : `http://localhost:5004${path}`;
    console.log("Complete PDF Path:", completePath);
    return completePath;
  } catch (error) {
    console.error("Error fetching PDF path:", error);
  }
}

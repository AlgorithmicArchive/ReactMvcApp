import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import {
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useForm, Controller } from "react-hook-form";
import axiosInstance from "../../axiosConfig";
import MessageModal from "../../components/MessageModal";

// Admin hierarchy configuration
const adminHierarchy = {
  State: {
    allowedToCreate: ["Division", "District"],
    roles: [
      {
        Role: "Division Admin",
        RoleShort: "DA",
        AccessLevel: "Division",
        AccessCode: 1,
      },
      {
        Role: "District Admin",
        RoleShort: "DIA",
        AccessLevel: "District",
        AccessCode: 2,
      },
    ],
  },
  Division: {
    allowedToCreate: ["District"],
    roles: [
      {
        Role: "District Admin",
        RoleShort: "DIA",
        AccessLevel: "District",
        AccessCode: 2,
      },
    ],
  },
  District: {
    allowedToCreate: [],
    roles: [],
  },
};

// Mock divisions and districts (replace with API data)
const divisions = [
  { id: 1, name: "Jammu" },
  { id: 2, name: "Kashmir" },
];

const districts = [
  { id: 1, name: "District 1", divisionId: 1 },
  { id: 2, name: "District 2", divisionId: 1 },
  { id: 3, name: "District 3", divisionId: 2 },
];

const useStyles = makeStyles((theme) => ({
  formContainer: {
    padding: "20px",
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
    marginTop: "20px",
  },
  submitButton: {
    marginTop: "20px",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "200px",
  },
}));

export default function AddAdmin() {
  const classes = useStyles();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      mobileNumber: "",
      userType: "Admin",
      role: "",
      division: "",
      district: "",
    },
  });
  const [currentAdminLevel, setCurrentAdminLevel] = useState("");
  const [currentAdminDivision, setCurrentAdminDivision] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const selectedRole = watch("role");
  const selectedDivision = watch("division");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(
          "/Admin/GetCurrentAdminDetails"
        );
        if (!response.data || !response.data.additionalDetails) {
          throw new Error("Admin data is missing");
        }

        const details = JSON.parse(response.data.additionalDetails);
        if (!details || !details.AccessLevel) {
          throw new Error("Invalid admin details");
        }

        setCurrentAdminLevel(details.AccessLevel);
        if (details.DivisionId) {
          setCurrentAdminDivision(details.DivisionId);
        }

        if (adminHierarchy[details.AccessLevel]) {
          setAvailableRoles(adminHierarchy[details.AccessLevel].roles);
        }

        // Filter districts for Division-level admin
        setFilteredDistricts(response.data.districts || []);
      } catch (error) {
        setErrorMessage(`Error loading admin data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data) => {
    const selectedRoleObj = availableRoles.find((r) => r.Role === data.role);
    if (!selectedRoleObj) {
      setErrorMessage("Invalid role selected");
      return;
    }

    const additionalDetails = {
      Role: selectedRoleObj.Role,
      RoleShort: selectedRoleObj.RoleShort,
      AccessLevel: selectedRoleObj.AccessLevel,
      AccessCode: selectedRoleObj.AccessCode,
      Validate: true,
    };

    try {
      const formData = new FormData();

      // Append basic fields
      formData.append("name", data.name);
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("mobileNumber", data.mobileNumber);
      formData.append("role", data.role);
      formData.append("division", data.division);
      formData.append("district", data.district);

      // Append AdditionalDetails as JSON string
      formData.append("AdditionalDetails", JSON.stringify(additionalDetails));

      const response = await axiosInstance.post("/Admin/AddAdmin", formData);

      if (response.data.status) {
        setShowMessageModal(true);
      }

      // Reset form
      setValue("name", "");
      setValue("username", "");
      setValue("email", "");
      setValue("password", "");
      setValue("mobileNumber", "");
      setValue("role", "");
      setValue("division", "");
      setValue("district", "");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(`Error creating admin: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <Container className={classes.loadingContainer}>
        <CircularProgress />
      </Container>
    );
  }

  if (errorMessage) {
    return (
      <Container>
        <Typography variant="h5" gutterBottom>
          Add New Admin
        </Typography>
        <Alert severity="error">{errorMessage}</Alert>
      </Container>
    );
  }

  if (currentAdminLevel === "District") {
    return (
      <Container>
        <Typography variant="h5" gutterBottom>
          Add New Admin
        </Typography>
        <Alert severity="warning">
          District Admins are not authorized to create new admins.
        </Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "#f8f9fa",
        py: 10,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Container>
        <Typography
          variant="h5"
          textAlign={"center"}
          fontWeight={"bold"}
          gutterBottom
        >
          Add New Admin
        </Typography>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        <Box className={classes.formContainer}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Row>
              <Col md={6}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "Name is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Name"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      margin="normal"
                    />
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  name="username"
                  control={control}
                  rules={{ required: "Username is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Username"
                      error={!!errors.username}
                      helperText={errors.username?.message}
                      margin="normal"
                    />
                  )}
                />
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Invalid email format",
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email"
                      type="email"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      margin="normal"
                    />
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  name="password"
                  control={control}
                  rules={{ required: "Password is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Password"
                      type="password"
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      margin="normal"
                    />
                  )}
                />
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Controller
                  name="mobileNumber"
                  control={control}
                  rules={{ required: "Mobile number is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Mobile Number"
                      error={!!errors.mobileNumber}
                      helperText={errors.mobileNumber?.message}
                      margin="normal"
                    />
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  name="role"
                  control={control}
                  rules={{ required: "Role is required" }}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      margin="normal"
                      error={!!errors.role}
                    >
                      <InputLabel>Role</InputLabel>
                      <Select {...field}>
                        <MenuItem value="">Select Role</MenuItem>
                        {availableRoles.map((role) => (
                          <MenuItem key={role.RoleShort} value={role.Role}>
                            {role.Role}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.role && (
                        <Typography color="error">
                          {errors.role.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Col>
            </Row>
            {selectedRole === "Division Admin" &&
              currentAdminLevel === "State" && (
                <Row>
                  <Col md={6}>
                    <Controller
                      name="division"
                      control={control}
                      rules={{ required: "Division is required" }}
                      render={({ field }) => (
                        <FormControl
                          fullWidth
                          margin="normal"
                          error={!!errors.division}
                        >
                          <InputLabel>Division</InputLabel>
                          <Select {...field}>
                            <MenuItem value="">Select Division</MenuItem>
                            {divisions.map((division) => (
                              <MenuItem key={division.id} value={division.id}>
                                {division.name}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.division && (
                            <Typography color="error">
                              {errors.division.message}
                            </Typography>
                          )}
                        </FormControl>
                      )}
                    />
                  </Col>
                </Row>
              )}
            {selectedRole === "District Admin" && (
              <Row>
                <Col md={6}>
                  <Controller
                    name="district"
                    control={control}
                    rules={{ required: "District is required" }}
                    render={({ field }) => (
                      <FormControl
                        fullWidth
                        margin="normal"
                        error={!!errors.district}
                      >
                        <InputLabel>District</InputLabel>
                        <Select {...field}>
                          <MenuItem value="">Select District</MenuItem>
                          {filteredDistricts.map((district) => (
                            <MenuItem
                              key={district.districtId}
                              value={district.districtId}
                            >
                              {district.districtName}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.district && (
                          <Typography color="error">
                            {errors.district.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Col>
              </Row>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ margin: "0 auto" }}
              className={classes.submitButton}
            >
              Create Admin
            </Button>
          </form>
        </Box>
      </Container>
      <MessageModal
        title="Add Admin"
        message={"Admin Added Successfully."}
        type="success"
        key={"addadmin"}
        open={showMessageModal}
        onClose={() => setShowMessageModal(false)}
      />
    </Box>
  );
}

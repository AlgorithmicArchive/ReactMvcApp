import React, { useState } from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import CustomInputField from "./form/CustomInputField";
import CustomButton from "./CustomButton";
import { useForm } from "react-hook-form";
import axiosInstance from "../axiosConfig";

// Modal style
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "50vw",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const SftpModal = ({ open, handleClose, serviceId, districtId, type }) => {
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm();
  const [responseMessage, setResponseMessage] = useState("");
  const [responseColor, setResponseColor] = useState("background.paper");
  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("serviceId", serviceId);
    formData.append("districtId", districtId);
    const response = await axiosInstance.post("/Officer/UploadCsv", formData);
    const result = response.data;
    setResponseMessage(result.message);
    result.status
      ? setResponseColor("background.paper")
      : setResponseColor("red");
  };
  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={[
          style,
          {
            maxHeight: "600px",
            overflowY: "scroll",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 3,
          },
        ]}
      >
        <Typography
          variant="h6"
          component="h2"
          sx={{ textAlign: "center", marginTop: 5 }}
        >
          {type == "send" ? "Send Bank File" : "Get Response File"}
        </Typography>
        <Box sx={{ mt: 2, width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              backgroundColor: "primary.main",
              borderRadius: 5,
              padding: 3,
              width: "100%",
              margin: "0 auto",
            }}
          >
            <CustomInputField
              name={"ftpHost"}
              label={"FTP HOST"}
              control={control}
              placeholder="FTP HOST"
              rules={{ required: "This field is required" }}
              errors={errors}
            />
            <CustomInputField
              name={"ftpUser"}
              label={"FTP User"}
              control={control}
              placeholder="FTP User"
              rules={{ required: "This field is required" }}
              errors={errors}
            />
            <CustomInputField
              name={"ftpPassword"}
              label={"FTP Password"}
              type="password"
              control={control}
              placeholder="FTP Password"
              rules={{ required: "This field is required" }}
              errors={errors}
            />
            <CustomButton
              text={type == "send" ? "Send" : "Recieve"}
              onClick={handleSubmit(onSubmit)}
              bgColor="background.default"
              color="primary.main"
            />
            {responseMessage != "" && (
              <Typography
                sx={{
                  textAlign: "center",
                  color: responseColor,
                  fontWeight: "bold",
                }}
              >
                {responseMessage}
              </Typography>
            )}
          </Box>
        </Box>
        <Button
          variant="outlined"
          onClick={handleClose}
          sx={{ mt: 2, margin: "0 auto" }}
        >
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default SftpModal;

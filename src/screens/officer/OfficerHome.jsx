import React, { useEffect, useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import axiosInstance from "../../axiosConfig";
import CustomSelectField from "../../components/form/CustomSelectField";
import { useForm } from "react-hook-form";
import CustomButton from "../../components/CustomButton";
import StatusCountCard from "../../components/StatusCountCard";
import { useNavigate } from "react-router-dom";
import CustomTable from "../../components/CustomTable";
import { fetchData } from "../../assets/fetch";

export default function OfficerHome() {
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState();
  const [countList, setCountList] = useState([]);
  const [table, setTable] = useState(null);
  const [canSanction, setCanSanction] = useState(false);
  const [pendingList, setPendingList] = useState([]);
  const [approveList, setApproveList] = useState([]);
  const [poolList, setPoolList] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [transferOptions, setTransferOptions] = useState({});
  const [currentList, setCurrentList] = useState("Pending");
  const [transferAction, setTransferAction] = useState(null);
  const [transferValue, setTransferValue] = useState(""); // New state for transfer select field

  const navigate = useNavigate();

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset, // use reset from react-hook-form
  } = useForm();

  const handleSelectionChange = (newSelectedRows) => {
    setSelectedValues(newSelectedRows);
  };

  const moveItems = (
    items,
    sourceList,
    setSourceList,
    targetList,
    setTargetList
  ) => {
    setSourceList((prev) => prev.filter((item) => !items.includes(item)));
    setTargetList((prev) => [...prev, ...items]);
  };

  const fetchServiceList = async () => {
    try {
      const response = await axiosInstance.get("/Officer/GetServiceList");
      const serviceList = response.data.serviceList.map((item) => ({
        label: item.serviceName,
        value: item.serviceId,
      }));
      setServices(serviceList);
    } catch (error) {
      console.error("Failed to fetch service list:", error);
    }
  };

  const updateList = async (serviceId, transfer, list) => {
    try {
      const formdata = new FormData();
      formdata.append("ServiceId", serviceId);
      formdata.append("listType", transfer);
      formdata.append("list", JSON.stringify(list));
      await axiosInstance.post("/Officer/UpdateApprovePoolList", formdata);
    } catch (error) {
      console.error("Error updating list:", error);
    }
  };

  const refreshData = async () => {
    const response = await axiosInstance.get("/Officer/GetApplicationsCount", {
      params: { ServiceId: serviceId },
    });
    setCountList(response.data.countList);
    setCanSanction(response.data.canSanction);

    // Refresh the current list view after transfer
    handleCardClick(currentList);
  };

  useEffect(() => {
    fetchServiceList();
  }, []);

  useEffect(() => {
    if (transferAction) {
      if (serviceId && transferAction) {
        const listToUpdate = selectedValues;
        updateList(serviceId, transferAction, listToUpdate).then(refreshData); // Refresh data after updating
      }
      setTransferAction(null);
      setSelectedValues([]);
      setTransferValue(""); // Reset transfer select field value after transfer
      reset({ Transfer: "" }); // Reset the form to clear the Transfer field
    }
  }, [transferAction, serviceId]);

  const handleRecords = async (data) => {
    try {
      setServiceId(data.Service);
      const response = await axiosInstance.get(
        "/Officer/GetApplicationsCount",
        {
          params: { ServiceId: data.Service },
        }
      );
      setCountList(response.data.countList);
      setCanSanction(response.data.canSanction);
    } catch (error) {
      console.error("Failed to fetch application counts:", error);
    }
  };

  const handleCardClick = async (statusName) => {
    if (statusName === "Pending" && canSanction) {
      const response = await axiosInstance.get("/Officer/GetApprovePoolList", {
        params: { serviceId },
      });
      setPendingList(response.data.pendingList);
      setApproveList(response.data.approveList);
      setPoolList(response.data.poolList);
      setTransferOptions(response.data.transferOptions[0]);
    }
    setTable({
      url: "/Officer/GetApplications",
      params: { ServiceId: serviceId, type: statusName },
      key: Date.now(),
    });
  };

  const handleActionButton = (functionName, parameters) => {
    navigate("/officer/userDetails", {
      state: { applicationId: parameters[0] },
    });
  };

  const handleTransfer = async (data) => {
    const { Transfer: transfer } = data;
    if (!serviceId) {
      console.error("No service selected");
      return;
    }

    switch (transfer) {
      case "PendingToApprove":
        moveItems(
          selectedValues,
          pendingList,
          setPendingList,
          approveList,
          setApproveList
        );
        setTransferAction(transfer);
        break;
      case "ApproveToPool":
        moveItems(
          selectedValues,
          approveList,
          setApproveList,
          poolList,
          setPoolList
        );
        setTransferAction(transfer);
        break;
      case "ApproveToInbox":
        moveItems(
          selectedValues,
          approveList,
          setApproveList,
          pendingList,
          setPendingList
        );
        setTransferAction(transfer);
        break;
      case "PoolToApprove":
        moveItems(
          selectedValues,
          poolList,
          setPoolList,
          approveList,
          setApproveList
        );
        setTransferAction(transfer);
        break;
      case "PoolToInbox":
        moveItems(
          selectedValues,
          poolList,
          setPoolList,
          pendingList,
          setPendingList
        );
        setTransferAction(transfer);
        break;
      default:
        console.error("Unknown transfer action:", transfer);
        break;
    }
    setCurrentList(
      transfer.startsWith("Approve")
        ? "Approve"
        : transfer.startsWith("Pool")
        ? "Pool"
        : "Pending"
    );
  };

  const handleListChange = (type) => {
    setCurrentList(type);
    setTable({
      url: "/Officer/GetApplications",
      params: { ServiceId: serviceId, type: type },
      key: Date.now(),
    });
  };

  return (
    <Container
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        marginTop: "12vh",
      }}
    >
      <Box
        sx={{
          backgroundColor: "primary.main",
          padding: 1,
          borderRadius: 5,
          width: "50%",
          margin: "0 auto",
          display: "flex",
          gap: 10,
          alignItems: "center",
          paddingRight: 2,
          paddingLeft: 2,
        }}
      >
        <CustomSelectField
          control={control}
          options={services}
          label="Select Service"
          name="Service"
          rules={{ required: "This field is required" }}
          errors={errors}
        />
        <CustomButton
          type="submit"
          onClick={handleSubmit(handleRecords)}
          text="Get Records"
          bgColor="background.default"
          color="primary.main"
          width="50%"
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-evenly",
          marginTop: "50px",
        }}
      >
        {countList.map((item, index) => (
          <StatusCountCard
            key={index}
            statusName={item.label}
            count={item.count}
            bgColor={item.bgColor}
            textColor={item.textColor}
            onClick={() => handleCardClick(item.label)}
          />
        ))}
      </Box>
      <Box sx={{ marginTop: 5 }}>
        {canSanction &&
          (pendingList.length > 0 ||
            approveList.length > 0 ||
            poolList.length > 0) && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
                padding: 2,
                backgroundColor: "primary.main",
                marginBottom: 5,
                borderRadius: 5,
              }}
            >
              <Box sx={{ display: "flex", gap: 5 }}>
                <Typography
                  sx={{
                    backgroundColor:
                      currentList === "Pending"
                        ? "background.paper"
                        : "background.default",
                    padding: 2,
                    cursor: "pointer",
                  }}
                  onClick={() => handleListChange("Pending")}
                >
                  Inbox ({pendingList.length})
                </Typography>
                <Typography
                  sx={{
                    backgroundColor:
                      currentList === "Approve"
                        ? "background.paper"
                        : "background.default",
                    padding: 2,
                    cursor: "pointer",
                  }}
                  onClick={() => handleListChange("Approve")}
                >
                  Approve List ({approveList.length})
                </Typography>
                <Typography
                  sx={{
                    backgroundColor:
                      currentList === "Pool"
                        ? "background.paper"
                        : "background.default",
                    padding: 2,
                    cursor: "pointer",
                  }}
                  onClick={() => handleListChange("Pool")}
                >
                  Pool ({poolList.length})
                </Typography>
              </Box>
              <CustomSelectField
                control={control}
                label="Transfer Application"
                name="Transfer"
                options={transferOptions[currentList.toLowerCase()] || []}
                rules={{ required: "This field is required." }}
                errors={errors}
                value={transferValue} // Set value to transferValue state
                onChange={(e) => setTransferValue(e.target.value)} // Update transferValue state
              />
              <CustomButton
                type="submit"
                color="primary.main"
                bgColor="background.default"
                text="Transfer"
                onClick={handleSubmit(handleTransfer)}
                disabled={selectedValues.length === 0}
              />
              <Typography sx={{ color: "background.default" }}>
                Selected Applications: {selectedValues.length}
              </Typography>
            </Box>
          )}
        {table && (
          <CustomTable
            key={table.key}
            fetchData={fetchData}
            url={table.url}
            params={table.params}
            buttonActionHandler={handleActionButton}
            showCheckbox={true}
            fieldToReturn="referenceNumber"
            onSelectionChange={handleSelectionChange}
          />
        )}
      </Box>
    </Container>
  );
}

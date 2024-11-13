import React, { useEffect, useRef, useState } from "react";
import { Box, Container, Grid2, Typography } from "@mui/material";
import axiosInstance from "../../axiosConfig";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import CustomTable from "../../components/CustomTable";
import { fetchData, fetchServiceList } from "../../assets/fetch";
import ServiceSelectionForm from "../../components/ServiceSelectionForm";
import StatusCountCard from "../../components/StatusCountCard";
import CustomSelectField from "../../components/form/CustomSelectField";
import CustomButton from "../../components/CustomButton";
import BasicModal from "../../components/BasicModal";

export default function OfficerHome() {
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState();
  const [countList, setCountList] = useState([]);
  const [table, setTable] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [canSanction, setCanSanction] = useState(false);
  const [pendingList, setPendingList] = useState([]);
  const [approveList, setApproveList] = useState([]);
  const [poolList, setPoolList] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [transferOptions, setTransferOptions] = useState({});
  const [currentList, setCurrentList] = useState("Pending");
  const [transferAction, setTransferAction] = useState(null);
  const [transferValue, setTransferValue] = useState(""); // State for transfer select field
  const [open, setOpen] = useState(false);
  const [modalButtonText, setModalButtonText] = useState("Approve");
  const [handleActionButton, setHandleActionButton] = useState(() => () => {});

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const navigate = useNavigate();

  const tableRef = useRef(null);

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm();

  // Fetch service list on mount
  useEffect(() => {
    fetchServiceList(setServices);
  }, []);

  const handleApprove = async (applicationId, ids) => {
    const response = await axiosInstance.get("/Officer/SignPdf", {
      params: { ApplicationId: applicationId },
    });
    if (response.data.status) {
      const path =
        "/files/" + applicationId.replace(/\//g, "_") + "SanctionLetter.pdf";
      setPdf(path);
      ids = ids.slice(1);
      console.log(ids.length, ids.length > 0);
      setSelectedValues(ids);
      if (ids.length > 0) {
        setTimeout(async () => {
          await handleSanction(ids);
        }, 1000);
      } else {
        console.log("Navigating to /officer/home");
        window.location.reload();
      }
    }
  };
  const handleSanction = async (ids) => {
    const applicationId = ids[0];
    const formData = new FormData();
    formData.append("serviceId", serviceId);
    formData.append("applicationId", applicationId);
    formData.append("action", "sanction");
    formData.append("remarks", "Sanctioned");

    const response = await axiosInstance.post(
      "/Officer/HandleAction",
      formData
    );
    if (response.data.status) {
      if (response.data.action === "sanction") {
        handleOpen();
        const path =
          "/files/" + applicationId.replace(/\//g, "_") + "SanctionLetter.pdf";
        setPdf(path);
        setTable(null);
        setHandleActionButton(() => () => handleApprove(applicationId, ids));
      }
    }
  };

  const handleRecords = async (serviceId) => {
    try {
      setServiceId(serviceId);
      const response = await axiosInstance.get(
        "/Officer/GetApplicationsCount",
        {
          params: { ServiceId: serviceId },
        }
      );
      const countList = response.data.countList;
      if (countList.length == 3)
        countList.push({ label: "", bgColor: "transparent" });
      setCountList(response.data.countList);
      setCanSanction(response.data.canSanction);
    } catch (error) {
      console.error("Failed to fetch application counts:", error);
    }
  };

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
    handleCardClick(currentList);
  };

  useEffect(() => {
    if (transferAction) {
      if (serviceId && transferAction) {
        const listToUpdate = selectedValues;
        updateList(serviceId, transferAction, listToUpdate).then(refreshData);
      }
      setTransferAction(null);
      setSelectedValues([]);
      setTransferValue(""); // Reset transfer select field value after transfer
      reset({ Transfer: "" }); // Reset the form to clear the Transfer field
    }
  }, [transferAction, serviceId]);

  const handleCardClick = async (statusName) => {
    console.log(statusName);
    if (statusName != "") {
      setCurrentList(statusName);
      if (statusName === "Pending" && canSanction) {
        const response = await axiosInstance.get(
          "/Officer/GetApprovePoolList",
          {
            params: { serviceId },
          }
        );
        setPendingList(response.data.pendingList);
        setApproveList(response.data.approveList);
        setPoolList(response.data.poolList);
        setTransferOptions(response.data.transferOptions[0]);
      }
      setTable({
        url: "/Officer/GetApplications",
        params: {
          ServiceId: serviceId,
          type: statusName == "Citizen Pending" ? "ReturnToEdit" : statusName,
        },
        key: Date.now(),
      });
      // Scroll to CustomTable after setting table data
      if (tableRef.current) {
        tableRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
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
      case "SanctionAll":
        const ids = selectedValues;
        await handleSanction(ids);
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

  const handleTableButton = (functionName, paramerters) => {
    if (functionName == "UserDetails") {
      navigate("/officer/userDetails", {
        state: { applicationId: paramerters[0] },
      });
    } else if (functionName == "PullApplication") {
      
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        marginTop: "12vh",
        marginBottom: "5vh",
      }}
    >
      <ServiceSelectionForm
        services={services}
        errors={errors}
        onServiceSelect={handleRecords}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-evenly",
          marginTop: "50px",
          width: "100%",
        }}
      >
        <Grid2 container spacing={0}>
          {countList.map((item, index) => (
            <Grid2 key={index} size={{ md: 4, xs: 12 }}>
              <StatusCountCard
                statusName={item.label}
                count={item.count}
                bgColor={item.bgColor}
                textColor={item.textColor}
                onClick={() => handleCardClick(item.label)}
              />
            </Grid2>
          ))}
        </Grid2>
      </Box>
      <Box sx={{ width: "80%" }}>
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
                      currentList == "Pending"
                        ? "background.paper"
                        : "background.default",
                    borderRadius: 5,
                    paddingLeft: 2,
                    paddingRight: 2,
                    paddingTop: 1,
                    paddingBottom: 1,
                    cursor: "pointer",
                  }}
                  onClick={() => handleListChange("Pending")}
                >
                  Inbox ({pendingList.length})
                </Typography>
                <Typography
                  sx={{
                    backgroundColor:
                      currentList == "Approve"
                        ? "background.paper"
                        : "background.default",
                    borderRadius: 5,
                    paddingLeft: 2,
                    paddingRight: 2,
                    paddingTop: 1,
                    paddingBottom: 1,
                    cursor: "pointer",
                  }}
                  onClick={() => handleListChange("Approve")}
                >
                  Approve List ({approveList.length})
                </Typography>
                <Typography
                  sx={{
                    backgroundColor:
                      currentList == "Pool"
                        ? "background.paper"
                        : "background.default",
                    borderRadius: 5,
                    paddingLeft: 2,
                    paddingRight: 2,
                    paddingTop: 1,
                    paddingBottom: 1,
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
                value={transferValue}
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
        <Box sx={{ width: "100%" }} ref={tableRef}>
          {table && (
            <CustomTable
              key={table.key}
              fetchData={fetchData}
              url={table.url}
              params={table.params}
              title={currentList + " List"}
              buttonActionHandler={handleTableButton}
              showCheckbox={
                canSanction &&
                (currentList === "Pending" ||
                  currentList === "Approve" ||
                  currentList === "Pool")
              }
              fieldToReturn="referenceNumber"
              onSelectionChange={handleSelectionChange}
            />
          )}
        </Box>
      </Box>
      <BasicModal
        open={open}
        handleClose={handleClose}
        Title={"Document"}
        pdf={pdf}
        table={table}
        handleActionButton={handleActionButton}
        buttonText={modalButtonText}
      />
    </Box>
  );
}

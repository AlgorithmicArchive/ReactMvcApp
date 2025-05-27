import React, { useState, useEffect, useCallback } from "react";
import { MaterialReactTable } from "material-react-table";
import { CircularProgress, Box, Button, useTheme } from "@mui/material";
import axiosInstance from "../axiosConfig";

const ServerSideTable = ({
  url,
  actionFunctions,
  extraParams = {},
  canSanction = false,
  pendingApplications = false,
  serviceId,
}) => {
  const theme = useTheme();

  const [columns, setColumns] = useState([]);
  const [inboxData, setInboxData] = useState([]);
  const [poolData, setPoolData] = useState([]);
  const [customActions, setCustomActions] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [viewType, setViewType] = useState("Inbox"); // 'Inbox' or 'Pool'

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(url, {
        params: {
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
          ...extraParams,
        },
      });
      const json = response.data;
      setColumns(json.columns || []);
      setInboxData(json.data || []);
      setPoolData(json.poolData || []);
      setCustomActions(json.customActions || []);
      setPageCount(json.pageCount || 0);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setIsLoading(false);
  }, [url, pagination.pageIndex, pagination.pageSize, extraParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isPoolView = viewType === "Pool";
  const tableData = isPoolView ? poolData : inboxData;
  const showToggleButtons = poolData && poolData.length > 0;

  return (
    <>
      {showToggleButtons && (
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Button
            variant={viewType === "Inbox" ? "contained" : "outlined"}
            onClick={() => setViewType("Inbox")}
          >
            Inbox
          </Button>
          <Button
            variant={viewType === "Pool" ? "contained" : "outlined"}
            onClick={() => setViewType("Pool")}
          >
            Pool
          </Button>
        </Box>
      )}

      <MaterialReactTable
        columns={columns}
        data={tableData}
        state={{
          isLoading,
          ...(canSanction && pendingApplications && { rowSelection }),
          ...(viewType === "Inbox" && { pagination }),
        }}
        onPaginationChange={viewType === "Inbox" ? setPagination : undefined}
        onRowSelectionChange={
          canSanction && pendingApplications ? setRowSelection : undefined
        }
        manualPagination={viewType === "Inbox"}
        enableRowSelection={canSanction && pendingApplications}
        pageCount={viewType === "Inbox" ? pageCount : undefined}
        muiTablePaperProps={{
          sx: {
            borderRadius: "20px",
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            border: `2px solid ${theme.palette.primary.main}`,
            overflow: "hidden",
            boxShadow: "none",
          },
        }}
        muiTableContainerProps={{
          sx: {
            backgroundColor: theme.palette.background.default,
            border: `1px solid ${theme.palette.divider}`,
          },
        }}
        muiTableHeadCellProps={{
          sx: {
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
            fontWeight: "bold",
            borderBottom: `2px solid ${theme.palette.divider}`,
            borderRight: `1px solid ${theme.palette.divider}`,
            "&:last-child": {
              borderRight: "none",
            },
          },
        }}
        muiTableBodyCellProps={{
          sx: {
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
            borderBottom: `1px solid ${theme.palette.divider}`,
            "&:last-child": {
              borderRight: "none",
            },
          },
        }}
        muiTableFooterRowProps={{
          sx: {
            borderTop: `2px solid ${theme.palette.divider}`,
          },
        }}
        muiTablePaginationProps={{
          rowsPerPageOptions: [10, 25, 50],
          sx: {
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.background.paper,
            borderTop: `1px solid ${theme.palette.divider}`,
          },
        }}
        renderBottomToolbarCustomActions={() =>
          isLoading && <CircularProgress size={24} />
        }
        enableRowActions={customActions.length > 0}
        positionActionsColumn="last"
        renderRowActions={({ row }) => (
          <Box sx={{ display: "flex", gap: "8px" }}>
            {customActions.map((action, index) => {
              const onClickHandler = actionFunctions[action.actionFunction];
              return (
                row.original.sno === action.id && (
                  <Button
                    key={index}
                    variant="contained"
                    color={action.color || "primary"}
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.background.paper,
                      textTransform: "none",
                      fontWeight: "bold",
                      "&:hover": {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    }}
                    onClick={() => onClickHandler && onClickHandler(row)}
                  >
                    {action.name || action.tooltip}
                  </Button>
                )
              );
            })}
          </Box>
        )}
        renderTopToolbarCustomActions={({ table }) => {
          const selectedRows = table.getSelectedRowModel().rows;

          if (canSanction && pendingApplications && viewType === "Inbox") {
            // Show "Push to Pool" button
            return (
              <Button
                variant="contained"
                color="primary"
                disabled={selectedRows.length === 0}
                onClick={async () => {
                  const selectedData = selectedRows.map(
                    (row) => row.original.referenceNumber
                  );
                  const list = JSON.stringify(selectedData);
                  const response = await axiosInstance.get(
                    "/Officer/UpdatePool",
                    {
                      params: {
                        serviceId: serviceId,
                        list: list,
                      },
                    }
                  );
                  console.log(response.data);
                }}
                sx={{
                  fontWeight: "bold",
                  textTransform: "none",
                  color: theme.palette.background.paper,
                }}
              >
                Push to Pool
              </Button>
            );
          } else if (canSanction && viewType == "Pool") {
            // Show "Bulk Sanction" button
            return (
              <Button
                variant="contained"
                color="primary"
                disabled={selectedRows.length === 0}
                onClick={async () => {
                  const selectedData = selectedRows.map(
                    (row) => row.original.referenceNumber
                  );
                  const list = JSON.stringify(selectedData);
                  console.log(list);
                  // Uncomment and use API if needed
                  // const response = await axiosInstance.get(
                  //   "/Officer/UpdatePool",
                  //   {
                  //     params: {
                  //       serviceId: serviceId,
                  //       list: list,
                  //     },
                  //   }
                  // );
                  // console.log(response.data);
                }}
                sx={{
                  fontWeight: "bold",
                  textTransform: "none",
                  color: theme.palette.background.paper,
                }}
              >
                Bulk Sanction
              </Button>
            );
          } else {
            return null; // Nothing to show if canSanction is false
          }
        }}
      />
    </>
  );
};

export default ServerSideTable;

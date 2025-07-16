import React, { useState, useEffect, useCallback } from "react";
import { MaterialReactTable } from "material-react-table";
import {
  Box,
  Button,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  useTheme,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  darken,
} from "@mui/material";
import { Container } from "react-bootstrap";
import axiosInstance from "../axiosConfig";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RefreshIcon from "@mui/icons-material/Refresh";

const ServerSideTable = ({
  url,
  actionFunctions,
  extraParams = {},
  canSanction = false,
  canHavePool = false,
  pendingApplications = false,
  serviceId,
  refreshTrigger,
  onPushToPool,
  onExecuteAction,
  actionOptions,
  selectedAction,
  setSelectedAction,
}) => {
  const theme = useTheme();

  const [columns, setColumns] = useState([]);
  const [inboxData, setInboxData] = useState([]);
  const [poolData, setPoolData] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [viewType, setViewType] = useState("Inbox");
  const [hasActions, setHasActions] = useState(false); // New state for actions column

  const formControlStyles = {
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: "divider" },
      "&:hover fieldset": { borderColor: "primary.main" },
      "&.Mui-focused": {
        borderColor: "primary.main",
        borderWidth: "2px",
      },
      backgroundColor: "background.paper",
      color: "text.primary",
      borderRadius: 1,
    },
    "& .MuiInputLabel-root": {
      color: "text.primary",
      "&.Mui-focused": { color: "primary.main" },
    },
    minWidth: 150,
    mr: 2,
  };

  const buttonStyles = {
    textTransform: "none",
    fontWeight: 600,
    fontSize: { xs: 12, md: 14 },
    py: 1,
    "&:hover": {
      backgroundColor: "primary.dark",
      transform: "scale(1.02)",
      transition: "all 0.2s ease",
    },
  };

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

      // Check for customActions in data
      const hasAnyActions =
        json.data?.some((row) => row.customActions?.length > 0) ||
        json.poolData?.some((row) => row.customActions?.length > 0) ||
        false;

      setHasActions(hasAnyActions);
      setColumns(json.columns || []);
      setInboxData(json.data || []);
      setPoolData(json.poolData || []);
      setTotalRecords(json.totalRecords || 0);
      setPageCount(Math.ceil((json.totalRecords || 0) / pagination.pageSize));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load table data. Please try again.", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    url,
    pagination.pageIndex,
    pagination.pageSize,
    extraParams,
    refreshTrigger,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isPoolView = viewType === "Pool";
  const tableData = isPoolView ? poolData : inboxData;
  const showToggleButtons = poolData && poolData.length > 0;

  const handleViewTypeChange = (event, newViewType) => {
    if (newViewType !== null) {
      setViewType(newViewType);
      setRowSelection({});
    }
  };
  console.log(
    "Can Sanction",
    canSanction,
    "Pending Applications",
    pendingApplications
  );

  return (
    <Container
      style={{
        maxWidth: 1200,
        padding: 0,
        background:
          "linear-gradient(135deg, rgb(252, 252, 252) 0%, rgb(240, 236, 236) 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, md: 4 },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1200,
          bgcolor: "background.default",
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          p: { xs: 2, md: 3 },
          transition: "transform 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-5px)",
          },
        }}
        role="region"
        aria-labelledby="table-title"
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Tooltip title="Refresh Data" arrow>
            <Button
              variant="outlined"
              color="primary"
              onClick={fetchData}
              sx={{ textTransform: "none", fontWeight: 600 }}
              aria-label="Refresh table data"
            >
              <RefreshIcon />
            </Button>
          </Tooltip>
        </Box>

        {showToggleButtons && (
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <ToggleButtonGroup
              value={viewType}
              exclusive
              onChange={handleViewTypeChange}
              aria-label="View type selection"
              sx={{
                "& .MuiToggleButton-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  "&.Mui-selected": {
                    backgroundColor: "primary.main",
                    color: "background.paper",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                  },
                  "&:hover": {
                    backgroundColor: "primary.light",
                    transform: "scale(1.02)",
                    transition: "all 0.2s ease",
                  },
                },
              }}
            >
              <ToggleButton value="Inbox" aria-label="Inbox view">
                Inbox
              </ToggleButton>
              <ToggleButton value="Pool" aria-label="Pool view">
                Pool
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}

        <MaterialReactTable
          key={`${pagination.pageIndex}-${pagination.pageSize}`}
          columns={columns}
          data={tableData}
          state={{
            pagination,
            isLoading,
            ...(canSanction && pendingApplications && { rowSelection }),
          }}
          onPaginationChange={setPagination}
          onRowSelectionChange={
            canSanction && pendingApplications ? setRowSelection : undefined
          }
          enableRowSelection={canSanction && pendingApplications}
          manualPagination
          enablePagination
          pageCount={pageCount}
          rowCount={totalRecords}
          muiTablePaperProps={{
            sx: {
              borderRadius: "12px",
              backgroundColor: "background.paper",
              color: "text.primary",
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
            },
          }}
          muiTableContainerProps={{
            sx: {
              maxHeight: "600px",
              backgroundColor: "background.default",
              border: `1px solid ${theme.palette.divider}`,
            },
          }}
          muiTableHeadCellProps={{
            sx: {
              backgroundColor: "background.default",
              color: "text.primary",
              fontWeight: 600,
              fontSize: { xs: 12, md: 14 },
              borderBottom: `2px solid ${theme.palette.divider}`,
              borderRight: `1px solid ${theme.palette.divider}`,
              "&:last-child": {
                borderRight: "none",
              },
            },
          }}
          muiTableBodyRowProps={{
            sx: {
              "&:hover": {
                backgroundColor: "action.hover",
                transition: "background-color 0.2s ease",
              },
            },
          }}
          muiTableBodyCellProps={{
            sx: {
              color: "text.primary",
              backgroundColor: "background.paper",
              fontSize: { xs: 12, md: 14 },
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
            showFirstButton: true,
            showLastButton: true,
            pageCount: pageCount,
            sx: {
              color: "text.primary",
              backgroundColor: "background.paper",
              borderTop: `1px solid ${theme.palette.divider}`,
              fontSize: { xs: 12, md: 14 },
            },
          }}
          renderEmptyRowsFallback={() => (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                color: "text.secondary",
                fontSize: { xs: 14, md: 16 },
              }}
            >
              No {viewType.toLowerCase()} applications available.
            </Box>
          )}
          renderBottomToolbarCustomActions={() => (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {isLoading && (
                <CircularProgress
                  size={24}
                  color="primary"
                  aria-label="Loading table data"
                />
              )}
              <Typography variant="body2" color="text.secondary">
                Total Records: {totalRecords}
              </Typography>
            </Box>
          )}
          {...(hasActions && {
            // Conditionally enable actions column
            enableRowActions: true,
            positionActionsColumn: "last",
            renderRowActions: ({ row }) => {
              return (
                <Box sx={{ display: "flex", gap: 1 }}>
                  {Array.isArray(row.original.customActions) ? (
                    (row.original.customActions || []).map((action, index) => {
                      const onClickHandler =
                        actionFunctions[action.actionFunction];
                      return (
                        <Tooltip key={index} title={action.tooltip} arrow>
                          <Button
                            variant="contained"
                            size="small"
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              fontSize: { xs: 12, md: 13 },
                              py: 0.5,
                              backgroundColor: "primary.main",
                              "&:hover": {
                                transform: "scale(1.02)",
                                transition: "all 0.2s ease",
                              },
                            }}
                            onClick={() =>
                              onClickHandler && onClickHandler(row)
                            }
                            aria-label={`${
                              action.name || action.tooltip
                            } for row ${row.original.sno}`}
                          >
                            {action.name || action.tooltip}
                          </Button>
                        </Tooltip>
                      );
                    })
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {row.original.customActions}
                    </Typography>
                  )}
                </Box>
              );
            },
          })}
          renderTopToolbarCustomActions={({ table }) => {
            const selectedRows = table.getSelectedRowModel().rows;
            if (canSanction && pendingApplications && viewType === "Inbox") {
              return (
                <Button
                  variant="contained"
                  color="primary"
                  disabled={selectedRows.length === 0}
                  onClick={() => onPushToPool(selectedRows)}
                  sx={buttonStyles}
                  aria-label="Push selected applications to pool"
                >
                  Push to Pool
                </Button>
              );
            } else if (canHavePool && viewType === "Pool") {
              return (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FormControl sx={formControlStyles}>
                    <InputLabel id="bulk-action-select-label">
                      Bulk Action
                    </InputLabel>
                    <Select
                      labelId="bulk-action-select-label"
                      value={selectedAction}
                      label="Bulk Action"
                      onChange={(e) => setSelectedAction(e.target.value)}
                      size="small"
                    >
                      {actionOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={selectedRows.length === 0}
                    onClick={() => onExecuteAction(selectedRows)}
                    sx={buttonStyles}
                    aria-label={`Execute ${selectedAction.toLowerCase()} action`}
                  >
                    Execute
                  </Button>
                </Box>
              );
            }
            return null;
          }}
        />
      </Box>

      <ToastContainer />
    </Container>
  );
};

export default ServerSideTable;

import React, { useState, useEffect, useCallback } from "react";
import { MaterialReactTable } from "material-react-table";
import {
  Box,
  Button,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../axiosConfig";
import styled from "@emotion/styled";

const TableContainer = styled(Box)`
  background: linear-gradient(180deg, #e6f0fa 0%, #b3cde0 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const TableCard = styled(Box)`
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  width: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  }
`;

const ActionButton = styled(Button)`
  background: linear-gradient(45deg, #1e88e5, #4fc3f7);
  color: #ffffff;
  font-weight: 600;
  text-transform: none;
  border-radius: 8px;
  padding: 0.5rem 1.5rem;
  transition: all 0.3s ease;
  &:hover {
    background: linear-gradient(45deg, #1565c0, #039be5);
    box-shadow: 0 4px 12px rgba(30, 136, 229, 0.3);
  }
`;

const RefreshButton = styled(Button)`
  border: 1px solid #1e88e5;
  color: #1e88e5;
  font-weight: 600;
  text-transform: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
  &:hover {
    background: #1e88e5;
    color: #ffffff;
    transform: scale(1.02);
  }
`;

const StyledToggleButtonGroup = styled(ToggleButtonGroup)`
  & .MuiToggleButton-root {
    text-transform: none;
    font-weight: 600;
    padding: 0.5rem 2rem;
    border-radius: 8px;
    border: 1px solid #b3cde0;
    color: #1f2937;
    transition: all 0.3s ease;
    &:hover {
      background: #e6f0fa;
      transform: scale(1.02);
    }
    &.Mui-selected {
      background: linear-gradient(45deg, #1e88e5, #4fc3f7);
      color: #ffffff;
      &:hover {
        background: linear-gradient(45deg, #1565c0, #039be5);
      }
    }
  }
`;

const StyledFormControl = styled(FormControl)`
  & .MuiOutlinedInput-root {
    border-radius: 8px;
    background: #ffffff;
    border: 1px solid #b3cde0;
    &:hover .MuiOutlinedInput-notchedOutline {
      border-color: #1e88e5;
    }
    &.Mui-focused .MuiOutlinedInput-notchedOutline {
      border-color: #1e88e5;
      border-width: 2px;
    }
  }
  & .MuiInputLabel-root {
    color: #1f2937;
    &.Mui-focused {
      color: #1e88e5;
    }
  }
  min-width: 150px;
  margin-right: 1rem;
`;

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
  Title,
}) => {
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
  const [hasActions, setHasActions] = useState(false);
  const [columnOrder, setColumnOrder] = useState([]);

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
      const hasAnyActions =
        json.data?.some((row) => row.customActions?.length > 0) ||
        json.poolData?.some((row) => row.customActions?.length > 0) ||
        false;

      const updatedColumns = Object.values(json.columns || {}).map((col) =>
        col.accessorKey === "sno" ? { ...col, size: 20 } : col
      );

      setHasActions(hasAnyActions);
      setColumns(updatedColumns);
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

  return (
    <TableContainer>
      <TableCard>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#1f2937",
            fontFamily: "'Inter', sans-serif",
            mb: 2,
            textAlign: "center",
          }}
        >
          {Title}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="body2" color="#6b7280">
            Total Records: {totalRecords}
          </Typography>
          <Tooltip title="Refresh Data" arrow>
            <RefreshButton
              variant="outlined"
              onClick={fetchData}
              aria-label="Refresh table data"
            >
              <RefreshIcon />
            </RefreshButton>
          </Tooltip>
        </Box>
        {showToggleButtons && (
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <StyledToggleButtonGroup
              value={viewType}
              exclusive
              onChange={handleViewTypeChange}
              aria-label="View type selection"
            >
              <ToggleButton value="Inbox" aria-label="Inbox view">
                Inbox ({inboxData.length})
              </ToggleButton>
              <ToggleButton value="Pool" aria-label="Pool view">
                Pool ({poolData.length})
              </ToggleButton>
            </StyledToggleButtonGroup>
          </Box>
        )}
        <MaterialReactTable
          key={`${pagination.pageIndex}-${pagination.pageSize}`}
          columns={columns}
          data={tableData}
          state={{
            pagination,
            isLoading,
            columnOrder,
            ...(canSanction && pendingApplications && { rowSelection }),
          }}
          onPaginationChange={setPagination}
          onRowSelectionChange={
            canSanction && pendingApplications ? setRowSelection : undefined
          }
          onColumnOrderChange={setColumnOrder}
          enableRowSelection={canSanction && pendingApplications}
          enableColumnOrdering
          manualPagination
          enablePagination
          pageCount={pageCount}
          rowCount={totalRecords}
          muiTablePaperProps={{
            sx: {
              borderRadius: "12px",
              background: "#ffffff",
              border: "1px solid #b3cde0",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
            },
          }}
          muiTableContainerProps={{
            sx: { maxHeight: "600px", background: "#ffffff" },
          }}
          muiTableHeadCellProps={{
            sx: {
              background: "#e6f0fa",
              color: "#1f2937",
              fontWeight: 600,
              fontSize: { xs: 12, md: 14 },
              borderBottom: "2px solid #b3cde0",
              borderRight: "1px solid #b3cde0",
              "&:last-child": { borderRight: "none" },
            },
          }}
          muiTableBodyRowProps={{
            sx: {
              "&:hover": {
                background: "#f8fafc",
                transition: "background-color 0.2s ease",
              },
            },
          }}
          muiTableBodyCellProps={{
            sx: {
              color: "#1f2937",
              background: "#ffffff",
              fontSize: { xs: 12, md: 14 },
              borderRight: "1px solid #b3cde0",
              borderBottom: "1px solid #b3cde0",
              "&:last-child": { borderRight: "none" },
            },
          }}
          muiTableFooterRowProps={{
            sx: { borderTop: "2px solid #b3cde0" },
          }}
          muiTablePaginationProps={{
            rowsPerPageOptions: [10, 25, 50],
            showFirstButton: true,
            showLastButton: true,
            sx: {
              color: "#1f2937",
              background: "#ffffff",
              borderTop: "1px solid #b3cde0",
              fontSize: { xs: 12, md: 14 },
            },
          }}
          renderEmptyRowsFallback={() => (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                color: "#6b7280",
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
                  sx={{ color: "#1e88e5" }}
                  aria-label="Loading table data"
                />
              )}
            </Box>
          )}
          {...(hasActions && {
            enableRowActions: true,
            positionActionsColumn: "last",
            renderRowActions: ({ row }) => (
              <Box sx={{ display: "flex", gap: 1 }}>
                {Array.isArray(row.original.customActions) ? (
                  (row.original.customActions || []).map((action, index) => (
                    <Tooltip key={index} title={action.tooltip} arrow>
                      <ActionButton
                        variant="contained"
                        size="small"
                        onClick={() =>
                          actionFunctions[action.actionFunction]?.(row)
                        }
                        aria-label={`${action.name || action.tooltip} for row ${
                          row.original.sno
                        }`}
                      >
                        {action.name || action.tooltip}
                      </ActionButton>
                    </Tooltip>
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: "#1f2937" }}
                  >
                    {row.original.customActions}
                  </Typography>
                )}
              </Box>
            ),
          })}
          renderTopToolbarCustomActions={({ table }) => {
            const selectedRows = table.getSelectedRowModel().rows;
            if (canSanction && pendingApplications && viewType === "Inbox") {
              return (
                <ActionButton
                  variant="contained"
                  disabled={selectedRows.length === 0}
                  onClick={() => onPushToPool(selectedRows)}
                  aria-label="Push selected applications to pool"
                >
                  Push to Pool
                </ActionButton>
              );
            } else if (canHavePool && viewType === "Pool") {
              return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <StyledFormControl>
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
                  </StyledFormControl>
                  <ActionButton
                    variant="contained"
                    disabled={selectedRows.length === 0}
                    onClick={() => onExecuteAction(selectedRows)}
                    aria-label={`Execute ${selectedAction.toLowerCase()} action`}
                  >
                    Execute
                  </ActionButton>
                </Box>
              );
            }
            return null;
          }}
        />
        <ToastContainer
          toastStyle={{
            background: "#ffffff",
            color: "#1f2937",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        />
      </TableCard>
    </TableContainer>
  );
};

export default ServerSideTable;

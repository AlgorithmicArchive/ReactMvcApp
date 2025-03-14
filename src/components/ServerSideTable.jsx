import React, { useState, useEffect, useCallback } from "react";
import { MaterialReactTable } from "material-react-table";
import { CircularProgress, Box, Button } from "@mui/material";
import axiosInstance from "../axiosConfig";

const ServerSideTable = ({ url, actionFunctions, extraParams = {} }) => {
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [customActions, setCustomActions] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Function to fetch data using axios; extraParams are spread into the request
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(url, {
        params: {
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
          ...extraParams, // Merge extra params here
        },
      });
      const json = response.data;
      // Expected API response shape:
      // { columns, data, customActions, pageCount }
      setColumns(json.columns);
      setData(json.data);
      setCustomActions(json.customActions || []);
      setPageCount(json.pageCount);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setIsLoading(false);
  }, [url, pagination, extraParams]);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      state={{ isLoading }}
      manualPagination
      pageCount={pageCount}
      mrtTheme={(theme) => ({
        baseBackgroundColor: "#312C51", // default background for toolbar and table
        draggingBorderColor: theme.palette.primary.main,
        selectedRowBackgroundColor: theme.palette.action.selected,
      })}
      muiTablePaperProps={{
        sx: {
          borderRadius: "20px",
          color: "#F0C38E",
          "& .MuiSvgIcon-root": {
            color: "#F0C38E",
          },
        },
      }}
      muiTablePaginationProps={{
        rowsPerPageOptions: [10, 25, 50],
      }}
      onPaginationChange={(newPagination) => setPagination(newPagination)}
      renderBottomToolbarCustomActions={() =>
        isLoading && <CircularProgress size={24} />
      }
      title="Server-side Data Table"
      enableRowActions={customActions.length > 0}
      positionActionsColumn="last"
      renderRowActions={({ row }) => (
        <Box sx={{ display: "flex", gap: "8px" }}>
          {customActions.map((action, index) => {
            // Look up the function using the function name provided by the API
            const onClickHandler = actionFunctions[action.actionFunction];
            return (
              row.original.sno == action.id && (
                <Button
                  key={index}
                  variant="contained"
                  color={action.color || "inherit"}
                  sx={{ backgroundColor: "#F0C38E", color: "#312C51" }}
                  onClick={() => onClickHandler && onClickHandler(row)}
                >
                  {action.name || action.tooltip}
                </Button>
              )
            );
          })}
        </Box>
      )}
    />
  );
};

export default ServerSideTable;

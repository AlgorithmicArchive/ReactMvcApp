import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, TableSortLabel,
  Paper, Typography, CircularProgress, Button
} from '@mui/material';

const CustomTable = ({ title, fetchData, initialRowsPerPage = 10, url, buttonActionHandler,params }) => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState(''); // Initially no orderBy
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [columns, setColumns] = useState([]);
  

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await fetchData(page, rowsPerPage, url,params);
        setData(result.data);
        setTotalCount(result.totalCount);
        setColumns(result.columns); // Expected to be an array of objects with 'label' and 'value' properties
        if (orderBy === '' && result.columns.length > 0) {
          setOrderBy(result.columns[0].value); // Use 'value' instead of transforming label
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
      setLoading(false);
    };

    loadData();
  }, [page, rowsPerPage, orderBy, order, fetchData]);

  // Sorting logic (client-side sorting)
  const handleRequestSort = (property) => {
    const isAscending = orderBy === property && order === 'asc';
    setOrder(isAscending ? 'desc' : 'asc');
    setOrderBy(property);

    // Perform client-side sorting of the data
    const sortedData = [...data].sort((a, b) => {
      if (a[property] < b[property]) {
        return isAscending ? 1 : -1;
      }
      if (a[property] > b[property]) {
        return isAscending ? -1 : 1;
      }
      return 0;
    });
    setData(sortedData);
  };

  // Pagination logic
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Paper sx={{padding:5,border:'2px solid',borderColor:'primary.main',width:'100%'}}>
      <Typography variant="h6" component="div" sx={{ p: 2, color: 'primary.main' }}>
        {title}
      </Typography>
      <TableContainer>
        <Table aria-label="dynamic table" >
          <TableHead>
            <TableRow sx={{backgroundColor:'primary.main',border: '2px solid #F0C38E'}}>
              {columns.map(({ label, value },index) => (
                <TableCell
                  key={value}
                  sortDirection={orderBy === value ? order : false}
                  sx={{ color: 'background.paper', borderRight: index === columns.length - 1 ? 'none' : '2px solid #312C51',fontWeight:'bold' }}
                >
                  <TableSortLabel
                    active={orderBy === value}
                    direction={orderBy === value ? order : 'asc'}
                    onClick={() => handleRequestSort(value)}
                    sx={{
                      color: orderBy === value ? 'background.default' : 'background.paper',
                      '&.Mui-active': {
                        color: 'background.paper',
                      },
                    }}
                  >
                    {label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ color: 'primary.main' }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow key={rowIndex} sx={{ border: '2px solid #F0C38E' }}>
                  {columns.map(({ value }) => {
                    // Check if the field is 'button' to handle the button specifically
                    if (value === 'button' && row[value]) {
                      // Render a button dynamically based on the "button" property
                      return (
                        <TableCell key={value} sx={{ color: 'background.paper' }}>
                          <Button
                            variant="contained"
                            color="primary"
                            sx={{fontWeight:'bold',color:'background.paper'}}
                            onClick={() =>
                              buttonActionHandler(row[value].function, row[value].parameters)
                            }
                          >
                            {row[value].buttonText}
                          </Button>
                        </TableCell>
                      );
                    }
                    // Render other fields normally
                    return (
                      <TableCell key={value} sx={{ color: 'primary.main', borderRight: '2px solid #F0C38E' }}>
                        {typeof row[value] === 'object' ? JSON.stringify(row[value]) : row[value]}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 15]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ color: 'primary.main' }}
      />
    </Paper>
  );
};

export default CustomTable;

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Typography, Box, TablePagination } from '@mui/material';
import type { ReactNode } from 'react';

export interface Column<T> {
  id: keyof T & string;
  label: string;
  render?: (row: T) => ReactNode;
}

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  pagination?: PaginationProps;
}

export function DataTable<T extends { _id: string }>({ columns, data, isLoading, pagination }: DataTableProps<T>) {
  if (isLoading) {
    return <Box sx={styles.loader}><CircularProgress /></Box>;
  }
  if (!data.length) {
    return <Typography sx={styles.emptyText}>No data available.</Typography>;
  }

  return (
    <Box>
      <TableContainer component={Paper} sx={styles.container}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.id} sx={styles.headCell}>{col.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row._id} hover>
                {columns.map((col) => (
                  <TableCell key={col.id}>
                    {col.render ? col.render(row) : String(row[col.id])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {pagination && (
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page - 1}
          onPageChange={(_, newPage) => pagination.onPageChange(newPage + 1)}
          rowsPerPage={pagination.limit}
          rowsPerPageOptions={[pagination.limit]}
        />
      )}
    </Box>
  );
}

const styles = {
  loader: { display: 'flex', justifyContent: 'center', p: 4 },
  emptyText: { p: 4, textAlign: 'center', color: 'text.secondary' },
  container: { border: 'none', boxShadow: 'none' },
  headCell: { fontWeight: 'bold', color: 'text.primary', borderBottom: '2px solid rgba(0,0,0,0.08)' },
} as const;

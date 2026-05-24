import { usePagination } from '@/lib/use-pagination';
import { Box, Typography, Button } from '@mui/material';
import { DataTable } from '@/components/DataTable';
import type { Column } from '@/components/DataTable';
import { useComplains } from '../api/list';
import { useDeleteComplain } from '../api/delete';
import type { Complain } from '../types';
import type { PopulatedStudent } from '../types';

export function ComplainsPage() {
  const { page, setPage } = usePagination();
  const { data: res, isLoading } = useComplains(page);
  const data = res?.data;
  const meta = res?.meta;
  const deleteMutation = useDeleteComplain();

  const columns: Column<Complain>[] = [
    { id: 'date', label: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
    { id: 'studentId', label: 'Student', render: (row) => typeof row.studentId === 'object' ? (row.studentId as PopulatedStudent)?.name || '-' : row.studentId || '-' },
    { id: 'complaint', label: 'Complaint' },
    { id: '_id', label: 'Actions', render: (row) => <Button color="error" onClick={() => deleteMutation.mutate(row._id)}>Delete</Button> }
  ];

  return (
    <Box>
      <Box sx={styles.header}>
        <Typography variant="h4">Complaints</Typography>
      </Box>
      <DataTable columns={columns} data={data || []} isLoading={isLoading} pagination={meta ? { page: meta.page, total: meta.total, limit: 10, onPageChange: setPage } : undefined} />
    </Box>
  );
}

const styles = { header: { display: 'flex', justifyContent: 'space-between', mb: 4 } } as const;

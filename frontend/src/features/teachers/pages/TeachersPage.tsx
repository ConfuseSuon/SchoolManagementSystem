import { useState } from 'react';
import { usePagination } from '@/lib/use-pagination';
import { Box, Typography, Button } from '@mui/material';
import { DataTable } from '@/components/DataTable';
import type { Column } from '@/components/DataTable';
import { useTeachers } from '../api/list';
import { useDeleteTeacher } from '../api/delete';
import type { Teacher } from '../types';
import { EditTeacherModal } from '../components/EditTeacherModal';
import { CreateTeacherModal } from '../components/CreateTeacherModal';

export function TeachersPage() {
  const { page, setPage } = usePagination();
  const { data: res, isLoading } = useTeachers(page);
  const data = res?.data;
  const meta = res?.meta;
  const deleteMutation = useDeleteTeacher();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editEntity, setEditEntity] = useState<Teacher | null>(null);

  const columns: Column<Teacher>[] = [
    { id: 'name', label: 'Name' },
    { id: 'email', label: 'Email' },
    { id: '_id', label: 'Actions', render: (row) => (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button color="primary" onClick={() => setEditEntity(row)}>Edit</Button>
        <Button color="error" onClick={() => deleteMutation.mutate(row._id)}>Delete</Button>
      </Box>
    ) }
  ];

  return (
    <Box>
      <Box sx={styles.header}>
        <Typography variant="h4">Teachers</Typography>
        <Button variant="contained" onClick={() => setIsModalOpen(true)}>Add Teacher</Button>
      </Box>
      <DataTable columns={columns} data={data || []} isLoading={isLoading} pagination={meta ? { page: meta.page, total: meta.total, limit: 10, onPageChange: setPage } : undefined} />
      <CreateTeacherModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <EditTeacherModal open={!!editEntity} onClose={() => setEditEntity(null)} entity={editEntity} />
    </Box>
  );
}


const styles = { header: { display: 'flex', justifyContent: 'space-between', mb: 4 } } as const;

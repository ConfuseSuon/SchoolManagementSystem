import { useState } from 'react';
import { usePagination } from '@/lib/use-pagination';
import { Box, Typography, Button } from '@mui/material';
import { DataTable } from '@/components/DataTable';
import type { Column } from '@/components/DataTable';
import { useClasses } from '../api/list';
import { useDeleteClass } from '../api/delete';
import type { AcademicClass } from '../types';
import { EditAcademicClassModal } from '../components/EditAcademicClassModal';
import { CreateClassModal } from '../components/CreateClassModal';

export function ClassesPage() {
  const { page, setPage } = usePagination();
  const { data: res, isLoading } = useClasses(page);
  const data = res?.data;
  const meta = res?.meta;
  const deleteMutation = useDeleteClass();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editEntity, setEditEntity] = useState<AcademicClass | null>(null);

  const columns: Column<AcademicClass>[] = [
    { id: 'name', label: 'Class Name' },
    { 
      id: '_id', 
      label: 'Actions', 
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button color="primary" onClick={() => setEditEntity(row)}>Edit</Button>
          <Button color="error" onClick={() => deleteMutation.mutate(row._id)} disabled={deleteMutation.isPending}>
            Delete
          </Button>
        </Box>
      )
    }
  ];

  return (
    <Box>
      <Box sx={styles.header}>
        <Typography variant="h4">Classes</Typography>
        <Button variant="contained" onClick={() => setIsModalOpen(true)}>Add Class</Button>
      </Box>
      <DataTable columns={columns} data={data || []} isLoading={isLoading} pagination={meta ? { page: meta.page, total: meta.total, limit: 10, onPageChange: setPage } : undefined} />
      <CreateClassModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <EditAcademicClassModal open={!!editEntity} onClose={() => setEditEntity(null)} entity={editEntity} />
    </Box>
  );
}

const styles = { header: { display: 'flex', justifyContent: 'space-between', mb: 4 } } as const;
